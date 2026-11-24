/**
 * The clues a fill board draws beyond the ends of its lines (`at: slot`):
 * where each slot lies off the grid, and which clue is at it, for the
 * renderer, the done marks, the hint and the text format alike.
 *
 * The slots are numbered as the space numbers them
 * (`describe-runtime/space.ts`): above each column, below each, left of
 * each row, right of each.
 *
 * A slot's other parts: the site that draws its clues, `render/sites/slots.ts`,
 * and the compiler's export of the kinds at slots, `describe/fill/locations.ts`.
 */

import type { Point } from "../contract/types.ts";
import { type Clues, type FillBoard, listOf } from "./board.ts";

/** Where slot `s` of a `w` by `h` board lies: a square off the grid, a step
 * beyond its line's end. */
export function slotPoint(w: number, h: number, s: number): Point {
  if (s < w) return { x: s, y: -1 };
  if (s < 2 * w) return { x: s - w, y: h };
  if (s < 2 * w + h) return { x: -1, y: s - 2 * w };
  return { x: w, y: s - 2 * w - h };
}

/** The slot at `(x, y)` beside a `w` by `h` board, or `-1` where that is no
 * slot: on the grid, at a corner, or further out. */
export function slotAt(w: number, h: number, x: number, y: number): number {
  const inX = x >= 0 && x < w;
  const inY = y >= 0 && y < h;
  if (inX && y === -1) return x;
  if (inX && y === h) return w + x;
  if (inY && x === -1) return 2 * w + y;
  if (inY && x === w) return 2 * w + h + y;
  return -1;
}

/** The clue at slot `s` of board `b`, the first of `kinds` that has one, with
 * its index in its kind's list; `null` where none does. */
export function slotClueAt<C extends Clues<C>>(
  kinds: readonly (keyof C)[],
  b: FillBoard<C>,
  s: number,
): { readonly kind: keyof C & string; readonly k: number; readonly v: number } | null {
  for (const kind of kinds) {
    const list = listOf(b.dealt, kind);
    const k = list.byAt[s];
    if (k >= 0) return { kind: kind as keyof C & string, k, v: list.v[k] };
  }
  return null;
}
