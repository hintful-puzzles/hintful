/**
 * Rendering for Map (upstream `game_colours`, `game_compute_size`,
 * `draw_square`, `draw_error`, `game_redraw`), plus the pixel↔region hit-test
 * helpers `index.ts` uses (kept here so `index → render` is the only dependency
 * direction). The layout is upstream's NARROW_BORDERS one: no border.
 */

import { FOUR_FILLS } from "../../engine/color/colors.ts";
import { CURSOR, ERROR, ERROR_TEXT, INK } from "../../engine/color/palette.ts";
import { glyphFont } from "../../engine/draw.ts";
import type { GameDrawing } from "../../engine/game.ts";
import { fromCoord as fromCoordE } from "../../engine/geometry.ts";
import {
  type PencilIndicatorStyle,
  pencilIndicatorBox,
  pencilIndicatorCanvas,
  pencilIndicatorReach,
  repaintPencilIndicator,
} from "../../engine/pencil-indicator.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_UP,
} from "../../engine/pointer.ts";
import type { Color, Size } from "../../engine/types.ts";
import { BE, LE, type MapData, RE, TE } from "./map-data.ts";
import {
  FLASH_ALL_TO_WHITE,
  FLASH_EACH_TO_WHITE,
  type MapMistake,
  type MapParams,
  type MapState,
  type MapUi,
} from "./state.ts";

// --- palette ---------------------------------------------------------

export const COL_BACKGROUND = 0;
export const COL_GRID = 1;
export const COL_0 = 2;
export const COL_1 = 3;
export const COL_2 = 4;
export const COL_3 = 5;
export const COL_ERROR = 6;
export const COL_ERRTEXT = 7;
/** Appended past the upstream enum — a wrong-region outline. */
export const COL_MISTAKE = 8;
/** The selected region's band and its notes triangle. */
export const COL_CURSOR = 9;

const FOUR = 4;
const FIVE = 5;

export function colors(defaultBackground: Color): Color[] {
  const ret: Color[] = [];
  ret[COL_BACKGROUND] = defaultBackground;
  ret[COL_GRID] = INK;
  ret[COL_0] = FOUR_FILLS[0];
  ret[COL_1] = FOUR_FILLS[1];
  ret[COL_2] = FOUR_FILLS[2];
  ret[COL_3] = FOUR_FILLS[3];
  ret[COL_ERROR] = ERROR;
  ret[COL_ERRTEXT] = ERROR_TEXT;
  ret[COL_MISTAKE] = ERROR;
  ret[COL_CURSOR] = CURSOR;
  return ret;
}

// --- cache-word flags ------------------------------------------------
// Low bits 0..4 hold the base value `tv*FIVE + bv` (0..24); the rest are flags.

const MISTAKE = 0x20; // bit 5 — the cell belongs to a wrong-colored region
const SEL_TOP = 0x40; // bit 6 — the top piece is in the selected region
const SEL_BOTTOM = 0x80; // bit 7 — the bottom piece is
const SEL_NOTES = 0x100; // bit 8 — this cell carries the notes triangle
const SEL_MASK = SEL_TOP | SEL_BOTTOM | SEL_NOTES;
const SHOW_NUMBERS = 0x00004000;
const PENCIL_T_BASE = 0x00080000;
const PENCIL_B_BASE = 0x00008000;
const PENCIL_MASK = 0x007f8000;
const ERR_BASE = 0x00800000;
const ERR_MASK = 0xff800000;

// --- geometry --------------------------------------------------------

/**
 * Where the board starts, in canvas pixels: the room the pencil-mode indicator
 * needs at the top-right.
 *
 * Map's board had no margin at all, so the canvas is grown for the glyph on
 * every side (`pencilIndicatorCanvas`) rather than one, keeping the board
 * centered. Every drawing site reaches pixels through {@link coord} and every
 * pointer through {@link fromCoord}, so those two are the whole change.
 */
export function origin(ts: number): number {
  return pencilIndicatorReach(ts);
}

function coord(x: number, ts: number): number {
  return origin(ts) + x * ts;
}

export function fromCoord(px: number, ts: number): number {
  return fromCoordE(px, ts, origin(ts));
}

