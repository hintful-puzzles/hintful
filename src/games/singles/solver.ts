/**
 * Singles' solver: the ladder `singles.description.yaml` states, compiled, on
 * the engine's marks and runner (`engine/solve/cell-marks.ts` and
 * `ladder-runtime.ts`), and the answer check its rules compile to.
 *
 * Easy is upstream's readings of the numbers (a sandwich, a touching pair,
 * a crowded corner) with what a covered or a clear square forces around it,
 * and a square with one way out. Normal adds the offset pairs and the
 * squares the uncovered ones would fall apart without.
 */

import type { RulesOf } from "../../engine/contract/rules.ts";
import { CellMarks } from "../../engine/solve/cell-marks.ts";
import { cluesWhere, describedSpace } from "../../engine/solve/describe-runtime.ts";
import { besideHeld, describedRules } from "../../engine/solve/described-rules.ts";
import {
  describedLadder,
  type Ladder,
  type LadderEntry,
  ladderTechniques,
  runLadder,
  TIERS,
} from "../../engine/solve/ladder-runtime.ts";
import * as singles from "../../generated/games/singles/singles.compiled.ts";
import { F_BLACK, F_CIRCLE, type SinglesState } from "./state.ts";

/** Defined here, beside the solver, rather than in `state.ts`: imported from
 * there, generation and solving ran 1.2-1.4x slower under vitest (paired
 * timing, 2026-09-11). */
export function inGrid(s: SinglesState, x: number, y: number): boolean {
  return x >= 0 && x < s.w && y >= 0 && y < s.h;
}

/** What the description reads a square as holding. */
export const COVERED = 1;
export const CLEAR = 2;

/** The highest tier the ladder grades: Normal. */
const NORMAL = 1;

/** The board as the description deals it: every square's number. */
export function dealtOf({ nums }: SinglesState): singles.Dealt {
  return { number: cluesWhere(nums, () => true) };
}

/** The values the description reads off a state's marks: covered, clear, or
 * neither. */
function valuesOf(state: SinglesState): Uint8Array {
  return Uint8Array.from(state.flags, (f) =>
    f & F_BLACK ? COVERED : f & F_CIRCLE ? CLEAR : 0,
  );
}

/** Write the marks' values back into a state's flags. */
function writeBack(state: SinglesState, grid: ArrayLike<number>): void {
  for (let c = 0; c < state.n; c++) {
    state.flags[c] &= ~(F_BLACK | F_CIRCLE);
    if (grid[c] === COVERED) state.flags[c] |= F_BLACK;
    else if (grid[c] === CLEAR) state.flags[c] |= F_CIRCLE;
  }
}

/** The ladder and the marks over a state's numbers and marks. */
function deduction(state: SinglesState): {
  m: CellMarks;
  ladder: Ladder;
  dl: singles.Dealt;
} {
  const dl = dealtOf(state);
  const m = new CellMarks(
    describedSpace(singles.units, state.w, state.h),
    (1 << COVERED) | (1 << CLEAR),
    valuesOf(state),
  );
  m.seed(m.grid);
  return { m, ladder: describedLadder(singles, dl), dl };
}

/** What a hint walks: the marks over a state's numbers and marks, and the
 * ladder's techniques. */
export function hintWalk(state: SinglesState): {
  marks: CellMarks;
  entries: readonly LadderEntry[];
} {
  const { m, ladder } = deduction(state);
  return { marks: m, entries: ladder.entries };
}

/**
 * Solve `state` from its marks, no harder than tier `cap`, writing what the
 * ladder decides into its flags. Returns -1 where the marks break the rules,
 * 0 where the ladder stops short, and 1 where it finishes the board.
 */
export function solveSpecific(state: SinglesState, cap: number): number {
  const { m, ladder, dl } = deduction(state);
  const techniques = ladderTechniques(m, ladder.entries, { [TIERS]: cap }, {});
  const broken = runLadder(m, techniques);
  writeBack(state, m.grid);
  if (broken) return -1;
  if (m.grid.includes(0)) return 0;
  return singles.isAnswer(m.grid, m.sp, dl) ? 1 : -1;
}

/**
 * The generator's: cover each square of `order` still open, in turn, and run
 * the ladder after each, so the clear squares stay joined and no two covered
 * squares touch. The numbers are a Latin square's, so only the techniques
 * that read no number fire. Writes the result into `state`'s flags, and
 * returns false where a covering leaves the marks broken.
 */
export function layCovered(state: SinglesState, order: readonly number[]): boolean {
  const { m, ladder } = deduction(state);
  const techniques = ladderTechniques(m, ladder.entries, { [TIERS]: NORMAL }, {});
  for (const c of order) {
    if (m.known(c)) continue;
    m.place(c, COVERED);
    if (runLadder(m, techniques)) return false;
  }
  writeBack(state, m.grid);
  return true;
}

/** Solved when the board breaks no rule, an unmarked cell counting as clear
 * (as upstream completes it). */
export function status(s: SinglesState): "solved" | "ongoing" {
  const g = Uint8Array.from(s.flags, (f) => (f & F_BLACK ? COVERED : CLEAR));
  return singles.isAnswer(g, describedSpace(singles.units, s.w, s.h), dealtOf(s))
    ? "solved"
    : "ongoing";
}

/** The squares as the rules read them: a circle or a square beside a covered
 * one is clear, and any other square not covered is undecided. */
export const rules: RulesOf<SinglesState> = describedRules(singles, {
  grid: (s) => besideHeld(valuesOf(s), s.w, s.h, COVERED, CLEAR),
  size: (s) => [s.w, s.h],
  deals: (s) => [dealtOf(s)],
});
