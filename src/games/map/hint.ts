/**
 * Map's explained hint: its solver's three rungs, read off the player's own
 * board.
 *
 * ## What a region can still be
 *
 * A blank region's colors are its dots when it has any, and all four when it
 * has none, less every color a neighbor already shows. That is the player's
 * reading of the board, not a notation laid on top of it: Map's dots mark what
 * a region *might* be (its help page), a region with none is simply unmarked,
 * and a neighbor's color is on the board for anyone to see. So the Easy rung
 * needs no dots at all, and the hint places them only where a Normal or Hard
 * deduction removes a color no neighbor shows (AGENTS.md § "Hint quality bar",
 * rule 6).
 *
 * That is why Map does not walk `runCandidatePlan`. That walk's notes are the
 * whole candidate set, filled in by a populate step and cleaned against the
 * board, where Map's candidates are partly the board itself. Penciling every
 * color into thirty regions to strike three of them from each would teach a
 * procedure no Map player follows.
 *
 * ## Why reading the dots is sound
 *
 * `findMistakes` flags a wrong color and a region whose dots leave out its
 * answer, and the hint refuses on either. So wherever this runs, every color on
 * the board is right and every dotted region's dots hold its answer: the
 * colors computed here contain the truth, and each rung is sound on any such
 * superset (docs/games/hints.md § "Deduce from the notes when the mistake check
 * vouches for them").
 *
 * ## The ladder is the tiers
 *
 * A plan offers the lowest rung that fires anywhere, and chooses within it by
 * the frontier. Map's tiers are exactly its rungs, so an Easy board's plan
 * never shows a pair and a Normal board's never shows a chain: continuing from
 * the last step is worth something, but not a harder technique than the board
 * needs.
 */

import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { HintFrontier } from "../../engine/hint-frontier.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { type Conclusion, colorsOf, say } from "./hint-text.ts";
import {
  bitcount,
  chainTo,
  forcingChain,
  type MapBoard,
  neighbors,
  newChainScratch,
  onlyColorLeft,
  sharedPair,
} from "./solver.ts";
import type { MapMove, MapOp, MapState } from "./state.ts";

const ALL = 0xf;

/** A region the premise rests on, outlined; a chain's carry their position. */
export interface MapEvidence {
  region: number;
  order?: number;
}

/** What a step marks and what it wants done, per region. */
export interface MapHint {
  /** The one region the step acts on, ringed. A list because the frontier and
   * the cross-game guards read every step's `targets`. */
  targets: number[];
  evidence: MapEvidence[];
  /** The region's end state: this color, or exactly these dots. */
  want: { color: number } | { dots: number };
}

export type MapHintStep = HintStep<MapMove, MapHint>;

/** The working board: the player's colors and dots, advanced as the plan is
 * built. */
interface Work {
  readonly state: MapState;
  readonly coloring: Int32Array;
  readonly pencil: Int32Array;
}

/** The colors region `r` of `w` can still take (see the file comment). */
function colorsLeft(w: Work, r: number): number {
  const { graph, n, ngraph } = w.state.map;
  let p = w.pencil[r] || ALL;
  for (const k of neighbors(graph, n, ngraph, r))
    if (w.coloring[k] >= 0) p &= ~(1 << w.coloring[k]);
  return p;
}

/** The board as the solver's rungs read it. */
function boardOf(w: Work): MapBoard {
  const { graph, n, ngraph } = w.state.map;
  const possible = new Uint8Array(n);
  for (let r = 0; r < n; r++)
    possible[r] = w.coloring[r] >= 0 ? 1 << w.coloring[r] : colorsLeft(w, r);
  return { graph, n, ngraph, coloring: w.coloring, possible };
}

/** The ops taking region `r` from dots `from` to dots `to`, one toggle each. */
function dotOps(r: number, from: number, to: number): MapOp[] {
  return colorsOf(from ^ to).map((bit) => ({ op: "pencil", region: r, bit }));
}

/** The move that realizes `want` on region `r` whose dots are `dots`. */
function moveFor(r: number, dots: number, want: MapHint["want"]): MapMove {
  return "color" in want
    ? { ops: [{ op: "color", region: r, color: want.color }] }
    : { ops: dotOps(r, dots, want.dots) };
}

/** Rule `struck` out of region `r`, as whichever move the board calls for. */
function narrowing(w: Work, r: number, struck: number): Conclusion {
  const left = colorsLeft(w, r) & ~struck;
  if (bitcount(left) === 1) return { kind: "place", color: colorsOf(left)[0] };
  if (w.pencil[r]) return { kind: "strike", struck: w.pencil[r] & struck };
  return { kind: "mark", left };
}

function wantOf(w: Work, r: number, c: Conclusion): MapHint["want"] {
  switch (c.kind) {
    case "place":
      return { color: c.color };
    case "strike":
      return { dots: w.pencil[r] & ~c.struck };
    case "mark":
      return { dots: c.left };
  }
}