function epsilonX(button: number): number {
  return button === CURSOR_RIGHT ? 1 : button === CURSOR_LEFT ? -1 : 0;
}

function epsilonY(button: number): number {
  return button === CURSOR_DOWN ? 1 : button === CURSOR_UP ? -1 : 0;
}

/**
 * The region containing a point in tile `(tx, ty)` offset by `(xEps, yEps)` from
 * the tile center — resolving a diagonally-split cell to one of its two
 * regions. Upstream `region_from_logical_coords`.
 */
export function regionFromLogicalCoords(
  map: MapData,
  tx: number,
  ty: number,
  xEps: number,
  yEps: number,
): number {
  const { w, h } = map;
  const wh = w * h;
  if (tx < 0 || tx >= w || ty < 0 || ty >= h) return -1;

  const q = quadrantIndex(xEps, yEps);
  const quadrant = q === 0 ? BE : q === 1 ? LE : q === 2 ? RE : TE;
  return map.map[quadrant * wh + ty * w + tx];
}

/** Which of a cell's four triangles an offset from its center falls in, as
 * upstream's `region_from_coords` numbers them (0 bottom, 1 left, 2 right,
 * 3 top). */
function quadrantIndex(xEps: number, yEps: number): number {
  return 2 * (xEps > yEps ? 1 : 0) + (-xEps > yEps ? 1 : 0);
}

/**
 * The cursor-direction button whose own offset picks the same triangle — the
 * inverse of {@link quadrantIndex} over the four `epsilonX`/`epsilonY` pairs.
 *
 * The keyboard cursor is a cell *plus the direction it last moved*, which is
 * how upstream names one of the four regions a diagonally-split cell can hold.
 * A pointer knows its triangle directly, so this is what lets a tap put the
 * cursor exactly where the finger was rather than on some quadrant of the
 * right cell.
 *
 * Derived from the same expression rather than tabulated against it, so the
 * two cannot disagree about which triangle is which.
 */
function directionForQuadrant(xEps: number, yEps: number): number {
  const q = quadrantIndex(xEps, yEps);
  for (const button of [CURSOR_DOWN, CURSOR_LEFT, CURSOR_RIGHT, CURSOR_UP])
    if (quadrantIndex(epsilonX(button), epsilonY(button)) === q) return button;
  // Unreachable: the four directions cover the four quadrants, which
  // `map.test.ts` pins.
  return CURSOR_DOWN;
}

/** Is cell `(x, y)` split along a diagonal between two regions? The test
 * `drawSquare` uses to decide whether to paint a second triangle at all. */
function dividedCell(map: MapData, x: number, y: number): boolean {
  const wh = map.w * map.h;
  const c = y * map.w + x;
  return map.map[TE * wh + c] !== map.map[BE * wh + c];
}

/** Upstream `region_from_coords` (pixel → region). */
export function regionFromCoords(
  map: MapData,
  ts: number,
  x: number,
  y: number,
): number {
  const tx = fromCoord(x, ts);
  const ty = fromCoord(y, ts);
  const half = Math.floor(ts / 2);
  return regionFromLogicalCoords(
    map,
    tx,
    ty,
    x - coord(tx, ts) - half,
    y - coord(ty, ts) - half,
  );
}

/**
 * Put the keyboard cursor on the region under a pointer at `(x, y)`, leaving
 * it hidden.
 *
 * The pointer already knows its cell and its triangle; this is the same pair
 * written in the cursor's own vocabulary, so `regionFromUiCursor` afterwards
 * names the region the finger was on.
 */
export function placeCursorAtCoords(ui: MapUi, ts: number, x: number, y: number): void {
  const tx = fromCoord(x, ts);
  const ty = fromCoord(y, ts);
  const half = Math.floor(ts / 2);
  ui.cursor.x = tx;
  ui.cursor.y = ty;
  ui.curLastmove = directionForQuadrant(
    x - coord(tx, ts) - half,
    y - coord(ty, ts) - half,
  );
}

/** Upstream `region_from_ui_cursor`. */
export function regionFromUiCursor(map: MapData, ui: MapUi): number {
  return regionFromLogicalCoords(
    map,
    ui.cursor.x,
    ui.cursor.y,
    epsilonX(ui.curLastmove),
    epsilonY(ui.curLastmove),
  );
}

