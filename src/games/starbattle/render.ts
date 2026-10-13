/**
 * Star Battle's rendering: a loop over the squares that repaints only the
 * ones whose packed key changed (docs/rendering.md § "The tile cache and the
 * diff key").
 *
 * A square is a `COL_GRID` box under a surface one pixel smaller, in its
 * region's fill, so the thin grid lines are what shows between surfaces. Where a side of it faces
 * another region, or the edge of the board, the square paints its half of a
 * heavy wall inside its own box, and the two halves make the region's border.
 */

import { REGION_FILLS } from "../../engine/color/colors.ts";
import {
  CURSOR,
  ERROR,
  ERROR_WASH,
  FLASH,
  FLASH_LEAD,
  HINT_ACTION,
  HINT_EVIDENCE,
  INK,
  RULED_OUT,
  SHADED,
  surfaceGrid,
} from "../../engine/color/palette.ts";
import { drawRectCorners } from "../../engine/draw.ts";
import type { GameDrawing, HintStep } from "../../engine/game.ts";
import { hatchPeriod } from "../../engine/hatch.ts";
import {
  HintMarks,
  type MarkBand,
  type MarkCell,
  outlineSides,
} from "../../engine/hint-mark.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { drawRuledOutCross } from "../../engine/piece.ts";
import { regionFills } from "../../engine/region-fill.ts";
import type { Color, Point, Rect, Size } from "../../engine/types.ts";
import { type Flash, sweepStep, type WinTone, winSlot } from "../../engine/win-wave.ts";
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

const COL_BACKGROUND = 0;
const COL_GRID = 1;
/** The border of a region, and of the board. */
const COL_WALL = 2;
export const COL_STAR = 3;
const COL_RULED_OUT = 4;
/** A star that breaks a rule: one touching another, or one of too many in
 * its row, column or region. */
export const COL_ERROR = 5;
/** The surface under a square Check & Save found wrong. */
export const COL_WRONG = 6;
const COL_CURSOR = 7;
/** The ring on the squares a hint step decides, and the stripes on the row,
 * column or region its sentence names. */
export const COL_HINT = 8;
/** The outline on the squares it reasons from. */
export const COL_HINT_EVIDENCE = 9;
const COL_FLASH = 10;
const COL_FLASH_LEAD = 11;
/** The first of the surfaces a region's squares take, one a fill. */
export const COL_REGION = 12;
/** The region palette's first four, the same four Map colors with (the
 * owner, 2026-10-13). */
const FILLS = REGION_FILLS.slice(0, 4);

