/**
 * Star Battle's rendering: a loop over the squares that repaints only the
 * ones whose packed key changed (docs/rendering.md § "The tile cache and the
 * diff key").
 *
 * A square is drawn inside its region's walls (`engine/render/region-walls.ts`), on
 * its region's fill.
 */

import { REGION_FILLS } from "../../engine/color/colors.ts";
import {
  ERROR_WASH,
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
import type { Color, Point, Rect, Size } from "../../engine/contract/types.ts";
import { regionFills } from "../../engine/generate/region-fill.ts";
import { drawRectCorners } from "../../engine/render/draw.ts";
import {
  HintMarks,
  type MarkBand,
  type MarkCell,
} from "../../engine/render/hint-mark.ts";
import { OverlaySidecar } from "../../engine/render/overlay-sidecar.ts";
import { drawRuledOutCross } from "../../engine/render/piece.ts";
import {
  drawWalledSquare,
  regionWalls,
  walledBoxes,
  wallHalf,
} from "../../engine/render/region-walls.ts";
import { NOTHING_TO_CLEAR } from "../../engine/render/ring.ts";
import { TileCache } from "../../engine/render/tile-cache.ts";
import { sweepStep, type WinTone, winSlot } from "../../engine/render/win-wave.ts";
import type { StarbattleMistake } from "./index.ts";
import { StarbattleBoard, touchingStars } from "./solver.ts";
import {
  CROSSED,
  STAR,
  type StarbattleMove,
  type StarbattleParams,
  type StarbattleState,
  type StarbattleUi,
} from "./state.ts";

export const PREFERRED_TILE_SIZE = 40;

// --- palette ----------------------------------------------------------------

// A star that breaks a rule (one touching another, or one of too many in its
// row, column or region) is `COL_ERROR`.
const COL_GRID = FIRST_GAME_SLOT;
/** The border of a region, and of the board. */
const COL_WALL = FIRST_GAME_SLOT + 1;
export const COL_STAR = FIRST_GAME_SLOT + 2;
const COL_RULED_OUT = FIRST_GAME_SLOT + 3;
/** The surface under a square Check & Save found wrong. */
export const COL_WRONG = FIRST_GAME_SLOT + 4;
/** The first of the surfaces a region's squares take, one a fill. */
export const COL_REGION = FIRST_GAME_SLOT + 5;
/** The region palette's first four, the same four Map colors with (the
 * owner, 2026-10-13). */
const FILLS = REGION_FILLS.slice(0, 4);

export function colors(bg: Color): Color[] {
  const out = rolePalette(bg);
  out[COL_GRID] = surfaceGrid(bg);
  out[COL_WALL] = INK;
  out[COL_STAR] = SHADED;
  out[COL_RULED_OUT] = RULED_OUT;
  out[COL_WRONG] = ERROR_WASH;
  FILLS.forEach((fill, k) => {
    out[COL_REGION + k] = fill;
  });
  return out;
}

// --- geometry ---------------------------------------------------------------

export const border = (ts: number): number => Math.floor(ts / 4);

export function computeSize(p: StarbattleParams, ts: number): Size {
  const side = p.size * ts + 2 * border(ts) + 1;
  return { w: side, h: side };
}

/** A square's box, and the surface left of it inside its walls. */
function boxes(ts: number, x: number, y: number, walls: number): [Rect, Rect] {
  const b = border(ts);
  return walledBoxes(ts, x * ts + b, y * ts + b, walls);
}

// --- draw state -------------------------------------------------------------

// The tile key: the mark in bits 0-1, then one bit a cue and two for the win
// flash's tone. The hint's marks are the sidecar's.
const F_ERROR = 1 << 2;
const F_WRONG = 1 << 3;
const F_CURSOR = 1 << 4;
const K_TONE = 5;

export interface StarbattleDrawState {
  tileSize: number;
  /** Each square's walls, which a board never changes. */
  walls: Uint8Array;
  /** Each square's surface, which is its region's fill. */
  surfaces: Uint8Array;
  /** What each square shows on the canvas, as its tile key, and the hint's
   * marks on it. */
  tiles: TileCache;
  /** The hint step's marks by square: a mark is painted over the square's
   * surface and only the square's own repaint takes it off. */
  hint: OverlaySidecar;
  /** The ring and the outline, drawn after the tiles. */
  marks: HintMarks;
}

export function newDrawState(
  state: StarbattleState,
  tileSize: number,
): StarbattleDrawState {
  const squares = state.size * state.size;
  const fills = regionFills(state.regions, state.size, FILLS.length);
  const hint = new OverlaySidecar(squares);
  return {
    tileSize,
    walls: regionWalls(state.size, state.size, state.regions),
    surfaces: Uint8Array.from(state.regions, (r) => COL_REGION + fills[r]),
    tiles: new TileCache(squares, { overlays: [hint] }),
    hint,
    marks: new HintMarks(),
  };
}

/**
 * Where a hint mark sits around a square: inside the surface the square
 * paints, over its edge. Not on the line between squares, which is where a
 * region's border runs, and a colored band there would read as one. The star
 * reaches to a third of the tile from its middle and the band is a twelfth
 * of the tile wide from the surface's edge, so they do not meet.
 */
function markBand(
  ds: StarbattleDrawState,
  size: number,
  x: number,
  y: number,
): MarkBand {
  const ts = ds.tileSize;
  const [, surface] = boxes(ts, x, y, ds.walls[y * size + x]);
  return { box: surface, outer: 0, inner: Math.max(2, Math.round(ts / 12)) };
}

// --- one square -------------------------------------------------------------

/** A five-pointed star about `c`, its points `r` from the middle. */
function starPoints(c: Point, r: number): Point[] {
  const inner = r * 0.42;
  return Array.from({ length: 10 }, (_, k) => {
    const angle = (k * Math.PI) / 5 - Math.PI / 2;
    const reach = k % 2 === 0 ? r : inner;
    return { x: c.x + reach * Math.cos(angle), y: c.y + reach * Math.sin(angle) };
  });
}

interface Tile {
  mark: number;
  error: boolean;
  wrong: boolean;
  cursor: boolean;
  tone: WinTone;
}

function drawTile(
  dr: GameDrawing,
  ds: StarbattleDrawState,
  i: number,
  x: number,
  y: number,
  t: Tile,
): void {
  const ts = ds.tileSize;
  const g = wallHalf(ts);
  const [box] = boxes(ts, x, y, ds.walls[i]);
  const { x: px, y: py } = box;
  drawWalledSquare(
    dr,
    ts,
    box,
    ds.walls[i],
    { grid: COL_GRID, wall: COL_WALL },
    (surface) => {
      dr.drawRect(
        surface,
        t.wrong ? COL_WRONG : t.tone ? winSlot(t.tone) : ds.surfaces[i],
      );
      ds.hint.drawHatch(dr, i, surface, ts);
    },
  );

  const middle = { x: px + (ts + 1) / 2, y: py + (ts + 1) / 2 };
  if (t.mark === STAR) {
    const color = t.error ? COL_ERROR : COL_STAR;
    dr.drawPolygon(starPoints(middle, ts / 3), color, color);
  } else if (t.mark === CROSSED) {
    drawRuledOutCross(
      dr,
      { x: px + 1, y: py + 1, w: ts - 1, h: ts - 1 },
      COL_RULED_OUT,
    );
  }

  if (t.cursor)
    drawRectCorners(
      dr,
      Math.floor(middle.x),
      Math.floor(middle.y),
      Math.floor(ts / 2) - g - 3,
      COL_CURSOR,
      Math.max(2, ts >> 4),
    );

  dr.drawUpdate(box);
}

// --- redraw -----------------------------------------------------------------

/** The stars that break a rule as the board stands: each of two that touch,
 * and every star of a row, column or region that holds too many. */
function starsInError(state: StarbattleState): Set<number> {
  const { size, stars, regions, grid } = state;
  const board = new StarbattleBoard(size, stars, regions, grid);
  const out = new Set<number>(touchingStars(size, grid).flat());
  board.units.forEach((unit, u) => {
    if (board.need(u) < 0) for (const i of unit.cells) if (grid[i] === STAR) out.add(i);
  });
  return out;
}

export function redraw(
  dr: GameDrawing,
  ds: StarbattleDrawState,
  frame: Frame<
    StarbattleState,
    StarbattleUi,
    StarbattleMove,
    unknown,
    StarbattleMistake
  >,
): void {
  const { state, ui, flash, hint, mistakes } = frame;
  const ts = ds.tileSize;
  const { size, grid } = state;
  const b = border(ts);

  if (ds.tiles.firstFrame()) {
    // The frame: every square draws its top and left line, so this is the
    // bottom and right of the last row and column.
    dr.drawRect({ x: b, y: b, w: size * ts + 1, h: size * ts + 1 }, COL_WALL);
  }

  const errors = starsInError(state);
  const wrong = new Set(mistakes?.map((m) => m.y * size + m.x));

  // The displayed step's marks, read from its words and from nowhere else.
  const named = stepMarks(hint);
  const targets: readonly MarkCell[] = named.of("ring", CELL);
  const evidence: readonly MarkCell[] = named.of("outline", CELL);
  ds.hint.pack(named, (x, y) => y * size + x);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
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
      if (ds.tiles.changed(i, key)) drawTile(dr, ds, i, x, y, tile);
    }
  }

  // After the tiles: a band sits over the square's own surface, so it is
  // painted once the surface is down, and every frame.
  ds.marks.paint(dr, targets, evidence, {
    band: (x, y) => markBand(ds, size, x, y),
    // A square shows no text: a star and a cross are shapes.
    text: () => NOTHING_TO_CLEAR,
    evidenceColor: COL_HINT_OUTLINE,
  });
}