/** Play `want` on the working board. */
function apply(w: Work, r: number, want: MapHint["want"]): void {
  if ("color" in want) {
    w.coloring[r] = want.color;
    w.pencil[r] = 0;
  } else w.pencil[r] = want.dots;
}

/** One firing: the regions its premise reads, and the steps it takes, built
 * against the working board as it stands when taken, leg by leg, so a later
 * leg sees what an earlier one decided. */
interface Firing {
  reads: number[];
  legs(w: Work): MapHintStep[];
}

function step(
  w: Work,
  r: number,
  want: MapHint["want"],
  explanation: string,
  evidence: MapEvidence[],
): MapHintStep {
  const s: MapHintStep = {
    move: moveFor(r, w.pencil[r], want),
    explanation,
    highlights: { targets: [r], evidence, want },
  };
  apply(w, r, want);
  return s;
}

/** Legs ruling `struck` out of each of `targets`, skipping one an earlier leg
 * already settled. */
function narrowLegs(
  w: Work,
  targets: readonly number[],
  struck: number,
  speak: (c: Conclusion) => string,
  evidence: MapEvidence[],
): MapHintStep[] {
  const out: MapHintStep[] = [];
  for (const k of targets) {
    if (w.coloring[k] >= 0 || !(colorsLeft(w, k) & struck)) continue;
    const c = narrowing(w, k, struck);
    const s = step(w, k, wantOf(w, k, c), speak(c), evidence);
    if (out.length > 0) s.continuesPrevious = true;
    out.push(s);
  }
  return out;
}

// --- the rungs --------------------------------------------------------------

function singles(w: Work, b: MapBoard): Firing[] {
  const { graph, n, ngraph } = w.state.map;
  const out: Firing[] = [];
  onlyColorLeft(b, (r, color) => {
    const dots = w.pencil[r];
    const base = dots || ALL;
    // The neighbors whose colors took something from what the region started
    // with: all of its colored neighbors when it has no dots, and only the
    // ones matching a dot when it has. The premise, and what the frontier
    // continues from, but not outlined: their fills are the evidence, and
    // outlines around a small region's neighbors swamp the region itself
    // (owner playtest, 2026-09-25).
    const cited: number[] = [];
    let others = 0;
    for (const k of neighbors(graph, n, ngraph, r)) {
      const c = w.coloring[k];
      if (c >= 0 && base & (1 << c)) {
        cited.push(k);
        others |= 1 << c;
      }
    }
    const explanation =
      dots === 0
        ? say.touchesTheRest(color, others)
        : others === 0
          ? say.lastDot(color)
          : say.deadDots(color);
    out.push({
      reads: [r, ...cited],
      legs: (w) => [step(w, r, { color }, explanation, [])],
    });
  });
  return out;
}

function pairs(b: MapBoard): Firing[] {
  const found = new Map<string, { a: number; b: number; v: number; ks: number[] }>();
  sharedPair(b, (a, b2, v, k) => {
    const key = `${a},${b2}`;
    const f = found.get(key);
    if (f) f.ks.push(k);
    else found.set(key, { a, b: b2, v, ks: [k] });
  });
  return [...found.values()].map(({ a, b: b2, v, ks }) => ({
    reads: [a, b2, ...ks],
    legs: (w) =>
      narrowLegs(w, ks, v, (c) => say.pair(v, c), [{ region: a }, { region: b2 }]),
  }));
}

function chains(b: MapBoard): Firing[] {
  const sc = newChainScratch(b.n);
  const found = new Map<
    string,
    { chain: number[]; color: number; other: number; ks: number[] }
  >();
  forcingChain(b, sc, (origin, color, end, k) => {
    const key = `${origin},${color},${end}`;
    const f = found.get(key);
    if (f) {
      if (!f.chain.includes(k)) f.ks.push(k);
      return;
    }
    const chain = chainTo(sc, end);
    // Two regions forcing each other is the pair rule, which the rung below
    // this one has already had every chance to state more simply; and a target
    // inside its own chain would be both "this region" and a numbered one.
    if (chain.length < 3 || chain.includes(k)) return;
    const other = colorsOf(b.possible[origin] & ~(1 << color))[0];
    found.set(key, { chain, color, other, ks: [k] });
  });
  return [...found.values()].map(({ chain, color, other, ks }) => ({
    reads: [...chain, ...ks],
    legs: (w) => {
      const numbered = chain.map((region, i) => ({ region, order: i + 1 }));
      const legs = [
        ...chainDots(w, chain, numbered),
        ...narrowLegs(
          w,
          ks,
          1 << color,
          chainSentence(w, chain, color, other),
          numbered,
        ),
      ];
      legs.forEach((s, i) => {
        s.continuesPrevious = i > 0;
      });
      return legs;
    },
  }));
}

