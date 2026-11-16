/**
 * Norinori's rendering: a loop over the squares that repaints only the ones
 * whose packed key changed (docs/rendering.md § "The tile cache and the diff
 * key").
 *
 * A square is drawn inside its region's walls (`engine/region-walls.ts`), on
 * its region's fill; a shaded one holds the shaded piece and a clear one the
 * cross.
 */

import { REGION_FILLS } from "../../engine/color/colors.ts";
import {
  CURSOR,
  ERROR,
  ERROR_WASH,
  FLASH,
  FLASH_LEAD,
  HINT_OUTLINE,
  INK,
  RULED_OUT,
  SHADED as SHADED_COLOR,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawRectCorners } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { HintMarks, type MarkBand, type MarkCell } from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { OverlaySidecar } from "../../engine/overlay-sidecar.ts";
import { drawPiece, drawRuledOutCross, SHADED_SHAPE } from "../../engine/piece.ts";
import { regionFills } from "../../engine/region-fill.ts";
import {
  drawWalledSquare,
  regionWalls,
  walledBoxes,
  wallHalf,
} from "../../engine/region-walls.ts";
import { NOTHING_TO_CLEAR } from "../../engine/ring.ts";
import type { Color, Rect, Size } from "../../engine/types.ts";
import { type Flash, sweepStep, type WinTone, winSlot } from "../../engine/win-wave.ts";
import type { NorinoriMistake } from "./index.ts";
import {
  CROSSED,
  type NorinoriMove,
  type NorinoriParams,
  type NorinoriState,
  type NorinoriUi,
  neighbors,
  SHADED,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 40;

// --- palette ----------------------------------------------------------------

const COL_BACKGROUND = 0;
const COL_GRID = 1;
/** The border of a region, and of the board. */
const COL_WALL = 2;
export const COL_SHADED = 3;
const COL_RULED_OUT = 4;
/** A shaded square that breaks a rule: one beside two others, or one of too
 * many in its region. */
export const COL_ERROR = 5;
/** The surface under a square Check & Save found wrong. */
export const COL_WRONG = 6;
const COL_CURSOR = 7;
/** The outline on the squares a hint step reasons from. The ring on the
 * squares it decides is the engine's (`GameDrawing.drawRing`). */
export const COL_HINT_EVIDENCE = 8;
const COL_FLASH = 9;
const COL_FLASH_LEAD = 10;
/** The first of the surfaces a region's squares take, one a fill. */
const COL_REGION = 11;
/** The region palette's first four, as Star Battle's. */
const FILLS = REGION_FILLS.slice(0, 4);

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  FILLS.forEach((fill, k) => {
    out[COL_REGION + k] = fill;
  });
  out[COL_WALL] = INK;
  out[COL_SHADED] = SHADED_COLOR;
  out[COL_RULED_OUT] = RULED_OUT;
  out[COL_ERROR] = ERROR;
  out[COL_WRONG] = ERROR_WASH;
  out[COL_CURSOR] = CURSOR;
  out[COL_HINT_EVIDENCE] = HINT_OUTLINE;
  out[COL_FLASH] = FLASH;
  out[COL_FLASH_LEAD] = FLASH_LEAD;
  return out;
}

// --- geometry ---------------------------------------------------------------

export const border = (ts: number): number => Math.floor(ts / 4);

export function computeSize(p: NorinoriParams, ts: number): Size {
  return { w: p.w * ts + 2 * border(ts) + 1, h: p.h * ts + 2 * border(ts) + 1 };
}

/** Square `(x, y)`'s box. */
function boxAt(ts: number, x: number, y: number): Rect {
  const b = border(ts);
  return { x: x * ts + b, y: y * ts + b, w: ts, h: ts };
}

// --- draw state -------------------------------------------------------------

// The tile key: the mark in bits 0-1, then one bit a cue and two for the win
// flash's tone. The hint's marks are the sidecar's.
const F_ERROR = 1 << 2;
const F_WRONG = 1 << 3;
const F_CURSOR = 1 << 4;
const K_TONE = 5;

export interface NorinoriDrawState {
  started: boolean;
  tileSize: number;
  /** Each square's walls, which a board never changes. */
  walls: Uint8Array;
  /** Each square's surface, which is its region's fill. */
  surfaces: Uint8Array;
  /** What each square shows on the canvas, as its tile key; -1 before the
   * first frame. */
  cache: Int32Array;
  /** The hint step's marks by square, part of the diff key: a mark is
   * painted over the square's surface and only the square's own repaint
   * takes it off. */
  hint: OverlaySidecar;
  /** The ring and the outline, drawn after the tiles. */
  marks: HintMarks;
}

export function newDrawState(
  state: NorinoriState,
  tileSize: number,
): NorinoriDrawState {
  const squares = state.w * state.h;
  const fills = regionFills(state.regions, state.w, FILLS.length);
  return {
    started: false,
    tileSize,
    walls: regionWalls(state.w, state.h, state.regions),
    surfaces: Uint8Array.from(state.regions, (r) => COL_REGION + fills[r]),
    cache: new Int32Array(squares).fill(-1),
    hint: new OverlaySidecar(squares),
    marks: new HintMarks(),
  };
}

