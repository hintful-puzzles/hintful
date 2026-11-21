/**
 * Unruly solver: the ladder `unruly.description.yaml` states, compiled, on the
 * engine's marks and runner (`engine/solve/cell-marks.ts` and `ladder-runtime.ts`),
 * with the reason each technique records for the hint; the answer check its rules
 * compile to, which the state reads; and where a board breaks them, which the
 * renderer draws.
 *
 * The solver fills the view's own grid in place: it fills thousands of cells
 * per board during generation, where a clone per fill would be wasteful. The
 * `Game`'s `executeMove` stays pure.
 */

import type { RulesOf } from "../../engine/contract/rules.ts";
import { entryMistakes, gridCell } from "../../engine/hint/entry-mistakes.ts";
import { CellMarks } from "../../engine/solve/cell-marks.ts";
import { describedSpace } from "../../engine/solve/describe-runtime.ts";
import { describedRules } from "../../engine/solve/described-rules.ts";
import {
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS,
} from "../../engine/solve/ladder-runtime.ts";
import * as unruly from "../../generated/games/unruly/unruly.compiled.ts";
import { EMPTY, ONE, ZERO } from "./constants.ts";
import type { UnrulyMistake, UnrulyState } from "./state.ts";

/** The minimal grid view the validators/solver operate on. `UnrulyState`
 * structurally satisfies it. */
export interface GridView {
  w2: number;
  h2: number;
  unique: boolean;
  grid: Uint8Array;
}

// --- the described ladder -----------------------------------------------

/** The ladder, with the technique the unique-rows rule adds where it is on. */
function unrulyLadder(unique: boolean): Ladder {
  return describedLadder(unruly, null, {}, undefined, unique ? ["unique"] : []);
}

export const LADDERS = { plain: unrulyLadder(false), unique: unrulyLadder(true) };

/** The view's pieces as the ladder reads them, on the view's own grid: each
 * empty square may hold either piece. */
export function marksOf(view: GridView): CellMarks {
  const m = new CellMarks(
    describedSpace(unruly.units, view.w2, view.h2),
    (1 << ONE) | (1 << ZERO),
    view.grid,
  );
  m.seed(view.grid);
  return m;
}

// --- solve loop ----------------------------------------------------------

/**
 * Run the ladder to a fixpoint, capped at tier `diff`, filling `view.grid` in
 * place. Returns the highest tier whose technique fired, or `-1` if none
 * did.
 */
export function solveGame(view: GridView, diff: number): number {
  const m = marksOf(view);
  const grades = { [TIERS]: -1 };
  const { entries } = view.unique ? LADDERS.unique : LADDERS.plain;
  runLadder(m, ladderTechniques(m, entries, { [TIERS]: diff }, grades));
  return grades[TIERS];
}

/** Solve a copy of `grid` on `view`'s board, capped at tier `diff`, and return
 * the worked copy; the caller's grid is untouched. */
export function solveCopy(view: GridView, grid: Uint8Array, diff: number): GridView {
  const { w2, h2, unique } = view;
  const work: GridView = { w2, h2, unique, grid: Uint8Array.from(grid) };
  solveGame(work, diff);
  return work;
}

// --- the rules: the answer check, and where a board breaks them ------------

/** The rules Unruly draws its own way where they break, by the place each
 * has in the description. */
export const RUN: unruly.RuleName = "shape.0";
export const BALANCE: unruly.RuleName = "shape.1";
export const ALIKE: unruly.RuleName = "unique.shape.0";

/** The board as its rules read it: the grid holds the description's values. */
export const rules: RulesOf<UnrulyState> = describedRules(unruly, {
  grid: (s) => s.grid,
  size: (s) => [s.w2, s.h2],
  deals: (s): [readonly string[]] => [s.unique ? ["unique"] : []],
});

/** Whether the grid is an answer, by the rules its description compiles to. */
export function isComplete(view: GridView): boolean {
  return unruly.isAnswer(
    view.grid,
    describedSpace(unruly.units, view.w2, view.h2),
    view.unique ? ["unique"] : [],
  );
}

/**
 * Mistake-check (Check & Save): re-solve from the **immutable clues alone**
 * to the unique solution, then flag every player-placed cell whose color
 * contradicts it. Returns `[]` when the clues don't deduce a complete
 * solution (a foreign / non-unique board — undecided, so nothing to flag),
 * matching Range/Mosaic. Pure (no state mutation).
 */
export function findMistakes(state: UnrulyState): UnrulyMistake[] {
  const { w2, grid, immutable } = state;
  const clues = grid.map((v, i) => (immutable[i] ? v : EMPTY));
  const solved = solveCopy(state, clues, Number.MAX_SAFE_INTEGER);
  if (!isComplete(solved)) return [];

  return entryMistakes(
    {
      answer: solved.grid,
      entry: grid,
      empty: EMPTY,
      fixed: (i) => immutable[i] !== 0,
    },
    gridCell(w2),
  );
}

/** Run the full solver from a copy of `view`'s grid and return the solved
 * grid as a `'0'`/`'1'` string, or `null` if it doesn't reach a valid,
 * complete solution (Solve button). */
export function solveToString(view: GridView): string | null {
  const solved = solveCopy(view, view.grid, Number.MAX_SAFE_INTEGER);
  if (!isComplete(solved)) return null;
  let out = "";
  for (const v of solved.grid) out += v === ONE ? "1" : "0";
  return out;
}
