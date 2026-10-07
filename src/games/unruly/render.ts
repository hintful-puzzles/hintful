/**
 * Unruly rendering. A per-tile cache keyed on a packed flag word (upstream's
 * `tile` int); error overlays (3-in-a-row bars, the count `!`, unique-match
 * bars) recomputed each frame from the validators; a completion flash that
 * lifts every cell.
 *
 * The board is pieces on a quiet surface (`engine/piece.ts`): the two states
 * are the collection's two-state pair, a given sits on a lifted cell, and
 * every mark drawn at a cell's edge lands beside the piece.
 */

import { ORANGE, TWO } from "../../engine/color/colors.ts";
import {
  CURSOR,
  cellSurface,
  ERROR,
  ERROR_TEXT,
  givenSurface,
  HINT_ACTION,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawThickRectOutline, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import { drawMarkSides, MARK_ALL } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { drawPiece, TWO_SHAPES } from "../../engine/piece.ts";
import type { Color, Point, Size } from "../../engine/types.ts";
import { type Cell, EMPTY, ONE, pairIndex, ZERO } from "./constants.ts";
import type { UnrulyHint } from "./index.ts";
import {
  FE_COL_MATCH,
  FE_HOR_ROW_LEFT,
  FE_HOR_ROW_RIGHT,
  FE_ROW_MATCH,
  FE_VER_ROW_BOTTOM,
  FE_VER_ROW_TOP,
  validateCounts,
  validateRows,
} from "./solver.ts";
import type {
  UnrulyMistake,
  UnrulyMove,
  UnrulyParams,
  UnrulyState,
  UnrulyUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 32;
const FLASH_FRAME = 0.12;
export const FLASH_TIME = FLASH_FRAME * 3;
/** Base duration (s) of a single-cell placement animation; the midend
 * stretches it to the uniform hint-step duration for auto-hint. */
export const PLACE_ANIM_TIME = 0.13;

// --- palette -------------------------------------------------------------
export const COL_BACKGROUND = 0;
export const COL_GRID = 1;
/** The surface of a cell, which is all an undecided cell is. */
export const COL_EMPTY = 2;
/** The surface under a given, and under every cell while the board flashes. */
export const COL_GIVEN = 3;
export const COL_0 = 4;
export const COL_1 = 5;
export const COL_CURSOR = 6;
export const COL_ERROR = 7;
export const COL_ERROR_TEXT = 8;
// The action cell rings COL_HINT, the line the sentence names is hatched in
// it, and the cited premise cells ring COL_HINT_REF, distinct from the move.
export const COL_HINT = 9;
export const COL_HINT_REF = 10;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_EMPTY] = cellSurface(defaultBackground);
  out[COL_GIVEN] = givenSurface(defaultBackground);
  out[COL_1] = TWO[pairIndex(ONE)];
  out[COL_0] = TWO[pairIndex(ZERO)];
  out[COL_CURSOR] = CURSOR;
  out[COL_ERROR] = ERROR;
  out[COL_ERROR_TEXT] = ERROR_TEXT;
  out[COL_HINT] = HINT_ACTION;
  // Cited premise / pivotal cells. A single ring color (not the cross-game
  // black/white-ref pair): Unruly's ring set is mixed — pieces of one kind, a
  // balanced reference row holding both, and empty reserved windows — so a
  // state-derived color is ill-defined. Orange keeps it clear of the blue
  // move and of both pieces.
  out[COL_HINT_REF] = ORANGE;
  return out;
}

// --- packed tile flags (upstream FE_*/FF_*; also the cache key) ---------
const FE_COUNT = 0x10;
const FF_ONE = 0x80;
const FF_ZERO = 0x100;
const FF_CURSOR = 0x200;
const FF_FLASH = 0x400;
const FF_IMMUTABLE = 0x1000;
// Our mistake-overlay bit (no upstream analog), folded into the cache key.
const FF_MISTAKE = 0x2000;
// Hint-overlay bits (no upstream analog), also folded into the cache key.
const FF_HINT_TARGET = 0x4000; // the forced cell (COL_HINT ring)
const FF_HINT_LINE = 0x10000; // a cell of the line the sentence names (hatched)
const FF_HINT_RING = 0x20000; // a cited premise / pivotal cell (COL_HINT_REF outline)

