/**
 * Skeleton's deductions: one ladder, run two ways.
 *
 * {@link solveSkeleton} runs it to a fixpoint, which is how the generator
 * grades a board and how Solve and the mistake check find the answer.
 * {@link skeletonRecordingPass} runs the same rungs one firing at a time, and
 * the hint narrates each (docs/solver-and-generator.md § "One engine, two
 * projections").
 *
 * Every rung decides an edge only where the rules force it, so a board the
 * ladder finishes has exactly one answer. Each rung stays true as more of the
 * board is decided, so the order they fire in cannot change where the ladder
 * ends (docs/solver-and-generator.md § "A fixpoint is order-independent only
 * if every rule is monotone").
 *
 * No rung crosses out an edge: one beside a square that has its two lines, or
 * whose line would close a loop short of every square, counts as closed
 * (`SkeletonBoard.live`), as a player sees it is.
 */

import {
  type DeductionTechnique,
  type FiringTally,
  type LadderCandidate,
  runDeductionFixpoint,
  type SingleFirings,
  singleFirings,
} from "../../engine/deduction-fixpoint.ts";
import type { DifficultyVerdict } from "../../engine/difficulty.ts";
import { Dsf } from "../../engine/dsf.ts";
import { CROSS, type EdgeMark, LINE, OPEN } from "../../engine/line-drawing.ts";
import { type SquareEdges, squareEdges } from "../../engine/square-edges.ts";
import type { StepBudget } from "../../engine/step-budget.ts";
import { DIFF_EASY, DIFF_NORMAL, LINES_PER_SQUARE } from "./state.ts";

/** What breaks a board: a square with more lines than it takes, or too few
 * ways left for the lines it takes; or lines that close a loop short of
 * every square, at `edge`. */
export type SkeletonClash =
  | { kind: "crowded" | "stuck"; cell: number }
  | { kind: "closed"; edge: number };

/** Why a firing decides its edges. */
export type SkeletonReason =
  /** The square has only as many live edges as it still needs lines. */
  | { kind: "forced"; cell: number; need: number }
  /** Supposing `supposed` on `edge` leads, by the Easy rung's `chain`, to
   * `clash`. */
  | {
      kind: "lookahead";
      edge: number;
      supposed: typeof LINE | typeof CROSS;
      chain: SkeletonFiring[];
      clash: SkeletonClash;
    };

/** One deduction: `edges` all take `mark`. */
export interface SkeletonFiring {
  reason: SkeletonReason;
  edges: number[];
  mark: typeof LINE | typeof CROSS;
}

/** The rungs, easiest first, by the `kind` of the reason a firing carries. */
export const SKELETON_RUNGS = [
  "forced",
  "lookahead",
] as const satisfies readonly SkeletonReason["kind"][];
export type SkeletonRung = (typeof SKELETON_RUNGS)[number];

/** The longest chain of Easy firings a supposition may take to break the
 * board. It keeps the lookahead a walk a player can follow a firing at a
 * time, rather than a search, and so is load-bearing for Normal's name
 * (docs/solver-and-generator.md § "Check, Tactic, Search"). */
const CHAIN_LIMIT = 6;

/** The board the ladder works on: the walls, and the edges it writes as it
 * goes. */
export class SkeletonBoard {
  readonly g: SquareEdges;
  /** The pieces of loop as of `piecesAt` writes; rebuilt when the edges have
   * been written since. */
  private cached: Pieces | null = null;
  private writes = 0;
  private piecesAt = -1;

  constructor(
    readonly w: number,
    readonly h: number,
    readonly walls: Uint8Array,
    readonly edges: Uint8Array,
  ) {
    this.g = squareEdges(w, h);
  }

  /** Put `mark` on edge `e`. Every write to a board the ladder reads goes
   * through here, so that {@link pieces} is never stale. */
  set(e: number, mark: EdgeMark): void {
    this.edges[e] = mark;
    this.writes++;
  }

  /** The pieces the lines make now. */
  pieces(): Pieces {
    if (this.cached === null || this.piecesAt !== this.writes) {
      this.cached = new Pieces(this);
      this.piecesAt = this.writes;
    }
    return this.cached;
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
    return this.edgesAt(i, LINE).length < LINES_PER_SQUARE;
  }

  /** Whether a line could still go on edge `e`: it is neither line, cross
   * nor wall, both its squares take another line, and it would not close a
   * loop short of every square. Each of the last two a player sees at a
   * glance, so such an edge is as good as crossed out and no step asks for
   * its cross. */
  live(e: number): boolean {
    const [i, j] = [this.g.a[e], this.g.b[e]];
    if (this.edges[e] !== OPEN || this.walls[e]) return false;
    if (!this.spare(i) || !this.spare(j)) return false;
    const { dsf } = this.pieces();
    return !dsf.equivalent(i, j) || dsf.size(i) === this.g.cells;
  }

