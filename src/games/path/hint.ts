/**
 * Path's explained hint: the compiled ladder walked one firing at a time from
 * the player's own lines and crosses (`pathWalk`), and each firing turned
 * into a step (docs/hints.md § "Recording the deduction"). The sentences are
 * [`path.description.yaml`](./path.description.yaml)'s; this file supplies the
 * terms they cannot know.
 *
 * Every fact a step rests on is a number, a line or a cross on the board: the
 * ladder reads nothing else. The lines a Check tries are drawn thin where its
 * words outline them, and never played.
 *
 * A Check's firing says which lines it tried; what they break, which its
 * words name (a loop, two numbers, a square left short), is the witness's
 * for `lineBreaks` and `pairBreaks` (`brokeOf`, solver.ts) and, for `weighed`, read here off
 * the board with those lines drawn ({@link clashOf}), in the order a player
 * looks: what the lines join first, then the squares round them.
 * `path-hint.test.ts` holds every Check a walk takes to finding one.
 */

import {
  describedEdgeHint,
  type Fired as FiredOf,
} from "../../engine/described-edge-hint.ts";
import { EDGE, type ShapedEdge, trackEdgeStep } from "../../engine/edge-hint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import type { MarkKind } from "../../engine/hint-words.ts";
import { CROSS, LINE, OPEN } from "../../engine/line-drawing.ts";
import {
  across,
  pieceThrough,
  type SquareEdges,
  squareEdges,
} from "../../engine/square-edges.ts";
import type { Point } from "../../engine/types.ts";
import { STATED } from "../../generated/games/path/path.compiled.ts";
import {
  type Broke,
  type PathFiring,
  type PathRung,
  type PathSays,
  type PathWalkContext,
  pathWalk,
} from "./solver.ts";
import {
  DIFF_TRICKY,
  executeMove,
  MODE_PATH,
  NO_END,
  type PathMove,
  type PathPuzzle,
  type PathState,
} from "./state.ts";

/** The edges a step tries lines on, as the board draws them. */
export interface PathHighlights {
  tried: readonly ShapedEdge[];
}

// --- what tried lines break --------------------------------------------------

/** What lines tried on the board break at once, before it is put in words:
 * a square crowded or left short, or a line that closes a loop or joins two
 * numbers that may not meet. */
type TrialClash =
  | { kind: "crowded" | "stuck"; cell: number }
  | { kind: "closed" | "joined"; edge: number };

/** The board `edges` as a player reads it: its pieces of line, and which
 * edges may still take one. */
class Reading {
  readonly g: SquareEdges;
  constructor(
    readonly puzzle: PathPuzzle,
    readonly edges: Uint8Array,
  ) {
    this.g = squareEdges(puzzle.w, puzzle.h);
  }

  lines(i: number): number {
    let n = 0;
    for (let k = 0; k < 4; k++) {
      const e = this.g.around[i * 4 + k];
      if (e >= 0 && this.edges[e] === LINE) n++;
    }
    return n;
  }

  spare(i: number): boolean {
    return this.lines(i) < this.puzzle.takes[i];
  }

  piece(i: number): number[] {
    return pieceThrough(this.g, (e) => this.edges[e] === LINE, i);
  }

  /** The number nearest square `i` along its piece, where `i` is one of its
   * ends, or {@link NO_END}: the line walked from `i` to its first number. */
  near(i: number): number {
    let at = i;
    let from = -1;
    for (;;) {
      if (this.puzzle.ends[at] !== NO_END) return this.puzzle.ends[at];
      let next = -1;
      for (let k = 0; k < 4 && next < 0; k++) {
        const e = this.g.around[at * 4 + k];
        if (e < 0 || this.edges[e] !== LINE) continue;
        const j = across(this.g, e, at);
        if (j !== from) next = j;
      }
      if (next < 0 || next === i) return NO_END;
      from = at;
      at = next;
    }
  }

  /** Whether numbers `p` and `q` may be joined, either being {@link NO_END}. */
  fits(p: number, q: number): boolean {
    if (p === NO_END || q === NO_END) return true;
    return this.puzzle.mode === MODE_PATH ? Math.abs(p - q) === 1 : p === q;
  }

  /** Whether a line could still go on edge `e`, as the ladder's `live`. */
  live(e: number): boolean {
    const [i, j] = [this.g.a[e], this.g.b[e]];
    if (this.edges[e] !== OPEN || !this.spare(i) || !this.spare(j)) return false;
    if (this.piece(i).includes(j)) return this.puzzle.mode !== MODE_PATH;
    return this.fits(this.near(i), this.near(j));
  }

  liveAt(i: number): number[] {
    const out: number[] = [];
    for (let k = 0; k < 4; k++) {
      const e = this.g.around[i * 4 + k];
      if (e >= 0 && this.live(e)) out.push(e);
    }
    return out;
  }
}

