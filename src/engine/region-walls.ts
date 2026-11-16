/**
 * The heavy walls round the regions a board deals, drawn square by square
 * (Star Battle, Norinori). A square is a grid-colored box under a surface
 * one pixel smaller, so the thin grid lines are what shows between surfaces.
 * Where a side of it faces another region, or the edge of the board, the
 * square paints its half of a heavy wall inside its own box, and the two
 * halves make the region's border. Each square paints only its own box, so a
 * tile cache repaints one square without touching its neighbors.
 */

import type { GameDrawing } from "./game.ts";
import type { Rect } from "./types.ts";

/** Half the width of a region's border, less the grid line it is laid over:
 * what a square paints of it beyond that line. */
export const wallHalf = (ts: number): number => Math.max(1, Math.round(ts / 28));

// The sides of a square that face another region or the edge of the board,
// and the corners where two other squares' walls meet at a square that has
// neither.
const TOP = 1;
const LEFT = 2;
const BOTTOM = 4;
const RIGHT = 8;
const CORNER_SHIFT = 4;

/** The walls of every square of a `w` by `h` board, one byte a square: its
 * side bits and, above them, its top left, top right, bottom left and bottom
 * right corners. A board never changes them, so a draw state keeps them. */
export function regionWalls(
  w: number,
  h: number,
  regions: ArrayLike<number>,
): Uint8Array {
  const at = (x: number, y: number): number =>
    x < 0 || y < 0 || x >= w || y >= h ? -1 : regions[y * w + x];
  return Uint8Array.from({ length: w * h }, (_, i) => {
    const r = regions[i];
    const x = i % w;
    const y = (i - x) / w;
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

/** A square's box, its top left at `(px, py)`, and the surface left of it
 * inside its walls. */
export function walledBoxes(
  ts: number,
  px: number,
  py: number,
  walls: number,
): [Rect, Rect] {
  const g = wallHalf(ts);
  const x0 = px + 1 + (walls & LEFT ? g : 0);
  const y0 = py + 1 + (walls & TOP ? g : 0);
  const x1 = px + ts - (walls & RIGHT ? g : 0);
  const y1 = py + ts - (walls & BOTTOM ? g : 0);
  return [
    { x: px, y: py, w: ts, h: ts },
    { x: x0, y: y0, w: x1 - x0, h: y1 - y0 },
  ];
}

/**
 * Paint a square's box: the grid color, its halves of the walls, the surface
 * `paint` lays inside them, and then the corners, which overlap that surface.
 * The square's own thin lines are its top and left; the board's frame closes
 * the rest. A wall on the top or left covers the line, and one on the bottom
 * or right stops short of the neighbor's.
 */
export function drawWalledSquare(
  dr: GameDrawing,
  ts: number,
  box: Rect,
  walls: number,
  colors: { grid: number; wall: number },
  paint: (surface: Rect) => void,
): void {
  const g = wallHalf(ts);
  const { x: px, y: py } = box;
  const [, surface] = walledBoxes(ts, px, py, walls);
  const far = ts - g;
  dr.drawRect(box, colors.grid);
  if (walls & TOP) dr.drawRect({ x: px, y: py, w: ts, h: 1 + g }, colors.wall);
  if (walls & LEFT) dr.drawRect({ x: px, y: py, w: 1 + g, h: ts }, colors.wall);
  if (walls & BOTTOM) dr.drawRect({ x: px, y: py + far, w: ts, h: g }, colors.wall);
  if (walls & RIGHT) dr.drawRect({ x: px + far, y: py, w: g, h: ts }, colors.wall);
  paint(surface);
  // A corner where the walls of two other squares meet, in the order
  // `regionWalls` numbers them.
  const corners = [
    { x: px, y: py, w: 1 + g, h: 1 + g },
    { x: px + far, y: py, w: g, h: 1 + g },
    { x: px, y: py + far, w: 1 + g, h: g },
    { x: px + far, y: py + far, w: g, h: g },
  ];
  corners.forEach((corner, k) => {
    if (walls & (1 << (CORNER_SHIFT + k))) dr.drawRect(corner, colors.wall);
  });
}
