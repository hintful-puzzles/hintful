/**
 * Range (Kurodoko / Kuromasu) — native TS port of `range.c`. Numbered
 * clues state how many white squares are visible from them in a straight
 * line (counting the clue once); paint squares black so no two blacks
 * touch, the whites stay connected, and every clue is satisfied.
 *
 * Left-click / select cycles a non-clue cell empty → black → white →
 * empty; right-click / select2 cycles the other way. White is the
 * player's optional "this is white" cross. Errors (rule violations) are
 * highlighted live; Check & Save additionally flags cells that
 * contradict the unique solution.
 */

import { searchTierContract, solveFromAnswer } from "../../engine/answer-search.ts";
import {
  type Game,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { SHADED_NAME } from "../../engine/piece.ts";
import {
  cursorDelta,
  MOD_SHFT,
  newCursor,
  showCursor,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  interpretTargetVerbs,
  rulingOut,
  squareGrid,
  type TargetVerbs,
  verbGesture,
} from "../../engine/target-verb.ts";
import type { GameStatus, Point } from "../../engine/types.ts";
import {
  type RangeHint,
  rangeHint,
  rangeKeepTrack,
  rangeRefreshHintStep,
} from "./hint.ts";
import {
  border,
  colors,
  computeSize,
  newDrawState,
  PREFERRED_TILE_SIZE,
  type RangeDrawState,
  redraw,
} from "./render.ts";
import {
  answerOf,
  deductionFinishes,
  generateGrid,
  isSolved,
  RANGE_RUNGS,
  type RangeRung,
} from "./solver.ts";
import {
  BLACK,
  type Cell,
  decodeParams,
  defaultParams,
  EMPTY,
  encodeDesc,
  encodeParams,
  executeMove,
  gridValueToCell,
  idx,
  menu,
  newState,
  outOfBounds,
  paramConfig,
  type RangeCellValue,
  type RangeMove,
  type RangeParams,
  type RangeState,
  type RangeUi,
  textFormat,
  validateParams,
  WHITE,
} from "./state.ts";

export type RangeMistake = Cell;

function newUi(_state: RangeState): RangeUi {
  return { cursor: newCursor() };
}

/** The forward (right-button) cycle; a backward step is two forward ones. */
const CYCLE: RangeCellValue[] = ["empty", "white", "black"];

/** The mark a non-clue cell becomes under a forward or backward cycle. */
function cycle(cell: number, forwards: boolean): RangeCellValue {
  const i = CYCLE.indexOf(gridValueToCell(cell));
  return CYCLE[(i + (forwards ? 1 : 2)) % 3];
}

/** Cycle the non-clue square `{ x, y }` one way round. The cursor is (x, y),
 * transposed from Range's own `(r, c)` here (see `RangeUi`). */
function cycleAt(forwards: boolean) {
  return (state: RangeState, { x: c, y: r }: Point): RangeMove | null => {
    const cell = state.grid[idx(r, c, state.w)];
    if (cell > 0) return null; // clue cell — inert
    return { sets: [{ r, c, value: cycle(cell, forwards) }] };
  };
}

const targetVerbs: TargetVerbs<RangeState, RangeUi, RangeDrawState, Point, RangeMove> =
  {
    geometry: squareGrid({ size: (s) => s, border }),
    primary: { does: `color it ${SHADED_NAME}`, apply: cycleAt(false) },
    secondary: rulingOut({
      does: `mark it with a cross, if you know it should not be ${SHADED_NAME}`,
      apply: cycleAt(true),
    }),
    sweep: { holds: (s, { x: c, y: r }) => s.grid[idx(r, c, s.w)] },
  };

function interpretMove(
  state: RangeState,
  ui: RangeUi,
  ds: RangeDrawState,
  p: Point,
  rawButton: number,
): RangeMove | null | UiUpdate {
  const { w, h, grid } = state;
  const delta = cursorDelta(stripModifiers(rawButton));
  if (delta && rawButton & MOD_SHFT) {
    // A shifted arrow *crosses* the cells it passes, which is too much to do to
    // a player who cannot yet see the cursor — that one still only reveals.
    if (showCursor(ui.cursor)) return UI_UPDATE;
    const dr = delta.dy;
    const dc = delta.dx;
    const preR = ui.cursor.y;
    const preC = ui.cursor.x;
    const doPre = grid[idx(preR, preC, w)] === EMPTY;
    if (outOfBounds(ui.cursor.y + dr, ui.cursor.x + dc, w, h)) {
      return doPre ? { sets: [{ r: preR, c: preC, value: "white" }] } : null;
    }
    ui.cursor.y += dr;
    ui.cursor.x += dc;
    const doPost = grid[idx(ui.cursor.y, ui.cursor.x, w)] === EMPTY;
    const sets: RangeMove["sets"] = [];
    if (doPre) sets.push({ r: preR, c: preC, value: "white" });
    if (doPost) sets.push({ r: ui.cursor.y, c: ui.cursor.x, value: "white" });
    return sets.length > 0 ? { sets } : UI_UPDATE;
  }
  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

/** Solved: every rule met, an undecided cell counting as clear. */
function status(s: RangeState): GameStatus {
  return isSolved(s.grid, s.w, s.h) ? "solved" : "ongoing";
}

function solve(orig: RangeState, _curr: RangeState): SolveResult<RangeMove> {
  return solveFromAnswer(answerOf(orig), (solution) => {
    const sets: RangeMove["sets"] = [];
    for (let r = 0; r < orig.h; r++) {
      for (let c = 0; c < orig.w; c++) {
        const v = solution[idx(r, c, orig.w)];
        if (v <= 0) sets.push({ r, c, value: gridValueToCell(v) });
      }
    }
    return { solve: true, sets };
  });
}

function findMistakes(state: RangeState): readonly RangeMistake[] {
  const answer = answerOf(state);
  if (answer.kind !== "one") return [];
  const solution = answer.solution;
  const out: RangeMistake[] = [];
  for (let r = 0; r < state.h; r++) {
    for (let c = 0; c < state.w; c++) {
      const cell = idx(r, c, state.w);
      const v = state.grid[cell];
      // Only a decided mark can be a mistake; clues and undecided cells never are.
      if ((v === BLACK || v === WHITE) && solution[cell] !== v) out.push({ r, c });
    }
  }
  return out;
}

/** Each wrong square made undecided again, in one move. */
function clearMistakes(
  _state: RangeState,
  mistakes: readonly RangeMistake[],
): RangeMove[] {
  const sets = mistakes.map(({ r, c }) => ({ r, c, value: "empty" as const }));
  return sets.length === 0 ? [] : [{ sets }];
}

/** The answer's first undecided square: a shaded one while any is left,
 * before the dotted ones, which are the ruling-out mark. */
function revealOne(state: RangeState, solved: RangeState): RangeMove | null {
  for (const value of [BLACK, WHITE]) {
    const at = state.grid.findIndex((v, i) => v === EMPTY && solved.grid[i] === value);
    if (at >= 0)
      return {
        sets: [
          {
            r: Math.floor(at / state.w),
            c: at % state.w,
            value: gridValueToCell(value),
          },
        ],
      };
  }
  return null;
}

export const rangeGame: Game<
  RangeParams,
  RangeState,
  RangeMove,
  RangeUi,
  RangeDrawState,
  RangeMistake,
  RangeHint,
  RangeRung
> = {
  id: "range",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: (p, rng) => ({ desc: encodeDesc(p.w * p.h, generateGrid(p, rng)) }),
  newState,
  newUi,

  interpretMove,
  targetVerbs,
  executeMove,
  status,

  solve,
  // Easy is what the generator's test passes: the three rules decide every
  // cell, and they are the hint's rules.
  difficulty: searchTierContract<RangeParams, RangeState>({
    newState,
    deductionFinishes: (s) => deductionFinishes(s.clues, s.w, s.h),
    answerOf,
  }),
  hint: rangeHint,
  hintRungs: RANGE_RUNGS,
  hintMarks: {
    roles: {
      ring: "the cell the step decides.",
      outline: `what the step reasons from: the cells a clue already sees, the cells around one that ${SHADED_NAME} would cut off, or a ${SHADED_NAME} square beside it, which takes a doubled outline. The clue the step counts from has its number drawn in the hint color.`,
      stripes:
        "the run a clue has to see along, from the clue as far as the ringed cell.",
    },
  },
  hintKeepTrack: rangeKeepTrack,
  refreshHintStep: rangeRefreshHintStep,
  hintGesture: (s, ui, ds, m) => {
    const [{ r, c, value }] = m.sets;
    // The cycle has three states, so a left click reaches one of the other two
    // and a right click the other.
    const back = cycle(s.grid[idx(r, c, s.w)], false) === value;
    const target = { x: c, y: r };
    return verbGesture(
      targetVerbs,
      s,
      ds,
      ui,
      [target],
      back ? "primary" : "secondary",
    );
  },
  findMistakes,
  clearMistakes,
  revealOne,

  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};

registerGame(rangeGame);
