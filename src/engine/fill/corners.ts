/**
 * The clues a fill board draws where four of its cells meet (`at: corner`,
 * Mathrax's): which clue is at a corner, and the text it is drawn as, for
 * the renderer and the text format alike. The corners are numbered as the
 * space numbers them (`describe-runtime/space.ts`), in reading order over
 * the `(w - 1) × (h - 1)` points inside the grid.
 */

import type { GridSpace } from "../solve/describe-runtime.ts";
import { type Clues, type FillBoard, listOf } from "./board.ts";
import type { ClueMax, FillDeal } from "./game-id.ts";

/** The clue kinds at corners. */
export const cornerKindsOf = (deal?: FillDeal): string[] =>
  Object.entries(deal?.universes ?? {})
    .filter(([, u]) => u === "corners")
    .map(([k]) => k);

/** The least and the most value of a clue of `kind` at a corner of the
 * board on `sp`, which the corner does not move. */
export function cornerRange<C>(
  deal: FillDeal,
  clueMax: ClueMax<C>,
  kind: keyof C & string,
  sp: GridSpace,
  dealt: C,
): readonly [number, number] {
  const most = clueMax[kind];
  if (most === undefined) throw new Error(`corners: ${kind} has no values`);
  return [deal.least?.[kind] ?? 0, most(sp, 0, dealt)];
}

/** The clue at corner `k` of board `b`, the first of `kinds` that has one,
 * with its index in its kind's list; `null` where none does. */
export function cornerClueAt<C extends Clues<C>>(
  kinds: readonly (keyof C)[],
  b: FillBoard<C>,
  k: number,
): { readonly kind: keyof C & string; readonly i: number; readonly v: number } | null {
  for (const kind of kinds) {
    const list = listOf(b.dealt, kind);
    const i = list.byAt[k];
    if (i >= 0) return { kind: kind as keyof C & string, i, v: list.v[i] };
  }
  return null;
}

/**
 * The text of a clue valued `v` whose kind's sign is `sign` (`play.signs`)
 * and whose values run from `least` to `most`: a word a value where the
 * sign is a list, the sign alone where the kind has one value (Mathrax's
 * `=`), and else the number and its sign (`6×`).
 */
export function signedText(
  sign: string | readonly string[] | null,
  v: number,
  least: number,
  most: number,
): string {
  if (sign === null) return String(v);
  if (typeof sign !== "string") return sign[v - least] ?? String(v);
  return least === most ? sign : `${v}${sign}`;
}

/** Corner `k`'s point on a board `w` wide: the cell above and left of it. */
export function cornerCell(
  w: number,
  k: number,
): { readonly x: number; readonly y: number } {
  return { x: k % (w - 1), y: Math.floor(k / (w - 1)) };
}
