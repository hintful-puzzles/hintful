/**
 * On a board with a band of every value (`band.ts`) and gaps between its
 * squares, each open square's badge: a ring in the gap above its top left,
 * filled while the square is in focus, the band then showing what its notes
 * rule out. It sits left of a gap's clue, which is drawn at the gap's middle,
 * and is the square's own, as no corner of four squares would be. A board
 * without gaps has no room above a square, and draws none.
 */

import { COL_BACKGROUND } from "../../../color/roles.ts";
import type { Point, Rect } from "../../../contract/types.ts";
import { spaceOf } from "../../board.ts";
import type { Layout } from "../geometry.ts";
import { COL_INK } from "../palette.ts";
import type { FillSite } from "./site.ts";

/** Where square `(x, y)`'s badge lies at tile size `ts`: its middle, its
 * radius, and the box a press on it lands in, the gap above the square's
 * left part, short of the gap's middle. */
export function badgeOf(
  lay: Layout,
  ts: number,
  x: number,
  y: number,
  h: number,
): { readonly at: Point; readonly r: number; readonly hit: Rect } {
  const g = lay.m.gapOf(ts);
  const left = lay.cellX(x, y, h, ts);
  const top = lay.coord(y, ts);
  const r = Math.max(3, Math.floor(ts * 0.15));
  return {
    at: { x: left + Math.floor(ts / 5), y: top - Math.floor(g / 2) },
    r,
    hit: {
      x: left - Math.floor(g / 2),
      y: top - g,
      w: Math.floor(g / 2 + ts * 0.4),
      h: g,
    },
  };
}

/** Whether the board draws badges: a band, and gaps to draw them in. */
export const badged = (cx: { banded: boolean; gapped: boolean }): boolean =>
  cx.banded && cx.gapped;

export const badges: FillSite = {
  on: badged,
  paint({ dr, ds, cx, lay, state: b, ui }) {
    const ts = ds.tileSize;
    const sp = spaceOf(cx.module, b);
    for (let c = 0; c < b.w * b.h; c++) {
      const x = c % b.w;
      const y = Math.floor(c / b.w);
      const shown = b.fixed[c] ? 0 : ui.focus === c ? 2 : 1;
      // The gap above is cleared whenever its clue is drawn again, so what it
      // shows is in the badge's key.
      const above = y === 0 ? -1 : ds.gaps.shown(sp.edgeOf(c - b.w, c));
      if (!ds.badges.changed(c, shown, above)) continue;
      const { at, r } = badgeOf(lay, ts, x, y, b.h);
      const box = { x: at.x - r - 1, y: at.y - r - 1, w: 2 * r + 3, h: 2 * r + 3 };
      dr.drawRect(box, COL_BACKGROUND);
      // Idle, a gray ring that stays out of the board's way; in focus, ink.
      if (shown === 1) dr.drawCircle(at, r, COL_BACKGROUND, cx.pal.COL_DONE);
      if (shown === 2) dr.drawCircle(at, r, COL_INK, COL_INK);
      dr.drawUpdate(box);
    }
  },
};