// --- draw state ------------------------------------------------------

export interface MapDrawState {
  started: boolean;
  tileSize: number;
  /** Per-cell packed cache word; `-1` forces a repaint. */
  drawn: Int32Array;
  todraw: Int32Array;
  // floating drag/cursor blob
  bl: unknown | null;
  dragVisible: boolean;
  /** Where the blitter last saved the background, in pixels — the sprite's
   * top-left, not the pointer (which is `ui.dragX`/`dragY`, a half-tile away). */
  dragX: number;
  dragY: number;
  /** What the pencil-mode indicator shows; `null` = never painted. */
  pencilModeShown: boolean | null;
}

export function computeSize(p: MapParams, tileSize: number): Size {
  return pencilIndicatorCanvas(
    { w: p.w * tileSize + 1, h: p.h * tileSize + 1 },
    tileSize,
  );
}

export function newDrawState(s: MapState, tileSize: number): MapDrawState {
  const wh = s.params.w * s.params.h;
  return {
    started: false,
    tileSize,
    drawn: new Int32Array(wh).fill(-1),
    todraw: new Int32Array(wh),
    bl: null,
    dragVisible: false,
    dragX: -1,
    dragY: -1,
    pencilModeShown: null,
  };
}

/** The pencil-mode indicator's colors: an outlined pencil in the grid ink, with
 * no region color in its body — Map's four colors are the puzzle's answer
 * vocabulary, and a glyph in one of them would read as a fifth region. The
 * outline and point must be the ink: in the background color they vanish, and
 * what is left is a short dash that does not read as a pencil. */
const PENCIL_STYLE: PencilIndicatorStyle = {
  background: COL_BACKGROUND,
  body: COL_BACKGROUND,
  ink: COL_GRID,
};

// --- flash -----------------------------------------------------------

/** Upstream `flash_length`. */
export function flashLengthFromUi(ui: MapUi): number {
  return ui.flashType === FLASH_EACH_TO_WHITE ? 0.5 : 0.3;
}

// --- drawing ---------------------------------------------------------

function drawError(dr: GameDrawing, ts: number, x: number, y: number): void {
  const r = Math.floor((ts * 2) / 5);
  dr.drawPolygon(
    [
      { x: x - r, y },
      { x, y: y - r },
      { x: x + r, y },
      { x, y: y + r },
    ],
    COL_ERROR,
    COL_GRID,
  );

  // An exclamation mark, hand-drawn (upstream avoids draw_text off-center).
  const xext = Math.floor(ts / 16);
  const yext = Math.floor((ts * 2) / 5) - (xext * 2 + 2);
  dr.drawRect(
    { x: x - xext, y: y - yext, w: xext * 2 + 1, h: yext * 2 + 1 - xext * 3 },
    COL_ERRTEXT,
  );
  dr.drawRect(
    { x: x - xext, y: y + yext - xext * 2 + 1, w: xext * 2 + 1, h: xext * 2 },
    COL_ERRTEXT,
  );
}

// --- the selected region ---------------------------------------------
//
// The note-taking cell's picture, for a selection that is a region rather than
// a cell: a band just inside the region's boundary in both modes, which is the
// whole region "washed" without changing its fill — a region's fill is the
// answer in this game, so a wash over a red region would read as another red —
// and, for notes, the note-taking corner triangle in the region's first cell.
//
// Each cell holds one or two convex pieces (a square, or two right triangles
// either side of its diagonal). The band in a piece is that piece clipped to a
// strip along each of its edges that is a region boundary, plus a square at
// each corner the boundary passes through without running along the piece —
// an inner corner of an L-shaped region, where the two strips would otherwise
// meet at a single point.

interface Pt {
  x: number;
  y: number;
}

/** A cell's piece: its outline, clockwise, and which sides of the outline are
 * region boundaries. */
interface Piece {
  poly: Pt[];
  boundary: boolean[];
}

/** Keep the part of convex `poly` where `f` is at most zero. */
function clipHalfPlane(poly: Pt[], f: (p: Pt) => number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const fp = f(p);
    const fq = f(q);
    if (fp <= 0) out.push(p);
    if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) {
      const s = fp / (fp - fq);
      out.push({ x: p.x + (q.x - p.x) * s, y: p.y + (q.y - p.y) * s });
    }
  }
  return out;
}

