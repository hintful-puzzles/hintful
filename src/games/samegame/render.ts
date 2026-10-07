import { BLACK, TEN, WHITE } from "../../engine/color/colors.ts";
import {
  cellSurface,
  givenSurface,
  INK,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawRectOutline } from "../../engine/draw.ts";
import type { GameDrawing } from "../../engine/game.ts";
import type { Color, Size } from "../../engine/types.ts";
import type { SamegameState, SamegameUi } from "./state.ts";

// --- tile-size metrics ------------------------------------------------

export const PREFERRED_TILE_SIZE = 32;
export const FLASH_FRAME = 0.13;

/** `TILE_GAP` for a given full tile size (`game_set_size`). */
const gap = (ts: number) => Math.floor((ts + 8) / 16);
/** `BORDER` = half a full tile (the non-NARROW_BORDERS path). */
const border = (ts: number) => Math.floor(ts / 2);
/** `COORD(n)` — top-left pixel of cell `n` along one axis. */
const coord = (n: number, ts: number) => n * ts + border(ts);

// --- tile flags (packed into the per-cell render cache) ---------------

const TILE_COLMASK = 0x00ff;
const TILE_SELECTED = 0x0100;
const TILE_JOINRIGHT = 0x0200;
const TILE_JOINDOWN = 0x0400;
const TILE_JOINDIAG = 0x0800;
const TILE_HASSEL = 0x1000;
const TILE_IMPOSSIBLE = 0x2000;

// --- color palette indices -------------------------------------------

const COL_BACKGROUND = 0;
const COL_1 = 1; // COL_1..COL_9 are 1..9
/** The middle of every tile on a stuck board, and the cursor on an emptied
 * cell. */
const COL_INK = 10;
/** The body of a selected tile, whose color shrinks to its middle. */
const COL_SEL = 11;
/** The field: an emptied cell, and the gap between two tiles. */
const COL_CELL = 12;
/** The field on the lit beats of the flash. */
const COL_FLASH = 13;
/** The frame round the field. */
const COL_GRID = 14;
/** The cursor on a tile. */
const COL_ON_TILE = 15;
const NCOLORS = 16;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = new Array<Color>(NCOLORS);
  out[COL_BACKGROUND] = defaultBackground;
  for (let i = 0; i < 9; i++) out[COL_1 + i] = TEN[i];
  out[COL_INK] = INK;
  // `WHITE` and `BLACK`, not `PAPER` and `INK`: both are read against a
  // tile, which is one color in both schemes, and a selected tile that
  // inverted would sink into the dark scheme's field.
  out[COL_SEL] = WHITE;
  out[COL_ON_TILE] = BLACK;
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_FLASH] = givenSurface(defaultBackground);
  out[COL_GRID] = surfaceGrid(defaultBackground);
  return out;
}

export function computeSize(p: { w: number; h: number }, ts: number): Size {
  return {
    w: ts * p.w + 2 * border(ts) - gap(ts),
    h: ts * p.h + 2 * border(ts) - gap(ts),
  };
}

// --- draw state -------------------------------------------------------

export interface SamegameDrawState {
  /** Full tile size (`TILE_SIZE`). */
  tileSize: number;
  tileinner: number;
  tilegap: number;
  /** Last-drawn background color index (flash drives this globally). */
  bgcolor: number;
  /** Per-cell cache of the last-drawn packed tile value; `-1` forces a
   * redraw (the no-BigInt Int32Array cache pattern). */
  grid: Int32Array;
}

export function newDrawState(
  state: SamegameState,
  tileSize: number,
): SamegameDrawState {
  return {
    tileSize,
    tileinner: tileSize - gap(tileSize),
    tilegap: gap(tileSize),
    bgcolor: -1,
    grid: new Int32Array(state.w * state.h).fill(-1),
  };
}

// --- tile drawing -----------------------------------------------------

/**
 * Draw one tile and the gaps to its right and below (upstream
 * `tile_redraw`). If we share a color with our right / down / diagonal
 * neighbor the corresponding gap is filled, so a connected region paints
 * as a single seamless block.
 */
