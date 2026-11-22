/**
 * A light and the wall that stops it: a bulb on a square, and a wall dealt
 * on one, which a number on it is written light over (Light Up's). The art is
 * upstream's lightup.c `tile_redraw`.
 */

import { BLACK, WHITE } from "../../color/colors.ts";
import { wallFill } from "../../color/palette.ts";
import { COL_ERROR } from "../../color/roles.ts";
import type { Painter } from "./painter.ts";

/** A wall: the whole tile, its grid lines too, so a run of walls is one
 * block. */
export const wall: Painter = {
  colors: (bg) => [wallFill(bg)],
  surface: 0,
  dark: true,
  paint(dr, tile, slot) {
    dr.drawRect(tile, slot[0]);
  },
};

/** A bulb: a white disc with a black rim, in either scheme, as a bulb is;
 * the disc red where a rule breaks at it. */
export const bulb: Painter = {
  colors: () => [WHITE, BLACK],
  surface: null,
  grows: true,
  paint(dr, tile, slot, error, grown = 1) {
    const ts = Math.min(tile.w, tile.h);
    const r = Math.floor((3 * (ts - 1)) / 8) * grown;
    if (r < 1) return;
    dr.drawCircle(
      { x: tile.x + Math.floor(ts / 2), y: tile.y + Math.floor(ts / 2) },
      r,
      error ? COL_ERROR : slot[0],
      slot[1],
    );
  },
};
