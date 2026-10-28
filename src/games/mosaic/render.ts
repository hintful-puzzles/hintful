/**
 * Mosaic rendering (upstream's `draw_cell` / `game_redraw`): a
 * (width+1)×(height+1) per-cell diffed loop, whose extra margin row and
 * column draw the closing grid lines and cursor edges. The win flash
 * fills the ground of each cell it is on.
 *
 * The board is pieces on a quiet surface (`engine/piece.ts`): a marked cell
 * holds the shaded piece, a blank one is the clear square, and a cell's number
 * is drawn over whichever it is.
 */

import { GRAY_WASH, WHITE } from "../../engine/color/colors.ts";
import {
  CLEAR,
  CLEAR_MARK,
  CURSOR,
  cellSurface,
  ERROR,
  ERROR_TEXT,
  FLASH,
  FLASH_LEAD,
  HINT_OUTLINE,
  INK,
  SHADED,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import {
  drawMarkSides,
  MARK_ALL,
  type MarkBand,
  MarkOutlines,
} from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { drawClearSquare, drawPiece, SHADED_SHAPE } from "../../engine/piece.ts";
import { ringFits, textBox } from "../../engine/ring.ts";
import type { Color, DrawTextOptions, Point, Rect, Size } from "../../engine/types.ts";
import { type Flash, sweepStep, type WinTone, winSlot } from "../../engine/win-wave.ts";
import type { MosaicHint } from "./hint.ts";
import { BLOCK, blockOf } from "./hint-marks.ts";
import {
  type MosaicMistake,
  type MosaicMove,
  type MosaicParams,
  type MosaicState,
  type MosaicUi,
  STATE_BLANK,
  STATE_ERROR,
  STATE_MARKED,
  STATE_SOLVED,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 32;

// --- palette ---------------------------------------------------------------

export const COL_BACKGROUND = 0;
/** The surface of a cell, whatever it holds. */
export const COL_CELL = 1;
export const COL_GRID = 2;
/** The piece in a marked cell. */
export const COL_SHADED = 3;
/** The surface of a blank cell. */
export const COL_CLEAR = 4;
/** A number the board has not satisfied, off the piece. */
export const COL_TEXT = 5;
/** What is faint on a blank cell: its cross, or a number the board has
 * satisfied. */
export const COL_CLEAR_MARK = 6;
/** A number on the shaded piece, and one there that the board has satisfied. */
export const COL_TEXT_ON_PIECE = 7;
export const COL_TEXT_SOLVED_ON_PIECE = 8;
export const COL_ERROR = 9;
export const COL_ERROR_TEXT = 10;
export const COL_CURSOR = 11;
export const COL_HINT_EVIDENCE = 12;
/** The ground of a cell the win flash is on, whatever it holds: its body, and
 * its leading edge. */
export const COL_FLASH = 13;
export const COL_FLASH_LEAD = 14;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_SHADED] = SHADED;
  out[COL_CLEAR] = CLEAR;
  out[COL_CLEAR_MARK] = CLEAR_MARK;
  out[COL_TEXT] = INK;
  // Pinned and not ink: it is read against the piece, whose own lightness
  // barely moves between the schemes.
  out[COL_TEXT_ON_PIECE] = WHITE;
  // A gray between the piece and its white number in both schemes.
  out[COL_TEXT_SOLVED_ON_PIECE] = GRAY_WASH;
  out[COL_ERROR] = ERROR;
  out[COL_ERROR_TEXT] = ERROR_TEXT;
  out[COL_CURSOR] = CURSOR;
  out[COL_HINT_EVIDENCE] = HINT_OUTLINE;
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  return out;
}

// --- geometry ---------------------------------------------------------------

const margin = (ts: number) => Math.floor(ts / 2);

export function computeSize(p: MosaicParams, ts: number): Size {
  return {
    w: p.width * ts + 2 * margin(ts),
    h: p.height * ts + 2 * margin(ts),
  };
}

// --- draw state ---------------------------------------------------------------

