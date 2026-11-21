/**
 * Seismic's solver: the ladder `seismic.description.yaml` states, compiled, on the
 * engine's marks and runner (`engine/solve/cell-marks.ts` and `ladder-runtime.ts`);
 * the answer check its rules compile to; and the error overlay.
 *
 * One ladder serves the generator (which strips a clue only while the board
 * still solves, so the solver's verdict on every intermediate board decides
 * which puzzles exist), `solve()`, `findMistakes` (a board the ladder drives to
 * completion is *forced*, hence uniquely solved: no rung supposes anything)
 * and the hint, which runs its starved area on the player's notes.
 *
 * Easy is the singles, a square's and an area's; Normal adds the starved area,
 * which is upstream's trial placement as the deduction it always comes to once
 * the singles are spent (`seismic-hint.test.ts` holds it to the trial).
 */

import type { Dsf } from "../../engine/board/dsf.ts";
import type { RulesOf } from "../../engine/contract/rules.ts";
import { CellMarks } from "../../engine/solve/cell-marks.ts";
import type { FiringTally } from "../../engine/solve/deduction-fixpoint.ts";
import {
  describedSpace,
  partition,
  perBoard,
  rangeMask,
} from "../../engine/solve/describe-runtime.ts";
import { describedRules } from "../../engine/solve/described-rules.ts";
import {
  describedLadder,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS,
} from "../../engine/solve/ladder-runtime.ts";
import * as seismic from "../../generated/games/seismic/seismic.compiled.ts";
import { DIFF_EASY, type SeismicBoard } from "./state.ts";

/** `solveGame` could not drive the board to a complete, valid solution. */
export const SOLVE_FAILED = -1;

/** A board's areas, kept for the life of the board's areas, which every
 * solve of it shares. */
const areasOf = perBoard((dsf: Dsf, n: number) => partition(dsf.classes(), n));

/** The board as the description deals it: its areas, in the order of their
 * first square, and its keep-apart rule. */
export function dealtOf(board: SeismicBoard): seismic.Dealt {
  return { area: areasOf(board.dsf, board.grid.length), mode: board.mode };
}

/**
 * The marks over `grid`, each square able to hold what its area admits, the
 * numbers on it placed and culled; `null` where two of them clash. The marks
 * are the solver's own, never the player's notes.
 */
export function marksOf(
  board: SeismicBoard,
  grid: Uint8Array,
  dl: seismic.Dealt,
  ladder: Ladder,
): CellMarks | null {
  const largest = Math.max(...dl.area.cells.map((cs) => cs.length));
  const m = new CellMarks(
    describedSpace(seismic.units, board.w, board.h),
    rangeMask(1, largest),
    grid,
  );
  m.placing = ladder.placing;
  return m.seed(grid, (c) => seismic.domainOf(m.sp, dl, c)) ? m : null;
}

/**
 * Run the ladder to a fixpoint, no harder than `maxDiff`, filling `board`'s
 * grid in place and leaving its notes the solver's candidates. Returns the
 * difficulty needed, or {@link SOLVE_FAILED} if the board did not come out
 * complete and valid.
 *
 * Callers that need the original back (the generator's clue-stripping loop)
 * snapshot it first.
 */
export function solveGame(
  board: SeismicBoard,
  maxDiff: number,
  firings?: FiringTally,
): number {
  const dl = dealtOf(board);
  const ladder = describedLadder(seismic, dl);
  const m = marksOf(board, board.grid, dl, ladder);
  if (m === null) return SOLVE_FAILED;
  const grades = { [TIERS]: DIFF_EASY };
  runLadder(m, ladderTechniques(m, ladder.entries, { [TIERS]: maxDiff }, grades), {
    firings,
  });
  for (let c = 0; c < board.pencil.length; c++) board.pencil[c] = m.cands[c] >> 1;
  return isComplete(board) ? grades[TIERS] : SOLVE_FAILED;
}

/** The board as its rules read it: a number is its value, a blank square
 * undecided. */
export const rules: RulesOf<SeismicBoard> = describedRules(seismic, {
  grid: (b) => b.grid,
  size: (b) => [b.w, b.h],
  deals: (b) => [dealtOf(b)],
});

/** Whether the board is an answer, by the rules its description compiles to. */
export function isComplete(board: SeismicBoard): boolean {
  return rules.isAnswer(board, board.grid);
}
