/**
 * Path's deductions: one ladder, run two ways.
 *
 * {@link solvePath} runs it to a fixpoint, which is how the generator grades a
 * board and how Solve and the mistake check find the answer.
 * {@link pathRecordingPass} runs the same rungs one firing at a time, and the
 * hint narrates each (docs/solver-and-generator.md § "One engine, two
 * projections").
 *
 * Every rung decides an edge only where the rules force it, so a board the
 * ladder finishes has exactly one answer. Each rung stays true as more of the
 * board is decided, so the order they fire in cannot change where the ladder
 * ends (docs/solver-and-generator.md § "A fixpoint is order-independent only
 * if every rule is monotone").
 *
 * Two rungs that read a region of the board, a cut that would shut squares
 * off from the numbers they need and the numbers whose paths can reach each
 * square, were tried and fired on no dealt board at either tier: the Easy
 * rungs and the lookahead between them decide everything those would have.
 * There is no rung against closing a loop either. The generator lays no path
 * that touches itself, so no piece of a dealt board's answer has its two ends
 * side by side, and inside a supposition a loop is a clash.
 */

import {
  type DeductionTechnique,
  type FiringTally,
  runDeductionFixpoint,
  type SingleFirings,
  singleFirings,
} from "../../engine/deduction-fixpoint.ts";
import type { DifficultyVerdict } from "../../engine/difficulty.ts";
import { Dsf } from "../../engine/dsf.ts";
import type { StepBudget } from "../../engine/step-budget.ts";
import {
  CROSS,
  DIFF_EASY,
  DIFF_NORMAL,
  degreeOf,
  type EdgeMark,
  type Geometry,
  geometry,
  LINE,
  NO_END,
  OPEN,
} from "./state.ts";

/** What breaks a board: a square with more lines than it takes, or too few
 * ways left for the lines it takes; or lines that close a loop, or that join
 * two different numbers, at `edge`. */
export type PathClash =
  | { kind: "crowded" | "stuck"; cell: number }
  | { kind: "closed" | "joined"; edge: number };

/** Why a firing decides its edges. */
export type PathReason =
  /** The square has only as many live edges as it still needs lines. */
  | { kind: "forced"; cell: number; need: number }
  /** A line on the edge would join two different numbers, `ends`, one at
   * the far end of the path on each side. */
  | { kind: "pair"; ends: [number, number] }
  /** Supposing `supposed` on `edge` leads, by the Easy rungs' `chain`, to
   * `clash`. */
  | {
      kind: "lookahead";
      edge: number;
      supposed: typeof LINE | typeof CROSS;
      chain: PathFiring[];
      clash: PathClash;
    };

/** One deduction: `edges` all take `mark`. */
export interface PathFiring {
  reason: PathReason;
  edges: number[];
  mark: typeof LINE | typeof CROSS;
}

/** The rungs, easiest first, by the `kind` of the reason a firing carries. */
export const PATH_RUNGS = [
  "forced",
  "pair",
  "lookahead",
] as const satisfies readonly PathReason["kind"][];
export type PathRung = (typeof PATH_RUNGS)[number];

/** The longest chain of Easy firings a supposition may take to break the
 * board. It keeps the lookahead a walk a player can follow a firing at a
 * time, rather than a search, and so is load-bearing for Normal's name
 * (docs/solver-and-generator.md § "Check, Tactic, Search"). */
const CHAIN_LIMIT = 6;

/** The board the ladder works on: the numbers, and the edges it writes as it
 * goes. */
export class PathBoard {
  readonly g: Geometry;

  constructor(
    readonly w: number,
    readonly h: number,
    readonly ends: Uint8Array,
    readonly edges: Uint8Array,
  ) {
    this.g = geometry(w, h);
  }

  /** The edges around square `i` that hold `mark`. */
  edgesAt(i: number, mark: EdgeMark): number[] {
    const out: number[] = [];
    for (let k = 0; k < 4; k++) {
      const e = this.g.around[i * 4 + k];
      if (e >= 0 && this.edges[e] === mark) out.push(e);
    }
    return out;
  }

  /** Whether square `i` takes another line. */
  spare(i: number): boolean {
    return this.edgesAt(i, LINE).length < degreeOf(this.ends, i);
  }

  /** Whether a line could still go on edge `e`: it is neither line nor cross,
   * both its squares take another line, and it does not run straight between
   * two different numbers. Either of the last two a player sees at a glance,
   * so such an edge is as good as crossed out and no rung asks for its
   * cross. */
  live(e: number): boolean {
    const [i, j] = [this.g.a[e], this.g.b[e]];
    const [p, q] = [this.ends[i], this.ends[j]];
    if (p !== NO_END && q !== NO_END && p !== q) return false;
    return this.edges[e] === OPEN && this.spare(i) && this.spare(j);
  }

  /** The {@link live} edges around square `i`. */
  liveAt(i: number): number[] {
    return this.edgesAt(i, OPEN).filter((e) => this.live(e));
  }

