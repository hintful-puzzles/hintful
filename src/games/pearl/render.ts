/**
 * Pearl rendering — port of `game_redraw` / `draw_square` /
 * `draw_lines_specific` / `game_colours` / `game_compute_size` (pearl.c),
 * using the `NARROW_BORDERS` geometry the web build compiles (border =
 * BORDER_WIDTH + 1, not a half/eighth-tile gutter).
 *
 * Two appearance styles select off the `appearance` preference on the Ui:
 * traditional Masyu (square cell outlines + a full grid border) and loopy
 * (center dots + inter-cell grid lines). A per-cell packed `Int32Array`
 * cache mirrors upstream's `lflags`; the `findMistakes` wrong-edge overlay
 * rides its own bit field in that word so it is part of the diff key
 * (docs/games/rendering.md § "The tile cache and the diff key").
 */

import { mkhighlight } from "../../engine/color/color-mkhighlight.ts";
import { BLACK, WHITE } from "../../engine/color/colors.ts";
import {
  DRAG_ADD,
  DRAG_REMOVE,
  ERROR,
  FLASH,
  GRID_DARK,
  HINT_ACTION,
  HINT_EVIDENCE,
  highlightWash,
  RULED_OUT,
} from "../../engine/color/palette.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { drawMarkSides, outlineSides } from "../../engine/hint-mark.ts";
import type { Color, Size } from "../../engine/types.ts";
import type { PearlHint } from "./hint.ts";
import { interpretUiDrag } from "./moves.ts";
import {
  CW,
  D,
  DX,
  DY,
  ERROR_CLUE,
  F,
  L,
  NOCLUE,
  type PearlMove,
  type PearlParams,
  type PearlState,
  type PearlUi,
  R,
  STRAIGHT,
  U,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 31;
export const FLASH_TIME = 0.5;

// --- palette (index-for-index with the pearl.c color enum) ---------------
export const COL_BACKGROUND = 0;
export const COL_HIGHLIGHT = 1;
export const COL_LOWLIGHT = 2;
export const COL_BLACK = 3;
export const COL_WHITE = 4;
export const COL_ERROR = 5;
export const COL_GRID = 6;
export const COL_FLASH = 7;
export const COL_DRAGON = 8;
export const COL_DRAGOFF = 9;
export const COL_MISTAKE = 10; // appended past the C enum (findMistakes overlay)
/** The keyboard cursor's cell fill — upstream aliased it to `COL_LOWLIGHT`, a
 * tint of the board. Appended; Pearl's dark-mode `paletteOverrides` touch only
 * index 0. */
export const COL_CURSOR_BACKGROUND = 11;
/** The player's edge crosses. Their own slot rather than upstream's pearl
 * `COL_BLACK`, which stays black in both schemes and sank into a dark board. */
export const COL_RULED_OUT = 12;
/** The edges a hint step decides, drawn as the line or cross it asks for. */
export const COL_HINT = 13;
/** The squares a hint step reasons from, outlined. */
export const COL_HINT_CELL = 14;

export function colors(defaultBackground: Color): Color[] {
  const { background, highlight, lowlight } = mkhighlight(defaultBackground);
  const out: Color[] = [];
  out[COL_BACKGROUND] = background;
  out[COL_HIGHLIGHT] = highlight;
  out[COL_LOWLIGHT] = lowlight;
  out[COL_BLACK] = BLACK;
  out[COL_WHITE] = WHITE;
  out[COL_GRID] = GRID_DARK;
  out[COL_ERROR] = ERROR;
  out[COL_FLASH] = FLASH;
  out[COL_DRAGON] = DRAG_ADD;
  out[COL_DRAGOFF] = DRAG_REMOVE;
  out[COL_MISTAKE] = ERROR;
  // A whole-cell fill under the pearls and lines: the "you are here" wash
  // Solo's family uses, not the green mark, which as a cell fill would shout.
  out[COL_CURSOR_BACKGROUND] = highlightWash(background);
  out[COL_RULED_OUT] = RULED_OUT;
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_CELL] = HINT_EVIDENCE;
  return out;
}

// --- appearance styles (upstream gui_style) -------------------------------
export const GUI_MASYU = 0;
export const GUI_LOOPY = 1;