// --- geometry -----------------------------------------------------------
/** The board's pixel origin. Exported so `interpretMove` reads the same number
 * the painter does — one function, both callers
 * ([`docs/games/mechanics.md`](../../../docs/games/mechanics.md)). */
export const border = (ts: number) => Math.floor(ts / 2);
/** The frame closes the grid on its top and left and is no heavier than it. */
const outerEdge = (_ts: number) => 1;
const coord = (n: number, ts: number) => n * ts + border(ts);

export function computeSize(p: UnrulyParams, ts: number): Size {
  return { w: ts * p.w2 + 2 * border(ts), h: ts * p.h2 + 2 * border(ts) };
}

// --- draw state ---------------------------------------------------------

export interface UnrulyDrawState {
  started: boolean;
  tileSize: number;
  /** Last-drawn packed tile word per cell; -1 forces a draw. */
  cache: Int32Array;
}

export function newDrawState(state: UnrulyState, tileSize: number): UnrulyDrawState {
  return {
    started: false,
    tileSize,
    cache: new Int32Array(state.w2 * state.h2).fill(-1),
  };
}

// --- tile drawing -------------------------------------------------------

function drawErrRectangle(
  dr: GameDrawing,
  x: number,
  y: number,
  w: number,
  h: number,
  ts: number,
): void {
  const thick = Math.floor(ts / 10);
  const margin = Math.floor(ts / 20);
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

function drawTile(
  dr: GameDrawing,
  px: number,
  py: number,
  ts: number,
  tile: number,
  // Placement animation: the value the cell held before, or null if it is not
  // animating; `animFrac` is the progress 0→1.
  animPrev: Cell | null = null,
  animFrac = 1,
): void {
  dr.clip({ x: px, y: py, w: ts, h: ts });

  // Grid edge first, so the cell can overwrite it.
  dr.drawRect({ x: px, y: py, w: ts, h: ts }, COL_GRID);

  // The cell's surface, lifted under a given and on the flash's lit frames.
  const inner = { x: px, y: py, w: ts - 1, h: ts - 1 };
  const value: Cell = tile & FF_ZERO ? ZERO : tile & FF_ONE ? ONE : EMPTY;
  const lifted = (value !== EMPTY && tile & FF_IMMUTABLE) || tile & FF_FLASH;
  dr.drawRect(inner, lifted ? COL_GIVEN : COL_EMPTY);
  // The hatch goes under the piece: it marks the line, and the piece is what
  // the line holds.
  if (tile & FF_HINT_LINE) dr.drawHatch(inner, COL_HINT, hatchPeriod(ts));

  const piece = (v: Cell, grown: number): void => {
    if (v === EMPTY) return;
    const i = pairIndex(v);
    drawPiece(dr, inner, TWO_SHAPES[i], v === ONE ? COL_1 : COL_0, grown);
  };
  if (animPrev !== null && animFrac < 1) {
    // A placed piece grows from the middle of its cell, and one taken away
    // shrinks into it. One replacing another grows alone: two shapes in one
    // cell read as neither.
    if (value === EMPTY) piece(animPrev, 1 - animFrac);
    else piece(value, animFrac);
  } else {
    piece(value, 1);
  }

  // 3-in-a-row error bars, extending a half-tile into the run's neighbors
  // (clipped to this tile, so each tile draws its own portion).
  if (tile & (FE_HOR_ROW_LEFT | FE_HOR_ROW_RIGHT)) {
    let left = px;
    let right = px + ts - 1;
    if (tile & FE_HOR_ROW_LEFT) right += Math.floor(ts / 2);
    if (tile & FE_HOR_ROW_RIGHT) left -= Math.floor(ts / 2);
    drawErrRectangle(dr, left, py, right - left, ts - 1, ts);
  }
  if (tile & (FE_VER_ROW_TOP | FE_VER_ROW_BOTTOM)) {
    let top = py;
    let bottom = py + ts - 1;
    if (tile & FE_VER_ROW_TOP) bottom += Math.floor(ts / 2);
    if (tile & FE_VER_ROW_BOTTOM) top -= Math.floor(ts / 2);
    drawErrRectangle(dr, px, top, ts - 1, bottom - top, ts);
  }

  // Count error: a badge, because the `!` sits on the piece and red ink on a
  // purple piece is a difference of hue with none of lightness.
  if (tile & FE_COUNT) {
    const c = { x: px + Math.floor(ts / 2), y: py + Math.floor(ts / 2) };
    dr.drawCircle(c, ts / 4, COL_ERROR, COL_ERROR);
    dr.drawText(c, glyphFont(Math.floor((ts * 2) / 5)), COL_ERROR_TEXT, "!");
  }

  // Unique-match bars.
  if (tile & FE_ROW_MATCH) {
    dr.drawRect(
      {
        x: px,
        y: py + Math.floor(ts / 2) - Math.floor(ts / 12),
        w: ts,
        h: 2 * Math.floor(ts / 12),
      },
      COL_ERROR,
    );
  }
  if (tile & FE_COL_MATCH) {
    dr.drawRect(
      {
        x: px + Math.floor(ts / 2) - Math.floor(ts / 12),
        y: py,
        w: 2 * Math.floor(ts / 12),
        h: ts,
      },
      COL_ERROR,
    );
  }

  // Mistake overlay (Check & Save): an inset error-colored outline, distinct
  // from the live 3-in-a-row / count errors above.
  if (tile & FF_MISTAKE) {
    const t = Math.max(1, Math.floor(ts / 16));
    const inset = Math.max(1, Math.floor(ts / 8));
    const sx = px + inset;
    const sy = py + inset;
    const span = ts - 1 - 2 * inset;
    dr.drawRect({ x: sx, y: sy, w: span, h: t }, COL_ERROR);
    dr.drawRect({ x: sx, y: sy + span - t, w: span, h: t }, COL_ERROR);
    dr.drawRect({ x: sx, y: sy, w: t, h: span }, COL_ERROR);
    dr.drawRect({ x: sx + span - t, y: sy, w: t, h: span }, COL_ERROR);
  }

  // Hint ring around a cited premise cell. Its own color stays visible: for a
  // filled premise that color *is* the evidence; for an empty reserved window
  // the ring marks the spared cells. COL_HINT_REF, not the move's COL_HINT, so
  // premise and move don't read as the same element type.
  if (tile & FF_HINT_RING) {
    const t = Math.max(1, Math.floor(ts / 12));
    dr.drawRect({ x: px, y: py, w: ts - 1, h: t }, COL_HINT_REF);
    dr.drawRect({ x: px, y: py + ts - 1 - t, w: ts - 1, h: t }, COL_HINT_REF);
    dr.drawRect({ x: px, y: py, w: t, h: ts - 1 }, COL_HINT_REF);
    dr.drawRect({ x: px + ts - 1 - t, y: py, w: t, h: ts - 1 }, COL_HINT_REF);
  }

  // The forced cell is **ringed**, in the same shape and place a cited premise
  // is: the hint marks where to act, it does not place the color the player
  // must enter themselves. A blue *fill* in a game whose entire move is "put
  // one of two pieces here" reads as a third piece already placed. The
  // narration says which color; auto-hint applies it for real.
  if (tile & FF_HINT_TARGET) {
    drawMarkSides(
      dr,
      { box: inner, outer: 0, inner: Math.max(2, Math.floor(ts / 12)) },
      MARK_ALL,
      COL_HINT,
    );
  }

  // Cursor outline.
  if (tile & FF_CURSOR) {
    const t = Math.floor(ts / 12);
    dr.drawRect({ x: px, y: py, w: t, h: ts - 1 }, COL_CURSOR);
    dr.drawRect({ x: px, y: py, w: ts - 1, h: t }, COL_CURSOR);
    dr.drawRect({ x: px + ts - 1 - t, y: py, w: t, h: ts - 1 }, COL_CURSOR);
    dr.drawRect({ x: px, y: py + ts - 1 - t, w: ts - 1, h: t }, COL_CURSOR);
  }

  dr.unclip();
  dr.drawUpdate({ x: px, y: py, w: ts, h: ts });
}

// --- redraw -------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: UnrulyDrawState,
  prev: UnrulyState | null,
  state: UnrulyState,
  _dir: number,
  ui: UnrulyUi,
  animTime: number,
  flashTime: number,
  hint?: HintStep<UnrulyMove, UnrulyHint>,
  mistakes?: readonly UnrulyMistake[],
): void {
  const ts = ds.tileSize;
  const { w2, h2, grid, immutable } = state;
  const s = w2 * h2;
  const mistakeSet =
    mistakes && mistakes.length > 0
      ? new Set(mistakes.map((m) => m.y * w2 + m.x))
      : null;

  // Displayed hint step: the forced target, the named line, premise rings.
  const marks = stepMarks(hint);
  const at = (p: Point): number => p.y * w2 + p.x;
  const hintTargets = new Set(marks.of("ring", CELL).map(at));
  const hintLineSet = new Set(marks.of("stripes", CELL).map(at));
  const hintRingSet = new Set(marks.of("outline", CELL).map(at));

  // A placement animates only when the engine is driving timed redraws
  // (animTime > 0) and we have a from-state to grow out of.
  const animating = animTime > 0 && prev != null;
  const animFrac = animTime / PLACE_ANIM_TIME;
  if (!ds.started) {
    // The outer grid-edge frame.
    const o = outerEdge(ts);
    dr.drawRect(
      {
        x: coord(0, ts) - o,
        y: coord(0, ts) - o,
        w: ts * w2 + 2 * o - 1,
        h: ts * h2 + 2 * o - 1,
      },
      COL_GRID,
    );
    ds.started = true;
  }

  // Lit, unlit, lit.
  const flash =
    flashTime > 0 && Math.floor(flashTime / FLASH_FRAME) !== 1 ? FF_FLASH : 0;

  // Recompute error overlays each frame (live error display, like upstream).
  const gridfs = new Int32Array(s);
  validateRows(state, gridfs);
  const rowfs = new Uint8Array(2 * (w2 + h2));
  validateCounts(state, rowfs);

  for (let y = 0; y < h2; y++) {
    for (let x = 0; x < w2; x++) {
      const i = y * w2 + x;
      let tile = gridfs[i];
      if (grid[i] === ONE) {
        tile |= FF_ONE;
        if (rowfs[y] || rowfs[2 * h2 + x]) tile |= FE_COUNT;
      } else if (grid[i] === ZERO) {
        tile |= FF_ZERO;
        if (rowfs[h2 + y] || rowfs[2 * h2 + w2 + x]) tile |= FE_COUNT;
      }
      tile |= flash;
      if (immutable[i]) tile |= FF_IMMUTABLE;
      if (ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y)
        tile |= FF_CURSOR;
      if (mistakeSet?.has(i)) tile |= FF_MISTAKE;
      // Hint overlay: the target outranks a ring; the hatch runs under either.
      if (hintTargets.has(i)) {
        tile |= FF_HINT_TARGET;
      } else if (hintRingSet.has(i)) {
        tile |= FF_HINT_RING;
      }
      if (hintLineSet.has(i)) tile |= FF_HINT_LINE;

      // An animating cell can't be captured by the packed key, so it is
      // redrawn every frame (cache forced stale, Flip's idiom) and grows the
      // new color out of its previous color.
      const animThis = animating && prev != null && prev.grid[i] !== grid[i];
      if (animThis) {
        ds.cache[i] = -1;
        drawTile(
          dr,
          coord(x, ts),
          coord(y, ts),
          ts,
          tile,
          prev.grid[i] as Cell,
          animFrac,
        );
      } else if (ds.cache[i] !== tile) {
        ds.cache[i] = tile;
        drawTile(dr, coord(x, ts), coord(y, ts), ts, tile);
      }
    }
  }
}
