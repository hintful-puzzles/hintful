/**
 * Pattern rendering, after `game_redraw` / `grid_square` / `draw_numbers` in
 * pattern.c. The board is pieces on a quiet surface (`engine/piece.ts`): a
 * full cell holds the shaded piece, a cell known to be empty holds the
 * ruled-out cross, and an undecided cell is plain surface. A per-cell cache
 * keyed on the displayed value (drag- and flash-adjusted) plus overlay bits,
 * and a per-line cache of the clue color, which turns red when a completed
 * line contradicts its clue (`check_errors`).
 */

import {
  CURSOR,
  cellSurface,
  ERROR,
  HINT_ACTION,
  HINT_BLACKREF,
  HINT_WHITEREF,
  INK,
  RULED_OUT,
  SHADED,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawThickRectOutline, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { fromCoord as fromCoordE } from "../../engine/geometry.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { drawMarkSides, MARK_ALL } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { drawPiece, drawRuledOutCross, SHADED_SHAPE } from "../../engine/piece.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import { CLUE, LINE } from "./hint-marks.ts";
import type { PatternHint } from "./index.ts";
import { lineHasError } from "./solver.ts";
import {
  GRID_EMPTY,
  GRID_FULL,
  GRID_UNKNOWN,
  type PatternMistake,
  type PatternMove,
  type PatternParams,
  type PatternState,
  type PatternUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 24;
export const FLASH_TIME = 0.13;

// --- palette -------------------------------------------------------------
export const COL_BACKGROUND = 0;
/** The cross in a cell known to be empty. */
export const COL_RULED_OUT = 1;
/** The piece in a full cell. */
export const COL_FULL = 2;
export const COL_TEXT = 3;
/** The surface of a cell, whatever it holds. */
export const COL_CELL = 4;
export const COL_GRID = 5;
export const COL_CURSOR = 6;
export const COL_ERROR = 7;
export const COL_CURSOR_GUIDE = 8;
// Hint colors. The forced cell is ringed COL_HINT, the reasoned line is
// hatched in it, and a cited full / empty cell is outlined COL_HINT_BLACKREF /
// COL_HINT_WHITEREF (the cross-game element-type legend).
export const COL_HINT = 9;
export const COL_HINT_BLACKREF = 10;
export const COL_HINT_WHITEREF = 11;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_TEXT] = INK;
  out[COL_FULL] = SHADED;
  out[COL_RULED_OUT] = RULED_OUT;
  // The clue numbers of the cursor's own row and column: the cursor, projected
  // into the margin, so it takes the cursor's color rather than a gray of its own.
  out[COL_CURSOR_GUIDE] = CURSOR;
  out[COL_CURSOR] = CURSOR;
  out[COL_ERROR] = ERROR;
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_BLACKREF] = HINT_BLACKREF;
  out[COL_HINT_WHITEREF] = HINT_WHITEREF;
  return out;
}

// --- geometry (upstream macros; BORDER is the wide non-NARROW form) ------
const border = (ts: number): number => Math.floor((3 * ts) / 4);
const gutter = (ts: number): number => Math.floor(ts / 2);
const tlborder = (d: number): number => Math.floor(d / 5) + 2;

/** Pixel origin of cell coordinate `n` along a dimension of size `d`. */
export function toCoord(ts: number, d: number, n: number): number {
  return border(ts) + gutter(ts) + ts * (tlborder(d) + n);
}

/** Cell coordinate under pixel `px` along a dimension of size `d` (or out of
 * range). */
export function fromCoord(ts: number, d: number, px: number): number {
  // The origin clears the clue block: the border, the gutter, and `tlborder(d)`
  // whole tiles of clue rows/columns.
  return fromCoordE(px, ts, border(ts) + gutter(ts) + ts * tlborder(d));
}

function sizeOf(ts: number, d: number): number {
  return 2 * border(ts) + gutter(ts) + ts * (tlborder(d) + d);
}

