/** On a board of numbers (`play.numbers`), each value drawn as its glyph:
 * a given in ink, the player's in the entry color, red where a rule breaks at
 * the cell. A raised value's glyph is on its top (`three-d.ts`). */

import { COL_ERROR } from "../../../color/roles.ts";
import { COL_INK } from "../palette.ts";
import { ERR_AT, FIXED } from "../tile-word.ts";
import type { TileFrame } from "./layer.ts";

/** The ink of a value's glyph with tile word `word`. */
export const numeralInk = (word: number, COL_ENTRY: number): number =>
  word & FIXED ? COL_INK : word & ERR_AT ? COL_ERROR : COL_ENTRY;

export function paintNumeral(
  COL_ENTRY: number,
  glyph: (v: number) => string,
  { dr, ts, at, tx, ty, word, part, lay }: TileFrame,
): void {
  const v = word & 0xff;
  if (v === 0) return;
  const { origin, options } = lay.valueText(ts, at, part?.walls ?? null, tx, ty);
  dr.drawText(origin, options, numeralInk(word, COL_ENTRY), glyph(v));
}
