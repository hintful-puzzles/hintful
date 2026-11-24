/** A dealt cell's dot (`play.dotted`): dark on a light piece, light on a
 * dark one. A broken piece's badge takes the middle, where the dot would
 * be, so a piece in error has none. */

import type { FillPalette } from "../palette.ts";
import { ERR_AT, FIXED } from "../tile-word.ts";
import type { TileFrame } from "./layer.ts";

export function paintDot(
  pal: FillPalette,
  { dr, ts, tx, ty, word, piece }: TileFrame,
): void {
  if (piece === null || !(word & FIXED) || word & ERR_AT) return;
  const dot = piece.painter.dark === true ? pal.COL_DOT_LIGHT : pal.COL_DOT;
  const at = { x: tx + Math.floor(ts / 2), y: ty + Math.floor(ts / 2) };
  dr.drawCircle(at, Math.floor(ts / 7), dot, dot);
}