/** Signed distance inward from side `i` of clockwise `poly` (screen axes). */
function inwardDistance(poly: Pt[], i: number): (p: Pt) => number {
  const a = poly[i];
  const b = poly[(i + 1) % poly.length];
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const nx = -(b.y - a.y) / len;
  const ny = (b.x - a.x) / len;
  return (p) => (p.x - a.x) * nx + (p.y - a.y) * ny;
}

/** `subject` clipped to convex, clockwise `clip`. */
function clipConvex(subject: Pt[], clip: Pt[]): Pt[] {
  let out = subject;
  for (let i = 0; i < clip.length && out.length > 0; i++) {
    const d = inwardDistance(clip, i);
    out = clipHalfPlane(out, (p) => -d(p));
  }
  return out;
}

/** The band's width: wide enough to read on any fill, narrow enough to leave
 * the stipples inside a small region clear. */
function selectionBand(ts: number): number {
  return Math.max(2, Math.floor(ts / 8));
}

/** Is there a region boundary *through* grid point `(px, py)` — along any of
 * the four grid lines meeting there, or a diagonal ending there? */
function boundaryAtPoint(map: MapData, px: number, py: number): boolean {
  const { w, h } = map;
  if (px <= 0 || py <= 0 || px >= w || py >= h) return true;
  const wh = w * h;
  const M = map.map;
  const q = (x: number, y: number, e: number) => M[e * wh + y * w + x];
  // The four cells around the point: A above-left, B above-right, C below-left,
  // D below-right. A split cell's diagonal ends at this point when it runs
  // through the corner the point is to that cell.
  const splitThrough = (x: number, y: number, lePairsWith: number) =>
    q(x, y, TE) !== q(x, y, BE) && q(x, y, LE) === q(x, y, lePairsWith);
  return (
    q(px - 1, py - 1, RE) !== q(px, py - 1, LE) ||
    q(px - 1, py, RE) !== q(px, py, LE) ||
    q(px - 1, py - 1, BE) !== q(px - 1, py, TE) ||
    q(px, py - 1, BE) !== q(px, py, TE) ||
    splitThrough(px - 1, py - 1, BE) ||
    splitThrough(px, py - 1, TE) ||
    splitThrough(px - 1, py, TE) ||
    splitThrough(px, py, BE)
  );
}

/** Cell `(x, y)`'s top and bottom pieces (one square when it is whole, which
 * both names return). */
function cellPieces(map: MapData, x: number, y: number, ts: number): [Piece, Piece] {
  const { w, h } = map;
  const wh = w * h;
  const M = map.map;
  const q = (cx: number, cy: number, e: number) => M[e * wh + cy * w + cx];
  const top = y === 0 || q(x, y - 1, BE) !== q(x, y, TE);
  const bottom = y === h - 1 || q(x, y + 1, TE) !== q(x, y, BE);
  const left = x === 0 || q(x - 1, y, RE) !== q(x, y, LE);
  const right = x === w - 1 || q(x + 1, y, LE) !== q(x, y, RE);
  const x0 = coord(x, ts);
  const y0 = coord(y, ts);
  const TL = { x: x0, y: y0 };
  const TR = { x: x0 + ts, y: y0 };
  const BR = { x: x0 + ts, y: y0 + ts };
  const BL = { x: x0, y: y0 + ts };
  if (q(x, y, TE) === q(x, y, BE)) {
    const whole = { poly: [TL, TR, BR, BL], boundary: [top, right, bottom, left] };
    return [whole, whole];
  }
  // The diagonal runs TR–BL when the left quadrant goes with the top one, and
  // TL–BR when it goes with the bottom one (`drawSquare`'s second triangle).
  if (q(x, y, LE) === q(x, y, TE))
    return [
      { poly: [TL, TR, BL], boundary: [top, true, left] },
      { poly: [TR, BR, BL], boundary: [right, bottom, true] },
    ];
  return [
    { poly: [TL, TR, BR], boundary: [top, right, true] },
    { poly: [TL, BR, BL], boundary: [true, bottom, left] },
  ];
}