export function computeSize(p: PatternParams, ts: number): Size {
  return { w: sizeOf(ts, p.w), h: sizeOf(ts, p.h) };
}

// --- draw state ----------------------------------------------------------

export interface PatternDrawState {
  started: boolean;
  tileSize: number;
  w: number;
  h: number;
  /** Per-cell packed display key; -1 forces a redraw. */
  visible: Int32Array;
  /** Per-line last-drawn clue color and hatch; -1 forces a redraw. */
  numColors: Int32Array;
}

export function newDrawState(state: PatternState, tileSize: number): PatternDrawState {
  const { w, h } = state.common;
  return {
    started: false,
    tileSize,
    w,
    h,
    visible: new Int32Array(w * h).fill(-1),
    numColors: new Int32Array(w + h).fill(-1),
  };
}

// Packed display-key bits beyond the 2-bit cell value.
const K_CURSOR = 1 << 2;
const K_MISTAKE = 1 << 3;
// Hint-overlay bits (no upstream analog), also folded into the cache key.
const K_HINT_TARGET = 1 << 4; // a forced cell (COL_HINT highlight)
const K_HINT_LINE = 1 << 5; // a cell of the reasoned line (hatched)
const K_HINT_BLACKREF = 1 << 6; // a cited full cell (COL_HINT_BLACKREF outline)
const K_HINT_WHITEREF = 1 << 7; // a cited empty cell (COL_HINT_WHITEREF outline)

function gridSquare(
  dr: GameDrawing,
  ds: PatternDrawState,
  y: number,
  x: number,
  val: number,
  cur: boolean,
  mistake: boolean,
  hintBits: number,
): void {
  const ts = ds.tileSize;
  const { w, h } = ds;
  const tx = toCoord(ts, w, x);
  const ty = toCoord(ts, h, y);

  dr.drawRect({ x: tx, y: ty, w: ts, h: ts }, COL_GRID);

  // A doubled line every fifth cell, to count along a clue by. Not at the
  // edges: the frame round the grid is no heavier than a line inside it.
  const xl = x % 5 === 0 && x > 0 ? 1 : 0;
  const yt = y % 5 === 0 && y > 0 ? 1 : 0;
  const xr = x % 5 === 4 && x < w - 1 ? 1 : 0;
  const yb = y % 5 === 4 && y < h - 1 ? 1 : 0;

  const dx = tx + 1 + xl;
  const dy = ty + 1 + yt;
  const dw = ts - xl - xr - 1;
  const dh = ts - yt - yb - 1;

  // A hint target is ringed below, never filled: where the move is exactly
  // "shade this square, or rule it out", a piece would state the answer the
  // narration is proposing. Every cell of the reasoned line is hatched, under
  // whatever it holds, so the line reads as one strip. A cited cell keeps its
  // own content (the premise) and gets an outline below, beside the piece.
  dr.drawRect({ x: dx, y: dy, w: dw, h: dh }, COL_CELL);
  if (hintBits & K_HINT_LINE) {
    dr.drawHatch({ x: dx, y: dy, w: dw, h: dh }, COL_HINT, hatchPeriod(ts));
  }
  // One box for every cell's content, the size of a cell beside a doubled
  // line, so the pieces of a picture are all one size.
  const content = { x: dx, y: dy, w: ts - 2, h: ts - 2 };
  if (val === GRID_FULL) drawPiece(dr, content, SHADED_SHAPE, COL_FULL);
  else if (val === GRID_EMPTY) drawRuledOutCross(dr, content, COL_RULED_OUT);

  if (hintBits & K_HINT_TARGET) {
    drawMarkSides(
      dr,
      {
        box: { x: dx, y: dy, w: dw, h: dh },
        outer: 0,
        inner: Math.max(2, Math.floor(ts / 10)),
      },
      MARK_ALL,
      COL_HINT,
    );
  }

  if (hintBits & (K_HINT_BLACKREF | K_HINT_WHITEREF)) {
    const t = Math.max(1, Math.floor(ts / 10));
    drawThickRectOutline(
      dr,
      dx,
      dy,
      dw,
      dh,
      t,
      hintBits & K_HINT_BLACKREF ? COL_HINT_BLACKREF : COL_HINT_WHITEREF,
    );
  }

  if (mistake) {
    // At the cell's edge, beside the piece, where red is read against the
    // surface and not against the piece; stepped in under the cursor's frame,
    // which takes the edge itself.
    const t = Math.max(2, Math.floor(ts / 12));
    const inset = cur ? 2 : 0;
    drawThickRectOutline(
      dr,
      dx + inset,
      dy + inset,
      dw - 2 * inset,
      dh - 2 * inset,
      t,
      COL_ERROR,
    );
  }

  if (cur) {
    // Upstream's double 1px outline → a 2px frame.
    drawThickRectOutline(dr, dx, dy, dw, dh, 2, COL_CURSOR);
  }

  dr.drawUpdate({ x: tx, y: ty, w: ts, h: ts });
}

