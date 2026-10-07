/**
 * Singles (Hitori) rendering. A per-tile diffed loop draws each cell as pieces
 * on a quiet surface (`engine/piece.ts`): a blacked-out cell holds the shaded
 * piece, a cell the player has marked as kept holds a ring round its number,
 * and an undecided cell is plain surface. Every cell shows its number, except
 * a blacked-out one while the show-black-numbers preference is off. The cursor
 * brackets, the hint's marks and the Check & Save outline (`findMistakes`) all
 * sit at the cell's edge, beside the piece and the ring.
 */

import { ORANGE, WHITE } from "../../engine/color/colors.ts";
import {
  CURSOR,
  cellSurface,
  ERROR,
  ERROR_TEXT,
  givenSurface,
  HINT_ACTION,
  HINT_BLACKREF,
  HINT_EVIDENCE,
  HINT_WHITEREF,
  INK,
  RULED_OUT,
  SHADED,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawRectCorners, drawThickRectOutline, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { drawMarkSides, MARK_ALL } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { drawPiece, SHADED_SHAPE } from "../../engine/piece.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import type { SinglesHint } from "./index.ts";
import {
  F_BLACK,
  F_CIRCLE,
  F_ERROR,
  type SinglesMove,
  type SinglesState,
  type SinglesUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 32;
export const FLASH_TIME = 0.7;

// --- palette ---------------------------------------------------------------

export const COL_BACKGROUND = 0;
export const COL_GRID = 1;
/** The surface of a cell, which is all an undecided cell is. */
export const COL_EMPTY = 2;
/** The surface under every cell that holds no piece while the board flashes. */
export const COL_FLASH = 3;
/** The number of a cell that holds no piece. */
export const COL_TEXT = 4;
export const COL_SHADED = 5;
/** The number on the shaded piece: pinned, because the piece is one color in
 * both schemes and ink is not. */
export const COL_SHADED_NUM = 6;
/** The ring round a number the player has marked as kept. */
export const COL_KEPT = 7;
export const COL_CURSOR = 8;
export const COL_ERROR = 9;
/** The number on a piece drawn in {@link COL_ERROR}. */
export const COL_ERROR_TEXT = 10;
export const COL_HINT = 11; // the cell(s) the displayed hint forces
export const COL_HINT_CELL = 12; // an undecided cell the deduction reasons from
export const COL_HINT_STRAND = 13; // the corner a corner-deduction protects
// A decided premise cell the reason *cites* is outlined in a color fixed by
// its kind, so a cited blacked-out square and a cited kept one read as
// distinct from the forced cell and from each other. The cell's own piece or
// ring is the cue that is not a color.
export const COL_HINT_BLACKREF = 14;
export const COL_HINT_WHITEREF = 15;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_EMPTY] = cellSurface(defaultBackground);
  out[COL_FLASH] = givenSurface(defaultBackground);
  out[COL_TEXT] = INK;
  out[COL_SHADED] = SHADED;
  out[COL_SHADED_NUM] = WHITE;
  out[COL_KEPT] = RULED_OUT;
  out[COL_CURSOR] = CURSOR;
  out[COL_ERROR] = ERROR;
  out[COL_ERROR_TEXT] = ERROR_TEXT;
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_CELL] = HINT_EVIDENCE;
  // A third hint part with its own hue: the corner cell a corner deduction
  // keeps open, which is neither the acted-on cell nor the evidence.
  out[COL_HINT_STRAND] = ORANGE;
  out[COL_HINT_BLACKREF] = HINT_BLACKREF;
  out[COL_HINT_WHITEREF] = HINT_WHITEREF;
  return out;
}

// --- geometry --------------------------------------------------------------

/** The board's pixel origin. Exported so `interpretMove` reads the same number
 * the painter does — one function, both callers
 * ([`docs/games/mechanics.md`](../../../docs/games/mechanics.md)). */
export const border = (ts: number): number => Math.floor(ts / 2);
const coord = (v: number, ts: number): number => v * ts + border(ts);
/** The thickness of a mark at the cell's edge (the cursor's brackets, a hint's
 * ring or outline): it reads as a highlight by color rather than by weight. */
const markT = (ts: number): number => Math.max(2, ts >> 4);
/** The radius of a kept cell's ring. It stands in from the cell's edge by more
 * than {@link markT}, so an edge mark lands beside the ring and never on it. */
const ringRadius = (ts: number): number =>
  (ts - 1) / 2 - Math.max(markT(ts) + 1, Math.round(ts / 10));
