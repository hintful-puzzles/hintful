import { rejectMove } from "../../engine/assert-never.ts";
import { type Game, UI_UPDATE, type UiUpdate } from "../../engine/game.ts";
import { fromCoord } from "../../engine/geometry.ts";
import {
  CURSOR_SELECT,
  CURSOR_SELECT2,
  isCursorMove,
  LEFT_BUTTON,
  moveCursor,
  newCursor,
  RIGHT_BUTTON,
  stripModifiers,
} from "../../engine/pointer.ts";
import { registerGame } from "../../engine/registry.ts";
import type { Point } from "../../engine/types.ts";
import {
  colors,
  computeSize,
  FLASH_FRAME,
  newDrawState,
  PREFERRED_TILE_SIZE,
  paletteScheme,
  redraw,
  type SamegameDrawState,
} from "./render.ts";
import {
  check,
  decodeParams,
  defaultParams,
  encodeParams,
  isCleared,
  isStuck,
  newDesc,
  newState,
  npoints,
  paramConfig,
  presets,
  type SamegameMove,
  type SamegameParams,
  type SamegameState,
  type SamegameUi,
  snuggle,
  status,
  textFormat,
  validateParams,
} from "./state.ts";

// --- UI / selection ---------------------------------------------------

function newUi(state: SamegameState): SamegameUi {
  return {
    selected: new Array<boolean>(state.w * state.h).fill(false),
    nselected: 0,
    cursor: newCursor(),
  };
}

/** Upstream `sel_clear`. */
function selClear(ui: SamegameUi): void {
  ui.selected.fill(false);
  ui.nselected = 0;
}

/** Upstream `game_changed_state` → `sel_clear`: the picked region resets
 * across every real transition. */
function changedState(
  ui: SamegameUi,
  _old: SamegameState | null,
  _new: SamegameState,
): void {
  selClear(ui);
}

/** Upstream `sel_expand`: flood the connected same-color region from
 * (tx,ty) into the selection. A lone tile (region size 1) cannot be
 * removed, so the selection collapses. */
function selExpand(ui: SamegameUi, state: SamegameState, tx: number, ty: number): void {
  const { w, h, tiles } = state;
  const start = ty * w + tx;
  const c = tiles[start];
  ui.selected[start] = true;
  const queue = [start];
  let qi = 0;
  let ns = 1;
  while (qi < queue.length) {
    const k = queue[qi++];
    const x = k % w;
    const y = Math.floor(k / w);
    const tryCell = (nx: number, ny: number) => {
      const ni = ny * w + nx;
      if (!ui.selected[ni] && tiles[ni] === c) {
        ui.selected[ni] = true;
        ns++;
        queue.push(ni);
      }
    };
    if (x > 0) tryCell(x - 1, y);
    if (x + 1 < w) tryCell(x + 1, y);
    if (y > 0) tryCell(x, y - 1);
    if (y + 1 < h) tryCell(x, y + 1);
  }
  if (ns > 1) ui.nselected = ns;
  else selClear(ui);
}

/** Upstream `sel_movedesc`: collect the selected indices into a `remove`
 * move and clear the selection. */
function selMovedesc(ui: SamegameUi): SamegameMove {
  const tiles: number[] = [];
  for (let i = 0; i < ui.selected.length; i++) if (ui.selected[i]) tiles.push(i);
  selClear(ui);
  return { type: "remove", tiles };
}

// --- input ------------------------------------------------------------

