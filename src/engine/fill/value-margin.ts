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

/** Which values' clues a margin draws before each line's start, the
 * furthest out first, and which past its end, the nearest first: a value
 * in neither is drawn nowhere. */
export interface MarginSides {
  readonly start: readonly number[];
  readonly end: readonly number[];
}

/** The margin of board `b`: as `play.ends` lays it (Magnets' + before the
 * start and − past the end), or every value from 1 to the domain's top
 * before the start. */
export function marginSidesOf<C>(module: FillModule<C>, b: FillBoard<C>): MarginSides {
  const ends = module.play?.ends;
  if (ends !== undefined) return ends;
  const top = perValuesOf(module, spaceOf(module, b), b.dealt);
  return { start: Array.from({ length: top }, (_, d) => d + 1), end: [] };
}

/** Where the clue at `place` of a `w` by `h` board whose margin is laid
 * `sides` lies: a square off the grid, before its line's start or past its
 * end; `null` where its value is drawn nowhere. */
export function marginPoint(
  w: number,
  h: number,
  sides: MarginSides,
  place: number,
): Point | null {
  const line = perElement(place);
  const v = perValue(place);
  const i = sides.start.indexOf(v);
  const j = sides.end.indexOf(v);
  if (i < 0 && j < 0) return null;
  const row = line < h;
  const out = i >= 0 ? i - sides.start.length : (row ? w : h) + j;
  return row ? { x: out, y: line } : { x: line - h, y: out };
}

/** The place of the clue at `(x, y)` beside a `w` by `h` board whose
 * margin is laid `sides`, or `-1` where that is no clue's square: on the
 * grid, in the margins' corners, or further out. */
export function marginPlaceAt(
  w: number,
  h: number,
  sides: MarginSides,
  x: number,
  y: number,
): number {
  const { start, end } = sides;
  const n = start.length;
  if (y >= 0 && y < h) {
    if (x < 0 && x >= -n) return perPlace(y, start[x + n]);
    if (x >= w && x < w + end.length) return perPlace(y, end[x - w]);
  }
  if (x >= 0 && x < w) {
    if (y < 0 && y >= -n) return perPlace(h + x, start[y + n]);
    if (y >= h && y < h + end.length) return perPlace(h + x, end[y - h]);
  }
  return -1;
}

/** Where each value's headings lie, at the inner edge of the margins'
 * corners: over its column of the rows' clues and beside its row of the
 * columns', the value nearest the board one square for both; a start
 * value's in the top left corner, an end value's in the bottom right. */
export function marginHeadings(
  w: number,
  h: number,
  sides: MarginSides,
): readonly (Point & { v: number })[] {
  const out: (Point & { v: number })[] = [];
  const n = sides.start.length;
  sides.start.forEach((v, i) => {
    out.push({ x: i - n, y: -1, v });
    if (i < n - 1) out.push({ x: -1, y: i - n, v });
  });
  sides.end.forEach((v, j) => {
    out.push({ x: w + j, y: h, v });
    if (j > 0) out.push({ x: w, y: h + j, v });
  });
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
