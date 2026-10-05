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
 * deduction removes a color no neighbor shows (docs/games/hints.md § "The quality bar",
 * rule 6).
 *
 * That is the candidate walk's implicit reading, and it is Map's default. The
 * player may choose the populate reading instead (the `hint-notes`
 * preference), and then the plan opens with the Mark-all press, fill and clean
 * ({@link markAll}), after which every blank region is dotted and the same
 * rungs read the dots. Map plans without `runCandidatePlan` because that walk
 * indexes cells on a grid, and Map's elements are the regions of a graph.
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

import type { CandidateReading } from "../../engine/candidate-hint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { HintFrontier } from "../../engine/hint-frontier.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { type Conclusion, colorsOf, type RegionMark, say } from "./hint-text.ts";
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
type MapEvidence = RegionMark;

/** One region's dots as a setup step leaves them. */
interface RegionDots {
  region: number;
  dots: number;
}

/** What a step acts on and what it wants done, per region. */
export interface MapHint {
  /** The region a deduction acts on; none for a setup step. A list because
   * the frontier and the cross-game guards read every step's `targets`. */
  targets: number[];
  /** The end state: the target's color or exactly its dots, or for a setup
   * step (the Mark-all press) each region's dots. */
  want: SingleWant | { regions: RegionDots[] };
}

/** A deduction's end state for its one target. */
type SingleWant = { color: number } | { dots: number };

/** Every rung a Map step can be: the two halves of the Mark-all press, by
 * `markAll`'s own names, and the solver's three rungs, by theirs. The legs
 * that dot a pair's or a chain's premise share that firing's rung. */
export const MAP_RUNGS = [
  "fill",
  "clean",
  "onlyColorLeft",
  "sharedPair",
  "forcingChain",
] as const;
export type MapRung = (typeof MAP_RUNGS)[number];

export type MapHintStep = HintStep<MapMove, MapHint, MapRung>;

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

// --- the Mark-all press -------------------------------------------------------

/**
 * What the Mark-all press does to a board: `fill` dots all four colors into
 * every blank region with no dots, and once none is left, `clean` removes from
 * each blank region the dots of colors a neighbor shows. Empty when there is
 * nothing to do, which makes the press no move.
 *
 * The fill is additive (`candidate-hint.ts`'s `adaptiveMarkAll` § "The
 * additive rule, stated once"): a region the player has dotted keeps its dots.
 * A clean that would empty a region keeps its lowest dot, as
 * `obviousCandidateMarks` does, so a board contradicting itself does not cycle
 * between the two.
 *
 * The hint's populate setup is this same press, so a player who presses the
 * button while the setup step is shown has done exactly what it asked.
 */
export function markAll(
  state: Pick<MapState, "map" | "coloring" | "pencil">,
): { kind: "fill" | "clean"; regions: RegionDots[] } | null {
  const { coloring, pencil } = state;
  const { graph, n, ngraph } = state.map;
  const fill: RegionDots[] = [];
  for (let r = 0; r < n; r++)
    if (coloring[r] < 0 && pencil[r] === 0) fill.push({ region: r, dots: ALL });
  if (fill.length > 0) return { kind: "fill", regions: fill };
  const clean: RegionDots[] = [];
  for (let r = 0; r < n; r++) {
    if (coloring[r] >= 0) continue;
    let shown = 0;
    for (const k of neighbors(graph, n, ngraph, r))
      if (coloring[k] >= 0) shown |= 1 << coloring[k];
    let struck = pencil[r] & shown;
    if (struck === pencil[r]) struck &= struck - 1;
    if (struck) clean.push({ region: r, dots: pencil[r] & ~struck });
  }
  return clean.length > 0 ? { kind: "clean", regions: clean } : null;
}

/** The move taking each region of `regions` from the dots `pencil` shows to its
 * wanted dots. */
export function regionsMove(
  pencil: ArrayLike<number>,
  regions: readonly RegionDots[],
): MapMove {
  return {
    ops: regions.flatMap(({ region, dots }) => dotOps(region, pencil[region], dots)),
  };
}

