/**
 * Sticks rendering: a per-tile diffed loop on the collection's quiet surface.
 * An open cell is the cell surface inside a thin grid line; a block is the
 * collection's wall over its whole tile, so a run of them is one mass. On top go a
 * center bar in the piece's color for a placed line, the clue number as text (white on a
 * block, ink on an open cell, red when its constraint is currently violated),
 * and the cursor's frame under the keyboard cursor. The in-flight drag previews its accreted cells; on a fresh win the
 * lines blink off on alternate 0.1 s flash frames. `findMistakes` cells get
 * an inset red frame via an `OverlaySidecar` (docs/games/rendering.md § "Overlay sidecars" — the overlay is
 * part of the diff key so Check & Save repaints an otherwise-unchanged
 * frame).
 *
 * The border is upstream's `NARROW_BORDERS` one, `tileSize / 10` (its web
 * build's, not the desktop `tileSize / 2`), and `computeSize` subtracts 1 to
 * meet the outer grid line.
 */

import { WHITE } from "../../engine/color/colors.ts";
import {
  CURSOR,
  cellSurface,
  ERROR,
  ERROR_TEXT,
  HINT_ACTION,
  HINT_EVIDENCE,
  INK,
  SHADED,
  surfaceGrid,
  wallFill,
} from "../../engine/color/palette.ts";
import { drawRectOutline, drawThickRectOutline, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { drawMarkSides, MARK_ALL } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { OverlaySidecar } from "../../engine/overlay-sidecar.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import { findLiveErrors } from "./solver.ts";
import {
  F_BLOCK,
  F_HOR,
  F_VER,
  type SticksHint,
  type SticksMistake,
  type SticksMove,
  type SticksParams,
  type SticksState,
  type SticksUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 48;
const FLASH_FRAME = 0.1;
export const FLASH_TIME = FLASH_FRAME * 5;

// --- palette ----------------------------------------------------------------

export const COL_BACKGROUND = 0;
export const COL_GRID = 1; // the line between two cells, and the frame
export const COL_LINE = 2;
export const COL_NUMBER = 3;
export const COL_ERROR = 4;
export const COL_CURSOR = 5;
// Fork additions beyond upstream's COL_* enum: the explained hint.
export const COL_HINT = 6; // the forced square's line, in the game's own bar shape
export const COL_HINT_CELL = 7; // the deduction's evidence — an inset ring
/** A block: the collection's wall. */
export const COL_BLOCK = 8;
export const COL_CELL = 9; // the surface of a white cell
export const COL_TEXT = 10; // a clue's number on an open cell
/** A violated clue's digit on a block, on its badge. */
export const COL_ERROR_TEXT = 11;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_TEXT] = INK;
  // A placed stick is a bar filling a fifth of its cell — a piece, not a glyph,
  // so the piece's color rather than the entry green a digit takes.
  out[COL_LINE] = SHADED;
  // The digit on a block, pinned: the wall is a dark enough gray in both
  // schemes to carry white.
  out[COL_NUMBER] = WHITE;
  out[COL_BLOCK] = wallFill(defaultBackground);
  out[COL_ERROR] = ERROR;
  out[COL_ERROR_TEXT] = ERROR_TEXT;
  out[COL_CURSOR] = CURSOR;
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_CELL] = HINT_EVIDENCE;
  return out;
}

// --- geometry ---------------------------------------------------------------

export const border = (ts: number): number => Math.floor(ts / 10);

export function computeSize(p: SticksParams, ts: number): Size {
  // NARROW_BORDERS: -1 to match the grid outline drawn on first paint.
  return { w: p.w * ts + 2 * border(ts) - 1, h: p.h * ts + 2 * border(ts) - 1 };
}

// --- draw state -------------------------------------------------------------

// Cache flags above the tile bits (0..2: F_HOR | F_VER | F_BLOCK).
const F_ERR = 1 << 8;
const F_CUR = 1 << 9;
const F_FLASH = 1 << 10;
// The hint overlay is part of the diff key, or an otherwise-unchanged frame
// never repaints when a hint is shown or dismissed (docs/games/rendering.md § "Overlay sidecars").
const F_HINT_HOR = 1 << 11;
const F_HINT_VER = 1 << 12;
const F_HINT_EVID = 1 << 13;

