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
   * what `clue` needs beyond `inner` falls on its other open squares. */
  | { kind: "shared"; clue: number; need: number; inner: number; innerNeed: number };

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

/** The first number whose count decides its open squares, `null` when none
 * does, or `"contradiction"` when a number can no longer be met. */
function findCount(b: SkeletonBoard): SkeletonFiring | null | "contradiction" {
  for (const clue of b.clueSquares()) {
    const open = b.open(clue);
    const need = b.need(clue);
    if (need < 0 || need > open.length) return "contradiction";
    if (open.length === 0) continue;
    const reason: SkeletonReason = { kind: "count", clue, need, open: open.length };
    if (need === 0) return { reason, cells: open, mark: CROSSED };
    if (need === open.length) return { reason, cells: open, mark: FILLED };
  }
  return null;
}

/** The first pair of numbers where one's open squares all lie beside the
 * other, and the difference of their needs decides the other's remaining
 * open squares. */
function findShared(b: SkeletonBoard): SkeletonFiring | null {
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
      const reason: SkeletonReason = { kind: "shared", clue, need, inner, innerNeed };
      if (beyond === 0) return { reason, cells: rest, mark: CROSSED };
      if (beyond === rest.length) return { reason, cells: rest, mark: FILLED };
    }
  }
  return null;
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
  return [
    {
      id: "count" satisfies SkeletonRung,
      tier: DIFF_EASY,
      run: () => {
        const found = findCount(board);
        if (found === "contradiction") return -1;
        return found ? apply(found) : 0;
      },
    },
    {
      id: "shared" satisfies SkeletonRung,
      tier: DIFF_NORMAL,
      run: () => {
        const found = findShared(board);
        return found ? apply(found) : 0;
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
  });
  return {
    next: () => (pass.next() ? last : null),
    impossible: () => pass.impossible(),
  };
}
