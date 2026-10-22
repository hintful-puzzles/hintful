/**
 * The edges between the squares of a square grid: what a direction is, the
 * one numbering of a board's edges, and the pixel side of aiming at one.
 *
 * A direction `d` is `RIGHT`, `UP`, `LEFT` or `DOWN`, 0 to 3, so the opposite
 * of `d` is `d ^ 2` and a turn is one step. A set of directions is a mask
 * with bit `1 << d` for each, and `1 << d` is upstream's `R`/`U`/`L`/`D` bit,
 * the one Net's wires, Pearl's lines and Tracks' rails are stored and saved
 * in. That is why the order is this one: a game's stored mask and the
 * direction this module hands it meet without a table.
 *
 * Edge `e` of a `w × h` board joins squares `a[e] < b[e]`: the edges between
 * horizontal neighbors first, in reading order of their left square, then
 * those between vertical neighbors, in reading order of their upper square.
 * A game that stores a mark per edge stores it once, by that number, and
 * never on both squares.
 */

import { fromCoord } from "./geometry.ts";
import type { Point } from "./types.ts";

// --- directions -------------------------------------------------------------

export const RIGHT = 0;
export const UP = 1;
export const LEFT = 2;
export const DOWN = 3;

/** A direction's step across the board, by direction; y grows downward. */
export const DX: readonly number[] = [1, 0, -1, 0];
export const DY: readonly number[] = [0, -1, 0, 1];

/** The direction `d` faces from the square across its edge. */
export const reverse = (d: number): number => d ^ 2;

/** The direction of a step one square along an axis, such as an arrow key's
 * `cursorDelta`. */
export function directionOf(dx: number, dy: number): number {
  return dx > 0 ? RIGHT : dx < 0 ? LEFT : dy < 0 ? UP : DOWN;
}

// --- direction masks (upstream's R/U/L/D bits) ------------------------------

export const R = 1 << RIGHT;
export const U = 1 << UP;
export const L = 1 << LEFT;
export const D = 1 << DOWN;

/** The four direction bits in upstream's iteration order (`d = 1; d < 0x10;
 * d <<= 1`). A port of an upstream loop depends on this order. */
export const DIRECTIONS: readonly number[] = [R, U, L, D];

/** A mask turned a quarter anticlockwise (upstream `A`). */
export function anticlockwise(x: number): number {
  return ((x & 0x07) << 1) | ((x & 0x08) >> 3);
}

/** A mask turned a quarter clockwise (upstream `C`). */
export function clockwise(x: number): number {
  return ((x & 0x0e) >> 1) | ((x & 0x01) << 3);
}

/** A mask turned half round (upstream `F`). */
export function opposite(x: number): number {
  return ((x & 0x0c) >> 2) | ((x & 0x03) << 2);
}

/** A mask turned `n` quarters, upstream's `ROT(x, n)`: 0 leaves it, 1 is
 * anticlockwise, 2 half round, 3 clockwise. */
export function rot(x: number, n: number): number {
  switch (n & 3) {
    case 0:
      return x;
    case 1:
      return anticlockwise(x);
    case 2:
      return opposite(x);
    default:
      return clockwise(x);
  }
}

/** The x step of a single direction bit (upstream `X`). */
export function dirX(bit: number): number {
  return bit === R ? 1 : bit === L ? -1 : 0;
}

/** The y step of a single direction bit (upstream `Y`). */
export function dirY(bit: number): number {
  return bit === D ? 1 : bit === U ? -1 : 0;
}

/** How many directions a mask holds (upstream `COUNT`, `NBITS`). */
export function dirCount(mask: number): number {
  return (mask & 1) + ((mask >> 1) & 1) + ((mask >> 2) & 1) + ((mask >> 3) & 1);
}

// --- the edges of a board ---------------------------------------------------

/**
 * The edges of a `w × h` board, numbered as the module's header says.
 * `around[i * 4 + d]` is the edge on side `d` of square `i`, or `-1` past the
 * board's rim.
 */
export interface SquareEdges {
  readonly w: number;
  readonly h: number;
  readonly cells: number;
  readonly edgeCount: number;
  readonly a: Int32Array;
  readonly b: Int32Array;
  readonly around: Int32Array;
}

const boards = new Map<string, SquareEdges>();

export function squareEdges(w: number, h: number): SquareEdges {
  const key = `${w}x${h}`;
  const known = boards.get(key);
  if (known) return known;
  const cells = w * h;
  const horizontal = (w - 1) * h;
  const edgeCount = horizontal + w * (h - 1);
  const a = new Int32Array(edgeCount);
  const b = new Int32Array(edgeCount);
  const around = new Int32Array(cells * 4).fill(-1);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w - 1; x++) {
      const e = y * (w - 1) + x;
      const i = y * w + x;
      a[e] = i;
      b[e] = i + 1;
      around[i * 4 + RIGHT] = e;
      around[(i + 1) * 4 + LEFT] = e;
    }
  for (let i = 0; i < w * (h - 1); i++) {
    const e = horizontal + i;
    a[e] = i;
    b[e] = i + w;
    around[i * 4 + DOWN] = e;
    around[(i + w) * 4 + UP] = e;
  }
  const made = { w, h, cells, edgeCount, a, b, around };
  boards.set(key, made);
  return made;
}