export function colors(defaultBackground: Color): Color[] {
  const out: Color[] = [];
  out[COL_BACKGROUND] = defaultBackground;
  out[COL_GRID] = surfaceGrid(defaultBackground);
  FILLS.forEach((fill, k) => {
    out[COL_REGION + k] = fill;
  });
  out[COL_WALL] = INK;
  out[COL_STAR] = SHADED;
  out[COL_RULED_OUT] = RULED_OUT;
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

export function computeSize(p: StarbattleParams, ts: number): Size {
  const side = p.size * ts + 2 * border(ts) + 1;
  return { w: side, h: side };
}

/** Half the width of a region's border, less the grid line it is laid over:
 * what a square paints of it beyond that line. */
const wallHalf = (ts: number): number => Math.max(1, Math.round(ts / 28));

// The sides of a square that face another region or the edge of the board,
// and the corners where two other squares' walls meet at a square that has
// neither.
const TOP = 1;
const LEFT = 2;
const BOTTOM = 4;
const RIGHT = 8;
const CORNER_SHIFT = 4;

/** The walls of every square of a board: its side bits and, from bit
 * {@link CORNER_SHIFT} up, its top left, top right, bottom left and bottom
 * right corners. */
function wallsOf(size: number, regions: Int32Array): Uint8Array {
  const at = (x: number, y: number): number =>
    x < 0 || y < 0 || x >= size || y >= size ? -1 : regions[y * size + x];
  return Uint8Array.from(regions, (r, i) => {
    const x = i % size;
    const y = (i - x) / size;
    let sides = 0;
    if (at(x, y - 1) !== r) sides |= TOP;
    if (at(x - 1, y) !== r) sides |= LEFT;
    if (at(x, y + 1) !== r) sides |= BOTTOM;
    if (at(x + 1, y) !== r) sides |= RIGHT;
    let walls = sides;
    [
      [-1, -1, TOP | LEFT],
      [1, -1, TOP | RIGHT],
      [-1, 1, BOTTOM | LEFT],
      [1, 1, BOTTOM | RIGHT],
    ].forEach(([dx, dy, pair], k) => {
      if (!(sides & pair) && at(x + dx, y + dy) !== r) walls |= 1 << (CORNER_SHIFT + k);
    });
    return walls;
  });
}

/** A square's box, and the surface left of it inside its walls. */
function boxes(ts: number, x: number, y: number, walls: number): [Rect, Rect] {
  const b = border(ts);
  const g = wallHalf(ts);
  const px = x * ts + b;
  const py = y * ts + b;
  const x0 = px + 1 + (walls & LEFT ? g : 0);
  const y0 = py + 1 + (walls & TOP ? g : 0);
  const x1 = px + ts - (walls & RIGHT ? g : 0);
  const y1 = py + ts - (walls & BOTTOM ? g : 0);
  return [
    { x: px, y: py, w: ts, h: ts },
    { x: x0, y: y0, w: x1 - x0, h: y1 - y0 },
  ];
}

// --- draw state -------------------------------------------------------------

// The tile key: the mark in bits 0-1, then one bit a cue, two for the win
// flash's tone, and the hint's marks, the outline as its four sides.
const F_ERROR = 1 << 2;
const F_WRONG = 1 << 3;
const F_CURSOR = 1 << 4;
const K_TONE = 5;
const F_STRIPED = 1 << 7;
const F_RINGED = 1 << 8;
const K_OUTLINE = 9;

export interface StarbattleDrawState {
  started: boolean;
  tileSize: number;
  /** Each square's walls, which a board never changes. */
  walls: Uint8Array;
  /** Each square's surface, which is its region's fill. */
  surfaces: Uint8Array;
  /** What each square shows on the canvas, as its tile key; -1 before the
   * first frame. */
  cache: Int32Array;
  /** The ring and the outline, drawn after the tiles. */
  marks: HintMarks;
}

export function newDrawState(
  state: StarbattleState,
  tileSize: number,
): StarbattleDrawState {
  const squares = state.size * state.size;
  const fills = regionFills(state.regions, state.size, FILLS.length);
  return {
    started: false,
    tileSize,
    walls: wallsOf(state.size, state.regions),
    surfaces: Uint8Array.from(state.regions, (r) => COL_REGION + fills[r]),
    cache: new Int32Array(squares).fill(-1),
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
  /** Whether the square is on the row, column or region a hint names. */
  striped: boolean;
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
  const walls = ds.walls[i];
  const [box, surface] = boxes(ts, x, y, walls);
  const { x: px, y: py } = box;

  // The square's own thin lines are its top and left; the frame closes the
  // rest. A wall on the top or left covers the line, and one on the bottom
  // or right stops short of the neighbor's.
  const far = ts - g;
  dr.drawRect(box, COL_GRID);
  if (walls & TOP) dr.drawRect({ x: px, y: py, w: ts, h: 1 + g }, COL_WALL);
  if (walls & LEFT) dr.drawRect({ x: px, y: py, w: 1 + g, h: ts }, COL_WALL);
  if (walls & BOTTOM) dr.drawRect({ x: px, y: py + far, w: ts, h: g }, COL_WALL);
  if (walls & RIGHT) dr.drawRect({ x: px + far, y: py, w: g, h: ts }, COL_WALL);
  dr.drawRect(
    surface,
    t.wrong
      ? COL_WRONG
      : t.tone
        ? winSlot(t.tone, COL_FLASH, COL_FLASH_LEAD)
        : ds.surfaces[i],
  );
  if (t.striped) dr.drawHatch(surface, COL_HINT, hatchPeriod(ts));

  // A corner where the walls of two other squares meet, in the order
  // `wallsOf` numbers them.
  const corners = [
    { x: px, y: py, w: 1 + g, h: 1 + g },
    { x: px + far, y: py, w: g, h: 1 + g },
    { x: px, y: py + far, w: 1 + g, h: g },
    { x: px + far, y: py + far, w: g, h: g },
  ];
  corners.forEach((corner, k) => {
    if (walls & (1 << (CORNER_SHIFT + k))) dr.drawRect(corner, COL_WALL);
  });

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
  _prev: StarbattleState | null,
  state: StarbattleState,
  _dir: number,
  ui: StarbattleUi,
  _animTime: number,
  flash: Flash,
  hint?: HintStep<StarbattleMove>,
  mistakes?: readonly StarbattleMistake[],
): void {
  const ts = ds.tileSize;
  const { size, grid } = state;
  const b = border(ts);

  if (!ds.started) {
    // The frame: every square draws its top and left line, so this is the
    // bottom and right of the last row and column.
    dr.drawRect({ x: b, y: b, w: size * ts + 1, h: size * ts + 1 }, COL_WALL);
    ds.started = true;
  }

  const errors = starsInError(state);
  const wrong = new Set(mistakes?.map((m) => m.y * size + m.x));

  // The displayed step's marks, read from its words and from nowhere else.
  const named = stepMarks(hint);
  const targets: readonly MarkCell[] = named.of("ring", CELL);
  const evidence: readonly MarkCell[] = named.of("outline", CELL);
  const at = (c: Point): number => c.y * size + c.x;
  const ringed = new Set(targets.map(at));
  const outlined = new Set(evidence.map(at));
  const striped = new Set(named.of("stripes", CELL).map(at));
  const isOutlined = (x: number, y: number): boolean =>
    x >= 0 && y >= 0 && x < size && y < size && outlined.has(y * size + x);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const tile: Tile = {
        mark: grid[i],
        error: errors.has(i),
        wrong: wrong.has(i),
        cursor: ui.cursor.visible && ui.cursor.x === x && ui.cursor.y === y,
        tone: flash.win(sweepStep(x, y)),
        striped: striped.has(i),
      };
      // A mark is painted over the square's surface and only the square's
      // own repaint takes it off, so the ring and each side of the outline
      // are in the key with what the square holds.
      const key =
        tile.mark |
        (tile.error ? F_ERROR : 0) |
        (tile.wrong ? F_WRONG : 0) |
        (tile.cursor ? F_CURSOR : 0) |
        (tile.tone << K_TONE) |
        (tile.striped ? F_STRIPED : 0) |
        (ringed.has(i) ? F_RINGED : 0) |
        ((outlined.has(i) ? outlineSides(x, y, isOutlined) : 0) << K_OUTLINE);
      if (ds.cache[i] === key) continue;
      drawTile(dr, ds, i, x, y, tile);
      ds.cache[i] = key;
    }
  }

  // After the tiles: a band sits over the square's own surface, so it is
  // painted once the surface is down, and every frame.
  ds.marks.paint(dr, targets, evidence, {
    band: (x, y) => markBand(ds, size, x, y),
    targetColor: COL_HINT,
    evidenceColor: COL_HINT_EVIDENCE,
  });
}