/**
 * What lines on `tried` would break on `edges` at once, or `null`. A loop
 * or a join first, line by line, as each is laid: it is on the board as
 * drawn, where a square short of ways is a count the player makes. Then the
 * squares the lines can reach, in reading order: their own, the two ends of
 * the piece they make, and those beside any of them.
 */
function clashOf(
  puzzle: PathPuzzle,
  edges: Uint8Array,
  tried: readonly number[],
): TrialClash | null {
  const trial = new Reading(puzzle, edges.slice());
  const { g } = trial;
  for (const e of tried) {
    const [u, v] = [g.a[e], g.b[e]];
    if (trial.piece(u).includes(v)) return { kind: "closed", edge: e };
    if (!trial.fits(trial.near(u), trial.near(v))) return { kind: "joined", edge: e };
    trial.edges[e] = LINE;
  }
  const near = new Set<number>();
  for (const e of tried) {
    const piece = trial.piece(g.a[e]);
    const ends = piece.filter((i) => trial.lines(i) < 2 || piece.length === 1);
    for (const i of [g.a[e], g.b[e], ...ends]) {
      near.add(i);
      for (let k = 0; k < 4; k++) {
        const f = g.around[i * 4 + k];
        if (f >= 0) near.add(across(g, f, i));
      }
    }
  }
  for (const i of [...near].sort((x, y) => x - y)) {
    const lines = trial.lines(i);
    const need = puzzle.takes[i];
    if (lines > need) return { kind: "crowded", cell: i };
    if (lines < need && lines + trial.liveAt(i).length < need)
      return { kind: "stuck", cell: i };
  }
  return null;
}

// --- the terms ---------------------------------------------------------------

/** What lines tried would break, in the terms the description's sentences
 * read: squares are indices, and a number is the one on its square. */
type Clash =
  /** The square would have more lines than it takes. */
  | { kind: "crowded"; cell: number; lines: number }
  /** The square would have too few edges left for its lines: `ways` is its
   * lines and its open edges together. */
  | { kind: "stuck"; cell: number; ways: number }
  /** The lines would make a loop of `cells`. */
  | { kind: "closed"; cells: readonly number[] }
  /** The lines would join the numbers on `a` and `b`, which may not meet. */
  | { kind: "joined"; a: number; b: number };

/** The kinds of break a weighed step's ruled-out ways make, in the order of
 * the bits of the description's `why`. */
const WHYS = ["closed", "crowded", "cut-off", "dead-end", "joined"] as const;

/** A ruled-out way's clash as a weighed step says it, without the squares
 * it outlines: a step weighs several ways, too many to outline each break. */
function whyOf(clash: Clash): (typeof WHYS)[number] {
  if (clash.kind !== "stuck") return clash.kind;
  return clash.ways > 0 ? "dead-end" : "cut-off";
}

/** A clash in the terms its words need, read off the board with the lines
 * on `tried` drawn. */
function clashRead(
  state: PathState,
  edges: Uint8Array,
  tried: readonly number[],
  clash: TrialClash,
): Clash {
  const trial = new Reading(state, edges.slice());
  const { g } = trial;
  for (const e of tried) trial.edges[e] = LINE;
  switch (clash.kind) {
    case "crowded":
      return { kind: "crowded", cell: clash.cell, lines: trial.lines(clash.cell) };
    case "stuck": {
      const ways = trial.lines(clash.cell) + trial.liveAt(clash.cell).length;
      return { kind: "stuck", cell: clash.cell, ways };
    }
    case "closed":
      return { kind: "closed", cells: trial.piece(g.a[clash.edge]) };
    case "joined": {
      // The two sides of the joining edge, each before it was laid: the
      // numbered square nearest each end of it.
      trial.edges[clash.edge] = CROSS;
      const numberOn = (i: number): number => {
        const n = trial.near(i);
        return trial.piece(i).find((j) => state.ends[j] === n) ?? i;
      };
      const [a, b] = [numberOn(g.a[clash.edge]), numberOn(g.b[clash.edge])];
      // "The 3 to the 7": a Path line runs up its numbers, so the lower first.
      const swap =
        state.mode === MODE_PATH && (state.ends[a] ?? 0) > (state.ends[b] ?? 0);
      return { kind: "joined", a: swap ? b : a, b: swap ? a : b };
    }
  }
}

/** A square's number and whether it has one, as the sentences' terms. */
function numberOf(state: PathState, cell: number): { hasNum: boolean; num: number } {
  const n = state.ends[cell];
  return { hasNum: n !== NO_END, num: n === NO_END ? 0 : n };
}

/** The terms a clash fills in: the placeholders of the description's
 * `lineBreaks` and `pairBreaks`. */