/** Whether edge `e` joins two squares side by side, rather than one above
 * the other. */
export function isHorizontal(g: SquareEdges, e: number): boolean {
  return e < (g.w - 1) * g.h;
}

/** The square across edge `e` from square `i`. */
export function across(g: SquareEdges, e: number, i: number): number {
  return g.a[e] === i ? g.b[e] : g.a[e];
}

/** The edge between squares `i` and `j`, or `-1` where they do not share a
 * side. */
export function edgeBetween(g: SquareEdges, i: number, j: number): number {
  for (let d = 0; d < 4; d++) {
    const e = g.around[i * 4 + d];
    if (e >= 0 && across(g, e, i) === j) return e;
  }
  return -1;
}

/** The side of square `i` that edge `e` lies on: `RIGHT` or `DOWN` from its
 * first square, `LEFT` or `UP` from its second. */
export function sideOf(g: SquareEdges, e: number, i: number): number {
  const d = isHorizontal(g, e) ? RIGHT : DOWN;
  return g.a[e] === i ? d : reverse(d);
}

// --- aiming at an edge ------------------------------------------------------

/** How a board is laid out in pixels: square `(x, y)` covers `tile` pixels
 * each way from `(x · tile + border, y · tile + border)`. */
export interface EdgeLayout {
  readonly tile: number;
  readonly border: number;
}

/** One side of one square. */
export interface Side {
  readonly cell: number;
  readonly dir: number;
}

/** The middle of square `i`. */
export function squareCenter(g: SquareEdges, m: EdgeLayout, i: number): Point {
  const half = Math.floor(m.tile / 2);
  return {
    x: (i % g.w) * m.tile + m.border + half,
    y: Math.floor(i / g.w) * m.tile + m.border + half,
  };
}

/**
 * The side of its square a press at `p` is nearest, or `null` off the board,
 * on its rim, or within `still` of a tile from the square's middle, where a
 * press aims at the square rather than a side. On the diagonal the vertical
 * side wins.
 */
export function sideAt(
  g: SquareEdges,
  m: EdgeLayout,
  p: Point,
  still = 1 / 4,
): Side | null {
  const x = fromCoord(p.x, m.tile, m.border);
  const y = fromCoord(p.y, m.tile, m.border);
  if (x < 0 || x >= g.w || y < 0 || y >= g.h) return null;
  const cell = y * g.w + x;
  const c = squareCenter(g, m, cell);
  const [dx, dy] = [p.x - c.x, p.y - c.y];
  if (Math.max(Math.abs(dx), Math.abs(dy)) < m.tile * still) return null;
  const dir =
    Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? LEFT : RIGHT) : dy < 0 ? UP : DOWN;
  return g.around[cell * 4 + dir] >= 0 ? { cell, dir } : null;
}

/** The edge a press at `p` is aimed at, as {@link sideAt} finds it. */
export function edgeAt(
  g: SquareEdges,
  m: EdgeLayout,
  p: Point,
  still = 1 / 4,
): number | null {
  const side = sideAt(g, m, p, still);
  return side ? g.around[side.cell * 4 + side.dir] : null;
}

/** A point a press aims at side `dir` of square `cell` from: inside the
 * square, well toward the side, so that {@link sideAt} reads it back. */
export function pointAtSide(g: SquareEdges, m: EdgeLayout, { cell, dir }: Side): Point {
  const c = squareCenter(g, m, cell);
  const reach = Math.floor((3 * m.tile) / 8);
  return { x: c.x + DX[dir] * reach, y: c.y + DY[dir] * reach };
}

/** A point that aims at edge `e`, from inside its first square. */
export function pointAtEdge(g: SquareEdges, m: EdgeLayout, e: number): Point {
  const cell = g.a[e];
  return pointAtSide(g, m, { cell, dir: sideOf(g, e, cell) });
}

/** The middle of side `dir` of square `cell`. */
export function sideMiddle(g: SquareEdges, m: EdgeLayout, { cell, dir }: Side): Point {
  const c = squareCenter(g, m, cell);
  return { x: c.x + (DX[dir] * m.tile) / 2, y: c.y + (DY[dir] * m.tile) / 2 };
}

/** The middle of edge `e`. */
export function edgeMiddle(g: SquareEdges, m: EdgeLayout, e: number): Point {
  const cell = g.a[e];
  return sideMiddle(g, m, { cell, dir: sideOf(g, e, cell) });
}
