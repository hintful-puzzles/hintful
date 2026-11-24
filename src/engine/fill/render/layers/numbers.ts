/**
 * A number dealt on a cell (a cell kind the player does not fill): light on
 * a dark piece, faint once every cell it counts is decided, and a red badge
 * where it is broken. A step that reasons from it outlines its cells and
 * circles it.
 */

import { COL_ERROR, COL_HINT_OUTLINE } from "../../../color/roles.ts";
import { drawMarkSides, MARK_ALL } from "../../../render/hint-mark.ts";
import { liveErrors } from "../../../render/live-errors.ts";
import { type Clues, type FillBoard, listOf, spaceOf } from "../../board.ts";
import { numberText } from "../geometry.ts";
import type { FillPalette } from "../palette.ts";
import { COL_ERRTEXT, COL_INK } from "../palette.ts";
import type { FillSetup } from "../setup.ts";
import {
  BLOCK_SHIFT,
  HINT_NUMBER,
  NUMBER_BROKEN,
  NUMBER_DONE,
  NUMBER_UNDER,
} from "../tile-word.ts";
import type { TileFrame } from "./layer.ts";

/** Each number's state on the board: done, broken or neither, by its
 * cell. A number is broken where the rules say its cells can no longer
 * agree with it, and done where they are all decided and do. */
export function numberStates<C extends Clues<C>>(
  { numbers, rules, module, clueCells }: FillSetup<C>,
  b: FillBoard<C>,
): Map<number, number> {
  const out = new Map<number, number>();
  if (numbers.length === 0) return out;
  const broken = liveErrors(rules, b).clues;
  const sp = spaceOf(module, b);
  for (const kind of numbers) {
    const list = listOf(b.dealt, kind);
    const bad = new Set(broken.get(kind) ?? []);
    const cellsOf = clueCells[kind];
    list.at.forEach((c, k) => {
      if (bad.has(k)) out.set(c, NUMBER_BROKEN);
      else if (cellsOf?.(sp, c).every((d) => b.values[d] !== 0))
        out.set(c, NUMBER_DONE);
    });
  }
  return out;
}

/** The numbers not yet done, of those that can be. */
export function numbersLeft<C extends Clues<C>>(
  cx: FillSetup<C>,
  b: FillBoard<C>,
): number {
  const states = numberStates(cx, b);
  let left = 0;
  for (const kind of cx.numbers)
    if (cx.clueCells[kind] !== undefined)
      for (const c of listOf(b.dealt, kind).at)
        if (states.get(c) !== NUMBER_DONE) left++;
  return left;
}

/** Cell `i`'s number as drawn, holding `v`: -1 where it has none, or its
 * piece covers it (`play.covers`) and the preference does not show it. */
export function shownNumber<C extends Clues<C>>(
  cx: FillSetup<C>,
  state: FillBoard<C>,
  i: number,
  v: number,
  show: boolean,
): number {
  const at = cx.numberAt(state, i);
  if (at === null || (v === cx.play.covers?.value && !show)) return -1;
  return listOf(state.dealt, at.kind).v[at.k];
}

/** A number over whatever its cell holds: light over a dark piece; faint
 * once done; and broken, a badge on a decided cell, where red ink on a
 * piece would differ in hue with little of lightness in the dark scheme. */
export function paintNumber(
  pal: FillPalette,
  { dr, ts, tx, ty, lineWord, n, piece }: TileFrame,
): void {
  if (n < 0) return;
  const full = numberText(ts, tx, ty);
  const text =
    lineWord & NUMBER_UNDER
      ? {
          ...full,
          options: {
            ...full.options,
            size: Math.floor((full.options.size * 3) / 4),
          },
        }
      : full;
  const dark = piece?.painter.dark === true;
  let color = dark ? pal.COL_NUMBER_LIGHT : COL_INK;
  if (lineWord & NUMBER_BROKEN) {
    if (piece !== null) dr.drawCircle(text.origin, ts * 0.32, COL_ERROR, COL_ERROR);
    color = piece !== null ? COL_ERRTEXT : COL_ERROR;
  } else if (lineWord & NUMBER_DONE)
    color = dark ? pal.COL_NUMBER_LIGHT_DONE : pal.COL_NUMBER_DONE;
  dr.drawText(text.origin, text.options, color, String(n));
}

/** The block of a number a step reasons from, inside the tile so its own
 * repaint undoes it, and the number circled, clear of the tile's edge so
 * it shows on a cell the step also rings. On a dark piece the circle
 * takes the number's own ink: the evidence color against it is a
 * difference of hue with little of lightness. */
export function paintNumberHint(
  pal: FillPalette,
  { dr, ts, at, tx, ty, hintWord, part, piece, lay }: TileFrame,
): void {
  const band = lay.markBand(ts, at, part?.walls ?? null);
  drawMarkSides(dr, band, (hintWord >> BLOCK_SHIFT) & MARK_ALL, COL_HINT_OUTLINE);
  if (hintWord & HINT_NUMBER) {
    const center = numberText(ts, tx, ty).origin;
    for (let i = 0; i < band.inner; i++)
      dr.drawCircle(
        center,
        ts * 0.33 - i,
        -1,
        piece?.painter.dark ? pal.COL_NUMBER_LIGHT : COL_HINT_OUTLINE,
      );
  }
}
