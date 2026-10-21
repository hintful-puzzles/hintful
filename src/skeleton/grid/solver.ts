/**
 * Skeleton's deductions: one ladder, run two ways.
 *
 * {@link solveSkeleton} runs it to a fixpoint, which is how the generator
 * grades a board and how Solve and the mistake check find the answer.
 * {@link skeletonRecordingPass} runs the same rungs one firing at a time, and
 * the hint narrates each (docs/solver-and-generator.md § "One engine,
 * two projections").
 *
 * Both rungs only ever decide a square the numbers force, so a board the
 * ladder finishes has exactly one answer, and the order the rungs fire in
 * cannot change it.
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
import type { StepBudget } from "../../engine/step-budget.ts";
import {
  BLANK,
  CROSSED,
  DIFF_EASY,
  DIFF_NORMAL,
  FILLED,
  NO_CLUE,
  neighbors,
  type SkeletonMark,
} from "./state.ts";

/** Why a firing decides its squares. `need` is how many more filled squares a
 * number wanted, and `open` how many undecided squares it had beside it, both
 * before the firing. */
export type SkeletonReason =
  /** One number: it has its count, or needs every open square beside it. */
  | { kind: "count"; clue: number; need: number; open: number }
  /** Two numbers: every open square beside `inner` is also beside `clue`, so
   * what `clue` needs beyond `inner` falls on its other open squares. `meet`
   * is the open squares beside `inner`, where the two meet. */
  | {
      kind: "shared";
      clue: number;
      need: number;
      inner: number;
      innerNeed: number;
      meet: number[];
    };

/** One deduction: `cells` all take `mark`. */
export interface SkeletonFiring {
  reason: SkeletonReason;
  cells: number[];
  mark: typeof FILLED | typeof CROSSED;
}

/** The rungs, easiest first, by the `kind` of the reason a firing carries. */
export const SKELETON_RUNGS = [
  "count",
  "shared",
] as const satisfies readonly SkeletonReason["kind"][];
export type SkeletonRung = (typeof SKELETON_RUNGS)[number];

/** The board the ladder works on: the clues, and a grid it writes as it goes. */
export class SkeletonBoard {
  constructor(
    readonly w: number,
    readonly h: number,
    readonly clues: Int8Array,
    readonly grid: Uint8Array,
  ) {}

  /** The squares with a number, in reading order. */
  clueSquares(): number[] {
    const out: number[] = [];
    for (let i = 0; i < this.clues.length; i++)
      if (this.clues[i] !== NO_CLUE) out.push(i);
    return out;
  }

  /** The undecided squares beside `clue`. */
  open(clue: number): number[] {
    return neighbors(this.w, this.h, clue).filter(
      (j) => this.clues[j] === NO_CLUE && this.grid[j] === BLANK,
    );
  }

  /** How many more filled squares `clue` needs beside it. */
  need(clue: number): number {
    let filled = 0;
    for (const j of neighbors(this.w, this.h, clue))
      if (this.grid[j] === FILLED) filled++;
    return this.clues[clue] - filled;
  }

  /** Whether a square is still undecided. */
  unfinished(): boolean {
    return this.grid.some((m, i) => m === BLANK && this.clues[i] === NO_CLUE);
  }
}

/** Whether every number counts the filled squares beside it. A blank square
 * counts as empty, so a player need cross nothing out to finish. */
export function isComplete(
  w: number,
  h: number,
  clues: Int8Array,
  grid: Uint8Array,
): boolean {
  const board = new SkeletonBoard(w, h, clues, grid);
  return board.clueSquares().every((c) => board.need(c) === 0);
}

/** Every number whose count decides its open squares, in reading order, or
 * `"contradiction"` when a number can no longer be met. */