function drawNumbers(
  dr: GameDrawing,
  ds: PatternDrawState,
  state: PatternState,
  i: number,
  color: number,
  hatched: boolean,
): void {
  const ts = ds.tileSize;
  const { w, h, clues, fontLarge } = state.common;
  const rowdata = clues[i];
  const rowlen = rowdata.length;

  let rx: number;
  let ry: number;
  let rw: number;
  let rh: number;
  if (i < w) {
    rx = toCoord(ts, w, i);
    ry = 0;
    rw = ts;
    rh = border(ts) + tlborder(h) * ts;
  } else {
    rx = 0;
    ry = toCoord(ts, h, i - w);
    rw = border(ts) + tlborder(w) * ts;
    rh = ts;
  }

  dr.clip({ x: rx, y: ry, w: rw, h: rh });
  dr.drawRect({ x: rx, y: ry, w: rw, h: rh }, COL_BACKGROUND);
  if (hatched) dr.drawHatch({ x: rx, y: ry, w: rw, h: rh }, COL_HINT, hatchPeriod(ts));

  const fontsize = Math.floor((ts + 0.5) / (fontLarge ? 1.2 : 1.8));
  const half = Math.floor(ts / 2);

  if (rowlen > 0) {
    if (i < w) {
      const nfit = Math.max(rowlen, tlborder(h)) - 1;
      for (let j = 0; j < rowlen; j++) {
        let yy = border(ts) + ts * (tlborder(h) - 1);
        yy -= Math.floor(((rowlen - j - 1) * ts * (tlborder(h) - 1)) / nfit);
        dr.drawText(
          { x: rx + half, y: yy + half },
          glyphFont(fontsize),
          color,
          String(rowdata[j]),
        );
      }
    } else {
      const sep = rowlen > tlborder(w) ? " " : "  ";
      const str = rowdata.join(sep);
      const x = border(ts) + ts * (tlborder(w) - 1);
      dr.drawText(
        { x: x + ts, y: ry + half },
        {
          align: "right",
          baseline: "mathematical",
          fontType: "variable",
          size: fontsize,
        },
        color,
        str,
      );
    }
  }

  dr.unclip();
  dr.drawUpdate({ x: rx, y: ry, w: rw, h: rh });
}