function interpretMove(
  state: SamegameState,
  ui: SamegameUi,
  ds: SamegameDrawState,
  p: Point,
  rawButton: number,
): SamegameMove | null | UiUpdate {
  const { w, h } = state;
  const button = stripModifiers(rawButton);
  let tx: number;
  let ty: number;

  if (button === RIGHT_BUTTON || button === LEFT_BUTTON) {
    ui.cursor.visible = false;
    const ts = ds.tileSize;
    const bd = Math.floor(ts / 2);
    tx = fromCoord(p.x, ts, bd);
    ty = fromCoord(p.y, ts, bd);
  } else if (isCursorMove(button)) {
    // The cursor wraps toroidally on this board.
    return moveCursor(ui.cursor, button, w, h, true) ? UI_UPDATE : null;
  } else if (button === CURSOR_SELECT || button === CURSOR_SELECT2) {
    ui.cursor.visible = true;
    tx = ui.cursor.x;
    ty = ui.cursor.y;
  } else {
    return null;
  }

  if (tx < 0 || tx >= w || ty < 0 || ty >= h) return null;
  if (state.tiles[ty * w + tx] === 0) return null; // empty tile: no effect

  if (ui.selected[ty * w + tx]) {
    if (button === RIGHT_BUTTON || button === CURSOR_SELECT2) {
      selClear(ui);
      return UI_UPDATE;
    }
    return selMovedesc(ui);
  }
  selClear(ui); // might be a no-op
  selExpand(ui, state, tx, ty);
  return UI_UPDATE;
}

// --- move execution ---------------------------------------------------

export function executeMove(state: SamegameState, move: SamegameMove): SamegameState {
  // Samegame's move is one object shape rather than a union, so there is no
  // discriminant to narrow to `never`: check the fields the dispatch reads.
  if (move.type !== "remove" || !Array.isArray(move.tiles)) {
    rejectMove(move, "samegame: executeMove");
  }

  const { w, h } = state;
  const tiles = state.tiles.slice();
  for (const idx of move.tiles) {
    if (idx < 0 || idx >= w * h) throw new Error(`Move index ${idx} out of range`);
    tiles[idx] = 0;
  }
  const score = state.score + npoints(state.scoresub, move.tiles.length);
  snuggle(tiles, w, h); // shift blanks down and to the left
  return { ...state, tiles, score, impossible: check(tiles, w, h).impossible };
}

// --- status bar -------------------------------------------------------

function statusbarText(state: SamegameState, ui: SamegameUi): string {
  const score = `Score: ${state.score}`;
  if (isCleared(state)) return score;
  if (state.impossible) return `Cannot move! ${score}`;
  if (ui.nselected)
    return `${score}  Selected: ${ui.nselected} (${npoints(state.scoresub, ui.nselected)})`;
  return score;
}

// --- flash ------------------------------------------------------------

/** A board that gets stuck flashes as a win does, though the status does not
 * show it; the win's own flash is {@link samegameGame.solvedFlash}. */
function flashLength(
  oldState: SamegameState,
  newState: SamegameState,
  _dir: number,
  _ui: SamegameUi,
): number {
  return !isStuck(oldState) && isStuck(newState) ? 2 * FLASH_FRAME : 0;
}

// --- Game object ------------------------------------------------------

export const samegameGame: Game<
  SamegameParams,
  SamegameState,
  SamegameMove,
  SamegameUi,
  SamegameDrawState
> = {
  id: "samegame",

  defaultParams,
  presets,
  encodeParams,
  decodeParams,
  validateParams,
  paramConfig,

  newDesc,
  newState,
  newUi,
  changedState,

  interpretMove,
  executeMove,
  status,
  notApplicable: {
    findMistakes:
      "Any order of removals that empties the grid wins, so there is no single answer to check a move against.",
    transposeParams:
      "Squares fall down and emptied columns close up to the left, so a board turned on its side would be a different puzzle.",
  },

  textFormat,
  statusbarText,

  colors,
  paletteScheme,
  preferredTileSize: PREFERRED_TILE_SIZE,
  computeSize,
  newDrawState,
  redraw,

  animLength: () => 0,
  flashLength,
  solvedFlash: () => 2 * FLASH_FRAME,
  // A stuck board is not a loss (the player undoes and plays on), yet nobody
  // is playing it, so the timer holds on it.
  timerHolds: isStuck,
};

registerGame(samegameGame);
