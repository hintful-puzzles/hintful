/**
 * Skeleton's solver: the ladder `skeleton.description.yaml` states, compiled,
 * on the engine's marks and runner (`engine/ladder-runtime.ts`), with the
 * reason each technique records for the hint, and the answer check its rules
 * compile to.
 *
 * {@link solveSkeleton} runs the ladder to a fixpoint, which is how the
 * generator grades a board and how Solve and the mistake check find the
 * answer. {@link skeletonWalk} takes it one firing at a time, and the hint
 * narrates each (docs/solver-and-generator.md § "One engine, two
 * projections").
 *
 * Both techniques only ever decide a square the numbers force, so a board the
 * ladder finishes has exactly one answer.
 */

import type { FiringTally } from "../../engine/deduction-fixpoint.ts";
import { clueList, describedSpace } from "../../engine/describe-runtime.ts";
import type { DifficultyVerdict } from "../../engine/difficulty.ts";
import {
  CellMarks,
  compiledRung,
  describedLadder,
  type Ladder,
  type LadderWalk,
  ladderTechniques,
  ladderWalk,
  runLadder,
  TIERS as SCALE,
} from "../../engine/ladder-runtime.ts";
import type { StepBudget } from "../../engine/step-budget.ts";
import * as skeleton from "./skeleton.compiled.ts";
import {
  BLANK,
  CROSSED,
  DIFF_NORMAL,
  FILLED,
  NO_CLUE,
  neighbors,
  type SkeletonMark,
} from "./state.ts";

/** Why a firing decides its squares. `need` is how many more shaded squares
 * a number wanted, both before the firing. */
export type SkeletonReason =
  /** One number: it has its count, or needs every one of its `open`
   * undecided squares. */
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
      meet: readonly number[];
    };

/** The rungs, easiest first, by the `kind` of the reason a firing carries. */
export const SKELETON_RUNGS = [
  "count",
  "shared",
] as const satisfies readonly SkeletonReason["kind"][];
export type SkeletonRung = (typeof SKELETON_RUNGS)[number];

/** The board the ladder works on: the clues, and a grid of
 * {@link SkeletonMark}s it writes as it goes. */
export interface SkeletonBoard {
  w: number;
  h: number;
  clues: Int8Array;
  grid: Uint8Array;
}

/** The board's numbers as the description reads them. */
function dealtOf({ clues }: SkeletonBoard): skeleton.Dealt {
  const at: number[] = [];
  const v: number[] = [];
  clues.forEach((n, i) => {
    if (n === NO_CLUE) return;
    at.push(i);
    v.push(n);
  });
  return { count: clueList(at, v, clues.length) };
}

/** The ladder over the numbers `dealt` deals. */
function skeletonLadder(dealt: skeleton.Dealt): Ladder {
  return describedLadder(skeleton, {
    count: compiledRung(
      skeleton.count,
      dealt,
      ({ c, n, O }): SkeletonReason => ({
        kind: "count",
        clue: c,
        need: n,
        open: O.length,
      }),
    ),
    shared: compiledRung(
      skeleton.shared,
      dealt,
      ({ c, b, M }, _cell, _n, m): SkeletonReason => ({
        kind: "shared",
        clue: c,
        need: skeleton.need(m, m.sp, dealt, c),
        inner: b,
        innerNeed: skeleton.need(m, m.sp, dealt, b),
        meet: M,
      }),
    ),
  });
}

/** The values a square may hold: shaded or clear. */
const DOMAIN = (1 << FILLED) | (1 << CROSSED);

/** The marks the ladder reads, on `board.grid` itself. */
function marksOf(board: SkeletonBoard): CellMarks {
  const m = new CellMarks(
    describedSpace(skeleton.units, board.w, board.h),
    DOMAIN,
    board.grid,
  );
  m.seed(board.grid);
  return m;
}

/** Whether every number counts the shaded squares beside it, by the rules
 * the description compiles to. A blank square counts as clear, so a player
 * need cross nothing out to finish. */
export function isComplete(board: SkeletonBoard): boolean {
  const grid = board.grid.map((mark) => (mark === FILLED ? FILLED : CROSSED));
  return skeleton.isAnswer(
    grid,
    describedSpace(skeleton.units, board.w, board.h),
    dealtOf(board),
  );
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
  const m = marksOf(board);
  const { entries } = skeletonLadder(dealtOf(board));
  const impossible = runLadder(m, ladderTechniques(m, entries, { [SCALE]: cap }, {}), {
    firings,
  });
  if (impossible) return "impossible";
  const unfinished = board.grid.some(
    (mark, i) => mark === BLANK && board.clues[i] === NO_CLUE,
  );
  if (unfinished) return "unsolved";
  return isComplete(board) ? "solved" : "impossible";
}

/** The answer to a board's clues, or `null` where the ladder does not reach
 * one. */
export function answerOf(
  w: number,
  h: number,
  clues: Int8Array,
): readonly SkeletonMark[] | null {
  const board: SkeletonBoard = { w, h, clues, grid: new Uint8Array(w * h) };
  if (solveSkeleton(board, DIFF_NORMAL) !== "solved") return null;
  return Array.from(board.grid, (m) => m as SkeletonMark);
}

/**
 * The hint's walk over the ladder from `board`, a copy of the player's
 * marks, one firing a call: the one that carries on from the squares the
 * last decided (`ladderWalk`). No tier cap: a board that arrives by its ID
 * carries no tier, and the ladder tries the easy rung first, which is the
 * order a hint wants anyway.
 */
export function skeletonWalk(board: SkeletonBoard, budget: StepBudget): LadderWalk {
  const m = marksOf(board);
  m.budget = budget;
  const { w, h } = board;
  // A number and the squares beside it.
  const around = (clue: number): number[] => [clue, ...neighbors(w, h, clue)];
  const reads = ({ reasons }: { reasons: readonly object[] }): number[] => {
    const reason = reasons[0] as SkeletonReason;
    return reason.kind === "count"
      ? around(reason.clue)
      : [...around(reason.clue), ...around(reason.inner)];
  };
  const { entries } = skeletonLadder(dealtOf(board));
  return ladderWalk(m, entries, { [SCALE]: DIFF_NORMAL }, reads);
}