// --- drawstate flag bits (upstream DS_*) ----------------------------------
const DS_ESHIFT = 4; // R/U/L/D shift, error flags
const DS_DSHIFT = 8; // R/U/L/D shift, drag-in-progress flags
const DS_MSHIFT = 12; // R/U/L/D shift, no-line marks
const DS_XSHIFT = 16; // R/U/L/D shift, findMistakes wrong-edge overlay
const DS_ERROR_CLUE = 1 << 20;
const DS_FLASH = 1 << 21;
const DS_CURSOR = 1 << 22;
const DS_WSHIFT = 23; // R/U/L/D shift, findMistakes wrong-cross overlay

// --- hint draw flags ------------------------------------------------------
//
// A word of its own beside `lflags`, compared in the same cache-miss test, so a
// hint displayed on an otherwise unchanged board still repaints
// (docs/games/rendering.md § "The tile cache and the diff key"). Edge bits are
// set on both squares sharing the edge, and each paints its own half.
const H_LINE_SHIFT = 0; // 4 bits: edges the step says must be lines
const H_CROSS_SHIFT = 4; // 4 bits: edges the step says can't be
const H_AREA_SHIFT = 8; // 4 bits: sides of the evidence outline to paint

export interface PearlDrawState {
  started: boolean;
  tileSize: number;
  w: number;
  h: number;
  lflags: Int32Array;
  /** Per-square hint marks: part of the diff key, see the `H_*` bits. */
  hint: Int32Array;
}

export function newDrawState(state: PearlState, tileSize: number): PearlDrawState {
  return {
    started: false,
    tileSize,
    w: state.w,
    h: state.h,
    lflags: new Int32Array(state.w * state.h),
    hint: new Int32Array(state.w * state.h),
  };
}

// --- geometry (NARROW_BORDERS) --------------------------------------------
export interface Metrics {
  halfsz: number;
  tile: number;
  borderWidth: number;
  border: number;
}
export function metrics(tileSize: number): Metrics {
  const halfsz = (tileSize - 1) >> 1;
  const tile = halfsz * 2 + 1;
  const borderWidth = Math.max((tile / 32) | 0, 1);
  return { halfsz, tile, borderWidth, border: borderWidth + 1 };
}
export function coord(x: number, m: Metrics): number {
  return x * m.tile + m.border;
}
export function centeredCoord(x: number, m: Metrics): number {
  return coord(x, m) + ((m.tile / 2) | 0);
}
export function fromCoord(px: number, m: Metrics): number {
  return px < m.border ? -1 : Math.floor((px - m.border) / m.tile);
}

export function computeSize(p: PearlParams, tileSize: number): Size {
  const m = metrics(tileSize);
  return { w: p.w * m.tile + 2 * m.border, h: p.h * m.tile + 2 * m.border };
}

// --- drawing ---------------------------------------------------------------
function drawLine(
  dr: GameDrawing,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  c: number,
): void {
  dr.drawLine({ x: x1, y: y1 }, { x: x2, y: y2 }, c, 1);
}

/** Draw the four laid/error/drag/mistake segments in a cell for one flag
 * layer (upstream `draw_lines_specific`). */
function drawLinesSpecific(
  dr: GameDrawing,
  m: Metrics,
  x: number,
  y: number,
  lflags: number,
  shift: number,
  c: number,
): void {
  const ox = coord(x, m);
  const oy = coord(y, m);
  const t2 = m.halfsz;
  const t16 = m.halfsz >> 2;
  const cx = ox + t2;
  const cy = oy + t2;

  for (let d = 1; d < 16; d *= 2) {
    const xoff = t2 * DX(d);
    const yoff = t2 * DY(d);
    const xnudge = Math.abs(t16 * DX(CW(d)));
    const ynudge = Math.abs(t16 * DY(CW(d)));

    if ((lflags >> shift) & d) {
      const lx = cx + (xoff < 0 ? xoff : 0) - xnudge;
      const ly = cy + (yoff < 0 ? yoff : 0) - ynudge;
      if (c === COL_DRAGOFF && !(lflags & d)) continue;
      if (c === COL_DRAGON && lflags & d) continue;
      dr.drawRect(
        {
          x: lx,
          y: ly,
          w: Math.abs(xoff) + 2 * xnudge + 1,
          h: Math.abs(yoff) + 2 * ynudge + 1,
        },
        c,
      );
      // end cap
      dr.drawRect({ x: cx - t16, y: cy - t16, w: 2 * t16 + 1, h: 2 * t16 + 1 }, c);
    }
  }
}

