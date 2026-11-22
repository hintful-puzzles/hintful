/**
 * A star, five-pointed and filled in the shaded piece's color: the object a
 * placement game puts in a cell (Star Battle's).
 */

import { SHADED } from "../../color/palette.ts";
import { COL_ERROR } from "../../color/roles.ts";
import type { Point } from "../../contract/types.ts";
import type { Painter } from "./painter.ts";

/** How far a point's inner corners reach, as a share of its outer ones. */
const INNER = 0.42;

/** The ten corners of a star of outer radius `r` round `c`, its top point
 * first. */
function starPoints(c: Point, r: number): Point[] {
  return Array.from({ length: 10 }, (_, k) => {
    const angle = (k * Math.PI) / 5 - Math.PI / 2;
    const reach = k % 2 === 0 ? r : r * INNER;
    return { x: c.x + reach * Math.cos(angle), y: c.y + reach * Math.sin(angle) };
  });
}

export const star: Painter = {
  colors: () => [SHADED],
  surface: null,
  grows: true,
  paint(dr, tile, slot, error, grown = 1) {
    const middle = { x: tile.x + (tile.w + 1) / 2, y: tile.y + (tile.h + 1) / 2 };
    const color = error ? COL_ERROR : slot[0];
    dr.drawPolygon(
      starPoints(middle, (Math.min(tile.w, tile.h) / 3) * grown),
      color,
      color,
    );
  },
};