/** Paint the selection over cell `(x, y)`'s fills: the band in each selected
 * piece, and the notes triangle where this is the region's first cell. */
function drawSelection(
  dr: GameDrawing,
  ts: number,
  map: MapData,
  x: number,
  y: number,
  v: number,
): void {
  const [topPiece, bottomPiece] = cellPieces(map, x, y, ts);
  const pieces: Piece[] = [];
  if (v & SEL_TOP) pieces.push(topPiece);
  if (v & SEL_BOTTOM && bottomPiece !== topPiece) pieces.push(bottomPiece);
  const t = selectionBand(ts);
  const fill = (poly: Pt[]) => {
    if (poly.length >= 3) dr.drawPolygon(poly, COL_CURSOR, COL_CURSOR);
  };
  const x0 = coord(x, ts);
  const y0 = coord(y, ts);
  const corners = [
    { px: x, py: y, kx: x0, ky: y0 },
    { px: x + 1, py: y, kx: x0 + ts, ky: y0 },
    { px: x + 1, py: y + 1, kx: x0 + ts, ky: y0 + ts },
    { px: x, py: y + 1, kx: x0, ky: y0 + ts },
  ];
  for (const piece of pieces) {
    const { poly, boundary } = piece;
    for (let i = 0; i < poly.length; i++) {
      if (!boundary[i]) continue;
      const d = inwardDistance(poly, i);
      fill(clipHalfPlane(poly, (p) => d(p) - t));
    }
    for (const k of corners) {
      // A side of the piece already running along the boundary from this
      // corner has covered it.
      const own = poly.some(
        (p, i) =>
          boundary[i] &&
          ((p.x === k.kx && p.y === k.ky) ||
            (poly[(i + 1) % poly.length].x === k.kx &&
              poly[(i + 1) % poly.length].y === k.ky)),
      );
      if (own || !boundaryAtPoint(map, k.px, k.py)) continue;
      const sx = k.kx === x0 ? 1 : -1;
      const sy = k.ky === y0 ? 1 : -1;
      const square = clipHalfPlane(
        clipHalfPlane(poly, (p) => sx * (p.x - k.kx) - t),
        (p) => sy * (p.y - k.ky) - t,
      );
      fill(square);
    }
  }
  if (v & SEL_NOTES) {
    const half = Math.floor(ts / 2);
    const corner = [
      { x: x0, y: y0 },
      { x: x0 + half, y: y0 },
      { x: x0, y: y0 + half },
    ];
    for (const piece of pieces) fill(clipConvex(corner, piece.poly));
  }
  // The band reaches the diagonal, which is the second triangle's outline:
  // stroke it again, along the same line `drawSquare` outlines.
  if (pieces.length > 0 && topPiece !== bottomPiece) {
    const wh = map.w * map.h;
    const c = y * map.w + x;
    const tlToBr = map.map[LE * wh + c] === map.map[BE * wh + c];
    dr.drawLine(
      { x: x0 - 1, y: tlToBr ? y0 - 1 : y0 + ts + 1 },
      { x: x0 + ts + 1, y: tlToBr ? y0 + ts + 1 : y0 - 1 },
      COL_GRID,
      1,
    );
  }
}

