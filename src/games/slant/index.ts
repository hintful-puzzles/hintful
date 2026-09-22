/**
 * Slant — native TS port of `slant.c` (Gokigen Naname). Fill every square
 * with a `/` or `\` diagonal so each vertex clue counts its incident
 * diagonals and no closed loop forms.
 *
 * Left-click cycles a square blank → `\` → `/` → blank; right-click the
 * reverse (swappable via the mouse-button-order preference); `\`, `/` and
 * backspace place directly at the keyboard cursor.
 *
 * **Notes mode** (`ui.pencilMode`, toggled by the collection's Marks key and
 * the app's bare `P`) marks two squares that share a side as slanting alike:
 * a tap toggles the mark on the side nearest it, and Enter pins a square and
 * then toggles the mark between it and a neighbor.
 */

import type { DifficultyContract } from "../../engine/difficulty.ts";
import { winFlash } from "../../engine/flash.ts";
import type { Game, SolveResult, UiUpdate } from "../../engine/game.ts";
import { UI_UPDATE } from "../../engine/game.ts";
import { fromCoord } from "../../engine/geometry.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  hideCursor,
  isCancelKey,
  isCursorMove,
  isEraseKey,
  LEFT_BUTTON,
  moveCursor,
  newCursor,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
  showCursor,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { Point } from "../../engine/types.ts";
import { newDesc } from "./generator.ts";
import { slantHint, slantHintKeepTrack } from "./hint.ts";
import {
  border,
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
  type SlantDrawState,
} from "./render.ts";
import {
  SOLVE_IMPOSSIBLE,
  SOLVE_UNIQUE,
  SolverScratch,
  slantSolve,
  solveFromClues,
} from "./solver.ts";
import {
  ALIKE_DOWN,
  ALIKE_RIGHT,
  type AlikeDir,
  alikeBit,
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  newState,
  paramConfig,
  presets,
  type SlantMistake,
  type SlantMove,
  type SlantParams,
  type SlantState,
  type SlantUi,
  type Slash,
  status,
  textFormat,
  validateDesc,
  validateParams,
} from "./state.ts";

function newUi(_state: SlantState): SlantUi {
  return {
    cursor: newCursor(),
    pencilMode: false,
    pin: null,
    swapButtons: false,
    fadeGrounded: false,
  };
}

const KEY_BACKSLASH = 92;
const KEY_SLASH = 47;

/** Cycle a square's value: left-click runs blank→`\`→`/`→blank
 * ("clockwise"), right-click the reverse. */
function cycle(current: number, clockwise: boolean): Slash {
  const v = clockwise ? current - 1 : current + 1;
  if (v < -1) return 1;
  if (v > 1) return -1;
  return v as Slash;
}

function interpretMove(
  state: SlantState,
  ui: SlantUi,
  ds: SlantDrawState,
  p: Point,
  rawButton: number,
): SlantMove | null | UiUpdate {
  const button = stripModifiers(rawButton);
  const { w, h } = state;

  if (button === PENCIL_MODE_BUTTON) {
    ui.pencilMode = !ui.pencilMode;
    ui.pin = null;
    return UI_UPDATE;
  }

  if (button === LEFT_BUTTON || button === RIGHT_BUTTON) {
    const ts = ds.tileSize;
    const x = fromCoord(p.x, ts, border(ts));
    const y = fromCoord(p.y, ts, border(ts));
    if (x < 0 || y < 0 || x >= w || y >= h) return null;
    hideCursor(ui.cursor);
    if (ui.pencilMode) {
      // The mark on the square's side nearest the tap: the diagonals cut the
      // square into four triangles, one per side.
      const fx = (p.x - border(ts)) / ts - x;
      const fy = (p.y - border(ts)) / ts - y;
      const side = [fx, 1 - fx, fy, 1 - fy];
      const near = side.indexOf(Math.min(...side));
      const [nx, ny] = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ][near];
      return toggleMark(state, { x, y }, { x: nx, y: ny });
    }
    return {
      type: "set",
      x,
      y,
      v: cycle(state.soln[y * w + x], (button === LEFT_BUTTON) !== ui.swapButtons),
    };
  }

  if (button === CURSOR_SELECT || button === CURSOR_SELECT2) {
    if (showCursor(ui.cursor)) return UI_UPDATE;
    const { x, y } = ui.cursor;
    if (ui.pencilMode) {
      const pin = ui.pin;
      if (pin !== null && Math.abs(pin.x - x) + Math.abs(pin.y - y) === 1) {
        ui.pin = null;
        return toggleMark(state, pin, { x, y }) ?? UI_UPDATE;
      }
      ui.pin = pin !== null && pin.x === x && pin.y === y ? null : { x, y };
      return UI_UPDATE;
    }
    return {
      type: "set",
      x,
      y,
      v: cycle(state.soln[y * w + x], button === CURSOR_SELECT),
    };
  }

  if (isCursorMove(button)) {
    moveCursor(ui.cursor, button, w, h);
    return UI_UPDATE;
  }

  if (button === KEY_BACKSLASH || button === KEY_SLASH || isEraseKey(button)) {
    const { x, y } = ui.cursor;
    const v: Slash = button === KEY_BACKSLASH ? -1 : button === KEY_SLASH ? 1 : 0;
    if (state.soln[y * w + x] === v) return null;
    return { type: "set", x, y, v };
  }

  // Erase keys set the square above, so only Escape reaches this.
  if (isCancelKey(button) && ui.pin !== null) {
    ui.pin = null;
    return UI_UPDATE;
  }

  return null;
}

