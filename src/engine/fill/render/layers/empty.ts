/**
 * On a board whose answer repeats a value in a unit as its empty square
 * (`play.numbers.empty`, Salad's): that value drawn as the engine's cross,
 * and a ball round a square known to hold a value, a clue's in ink and the
 * player's, whose notes lack the empty square, in the entry color.
 */

import { drawRuledOutCross } from "../../../render/piece.ts";
import { surfaceOf } from "../../../render/pieces/painter.ts";
import { drawRingIn } from "../../../render/pieces/stock.ts";
import { type Clues, type FillBoard, listOf, spaceOf } from "../../board.ts";
import { emptyOf } from "../../glyphs.ts";
import { COL_INK } from "../palette.ts";
import type { FillSetup } from "../setup.ts";
import { BALL, BALL_BARE, BALL_GIVEN } from "../tile-word.ts";
import type { TileFrame } from "./layer.ts";
import { numeralInk } from "./numerals.ts";

/** Board `b`'s empty square, 0 where it has none. */
export const emptyIn = <C extends Clues<C>>(
  cx: FillSetup<C>,
  b: FillBoard<C>,
): number =>
  cx.play.numbers?.empty === undefined
    ? 0
    : (emptyOf(cx.module, spaceOf(cx.module, b), b.dealt) ?? 0);

/** Each cell's ball bits on board `b` (`BALL`, `BALL_GIVEN`, `BALL_BARE`),
 * whose empty square is `empty`. */
export function ballsOf<C extends Clues<C>>(
  cx: FillSetup<C>,
  b: FillBoard<C>,
  empty: number,
): Int32Array {
  const out = new Int32Array(b.values.length);
  const kind = cx.play.numbers?.empty?.ball as (keyof C & string) | undefined;
  if (empty === 0 || kind === undefined) return out;
  for (const c of listOf(b.dealt, kind).at) out[c] |= BALL | BALL_GIVEN;
  const bit = 1 << empty;
  const sp = spaceOf(cx.module, b);
  for (const c of sp.cells) {
    const noted = b.pencil?.[c] ?? 0;
    if (b.values[c] !== 0 || noted === 0 || noted & bit) continue;
    out[c] |= BALL;
    if (noted === (cx.module.domainOf(sp, b.dealt, c) & ~bit)) out[c] |= BALL_BARE;
  }
  return out;
}

/** The ball round the cell, and its value drawn as the cross where it is
 * the empty square `empty`. */
export function paintEmpty(
  COL_ENTRY: number,
  empty: number,
  { dr, tile, word, lineWord }: TileFrame,
): void {
  const cell = surfaceOf(tile);
  if (lineWord & BALL)
    drawRingIn(dr, cell, lineWord & BALL_GIVEN ? COL_INK : COL_ENTRY);
  if (empty !== 0 && (word & 0xff) === empty)
    drawRuledOutCross(dr, cell, numeralInk(word, COL_ENTRY));
}
