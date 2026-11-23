/**
 * A value drawn raised (`play.numbers.raised`): a block as tall as the
 * value, its top face up and to the right of its cell by a share of the
 * tile that grows with the value, over a left and a bottom face (upstream
 * towers.c's 3D towers). The top reaches into the tiles up, right and
 * up-right of its own, so a tile repaints with the raised values of the
 * three it receives from, and a press on a top is the cell's it stands on.
 */

import type { GameDrawing } from "../contract/game.ts";
import type { Point, Rect } from "../contract/types.ts";

/** How far value `v`'s top stands right (`dx`) and up (`dy`) of its cell,
 * on a board whose largest value is `top`. */
function riseOf(v: number, top: number, ts: number): { dx: number; dy: number } {
  return { dx: Math.floor((v * ts) / (8 * top)), dy: Math.floor((v * ts) / (4 * top)) };
}

/** The top face of a raised value whose cell is `tile`. */
export function topFace(tile: Rect, v: number, top: number): Rect {
  const { dx, dy } = riseOf(v, top, tile.w);
  return { x: tile.x + dx, y: tile.y - dy, w: tile.w, h: tile.h };
}

/** The part of `tile` no raised value next door reaches into: notes kept
 * there stay clear of the tallest. */
export function clearOfRises(tile: Rect, top: number): Rect {
  const { dx, dy } = riseOf(top, top, tile.w);
  return { x: tile.x + dx, y: tile.y, w: tile.w - dx, h: tile.h - dy };
}

/** The cells whose raised values reach into cell `(x, y)`'s tile, in the
 * order they are painted over it: left, below, below-left. */
export const RECEIVED_FROM: readonly (readonly [number, number])[] = [
  [-1, 0],
  [0, 1],
  [-1, 1],
];

/** The left and bottom faces of a raised value on `tile`, filled `fill` and
 * edged `edge`, which its top face is drawn over. */
export function drawSides(
  dr: GameDrawing,
  tile: Rect,
  face: Rect,
  fill: number,
  edge: number,
): void {
  const { x: bx, y: by, w: ts } = tile;
  const dx = face.x - bx;
  const dy = by - face.y;
  dr.drawPolygon(
    [
      { x: bx, y: by - 1 },
      { x: bx, y: by + ts - 1 },
      { x: bx + dx, y: by + ts - 1 - dy },
      { x: bx + dx, y: by - 1 - dy },
    ],
    fill,
    edge,
  );
  dr.drawPolygon(
    [
      { x: bx + ts, y: by + ts - 1 },
      { x: bx, y: by + ts - 1 },
      { x: bx + dx, y: by + ts - 1 - dy },
      { x: bx + ts + dx, y: by + ts - 1 - dy },
    ],
    fill,
    edge,
  );
}

/**
 * The cell whose raised value a press at `p` lands on, `p` being in the tile
 * of cell `at` (which may be off the board): its own, or one it receives
 * from, the nearest the viewer winning as it is painted last; `null` where
 * it lands on none. `raisedAt` is a cell's raised value, 0 where it has
 * none or is off the board.
 */
export function pressedRaised(
  p: Point,
  at: Point,
  tileOf: (x: number, y: number) => Rect,
  raisedAt: (x: number, y: number) => number,
  top: number,
): Point | null {
  let got: Point | null = null;
  for (const [dx, dy] of [[0, 0], ...RECEIVED_FROM]) {
    const c = { x: at.x + dx, y: at.y + dy };
    const v = raisedAt(c.x, c.y);
    if (v === 0) continue;
    const tile = tileOf(c.x, c.y);
    if (onRaised(p, tile, topFace(tile, v, top))) got = c;
  }
  return got;
}

/**
 * Whether `p` lies on the raised value of the cell whose tile is `tile` and
 * top face `face`: on the top, or in the triangles of its sides between the
 * top's corners and the tile's (upstream towers.c's `interpret_move`).
 */
function onRaised(p: Point, tile: Rect, face: Rect): boolean {
  const { x: bx, y: by, w: ts } = tile;
  const { x: ox, y: oy } = face;
  return (
    (p.x - ox >= 0 && p.x - ox < ts && p.y - oy >= 0 && p.y - oy < ts) ||
    (ox > bx &&
      p.x >= bx &&
      p.x <= ox &&
      p.y <= by &&
      (by - p.y) * (ox - bx) <= (by - oy) * (p.x - bx)) ||
    (ox > bx &&
      p.x >= bx + ts &&
      p.x <= ox + ts &&
      p.y >= oy + ts &&
      (by - p.y + ts) * (ox - bx) >= (by - oy) * (p.x - bx - ts))
  );
}
