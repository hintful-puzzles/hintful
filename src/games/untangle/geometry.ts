/**
 * Floating-point plane geometry for the searches that *propose* positions
 * (`solution.ts`'s relaxation, `hint.ts`'s spot search). Nothing here decides
 * what the board accepts: every proposal is re-checked with the exact
 * `cross()` before a player sees it.
 */

import type { Point } from "../../engine/types.ts";
import type { RationalPoint } from "./state.ts";

/** Denominator for a computed position: pixel-level at the preferred tile
 * size, and far finer than any clearance the searches keep. */
const LAYOUT_DENOM = 64;

/** The typical distance between points when `n` of them share a `w`-square.
 * Gaps are fractions of it, so they look alike at every board size (the tile
 * size shrinks as `n`, and so `w`, grows). */
export const pointSpacing = (n: number, w: number): number => w / Math.sqrt(n);

/** How far any computed position keeps from the frame, in point spacings. */
export const EDGE_GAP = 0.35;

export const units = (p: RationalPoint): Point => ({ x: p.x / p.d, y: p.y / p.d });

export const toRational = (p: Point): RationalPoint => ({
  x: Math.round(p.x * LAYOUT_DENOM),
  y: Math.round(p.y * LAYOUT_DENOM),
  d: LAYOUT_DENOM,
});

/** Exactly the same position, whatever the denominators. */
export const samePoint = (a: RationalPoint, b: RationalPoint): boolean =>
  a.x * b.d === b.x * a.d && a.y * b.d === b.y * a.d;

/** Do segments `a-b` and `c-d` cross at a point interior to both? */
export function properCross(a: Point, b: Point, c: Point, d: Point): boolean {
  const o = (p: Point, q: Point, r: Point) =>
    (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  return o(c, d, a) * o(c, d, b) < 0 && o(a, b, c) * o(a, b, d) < 0;
}

/** Squared distance from `p` to the segment `a-b`. */
export function segDist2(p: Point, a: Point, b: Point): number {
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const len2 = vx * vx + vy * vy;
  const t =
    len2 > 0
      ? Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / len2))
      : 0;
  return (p.x - a.x - t * vx) ** 2 + (p.y - a.y - t * vy) ** 2;
}

/** Where the lines through `a-b` and `c-d` meet. */
export function intersection(a: Point, b: Point, c: Point, d: Point): Point {
  const den = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
  const t =
    den === 0 ? 0.5 : ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) / den;
  return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
}