function allCounts(b: SkeletonBoard): SkeletonFiring[] | "contradiction" {
  const out: SkeletonFiring[] = [];
  for (const clue of b.clueSquares()) {
    const open = b.open(clue);
    const need = b.need(clue);
    if (need < 0 || need > open.length) return "contradiction";
    if (open.length === 0) continue;
    const reason: SkeletonReason = { kind: "count", clue, need, open: open.length };
    if (need === 0) out.push({ reason, cells: open, mark: CROSSED });
    else if (need === open.length) out.push({ reason, cells: open, mark: FILLED });
  }
  return out;
}

/** Every pair of numbers where one's open squares all lie beside the other,
 * and the difference of their needs decides the other's remaining open
 * squares. */
function allShared(b: SkeletonBoard): SkeletonFiring[] {
  const out: SkeletonFiring[] = [];
  const clues = b.clueSquares();
  for (const clue of clues) {
    const open = b.open(clue);
    if (open.length < 2) continue;
    for (const inner of clues) {
      if (inner === clue) continue;
      const within = b.open(inner);
      if (within.length === 0 || within.length >= open.length) continue;
      if (!within.every((j) => open.includes(j))) continue;
      const rest = open.filter((j) => !within.includes(j));
      const need = b.need(clue);
      const innerNeed = b.need(inner);
      const beyond = need - innerNeed;
      const reason: SkeletonReason = {
        kind: "shared",
        clue,
        need,
        inner,
        innerNeed,
        meet: within,
      };
      if (beyond === 0) out.push({ reason, cells: rest, mark: CROSSED });
      else if (beyond === rest.length) out.push({ reason, cells: rest, mark: FILLED });
    }
  }
  return out;
}

/** The squares a firing's premise reads, which a hint plan continues from:
 * its numbers and the squares around them. */
function readsOf(b: SkeletonBoard, firing: SkeletonFiring): number[] {
  const { reason } = firing;
  const around = (clue: number): number[] => [clue, ...neighbors(b.w, b.h, clue)];
  return reason.kind === "count"
    ? around(reason.clue)
    : [...around(reason.clue), ...around(reason.inner)];
}

/** The ladder over `board`. A rung that fires writes its squares, and hands
 * the firing to `record` where there is one. */
function ladder(
  board: SkeletonBoard,
  record?: (firing: SkeletonFiring) => void,
): DeductionTechnique[] {
  const apply = (firing: SkeletonFiring): number => {
    for (const i of firing.cells) board.grid[i] = firing.mark;
    record?.(firing);
    return 1;
  };
  // What a hint plan chooses among: each firing with what it reads and the
  // squares it writes.
  const offered = (found: readonly SkeletonFiring[]): LadderCandidate[] =>
    found.map((firing) => ({
      reads: () => readsOf(board, firing),
      writes: () => firing.cells,
      take: () => {
        apply(firing);
      },
    }));
  return [
    {
      id: "count" satisfies SkeletonRung,
      tier: DIFF_EASY,
      run: () => {
        const found = allCounts(board);
        if (found === "contradiction") return -1;
        return found.length > 0 ? apply(found[0]) : 0;
      },
      available: () => {
        const found = allCounts(board);
        return found === "contradiction" ? found : offered(found);
      },
    },
    {
      id: "shared" satisfies SkeletonRung,
      tier: DIFF_NORMAL,
      run: () => {
        const found = allShared(board);
        return found.length > 0 ? apply(found[0]) : 0;
      },
      available: () => offered(allShared(board)),
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
  return isComplete(board.w, board.h, board.clues, board.grid)
    ? "solved"
    : "impossible";
}

/** The answer to a board's clues, or `null` where the ladder does not reach
 * one. */
export function answerOf(
  w: number,
  h: number,
  clues: Int8Array,
): readonly SkeletonMark[] | null {
  const board = new SkeletonBoard(w, h, clues, new Uint8Array(w * h));
  if (solveSkeleton(board, DIFF_NORMAL) !== "solved") return null;
  return Array.from(board.grid, (m) => m as SkeletonMark);
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
    // A plan stays with the squares it is working on before it moves on.
    continuing: true,
  });
  return {
    next: () => (pass.next() ? last : null),
    impossible: () => pass.impossible(),
  };
}