/** The number's size, which fits inside the ring. */
const textsz = (ts: number): number => Math.floor(1.5 * ringRadius(ts));

export function computeSize(p: { w: number; h: number }, ts: number): Size {
  return { w: ts * p.w + 2 * border(ts), h: ts * p.h + 2 * border(ts) };
}

// --- draw state ------------------------------------------------------------

const DS_BLACK = 0x1;
const DS_CIRCLE = 0x2;
const DS_CURSOR = 0x4;
const DS_BLACK_NUM = 0x8;
const DS_ERROR = 0x10;
const DS_FLASH = 0x20;
const DS_IMPOSSIBLE = 0x40;
const DS_MISTAKE = 0x80;
// Hint overlay: a forced cell, an evidence cell (outlined, in a color of its
// kind when it is a decided premise, whose state is then the reason), and a
// corner-deduction's protected corner.
const DS_HINT_TARGET = 0x100;
const DS_HINT_EVID = 0x200;
const DS_HINT_STRAND = 0x400;
const DS_HINT_LINE = 0x800; // on the line the sentence names: hatched

export interface SinglesDrawState {
  started: boolean;
  tileSize: number;
  w: number;
  h: number;
  cache: Int32Array;
  /** The color the frame round the grid was last drawn in, or null before the
   * first frame. */
  frame: number | null;
}

export function newDrawState(state: SinglesState, tileSize: number): SinglesDrawState {
  return {
    started: false,
    tileSize,
    w: state.w,
    h: state.h,
    cache: new Int32Array(state.n).fill(-1),
    frame: null,
  };
}

// --- tile drawing ----------------------------------------------------------

function tileRedraw(
  dr: GameDrawing,
  ts: number,
  x: number,
  y: number,
  num: number,
  f: number,
): void {
  const shaded = f & DS_BLACK;
  const error = f & DS_ERROR;
  // What is drawn on the surface is ink, and what is drawn on the piece is
  // pinned with it. An error takes both over: the piece turns to the error
  // color, and so do a number and a ring that stand on the surface.
  const tcol = shaded
    ? error
      ? COL_ERROR_TEXT
      : COL_SHADED_NUM
    : error
      ? COL_ERROR
      : COL_TEXT;
  const dnum = !shaded || f & DS_BLACK_NUM;

  // Grid edge first, so the cell can overwrite it: the line is the tile's
  // right and bottom pixel, and the frame closes the top and left.
  dr.drawRect({ x, y, w: ts, h: ts }, f & DS_IMPOSSIBLE ? COL_ERROR : COL_GRID);
  const inner = { x, y, w: ts - 1, h: ts - 1 };
  const c = { x: x + inner.w / 2, y: y + inner.h / 2 };
  dr.drawRect(inner, !shaded && f & DS_FLASH ? COL_FLASH : COL_EMPTY);
  // The hatch goes under the piece: it marks the line, and the piece is what
  // the line holds.
  if (f & DS_HINT_LINE) dr.drawHatch(inner, COL_HINT, hatchPeriod(ts));

  if (shaded) {
    drawPiece(dr, inner, SHADED_SHAPE, error ? COL_ERROR : COL_SHADED);
  } else if (f & DS_CIRCLE) {
    // Unfilled, so the surface (and a hatch on it) shows through: a kept cell
    // is the board with a mark on it, and holds no piece.
    const ring = error ? COL_ERROR : COL_KEPT;
    const r = ringRadius(ts);
    const weight = Math.max(2, Math.round(ts / 24));
    // Half-pixel steps: one-pixel strokes a whole pixel apart leave specks of
    // surface between them.
    for (let i = 0; i < 2 * weight - 1; i++) dr.drawCircle(c, r - i / 2, -1, ring);
  }

  // A forced cell is never pre-filled with the piece or the ring the player
  // must place themselves: the mark says "act here", the narration says which
  // action. (Auto-hint applies the move for real, so animation mode renders the
  // actual mark.)
  //
  // Every Singles cell carries a **number**, so no hint role can be a fill; all
  // of them are bands at the cell's edge, beside the piece and the ring. The
  // band lies inside the cell (`outer` 0), so this cell's own repaint — which
  // its hint bits are part of the cache key for — is what erases a mark that
  // moves. A decided premise cell is the reason by its state, and its band
  // takes the color of its kind.
  const band = { box: inner, outer: 0, inner: markT(ts) };
  if (f & DS_HINT_TARGET) drawMarkSides(dr, band, MARK_ALL, COL_HINT);
  else if (f & DS_HINT_STRAND) drawMarkSides(dr, band, MARK_ALL, COL_HINT_STRAND);
  else if (f & DS_HINT_EVID)
    drawMarkSides(
      dr,
      band,
      MARK_ALL,
      shaded ? COL_HINT_BLACKREF : f & DS_CIRCLE ? COL_HINT_WHITEREF : COL_HINT_CELL,
    );

  if (dnum) {
    const buf = String(num);
    const full =
      buf.length === 1 ? textsz(ts) : Math.floor((ringRadius(ts) * 2 - 1) / buf.length);
    // A number the player has blacked out is out of the puzzle: it is shown
    // on request, and smaller, so the piece stays the thing the cell holds.
    const tsz = shaded ? Math.floor((full * 3) / 4) : full;
    dr.drawText(c, glyphFont(tsz), tcol, buf);
  }

  // Brackets at the cell's corners, so the cursor is beside the piece and
  // leaves the sides of a hint's band showing on a cell that carries both.
  if (f & DS_CURSOR) {
    const t = markT(ts);
    drawRectCorners(dr, c.x, c.y, (inner.w - t) / 2, COL_CURSOR, t);
  }

  // Check & Save: an inset error outline marks a cell contradicting the
  // unique solution.
  if (f & DS_MISTAKE)
    drawThickRectOutline(
      dr,
      x + 1,
      y + 1,
      inner.w - 2,
      inner.h - 2,
      markT(ts),
      COL_ERROR,
    );

  dr.drawUpdate({ x, y, w: ts, h: ts });
}