  /** The {@link live} edges around square `i`. */
  liveAt(i: number): number[] {
    return this.edgesAt(i, OPEN).filter((e) => this.live(e));
  }

  /** Whether some square still lacks a line it takes. */
  unfinished(): boolean {
    for (let i = 0; i < this.g.cells; i++) if (this.spare(i)) return true;
    return false;
  }
}

/** The pieces of loop the lines make. */
class Pieces {
  readonly dsf: Dsf;
  /** The first line that closes a loop short of every square, or `null`. */
  readonly clash: SkeletonClash | null = null;

  constructor(b: SkeletonBoard) {
    const { g } = b;
    this.dsf = new Dsf(g.cells);
    for (let e = 0; e < g.edgeCount; e++) {
      if (b.edges[e] !== LINE) continue;
      const [i, j] = [g.a[e], g.b[e]];
      // A loop closed through every square is the answer's; one short of
      // them cannot grow, as each square on it has its two lines.
      if (this.dsf.equivalent(i, j)) {
        if (this.dsf.size(i) < g.cells) this.clash ??= { kind: "closed", edge: e };
        continue;
      }
      this.dsf.merge(i, j);
    }
  }
}

/** The first thing that breaks `b`, or `null`. */
export function clashOf(b: SkeletonBoard): SkeletonClash | null {
  // A loop first: it is on the board as drawn, where a square short of ways
  // is a count the player makes.
  const closed = b.pieces().clash;
  if (closed) return closed;
  for (let i = 0; i < b.g.cells; i++) {
    const lines = b.edgesAt(i, LINE).length;
    if (lines > LINES_PER_SQUARE) return { kind: "crowded", cell: i };
    if (lines + b.liveAt(i).length < LINES_PER_SQUARE)
      return { kind: "stuck", cell: i };
  }
  return null;
}

/** Whether `firing` is still a deduction on `b` as it stands: its square
 * still has exactly its edges for the lines it needs. A supposition's chain is
 * cut down to the firings its break needs by asking this of each that is
 * left. */
export function stillHolds(b: SkeletonBoard, firing: SkeletonFiring): boolean {
  const { reason } = firing;
  if (reason.kind !== "forced") return false;
  const live = b.liveAt(reason.cell);
  const need = LINES_PER_SQUARE - b.edgesAt(reason.cell, LINE).length;
  return (
    need === live.length &&
    need === firing.edges.length &&
    firing.edges.every((e) => live.includes(e))
  );
}

/** Whether the lines make one loop through every square, crossing no wall.
 * A cross and an open edge are the same here, so a player need cross nothing
 * out to finish. */
export function isComplete(
  w: number,
  h: number,
  walls: Uint8Array,
  edges: Uint8Array,
): boolean {
  const board = new SkeletonBoard(w, h, walls, edges);
  for (let i = 0; i < board.g.cells; i++)
    if (board.edgesAt(i, LINE).length !== LINES_PER_SQUARE) return false;
  if (edges.some((m, e) => m === LINE && walls[e])) return false;
  // Every square has its two lines, so the pieces are loops: one is the answer.
  const pieces = board.pieces();
  return pieces.clash === null && pieces.dsf.size(0) === board.g.cells;
}

// --- the rungs ---------------------------------------------------------------

/** Every square with only as many live edges as it still needs lines, or
 * `"contradiction"` when a square has too many lines or too few ways left to
 * take them. */
function allForced(b: SkeletonBoard): SkeletonFiring[] | "contradiction" {
  if (b.pieces().clash) return "contradiction";
  const out: SkeletonFiring[] = [];
  for (let i = 0; i < b.g.cells; i++) {
    const need = LINES_PER_SQUARE - b.edgesAt(i, LINE).length;
    if (need < 0) return "contradiction";
    if (need === 0) continue;
    const live = b.liveAt(i);
    if (need > live.length) return "contradiction";
    if (need === live.length)
      out.push({ reason: { kind: "forced", cell: i, need }, edges: live, mark: LINE });
  }
  return out;
}

/** The squares a firing's premise reads, which a hint plan continues from: a
 * forced square and the squares around it, or a supposed edge's two. */
function readsOf(b: SkeletonBoard, firing: SkeletonFiring): number[] {
  const { g } = b;
  const { reason } = firing;
  switch (reason.kind) {
    case "forced": {
      const out = [reason.cell];
      for (let k = 0; k < 4; k++) {
        const e = g.around[reason.cell * 4 + k];
        if (e >= 0) out.push(g.a[e] === reason.cell ? g.b[e] : g.a[e]);
      }
      return out;
    }
    case "lookahead":
      return [g.a[reason.edge], g.b[reason.edge]];
  }
}

/** `found` as the candidates a plan's frontier chooses among: each firing
 * with the squares it reads and the squares of the edges it writes. */
