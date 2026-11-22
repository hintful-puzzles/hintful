/**
 * Pieces on open ground: a tent, a tree, and the ground alone, each on the
 * ground's green wash. The art is upstream's tents.c `draw_tile`.
 */

import { BROWN, GREEN, GREEN_WASH, ORANGE, RED_BOLD } from "../../color/colors.ts";
import { COL_ERROR } from "../../color/roles.ts";
import type { Painter } from "./painter.ts";

/** The ground, with nothing on it. */
export const ground: Painter = {
  colors: () => [GREEN_WASH],
  surface: 0,
  paint() {},
};

/** A tent: a triangle in the middle of the tile. */
export const tent: Painter = {
  colors: () => [GREEN_WASH, ORANGE],
  surface: 0,
  paint(dr, { x, y, w: ts }, base, error) {
    const cx = x + Math.floor(ts / 2);
    const cy = y + Math.floor(ts / 2);
    const t = Math.floor(ts / 3);
    const col = error ? COL_ERROR : base + 1;
    dr.drawPolygon(
      [
        { x: cx - t, y: cy + t },
        { x: cx + t, y: cy + t },
        { x: cx, y: cy - t },
      ],
      col,
      col,
    );
  },
};

/** A tree: a trunk under five round leaves. */
export const tree: Painter = {
  // Red's bold step for a trunk in error, not the error role: it has to be
  // told from the red leaves it is drawn under.
  colors: () => [GREEN_WASH, BROWN, GREEN, RED_BOLD],
  surface: 0,
  paint(dr, { x: tx, y: ty, w: ts }, base, error) {
    const cx = tx + Math.floor(ts / 2);
    dr.drawRect(
      {
        x: cx - Math.floor(ts / 15),
        y: ty + Math.floor((ts * 3) / 10),
        w: 2 * Math.floor(ts / 15) + 1,
        h: Math.floor((ts * 9) / 10) - Math.floor((ts * 3) / 10),
      },
      error ? base + 3 : base + 1,
    );
    const col = error ? COL_ERROR : base + 2;
    const leaf = (dx: number, dy: number, r: number) =>
      dr.drawCircle({ x: cx + dx, y: ty + dy }, r, col, col);
    leaf(0, Math.floor((ts * 4) / 10), Math.floor(ts / 4));
    const r = Math.floor(ts / 8);
    leaf(Math.floor(ts / 5), Math.floor(ts / 4), r);
    leaf(-Math.floor(ts / 5), Math.floor(ts / 4), r);
    leaf(Math.floor(ts / 4), Math.floor((ts * 6) / 13), r);
    leaf(-Math.floor(ts / 4), Math.floor((ts * 6) / 13), r);
  },
};
