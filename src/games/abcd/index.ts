/**
 * ABCD — native TS port of `unreleased/abcd.c` (Lennard Sprong, 2011). Fill a
 * `w × h` grid with one of `n` letters so the edge numbers count each letter per
 * row and column, and no two identical letters touch (orthogonally, and — under
 * "no diagonals" mode — diagonally). Solo-style input: left-click / cursor
 * selects a cell for a real entry, right-click / Enter toggles pencil mode, a
 * letter key (`A`–`I` or the bare digits `1`–`9`) enters or pencil-marks,
 * Backspace clears. Rule violations highlight live; Check & Save additionally
 * flags any entry contradicting the unique solution.
 */

import { assertNever } from "../../engine/assert-never.ts";
import { adaptiveMarkAll, candidateHint } from "../../engine/candidate-hint.ts";
import { winFlash } from "../../engine/flash.ts";
import {
  type Game,
  type PresetMenu,
  type SolveResult,
  UI_UPDATE,
  type UiUpdate,
} from "../../engine/game.ts";
import { clearKey } from "../../engine/key-labels.ts";
import {
  pressNoteTakingCell,
  releaseHighlightAfterEntry,
  toggleNoteTakingMode,
} from "../../engine/note-taking-cell.ts";
import {
  dimensionParamConfig,
  parseConfigInt,
  transposeDimensions,
} from "../../engine/params.ts";
import {
  candidateReadingPref,
  pencilKeepHighlightPref,
  stickyPencilPref,
} from "../../engine/pencil-prefs.ts";
import {
  CURSOR_SELECT2,
  digitOf,
  gridCursorMove,
  isCursorMove,
  isEraseKey,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { ConfigValues, KeyLabel, Point } from "../../engine/types.ts";
import { newAbcdDesc } from "./generator.ts";
import { buildSteps, hintKeepTrack, refreshHintStep } from "./hint.ts";
import {
  type AbcdDrawState,
  colors,
  computeSize,
  FLASH_TIME,
  fromCoord,
  newDrawState,
  PREFERRED_TILE_SIZE,
  redraw,
} from "./render.ts";
import { type AbcdMark, abcdObviousMarks, solveAbcd } from "./solver.ts";
import {
  type AbcdMove,
  type AbcdParams,
  type AbcdState,
  type AbcdUi,
  abcdPresets,
  cloneState,
  decodeParams,
  defaultParams,
  EMPTY,
  encodeParams,
  isCompleted,
  letterBit,
  newState,
  newUi,
  status,
  textFormat,
  validateDesc,
  validateParams,
} from "./state.ts";

/** A player entry that contradicts the puzzle's unique solution. */
export type AbcdMistake = Point;

const KEY_M = 77;
const KEY_m = 109;

function presetTitle(p: AbcdParams): string {
  const flavor = p.diag ? "No diagonals" : p.removenums ? "Hard" : "Easy";
  return `${p.w}x${p.h}, ${p.n} letters ${flavor}`;
}

function presets(): PresetMenu<AbcdParams> {
  return {
    title: "ABCD",
    submenu: abcdPresets.map((p) => ({ title: presetTitle(p), params: p })),
  };
}

function inGrid(p: AbcdParams, x: number, y: number): boolean {
  return x >= 0 && x < p.w && y >= 0 && y < p.h;
}

/** The letter index a key selects, `"clear"` for a key that clears, or `null`
 * for a key that is neither for this `n`. */
function keyLetter(button: number, n: number): number | "clear" | null {
  if (button >= 97 && button <= 105 && button - 97 < n) return button - 97; // a-i
  if (button >= 65 && button <= 73 && button - 65 < n) return button - 65; // A-I
  const digit = digitOf(button);
  if (digit !== null && digit >= 1 && digit - 1 < n) return digit - 1; // 1-9
  if (button === CURSOR_SELECT2 || isEraseKey(button) || digit === 0) return "clear";
  return null;
}

/**
 * Would writing `letter` into `(x, y)` leave the state exactly as it is?
 *
 * The two arms mirror `executeMove`'s two `enter` branches: placing a letter
 * touches only the grid, so it is a no-op iff that letter is already there;
 * clearing also wipes the cell's pencil marks, so it is a no-op only when the
 * cell is empty *and* carries no notes.
 */
function noOpEntry(
  state: AbcdState,
  x: number,
  y: number,
  letter: number | null,
): boolean {
  const i = y * state.params.w + x;
  if (letter !== null) return state.grid[i] === letter + 1;
  return state.grid[i] === EMPTY && state.pencil[i] === 0;
}

function interpretMove(
  state: AbcdState,
  ui: AbcdUi,
  ds: { tileSize: number },
  point: Point,
  rawButton: number,
): AbcdMove | null | UiUpdate {
  const p = state.params;
  const { w, n } = p;
  const ts = ds.tileSize;
  const button = stripModifiers(rawButton);

  const gx = fromCoord(point.x, ts, n);
  const gy = fromCoord(point.y, ts, n);

  if (
    inGrid(p, gx, gy) &&
    pressNoteTakingCell(ui, button, gx, gy, {
      // Abcd has no givens inside the grid — its clues live on the margins —
      // so every square takes ink, and a filled one can be typed over.
      canEnter: true,
      canMark: state.grid[gy * w + gx] === EMPTY,
    })
  ) {
    return UI_UPDATE;
  }

  if (isCursorMove(button)) {
    const moved = gridCursorMove(button, ui.cursor.x, ui.cursor.y, p.w, p.h);
    if (moved) {
      ui.cursor.x = moved.x;
      ui.cursor.y = moved.y;
    }
    ui.cursor.visible = ui.cursorFromKeyboard = true;
    return UI_UPDATE;
  }

  const toggled = toggleNoteTakingMode(ui, button);
  if (toggled) return toggled;

  // Enter or clear a letter.
  const key = ui.cursor.visible ? keyLetter(button, n) : null;
  if (key !== null) {
    const letter = key === "clear" ? null : key;
    // In pencil mode a filled square can't be changed.
    if (ui.pencilMode && state.grid[ui.cursor.y * w + ui.cursor.x] !== EMPTY)
      return null;

    // Suppress an entry that would change nothing, so it costs no undo step
    // (upstream left this as a `TODO`), decided locally rather than by
    // comparing states.
    if (!ui.pencilMode && noOpEntry(state, ui.cursor.x, ui.cursor.y, letter))
      return null;

    const move: AbcdMove =
      letter === null
        ? { type: "enter", x: ui.cursor.x, y: ui.cursor.y, letter: null }
        : ui.pencilMode
          ? { type: "pencil", x: ui.cursor.x, y: ui.cursor.y, letter }
          : { type: "enter", x: ui.cursor.x, y: ui.cursor.y, letter };

    // Hide the mouse cursor after an entry (keyboard/pencil cursors persist).
    releaseHighlightAfterEntry(ui);
    return move;
  }

  // Adaptive mark-all (M): fill while some empty cell has no notes, then only
  // strike the obvious eliminations, never re-fill
  // (docs/games/mechanics.md § "Pencil marks: the full note-taking UX").
  if (button === KEY_M || button === KEY_m) {
    const needsFill = state.grid.some((c, i) => c === EMPTY && state.pencil[i] === 0);
    return adaptiveMarkAll<AbcdMove, AbcdMark>(needsFill, () =>
      abcdObviousMarks(p, state.grid, state.pencil, state.numbers),
    );
  }

  return null;
}

function executeMove(state: AbcdState, move: AbcdMove): AbcdState {
  const p = state.params;
  const { w, n } = p;
  const next = cloneState(state);

  switch (move.type) {
    case "enter": {
      const i = move.y * w + move.x;
      if (move.letter === null) {
        // Clearing wipes the cell's pencil marks too (and never completes).
        next.grid[i] = EMPTY;
        next.pencil[i] = 0;
        return next;
      }
      next.grid[i] = move.letter + 1;
      if (!next.completed && isCompleted(next)) next.completed = true;
      return next;
    }
    case "pencil": {
      next.pencil[move.y * w + move.x] ^= letterBit(move.letter);
      return next;
    }
    case "pencilAll": {
      // Fill every note-less empty cell with every candidate, never resetting a
      // narrowed one: `candidate-hint.ts`'s `adaptiveMarkAll` § "The additive
      // rule, stated once".
      const every = (1 << n) - 1;
      for (let i = 0; i < w * p.h; i++)
        if (next.grid[i] === EMPTY && next.pencil[i] === 0) next.pencil[i] = every;
      return next;
    }
    case "pencilStrike": {
      for (const m of move.marks) next.pencil[m.y * w + m.x] &= ~letterBit(m.letter);
      return next;
    }
    case "pencilAdd": {
      for (const m of move.marks) next.pencil[m.y * w + m.x] |= letterBit(m.letter);
      return next;
    }
    case "solve": {
      for (let i = 0; i < w * p.h; i++) next.grid[i] = move.grid[i] + 1;
      next.completed = true;
      next.cheated = true;
      return next;
    }
    default:
      return assertNever(move, "abcd: executeMove");
  }
}

function changedState(ui: AbcdUi, oldSt: AbcdState | null, newSt: AbcdState): void {
  const w = newSt.params.w;
  // Cancel a pencil highlight on a square that just got filled (undo/redo/solve).
  if (
    ui.cursor.visible &&
    ui.pencilMode &&
    !ui.cursorFromKeyboard &&
    newSt.grid[ui.cursor.y * w + ui.cursor.x] !== EMPTY
  ) {
    ui.cursor.visible = false;
  }
  if (oldSt && !oldSt.completed && newSt.completed) ui.cursor.visible = false;
}

function solve(orig: AbcdState): SolveResult<AbcdMove> {
  const res = solveAbcd(orig.params, orig.numbers);
  if (res.status === "contradiction")
    return { ok: false, error: "No solution exists for this puzzle." };
  if (res.status === "ambiguous")
    return { ok: false, error: "Solver could not find a unique solution." };
  // The move carries letter indices, as the saves that replay it always have.
  return {
    ok: true,
    move: { type: "solve", grid: Array.from(res.grid, (v) => v - 1) },
  };
}

/** Entries that contradict the unique solution, and empty cells whose notes
 * have crossed out their answer. The notes count because the hint reasons
 * from them (`hint.ts`), which is sound only while each still holds its cell's
 * answer; notes with merely extra letters are ordinary mid-solve state. */
function findMistakes(state: AbcdState): readonly AbcdMistake[] {
  const res = solveAbcd(state.params, state.numbers);
  if (res.status !== "solved") return [];
  const { w, h } = state.params;
  const out: AbcdMistake[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const entry = state.grid[i];
      const notes = state.pencil[i];
      const wrong =
        entry !== EMPTY
          ? entry !== res.grid[i]
          : notes !== 0 && !(notes & letterBit(res.grid[i] - 1));
      if (wrong) out.push({ x, y });
    }
  }
  return out;
}

