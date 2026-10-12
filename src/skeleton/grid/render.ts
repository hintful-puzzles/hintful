/**
 * Skeleton's rendering: a loop over the squares that repaints only the ones
 * whose packed key changed (docs/games/rendering.md § "The tile cache and the
 * diff key").
 *
 * A square is a `COL_GRID` box under a surface one pixel smaller, so the grid
 * lines are what shows between surfaces. A numbered square sits on the lifted
 * surface of a given; a filled one holds the shaded piece and a crossed one
 * the cross.
 */

import {
  CURSOR,
  cellSurface,
  ERROR,
  ERROR_WASH,
  FLASH,
  FLASH_LEAD,
  givenSurface,
  HINT_ACTION,
  HINT_EVIDENCE,
  INK,
  RULED_OUT,
  SHADED,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawRectCorners, glyphFont } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { HintMarks, type MarkBand, type MarkCell } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import {
  HINT_AREA,
  HINT_TARGET,
  OverlaySidecar,
} from "../../engine/overlay-sidecar.ts";
import { drawPiece, drawRuledOutCross, SHADED_SHAPE } from "../../engine/piece.ts";
import type { Color, Size } from "../../engine/types.ts";
import { type Flash, sweepStep, type WinTone, winSlot } from "../../engine/win-wave.ts";
import type { SkeletonMistake } from "./index.ts";
import { SkeletonBoard } from "./solver.ts";
import {
  CROSSED,
  FILLED,
  NO_CLUE,
  type SkeletonMove,
  type SkeletonParams,
  type SkeletonState,
  type SkeletonUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 40;

// --- palette ----------------------------------------------------------------

const COL_BACKGROUND = 0;
const COL_GRID = 1;
/** The surface of a square the player decides. */
const COL_CELL = 2;
/** The surface under a number. */
const COL_GIVEN = 3;
export const COL_SHADED = 4;
const COL_RULED_OUT = 5;
const COL_TEXT = 6;
/** A number the squares beside it can no longer meet. */
const COL_ERROR = 7;
/** The surface under a square Check & Save found wrong. */
export const COL_WRONG = 8;
const COL_CURSOR = 9;
/** The ring on the squares a hint step decides. */
export const COL_HINT = 10;
/** The outline on the numbers it reasons from. */
export const COL_HINT_EVIDENCE = 11;
const COL_FLASH = 12;
const COL_FLASH_LEAD = 13;

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  out[COL_CELL] = cellSurface(defaultBackground);
  out[COL_GIVEN] = givenSurface(defaultBackground);
  out[COL_SHADED] = SHADED;
  out[COL_RULED_OUT] = RULED_OUT;
  out[COL_TEXT] = INK;
  out[COL_ERROR] = ERROR;
  out[COL_WRONG] = ERROR_WASH;
  out[COL_CURSOR] = CURSOR;
  out[COL_HINT] = HINT_ACTION;
  out[COL_HINT_EVIDENCE] = HINT_EVIDENCE;
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
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
  started: boolean;
  tileSize: number;
  /** What each square shows on the canvas, as its tile key; -1 before the
   * first frame. */
  cache: Int32Array;
  /** The hint step's marks by square, part of the diff key. */
  hint: OverlaySidecar;
  /** The ring and the outline, drawn after the tiles. */
  marks: HintMarks;
}

export function newDrawState(
  state: SkeletonState,
  tileSize: number,
): SkeletonDrawState {
  const squares = state.w * state.h;
  return {
    started: false,
    tileSize,
    cache: new Int32Array(squares).fill(-1),
    hint: new OverlaySidecar(squares),
    marks: new HintMarks(),
  };
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

// --- one square -------------------------------------------------------------

interface Tile {
  mark: number;
  clue: number;
  error: boolean;
  wrong: boolean;
  cursor: boolean;
  tone: WinTone;
}

function drawTile(dr: GameDrawing, ts: number, x: number, y: number, t: Tile): void {
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
        ? winSlot(t.tone, COL_FLASH, COL_FLASH_LEAD)
        : t.clue !== NO_CLUE
          ? COL_GIVEN
          : COL_CELL,
  );

  if (t.clue !== NO_CLUE) {
    dr.drawText(
      { x: cx, y: cy },
      glyphFont(Math.floor((ts * 3) / 5)),
      t.error ? COL_ERROR : COL_TEXT,
      String(t.clue),
    );
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
  _prev: SkeletonState | null,
  state: SkeletonState,
  _dir: number,
  ui: SkeletonUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<SkeletonMove>,
  mistakes?: readonly SkeletonMistake[],
): void {
  const ts = ds.tileSize;
  const { w, h, clues, grid } = state;
  const b = border(ts);

  if (!ds.started) {
    // The frame: every square draws its top and left line, so this is the
    // bottom and right of the last row and column.
    dr.drawRect({ x: b, y: b, w: w * ts + 1, h: h * ts + 1 }, COL_GRID);
    ds.started = true;
  }

  const board = new SkeletonBoard(w, h, clues, grid);
  const wrong = new Set(mistakes?.map((m) => m.y * w + m.x));

  // The displayed step's marks, read from its words and from nowhere else:
  // the kinds read here are the kinds a sentence may name.
  const named = stepMarks(hint);
  const targets: readonly MarkCell[] = named.of("ring", CELL);
  const evidence: readonly MarkCell[] = named.of("outline", CELL);
  ds.hint.clear();
  for (const c of targets) ds.hint.add(c.y * w + c.x, HINT_TARGET);
  for (const c of evidence) ds.hint.add(c.y * w + c.x, HINT_AREA);
  const markStyle = {
    band: (x: number, y: number) => markBand(ts, x, y),
    targetColor: COL_HINT,
    evidenceColor: COL_HINT_EVIDENCE,
    // Two numbers side by side are two premises, each outlined by itself.
    joinEvidence: () => false,
  };
  ds.marks.eraseBeforeTiles(dr, targets, evidence, markStyle, COL_GRID, (x, y) => {
    if (x >= 0 && x < w && y >= 0 && y < h) ds.cache[y * w + x] = -1;
  });

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const clue = clues[i];
      const need = clue === NO_CLUE ? 0 : board.need(i);
      const tile: Tile = {
        mark: grid[i],
        clue,
        // Only a number that can no longer be met, never one still short.
        error: clue !== NO_CLUE && (need < 0 || need > board.open(i).length),
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
      if (ds.cache[i] === key && !ds.hint.stale(i)) continue;
      drawTile(dr, ts, x, y, tile);
      ds.cache[i] = key;
      ds.hint.commit(i);
    }
  }

  // After the tiles and outside any clip, because a mark straddles the grid
  // line between two squares.
  ds.marks.paint(dr, targets, evidence, markStyle);
}
