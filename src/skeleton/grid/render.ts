/**
 * Skeleton's rendering: a loop over the squares that repaints only the ones
 * whose packed key changed (docs/rendering.md § "The tile cache and the
 * diff key").
 *
 * A square is a `COL_GRID` box under a surface one pixel smaller, so the grid
 * lines are what shows between surfaces. A numbered square sits on the lifted
 * surface of a given; a filled one holds the shaded piece and a crossed one
 * the cross.
 */

import {
  cellSurface,
  ERROR_WASH,
  givenSurface,
  INK,
  RULED_OUT,
  SHADED,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import {
  COL_CURSOR,
  COL_ERROR,
  COL_HINT_OUTLINE,
  FIRST_GAME_SLOT,
  rolePalette,
} from "../../engine/color/roles.ts";
import type { Frame, GameDrawing } from "../../engine/contract/game.ts";
import { CELL, stepMarks } from "../../engine/contract/hint-words.ts";
import type { Color, Size } from "../../engine/contract/types.ts";
import { drawRectCorners, glyphFont } from "../../engine/render/draw.ts";
import {
  HintMarks,
  type MarkBand,
  type MarkCell,
} from "../../engine/render/hint-mark.ts";
import { OverlaySidecar } from "../../engine/render/overlay-sidecar.ts";
import {
  drawPiece,
  drawRuledOutCross,
  SHADED_SHAPE,
} from "../../engine/render/piece.ts";
import { NOTHING_TO_CLEAR, type RingClear, textBox } from "../../engine/render/ring.ts";
import { TileCache } from "../../engine/render/tile-cache.ts";
import { sweepStep, type WinTone, winSlot } from "../../engine/render/win-wave.ts";
import type { SkeletonMistake } from "./index.ts";
import {
  BLANK,
  CROSSED,
  FILLED,
  NO_CLUE,
  neighbors,
  type SkeletonMove,
  type SkeletonParams,
  type SkeletonState,
  type SkeletonUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 40;

// --- palette ----------------------------------------------------------------

// The roles every board shares (the board, the flash, the hint's outline, an
// error, the cursor) are the engine's slots; a game numbers its own after
// them.
const COL_GRID = FIRST_GAME_SLOT;
/** The surface of a square the player decides. */
const COL_CELL = FIRST_GAME_SLOT + 1;
/** The surface under a number. */
const COL_GIVEN = FIRST_GAME_SLOT + 2;
export const COL_SHADED = FIRST_GAME_SLOT + 3;
const COL_RULED_OUT = FIRST_GAME_SLOT + 4;
const COL_TEXT = FIRST_GAME_SLOT + 5;
/** The surface under a square Check & Save found wrong. */
export const COL_WRONG = FIRST_GAME_SLOT + 6;

export function colors(bg: Color): Color[] {
  const out = rolePalette(bg);
  out[COL_GRID] = surfaceGrid(bg);
  out[COL_CELL] = cellSurface(bg);
  out[COL_GIVEN] = givenSurface(bg);
  out[COL_SHADED] = SHADED;
  out[COL_RULED_OUT] = RULED_OUT;
  out[COL_TEXT] = INK;
  out[COL_WRONG] = ERROR_WASH;
  return out;
}

// --- geometry ---------------------------------------------------------------

export const border = (ts: number): number => Math.floor(ts / 4);

export function computeSize(p: SkeletonParams, ts: number): Size {
  return { w: p.w * ts + 2 * border(ts) + 1, h: p.h * ts + 2 * border(ts) + 1 };
}

// --- draw state -------------------------------------------------------------

// The tile key: the mark in bits 0-1, the number (offset by one, so "none" is
// 0) in bits 2-4, then one bit a cue and two for the win flash's tone.
const K_CLUE = 2;
const F_ERROR = 1 << 5;
const F_WRONG = 1 << 6;
const F_CURSOR = 1 << 7;
const K_TONE = 8;

export interface SkeletonDrawState {
  tileSize: number;
  /** What each square shows on the canvas, as its tile key, and the hint's
   * marks on it. */
  tiles: TileCache;
  /** The hint step's marks by square. */
  hint: OverlaySidecar;
  /** The ring and the outline, drawn after the tiles. */
  marks: HintMarks;
}

export function newDrawState(
  state: SkeletonState,
  tileSize: number,
): SkeletonDrawState {
  const squares = state.w * state.h;
  const hint = new OverlaySidecar(squares);
  return {
    tileSize,
    tiles: new TileCache(squares, { overlays: [hint] }),
    hint,
    marks: new HintMarks(),
  };
}

/** Whether the number at square `i` can no longer be met: more shaded
 * squares beside it than it counts, or too few left that may still be. A
 * number still short is not one. */
function unmeetable({ w, h, clues, grid }: SkeletonState, i: number): boolean {
  let shaded = 0;
  let open = 0;
  for (const j of neighbors(w, h, i)) {
    if (grid[j] === FILLED) shaded++;
    else if (grid[j] === BLANK && clues[j] === NO_CLUE) open++;
  }
  return shaded > clues[i] || shaded + open < clues[i];
}

/** Where a hint mark sits around square `(x, y)`: on the grid line and a
 * little way into the square, beside the piece. */
function markBand(ts: number, x: number, y: number): MarkBand {
  const b = border(ts);
  return {
    box: { x: x * ts + b + 1, y: y * ts + b + 1, w: ts - 1, h: ts - 1 },
    outer: 1,
    inner: Math.max(2, ts >> 4),
  };
}

/** Where square `(x, y)` draws its number: the arguments `drawText` takes
 * but the color, so the tile and a hint's ring read one place. */
function numberText(ts: number, x: number, y: number) {
  const b = border(ts);
  return {
    origin: { x: x * ts + b + Math.floor(ts / 2), y: y * ts + b + Math.floor(ts / 2) },
    options: glyphFont(Math.floor((ts * 3) / 5)),
  };
}

/** The text square `(x, y)` shows, for a hint's ring to keep clear of. */
function squareText(state: SkeletonState, ts: number, x: number, y: number): RingClear {
  const { w, h } = state;
  if (x < 0 || y < 0 || x >= w || y >= h) return NOTHING_TO_CLEAR;
  const clue = state.clues[y * w + x];
  if (clue === NO_CLUE) return NOTHING_TO_CLEAR;
  const { origin, options } = numberText(ts, x, y);
  return { enclose: [textBox(origin, options, String(clue))], avoid: [] };
}

// --- one square -------------------------------------------------------------

interface Tile {
  mark: number;
  clue: number;
  error: boolean;
  wrong: boolean;
  cursor: boolean;
  tone: WinTone;
}

function drawTile(
  dr: GameDrawing,
  ds: SkeletonDrawState,
  i: number,
  x: number,
  y: number,
  t: Tile,
): void {
  const ts = ds.tileSize;
  const b = border(ts);
  const px = x * ts + b;
  const py = y * ts + b;
  const surface = { x: px + 1, y: py + 1, w: ts - 1, h: ts - 1 };
  const cx = px + Math.floor(ts / 2);
  const cy = py + Math.floor(ts / 2);

  // The square's own lines are its top and left; the frame closes the rest.
  dr.drawRect({ x: px, y: py, w: ts, h: ts }, COL_GRID);
  dr.drawRect(
    surface,
    t.wrong
      ? COL_WRONG
      : t.tone
        ? winSlot(t.tone)
        : t.clue !== NO_CLUE
          ? COL_GIVEN
          : COL_CELL,
  );
  ds.hint.drawHatch(dr, i, surface, ts);

  if (t.clue !== NO_CLUE) {
    const { origin, options } = numberText(ts, x, y);
    dr.drawText(origin, options, t.error ? COL_ERROR : COL_TEXT, String(t.clue));
  } else if (t.mark === FILLED) {
    drawPiece(dr, surface, SHADED_SHAPE, COL_SHADED);
  } else if (t.mark === CROSSED) {
    drawRuledOutCross(dr, surface, COL_RULED_OUT);
  }

  if (t.cursor)
    drawRectCorners(
      dr,
      cx,
      cy,
      Math.floor(ts / 2) - 3,
      COL_CURSOR,
      Math.max(2, ts >> 4),
    );

  dr.drawUpdate({ x: px, y: py, w: ts, h: ts });
}

// --- redraw -----------------------------------------------------------------

export function redraw(
  dr: GameDrawing,
  ds: SkeletonDrawState,
  frame: Frame<SkeletonState, SkeletonUi, SkeletonMove, unknown, SkeletonMistake>,
): void {
  const { state, ui, flash, hint, mistakes } = frame;
  const ts = ds.tileSize;
  const { w, h, clues, grid } = state;
  const b = border(ts);

  if (ds.tiles.firstFrame()) {
    // The frame: every square draws its top and left line, so this is the
    // bottom and right of the last row and column.
    dr.drawRect({ x: b, y: b, w: w * ts + 1, h: h * ts + 1 }, COL_GRID);
  }

  const wrong = new Set(mistakes?.map((m) => m.y * w + m.x));

  // The displayed step's marks, read from its words and from nowhere else:
  // the kinds read here are the kinds a sentence may name.
  const named = stepMarks(hint);
  const targets: readonly MarkCell[] = named.of("ring", CELL);
  const evidence: readonly MarkCell[] = named.of("outline", CELL);
  ds.hint.pack(named, (x, y) => y * w + x);
  const markStyle = {
    band: (x: number, y: number) => markBand(ts, x, y),
    text: (x: number, y: number) => squareText(state, ts, x, y),
    evidenceColor: COL_HINT_OUTLINE,
    // Two numbers side by side are two premises, each outlined by itself.
    joinEvidence: () => false,
  };
  ds.marks.eraseBeforeTiles(dr, targets, evidence, markStyle, COL_GRID, (x, y) => {
    if (x >= 0 && x < w && y >= 0 && y < h) ds.tiles.forget(y * w + x);
  });

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const clue = clues[i];
      const tile: Tile = {
        mark: grid[i],
        clue,
        error: clue !== NO_CLUE && unmeetable(state, i),
        wrong: wrong.has(i),
        cursor: ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y,
        tone: flash.win(sweepStep(x, y)),
      };
      const key =
        tile.mark |
        ((clue + 1) << K_CLUE) |
        (tile.error ? F_ERROR : 0) |
        (tile.wrong ? F_WRONG : 0) |
        (tile.cursor ? F_CURSOR : 0) |
        (tile.tone << K_TONE);
      if (ds.tiles.changed(i, key)) drawTile(dr, ds, i, x, y, tile);
    }
  }

  // After the tiles and outside any clip, because a mark straddles the grid
  // line between two squares.
  ds.marks.paint(dr, targets, evidence, markStyle);
}