// Extra flags packed above the cell-state bits in the cache (upstream's
// DRAWFLAG_* values, plus our mistake-overlay bit).
const DRAWFLAG_CURSOR = 0x100;
const DRAWFLAG_CURSOR_U = 0x200;
const DRAWFLAG_CURSOR_L = 0x400;
const DRAWFLAG_CURSOR_UL = 0x800;
const DRAWFLAG_MARGIN_R = 0x1000;
const DRAWFLAG_MARGIN_D = 0x2000;
const DRAWFLAG_MISTAKE = 0x4000;
/** A hint mark's sides (`MarkOutlines.packed`) sit above every flag, so the
 * cache repaints a square whose mark moved. */
const HINT_SIDES_SHIFT = 16;
/** The number a hint step names, circled. Above the sides' eight bits. */
const DRAWFLAG_HINT_NUMBER = 1 << 24;
/** The win flash's tone on the cell, in two bits above the hint's. */
const WIN_SHIFT = 25;

export interface MosaicDrawState {
  tileSize: number;
  /** (width+1)×(height+1) cache of last-drawn packed cell values; -1
   * forces a draw (docs/rendering.md § "The tile cache and the diff
   * key"). */
  cache: Int32Array;
  /** The squares the last frame ringed, as `y * width + x`: their rings may
   * reach into the tiles round them, which repaint when the rings go. */
  ringed: number[];
}

export function newDrawState(state: MosaicState, tileSize: number): MosaicDrawState {
  return {
    tileSize,
    cache: new Int32Array((state.width + 1) * (state.height + 1)).fill(-1),
    ringed: [],
  };
}

// --- cell drawing ---------------------------------------------------------------

/** Where the number of the square at `(startX, startY)` is written: read by
 * the text and by the ring round the square. Three fifths of the tile, and a
 * pixel less on a tile of 6 px or under, where a ring fits between a 3 px
 * number and its neighbors' by no step of its search (measured 2026-10-28,
 * `keep-rings-off-a-cells-numbers`). */
function clueText(
  startX: number,
  startY: number,
  ts: number,
): { origin: Point; options: DrawTextOptions } {
  return {
    origin: { x: startX + Math.floor(ts / 2) - 1, y: startY + Math.floor(ts / 2) - 1 },
    options: glyphFont(Math.floor((ts * 3) / 5) - (ts <= 6 ? 1 : 0)),
  };
}

