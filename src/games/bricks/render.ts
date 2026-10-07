/**
 * Bricks rendering — port of `game_redraw` (and `game_compute_size`,
 * `game_set_offsets`, the error-mark helpers) in
 * `puzzles/unreleased/bricks.c`.
 *
 * The hexagon is drawn by shearing the padded parallelogram: each row is
 * offset rightward by half a tile per row, so every geometric difference from
 * a plain grid comes out of that one offset plus the `F_BOUND` mask. Bricks
 * uses upstream's `NARROW_BORDERS` layout: no border, and `computeSize` adds
 * one pixel for the right/bottom edges.
 *
 * The board is pieces on a quiet surface (`engine/piece.ts`): a shaded brick
 * is the collection's shaded piece inset on its cell, a ruled-out one carries
 * a dot, a clue sits on a lifted cell, and every mark drawn at a cell's edge
 * lands beside the piece. A cell is a square whatever the row's offset, so the
 * piece is the square one.
 *
 * Rule-violation marks (three-in-a-row bars, gravity diamonds, over-count red
 * clues) display the validity pass `findMistakes` exposes. As upstream, they
 * show live only while a drag is in flight; a committed board carries none
 * until Check & Save passes the `mistakes` overlay.
 */

import {
  CURSOR,
  cellSurface,
  ERROR,
  ERROR_TEXT,
  givenSurface,
  HINT_ACTION,
  HINT_EVIDENCE,
  INK,
  RULED_OUT,
  SHADED,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawThickRectOutline, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { drawMarkSides, MARK_ALL } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { drawPiece, drawRuledOutDot, SHADED_SHAPE } from "../../engine/piece.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import type { BricksHint } from "./index.ts";
import { bricksValidate } from "./solver.ts";
import {
  type BricksMistake,
  type BricksMove,
  type BricksParams,
  type BricksState,
  type BricksUi,
  COL_MASK,
  F_BOUND,
  F_EMPTY,
  F_SHADE,
  F_UNSHADE,
  FE_CURSOR,
  FE_ERROR,
  FE_LINE_LEFT,
  FE_LINE_RIGHT,
  FE_TOPLEFT,
  FE_TOPRIGHT,
  NUM_MASK,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 48;
const FLASH_FRAME = 0.12;
export const FLASH_TIME = FLASH_FRAME * 5;

// --- palette ----------------------------------------------------------------

/** The ground beside the sheared rows, where no cell is. */
export const COL_BACKGROUND = 0;
export const COL_GRID = 1;
/** The surface of a cell, which is all an undecided cell is. */
export const COL_EMPTY = 2;
/** The surface under a clue. */
export const COL_GIVEN = 3;
export const COL_SHADE = 4;
export const COL_ERROR = 5;
export const COL_CURSOR = 6;
export const COL_HINT = 7; // the forced cell — ringed on its own border
export const COL_HINT_CELL = 8; // the deduction's evidence — a ring inside it
/** The digit on a clue's lifted cell. */
export const COL_NUMBER = 9;
/** The dot in a cell the player has ruled out. */
export const COL_RULED_OUT = 10;
/** The `!` on a gravity diamond, and the diamond's rim. */
export const COL_ERROR_TEXT = 11;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_EMPTY] = cellSurface(defaultBackground);
  out[COL_GIVEN] = givenSurface(defaultBackground);
  out[COL_SHADE] = SHADED;
  out[COL_ERROR] = ERROR;
  out[COL_CURSOR] = CURSOR;
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_CELL] = HINT_EVIDENCE;
  out[COL_NUMBER] = INK;
  out[COL_RULED_OUT] = RULED_OUT;
  out[COL_ERROR_TEXT] = ERROR_TEXT;
  return out;
}

// --- geometry (NARROW_BORDERS: BORDER = 0) ----------------------------------

/** Even tile size (upstream `tilesize &= ~1`) so the `ts/2` shear is exact. */
const evenTs = (ts: number): number => ts & ~1;

export function computeSize(p: BricksParams, ts0: number): Size {
  const ts = evenTs(ts0);
  return { w: p.w * ts + (ts >> 1) + 1, h: p.h * ts + 1 };
}

/** The per-frame origin (upstream `game_set_offsets`): shift left past the
 * ⌈h/2⌉ − 1 padding columns (`gridSize`) so the sheared rows center in the
 * canvas. Shared with `interpretMove` so pointer mapping and drawing agree. */
export function offsets(h: number, ts: number): { ox: number; oy: number } {
  return { ox: (1 - Math.ceil(h / 2)) * ts, oy: 0 };
}

/** Top-left pixel of padded cell (x, y): each row shifts half a tile right of
 * the one above. */
export function tileOrigin(x: number, y: number, h: number, ts: number): Point {
  const { ox, oy } = offsets(h, ts);
  return { x: x * ts + ox + y * (ts >> 1), y: y * ts + oy };
}

// --- draw state -------------------------------------------------------------

export interface BricksDrawState {
  tileSize: number;
  /** Last drawn packed cell value per padded index (`-1` = never drawn). */
  cache: Int32Array;
}

