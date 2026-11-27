/**
 * The clues one a value at the lines (`per: value`, ABCD's counts of each
 * letter a row or column holds), drawn before each line's start as deep as
 * the values: a tile a value, in the values' order toward the board, so
 * value 1's are furthest out. Each column of a row's clues and
 * each row of a column's is headed by its value, the two headings sharing
 * the margins' corner (upstream abcd.c's `draw_border_letters`). Where each
 * lies, for the renderer, the done marks, the hint and the text format.
 *
 * A clue is placed at `perPlace(line, value)`, the lines numbered rows then
 * columns. Its square off the grid is named by its point, as a slot's is
 * (`slots.ts`), so a hint marks it as it marks any square.
 *
 * The margin's other parts: the site that draws it,
 * `render/sites/value-margins.ts`, and the compiler's export of its kinds,
 * `describe/fill/locations.ts`.
 */

import type { Point } from "../contract/types.ts";
import { perElement, perPlace, perValue } from "../solve/describe-runtime.ts";
import {
  type Clues,
  type FillBoard,
  type FillModule,
  listOf,
  perValuesOf,
  spaceOf,
} from "./board.ts";

/** How many values the margin of board `b` heads: its domain's top. */
export const marginValuesOf = <C>(module: FillModule<C>, b: FillBoard<C>): number =>
  perValuesOf(module, spaceOf(module, b), b.dealt);

/** Where the clue at `place` of a board `h` high whose margin heads
 * `values` values lies: a square off the grid, before its line's start. */
export function marginPoint(h: number, values: number, place: number): Point {
  const line = perElement(place);
  const out = perValue(place) - 1 - values;
  return line < h ? { x: out, y: line } : { x: line - h, y: out };
}

/** The place of the clue at `(x, y)` beside a `w` by `h` board whose
 * margin heads `values` values, or `-1` where that is no clue's square: on
 * the grid, in the margins' corner, or further out. */
export function marginPlaceAt(
  w: number,
  h: number,
  values: number,
  x: number,
  y: number,
): number {
  if (y >= 0 && y < h && x < 0 && x >= -values) return perPlace(y, x + values + 1);
  if (x >= 0 && x < w && y < 0 && y >= -values) return perPlace(h + x, y + values + 1);
  return -1;
}

/** Where each value's headings lie, at the inner edge of the margins'
 * corner: over its column of the rows' clues and beside its row of the
 * columns', the last value's one square for both. */
export function marginHeadings(values: number): readonly (Point & { v: number })[] {
  const out: (Point & { v: number })[] = [];
  for (let v = 1; v <= values; v++) {
    out.push({ x: v - 1 - values, y: -1, v });
    if (v < values) out.push({ x: -1, y: v - 1 - values, v });
  }
  return out;
}

/** The clue at `place` of board `b`, the first of `kinds` that has one,
 * with its index in its kind's list; `null` where none does. */
export function marginClueAt<C extends Clues<C>>(
  kinds: readonly (keyof C)[],
  b: FillBoard<C>,
  place: number,
): { readonly kind: keyof C & string; readonly k: number; readonly v: number } | null {
  if (place < 0) return null;
  for (const kind of kinds) {
    const list = listOf(b.dealt, kind);
    const k = list.byAt[place] ?? -1;
    if (k >= 0) return { kind: kind as keyof C & string, k, v: list.v[k] };
  }
  return null;
}
