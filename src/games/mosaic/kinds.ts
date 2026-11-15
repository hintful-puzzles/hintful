/**
 * The marks Mosaic's hint draws, beyond the engine's `CELL`.
 *
 * A step reasons from one number and the squares it counts, so the number is
 * named ("this 3") and its block of squares is outlined as one area: the
 * number's own square and the eight around it, clipped at the edge.
 */

import { CELL, type MarkKind } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** A number and the block of squares it counts, named by the number's square. */
export const BLOCK: MarkKind<Point> = { name: "block", key: CELL.key };

/** The squares of the block centered on `c`, clipped to a `w`×`h` board. */
export function blockOf(c: Point, w: number, h: number): Point[] {
  const out: Point[] = [];
  for (let y = Math.max(0, c.y - 1); y <= Math.min(h - 1, c.y + 1); y++)
    for (let x = Math.max(0, c.x - 1); x <= Math.min(w - 1, c.x + 1); x++)
      out.push({ x, y });
  return out;
}
