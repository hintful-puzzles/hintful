/**
 * Rome's solver: the ladder `rome.description.yaml` states, compiled, on the
 * engine's marks and runner (`engine/solve/cell-marks.ts` and `ladder-runtime.ts`);
 * and the answer check and the violation check its rules compile to, which the
 * board paints as it is played.
 *
 * One ladder serves the generator, which lays its arrows on it and keeps a
 * blanked clue only while the board still solves, so its verdict on every
 * intermediate board decides which puzzles exist; `solve()`; `findMistakes`;
 * and the hint, which runs its strikes on the player's notes. No technique supposes anything, so a board
 * the ladder drives to its end is uniquely solved, at every tier.
 */

import type { Dsf } from "../../engine/board/dsf.ts";
import {
  DESC_CONTRADICTORY,
  type DescError,
  type DescParse,
  puzzleDescError,
} from "../../engine/contract/desc-error.ts";
import type { RulesOf } from "../../engine/contract/rules.ts";
import { readDesc } from "../../engine/game-id/desc-reader.ts";
import { liveErrors } from "../../engine/render/live-errors.ts";
import { CellMarks } from "../../engine/solve/cell-marks.ts";
import type { FiringTally } from "../../engine/solve/deduction-fixpoint.ts";
import {
  cluesWhere,
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
import * as rome from "../../generated/games/rome/rome.compiled.ts";
import {
  dirBit,
  EMPTY,
  FM_ARROWMASK,
  FM_GOAL,
  legalDirs,
  placedValues,
  type RomeBoard,
  type RomeParams,
  type RomeState,
  readBoard,
  STATUS_COMPLETE,
  STATUS_INCOMPLETE,
  STATUS_INVALID,
} from "./state.ts";

// --- the rules, read off the board ------------------------------------------

/** The board as its description's rules read it: what the live error marks
 * and Check & Save's rule layer are drawn from. */
export const rules: RulesOf<RomeBoard> = describedRules(rome, {
  grid: placedValues,
  size: (s) => [s.w, s.h],
  deals: (s) => [dealtOf(s)],
});

/** An arrow pointing off the grid, which no square's domain holds. */
const OFF_GRID: rome.RuleName = "domain";
/** An area holding an arrow twice. */
const REPEATED: rome.RuleName = "shape.0";
const LOOP: rome.RuleName = "noLoop";

/** The ways a square breaks a rule. */
export type RuleBreak = "bounds" | "double" | "loop";

/** The squares where `board` breaks a rule, by the way each breaks it. A
 * square leading into a loop breaks the shape too, but only the loop's
 * squares are where it breaks. */
export function ruleBreaks(board: RomeBoard): Record<RuleBreak, ReadonlySet<number>> {
  const live = liveErrors(rules, board);
  const at = (rule: rome.RuleName): ReadonlySet<number> =>
    new Set((live.byRule.get(rule) ?? []).flat());
  return { bounds: at(OFF_GRID), double: at(REPEATED), loop: at(LOOP) };
}

/** `STATUS_INVALID` where `board` already breaks a rule, else
 * `STATUS_COMPLETE` once every square is filled, and `STATUS_INCOMPLETE`
 * before: a whole board that breaks none is an answer. */
export function validity(board: RomeBoard): number {
  const g = rules.grid(board);
  if (rules.violations(board, g).length > 0) return STATUS_INVALID;
  return g.includes(0) ? STATUS_INCOMPLETE : STATUS_COMPLETE;
}

// --- desc validation --------------------------------------------------------

export const ARROWS_ALREADY_SOLVED = puzzleDescError(
  "This game ID's arrows already lead every square to a goal, leaving nothing to solve.",
);
export const REGION_TOO_LARGE = puzzleDescError(
  "This game ID has a region of more than four squares, which four different arrows can't fill.",
);
export const GOAL_NOT_ALONE = puzzleDescError(
  "This game ID puts a goal in a region of more than one square.",
);

/**
 * Upstream `validate_desc` and `new_game` in one reading: decode, reject a
 * description that is already finished or already broken, then reject a region
 * larger than the four distinct arrows it could hold, or a goal outside a
 * single-square region (the last offending square decides which). Lives here
 * rather than beside the codec because its central assertion is a validity
 * verdict. The regions are judged first, since a goal not alone also breaks
 * its clue's rule, and that error says why.
 */
export function parseDesc(p: RomeParams, desc: string): DescParse<RomeState> {
  return readDesc(desc, (r) => {
    const board = readBoard(r, p);
    r.end();
    let result: DescError | null = null;
    for (let i = 0; i < p.w * p.h; i++) {
      const size = board.regions.size(i);
      if (size > 4) result = REGION_TOO_LARGE;
      if (board.grid[i] & FM_GOAL && size > 1) result = GOAL_NOT_ALONE;
    }
    if (result) r.fail(result);

    const status = validity(board);
    if (status === STATUS_COMPLETE) r.fail(ARROWS_ALREADY_SOLVED);
    if (status !== STATUS_INCOMPLETE) r.fail(DESC_CONTRADICTORY);
    return board;
  });
}

// --- the board as the description reads it ---------------------------------

/** A board's areas, kept for the life of the board's areas, which every
 * solve of it shares. */
const areasOf = perBoard((dsf: Dsf, n: number) => partition(dsf.classes(), n));

/** The board as the description deals it: its areas, in the order of their
 * first square, each in reading order, and its goals. */
export function dealtOf(board: RomeBoard): rome.Dealt {
  return {
    area: areasOf(board.regions, board.grid.length),
    goal: cluesWhere(
      board.grid,
      (v) => (v & FM_GOAL) !== 0,
      () => 0,
    ),
  };
}

/**
 * The marks over `grid`, a value a square (an arrow 1 to 4, a goal 5, 0 for
 * none), each square able to hold what its domain admits and each value on
 * it placed and culled; `null` where one is placed where it cannot be (an
 * arrow off the board, or twice in an area). The marks are the solver's own,
 * never the player's notes.
 */
function marksOf(
  board: RomeBoard,
  grid: Uint8Array,
  dl: rome.Dealt,
  ladder: Ladder,
): CellMarks | null {
  const m = new CellMarks(
    describedSpace(rome.units, board.w, board.h),
    rangeMask(1, 5),
    grid,
  );
  m.placing = ladder.placing;
  return m.seed(grid, (c) => rome.domainOf(m.sp, dl, c)) ? m : null;
}

/** Whether `board`'s grid, every square filled, is an answer, by the rules
 * its description compiles to. */
export function isSolved(board: RomeBoard): boolean {
  const grid = placedValues(board);
  return rome.isAnswer(
    grid,
    describedSpace(rome.units, board.w, board.h),
    dealtOf(board),
  );
}

/**
 * Solve `board` in place by the ladder up to `maxdiff`, returning the final
 * `STATUS_*`: its grid takes every arrow the ladder places, and its notes the
 * ladder's candidates. A board whose clues clash leaves each empty square
 * every arrow on the board, as the generator, laying arrows on it, reads.
 */
export function romeSolve(
  board: RomeBoard,
  maxdiff: number,
  firings?: FiringTally,
): number {
  const { w, h, grid, pencil } = board;
  const dl = dealtOf(board);
  const ladder = describedLadder(rome, dl);
  const values = placedValues(board);
  const m = marksOf(board, values, dl, ladder);
  if (m === null) {
    for (let i = 0; i < grid.length; i++)
      pencil[i] =
        grid[i] === EMPTY
          ? legalDirs(i % w, (i / w) | 0, w, h)
          : grid[i] & FM_ARROWMASK;
    return STATUS_INVALID;
  }
  const impossible = runLadder(
    m,
    ladderTechniques(m, ladder.entries, { [TIERS]: maxdiff }, {}),
    { firings },
  );
  let full = true;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === EMPTY) grid[i] = dirBit(values[i]);
    if (grid[i] === EMPTY) full = false;
    let notes = 0;
    for (let d = 1; d <= 4; d++) if (m.has(i, d)) notes |= dirBit(d);
    pencil[i] = notes;
  }
  if (impossible) return STATUS_INVALID;
  if (!full) return STATUS_INCOMPLETE;
  return rome.isAnswer(values, m.sp, dl) ? STATUS_COMPLETE : STATUS_INVALID;
}
