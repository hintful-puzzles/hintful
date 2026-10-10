/**
 * Filling (Fillomino) — port of `filling.c`. Fill every cell with a number
 * `n` so that each maximal orthogonally-connected region of equal numbers
 * contains exactly `n` cells.
 *
 * Input is selection-based: left-click / left-drag (or the keyboard cursor
 * with multi-select) build a selection, then a digit key fills every selected
 * non-clue cell.
 */

import {
  type Game,
  type HintResult,
  type HintStep,
  type HintTrackVerdict,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { coord, fromCoord } from "../../engine/geometry.ts";
import { hintAndSolveFinish } from "../../engine/hint-finishes.ts";
import { drag, key, type PointerAction } from "../../engine/hint-gesture.ts";
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { changedCells, trackTargets } from "../../engine/hint-track.ts";
import { CELL, type Sentence } from "../../engine/hint-words.ts";
import { digitKeyCode, digitKeys } from "../../engine/key-labels.ts";
import { transposeDimensions } from "../../engine/params.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  digitOf,
  ESCAPE,
  gridCursorMove,
  isCursorMove,
  isEraseKey,
  LEFT_BUTTON,
  LEFT_DRAG,
  newCursor,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { KeyLabel, Point, Size } from "../../engine/types.ts";
import { newFillingDesc } from "./generator.ts";
import { type Marked, say } from "./hint-text.ts";
import {
  border,
  colors,
  computeSize,
  type FillingDrawState,
  FLASH_TIME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redrawFilling,
} from "./render.ts";
import {
  deduceHintPlan,
  FILLING_RUNGS,
  type FillingHintReason,
  type FillingRung,
  solveFilling,
} from "./solver.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  executeMove,
  type FillingMove,
  type FillingParams,
  type FillingState,
  type FillingUi,
  newState,
  paramConfig,
  presets,
  status,
  textFormat,
  validateParams,
} from "./state.ts";

function newUi(_state: FillingState): FillingUi {
  return { sel: null, cursor: newCursor(), keydragging: false };
}

function changedState(
  ui: FillingUi,
  _old: FillingState | null,
  _new: FillingState,
): void {
  // Clear any selection after a committed move (upstream game_changed_state).
  ui.sel = null;
  ui.keydragging = false;
}

/** Add cell `(x, y)` to the selection (if it isn't a clue). */
function selectCell(ui: FillingUi, state: FillingState, x: number, y: number): void {
  if (!ui.sel) ui.sel = new Set();
  const i = y * state.w + x;
  if (!state.clues[i]) ui.sel.add(i);
}

function interpretMove(
  state: FillingState,
  ui: FillingUi,
  ds: FillingDrawState,
  p: Point,
  rawButton: number,
): FillingMove | null | UiUpdate {
  const button = stripModifiers(rawButton);
  const { w, h, clues, board } = state;
  const ts = ds.tileSize;
  const tx = fromCoord(p.x, ts, border(ts));
  const ty = fromCoord(p.y, ts, border(ts));

  if (button === LEFT_BUTTON || button === LEFT_DRAG) {
    if (button === LEFT_BUTTON) ui.sel = null;
    if (tx >= 0 && tx < w && ty >= 0 && ty < h) selectCell(ui, state, tx, ty);
    ui.cursor.visible = false;
    return UI_UPDATE;
  }

  if (isCursorMove(button)) {
    ui.cursor.visible = true;
    const moved = gridCursorMove(button, ui.cursor.x, ui.cursor.y, w, h);
    if (moved) {
      ui.cursor.x = moved.x;
      ui.cursor.y = moved.y;
    }
    if (ui.keydragging) selectCell(ui, state, ui.cursor.x, ui.cursor.y);
    return UI_UPDATE;
  }

  if (button === CURSOR_SELECT) {
    if (!ui.cursor.visible) {
      ui.cursor.visible = true;
      return UI_UPDATE;
    }
    ui.keydragging = !ui.keydragging;
    if (ui.keydragging) selectCell(ui, state, ui.cursor.x, ui.cursor.y);
    return UI_UPDATE;
  }

  if (button === CURSOR_SELECT2) {
    if (!ui.cursor.visible) {
      ui.cursor.visible = true;
      return UI_UPDATE;
    }
    if (!ui.sel) ui.sel = new Set();
    ui.keydragging = false;
    const ci = ui.cursor.y * w + ui.cursor.x;
    if (!clues[ci]) {
      if (ui.sel.has(ci)) ui.sel.delete(ci);
      else ui.sel.add(ci);
    }
    if (ui.sel.size === 0) ui.sel = null;
    return UI_UPDATE;
  }

  if (button === ESCAPE) {
    ui.sel = null;
    ui.keydragging = false;
    return UI_UPDATE;
  }

  // A digit (an erase key ≡ '0') fills the selection, or the cursor cell.
  const value = isEraseKey(button) ? 0 : digitOf(button);
  if (value === null) return null; // not a digit → unused
  if (value > (w === 2 && h === 2 ? 3 : Math.max(w, h))) return null;
  ui.keydragging = false;

  const cells: number[] = [];
  for (let i = 0; i < w * h; i++) {
    const targeted =
      (ui.sel?.has(i) ?? false) ||
      (!ui.sel && ui.cursor.visible && ui.cursor.y * w + ui.cursor.x === i);
    if (!targeted) continue;
    if (clues[i] !== 0) continue; // cursor may rest on a clue
    if (board[i] !== value) cells.push(i);
  }
  const move: FillingMove | null =
    cells.length > 0 ? { type: "set", cells, value } : null;

  if (!ui.sel) return move; // no selection: a move, or nothing happened
  ui.sel = null; // selection consumed; redraw even if nothing changed
  return move ?? UI_UPDATE;
}