export function newDrawState(state: BricksState, tileSize: number): BricksDrawState {
  return {
    tileSize: evenTs(tileSize),
    cache: new Int32Array(state.w * state.h).fill(-1),
  };
}

// --- error-mark helpers (upstream bricks_draw_err_*) ------------------------

function drawErrRectangle(
  dr: GameDrawing,
  x: number,
  y: number,
  w: number,
  h: number,
  ts: number,
): void {
  const thick = (ts / 10) | 0;
  const margin = (ts / 20) | 0;
  drawThickRectOutline(
    dr,
    x + margin,
    y + margin,
    w - 2 * margin,
    h - 2 * margin,
    thick,
    COL_ERROR,
  );
}

/** A diamond with an exclamation mark (upstream `bricks_draw_err_gravity`,
 * itself copied from tents.c). It straddles the edge between two cells and so
 * overlaps their pieces: the rim is what parts its red from a piece, where the
 * two differ in hue and hardly in lightness. */
function drawErrGravity(dr: GameDrawing, ts: number, x: number, y: number): void {
  const e = ((ts * 2) / 5) | 0;
  dr.drawPolygon(
    [
      { x: x - e, y },
      { x, y: y - e },
      { x: x + e, y },
      { x, y: y + e },
    ],
    COL_ERROR,
    COL_ERROR_TEXT,
  );
  const xext = (ts / 16) | 0;
  const yext = e - (xext * 2 + 2);
  dr.drawRect(
    { x: x - xext, y: y - yext, w: xext * 2 + 1, h: yext * 2 + 1 - xext * 3 },
    COL_ERROR_TEXT,
  );
  dr.drawRect(
    { x: x - xext, y: y + yext - xext * 2 + 1, w: xext * 2 + 1, h: xext * 2 },
    COL_ERROR_TEXT,
  );
}

// Hint-overlay bits packed into the render cache word, above the cell's own
// bits (num/bound/color + FE_* error/cursor flags all fit under 0x1000).
const HINT_TARGET = 1 << 12; // the forced cell — painted COL_HINT
const HINT_EVID = 1 << 13; // a deduction-evidence cell — inset COL_HINT_CELL ring

// --- one tile ---------------------------------------------------------------

function drawTile(
  dr: GameDrawing,
  ts: number,
  tx: number,
  ty: number,
  n: number,
): void {
  // The forced cell keeps its own color and is **ringed** below: in a game
  // whose move is "shade this cell or rule it out", a solid fill would say with
  // the board what the narration is still proposing. (`redraw` never passes a
  // bound cell.)
  const color = n & COL_MASK;
  // A cell with no play color is a clue, which the puzzle gave.
  const inner = { x: tx + 1, y: ty + 1, w: ts - 1, h: ts - 1 };
  dr.drawRect(inner, color ? COL_EMPTY : COL_GIVEN);
  if (color === F_SHADE) drawPiece(dr, inner, SHADED_SHAPE, COL_SHADE);
  else if (color === F_UNSHADE) drawRuledOutDot(dr, inner, COL_RULED_OUT);

  // Square border.
  dr.drawPolygon(
    [
      { x: tx, y: ty },
      { x: tx + ts, y: ty },
      { x: tx + ts, y: ty + ts },
      { x: tx, y: ty + ts },
    ],
    -1,
    COL_GRID,
  );

  // Three-in-a-row bar (extends toward the shaded neighbor(s)).
  if (n & (FE_LINE_LEFT | FE_LINE_RIGHT)) {
    let left = tx + 1;
    let right = tx + ts - 1;
    if (n & FE_LINE_LEFT) right += ts >> 1;
    if (n & FE_LINE_RIGHT) left -= ts >> 1;
    drawErrRectangle(dr, left, ty + 1, right - left, ts - 1, ts);
  }

  const cx = tx + (ts >> 1);
  const cy = ty + (ts >> 1);

  // Clue number, or (on a colored/error cell) the gravity diamond.
  if (!color) {
    const num = n & NUM_MASK;
    dr.drawText(
      { x: cx, y: cy },
      glyphFont(ts >> 1),
      n & FE_ERROR ? COL_ERROR : COL_NUMBER,
      num === 7 ? "?" : String(num),
    );
  } else if (n & FE_ERROR) {
    drawErrGravity(dr, ts, cx, ty + ts);
  }

  if (n & FE_TOPLEFT) drawErrGravity(dr, ts, tx, ty);
  if (n & FE_TOPRIGHT) drawErrGravity(dr, ts, tx + ts, ty);

  // The cursor and the evidence ring are frames just inside the cell's border,
  // in the margin a piece leaves round itself, so neither lands on the piece.
  // The evidence ring is the thinner of the two rings a hint draws and stays
  // off the border line, which the acted-on cell's ring covers.
  if (n & HINT_EVID) {
    const t = Math.max(2, (ts / 16) | 0);
    drawThickRectOutline(dr, inner.x, inner.y, inner.w, inner.h, t, COL_HINT_CELL);
  }

  if (n & FE_CURSOR) {
    const t = Math.max(2, (ts / 12) | 0);
    drawThickRectOutline(dr, inner.x, inner.y, inner.w, inner.h, t, COL_CURSOR);
  }

  dr.drawUpdate({ x: tx, y: ty, w: ts + 1, h: ts + 1 });
}

