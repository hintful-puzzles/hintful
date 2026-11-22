/**
 * A line through a square, across or up and down, which joins the line in
 * the square beside it running the same way (Sticks'). Each runs along an
 * axis, which the input reads: a drag along a row places the bar across,
 * and neither bar rules the other out. The art is the fork's Sticks': a
 * band a fifth of the tile thick through its middle, edge to edge.
 */

import { SHADED } from "../../color/palette.ts";
import { COL_ERROR } from "../../color/roles.ts";
import type { GameDrawing } from "../../contract/game.ts";
import type { Rect } from "../../contract/types.ts";
import type { Painter } from "./painter.ts";

/** The band through the middle of `tile` along `axis`. */
function band(
  dr: GameDrawing,
  tile: Rect,
  axis: "row" | "column",
  color: number,
): void {
  const ts = Math.min(tile.w, tile.h);
  const off = Math.floor((ts * 2) / 5);
  const thick = Math.floor(ts / 5);
  if (axis === "row")
    dr.drawRect({ x: tile.x, y: tile.y + off, w: ts - 1, h: thick }, color);
  else dr.drawRect({ x: tile.x + off, y: tile.y, w: thick, h: ts - 1 }, color);
}

/** A bar along `axis`, red where a rule breaks at its square. */
const bar = (axis: "row" | "column"): Painter => ({
  colors: () => [SHADED],
  surface: null,
  axis,
  paint(dr, tile, slot, error) {
    band(dr, tile, axis, error ? COL_ERROR : slot[0]);
  },
});

/** A line across a square. */
export const across: Painter = bar("row");

/** A line up and down a square. */
export const down: Painter = bar("column");