function drawSquare(
  dr: GameDrawing,
  ts: number,
  map: MapData,
  x: number,
  y: number,
  vIn: number,
  largeStipples: boolean,
): void {
  const { w, h } = map;
  const wh = w * h;
  const M = map.map;

  const errs = vIn & ERR_MASK;
  const pencil = vIn & PENCIL_MASK;
  const showNumbers = vIn & SHOW_NUMBERS;
  const mistake = vIn & MISTAKE;
  const v = vIn & ~(ERR_MASK | PENCIL_MASK | SHOW_NUMBERS | MISTAKE | SEL_MASK);
  const tv = Math.floor(v / FIVE);
  const bv = v % FIVE;

  const cx = coord(x, ts);
  const cy = coord(y, ts);
  dr.clip({ x: cx, y: cy, w: ts, h: ts });

  // Base (top) region color.
  dr.drawRect(
    { x: cx, y: cy, w: ts, h: ts },
    tv === FOUR ? COL_BACKGROUND : COL_0 + tv,
  );

  // Second region color if this is a diagonally-divided square.
  if (M[TE * wh + y * w + x] !== M[BE * wh + y * w + x]) {
    const p2x =
      M[LE * wh + y * w + x] === M[TE * wh + y * w + x]
        ? coord(x + 1, ts) + 1
        : coord(x, ts) - 1;
    dr.drawPolygon(
      [
        { x: coord(x, ts) - 1, y: coord(y + 1, ts) + 1 },
        { x: p2x, y: coord(y, ts) - 1 },
        { x: coord(x + 1, ts) + 1, y: coord(y + 1, ts) + 1 },
      ],
      bv === FOUR ? COL_BACKGROUND : COL_0 + bv,
      COL_GRID,
    );
  }

  drawSelection(dr, ts, map, x, y, vIn);

  // Pencil-mark stipples (a square formation; FOUR == 4).
  const te = M[TE * wh + y * w + x];
  for (let yo = 0; yo < 4; yo++)
    for (let xo = 0; xo < 4; xo++) {
      const e =
        yo < xo && yo < 3 - xo ? TE : yo > xo && yo > 3 - xo ? BE : xo < 2 ? LE : RE;
      const ee = M[e * wh + y * w + x];

      if (xo !== (yo * 2 + 1) % 5) continue;
      const c = yo;

      if (!(pencil & ((ee === te ? PENCIL_T_BASE : PENCIL_B_BASE) << c))) continue;
      if (yo === xo && M[TE * wh + y * w + x] !== M[LE * wh + y * w + x]) continue;
      if (yo === 3 - xo && M[TE * wh + y * w + x] !== M[RE * wh + y * w + x]) continue;

      dr.drawCircle(
        {
          x: coord(x, ts) + Math.floor(((xo + 1) * ts) / 5),
          y: coord(y, ts) + Math.floor(((yo + 1) * ts) / 5),
        },
        largeStipples ? Math.floor(ts / 4) : Math.floor(ts / 7),
        COL_0 + c,
        COL_0 + c,
      );
    }

  // Grid lines on region boundaries.
  if (x <= 0 || M[RE * wh + y * w + (x - 1)] !== M[LE * wh + y * w + x])
    dr.drawRect({ x: cx, y: cy, w: 1, h: ts }, COL_GRID);
  if (y <= 0 || M[BE * wh + (y - 1) * w + x] !== M[TE * wh + y * w + x])
    dr.drawRect({ x: cx, y: cy, w: ts, h: 1 }, COL_GRID);
  if (
    x <= 0 ||
    y <= 0 ||
    M[RE * wh + (y - 1) * w + (x - 1)] !== M[TE * wh + y * w + x] ||
    M[BE * wh + (y - 1) * w + (x - 1)] !== M[LE * wh + y * w + x]
  )
    dr.drawRect({ x: cx, y: cy, w: 1, h: 1 }, COL_GRID);

  // Error markers.
  for (let yo = 0; yo < 3; yo++)
    for (let xo = 0; xo < 3; xo++)
      if (errs & (ERR_BASE << (yo * 3 + xo)))
        drawError(
          dr,
          ts,
          Math.floor((coord(x, ts) * 2 + ts * xo) / 2),
          Math.floor((coord(y, ts) * 2 + ts * yo) / 2),
        );

  // Region numbers, if desired.
  if (showNumbers) {
    let oldj = -1;
    for (let i = 0; i < 2; i++) {
      const j = M[(i ? BE : TE) * wh + y * w + x];
      if (oldj === j) continue;
      oldj = j;
      const xo = map.regionx[j] - 2 * x;
      const yo = map.regiony[j] - 2 * y;
      if (xo >= 0 && xo <= 2 && yo >= 0 && yo <= 2) {
        dr.drawText(
          {
            x: Math.floor((coord(x, ts) * 2 + ts * xo) / 2),
            y: Math.floor((coord(y, ts) * 2 + ts * yo) / 2),
          },
          glyphFont(Math.floor((3 * ts) / 5)),
          COL_GRID,
          String(j),
        );
      }
    }
  }

  // Mistake overlay (deliberate divergence): a red inset outline on a cell of a
  // wrong-colored region.
  if (mistake) {
    const inset = Math.max(1, Math.floor(ts / 12));
    const t = Math.max(1, Math.floor(ts / 16));
    const x0 = cx + inset;
    const y0 = cy + inset;
    const bw = ts - 2 * inset;
    dr.drawRect({ x: x0, y: y0, w: bw, h: t }, COL_MISTAKE);
    dr.drawRect({ x: x0, y: y0 + bw - t, w: bw, h: t }, COL_MISTAKE);
    dr.drawRect({ x: x0, y: y0, w: t, h: bw }, COL_MISTAKE);
    dr.drawRect({ x: x0 + bw - t, y: y0, w: t, h: bw }, COL_MISTAKE);
  }

  dr.unclip();
  dr.drawUpdate({ x: cx, y: cy, w: ts, h: ts });
}

