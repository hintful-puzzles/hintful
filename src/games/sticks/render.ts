/**
 * Sticks rendering: a per-tile diffed loop on the collection's quiet surface.
 * An open cell is the cell surface inside a thin grid line; a block is the
 * collection's wall over its whole tile, so a run of them is one mass. On top go a
 * center bar in the piece's color for a placed line, the clue number as text (white on a
 * block, ink on an open cell, red when its constraint is currently violated),
 * and the cursor's frame under the keyboard cursor. The in-flight drag previews its accreted cells; the win flash
 * fills each open cell it passes with the flash color, under its line. `findMistakes` cells get
 * an inset red frame via an `OverlaySidecar` (docs/rendering.md § "Overlay sidecars" — the overlay is
 * part of the diff key so Check & Save repaints an otherwise-unchanged
 * frame).
 *
 * The border is upstream's `NARROW_BORDERS` one, `tileSize / 10` (its web
 * build's, not the desktop `tileSize / 2`), and `computeSize` subtracts 1 to
 * meet the outer grid line.
 */

import { WHITE } from "../../engine/color/colors.ts";
import {
  cellSurface,
  ERROR_TEXT,
  INK,
  SHADED,
  surfaceGrid,
  wallFill,
} from "../../engine/color/palette.ts";
import {
  COL_CURSOR,
  COL_ERROR,
  COL_HINT_OUTLINE,
  FIRST_GAME_SLOT,
  rolePalette,
} from "../../engine/color/roles.ts";
import type { Frame, GameDrawing } from "../../engine/contract/game.ts";
import { stepMarks } from "../../engine/contract/hint-words.ts";
import type {
  Color,
  DrawTextOptions,
  Point,
  Size,
} from "../../engine/contract/types.ts";
import {
  drawRectOutline,
  drawThickRectOutline,
  glyphFont,
} from "../../engine/render/draw.ts";
import {
  drawCellRing,
  drawMarkSides,
  MARK_ALL,
} from "../../engine/render/hint-mark.ts";
import { OverlaySidecar } from "../../engine/render/overlay-sidecar.ts";
import { NOTHING_TO_CLEAR, textBox } from "../../engine/render/ring.ts";
import { TileCache } from "../../engine/render/tile-cache.ts";
import {
  sweepStep,
  WIN_NONE,
  type WinTone,
  winSlot,
} from "../../engine/render/win-wave.ts";
import type { SticksHint } from "./hint.ts";
import { findLiveErrors } from "./solver.ts";
import {
  F_BLOCK,
  F_HOR,
  F_VER,
  type SticksMistake,
  type SticksMove,
  type SticksParams,
  type SticksState,
  type SticksUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 48;

// --- palette ----------------------------------------------------------------

export const COL_GRID = FIRST_GAME_SLOT; // the line between two cells, and the frame
export const COL_LINE = FIRST_GAME_SLOT + 1;
export const COL_NUMBER = FIRST_GAME_SLOT + 2;
/** A block: the collection's wall. */
export const COL_BLOCK = FIRST_GAME_SLOT + 3;
export const COL_CELL = FIRST_GAME_SLOT + 4; // the surface of a white cell
export const COL_TEXT = FIRST_GAME_SLOT + 5; // a clue's number on an open cell
/** A violated clue's digit on a block, on its badge. */
export const COL_ERROR_TEXT = FIRST_GAME_SLOT + 6;

export function colors(defaultBackground: Color): Color[] {
  const out = rolePalette(defaultBackground);
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
  out[COL_ERROR_TEXT] = ERROR_TEXT;
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
// The orientation the hint's ring holds: the ring and the outline are the
// sidecar's, this is what the ring draws inside it.
const F_HINT_HOR = 1 << 11;
const F_HINT_VER = 1 << 12;
// The win flash's tone on the cell, two bits.
const F_FLASH_SHIFT = 14;

export interface SticksDrawState {
  tileSize: number;
  /** What each cell shows, the hint's marks and the mistakes on it. */
  tiles: TileCache;
  hint: OverlaySidecar;
  mistakes: OverlaySidecar;
}

export function newDrawState(state: SticksState, tileSize: number): SticksDrawState {
  const hint = new OverlaySidecar(state.w * state.h);
  const mistakes = new OverlaySidecar(state.w * state.h);
  return {
    tileSize,
    tiles: new TileCache(state.w * state.h, { overlays: [hint, mistakes] }),
    hint,
    mistakes,
  };
}

// --- cell drawing -----------------------------------------------------------

interface TileVisual {
  tile: number;
  clue: number;
  error: boolean;
  cursor: boolean;
  /** The win flash's tone on this square. */
  lit: WinTone;
  mistake: boolean;
  /** The hint's forced orientation for this square (`F_HOR`/`F_VER`/0). */
  hintLine: number;
  /** The sides of this square the hint's outline runs along. */
  outline: number;
}

/** Where the clue of the cell at `(x, y)` is written: read by the text and by
 * the ring round it. */
function clueText(
  ts: number,
  x: number,
  y: number,
): { origin: Point; options: DrawTextOptions } {
  const b = border(ts);
  return {
    origin: { x: Math.floor((x + 0.5) * ts) + b, y: Math.floor((y + 0.5) * ts) + b },
    options: glyphFont(Math.floor(ts * 0.7)),
  };
}

function drawTile(
  dr: GameDrawing,
  ts: number,
  x: number,
  y: number,
  v: TileVisual,
): void {
  const { tile, clue, error, cursor, lit, mistake, hintLine, outline } = v;
  const b = border(ts);
  const px = x * ts + b;
  const py = y * ts + b;
  const black = (tile & F_BLOCK) !== 0;

  // A block takes its whole tile, the grid line on its right and bottom
  // included: the block's own edge is the boundary there.
  dr.drawRect({ x: px, y: py, w: ts, h: ts }, black ? COL_BLOCK : COL_GRID);
  const box = { x: px, y: py, w: ts - 1, h: ts - 1 };
  const band = { box, outer: 0, inner: Math.max(2, Math.floor(ts / 10)) };
  if (!black) dr.drawRect(box, lit ? winSlot(lit) : COL_CELL);

  const bar = (bits: number, color: number): void => {
    const off = Math.floor((ts * 2) / 5);
    const thick = Math.floor(ts / 5);
    if (bits & F_HOR) dr.drawRect({ x: px, y: py + off, w: ts - 1, h: thick }, color);
    if (bits & F_VER) dr.drawRect({ x: px + off, y: py, w: thick, h: ts - 1 }, color);
  };
  bar(tile, COL_LINE);

  // Evidence is outlined, never filled, block or open: a fill on a block hides
  // the very block the argument is about, and on an open square a fill pale
  // enough to leave the clue digit legible is too faint to read as a mark.
  if (black && outline !== 0) {
    // An outlined block is a clue the step names, never part of an area of
    // squares, so it is a box of its own, inset from the block's edge as
    // Lightup's wall is. The outline is close to the block's own gray in the
    // light scheme, so a line in the digit's white parts the two.
    const m = Math.floor(ts / 12);
    const t = band.inner;
    const side = ts - 1 - 2 * m;
    drawMarkSides(
      dr,
      { box: { x: px + m, y: py + m, w: side, h: side }, outer: 0, inner: t },
      MARK_ALL,
      COL_HINT_OUTLINE,
    );
    drawRectOutline(dr, px + m + t, py + m + t, side - 2 * t, side - 2 * t, COL_NUMBER);
  } else {
    drawMarkSides(dr, band, outline, COL_HINT_OUTLINE);
  }

  const clueAt = clueText(ts, x, y);
  if (clue !== -1) {
    // A violated clue on a block is a badge: the error color as a digit is as
    // light as the block in the dark scheme, and is told from it by hue alone.
    const badge = error && black;
    if (badge)
      dr.drawCircle(clueAt.origin, Math.floor(ts * 0.38), COL_ERROR, COL_ERROR);
    dr.drawText(
      clueAt.origin,
      clueAt.options,
      badge ? COL_ERROR_TEXT : error ? COL_ERROR : black ? COL_NUMBER : COL_TEXT,
      String(clue),
    );
  }

  // The forced line, in the game's own bar shape inside the ring — a ring
  // alone could not say *which* orientation, which is the whole of the move.
  // Drawn, never placed: the player still makes the move.
  if (hintLine)
    drawCellRing(
      dr,
      band,
      clue === -1
        ? NOTHING_TO_CLEAR
        : {
            enclose: [textBox(clueAt.origin, clueAt.options, String(clue))],
            avoid: [],
          },
      (ink) => bar(hintLine, ink),
    );

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
  frame: Frame<SticksState, SticksUi, SticksMove, SticksHint, SticksMistake>,
): void {
  const { state, ui, flash, hint, mistakes } = frame;
  const ts = ds.tileSize;
  const { w, h, grid, numbers } = state;
  const b = border(ts);

  if (ds.tiles.firstFrame()) {
    // The frame, one line wide like the grid: each tile draws the line on its
    // right and bottom, so this is the top and left ones that are missing.
    drawRectOutline(dr, b - 1, b - 1, w * ts + 1, h * ts + 1, COL_GRID);
  }

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

  // The displayed hint step's marks; its ringed square carries the forced
  // line, in the orientation the step asks.
  ds.hint.pack(stepMarks(hint), (x, y) => y * w + x);
  const hintBits = hint?.highlights?.targets[0].value === 1 ? F_HOR : F_VER;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let tile = grid[i];

      const preview = !(tile & F_BLOCK) ? dragMap?.get(i) : undefined;
      if (preview !== undefined) tile = preview;

      // A block is a wall, and the flash runs over the cells that hold lines.
      const lit = tile & F_BLOCK ? WIN_NONE : flash.win(sweepStep(x, y));
      const cursor = ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y;
      // A previewed (uncommitted) cell suppresses its error highlight — the
      // committed grid is what the error check ran on.
      const error = preview === undefined && (errorSet?.has(i) ?? false);
      const hintLine = ds.hint.ringed(i) ? hintBits : 0;

      const packed =
        (tile & 0x7) |
        (error ? F_ERR : 0) |
        (cursor ? F_CUR : 0) |
        (lit << F_FLASH_SHIFT) |
        (hintLine & F_HOR ? F_HINT_HOR : 0) |
        (hintLine & F_VER ? F_HINT_VER : 0);
      if (ds.tiles.changed(i, packed)) {
        drawTile(dr, ts, x, y, {
          tile,
          clue: numbers[i],
          error,
          cursor,
          lit,
          mistake: ds.mistakes.packed[i] !== 0,
          hintLine,
          outline: ds.hint.outlineSides(i),
        });
      }
    }
  }
}
