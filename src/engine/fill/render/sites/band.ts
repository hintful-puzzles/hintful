/** The band of every value beneath the board (`play.band`): each value's
 * text, gray once a square holds it, red where more than one does. A placed
 * value is not struck, as a list's record is: a strike through a set's `_`
 * reads as another glyph, and the band's strike is what the square in focus
 * rules out. */

import { COL_BACKGROUND, COL_ERROR } from "../../../color/roles.ts";
import type { DrawTextOptions } from "../../../contract/types.ts";
import { bandText, bandValues, placedCounts } from "../../band.ts";
import { LIST_HEIGHT, listPixels } from "../../record-list.ts";
import { COL_INK } from "../palette.ts";
import type { FillSite } from "./site.ts";

/** A value's state: placed, red. */
const PLACED = 1;
const BROKEN = 2;

export const band: FillSite = {
  on: (cx) => cx.banded,
  paint({ dr, ds, cx, lay, state: b }) {
    const values = bandValues(cx.module, b);
    const states = placedCounts(b, values).map((n) =>
      n > 1 ? BROKEN : n === 1 ? PLACED : 0,
    );
    const key = states.join(",");
    if (ds.band.shown === key) return;
    ds.band.shown = key;
    const ts = ds.tileSize;
    const glyph = cx.glyphOf(b);
    const texts = values.map((v) => bandText(v, glyph, cx.features));
    const across = cx.metrics.spanTiles(b.w);
    const { x, y } = cx.metrics.beneathAt(ts, lay.f.depth, b.h);
    const area = { x, y, w: Math.ceil(across * ts), h: Math.ceil(LIST_HEIGHT * ts) };
    dr.drawRect(area, COL_BACKGROUND);
    const { font, origins } = listPixels(texts, across, ts, x, y);
    const opts: DrawTextOptions = {
      align: "left",
      baseline: "alphabetic",
      fontType: "fixed",
      size: font,
    };
    for (const [k, o] of origins.entries()) {
      const s = states[k];
      const ink = s & BROKEN ? COL_ERROR : s & PLACED ? cx.pal.COL_DONE : COL_INK;
      dr.drawText(o, opts, ink, texts[k]);
    }
    dr.drawUpdate(area);
  },
};