function tileRedraw(
  dr: GameDrawing,
  ds: SamegameDrawState,
  x: number,
  y: number,
  dright: boolean,
  dbelow: boolean,
  tile: number,
  bgcolor: number,
): void {
  const ts = ds.tileSize;
  const inner = ds.tileinner;
  const tgap = ds.tilegap;
  const col = tile & TILE_COLMASK;

  let outerCol = bgcolor;
  let innerCol = bgcolor;
  if (col) {
    if (tile & TILE_IMPOSSIBLE) {
      outerCol = col;
      innerCol = COL_INK;
    } else if (tile & TILE_SELECTED) {
      outerCol = COL_SEL;
      innerCol = col;
    } else {
      outerCol = col;
      innerCol = col;
    }
  }

  const tileW = dright ? ts : inner;
  const tileH = dbelow ? ts : inner;
  const outerW = tile & TILE_JOINRIGHT ? tileW : inner;
  const outerH = tile & TILE_JOINDOWN ? tileH : inner;
  const cx = coord(x, ts);
  const cy = coord(y, ts);

  // Draw the background if any of it will be visible.
  if (outerW !== tileW || outerH !== tileH || outerCol === bgcolor)
    dr.drawRect({ x: cx, y: cy, w: tileW, h: tileH }, bgcolor);
  // Draw the piece.
  if (outerCol !== bgcolor)
    dr.drawRect({ x: cx, y: cy, w: outerW, h: outerH }, outerCol);
  if (innerCol !== outerCol)
    dr.drawRect(
      {
        x: cx + Math.floor(inner / 4),
        y: cy + Math.floor(inner / 4),
        w: Math.floor(inner / 2),
        h: Math.floor(inner / 2),
      },
      innerCol,
    );
  // Reset the bottom-right corner if we join right & down but not diag.
  if (
    (tile & (TILE_JOINRIGHT | TILE_JOINDOWN | TILE_JOINDIAG)) ===
      (TILE_JOINRIGHT | TILE_JOINDOWN) &&
    outerCol !== bgcolor &&
    tgap !== 0
  )
    dr.drawRect({ x: cx + inner, y: cy + inner, w: tgap, h: tgap }, bgcolor);

  if (tile & TILE_HASSEL) {
    drawRectOutline(
      dr,
      cx + 2,
      cy + 2,
      inner - 4,
      inner - 4,
      col ? COL_ON_TILE : COL_INK,
    );
  }

  dr.drawUpdate({ x: cx, y: cy, w: ts, h: ts });
}

/**
 * The field's margin and the frame round it: the tiles stand one gap in from
 * a frame one pixel wide, so the edge of the field is spaced as two tiles are.
 * The margin is field, and flashes with it.
 */
function drawFrame(
  dr: GameDrawing,
  w: number,
  h: number,
  ts: number,
  bgcolor: number,
): void {
  const g = gap(ts);
  const x = coord(0, ts) - g;
  const y = coord(0, ts) - g;
  const fw = w * ts + g;
  const fh = h * ts + g;
  dr.drawRect({ x: x - 1, y: y - 1, w: fw + 2, h: fh + 2 }, COL_GRID);
  dr.drawRect({ x, y, w: fw, h: fh }, bgcolor);
  dr.drawUpdate({ x: x - 1, y: y - 1, w: fw + 2, h: fh + 2 });
}

export function redraw(
  dr: GameDrawing,
  ds: SamegameDrawState,
  _prev: SamegameState | null,
  state: SamegameState,
  _dir: number,
  ui: SamegameUi,
  _animTime: number,
  flashTime: number,
): void {
  const ts = ds.tileSize;
  const { w, h } = state;

  // The field lifts on the flash's even beats and rests on its odd ones.
  const lit = flashTime > 0 && Math.floor(flashTime / FLASH_FRAME) % 2 === 0;
  const bgcolor = lit ? COL_FLASH : COL_CELL;
  const bgChanged = ds.bgcolor !== bgcolor;
  if (bgChanged) drawFrame(dr, w, h, ts, bgcolor);

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const i = y * w + x;
      const col = state.tiles[i];
      let tile = col;
      const dright = x + 1 < w;
      const dbelow = y + 1 < h;

      if (ui.selected[i]) tile |= TILE_SELECTED;
      if (state.impossible) tile |= TILE_IMPOSSIBLE;
      if (dright && state.tiles[i + 1] === col) tile |= TILE_JOINRIGHT;
      if (dbelow && state.tiles[i + w] === col) tile |= TILE_JOINDOWN;
      if (
        tile & TILE_JOINRIGHT &&
        tile & TILE_JOINDOWN &&
        state.tiles[i + w + 1] === col
      )
        tile |= TILE_JOINDIAG;
      // Hide the keyboard cursor on a finished board: cleared or stuck, which
      // `impossible` both says.
      if (
        ui.cursor.visible &&
        ui.cursor.x === x &&
        ui.cursor.y === y &&
        !state.impossible
      )
        tile |= TILE_HASSEL;

      if (ds.grid[i] !== tile || bgChanged) {
        tileRedraw(dr, ds, x, y, dright, dbelow, tile, bgcolor);
        ds.grid[i] = tile;
      }
    }
  }
  ds.bgcolor = bgcolor;
}