function solve(orig: FillingState): SolveResult<FillingMove> {
  const { w, h, clues } = orig;
  const { solved, board } = solveFilling(clues, w, h);
  if (!solved) return { ok: false, error: PUZZLE_NOT_REASONABLE };
  return { ok: true, move: { type: "solve", board: board.join("") } };
}

/** Re-solve from the immutable clues and flag every player-filled cell whose
 * number contradicts the unique solution (the Check & Save divergence). */
function findMistakes(state: FillingState): readonly Point[] {
  const { w, h, board, clues } = state;
  const { solved, board: solution } = solveFilling(clues, w, h);
  if (!solved) return [];
  const out: Point[] = [];
  for (let i = 0; i < w * h; i++) {
    if (clues[i] === 0 && board[i] !== 0 && board[i] !== solution[i]) {
      out.push({ x: i % w, y: (i / w) | 0 });
    }
  }
  return out;
}

// --- hint ------------------------------------------------------------------

/** Plan data for a Filling hint step, read by `hintKeepTrack`. `cells` are the
 * empty squares the deduction forces (a single firing usually pins a group),
 * as grid indices, and `value` the forced number, never drawn: the narration
 * names it ("the region of N", "a 1"). */
export interface FillingHint {
  cells: number[];
  value: number;
}

/** A growth or blocked step is about one region, which is its hatch. */
const namesRegion = (reason: FillingHintReason): boolean =>
  reason.kind === "growth" || reason.kind === "blocked";

const pointOf = (i: number, w: number): Point => ({ x: i % w, y: (i / w) | 0 });

/** Narrate *why* the squares are forced, per the technique that fired. The
 * forced `cells` are ringed; `region` is the region the sentence is about
 * ("the striped region of N"), and `evidence` the neighbors that pin a lonely
 * or eliminated cell, outlined, so the player sees the reasoning, not just the
 * conclusion (docs/games/hints.md § "Hatch the line the sentence names"). All
 * are indices into a grid `w` wide. The words are
 * [`hint-text.ts`](./hint-text.ts)'s. */
function narrate(
  reason: FillingHintReason,
  w: number,
  cells: readonly number[],
  region: readonly number[],
  evidence: readonly number[],
): Sentence {
  const at = (i: number): Point => pointOf(i, w);
  const m: Marked = {
    cells: cells.map(at),
    region: region.map(at),
    evidence: evidence.map(at),
  };
  switch (reason.kind) {
    case "growth":
      return say.growth(reason.n, reason.exact, m);
    case "blocked":
      return say.blocked(reason.n, m);
    case "lonely":
      return say.lonely(m);
    case "bitmap":
      return say.bitmap(reason.n, m);
  }
}