export function redraw(
  dr: GameDrawing,
  ds: PatternDrawState,
  _prev: PatternState | null,
  state: PatternState,
  _dir: number,
  ui: PatternUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<PatternMove, PatternHint>,
  mistakes?: readonly PatternMistake[],
): void {
  const ts = ds.tileSize;
  const { w, h } = state.common;
  const { grid } = state;
  const mistakeSet =
    mistakes && mistakes.length > 0
      ? new Set(mistakes.map((m) => m.y * w + m.x))
      : null;

  // Hint overlay: forced targets, the reasoned line's cells (line of sight),
  // and the cited cells, outlined by what they hold.
  const marks = stepMarks(hint);
  const index = (c: Point): number => c.y * w + c.x;
  const hintTargets = new Set(marks.of("ring", CELL).map(index));
  const hintRefs = new Set(marks.of("outline", CELL).map(index));
  const hintLines = marks.of("stripes", LINE);
  const hintClues = new Set(marks.of("outline", CLUE));
  const inReasonedLine = (x: number, y: number): boolean =>
    hintLines.some((l) => (l < w ? x === l : y === l - w));

  if (!ds.started) {
    // The frame closes the grid on its right and bottom, one line thick; each
    // cell draws the line on its own top and left.
    dr.drawRect(
      { x: toCoord(ts, w, 0), y: toCoord(ts, h, 0), w: w * ts + 1, h: h * ts + 1 },
      COL_GRID,
    );
    ds.started = true;
  }

  // Drag preview rectangle.
  let x1 = -1;
  let x2 = -1;
  let y1 = -1;
  let y2 = -1;
  if (ui.drag.live) {
    const { sx, sy, ex, ey } = ui.drag;
    x1 = Math.min(sx, ex);
    x2 = Math.max(sx, ex);
    y1 = Math.min(sy, ey);
    y2 = Math.max(sy, ey);
  }
  // A multi-cell paint drag previews only on blank cells (matching the
  // onlyBlank fill it will emit), so it never visually clobbers a placed mark.
  const dragOnlyBlank = (x2 > x1 || y2 > y1) && ui.state !== GRID_UNKNOWN;

  const cx = ui.cursor.visible ? ui.cursor.x : -1;
  const cy = ui.cursor.visible ? ui.cursor.y : -1;

  // Swap full and empty cells twice during the completion flash (upstream).
  const flashing =
    flashTime > 0 && (flashTime <= FLASH_TIME / 3 || flashTime >= (FLASH_TIME * 2) / 3);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let val: number;
      if (
        ui.drag.live &&
        x1 <= x &&
        x <= x2 &&
        y1 <= y &&
        y <= y2 &&
        !state.common.immutable[i] &&
        (!dragOnlyBlank || grid[i] === GRID_UNKNOWN)
      ) {
        val = ui.state;
      } else {
        val = grid[i];
      }
      if (flashing && val !== GRID_UNKNOWN) val ^= 1; // FULL <-> EMPTY

      const cur = x === cx && y === cy;
      const mistake = mistakeSet?.has(i) ?? false;
      let hintBits = 0;
      if (hintTargets.has(i)) hintBits = K_HINT_TARGET;
      else if (hintRefs.has(i))
        hintBits = grid[i] === GRID_FULL ? K_HINT_BLACKREF : K_HINT_WHITEREF;
      if (inReasonedLine(x, y)) hintBits |= K_HINT_LINE;
      const key = val | (cur ? K_CURSOR : 0) | (mistake ? K_MISTAKE : 0) | hintBits;
      if (ds.visible[i] !== key) {
        ds.visible[i] = key;
        gridSquare(dr, ds, y, x, val, cur, mistake, hintBits);
      }
    }
  }

  // Recolor clue numbers: red on a contradicting completed line, else the
  // cursor guide for the cursor's row/column, else plain text.
  for (let i = 0; i < w + h; i++) {
    let color = lineHasError(state, i) ? COL_ERROR : COL_TEXT;
    if (color === COL_TEXT && ((cx >= 0 && i === cx) || (cy >= 0 && i === cy + w))) {
      color = COL_CURSOR_GUIDE;
    }
    // The reasoned line's clue takes the action color and its strip the hatch,
    // so the stripe runs from the count to the end of the line. A line with no
    // clue has its strip hatched but no numbers to recolor, so the hatch keys
    // the repaint beside the color.
    if (hintClues.has(i)) color = COL_HINT;
    const hatched = hintLines.includes(i);
    const key = color * 2 + (hatched ? 1 : 0);
    if (ds.numColors[i] !== key) {
      ds.numColors[i] = key;
      drawNumbers(dr, ds, state, i, color, hatched);
    }
  }
}