// --- redraw ----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: SinglesDrawState,
  _prev: SinglesState | null,
  state: SinglesState,
  _dir: number,
  ui: SinglesUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<SinglesMove, SinglesHint>,
  mistakes?: readonly Point[],
): void {
  const ts = ds.tileSize;
  const { w, h } = state;

  // Index the displayed hint step's marks. The protected corner is one of the
  // outlined cells, told apart by the step's `strand`.
  const marks = stepMarks(hint);
  const index = (c: Point): number => c.y * w + c.x;
  const strand = new Set(hint?.highlights?.strand.map(index));
  const hintTarget = new Set(marks.of("ring", CELL).map(index));
  const hintEvid = new Set<number>();
  const hintStrand = new Set<number>();
  for (const i of marks.of("outline", CELL).map(index))
    (strand.has(i) ? hintStrand : hintEvid).add(i);
  const hintLine = new Set(marks.of("stripes", CELL).map(index));
  const mistakeSet = new Set(mistakes?.map((m) => m.y * w + m.x));

  // The frame closes the grid on its top and left, where no tile draws a
  // line, and is no heavier than a grid line. It takes the grid's color, the
  // error color included.
  const frame = state.impossible ? COL_ERROR : COL_GRID;
  if (ds.frame !== frame) {
    const o = coord(0, ts) - 1;
    dr.drawRect({ x: o, y: o, w: ts * w + 1, h: 1 }, frame);
    dr.drawRect({ x: o, y: o, w: 1, h: ts * h + 1 }, frame);
    dr.drawUpdate({ x: o, y: o, w: ts * w + 1, h: ts * h + 1 });
    ds.frame = frame;
  }

  const flash = flashTime > 0 && Math.floor((flashTime * 5) / FLASH_TIME) % 2 === 1;

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const i = y * w + x;
      let f = 0;

      if (flash) f |= DS_FLASH;
      if (state.impossible) f |= DS_IMPOSSIBLE;
      if (ui.cursor.visible && x === ui.cursor.x && y === ui.cursor.y) f |= DS_CURSOR;
      if (state.flags[i] & F_BLACK) {
        f |= DS_BLACK;
        if (ui.showBlackNums) f |= DS_BLACK_NUM;
      }
      if (state.flags[i] & F_CIRCLE) f |= DS_CIRCLE;
      if (state.flags[i] & F_ERROR) f |= DS_ERROR;
      if (mistakeSet.has(i)) f |= DS_MISTAKE;
      if (hintTarget.has(i)) f |= DS_HINT_TARGET;
      if (hintEvid.has(i)) f |= DS_HINT_EVID;
      if (hintStrand.has(i)) f |= DS_HINT_STRAND;
      if (hintLine.has(i)) f |= DS_HINT_LINE;

      if (!ds.started || ds.cache[i] !== f) {
        tileRedraw(dr, ts, coord(x, ts), coord(y, ts), state.nums[i], f);
        ds.cache[i] = f;
      }
    }
  }
  ds.started = true;
}