function drawCell(
  dr: GameDrawing,
  cell: number,
  ts: number,
  clueVal: number,
  x: number,
  y: number,
): void {
  const startX = x * ts + margin(ts);
  const startY = y * ts + margin(ts);

  const tile = { x: startX - 1, y: startY - 1, w: ts, h: ts };
  dr.clip(tile);

  // Top and left grid lines live inside this cell's tile; the margin
  // row/column draws only the closing lines of the previous cells.
  if (!(cell & DRAWFLAG_MARGIN_R)) {
    dr.drawRect(
      { x: startX - 1, y: startY - 1, w: ts, h: 1 },
      cell & (DRAWFLAG_CURSOR | DRAWFLAG_CURSOR_U) ? COL_CURSOR : COL_GRID,
    );
  }
  if (!(cell & DRAWFLAG_MARGIN_D)) {
    dr.drawRect(
      { x: startX - 1, y: startY - 1, w: 1, h: ts },
      cell & (DRAWFLAG_CURSOR | DRAWFLAG_CURSOR_L) ? COL_CURSOR : COL_GRID,
    );
  }
  if (cell & DRAWFLAG_CURSOR_UL) {
    dr.drawRect({ x: startX - 1, y: startY - 1, w: 1, h: 1 }, COL_CURSOR);
  } else if (cell & DRAWFLAG_MARGIN_R && cell & DRAWFLAG_MARGIN_D) {
    // The grid's bottom right corner draws no line of its own, so nothing
    // else takes the cursor's corner pixel off again.
    dr.drawRect({ x: startX - 1, y: startY - 1, w: 1, h: 1 }, COL_BACKGROUND);
  }

  if (!(cell & (DRAWFLAG_MARGIN_R | DRAWFLAG_MARGIN_D))) {
    const box = { x: startX, y: startY, w: ts - 1, h: ts - 1 };
    const shaded = (cell & STATE_MARKED) !== 0;
    const clear = !shaded && (cell & STATE_BLANK) !== 0;
    const tone = ((cell >> WIN_SHIFT) & 3) as WinTone;
    const lit = tone ? winSlot(tone, COL_FLASH, COL_FLASH_LEAD) : null;
    if (clear) {
      // No cross where the cell has a number, which takes the middle.
      drawClearSquare(
        dr,
        box,
        lit ?? COL_CLEAR,
        COL_CLEAR_MARK,
        clueVal >= 0 ? null : box,
      );
    } else {
      dr.drawRect(box, lit ?? COL_CELL);
      if (shaded) drawPiece(dr, box, SHADED_SHAPE, COL_SHADED);
    }

    if (cell & DRAWFLAG_MISTAKE) {
      // Mistake overlay: an error-colored outline at the cell's edge, beside
      // the piece.
      const t = Math.max(1, Math.floor(ts / 16));
      const sx = startX + 1;
      const sy = startY + 1;
      const span = ts - 3;
      dr.drawRect({ x: sx, y: sy, w: span, h: t }, COL_ERROR);
      dr.drawRect({ x: sx, y: sy + span - t, w: span, h: t }, COL_ERROR);
      dr.drawRect({ x: sx, y: sy, w: t, h: span }, COL_ERROR);
      dr.drawRect({ x: sx + span - t, y: sy, w: t, h: span }, COL_ERROR);
    }

    const clue = clueText(startX, startY, ts);
    if (clueVal >= 0) {
      const at = clue.origin;
      let textColor: number;
      if (cell & STATE_ERROR) {
        // On the piece and on the clear square a contradicted number is a
        // badge: red ink on either is a difference of hue with little of
        // lightness in the dark scheme.
        const badged = shaded || clear;
        if (badged) dr.drawCircle(at, ts * 0.32, COL_ERROR, COL_ERROR);
        textColor = badged ? COL_ERROR_TEXT : COL_ERROR;
      } else if (cell & STATE_SOLVED) {
        // A satisfied number's own square is decided, as every square round
        // it is, so it sits on the piece or on the clear square.
        textColor = shaded ? COL_TEXT_SOLVED_ON_PIECE : COL_CLEAR_MARK;
      } else {
        textColor = shaded ? COL_TEXT_ON_PIECE : COL_TEXT;
      }
      dr.drawText(at, clue.options, textColor, String(clueVal));
    }

    // The block's outline lies inside the tile, so its own repaint undoes it.
    // The ring round a square is drawn by `redraw`, after every tile.
    const sides = cell >>> HINT_SIDES_SHIFT;
    const band: MarkBand = {
      box,
      outer: 0,
      inner: Math.max(2, ts >> 4),
    };
    drawMarkSides(dr, band, (sides >> 4) & MARK_ALL, COL_HINT_EVIDENCE);
    // The number a step names is circled, inside the square and clear of its
    // edge, so it shows on a square the step also rings. On the piece the
    // circle takes the number's own ink: the evidence color against the piece
    // is a difference of hue with little of lightness.
    if (cell & DRAWFLAG_HINT_NUMBER) {
      const center = { x: startX + (ts >> 1) - 1, y: startY + (ts >> 1) - 1 };
      for (let i = 0; i < band.inner; i++)
        dr.drawCircle(
          center,
          ts * 0.33 - i,
          -1,
          shaded ? COL_TEXT_ON_PIECE : COL_HINT_EVIDENCE,
        );
    }
  }

  dr.unclip();
  dr.drawUpdate(tile);
}

