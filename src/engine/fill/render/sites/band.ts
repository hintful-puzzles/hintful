/** The band of every value beneath the board (`play.band`): each value's
 * text, gray once a square holds it, red where more than one does, framed
 * where its squares are spotlit, and struck where the square in focus rules
 * it out. A placed value is not struck, as a
 * list's record is: a strike through a set's `_` reads as another glyph, and
 * the band's strike is what the square in focus rules out. */

import { COL_BACKGROUND, COL_ERROR, COL_HINT_OUTLINE } from "../../../color/roles.ts";
import type { DrawTextOptions } from "../../../contract/types.ts";
import { drawMarkSides, MARK_ALL } from "../../../render/hint-mark.ts";
import { canHold, placedCounts } from "../../band.ts";
import { COL_INK } from "../palette.ts";
import type { FillSite } from "./site.ts";

/** A value's state: placed, red, spotlit, ruled out of the square in
 * focus. */
const PLACED = 1;
const BROKEN = 2;
const SPOTLIT = 4;
const RULED = 8;

export const band: FillSite = {
  on: (cx) => cx.banded,
  paint({ dr, ds, cx, lay, state: b, ui }) {
    const ts = ds.tileSize;
    const { values, texts, area, pixels } = cx.bandOf(b, ts, lay.f.depth);
    const focus = ui.focus ?? -1;
    const open = focus >= 0 && b.values[focus] === 0;
    const states = placedCounts(b, values).map(
      (n, k) =>
        (n > 1 ? BROKEN : n === 1 ? PLACED : 0) |
        (values[k] === ui.spotlit ? SPOTLIT : 0) |
        (open && !canHold(b, focus, values[k]) ? RULED : 0),
    );
    const key = states.join(",");
    if (ds.band.shown === key) return;
    ds.band.shown = key;
    dr.drawRect(area, COL_BACKGROUND);
    const { font, origins } = pixels;
    const opts: DrawTextOptions = {
      align: "left",
      baseline: "alphabetic",
      fontType: "fixed",
      size: font,
    };
    const pad = Math.max(2, Math.round(font * 0.15));
    const thick = Math.max(2, Math.round(font / 8));
    for (const [k, o] of origins.entries()) {
      const s = states[k];
      // The value spotlit is framed in the second color, as a list's record
      // a hint reasons from is.
      if (s & SPOTLIT) {
        const box = {
          x: o.x - pad,
          y: Math.round(o.y - font * 0.85),
          w: o.w + 2 * pad,
          h: Math.round(font * 1.1),
        };
        drawMarkSides(dr, { box, outer: thick, inner: 0 }, MARK_ALL, COL_HINT_OUTLINE);
      }
      const ink = s & BROKEN ? COL_ERROR : s & PLACED ? cx.pal.COL_DONE : COL_INK;
      dr.drawText(o, opts, ink, texts[k]);
      // Struck through the letters' middle, in the player's ink: a mark
      // they made, as a note is.
      if (s & RULED) {
        const at = Math.round(o.y - font * 0.35);
        dr.drawLine(
          { x: o.x - pad, y: at },
          { x: o.x + o.w + pad, y: at },
          cx.pal.COL_ENTRY,
          Math.max(2, Math.round(font / 10)),
        );
      }
    }
    dr.drawUpdate(area);
  },
};