/**
 * Where a hint mark sits around a square: inside the surface the square
 * paints, over its edge. Not on the line between squares, which is where a
 * region's border runs, and a colored band there would read as one.
 */
function markBand(ds: NorinoriDrawState, w: number, x: number, y: number): MarkBand {
  const ts = ds.tileSize;
  const { x: px, y: py } = boxAt(ts, x, y);
  const [, surface] = walledBoxes(ts, px, py, ds.walls[y * w + x]);
  return { box: surface, outer: 0, inner: Math.max(2, Math.round(ts / 12)) };
}

// --- one square -------------------------------------------------------------

interface Tile {
  mark: number;
  error: boolean;
  wrong: boolean;
  cursor: boolean;
  tone: WinTone;
}

function drawTile(
  dr: GameDrawing,
  ds: NorinoriDrawState,
  i: number,
  x: number,
  y: number,
  t: Tile,
): void {
  const ts = ds.tileSize;
  const box = boxAt(ts, x, y);
  const [, inside] = walledBoxes(ts, box.x, box.y, ds.walls[i]);
  drawWalledSquare(
    dr,
    ts,
    box,
    ds.walls[i],
    { grid: COL_GRID, wall: COL_WALL },
    (surface) => {
      dr.drawRect(
        surface,
        t.wrong
          ? COL_WRONG
          : t.tone
            ? winSlot(t.tone, COL_FLASH, COL_FLASH_LEAD)
            : ds.surfaces[i],
      );
      ds.hint.drawHatch(dr, i, surface, ts);
    },
  );

  if (t.mark === SHADED)
    drawPiece(dr, inside, SHADED_SHAPE, t.error ? COL_ERROR : COL_SHADED);
  else if (t.mark === CROSSED)
    drawRuledOutCross(
      dr,
      { x: box.x + 1, y: box.y + 1, w: ts - 1, h: ts - 1 },
      COL_RULED_OUT,
    );

  // Inset by the wall's half, as Star Battle's: a stroke on the box's edge
  // would paint into the next square, which does not redraw when the cursor
  // leaves.
  if (t.cursor)
    drawRectCorners(
      dr,
      box.x + Math.floor(ts / 2),
      box.y + Math.floor(ts / 2),
      Math.floor(ts / 2) - wallHalf(ts) - 3,
      COL_CURSOR,
      Math.max(2, ts >> 4),
    );

  dr.drawUpdate(box);
}

// --- redraw -----------------------------------------------------------------

/** The shaded squares that break a rule as the board stands: each beside two
 * others or more, and every one of a region that holds more than two. */
function shadedInError(state: NorinoriState): Set<number> {
  const { w, h, regions, grid } = state;
  const out = new Set<number>();
  const held = new Map<number, number>();
  grid.forEach((m, i) => {
    if (m !== SHADED) return;
    held.set(regions[i], (held.get(regions[i]) ?? 0) + 1);
    if (neighbors(w, h, i).filter((j) => grid[j] === SHADED).length > 1) out.add(i);
  });
  grid.forEach((m, i) => {
    if (m === SHADED && (held.get(regions[i]) ?? 0) > 2) out.add(i);
  });
  return out;
}

export function redraw(
  dr: GameDrawing,
  ds: NorinoriDrawState,
  _prev: NorinoriState | null,
  state: NorinoriState,
  _dir: number,
  ui: NorinoriUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<NorinoriMove>,
  mistakes?: readonly NorinoriMistake[],
): void {
  const ts = ds.tileSize;
  const { w, h, grid } = state;
  const b = border(ts);

  if (!ds.started) {
    // The frame: every square draws its top and left line, so this is the
    // bottom and right of the last row and column.
    dr.drawRect({ x: b, y: b, w: w * ts + 1, h: h * ts + 1 }, COL_WALL);
    ds.started = true;
  }

  const errors = shadedInError(state);
  const wrong = new Set(mistakes?.map((m) => m.y * w + m.x));

  // The displayed step's marks, read from its words and from nowhere else.
  const named = stepMarks(hint);
  const targets: readonly MarkCell[] = named.of("ring", CELL);
  const evidence: readonly MarkCell[] = named.of("outline", CELL);
  ds.hint.pack(named, (x, y) => y * w + x);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const tile: Tile = {
        mark: grid[i],
        error: errors.has(i),
        wrong: wrong.has(i),
        cursor: ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y,
        tone: flash.win(sweepStep(x, y)),
      };
      const key =
        tile.mark |
        (tile.error ? F_ERROR : 0) |
        (tile.wrong ? F_WRONG : 0) |
        (tile.cursor ? F_CURSOR : 0) |
        (tile.tone << K_TONE);
      if (ds.cache[i] === key && !ds.hint.stale(i)) continue;
      drawTile(dr, ds, i, x, y, tile);
      ds.cache[i] = key;
      ds.hint.commit(i);
    }
  }

  // After the tiles: a band sits over the square's own surface, so it is
  // painted once the surface is down, and every frame.
  ds.marks.paint(dr, targets, evidence, {
    band: (x, y) => markBand(ds, w, x, y),
    // A square shows no text: a shaded piece and a cross are shapes.
    text: () => NOTHING_TO_CLEAR,
    evidenceColor: COL_HINT_EVIDENCE,
  });
}