/** The move that realizes `want` on region `r` whose dots are `dots`. */
function moveFor(r: number, dots: number, want: SingleWant): MapMove {
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

function wantOf(w: Work, r: number, c: Conclusion): SingleWant {
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
function apply(w: Work, r: number, want: SingleWant): void {
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
  rung: MapRung,
  r: number,
  want: SingleWant,
  words: Sentence,
): MapHintStep {
  const s: MapHintStep = {
    move: moveFor(r, w.pencil[r], want),
    rung,
    explanation: words.text,
    words,
    highlights: { targets: [r], want },
  };
  apply(w, r, want);
  return s;
}

/** Legs ruling `struck` out of each of `targets`, skipping one an earlier leg
 * already settled. */
function narrowLegs(
  w: Work,
  rung: MapRung,
  targets: readonly number[],
  struck: number,
  speak: (k: number, c: Conclusion) => Sentence,
): MapHintStep[] {
  const out: MapHintStep[] = [];
  for (const k of targets) {
    if (w.coloring[k] >= 0 || !(colorsLeft(w, k) & struck)) continue;
    const c = narrowing(w, k, struck);
    const s = step(w, rung, k, wantOf(w, k, c), speak(k, c));
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
    const words =
      dots === 0
        ? say.touchesTheRest(r, color, others)
        : others === 0
          ? say.lastDot(r, color)
          : say.deadDots(r, color);
    out.push({
      reads: [r, ...cited],
      legs: (w) => [step(w, "onlyColorLeft", r, { color }, words)],
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
    legs: (w) => {
      const pair = [{ region: a }, { region: b2 }];
      return journey([
        ...premiseDots(w, "sharedPair", [a, b2], {
          dot: (_i, r, touched, two) => say.pairDot(r, touched, two),
          trim: (_i, r, two) => say.pairTrim(r, two),
        }),
        ...narrowLegs(w, "sharedPair", ks, v, (k, c) => say.pair(k, pair, v, c)),
      ]);
    },
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
      // A chain region being dotted is ringed, and keeps its number.
      return journey([
        ...premiseDots(w, "forcingChain", chain, {
          dot: (i, r, touched, two) => say.chainDot(r, i + 1, numbered, touched, two),
          trim: (i, r, two) => say.chainTrim(r, i + 1, numbered, two),
        }),
        ...narrowLegs(
          w,
          "forcingChain",
          ks,
          1 << color,
          chainSentence(w, numbered, color, other),
        ),
      ]);
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
  chain: readonly MapEvidence[],
  color: number,
  other: number,
): (k: number, c: Conclusion) => Sentence {
  if (chain.every(({ region }) => colorsLeft(w, region) & (1 << color)))
    return (k, c) => say.chainAlternates(k, chain, color, c);
  const forced = [other];
  for (let i = 1; i < chain.length; i++)
    forced.push(colorsOf(colorsLeft(w, chain[i].region) & ~(1 << forced[i - 1]))[0]);
  // The sentence says the walk ends on `color`; it is what `forcingChain` found,
  // so a walk that does not is a board the dots misdescribe.
  if (forced[forced.length - 1] !== color)
    throw new Error(`map hint: chain walk ends on ${forced.at(-1)}, not ${color}`);
  return (k, c) => say.chain(k, chain, color, forced, c);
}

/** How a premise-dotting leg speaks: `i` is the region's place in the
 * premise's list, `r` the region, `touched` its neighbors' colors and `two`
 * what they leave. */
interface DotWords {
  dot(i: number, r: number, touched: number, two: number): Sentence;
  trim(i: number, r: number, two: number): Sentence;
}

/**
 * Before a pair or a chain is stated, each region its premise rests on shows
 * its two colors as dots, one leg per region that does not already. "Can only be
 * yellow or teal" is then on the board rather than a sum the player has to work
 * out from the neighbors and hold while following the deduction (owner
 * playtests, 2026-09-25, a chain first and then a pair). It is the notation a
 * player solving alone would make, and the deduction's step then reads straight
 * off it.
 */
function premiseDots(
  w: Work,
  rung: MapRung,
  regions: readonly number[],
  words: DotWords,
): MapHintStep[] {
  const { graph, n, ngraph } = w.state.map;
  const out: MapHintStep[] = [];
  regions.forEach((r, i) => {
    const two = colorsLeft(w, r);
    if (w.pencil[r] === two) return;
    let touched = 0;
    for (const k of neighbors(graph, n, ngraph, r))
      if (w.coloring[k] >= 0) touched |= 1 << w.coloring[k];
    const said =
      w.pencil[r] === 0 ? words.dot(i, r, touched, two) : words.trim(i, r, two);
    out.push(step(w, rung, r, { dots: two }, said));
  });
  return out;
}

/** One firing's legs as one journey: every leg after the first continues it. */
function journey(legs: MapHintStep[]): MapHintStep[] {
  legs.forEach((s, i) => {
    s.continuesPrevious = i > 0;
  });
  return legs;
}

/**
 * The populate reading's opening: the Mark-all press, fill then clean, as one
 * journey, each half only when the board needs it. After it every blank region
 * shows its colors as dots and the rungs run exactly as they do on a board the
 * player dotted by hand.
 */
function setUp(w: Work, steps: MapHintStep[]): void {
  for (let first = true; ; first = false) {
    const press = markAll({ map: w.state.map, coloring: w.coloring, pencil: w.pencil });
    if (!press) return;
    const clean = press.kind === "clean";
    const words = clean ? say.cleanNeighbors : say.fillAll;
    steps.push({
      move: regionsMove(w.pencil, press.regions),
      rung: press.kind,
      explanation: words.text,
      words,
      // Rings nothing: a clean strikes from nearly every blank region, and a
      // band around each ran together into one mark over the whole board
      // (browser check, 2026-09-25). The sentence names every blank region.
      highlights: { targets: [], want: { regions: press.regions } },
      continuesPrevious: !first,
    });
    for (const { region, dots } of press.regions) w.pencil[region] = dots;
    if (clean) return;
  }
}

/** The whole remaining plan from `state`'s board: empty when deduction has run
 * out, which the caller refuses. */
export function buildSteps(state: MapState, reading: CandidateReading): MapHintStep[] {
  const w: Work = {
    state,
    coloring: Int32Array.from(state.coloring),
    pencil: Int32Array.from(state.pencil),
  };
  const steps: MapHintStep[] = [];
  if (reading === "populate") setUp(w, steps);
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

/** The dots a step wants, per region, or `null` for a placement. */
function wantedDots(hl: MapHint): readonly RegionDots[] | null {
  const { want } = hl;
  if ("color" in want) return null;
  return "regions" in want
    ? want.regions
    : [{ region: hl.targets[0], dots: want.dots }];
}

/** Classify a player move against the displayed step, on the board it is about
 * to change. */
export function hintKeepTrack(
  m: MapMove,
  step: MapHintStep,
  state: MapState,
): HintTrackVerdict {
  const hl = step.highlights as MapHint;
  const wanted = wantedDots(hl);
  if (!wanted) {
    const r = hl.targets[0];
    const { color } = hl.want as { color: number };
    return m.ops.length === 1 &&
      m.ops[0].op === "color" &&
      m.ops[0].region === r &&
      m.ops[0].color === color
      ? "completed"
      : "off";
  }
  // Dots: every toggle must move its region toward the wanted set.
  const goal = new Map(wanted.map(({ region, dots }) => [region, dots]));
  const now = new Map(wanted.map(({ region }) => [region, state.pencil[region]]));
  for (const op of m.ops) {
    const want = goal.get(op.region);
    const dots = now.get(op.region);
    if (op.op !== "pencil" || want === undefined || dots === undefined) return "off";
    if (!((dots ^ want) & (1 << op.bit))) return "off";
    now.set(op.region, dots ^ (1 << op.bit));
  }
  for (const [region, want] of goal)
    if (state.coloring[region] < 0 && now.get(region) !== want) return "onTrack";
  return "completed";
}

/** Rebuild a stored step's move against the board it is about to be shown on,
 * or drop it once the board already shows what it wants. A step the board has
 * not moved under comes back as itself. */
export function refreshHintStep(
  step: MapHintStep,
  state: MapState,
): MapHintStep | null {
  const hl = step.highlights as MapHint;
  const wanted = wantedDots(hl);
  if (!wanted) return state.coloring[hl.targets[0]] >= 0 ? null : step;
  const left = wanted.filter(
    ({ region, dots }) => state.coloring[region] < 0 && state.pencil[region] !== dots,
  );
  if (left.length === 0) return null;
  const move = regionsMove(state.pencil, left);
  if (sameOps(move.ops, step.move.ops)) return step;
  if (!("regions" in hl.want)) return { ...step, move };
  return { ...step, move, highlights: { ...hl, want: { regions: left } } };
}

export function sameOps(a: readonly MapOp[], b: readonly MapOp[]): boolean {
  return (
    a.length === b.length &&
    a.every((op, i) => JSON.stringify(op) === JSON.stringify(b[i]))
  );
}