export interface SticksDrawState {
  started: boolean;
  tileSize: number;
  cache: Int32Array;
  mistakes: OverlaySidecar;
}

export function newDrawState(state: SticksState, tileSize: number): SticksDrawState {
  return {
    started: false,
    tileSize,
    cache: new Int32Array(state.w * state.h).fill(-1),
    mistakes: new OverlaySidecar(state.w * state.h),
  };
}

// --- cell drawing -----------------------------------------------------------

interface TileVisual {
  tile: number;
  clue: number;
  error: boolean;
  cursor: boolean;
  mistake: boolean;
  /** The hint's forced orientation for this square (`F_HOR`/`F_VER`/0). */
  hintLine: number;
  /** This square is part of the displayed hint's evidence. */
  evidence: boolean;
}

function drawTile(
  dr: GameDrawing,
  ts: number,
  x: number,
  y: number,
  v: TileVisual,
): void {
  const { tile, clue, error, cursor, mistake, hintLine, evidence } = v;
  const b = border(ts);
  const px = x * ts + b;
  const py = y * ts + b;
  const black = (tile & F_BLOCK) !== 0;

  // A block takes its whole tile, the grid line on its right and bottom
  // included: the block's own edge is the boundary there.
  dr.drawRect({ x: px, y: py, w: ts, h: ts }, black ? COL_BLOCK : COL_GRID);
  // Evidence is an inset **ring** on every square, block or open — one rule and
  // one shape for one role. A fill on a block hides the very block
  // the argument is about; on an open one it is the wash itself that loses, since
  // a fill pale enough to leave the clue digit legible is too faint to read as a
  // mark (`hint-mark.ts`). A white evidence square is not empty either: it
  // carries the clue the deduction counts with, and often a line.
  if (!black) dr.drawRect({ x: px, y: py, w: ts - 1, h: ts - 1 }, COL_CELL);

  const bar = (bits: number, color: number): void => {
    const off = Math.floor((ts * 2) / 5);
    const thick = Math.floor(ts / 5);
    if (bits & F_HOR) dr.drawRect({ x: px, y: py + off, w: ts - 1, h: thick }, color);
    if (bits & F_VER) dr.drawRect({ x: px + off, y: py, w: thick, h: ts - 1 }, color);
  };
  bar(tile, COL_LINE);
  // The forced line, in the game's own bar shape and the hint color — a tint
  // could not say *which* orientation, which is the whole of the move. Drawn,
  // never placed: the player still makes the move.
  bar(hintLine, COL_HINT);

  if (evidence) {
    const m = Math.floor(ts / 12);
    drawMarkSides(
      dr,
      {
        box: { x: px + m, y: py + m, w: ts - 1 - 2 * m, h: ts - 1 - 2 * m },
        outer: 0,
        inner: Math.max(2, Math.floor(ts / 10)),
      },
      MARK_ALL,
      COL_HINT_CELL,
    );
    // On a block the ring is close to the block's own gray in the light scheme,
    // so a line in the digit's white parts the two.
    if (black) {
      const t = m + Math.max(2, Math.floor(ts / 10));
      drawRectOutline(dr, px + t, py + t, ts - 1 - 2 * t, ts - 1 - 2 * t, COL_NUMBER);
    }
  }

  if (clue !== -1) {
    const center = {
      x: Math.floor((x + 0.5) * ts) + b,
      y: Math.floor((y + 0.5) * ts) + b,
    };
    // A violated clue on a block is a badge: the error color as a digit is as
    // light as the block in the dark scheme, and is told from it by hue alone.
    const badge = error && black;
    if (badge) dr.drawCircle(center, Math.floor(ts * 0.38), COL_ERROR, COL_ERROR);
    dr.drawText(
      center,
      glyphFont(Math.floor(ts * 0.7)),
      badge ? COL_ERROR_TEXT : error ? COL_ERROR : black ? COL_NUMBER : COL_TEXT,
      String(clue),
    );
  }

  if (mistake) {
    // Inset red frame: this placed line contradicts the unique solution
    // (Check & Save's overlay — distinct from the red clue-number live
    // errors, which recolor the text above).
    const thick = Math.floor(ts / 7);
    const margin = Math.floor(ts / 20);
    const inner = ts - 1 - 2 * margin;
    drawThickRectOutline(dr, px + margin, py + margin, inner, inner, thick, COL_ERROR);
  }

  if (cursor) {
    const t = Math.floor(ts / 12);
    dr.drawRect({ x: px, y: py, w: t, h: ts - 1 }, COL_CURSOR);
    dr.drawRect({ x: px, y: py, w: ts - 1, h: t }, COL_CURSOR);
    dr.drawRect({ x: px + ts - 1 - t, y: py, w: t, h: ts - 1 }, COL_CURSOR);
    dr.drawRect({ x: px, y: py + ts - 1 - t, w: ts - 1, h: t }, COL_CURSOR);
  }

  dr.drawUpdate({ x: px, y: py, w: ts, h: ts });
}