  /** Whether some square still lacks a line it takes. */
  unfinished(): boolean {
    for (let i = 0; i < this.g.cells; i++)
      if (this.edgesAt(i, LINE).length < degreeOf(this.ends, i)) return true;
    return false;
  }
}

/** The pieces of path the lines make, and the number each piece reaches. */
class Pieces {
  readonly dsf: Dsf;
  /** At each piece's root, a number on one of its squares, or
   * {@link NO_END}. */
  private readonly number: Int32Array;
  /** The first line that closes a loop or joins two numbers, or `null`. */
  readonly clash: PathClash | null = null;

  constructor(b: PathBoard) {
    const { g } = b;
    this.dsf = new Dsf(g.cells);
    this.number = Int32Array.from(b.ends);
    for (let e = 0; e < g.edgeCount; e++) {
      if (b.edges[e] !== LINE) continue;
      const [x, y] = [this.dsf.canonify(g.a[e]), this.dsf.canonify(g.b[e])];
      const [p, q] = [this.number[x], this.number[y]];
      if (x === y || (p !== NO_END && q !== NO_END && p !== q)) {
        this.clash ??= { kind: x === y ? "closed" : "joined", edge: e };
        continue;
      }
      this.dsf.merge(x, y);
      this.number[this.dsf.canonify(x)] = p !== NO_END ? p : q;
    }
  }

  numberOf(i: number): number {
    return this.number[this.dsf.canonify(i)];
  }
}

/** The first thing that breaks `b`, or `null`. */
export function clashOf(b: PathBoard): PathClash | null {
  // A loop or a join first: it is on the board as drawn, where a square short
  // of ways is a count the player makes.
  const joined = new Pieces(b).clash;
  if (joined) return joined;
  for (let i = 0; i < b.g.cells; i++) {
    const lines = b.edgesAt(i, LINE).length;
    const need = degreeOf(b.ends, i);
    if (lines > need) return { kind: "crowded", cell: i };
    if (lines < need && lines + b.liveAt(i).length < need)
      return { kind: "stuck", cell: i };
  }
  return null;
}

/** Whether `firing` is still a deduction on `b` as it stands: its square
 * still has exactly its edges for the lines it needs, or its edge still
 * joins two different numbers. A supposition's chain is cut down to the
 * firings its break needs by asking this of each that is left. */
export function stillHolds(b: PathBoard, firing: PathFiring): boolean {
  const { reason } = firing;
  if (reason.kind === "forced") {
    const live = b.liveAt(reason.cell);
    const need = degreeOf(b.ends, reason.cell) - b.edgesAt(reason.cell, LINE).length;
    return (
      need === live.length &&
      need === firing.edges.length &&
      firing.edges.every((e) => live.includes(e))
    );
  }
  if (reason.kind === "pair") {
    const e = firing.edges[0];
    if (!b.live(e)) return false;
    const pieces = new Pieces(b);
    const [p, q] = [pieces.numberOf(b.g.a[e]), pieces.numberOf(b.g.b[e])];
    return p !== NO_END && q !== NO_END && p !== q;
  }
  return false;
}

/** Whether the lines join every pair of numbers through every square: each
 * square has the lines it takes, and every path runs between two like
 * numbers. A cross and an open edge are the same here, so a player need cross
 * nothing out to finish. */
export function isComplete(
  w: number,
  h: number,
  ends: Uint8Array,
  edges: Uint8Array,
): boolean {
  const board = new PathBoard(w, h, ends, edges);
  for (let i = 0; i < board.g.cells; i++)
    if (board.edgesAt(i, LINE).length !== degreeOf(ends, i)) return false;
  // Every square has its lines, so a piece that reaches no number is a loop.
  const pieces = new Pieces(board);
  if (pieces.clash) return false;
  for (let i = 0; i < board.g.cells; i++)
    if (pieces.numberOf(i) === NO_END) return false;
  return true;
}

// --- the rungs ---------------------------------------------------------------

/** The first square with only as many live edges as it still needs lines,
 * `null` when none has, or `"contradiction"` when a square has too many lines
 * or too few ways left to take them. */
function findForced(b: PathBoard): PathFiring | null | "contradiction" {
  for (let i = 0; i < b.g.cells; i++) {
    const need = degreeOf(b.ends, i) - b.edgesAt(i, LINE).length;
    if (need < 0) return "contradiction";
    if (need === 0) continue;
    const live = b.liveAt(i);
    if (need > live.length) return "contradiction";
    if (need === live.length)
      return { reason: { kind: "forced", cell: i, need }, edges: live, mark: LINE };
  }
  return null;
}

/** The first live edge a line on which would join two different numbers. */
function findPair(b: PathBoard): PathFiring | null | "contradiction" {
  const pieces = new Pieces(b);
  if (pieces.clash) return "contradiction";
  for (let e = 0; e < b.g.edgeCount; e++) {
    if (!b.live(e)) continue;
    const [p, q] = [pieces.numberOf(b.g.a[e]), pieces.numberOf(b.g.b[e])];
    if (p !== NO_END && q !== NO_END && p !== q)
      return { reason: { kind: "pair", ends: [p, q] }, edges: [e], mark: CROSS };
  }
  return null;
}

