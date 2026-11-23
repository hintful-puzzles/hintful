/**
 * Boats at sea: a hull that runs through its cells, and the water round it.
 * The art is upstream's boats.c `boats_draw_ship` and its given water's waves.
 */

import { BLUE_WASH } from "../../color/colors.ts";
import { INK, SHADED } from "../../color/palette.ts";
import { COL_ERROR } from "../../color/roles.ts";
import { glyphFont } from "../draw.ts";
import { drawPiecePart, JOINED_OPEN } from "../piece.ts";
import type { Painter } from "./painter.ts";

/** Water: the sea's wash, waves on a square the puzzle gave. */
export const sea: Painter = {
  colors: () => [BLUE_WASH, INK],
  surface: 0,
  paint() {},
  given(dr, { x, y, w: ts }, slot) {
    for (const frac of [0.42, 0.58])
      dr.drawText(
        { x: x + ts / 2, y: y + ts * frac },
        glyphFont((ts / 2) | 0),
        slot[1],
        "~",
      );
  },
};

/** A boat's segment: one hull with round ends, so a boat of one is a disc and
 * a longer one's bow and stern are its rounded ends. No divider: its squares
 * are counted by the grid lines beside it. Where the board does not yet say
 * which way it runs, a small square. */
export const hull: Painter = {
  colors: () => [SHADED],
  surface: null,
  dark: true,
  runs: true,
  paint(dr, tile, slot, error, _grown, _occupied, joined = 0) {
    const color = error ? COL_ERROR : slot[0];
    if (joined & JOINED_OPEN) {
      const r = (tile.w / 2 - tile.w / 10) * 0.7;
      const cx = tile.x + tile.w / 2;
      const cy = tile.y + tile.h / 2;
      dr.drawRect({ x: cx - r, y: cy - r, w: 2 * r, h: 2 * r }, color);
      return;
    }
    // One pixel past the tile, clipped to it, as a polygon's edge spills
    // half a pixel.
    drawPiecePart(dr, { ...tile, w: tile.w + 1, h: tile.h + 1 }, joined, color, {
      ends: "round",
      divider: null,
      reach: tile,
    });
  },
};