function drawSquare(
  dr: GameDrawing,
  ds: PearlDrawState,
  guiStyle: number,
  x: number,
  y: number,
  lflags: number,
  hint: number,
  clue: number,
): void {
  const m = metrics(ds.tileSize);
  const ox = coord(x, m);
  const oy = coord(y, m);
  const t2 = m.halfsz;
  const t16 = m.halfsz >> 2;
  const cx = ox + t2;
  const cy = oy + t2;

  dr.clip({ x: ox, y: oy, w: m.tile, h: m.tile });
  dr.drawRect(
    { x: ox, y: oy, w: m.tile, h: m.tile },
    lflags & DS_CURSOR ? COL_CURSOR_BACKGROUND : COL_BACKGROUND,
  );

  if (guiStyle === GUI_LOOPY) {
    dr.drawCircle({ x: cx, y: cy }, t16, COL_GRID, COL_GRID);
  } else {
    drawLine(dr, ox, oy, coord(x + 1, m), oy, COL_GRID);
    drawLine(dr, ox, oy, ox, coord(y + 1, m), COL_GRID);
  }

  // The hint's evidence outline, on the square's border and under everything
  // the square holds, so the lines crossing that border stay on top of it.
  const band = Math.max(2, Math.floor(m.tile / 14));
  const box = { x: ox, y: oy, w: m.tile, h: m.tile };
  drawMarkSides(
    dr,
    { box, outer: 0, inner: band },
    hint >> H_AREA_SHIFT,
    COL_HINT_CELL,
  );

  // Thin gridlines or no-line marks (drawn first; thick lines go on top). A
  // cross the step asks for is the player's cross in the hint's color, drawn
  // heavier so it reads as a mark rather than a stroke of the grid.
  const cross = (mx: number, my: number, msz: number, c: number, thick: number) => {
    dr.drawLine({ x: mx - msz, y: my - msz }, { x: mx + msz, y: my + msz }, c, thick);
    dr.drawLine({ x: mx - msz, y: my + msz }, { x: mx + msz, y: my - msz }, c, thick);
  };
  for (let d = 1; d < 16; d *= 2) {
    const xoff = t2 * DX(d);
    const yoff = t2 * DY(d);
    if (
      (x === 0 && d === L) ||
      (y === 0 && d === U) ||
      (x === ds.w - 1 && d === R) ||
      (y === ds.h - 1 && d === D)
    )
      continue; // no gridlines out to the border
    if ((lflags >> DS_MSHIFT) & d) {
      const wrong = (lflags >> DS_WSHIFT) & d;
      cross(cx + xoff, cy + yoff, t16, wrong ? COL_MISTAKE : COL_RULED_OUT, 1);
    } else if ((hint >> H_CROSS_SHIFT) & d) {
      cross(cx + xoff, cy + yoff, t16, COL_HINT, Math.max(2, band));
    } else if (guiStyle === GUI_LOOPY) {
      drawLine(dr, cx, cy, cx + xoff, cy + yoff, COL_GRID);
    }
  }

  // The lines the step asks for: the path the player's own will take, drawn at
  // half its weight so it reads as proposed rather than laid.
  for (let d = 1; d < 16; d *= 2)
    if ((hint >> H_LINE_SHIFT) & d)
      dr.drawLine(
        { x: cx, y: cy },
        { x: cx + t2 * DX(d), y: cy + t2 * DY(d) },
        COL_HINT,
        Math.max(2, t16),
      );

  // Laid lines. Order matters for the exposed end-cap colors.
  drawLinesSpecific(dr, m, x, y, lflags, 0, lflags & DS_FLASH ? COL_FLASH : COL_BLACK);
  drawLinesSpecific(dr, m, x, y, lflags, DS_ESHIFT, COL_ERROR);
  drawLinesSpecific(dr, m, x, y, lflags, DS_XSHIFT, COL_MISTAKE);
  drawLinesSpecific(dr, m, x, y, lflags, DS_DSHIFT, COL_DRAGOFF);
  drawLinesSpecific(dr, m, x, y, lflags, DS_DSHIFT, COL_DRAGON);

  // Clue.
  if (clue !== NOCLUE) {
    const c = lflags & DS_FLASH ? COL_FLASH : clue === STRAIGHT ? COL_WHITE : COL_BLACK;
    if (lflags & DS_ERROR_CLUE)
      dr.drawCircle({ x: cx, y: cy }, ((m.tile * 3) / 8) | 0, COL_ERROR, COL_ERROR);
    dr.drawCircle({ x: cx, y: cy }, (m.tile / 4) | 0, c, COL_BLACK);
  }

  dr.unclip();
  dr.drawUpdate({ x: ox, y: oy, w: m.tile, h: m.tile });
}