function offered(
  b: SkeletonBoard,
  apply: (found: SkeletonFiring | null | "contradiction") => number,
  found: readonly SkeletonFiring[] | "contradiction",
): LadderCandidate[] | "contradiction" {
  if (found === "contradiction") return found;
  return found.map((firing) => ({
    reads: () => readsOf(b, firing),
    writes: () => firing.edges.flatMap((e) => [b.g.a[e], b.g.b[e]]),
    take: () => {
      apply(firing);
    },
  }));
}

/** A writer of firings onto `board`, handing each to `record`. */
function applier(
  board: SkeletonBoard,
  record?: (firing: SkeletonFiring) => void,
): (found: SkeletonFiring | null | "contradiction") => number {
  return (found) => {
    if (found === "contradiction") return -1;
    if (found === null) return 0;
    for (const e of found.edges) board.set(e, found.mark);
    record?.(found);
    return 1;
  };
}

/** The Easy rung over `board`, writing what it finds. */
function easyRungs(
  board: SkeletonBoard,
  apply: (found: SkeletonFiring | null | "contradiction") => number,
): DeductionTechnique[] {
  return [
    {
      id: "forced" satisfies SkeletonRung,
      tier: DIFF_EASY,
      run: () => {
        const found = allForced(board);
        return apply(found === "contradiction" ? found : (found[0] ?? null));
      },
      available: () => offered(board, apply, allForced(board)),
    },
  ];
}

/** The Easy firings that follow from supposing `mark` on edge `e`, up to the
 * board breaking, or `null` where it does not break within `limit`
 * firings. */
function suppose(
  b: SkeletonBoard,
  e: number,
  mark: typeof LINE | typeof CROSS,
  limit: number,
): { chain: SkeletonFiring[]; clash: SkeletonClash } | null {
  const edges = b.edges.slice();
  edges[e] = mark;
  const trial = new SkeletonBoard(b.w, b.h, b.walls, edges);
  const chain: SkeletonFiring[] = [];
  const rungs = easyRungs(
    trial,
    applier(trial, (f) => chain.push(f)),
  );
  for (;;) {
    const clash = clashOf(trial);
    if (clash) return { chain, clash };
    if (chain.length >= limit) return null;
    if (!rungs.some((r) => r.run() > 0)) return null;
  }
}

/** The live edge one of whose marks breaks the board in the fewest firings,
 * which must then take the other mark. Each supposition is walked only as
 * far as the shortest break found so far. */
function findLookahead(b: SkeletonBoard): SkeletonFiring | null {
  let best: SkeletonFiring | null = null;
  let limit = CHAIN_LIMIT;
  for (let e = 0; e < b.g.edgeCount && limit >= 0; e++) {
    if (!b.live(e)) continue;
    for (const supposed of [LINE, CROSS] as const) {
      const found = suppose(b, e, supposed, limit);
      if (found === null) continue;
      limit = found.chain.length - 1;
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
  board: SkeletonBoard,
  record?: (firing: SkeletonFiring) => void,
): DeductionTechnique[] {
  const apply = applier(board, record);
  return [
    ...easyRungs(board, apply),
    {
      id: "lookahead" satisfies SkeletonRung,
      tier: DIFF_NORMAL,
      run: () => apply(findLookahead(board)),
      // The shortest walk only: every supposition is dear, and the frontier
      // reaches this rung only where no Easy firing continues.
      available: () => {
        const found = findLookahead(board);
        return offered(board, apply, found ? [found] : []);
      },
    },
  ];
}

/**
 * Solve in place with the ladder capped at tier `cap`, and say how it ended.
 * `firings` takes a count of each rung's firings, for a census.
 */
export function solveSkeleton(
  board: SkeletonBoard,
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
  return isComplete(board.w, board.h, board.walls, board.edges)
    ? "solved"
    : "impossible";
}

/** The lines of a board's answer, or `null` where the ladder does not reach
 * one. */
export function answerOf(
  w: number,
  h: number,
  walls: Uint8Array,
): readonly EdgeMark[] | null {
  const board = new SkeletonBoard(w, h, walls, new Uint8Array(walls.length));
  if (solveSkeleton(board, DIFF_NORMAL) !== "solved") return null;
  return Array.from(board.edges, (m) => (m === LINE ? LINE : OPEN));
}

/** The ladder one firing at a time, writing `board` as it goes: `next` gives
 * the firing just made, or `null` when no rung fires. */
export function skeletonRecordingPass(
  board: SkeletonBoard,
  budget: StepBudget,
): { next(): SkeletonFiring | null; impossible(): boolean } {
  let last: SkeletonFiring | null = null;
  const pass: SingleFirings = singleFirings({
    techniques: ladder(board, (firing) => {
      last = firing;
    }),
    budget,
    settled: () => !board.unfinished(),
    // A plan stays with the piece of loop it is working on before it moves on.
    continuing: true,
  });
  return {
    next: () => (pass.next() ? last : null),
    impossible: () => pass.impossible(),
  };
}