// --- redraw -----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: SticksDrawState,
  _prev: SticksState | null,
  state: SticksState,
  _dir: number,
  ui: SticksUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<SticksMove, SticksHint>,
  mistakes?: readonly SticksMistake[],
): void {
  const ts = ds.tileSize;
  const { w, h, grid, numbers } = state;
  const b = border(ts);

  if (!ds.started) {
    // The frame, one line wide like the grid: each tile draws the line on its
    // right and bottom, so this is the top and left ones that are missing.
    drawRectOutline(dr, b - 1, b - 1, w * ts + 1, h * ts + 1, COL_GRID);
    ds.started = true;
  }

  const flash = flashTime > 0 && Math.floor(flashTime / FLASH_FRAME) % 2 === 0;

  // Live clue violations, recomputed pure from the committed grid (upstream
  // stores the equivalent F_ERROR bits in the state; same verdicts).
  const errorList = findLiveErrors(state);
  const errorSet = errorList.length > 0 ? new Set(errorList) : null;

  // In-flight drag preview: cell index → previewed tile value.
  const dragMap = ui.drag.length > 0 ? new Map<number, number>() : null;
  if (dragMap) {
    for (let d = 0; d < ui.drag.length; d++) dragMap.set(ui.drag[d], ui.dragMove[d]);
  }

  ds.mistakes.clear();
  for (const m of mistakes ?? []) ds.mistakes.add(m.index, 1);

  // The displayed hint step's forced square, which carries the forced line,
  // and the cells its argument rests on.
  const marks = stepMarks(hint);
  const at = (p: Point): number => p.y * w + p.x;
  const hintTargets = new Set(marks.of("ring", CELL).map(at));
  const hintBits = hint?.highlights?.to === "hor" ? F_HOR : F_VER;
  const hintEvidence = new Set(marks.of("outline", CELL).map(at));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let tile = grid[i];

      const preview = !(tile & F_BLOCK) ? dragMap?.get(i) : undefined;
      if (preview !== undefined) tile = preview;

      if (flash) tile &= ~(F_HOR | F_VER);
      const cursor = ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y;
      // A previewed (uncommitted) cell suppresses its error highlight — the
      // committed grid is what the error check ran on.
      const error = preview === undefined && (errorSet?.has(i) ?? false);
      const hintLine = hintTargets.has(i) ? hintBits : 0;
      const evidence = hintEvidence.has(i);

      const packed =
        (tile & 0x7) |
        (error ? F_ERR : 0) |
        (cursor ? F_CUR : 0) |
        (flash ? F_FLASH : 0) |
        (hintLine & F_HOR ? F_HINT_HOR : 0) |
        (hintLine & F_VER ? F_HINT_VER : 0) |
        (evidence ? F_HINT_EVID : 0);
      if (ds.cache[i] !== packed || ds.mistakes.stale(i)) {
        drawTile(dr, ts, x, y, {
          tile,
          clue: numbers[i],
          error,
          cursor,
          mistake: ds.mistakes.packed[i] !== 0,
          hintLine,
          evidence,
        });
        ds.cache[i] = packed;
        ds.mistakes.commit(i);
      }
    }
  }
}