/** The Easy rungs over `board`, each writing what it finds. */
function easyRungs(
  board: PathBoard,
  apply: (found: PathFiring | null | "contradiction") => number,
): DeductionTechnique[] {
  return [
    {
      id: "forced" satisfies PathRung,
      tier: DIFF_EASY,
      run: () => apply(findForced(board)),
    },
    {
      id: "pair" satisfies PathRung,
      tier: DIFF_EASY,
      run: () => apply(findPair(board)),
    },
  ];
}

/** A writer of firings onto `board`, handing each to `record`. */
function applier(
  board: PathBoard,
  record?: (firing: PathFiring) => void,
): (found: PathFiring | null | "contradiction") => number {
  return (found) => {
    if (found === "contradiction") return -1;
    if (found === null) return 0;
    for (const e of found.edges) board.edges[e] = found.mark;
    record?.(found);
    return 1;
  };
}

/** The Easy firings that follow from supposing `mark` on edge `e`, up to the
 * board breaking, or `null` where it does not break within
 * {@link CHAIN_LIMIT} firings. */
function suppose(
  b: PathBoard,
  e: number,
  mark: typeof LINE | typeof CROSS,
): { chain: PathFiring[]; clash: PathClash } | null {
  const edges = b.edges.slice();
  edges[e] = mark;
  const trial = new PathBoard(b.w, b.h, b.ends, edges);
  const chain: PathFiring[] = [];
  const rungs = easyRungs(
    trial,
    applier(trial, (f) => chain.push(f)),
  );
  for (;;) {
    const clash = clashOf(trial);
    if (clash) return { chain, clash };
    if (chain.length >= CHAIN_LIMIT) return null;
    if (!rungs.some((r) => r.run() > 0)) return null;
  }
}

/** The live edge one of whose marks breaks the board in the fewest firings,
 * which must then take the other mark. */
function findLookahead(b: PathBoard): PathFiring | null {
  let best: PathFiring | null = null;
  let shortest = Number.POSITIVE_INFINITY;
  for (let e = 0; e < b.g.edgeCount; e++) {
    if (!b.live(e)) continue;
    for (const supposed of [LINE, CROSS] as const) {
      const found = suppose(b, e, supposed);
      if (found === null || found.chain.length >= shortest) continue;
      shortest = found.chain.length;
      best = {
        reason: { kind: "lookahead", edge: e, supposed, ...found },
        edges: [e],
        mark: supposed === LINE ? CROSS : LINE,
      };
    }
  }
  return best;
}

/** The ladder over `board`. A rung that fires writes its edges, and hands
 * the firing to `record` where there is one. */
function ladder(
  board: PathBoard,
  record?: (firing: PathFiring) => void,
): DeductionTechnique[] {
  const apply = applier(board, record);
  return [
    ...easyRungs(board, apply),
    {
      id: "lookahead" satisfies PathRung,
      tier: DIFF_NORMAL,
      run: () => apply(findLookahead(board)),
    },
  ];
}

/**
 * Solve in place with the ladder capped at tier `cap`, and say how it ended.
 * `firings` takes a count of each rung's firings, for a census.
 */
export function solvePath(
  board: PathBoard,
  cap: number,
  firings?: FiringTally,
): DifficultyVerdict {
  const { impossible } = runDeductionFixpoint({
    techniques: ladder(board),
    maxTier: cap,
    firings,
    settled: () => !board.unfinished(),
  });
  if (impossible) return "impossible";
  if (board.unfinished()) return "unsolved";
  return isComplete(board.w, board.h, board.ends, board.edges)
    ? "solved"
    : "impossible";
}

/** The lines of a board's answer, or `null` where the ladder does not reach
 * one. */
export function answerOf(
  w: number,
  h: number,
  ends: Uint8Array,
): readonly EdgeMark[] | null {
  const board = new PathBoard(w, h, ends, new Uint8Array(geometry(w, h).edgeCount));
  if (solvePath(board, DIFF_NORMAL) !== "solved") return null;
  return Array.from(board.edges, (m) => (m === LINE ? LINE : OPEN));
}

/** The ladder one firing at a time, writing `board` as it goes: `next` gives
 * the firing just made, or `null` when no rung fires. */
export function pathRecordingPass(
  board: PathBoard,
  budget: StepBudget,
): { next(): PathFiring | null; impossible(): boolean } {
  let last: PathFiring | null = null;
  const pass: SingleFirings = singleFirings({
    techniques: ladder(board, (firing) => {
      last = firing;
    }),
    budget,
    settled: () => !board.unfinished(),
  });
  return {
    next: () => (pass.next() ? last : null),
    impossible: () => pass.impossible(),
  };
}
