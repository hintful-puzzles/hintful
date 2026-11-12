/**
 * Singles (Hitori) — native TS port of `singles.c`. A grid of numbers in
 * which you blacken cells so that no number repeats among the remaining
 * (white) cells of any row or column, no two black cells are orthogonally
 * adjacent, and the white cells form one connected region. Left-click /
 * select toggles a cell black; right-click / select2 toggles a white mark
 * (circle); clicking a marked cell clears it. A click outside the grid
 * toggles the "show numbers on black squares" preference. Rule violations
 * are highlighted live; Check & Save additionally flags cells that
 * contradict the unique solution.
 */

import { assertNever, rejectMove } from "../../engine/assert-never.ts";
import {
  describedFiringHint,
  type FiringHint,
} from "../../engine/described-firing-hint.ts";
import type { DifficultyContract } from "../../engine/difficulty.ts";
import {
  type Game,
  type PresetBoards,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import { transposeDimensions } from "../../engine/params.ts";
import { SHADED_NAME, UNSHADED_NAME } from "../../engine/piece.ts";
import { isMouseDown, newCursor, stripModifiers } from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import {
  interpretTargetVerbs,
  rulingOut,
  squareGrid,
  type TargetVerbs,
  verbGesture,
} from "../../engine/target-verb.ts";
import type { Point } from "../../engine/types.ts";
import { newSinglesDesc } from "./generator.ts";
import { sentences } from "./hint-text.ts";
import {
  border,
  colors,
  computeSize,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type SinglesDrawState,
} from "./render.ts";
import { SAYS_KINDS, type SaysById } from "./singles.compiled.ts";
import {
  CLEAR,
  COVERED,
  hintWalk,
  inGrid,
  markErrors,
  solveSpecific,
  status,
} from "./solver.ts";
import {
  type CellValue,
  cloneState,
  DIFF_ANY,
  decodeParams,
  defaultParams,
  encodeParams,
  F_BLACK,
  F_CIRCLE,
  makeState,
  newState,
  paramConfig,
  type SinglesMove,
  type SinglesParams,
  type SinglesState,
  type SinglesUi,
  textFormat,
  validateParams,
} from "./state.ts";

/** A cell whose mark contradicts the unique solution (Check & Save). */
export type SinglesMistake = Point;

/** Upstream's five sizes, its 8x8 and 10x10 made upright boards of about
 * their area, each at both tiers. */
const menu: PresetBoards<SinglesParams> = {
  boards: [
    [5, 5],
    [6, 6],
    [7, 9],
    [9, 11],
    [12, 12],
  ].map(([w, h]) => ({ w, h, diff: "easy" })),
};

function newUi(_state: SinglesState): SinglesUi {
  return { cursor: newCursor(), showBlackNums: false };
}

function changedState(
  ui: SinglesUi,
  oldState: SinglesState | null,
  newSt: SinglesState,
): void {
  if (oldState && status(oldState) !== "solved" && status(newSt) === "solved") {
    ui.cursor.visible = false;
  }
}

/** Black out or circle square `{ x, y }`; either clears a square that is
 * already one or the other. */
function mark(value: "black" | "circle") {
  return (state: SinglesState, { x, y }: Point): SinglesMove => {
    const filled = state.flags[y * state.w + x] & (F_BLACK | F_CIRCLE);
    return { sets: [{ x, y, value: filled ? "empty" : value }] };
  };
}

const geometry = squareGrid<SinglesState, SinglesDrawState>({
  size: (s) => s,
  border,
  wrap: true,
});

const targetVerbs: TargetVerbs<
  SinglesState,
  SinglesUi,
  SinglesDrawState,
  Point,
  SinglesMove
> = {
  geometry,
  primary: { does: `turn it ${SHADED_NAME}`, apply: mark("black") },
  secondary: rulingOut({
    does: `circle it, marking a square you are sure should stay ${UNSHADED_NAME}`,
    apply: mark("circle"),
  }),
  sweep: { holds: (s, { x, y }) => s.flags[y * s.w + x] & (F_BLACK | F_CIRCLE) },
};

function interpretMove(
  state: SinglesState,
  ui: SinglesUi,
  ds: SinglesDrawState,
  p: Point,
  rawButton: number,
): SinglesMove | null | UiUpdate {
  // Any press outside the grid flips the "numbers on black squares" setting.
  if (
    isMouseDown(stripModifiers(rawButton)) &&
    geometry.pointerTarget(state, ds, p, ui) === null
  ) {
    ui.cursor.visible = false;
    ui.showBlackNums = !ui.showBlackNums;
    return UI_UPDATE;
  }
  return interpretTargetVerbs(targetVerbs, state, ui, ds, p, rawButton);
}

function executeMove(state: SinglesState, move: SinglesMove): SinglesState {
  // A move is a list of cell settings, not a union, so there is no discriminant
  // to narrow to `never`: check the one field the dispatch reads.
  if (!Array.isArray(move.sets)) rejectMove(move, "singles: executeMove");

  const next = cloneState(state);
  for (const { x, y, value } of move.sets) {
    if (!inGrid(next, x, y)) throw new Error("singles move out of bounds");
    const i = y * next.w + x;
    next.flags[i] &= ~(F_BLACK | F_CIRCLE);
    // `value` *is* a union, so an unrecognized one is rejected rather than
    // read as "empty".
    if (value === "black") next.flags[i] |= F_BLACK;
    else if (value === "circle") next.flags[i] |= F_CIRCLE;
    else if (value !== "empty") assertNever(value, `singles: executeMove (${x},${y})`);
  }
  markErrors(next);
  return next;
}

/** The mark a player has put on cell `i`. */
function cellValue(s: SinglesState, i: number): CellValue {
  const f = s.flags[i];
  return f & F_BLACK ? "black" : f & F_CIRCLE ? "circle" : "empty";
}

/** The B/C/E diff between two states (upstream game_state_diff). */
function diffMove(src: SinglesState, dst: SinglesState): SinglesMove {
  const sets: SinglesMove["sets"] = [];
  for (let x = 0; x < dst.w; x++) {
    for (let y = 0; y < dst.h; y++) {
      const value = cellValue(dst, y * dst.w + x);
      if (cellValue(src, y * dst.w + x) !== value) sets.push({ x, y, value });
    }
  }
  return { sets, solve: true };
}

function solve(orig: SinglesState, curr: SinglesState): SolveResult<SinglesMove> {
  let solved = cloneState(curr);
  if (solveSpecific(solved, DIFF_ANY) > 0) {
    return { ok: true, move: diffMove(curr, solved) };
  }
  solved = cloneState(orig);
  if (solveSpecific(solved, DIFF_ANY) > 0) {
    return { ok: true, move: diffMove(curr, solved) };
  }
  return { ok: false, error: PUZZLE_NOT_REASONABLE };
}

function findMistakes(state: SinglesState): readonly SinglesMistake[] {
  const solved = makeState(state.w, state.h, state.nums);
  if (solveSpecific(solved, DIFF_ANY) <= 0) return [];
  const out: SinglesMistake[] = [];
  for (let i = 0; i < state.n; i++) {
    const pv = state.flags[i] & (F_BLACK | F_CIRCLE);
    if (!pv) continue; // undecided cells are never mistakes
    const sv = solved.flags[i] & (F_BLACK | F_CIRCLE);
    if (pv !== sv) out.push({ x: i % state.w, y: (i / state.w) | 0 });
  }
  return out;
}

/** Each wrong square emptied, in one move. */
function clearMistakes(
  _state: SinglesState,
  mistakes: readonly SinglesMistake[],
): SinglesMove[] {
  const sets = mistakes.map(({ x, y }) => ({ x, y, value: "empty" as const }));
  return sets.length === 0 ? [] : [{ sets }];
}

// --- hint ------------------------------------------------------------------

/** A square a hint step decides, with the mark it asks for. */
export interface SinglesTarget extends Point {
  value: "black" | "circle";
}

/** Highlight data for a Singles hint step. `targets` are the squares the
 * firing decides, each with the mark it asks for; a firing that decides
 * several at once carries them all. `strand` is the distinct corner a
 * corner deduction keeps from being sealed off, which `redraw` draws in its
 * own color so the player can tell it from the matching numbers. */
export type SinglesHint = FiringHint<SinglesTarget>;

export type SinglesRung = (typeof SAYS_KINDS)[number];

/** What a cell holds as the description reads it. */
const valueAt = (s: SinglesState, i: number): number => {
  const v = cellValue(s, i);
  return v === "black" ? COVERED : v === "circle" ? CLEAR : 0;
};

/** The hint: the ladder's firings, a step each, built by the engine from what
 * the description says of them (`singles.description.yaml`). */
const described = describedFiringHint<
  SinglesState,
  SinglesMove,
  SinglesTarget,
  SaysById,
  SinglesRung
>({
  name: "singles hint",
  walk: hintWalk,
  width: (s) => s.w,
  size: (s) => s.n,
  valueAt,
  execute: executeMove,
  foreign: (m) => m.solve === true,
  target: (at, n) => ({ ...at, value: n === COVERED ? "black" : "circle" }),
  want: (t) => (t.value === "black" ? COVERED : CLEAR),
  move: (targets) => ({ sets: targets.map((t) => ({ ...t })) }),
  say: sentences,
});

/** Singles' difficulty contract (`engine/difficulty.ts`). `solveSpecific`
 * returns > 0 when it solves; `newState` builds the board from the desc
 * alone, so no player mark reaches the verdict. */
const difficulty: DifficultyContract<SinglesParams> = {
  solveAtCap: (p, desc, cap) =>
    solveSpecific(newState(p, desc), cap) > 0 ? "solved" : "unsolved",
};

export const singlesGame: Game<
  SinglesParams,
  SinglesState,
  SinglesMove,
  SinglesUi,
  SinglesDrawState,
  SinglesMistake,
  SinglesHint,
  SinglesRung
> = {
  id: "singles",

  defaultParams,
  menu,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newSinglesDesc,
  newState,
  newUi,
  changedState,

  interpretMove,
  targetVerbs,
  executeMove,
  status,

  solve,
  difficulty,
  hint: described.hint,
  hintRungs: SAYS_KINDS,
  hintMarks: {
    roles: {
      ring: "the square the step decides. It is drawn empty: the sentence says whether to shade it or circle it.",
      outline:
        "the squares the step reasons from, such as two matching numbers one square apart. One you have already shaded or circled is outlined as well, and so is the corner a step keeps from being boxed in.",
      stripes: 'the row or column the sentence calls "this row" or "this column".',
    },
  },
  hintKeepTrack: described.hintKeepTrack,
  hintGesture: (s, ui, ds, m) =>
    m.sets.flatMap((t) =>
      verbGesture(
        targetVerbs,
        s,
        ds,
        ui,
        [t],
        t.value === "black" ? "primary" : "secondary",
      ),
    ),
  findMistakes,
  clearMistakes,

  textFormat,

  prefs: [
    {
      kw: "show-black-nums",
      name: `Show numbers on ${SHADED_NAME} squares`,
      type: "boolean",
      get: (ui) => ui.showBlackNums,
      set: (ui, v) => {
        ui.showBlackNums = v;
      },
    },
  ],

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
};

registerGame(singlesGame);
