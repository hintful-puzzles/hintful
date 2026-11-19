/**
 * The arrows that say which way a path runs: one shape for every game that
 * shows a direction from one square to another, so a player reads it alike
 * everywhere (owner, 2026-11-19, after finding Ascent's path direction
 * unclear).
 *
 * - {@link drawArrowHead}: the filled head, the one shape. A hint's move
 *   arrow (`draw.ts`'s `drawMoveArrow`) wears it too.
 * - {@link drawPathArrow}: a path's link between two squares, a thin shaft
 *   and the head, filling the gap between the discs the squares' numbers or
 *   letters sit on (Ascent's, Wordtrail's). It crosses the squares' shared
 *   side, so a game that draws each square under its own clip draws the
 *   whole arrow from both squares, each keeping its part; draw it after the
 *   grid line there, which would cut it in two.
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

/** How thick the ring round a path's first square, and an arrow's shaft, are
 * on tile `ts`: thin, so a short shaft is longer than it is wide. */
export const pathStrokeThickness = (ts: number): number =>
  Math.max(2, Math.round(ts / 14));

/**
 * A whole arrow on the link from the middle `a` of one square to the middle
 * `b` of the next, filling the gap between two discs of radius `inset` on
 * them: a thin shaft from the edge of `a`'s disc, and the head with its tip
 * on the edge of `b`'s. On a diagonal link the gap is longer, so the shaft is
 * too and the head sits by its own square: two diagonals crossing at a
 * corner read as a cross of two arrows, not one blot of two heads.
 */
export function drawPathArrow(
  dr: GameDrawing,
  ts: number,
  a: Point,
  b: Point,
  color: number,
  inset: number,
): void {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const ux = (b.x - a.x) / len;
  const uy = (b.y - a.y) / len;
  const length = pathHeadLength(ts);
  const at = (d: number): Point => ({ x: a.x + ux * d, y: a.y + uy * d });
  const base = at(len - inset - length);
  const tail = at(inset);
  dr.drawLine(
    { x: Math.round(tail.x), y: Math.round(tail.y) },
    { x: Math.round(base.x), y: Math.round(base.y) },
    color,
    pathStrokeThickness(ts),
  );
  drawArrowHead(dr, at(len - inset), ux, uy, length, pathHeadWidth(ts), color);
}

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
  dr.drawCircle(center, inside + pathStrokeThickness(ts), color, color);
  dr.drawCircle(center, inside, surface, surface);
}