// --- redraw ---------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: MosaicDrawState,
  _prev: MosaicState | null,
  state: MosaicState,
  _dir: number,
  ui: MosaicUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<MosaicMove, MosaicHint>,
  mistakes?: readonly MosaicMistake[],
): void {
  const ts = ds.tileSize;
  const { width, height, board, cells } = state;

  const marks = stepMarks(hint);
  // Each number's block is outlined whole, so two that overlap read as two
  // squares and not as the one area they cover between them.
  const blocks = marks
    .of("outline", BLOCK)
    .map((clue) => new MarkOutlines([], blockOf(clue, width, height), {}));
  const rings = new MarkOutlines(marks.of("ring", CELL), [], {});
  const hintSides = (x: number, y: number): number =>
    blocks.reduce((sides, block) => sides | block.packed(x, y), rings.packed(x, y));
  const named = new Set(marks.of("outline", BLOCK).map((c) => c.y * width + c.x));

  const mistakeSet = new Set(mistakes?.map((m) => m.y * width + m.x));

  // A ring may reach into the tiles round its square, so when the rings
  // change those tiles repaint, before the rings that stay are drawn again.
  const ringed = marks.of("ring", CELL).map((c) => c.y * width + c.x);
  if (ringed.join() !== ds.ringed.join())
    for (const i of ds.ringed)
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const x = (i % width) + dx;
          const y = Math.floor(i / width) + dy;
          if (x >= 0 && y >= 0 && x <= width && y <= height)
            ds.cache[y * (width + 1) + x] = -1;
        }
  ds.ringed = ringed;

  for (let y = 0; y <= height; y++) {
    for (let x = 0; x <= width; x++) {
      const inBounds = x < width && y < height;
      let cell = inBounds ? cells[y * width + x] : 0;
      if (x === width) cell |= DRAWFLAG_MARGIN_R;
      if (y === height) cell |= DRAWFLAG_MARGIN_D;
      if (inBounds) cell |= flash.win(sweepStep(x, y)) << WIN_SHIFT;
      if (ui.cursor.visible) {
        if (ui.cursor.x === x && ui.cursor.y === y) cell |= DRAWFLAG_CURSOR;
        if (ui.cursor.x === x - 1 && ui.cursor.y === y) cell |= DRAWFLAG_CURSOR_L;
        if (ui.cursor.x === x && ui.cursor.y === y - 1) cell |= DRAWFLAG_CURSOR_U;
        if (ui.cursor.x === x - 1 && ui.cursor.y === y - 1) cell |= DRAWFLAG_CURSOR_UL;
      }
      if (inBounds && mistakeSet.has(y * width + x)) cell |= DRAWFLAG_MISTAKE;
      if (inBounds) cell |= hintSides(x, y) << HINT_SIDES_SHIFT;
      if (inBounds && named.has(y * width + x)) cell |= DRAWFLAG_HINT_NUMBER;

      const clueVal = inBounds ? board.clues[y * width + x] : -1;

      const cachePos = y * (width + 1) + x;
      if (ds.cache[cachePos] !== cell) {
        drawCell(dr, cell, ts, clueVal, x, y);
        ds.cache[cachePos] = cell;
      }
    }
  }

  // Every frame, since a tile a ring reaches into may have repainted.
  for (const i of ringed)
    drawSquareRing(dr, state, ts, i % width, Math.floor(i / width));
}

/** The number square `(x, y)` shows, as a ring keeps clear of it, or none. */
function numberBox(state: MosaicState, ts: number, x: number, y: number): Rect | null {
  if (x < 0 || y < 0 || x >= state.width || y >= state.height) return null;
  const clueVal = state.board.clues[y * state.width + x];
  if (clueVal < 0) return null;
  const clue = clueText(x * ts + margin(ts), y * ts + margin(ts), ts);
  return textBox(clue.origin, clue.options, String(clueVal));
}

/**
 * The ring round square `(x, y)`, round its number. Inside the tile where
 * one fits there; where none does (50×50 on a phone) it reaches half a tile
 * into the neighbors, between their numbers, with the thinnest stroke.
 */
function drawSquareRing(
  dr: GameDrawing,
  state: MosaicState,
  ts: number,
  x: number,
  y: number,
): void {
  const startX = x * ts + margin(ts);
  const startY = y * ts + margin(ts);
  const box = { x: startX, y: startY, w: ts - 1, h: ts - 1 };
  const tile = { x: startX - 1, y: startY - 1, w: ts, h: ts };
  const own = numberBox(state, ts, x, y);
  const avoid: Rect[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const n = dx || dy ? numberBox(state, ts, x + dx, y + dy) : null;
      if (n) avoid.push(n);
    }
  const clear = { enclose: own ? [own] : [], avoid };
  // The number sits a pixel off the square's center at small sizes, so the
  // ring may use the whole tile to center on it.
  const thickness = Math.max(2, ts >> 4);
  if (ringFits(box, clear, thickness, tile)) {
    dr.drawRing(box, clear, thickness, { room: tile });
    dr.drawUpdate(tile);
    return;
  }
  const reach = Math.floor(ts / 2);
  const room = {
    x: tile.x - reach,
    y: tile.y - reach,
    w: tile.w + 2 * reach,
    h: tile.h + 2 * reach,
  };
  dr.drawRing(box, clear, 1, { room });
  dr.drawUpdate(room);
}