function requestKeys(p: AbcdParams): KeyLabel[] {
  const keys: KeyLabel[] = [];
  for (let i = 0; i < p.n; i++)
    keys.push({ button: 65 + i, label: String.fromCharCode(65 + i) });
  keys.push(clearKey);
  return keys;
}

export const abcdGame: Game<
  AbcdParams,
  AbcdState,
  AbcdMove,
  AbcdUi,
  AbcdDrawState,
  AbcdMistake
> = {
  id: "abcd",
  // `textFormat` still declines a board whose clues could be two digits.
  canMarkAll: true,

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  describeParams: (p): ConfigValues => ({
    width: String(p.w),
    height: String(p.h),
    letters: String(p.n),
    "remove-clues": p.removenums ? 1 : 0,
    "allow-diagonal-touching": p.diag ? 0 : 1,
  }),
  transposeParams: transposeDimensions(),
  paramConfig: [
    ...dimensionParamConfig<AbcdParams>(),
    {
      kw: "letters",
      name: "Letters",
      type: "string",
      get: (p) => String(p.n),
      set: (p, v) => {
        p.n = parseConfigInt(v);
      },
    },
    {
      kw: "remove-clues",
      name: "Remove clues",
      type: "boolean",
      get: (p) => p.removenums,
      set: (p, v) => {
        p.removenums = v;
      },
    },
    {
      // The option is the inverse of the stored flag, as upstream's is.
      kw: "allow-diagonal-touching",
      name: "Allow diagonal touching",
      type: "boolean",
      get: (p) => !p.diag,
      set: (p, v) => {
        p.diag = !v;
      },
    },
  ],

  newDesc: newAbcdDesc,
  validateDesc,
  newState,
  newUi,
  changedState,

  interpretMove,
  executeMove,
  status,

  solve,
  findMistakes,
  hint: (state, _aux, ui) =>
    candidateHint(state, ui ?? newUi(state), findMistakes, buildSteps),
  hintKeepTrack,
  refreshHintStep,
  requestKeys,
  textFormat,

  prefs: [
    stickyPencilPref<AbcdUi>(),
    pencilKeepHighlightPref<AbcdUi>(),
    candidateReadingPref<AbcdUi>(),
  ],

  colors,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  flashLength: (from, to) => winFlash(from, to, FLASH_TIME),
};

registerGame(abcdGame);
