/**
 * Unruly — native TS port of `unruly.c` (the binary puzzle Binairo).
 * Fill the grid with two colors so no row/column has three equal cells
 * in a row and each row/column holds equally many of each; an optional
 * variant also forbids two identical rows or columns.
 *
 * Left-click cycles a cell empty → one (black) → zero (white) → empty;
 * right-click cycles the other way; number keys place directly.
 */

import type { DifficultyContract } from "../../engine/difficulty.ts";
import { winFlash } from "../../engine/flash.ts";
import {
  type Game,
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { commonHintRefusal, DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { CELL, type MarkRef, type Narration } from "../../engine/hint-words.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  digitOf,
  gridCursorMove,
  isCursorMove,
  isEraseKey,
  LEFT_BUTTON,
  MIDDLE_BUTTON,
  newCursor,
  RIGHT_BUTTON,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { Point } from "../../engine/types.ts";
import { type Cell, EMPTY, ONE, ZERO } from "./constants.ts";
import { newDesc, solvableAt } from "./generator.ts";
import { type Marked, say } from "./hint-text.ts";
import {
  border,
  colors,
  computeSize,
  FLASH_TIME,
  newDrawState,
  PLACE_ANIM_TIME,
  PREFERRED_TILE_SIZE,
  redraw,
  type UnrulyDrawState,
} from "./render.ts";
import {
  deduceHintPlan,
  findMistakes,
  type HintReason,
  solveToString,
} from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  newState,
  paramConfig,
  presets,
  status,
  textFormat,
  type UnrulyMistake,
  type UnrulyMove,
  type UnrulyParams,
  type UnrulyState,
  type UnrulyUi,
  validateDesc,
  validateParams,
} from "./state.ts";

function newUi(_state: UnrulyState): UnrulyUi {
  return { cursor: newCursor() };
}

/** The cell value a key/click decided to set (upstream's `c`), or `null`
 * for "no change requested". */
function decideValue(button: number, current: Cell): Cell | null {
  const digit = digitOf(button);
  if (digit === 1) return ONE;
  if (digit === 0 || digit === 2) return ZERO;
  if (isEraseKey(button)) return EMPTY;
  switch (button) {
    case MIDDLE_BUTTON:
      return EMPTY;
    case CURSOR_SELECT2:
    case RIGHT_BUTTON:
      // empty → zero → one → empty
      return current === EMPTY ? ZERO : current === ZERO ? ONE : EMPTY;
    case CURSOR_SELECT:
    case LEFT_BUTTON:
      // empty → one → zero → empty
      return current === EMPTY ? ONE : current === ONE ? ZERO : EMPTY;
    default:
      return null;
  }
}

function interpretMove(
  state: UnrulyState,
  ui: UnrulyUi,
  ds: UnrulyDrawState,
  p: Point,
  rawButton: number,
): UnrulyMove | null | UiUpdate {
  const button = stripModifiers(rawButton);
  const { w2, h2 } = state;
  const ts = ds.tileSize;
  const b = border(ts);

  let hx = ui.cursor.x;
  let hy = ui.cursor.y;
  let nullret: null | UiUpdate = null;

  const isMouse =
    button === LEFT_BUTTON || button === RIGHT_BUTTON || button === MIDDLE_BUTTON;

  if (isMouse) {
    hx = Math.floor((p.x - b) / ts);
    hy = Math.floor((p.y - b) / ts);
    if (hx < 0 || hy < 0 || hx >= w2 || hy >= h2) return null;
    if (ui.cursor.visible) {
      ui.cursor.visible = false;
      nullret = UI_UPDATE;
    }
  }

  // Keyboard cursor movement (clamped, no wrap). An edge no-op still reveals
  // the cursor and repaints.
  if (isCursorMove(button)) {
    const moved = gridCursorMove(button, ui.cursor.x, ui.cursor.y, w2, h2);
    if (moved) {
      ui.cursor.x = moved.x;
      ui.cursor.y = moved.y;
    }
    ui.cursor.visible = true;
    return UI_UPDATE;
  }

  // Placement: a marking key while the cursor is shown, or any mouse click.
  const digit = digitOf(button);
  const isKeyPlace =
    ui.cursor.visible &&
    (button === CURSOR_SELECT ||
      button === CURSOR_SELECT2 ||
      isEraseKey(button) ||
      (digit !== null && digit <= 2));

  if (isKeyPlace || isMouse) {
    const i = hy * w2 + hx;
    if (state.immutable[i]) return nullret;
    const value = decideValue(button, state.grid[i] as Cell);
    if (value === null || state.grid[i] === value) return nullret; // no-op
    return { type: "place", x: hx, y: hy, value };
  }

  return nullret;
}

function flashLength(
  oldState: UnrulyState,
  newState_: UnrulyState,
  _dir: number,
  _ui: UnrulyUi,
): number {
  return winFlash(oldState, newState_, FLASH_TIME);
}

// --- hint -----------------------------------------------------------------

/** Highlight data for an Unruly hint step. `target` is the cell the
 * deduction forces, ringed in `COL_HINT`. `line` is the row or column the
 * sentence names, hatched whatever its cells hold. `outline` cells are the
 * premise cells whose color is the evidence (the same-color pair, the completed
 * quota, the near-complete reserved window, the reference row), outlined in
 * `COL_HINT_REF` so the color that *is* the reason stays visible. Cells are
 * indices into a grid `w2` wide. */
export interface UnrulyHint {
  target: Point & { value: Cell };
  /** The cells of the row or column the sentence calls "this row", hatched
   * (docs/games/hints.md § "Hatch the line the sentence names"). */
  line: number[];
  /** The cited premise cells. */
  outline: number[];
  w2: number;
}

/** Every cell index of a row (`horizontal`) or column. */
function lineCells(
  line: number,
  horizontal: boolean,
  w2: number,
  h2: number,
): number[] {
  const n = horizontal ? w2 : h2;
  const out: number[] = [];
  for (let j = 0; j < n; j++) out.push(horizontal ? line * w2 + j : j * w2 + line);
  return out;
}

const pointOf = (i: number, w2: number): Point => ({
  x: i % w2,
  y: Math.floor(i / w2),
});

/** Narrate *why* the move is forced, per the deduction technique, naming the
 * cells `hl` marks. The words are [`hint-text.ts`](./hint-text.ts)'s. */
function narrate(reason: HintReason, hl: UnrulyHint): Narration {
  const m: Marked = {
    target: hl.target,
    evidence: hl.outline.map((i) => pointOf(i, hl.w2)),
    line: hl.line.map((i) => pointOf(i, hl.w2)),
  };
  switch (reason.kind) {
    case "threes":
      return say.threes(reason, m);
    case "complete":
      return say.complete(reason, m);
    case "unique":
      return say.unique(reason, m);
    case "nearcomplete":
      return say.nearcomplete(reason, m);
  }
}

/** What a step's highlights draw: the `drawn` half of Unruly's legend. */
function unrulyHintMarks(hl: UnrulyHint): MarkRef[] {
  const at = (i: number): Point => pointOf(i, hl.w2);
  return [
    { role: "ring", kind: CELL, elements: [{ x: hl.target.x, y: hl.target.y }] },
    { role: "outline", kind: CELL, elements: hl.outline.map(at) },
    { role: "stripes", kind: CELL, elements: hl.line.map(at) },
  ] as MarkRef[];
}

/** Build the highlight payload for a forced move from its reason: the line the
 * sentence names (hatched) and the premise cells (ringed). */
function buildHighlights(
  reason: HintReason,
  target: UnrulyHint["target"],
  state: UnrulyState,
): UnrulyHint {
  const { w2, h2, grid } = state;

  switch (reason.kind) {
    case "threes":
      return { target, line: [], outline: [...reason.refs], w2 };
    case "complete": {
      const cells = lineCells(reason.line, reason.horizontal, w2, h2);
      // The already-placed `full` cells are the quota the sentence counts.
      return {
        target,
        line: cells,
        outline: cells.filter((i) => grid[i] === reason.full),
        w2,
      };
    }
    case "unique":
      // "This row" is the one being completed; the reference row it would copy
      // is "the outlined row", named by its mark.
      return {
        target,
        line: lineCells(reason.rowB, reason.horizontal, w2, h2),
        outline: lineCells(reason.rowA, reason.horizontal, w2, h2),
        w2,
      };
    case "nearcomplete":
      return {
        target,
        line: lineCells(reason.line, reason.horizontal, w2, h2),
        outline:
          reason.anchor >= 0 ? [...reason.window, reason.anchor] : [...reason.window],
        w2,
      };
  }
}

function hint(state: UnrulyState): HintResult<UnrulyMove, UnrulyHint> {
  const refusal = commonHintRefusal(state.completed, findMistakes(state).length);
  if (refusal) return refusal;
  const plan = deduceHintPlan(state);
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  const steps: HintStep<UnrulyMove, UnrulyHint>[] = plan.map((m) => {
    const value = m.value as Cell;
    const x = m.index % state.w2;
    const y = Math.floor(m.index / state.w2);
    const target = { x, y, value };
    const highlights = buildHighlights(m.reason, target, state);
    const words = narrate(m.reason, highlights);
    return {
      move: { type: "place", x, y, value },
      explanation: words.text,
      words,
      highlights,
      continuesPrevious: m.continuesPrevious,
    };
  });
  return { ok: true, steps };
}

/** A move completes the hint step iff it sets the hinted cell to the hinted
 * value; anything else drops the plan to recompute. */
function hintKeepTrack(
  m: UnrulyMove,
  step: HintStep<UnrulyMove, UnrulyHint>,
): HintTrackVerdict {
  const t = step.highlights?.target;
  const hit =
    m.type === "place" && t && m.x === t.x && m.y === t.y && m.value === t.value;
  return hit ? "completed" : "off";
}

/** Animate a placement that changes exactly one cell (so `solve`'s bulk fill
 * and no-ops stay instant); the midend stretches this to the uniform
 * hint-step duration, so auto-hint reads as continuous fills. */
function animLength(oldState: UnrulyState, newState_: UnrulyState): number {
  let changed = 0;
  const g0 = oldState.grid;
  const g1 = newState_.grid;
  for (let i = 0; i < g0.length; i++) {
    if (g0[i] !== g1[i] && ++changed > 1) return 0;
  }
  return changed === 1 ? PLACE_ANIM_TIME : 0;
}

/** Unruly's difficulty contract (`engine/difficulty.ts`). `solveGame` returns
 * the highest rung that fired, not a verdict, so solvability is read the way
 * the generator reads it, through the shared `solvableAt`. */
const difficulty: DifficultyContract<UnrulyParams> = {
  solveAtCap: (p, desc, cap) => {
    const s = newState(p, desc);
    return solvableAt(s, s.grid, cap) ? "solved" : "unsolved";
  },
};

export const unrulyGame: Game<
  UnrulyParams,
  UnrulyState,
  UnrulyMove,
  UnrulyUi,
  UnrulyDrawState,
  UnrulyMistake,
  UnrulyHint
> = {
  id: "unruly",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions<UnrulyParams>({ w: "w2", h: "h2" }),
  paramConfig,

  newDesc,
  validateDesc,
  newState,
  newUi,

  interpretMove,
  executeMove,
  status,

  difficulty,

  solve(orig) {
    const grid = solveToString(orig);
    if (!grid) return { ok: false, error: "No solution found" };
    return { ok: true, move: { type: "solve", grid } };
  },

  hint,
  hintMarks: {
    roles: {
      ring: "the square to color. It is drawn empty: the sentence says whether it must be black or white.",
      outline:
        "the squares whose colors the step reasons from: the pair that would make three, the full quota, the only places the last one can go, or the row a match would copy.",
      stripes: 'the row or column the sentence calls "this row" or "this column".',
    },
    drawn: unrulyHintMarks,
  },
  hintKeepTrack,
  findMistakes,

  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength,
  flashLength,
};

registerGame(unrulyGame);
