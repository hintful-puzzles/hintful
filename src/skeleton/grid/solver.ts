/**
 * Skeleton's solver: the ladder `skeleton.description.yaml` states, compiled,
 * on the engine's marks and runner (`engine/ladder-runtime.ts`), and the
 * answer check its rules compile to.
 *
 * {@link solveSkeleton} runs the ladder to a fixpoint, which is how the
 * generator grades a board and how Solve and the mistake check find the
 * answer. {@link hintWalk} hands the engine the ladder to take one firing at
 * a time, and the hint narrates each (docs/solver-and-generator.md § "One engine, two
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
  type LadderEntry,
  ladderTechniques,
  runLadder,
  TIERS as SCALE,
} from "../../engine/ladder-runtime.ts";
import * as skeleton from "./skeleton.compiled.ts";
import {
  BLANK,
  CROSSED,
  DIFF_NORMAL,
  FILLED,
  NO_CLUE,
  type SkeletonMark,
} from "./state.ts";

/** The rungs, easiest first: the techniques whose firings a hint says. */
export const SKELETON_RUNGS = skeleton.SAYS_KINDS;
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
    count: compiledRung(skeleton.count, dealt),
    shared: compiledRung(skeleton.shared, dealt),
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
 * What the hint walks: the player's marks on a copy of the board, and the
 * ladder. The engine takes one firing at a time from it, the one that carries
 * on from the squares the last decided (`engine/described-firing-hint.ts`).
 */
export function hintWalk(
  state: SkeletonBoard,
  _cap: number,
): { marks: CellMarks; entries: readonly LadderEntry[] } {
  const board: SkeletonBoard = { ...state, grid: state.grid.slice() };
  return { marks: marksOf(board), entries: skeletonLadder(dealtOf(board)).entries };
}
