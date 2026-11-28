/** The row of counts beneath the board (`play.counts`): each record its
 * value's piece and its count, the count red where the rules break it. */

import { COL_BACKGROUND, COL_ERROR } from "../../../color/roles.ts";
import { glyphFont } from "../../../render/draw.ts";
import { countBoxes, countRecords, countsAcross } from "../../counts.ts";
import { COL_INK } from "../palette.ts";
import type { FillSite } from "./site.ts";

export const counts: FillSite = {
  on: (cx) => cx.counted !== null,
  paint({ dr, ds, cx, lay, state: b, ui, errors }) {
    const counted = cx.counted;
    if (counted === null) return;
    const records = countRecords(b, counted);
    const { countErrors } = errors;
    // A board of numbers draws a record's piece where its values are drawn
    // as pictures, and its glyph otherwise.
    const pieces = !cx.typed || cx.pictured(ui);
    const key = `${pieces}|${records
      .map((r, i) => `${r.value}:${r.count}:${countErrors.has(i) ? 1 : 0}`)
      .join(",")}`;
    if (ds.counts.shown === key) return;
    ds.counts.shown = key;
    const ts = ds.tileSize;
    const { x, y } = cx.metrics.beneathAt(ts, lay.f.depth, b.h);
    const area = { x, y, w: Math.ceil(countsAcross(records.length) * ts), h: ts };
    dr.drawRect(area, COL_BACKGROUND);
    const glyph = cx.glyphOf(b);
    for (const [i, r] of records.entries()) {
      const { piece, count } = countBoxes(x, y, i, ts);
      const placed = pieces ? cx.pal.byValue.get(r.value) : undefined;
      if (placed !== undefined) placed.painter.paint(dr, piece, placed.slot, false);
      else
        dr.drawText(
          { x: piece.x + Math.floor(ts / 2), y: piece.y + Math.floor(ts / 2) },
          glyphFont(Math.floor((ts * 3) / 5)),
          COL_INK,
          glyph(r.value),
        );
      dr.drawText(
        { x: count.x + Math.floor(ts / 2), y: count.y + Math.floor(ts / 2) },
        glyphFont(Math.floor((ts * 3) / 5)),
        countErrors.has(i) ? COL_ERROR : COL_INK,
        String(r.count),
      );
    }
    dr.drawUpdate(area);
  },
};