export function redraw(
  dr: GameDrawing,
  ds: MapDrawState,
  _prev: MapState | null,
  s: MapState,
  _dir: number,
  ui: MapUi,
  _animTime: number,
  flashTime: number,
  _hint?: unknown,
  mistakes?: readonly MapMistake[],
): void {
  const { w, h } = s.params;
  const n = s.params.n;
  const wh = w * h;
  const ts = ds.tileSize;
  const map = s.map;
  const M = map.map;

  // Erase a previous floating blob.
  if (ds.dragVisible) {
    dr.blitterLoad(ds.bl, { x: ds.dragX, y: ds.dragY });
    dr.drawUpdate({ x: ds.dragX, y: ds.dragY, w: ts + 3, h: ts + 3 });
    ds.dragVisible = false;
  }

  if (!ds.started) {
    dr.drawRect(
      { x: coord(0, ts), y: coord(0, ts), w: w * ts + 1, h: h * ts + 1 },
      COL_GRID,
    );
    ds.started = true;
  }

  // Flash phase.
  let flash = -1;
  if (flashTime) {
    const len = flashLengthFromUi(ui);
    if (ui.flashType === FLASH_EACH_TO_WHITE)
      flash = Math.floor((flashTime * FOUR) / len);
    else flash = 1 + Math.floor((flashTime * (FOUR - 1)) / len);
  }

  const mistakeSet = new Set<number>();
  if (mistakes) for (const m of mistakes) mistakeSet.add(m.region);

  // The selected region, hidden while the completion flash plays, and in notes
  // mode the cell that carries the corner triangle: the region's first in
  // reading order.
  const selected = ui.cursor.visible && flash < 0 ? regionFromUiCursor(map, ui) : -1;
  let notesCell = -1;
  if (selected >= 0 && ui.pencilMode) {
    for (let i = 0; i < wh && notesCell < 0; i++)
      if (M[TE * wh + i] === selected || M[BE * wh + i] === selected) notesCell = i;
  }

  // Build the `todraw` array.
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const tRegion = M[TE * wh + y * w + x];
      const bRegion = M[BE * wh + y * w + x];
      let tv = s.coloring[tRegion];
      let bv = s.coloring[bRegion];
      if (tv < 0) tv = FOUR;
      if (bv < 0) bv = FOUR;

      if (flash >= 0) {
        if (ui.flashType === FLASH_EACH_TO_WHITE) {
          if (tv === flash) tv = FOUR;
          if (bv === flash) bv = FOUR;
        } else if (ui.flashType === FLASH_ALL_TO_WHITE) {
          if (flash % 2) {
            tv = FOUR;
            bv = FOUR;
          }
        } else {
          if (tv !== FOUR) tv = (tv + flash) % FOUR;
          if (bv !== FOUR) bv = (bv + flash) % FOUR;
        }
      }

      let v = tv * FIVE + bv;

      for (let i = 0; i < FOUR; i++) {
        if (s.coloring[tRegion] < 0 && s.pencil[tRegion] & (1 << i))
          v |= PENCIL_T_BASE << i;
        if (s.coloring[bRegion] < 0 && s.pencil[bRegion] & (1 << i))
          v |= PENCIL_B_BASE << i;
      }

      if (ui.showNumbers) v |= SHOW_NUMBERS;
      if (tRegion === selected) v |= SEL_TOP;
      if (bRegion === selected) v |= SEL_BOTTOM;
      if (y * w + x === notesCell) v |= SEL_NOTES;
      if (mistakeSet.has(tRegion) || mistakeSet.has(bRegion)) v |= MISTAKE;

      ds.todraw[y * w + x] = v;
    }

  // Overlay adjacency error markers.
  for (let i = 0; i < map.ngraph; i++) {
    const v1 = Math.floor(map.graph[i] / n);
    const v2 = map.graph[i] % n;
    if (s.coloring[v1] < 0 || s.coloring[v2] < 0) continue;
    if (s.coloring[v1] !== s.coloring[v2]) continue;

    let ex = map.edgex[i];
    let ey = map.edgey[i];
    const xo = ex % 2;
    ex = Math.floor(ex / 2);
    const yo = ey % 2;
    ey = Math.floor(ey / 2);

    ds.todraw[ey * w + ex] |= ERR_BASE << (yo * 3 + xo);
    if (xo === 0) ds.todraw[ey * w + (ex - 1)] |= ERR_BASE << (yo * 3 + 2);
    if (yo === 0) ds.todraw[(ey - 1) * w + ex] |= ERR_BASE << (2 * 3 + xo);
    if (xo === 0 && yo === 0)
      ds.todraw[(ey - 1) * w + (ex - 1)] |= ERR_BASE << (2 * 3 + 2);
  }

  // Draw changed cells.
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const v = ds.todraw[y * w + x];
      if (ds.drawn[y * w + x] !== v) {
        drawSquare(dr, ts, map, x, y, v, ui.largeStipples);
        ds.drawn[y * w + x] = v;
      }
    }

  // The floating drag blob: the color (or the marks) in the player's hand.
  // The selection itself is the band `drawSelection` paints; the blob is only
  // what is being carried.
  if (ui.dragColor > -2) {
    const bg = ui.dragColor >= 0 ? COL_0 + ui.dragColor : COL_BACKGROUND;

    let cursorX: number;
    let cursorY: number;
    if (ui.cursor.visible) {
      // Carried by the keyboard, the blob sits at the **centroid** of the
      // triangle the cursor names, which for a quadrant of a square is exactly
      // a third of a tile from the center, so it says which half of a divided
      // cell the drop will land in; on a whole cell it keeps upstream's
      // one-pixel nudge, since all four quadrants are the same region there.
      const reach = dividedCell(map, ui.cursor.x, ui.cursor.y) ? Math.floor(ts / 3) : 1;
      cursorX =
        coord(ui.cursor.x, ts) + Math.floor(ts / 2) + epsilonX(ui.curLastmove) * reach;
      cursorY =
        coord(ui.cursor.y, ts) + Math.floor(ts / 2) + epsilonY(ui.curLastmove) * reach;
    } else {
      cursorX = ui.dragX;
      cursorY = ui.dragY;
    }

    // Allocated lazily: only `redraw` has the `GameDrawing`.
    if (!ds.bl) ds.bl = dr.blitterNew({ w: ts + 3, h: ts + 3 });

    ds.dragX = cursorX - Math.floor(ts / 2) - 2;
    ds.dragY = cursorY - Math.floor(ts / 2) - 2;
    dr.blitterSave(ds.bl, { x: ds.dragX, y: ds.dragY });
    dr.drawCircle({ x: cursorX, y: cursorY }, Math.floor(ts / 2), bg, COL_GRID);
    for (let i = 0; i < FOUR; i++)
      if (ui.dragPencil & (1 << i))
        dr.drawCircle(
          {
            x: cursorX + Math.trunc(((((i * 4 + 2) % 10) - 3) * ts) / 10),
            y: cursorY + Math.trunc(((i * 2 - 3) * ts) / 10),
          },
          Math.floor(ts / 8),
          COL_0 + i,
          COL_0 + i,
        );
    dr.drawUpdate({ x: ds.dragX, y: ds.dragY, w: ts + 3, h: ts + 3 });
    ds.dragVisible = true;
  }

  // The pencil-mode indicator (fork addition), in the engine's corner: the
  // Marks key makes a drop pencil rather than color, and this is what says so.
  repaintPencilIndicator(
    dr,
    ds,
    ui.pencilMode,
    pencilIndicatorBox(computeSize(s.params, ts), ts),
    PENCIL_STYLE,
  );
}