/**
 * The acted-on cell's ring, on the square's own border and reaching no
 * further in than the margin a piece leaves round itself.
 *
 * Stamped after the tile loop on every frame, because the border lines are
 * shared: a neighbor repainting strokes its own border over the ring's outer
 * line, and whether one did would otherwise depend on which tiles happened to
 * repaint. The cell still keys on `HINT_TARGET`, so when the ring goes, the
 * cell's own border stroke is what paints those lines back.
 */
function drawTargetRing(dr: GameDrawing, ts: number, tx: number, ty: number): void {
  drawMarkSides(
    dr,
    {
      box: { x: tx, y: ty, w: ts + 1, h: ts + 1 },
      outer: 0,
      inner: Math.max(2, (ts / 12) | 0),
    },
    MARK_ALL,
    COL_HINT,
  );
}

// --- redraw -----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: BricksDrawState,
  _prev: BricksState | null,
  state: BricksState,
  _dir: number,
  ui: BricksUi,
  _animTime: number,
  flashTime: number,
  hint?: HintStep<BricksMove, BricksHint>,
  mistakes?: readonly BricksMistake[],
): void {
  const ts = ds.tileSize;
  const { w, h, grid } = state;
  const s = w * h;

  const marks = stepMarks(hint);
  const indexOf = (p: Point): number => p.y * w + p.x;
  const hintTargets = new Set(marks.of("ring", CELL).map(indexOf));
  const hintEvid = new Set(marks.of("outline", CELL).map(indexOf));

  const flash = flashTime > 0 && ((flashTime / FLASH_FRAME) | 0) & 1;

  // Apply the in-flight drag preview to a working grid.
  const hasDrag = ui.drag.length > 0 && ui.dragType !== 0;
  const shown = hasDrag ? grid.slice() : grid;
  if (hasDrag) {
    for (const i of ui.drag) {
      if (shown[i] & COL_MASK) shown[i] = ui.dragType;
    }
  }

  // Error flags to display: from the drag preview (live), or the Check & Save
  // overlay — never on a plain committed frame (upstream), and never mid-flash.
  let errorFlags: Uint16Array | null = null;
  if (!flash) {
    if (hasDrag) {
      errorFlags = new Uint16Array(s);
      bricksValidate(shown, w, h, false, errorFlags);
    } else if (mistakes && mistakes.length > 0) {
      errorFlags = new Uint16Array(s);
      for (const m of mistakes) errorFlags[m.index] |= m.flags;
    }
  }

  for (let i = 0; i < s; i++) {
    if (shown[i] & F_BOUND) continue;

    const x = i % w;
    const y = (i / w) | 0;
    let n = shown[i];
    if (flash && (n & COL_MASK) === F_SHADE) n = F_EMPTY;
    if (errorFlags) n |= errorFlags[i];
    if (ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y) n |= FE_CURSOR;
    if (hintTargets.has(i)) n |= HINT_TARGET;
    else if (hintEvid.has(i)) n |= HINT_EVID;

    if (ds.cache[i] === n) continue;
    ds.cache[i] = n;

    // Each tile paints inside its own square, as upstream clips it. A rule
    // mark is drawn whole but lands in pieces: the three-in-a-row bar reaches
    // half a square into each barred neighbor and a gravity diamond sits on a
    // shared edge or corner, and the neighbors carry the flags for their own
    // pieces. The clip is what makes each piece the business of the square
    // that carries its flag, so a piece goes when that square repaints. A
    // square with no neighbor beside it owns the ground there as well, where a
    // diamond on the board's side edge lands (`bricks.test.ts`, "takes an edge
    // diamond away whole, ground included").
    const { x: tx, y: ty } = tileOrigin(x, y, h, ts);
    let clipX = tx;
    let clipW = ts + 1;
    if (x === 0 || shown[i - 1] & F_BOUND) {
      clipX -= ts;
      clipW += ts;
      dr.drawRect({ x: tx - ts + 1, y: ty + 1, w: ts - 1, h: ts - 1 }, COL_BACKGROUND);
      dr.drawUpdate({ x: tx - ts + 1, y: ty, w: ts + 1, h: ts + 1 });
    }
    if (x === w - 1 || shown[i + 1] & F_BOUND) {
      clipW += ts;
      dr.drawRect({ x: tx + ts + 1, y: ty + 1, w: ts - 1, h: ts - 1 }, COL_BACKGROUND);
      dr.drawUpdate({ x: tx + ts + 1, y: ty, w: ts + 1, h: ts + 1 });
    }
    dr.clip({ x: clipX, y: ty, w: clipW, h: ts + 1 });
    drawTile(dr, ts, tx, ty, n);
    dr.unclip();
  }

  for (const { x, y } of marks.of("ring", CELL)) {
    const o = tileOrigin(x, y, h, ts);
    drawTargetRing(dr, ts, o.x, o.y);
  }
}
