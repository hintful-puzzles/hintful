/**
 * The arrows that say which way a path runs: one shape for every game that
 * shows a direction from one square to another, so a player reads it alike
 * everywhere (owner, 2026-11-19, after finding Ascent's path direction
 * unclear).
 *
 * - {@link drawArrowHead}: the filled head, the one shape. A hint's move
 *   arrow (`draw.ts`'s `drawMoveArrow`) wears it too.
 * - {@link drawPathHead}: the head on a path's link between two squares'
 *   middles, pointing the way the path runs. It sits across the two squares'
 *   shared side, so a game that draws each square's half of a line under its
 *   clip draws the whole head from both squares, each keeping its half; it
 *   goes over the grid line there, which would cut it in two. On a line
 *   that runs through the squares (Wordtrail's) it is drawn on the line;
 *   between two discs that leave little of a line to see (Ascent's numbers)
 *   it is drawn alone.
 * - {@link drawPathStart}: the ring round a path's first square, which a
 *   line's arrow alone does not tell from its last.
 *
 * All are sized by the tile, so they read alike at every board size.
 */

import type { GameDrawing } from "./game.ts";
import type { Point } from "./types.ts";

/**
 * A filled arrowhead with its tip at `tip`, pointing along the unit vector
 * `(ux, uy)`: `length` from its base to its tip, `width` across its base.
 */
export function drawArrowHead(
  dr: GameDrawing,
  tip: Point,
  ux: number,
  uy: number,
  length: number,
  width: number,
  color: number,
): void {
  const base = { x: tip.x - ux * length, y: tip.y - uy * length };
  const half = width / 2;
  const side = (k: number): Point => ({
    x: Math.round(base.x - uy * k),
    y: Math.round(base.y + ux * k),
  });
  dr.drawPolygon(
    [{ x: Math.round(tip.x), y: Math.round(tip.y) }, side(half), side(-half)],
    color,
    color,
  );
}

/** How long a path's arrowhead is, base to tip, on tile `ts`. */
export const pathHeadLength = (ts: number): number => Math.max(5, Math.round(ts * 0.2));
/** How wide a path's arrowhead is across its base on tile `ts`. */
export const pathHeadWidth = (ts: number): number => Math.max(7, Math.round(ts * 0.3));

/**
 * The arrowhead of a path's line from the middle `a` of one square to the
 * middle `b` of the next, at the middle of the line: centered on the
 * squares' shared side, so it is clear of letters or numbers on the squares.
 */
export function drawPathHead(
  dr: GameDrawing,
  ts: number,
  a: Point,
  b: Point,
  color: number,
): void {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const ux = (b.x - a.x) / len;
  const uy = (b.y - a.y) / len;
  const length = pathHeadLength(ts);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const tip = { x: mid.x + (ux * length) / 2, y: mid.y + (uy * length) / 2 };
  drawArrowHead(dr, tip, ux, uy, length, pathHeadWidth(ts), color);
}

/** How thick the ring round a path's first square is on tile `ts`. */
const pathStartThickness = (ts: number): number => Math.max(2, Math.round(ts / 14));

/** The ring round a path's first square, centered at `center`: `color`
 * round a disc of radius `inside` in `surface`, which the square's own
 * content is drawn on after. */
export function drawPathStart(
  dr: GameDrawing,
  ts: number,
  center: Point,
  inside: number,
  color: number,
  surface: number,
): void {
  dr.drawCircle(center, inside + pathStartThickness(ts), color, color);
  dr.drawCircle(center, inside, surface, surface);
}