/** The mark joining two squares that share a side, as `alike` stores it. */
function markBetween(a: Point, b: Point): { x: number; y: number; dir: AlikeDir } {
  const lo = a.y < b.y || (a.y === b.y && a.x < b.x) ? a : b;
  return { x: lo.x, y: lo.y, dir: a.y === b.y ? "right" : "down" };
}

/** Toggle the mark between `a` and its neighbor `b`, or nothing when `b` is
 * off the board. */
function toggleMark(state: SlantState, a: Point, b: Point): SlantMove | null {
  const { w, h } = state;
  if (b.x < 0 || b.y < 0 || b.x >= w || b.y >= h) return null;
  const mark = markBetween(a, b);
  const on = (state.alike[mark.y * w + mark.x] & alikeBit(mark.dir)) === 0;
  return { type: "alike", ...mark, on };
}

function solve(
  orig: SlantState,
  _curr: SlantState,
  aux?: string,
): SolveResult<SlantMove> {
  if (aux && aux.length === orig.w * orig.h) {
    return { ok: true, move: { type: "solve", grid: aux } };
  }
  const result = solveFromClues(orig.w, orig.h, orig.clues);
  if ("error" in result) {
    return {
      ok: false,
      error:
        result.error === "impossible"
          ? "This puzzle is not self-consistent"
          : "Unable to find a unique solution for this puzzle",
    };
  }
  const grid = Array.from(result.soln, (s) => (s < 0 ? "\\" : "/")).join("");
  return { ok: true, move: { type: "solve", grid } };
}

/** Generated boards are uniquely solvable by the full solver: re-solve the
 * clues and flag every placed diagonal, and every same-slant mark, that
 * contradicts the unique solution. Blank squares are never mistakes; a
 * non-uniquely-solvable (hand-typed) board degrades to "no detectable
 * mistakes". */
function findMistakes(state: SlantState): readonly SlantMistake[] {
  const { w, h } = state;
  const result = solveFromClues(w, h, state.clues);
  if ("error" in result) return [];
  const sol = result.soln;
  const out: SlantMistake[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const s = state.soln[i];
      if (s !== 0 && s !== sol[i]) out.push({ x, y });
      const marks = state.alike[i];
      if (marks & ALIKE_RIGHT && sol[i] !== sol[i + 1])
        out.push({ x, y, dir: "right" });
      if (marks & ALIKE_DOWN && sol[i] !== sol[i + w]) out.push({ x, y, dir: "down" });
    }
  }
  return out;
}

const difficulty: DifficultyContract<SlantParams> = {
  tierOf: (p) => p.diff,
  withTier: (p, tier) => ({ ...p, diff: tier }),
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    const soln = new Int8Array(s.w * s.h);
    const ret = slantSolve(s.w, s.h, s.clues, soln, new SolverScratch(s.w, s.h), cap);
    if (ret === SOLVE_UNIQUE) return "solved";
    return ret === SOLVE_IMPOSSIBLE ? "impossible" : "unsolved";
  },
};

export const slantGame: Game<
  SlantParams,
  SlantState,
  SlantMove,
  SlantUi,
  SlantDrawState,
  SlantMistake
> = {
  id: "slant",
  wantsStatusbar: false,
  isTimed: false,
  canSolve: true,
  canFormatAsText: true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,
  describeParams: (p) => ({
    width: String(p.w),
    height: String(p.h),
    difficulty: p.diff,
  }),

  newDesc,
  validateDesc,
  newState,
  newUi,

  interpretMove,
  executeMove,
  status,

  solve,
  difficulty,
  findMistakes,
  hint: (state) => slantHint(state, findMistakes(state).length),
  hintKeepTrack: slantHintKeepTrack,

  textFormat,

  prefs: [
    {
      kw: "left-button",
      name: "Mouse button order",
      type: "choices",
      choices: ["Left \\, right /", "Left /, right \\"],
      get: (ui) => (ui.swapButtons ? 1 : 0),
      set: (ui, v) => {
        ui.swapButtons = v === 1;
      },
    },
    {
      kw: "fade-grounded",
      name: "Fade grounded components",
      type: "boolean",
      get: (ui) => ui.fadeGrounded,
      set: (ui, v) => {
        ui.fadeGrounded = v;
      },
    },
  ],

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  flashLength: (a, b) => winFlash(a, b, FLASH_TIME),
};

registerGame(slantGame);