export function redraw(
  dr: GameDrawing,
  ds: PearlDrawState,
  _prev: PearlState | null,
  state: PearlState,
  _dir: number,
  ui: PearlUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<PearlMove, PearlHint>,
  mistakes?: readonly { x: number; y: number; dir: number; cross: boolean }[],
): void {
  const { w, h } = state;
  const m = metrics(ds.tileSize);
  const guiStyle = ui.guiStyle;
  let force = false;

  if (!ds.started) {
    if (guiStyle === GUI_MASYU) {
      // The black rectangle behind the whole grid.
      dr.drawRect(
        {
          x: m.border - m.borderWidth,
          y: m.border - m.borderWidth,
          w: w * m.tile + 2 * m.borderWidth + 1,
          h: h * m.tile + 2 * m.borderWidth + 1,
        },
        COL_GRID,
      );
    }
    dr.drawUpdate({
      x: 0,
      y: 0,
      w: w * m.tile + 2 * m.border,
      h: h * m.tile + 2 * m.border,
    });
    ds.started = true;
    force = true;
  }

  let flashing = 0;
  if (
    flashTime > 0 &&
    (flashTime <= FLASH_TIME / 3 || flashTime >= (FLASH_TIME * 2) / 3)
  )
    flashing = DS_FLASH;

  // In-progress drag preview.
  const draglines = new Uint8Array(w * h);
  if (ui.ndragcoords > 0) {
    const clearing = { v: true };
    for (let i = 0; i < ui.ndragcoords - 1; i++) {
      const leg = interpretUiDrag(state, ui.dragcoords, clearing, i);
      draglines[leg.sy * w + leg.sx] ^= leg.oldstate ^ leg.newstate;
      draglines[leg.dy * w + leg.dx] ^= F(leg.oldstate) ^ F(leg.newstate);
    }
  }

  // findMistakes wrong-edge overlay → per-cell bitmaps, lines and crosses.
  const wrong = new Uint8Array(w * h);
  const wrongCross = new Uint8Array(w * h);
  if (mistakes)
    for (const mk of mistakes)
      (mk.cross ? wrongCross : wrong)[mk.y * w + mk.x] |= mk.dir;

  const hintWords = hintFlags(state, hint);

  for (let x = 0; x < w; x++)
    for (let y = 0; y < h; y++) {
      const i = y * w + x;
      let f = state.lines[i];
      f |= (state.errors[i] & (R | U | L | D)) << DS_ESHIFT;
      f |= draglines[i] << DS_DSHIFT;
      f |= state.marks[i] << DS_MSHIFT;
      f |= wrong[i] << DS_XSHIFT;
      f |= wrongCross[i] << DS_WSHIFT;
      if (state.errors[i] & ERROR_CLUE) f |= DS_ERROR_CLUE;
      f |= flashing;
      if (ui.cursor.visible && x === ui.cursor.x && y === ui.cursor.y) f |= DS_CURSOR;

      if (f !== ds.lflags[i] || hintWords[i] !== ds.hint[i] || force) {
        ds.lflags[i] = f;
        ds.hint[i] = hintWords[i];
        drawSquare(dr, ds, guiStyle, x, y, f, hintWords[i], state.clues[i]);
      }
    }
}

/** The `H_*` word for every square, from the displayed step. */
function hintFlags(
  state: PearlState,
  step?: HintStep<PearlMove, PearlHint>,
): Int32Array {
  const { w, h } = state;
  const out = new Int32Array(w * h);
  const hl = step?.highlights;
  if (!hl) return out;
  for (const t of hl.targets) {
    const shift = t.line ? H_LINE_SHIFT : H_CROSS_SHIFT;
    const far = t.sq + DY(t.dir) * w + DX(t.dir);
    out[t.sq] |= t.dir << shift;
    out[far] |= F(t.dir) << shift;
  }
  // One contour round a contiguous region, one ring per scattered square
  // (`engine/hint-mark.ts`).
  const inArea = new Set(hl.area);
  for (const c of hl.area) {
    const sides = outlineSides(
      c % w,
      Math.floor(c / w),
      (ax, ay) => ax >= 0 && ax < w && ay >= 0 && ay < h && inArea.has(ay * w + ax),
    );
    out[c] |= sides << H_AREA_SHIFT;
  }
  return out;
}
