/**
 * A link (`play.links`), the player's mark from a cell to its clue's: each
 * tile draws its half toward the other, in ink, red where Check & Save found
 * it wrong.
 */

import { COL_ERROR } from "../../../color/roles.ts";
import type { GameDrawing } from "../../../contract/game.ts";
import type { Rect } from "../../../contract/types.ts";
import type { FillMistake } from "../../answer.ts";
import { type Clues, type FillBoard, listOf } from "../../board.ts";
import { COL_INK } from "../palette.ts";
import type { FillSetup } from "../setup.ts";
import { BAD_LINK_SHIFT, dirTo, LINK_SHIFT } from "../tile-word.ts";
import type { TileFrame } from "./layer.ts";

/** The cell a link from `c` names: the clue's own. */
const linkTo = <C extends Clues<C>>(
  linkClues: keyof C | null,
  b: FillBoard<C>,
  c: number,
): number =>
  linkClues === null || b.mark[c] < 0 ? -1 : listOf(b.dealt, linkClues).at[b.mark[c]];

/** Into the tile words `word`, the links as drawn on `shown`, both halves,
 * those Check & Save found wrong in error. */
export function addLinks<C extends Clues<C>>(
  cx: FillSetup<C>,
  word: Int32Array,
  shown: FillBoard<C>,
  mistakes: readonly FillMistake[],
): void {
  const { w, h } = shown;
  const badLinks = new Set<number>();
  for (const m of mistakes) if (m.kind === "mark") badLinks.add(m.cell);
  for (let c = 0; c < w * h; c++) {
    const t = linkTo(cx.linkClues, shown, c);
    const d = t < 0 ? -1 : dirTo(w, c, t);
    if (d < 0) continue;
    const bad = badLinks.has(c) ? 1 : 0;
    word[c] |= (1 << (LINK_SHIFT + d)) | (bad << (BAD_LINK_SHIFT + d));
    const back = (d + 2) % 4;
    word[t] |= (1 << (LINK_SHIFT + back)) | (bad << (BAD_LINK_SHIFT + back));
  }
}

/**
 * A tile's half of a link toward `d`: a thin line from the shared side a
 * quarter of the way in, which the neighbor's half completes across the grid
 * line. Thin and in ink, it reads as a mark the player made.
 */
export function drawLinkHalf(
  dr: GameDrawing,
  ts: number,
  tx: number,
  ty: number,
  d: number,
  color: number,
): void {
  const th = Math.max(2, Math.floor(ts / 14));
  const len = Math.floor(ts / 4) + 1;
  const mid = Math.floor(ts / 2) - Math.floor(th / 2);
  const rect: Rect = [
    { x: tx + mid, y: ty, w: th, h: len },
    { x: tx + ts - len, y: ty + mid, w: len, h: th },
    { x: tx + mid, y: ty + ts - len, w: th, h: len },
    { x: tx, y: ty + mid, w: len, h: th },
  ][d];
  dr.drawRect(rect, color);
}

export function paintLinkHalves({ dr, ts, tx, ty, word }: TileFrame): void {
  for (let d = 0; d < 4; d++)
    if (word & (1 << (LINK_SHIFT + d)))
      drawLinkHalf(
        dr,
        ts,
        tx,
        ty,
        d,
        word & (1 << (BAD_LINK_SHIFT + d)) ? COL_ERROR : COL_INK,
      );
}