/**
 * The chain step's sentence, read off the board as it stands once every
 * numbered region shows its two dots: the pattern when every region has a dot
 * of `color`, and otherwise the walk, each region taking the dot the one before
 * it leaves. Read once, before any of the firing's narrowing legs, since a leg
 * placing a color beside the chain would change what its regions show.
 */
function chainSentence(
  w: Work,
  chain: readonly number[],
  color: number,
  other: number,
): (c: Conclusion) => string {
  if (chain.every((r) => colorsLeft(w, r) & (1 << color)))
    return (c) => say.chainAlternates(color, chain.length, c);
  const forced = [other];
  for (let i = 1; i < chain.length; i++)
    forced.push(colorsOf(colorsLeft(w, chain[i]) & ~(1 << forced[i - 1]))[0]);
  // The sentence says the walk ends on `color`; it is what `forcingChain` found,
  // so a walk that does not is a board the dots misdescribe.
  if (forced[forced.length - 1] !== color)
    throw new Error(`map hint: chain walk ends on ${forced.at(-1)}, not ${color}`);
  return (c) => say.chain(color, forced, c);
}

/**
 * Before a chain is followed, each of its regions shows its two colors as dots,
 * one leg per region that does not already: "each numbered region has two
 * colors left" is then on the board rather than four sums the player has to
 * hold while following the chain (owner playtest, 2026-09-25). It is the
 * notation a player solving alone would make, and the chain step then reads
 * straight off it.
 */
function chainDots(
  w: Work,
  chain: readonly number[],
  numbered: MapEvidence[],
): MapHintStep[] {
  const { graph, n, ngraph } = w.state.map;
  const out: MapHintStep[] = [];
  chain.forEach((r, i) => {
    const two = colorsLeft(w, r);
    if (w.pencil[r] === two) return;
    let touched = 0;
    for (const k of neighbors(graph, n, ngraph, r))
      if (w.coloring[k] >= 0) touched |= 1 << w.coloring[k];
    const explanation =
      w.pencil[r] === 0 ? say.chainDot(i + 1, touched, two) : say.chainTrim(i + 1, two);
    out.push(step(w, r, { dots: two }, explanation, numbered));
  });
  return out;
}

/** The whole remaining plan from `state`'s board: empty when deduction has run
 * out, which the caller refuses. */
export function buildSteps(state: MapState): MapHintStep[] {
  const w: Work = {
    state,
    coloring: Int32Array.from(state.coloring),
    pencil: Int32Array.from(state.pencil),
  };
  const steps: MapHintStep[] = [];
  const frontier = new HintFrontier<number>((r) => r);
  const budget = stepBudget("map hint plan");
  for (;;) {
    budget.tick();
    if (!w.coloring.includes(-1)) return steps;
    const b = boardOf(w);
    let rung = singles(w, b);
    if (rung.length === 0) rung = pairs(b);
    if (rung.length === 0) rung = chains(b);
    const offered = rung.map((f) => ({
      reads: () => f.reads,
      take: () => {
        for (const s of f.legs(w)) steps.push(s);
      },
    }));
    if (!frontier.take([offered], steps)) return steps;
  }
}

/** The region a step acts on. */
const regionOf = (step: HintStep<MapMove>): number =>
  (step.highlights as MapHint).targets[0];

/** Classify a player move against the displayed step, on the board it is about
 * to change. */
export function hintKeepTrack(
  m: MapMove,
  step: HintStep<MapMove>,
  state: MapState,
): HintTrackVerdict {
  const r = regionOf(step);
  const { want } = step.highlights as MapHint;
  if ("color" in want)
    return m.ops.length === 1 &&
      m.ops[0].op === "color" &&
      m.ops[0].region === r &&
      m.ops[0].color === want.color
      ? "completed"
      : "off";
  // Dots: every toggle must move the region toward the wanted set.
  let dots = state.pencil[r];
  const needed = dots ^ want.dots;
  for (const op of m.ops) {
    if (op.op !== "pencil" || op.region !== r || !(needed & (1 << op.bit)))
      return "off";
    dots ^= 1 << op.bit;
  }
  return dots === want.dots ? "completed" : "onTrack";
}

/** Rebuild a stored step's move against the board it is about to be shown on,
 * or drop it once the board already shows what it wants. */
export function refreshHintStep(
  step: HintStep<MapMove>,
  state: MapState,
): HintStep<MapMove> | null {
  const r = regionOf(step);
  const { want } = step.highlights as MapHint;
  if (state.coloring[r] >= 0) return null;
  if ("color" in want) return step;
  if (state.pencil[r] === want.dots) return null;
  return { ...step, move: moveFor(r, state.pencil[r], want) };
}