function hint(state: FillingState): HintResult<FillingMove, FillingHint, FillingRung> {
  const plan = deduceHintPlan(state.board, state.clues, state.w, state.h);
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  const w = state.w;
  const steps: HintStep<FillingMove, FillingHint, FillingRung>[] = plan.map((m) => {
    const highlights: FillingHint = { cells: m.cells, value: m.value };
    const words = namesRegion(m.reason)
      ? narrate(m.reason, w, m.cells, m.area, [])
      : narrate(m.reason, w, m.cells, [], m.area);
    return {
      move: { type: "set", cells: m.cells, value: m.value },
      rung: m.reason.kind,
      explanation: words.text,
      words,
      highlights,
    };
  });
  return { ok: true, steps };
}

/** Select the step's squares with one drag that visits only them, then type
 * the number: a press starts a fresh selection, and a drag adds just the
 * squares it passes over. */
function hintGesture(
  state: FillingState,
  _ui: FillingUi,
  ds: FillingDrawState,
  move: FillingMove,
): readonly PointerAction[] {
  if (move.type !== "set" || move.cells.length === 0) return [];
  const ts = ds.tileSize;
  const mid = (v: number): number => coord(v, ts, border(ts)) + (ts >> 1);
  const [first, ...rest] = move.cells.map((i) => ({
    x: mid(i % state.w),
    y: mid((i / state.w) | 0),
  }));
  const last = rest.pop() ?? first;
  return [drag(first, last, { through: rest }), key(digitKeyCode(move.value))];
}

/** Classify a player move by what it did to the board
 * (`engine/hint-track.ts`); a multi-square step shrinks in place so a later
 * auto-hint fills only the rest. */
function hintKeepTrack(
  m: FillingMove,
  step: HintStep<FillingMove, FillingHint, FillingRung>,
  state: FillingState,
): HintTrackVerdict {
  const t = step.highlights;
  if (m.type !== "set" || !t) return "off";
  const after = executeMove(state, m);
  const { verdict, left } = trackTargets({
    targets: t.cells,
    changes: changedCells(
      state.board.length,
      (i) => state.board[i],
      (i) => after.board[i],
    ),
    key: (c) => c,
    want: () => t.value,
    holds: (c) => after.board[c] === t.value,
  });
  if (verdict === "onTrack") {
    step.highlights = { ...t, cells: left };
    step.move = { type: "set", cells: left, value: t.value };
    if (step.words) {
      const kept = new Set(left.map((i) => CELL.key(pointOf(i, state.w))));
      step.words = step.words.narrow(
        (role, _kind, key) => role !== "ring" || kept.has(key),
      );
      step.explanation = step.words.text;
    }
  }
  return verdict;
}

export const fillingGame: Game<
  FillingParams,
  FillingState,
  FillingMove,
  FillingUi,
  FillingDrawState,
  Point,
  FillingHint,
  FillingRung
> = {
  id: "filling",
  // Selection is a left press or a left drag across a run of cells, and the
  // secondary button has no meaning, so a held press must not be promoted
  // into one: that would kill the drag mid-gesture.
  ignoresSecondaryButton: true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  transposeParams: transposeDimensions(),
  paramConfig,

  newDesc: newFillingDesc,
  newState,
  newUi,
  changedState,

  interpretMove,
  executeMove,
  finishesByDeduction: (s) => hintAndSolveFinish(fillingGame, s),
  status,

  solve,
  hint,
  hintMarks: {
    roles: {
      ring: "each square the step fills. The number to write there is the one the sentence names.",
      outline:
        "the neighbors the reason rests on, when it is about the number a square can take rather than about one region.",
      stripes:
        "the region the sentence names: a group of equal numbers already on the board that is not yet as big as its number. The squares the step fills take that same number.",
    },
  },
  hintRungs: FILLING_RUNGS,
  hintKeepTrack,
  hintGesture,
  findMistakes,
  // Upstream's keypad is a fixed 1..9 (region sizes never exceed 9).
  requestKeys: (): KeyLabel[] => digitKeys(9),

  textFormat,

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize: (p: FillingParams, ts: number): Size => computeSize(p.w, p.h, ts),
  newDrawState,
  redraw: redrawFilling,

  solvedFlash: () => FLASH_TIME,
};

registerGame(fillingGame);