function clashTerms(state: PathState, clash: Clash): Record<string, unknown> {
  switch (clash.kind) {
    case "crowded":
      return {
        crowd: true,
        sq: clash.cell,
        held: clash.lines,
        ...numberOf(state, clash.cell),
      };
    case "stuck":
      return {
        short: true,
        dead: clash.ways > 0,
        sq: clash.cell,
        ...numberOf(state, clash.cell),
      };
    case "closed":
      return { loops: true, circuit: clash.cells };
    case "joined":
      return {
        twoNums: [clash.a, clash.b],
        n1: state.ends[clash.a],
        n2: state.ends[clash.b],
      };
  }
}

/** The terms one firing supplies on `state`, with `edges` as the ladder had
 * them when it fired: whether it sets several edges, and what its reason holds
 * that the technique's binding does not. */
function termsOf({ firing, before }: Fired, state: PathState): Record<string, unknown> {
  const { reason } = firing;
  const multi = firing.edges.length > 1;
  // What broke is the technique's witness; the board says only how it looks.
  // The last line tried is the one that closes a loop or joins two numbers.
  const witnessed = (tried: readonly number[], broke: Broke): Clash =>
    clashRead(
      state,
      before,
      tried,
      typeof broke === "object"
        ? { kind: "stuck", cell: broke.stuck }
        : { kind: broke, edge: tried[tried.length - 1] },
    );
  switch (reason.kind) {
    case "forced":
      return { multi, ...numberOf(state, reason.cell) };
    case "lineBreaks":
      return clashTerms(state, witnessed(reason.tried, reason.broke));
    case "pairBreaks":
      return {
        tried: reason.tried,
        ...clashTerms(state, witnessed(reason.tried, reason.broke)),
      };
    case "weighed": {
      let why = 0;
      for (const tried of reason.ruledOut) {
        const found = clashOf(state, before, tried);
        if (found === null) throw new Error(`path: lines on ${tried} break nothing`);
        why |= 1 << WHYS.indexOf(whyOf(clashRead(state, before, tried, found)));
      }
      return {
        multi,
        why,
        // The pairs ruled out are every pair of the square's other three edges.
        tried: [...new Set(reason.ruledOut.flat())],
        ...numberOf(state, reason.cell),
      };
    }
  }
}

/** The edges a firing tries lines on, which its step draws thin as lines
 * where its words outline them. */
function triedOf(firing: PathFiring): number[] {
  const { reason } = firing;
  switch (reason.kind) {
    case "forced":
      return [];
    case "lineBreaks":
    case "pairBreaks":
      return reason.tried;
    case "weighed":
      return reason.ruledOut.flat();
  }
}

/** What a firing's sentence is told besides the technique's terms: the firing
 * as the game reads it, and the edges as they stood when it fired. */
interface Fired {
  firing: PathFiring;
  before: Uint8Array;
}

/** A firing's step: the lines or crosses it makes, and the lines it tries. */
function stepOf(
  fired: FiredOf<PathSays[keyof PathSays], PathWalkContext>,
): { move: PathMove; highlights: PathHighlights; marked: Fired }[] {
  const firing = fired.ctx.firing(fired.taken);
  // Every edge a firing sets was open before it.
  const before = fired.ctx.edges();
  for (const e of firing.edges) before[e] = OPEN;
  return [
    {
      move: {
        kind: "edges",
        changes: firing.edges.map((edge) => ({ edge, mark: firing.mark })),
      },
      highlights: {
        tried: [...new Set(triedOf(firing))].map((edge) => ({ edge, mark: LINE })),
      },
      marked: { firing, before },
    },
  ];
}

/** What a stated clause draws besides squares: the edges a Check tries. */
type Element = Point | number;
const TRIED = EDGE as unknown as MarkKind<Element>;

/** The plan from the player's lines and crosses. */
export const pathHint = describedEdgeHint<
  PathState,
  PathMove,
  PathHighlights,
  Fired,
  PathWalkContext,
  PathSays,
  PathRung,
  number,
  Element
>({
  name: "path hint",
  walk: (state) => pathWalk(state),
  // The whole ladder, from the Easy rung up.
  tiers: { lowest: () => DIFF_TRICKY, count: DIFF_TRICKY + 1 },
  done: (_marks, ctx) => ctx.complete(),
  reads: (taken, ctx) => ctx.reads(taken),
  writes: (taken, ctx) => ctx.writes(taken),
  step: (fired) => stepOf(fired),
  stated: STATED,
  ringKind: EDGE,
  ring: ({ firing }) => firing.edges,
  width: (state) => state.w,
  termKinds: { tried: TRIED },
  termAt: { tried: (edge) => edge },
  terms: termsOf,
});

/** Judge a move against the step on show by what it did to the edges, which
 * a solve never makes a step of. */
export function pathKeepTrack(
  move: PathMove,
  step: HintStep<PathMove>,
  state: PathState,
): HintTrackVerdict {
  if (move.kind !== "edges" || step.move.kind !== "edges") return "off";
  return trackEdgeStep(
    step,
    step.move.changes,
    state.edges,
    executeMove(state, move).edges,
    (changes): PathMove => ({ kind: "edges", changes }),
  );
}
