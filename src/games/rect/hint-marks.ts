/**
 * The kinds Rectangles' hint marks, beside the engine's `CELL`.
 *
 * A step decides a whole **rectangle**, which spans many tiles. Its ring is
 * the contour of its squares, each tile painting the sides of its own that lie
 * on the rectangle's edge, the way an evidence area's outline is drawn, so the
 * mark needs no footprint beyond the squares themselves.
 */

import type { MarkKind } from "../../engine/hint-words.ts";
import type { Rect } from "../../engine/types.ts";

/** An edge between two squares: `h` is the top of `(x, y)`, `v` its left. */
export interface RectEdge {
  readonly edge: "h" | "v";
  readonly x: number;
  readonly y: number;
}

/** A rectangle a step draws. */
export const RECTANGLE: MarkKind<Rect> = {
  name: "rectangle",
  key: (r) => `${r.x},${r.y},${r.w},${r.h}`,
};

/** An edge a step draws as a line. */
export const LINE: MarkKind<RectEdge> = {
  name: "line",
  key: (e) => `${e.edge}${e.x},${e.y}`,
};
