/** The row of counts beneath the board (`play.counts`): each record its
 * value's piece and its count, read in the player's style, the count red
 * where the rules break it and gray where its value is all placed. */

import { COL_BACKGROUND, COL_ERROR } from "../../../color/roles.ts";
import { glyphFont } from "../../../render/draw.ts";
import {
  countBoxes,
  countRecords,
  countStyleOf,
  countsAcross,
  countsLayout,
  countText,
} from "../../counts.ts";
import { COL_INK } from "../palette.ts";
import type { FillSite } from "./site.ts";

export const counts: FillSite = {
  on: (cx) => cx.counted !== null,
  paint({ dr, ds, cx, lay, state: b, ui, errors }) {
    const counted = cx.counted;
    if (counted === null) return;
    const records = countRecords(b, counted);
    const { recordErrors: countErrors } = errors;
    // A board of numbers draws a record's piece where its values are drawn
    // as pictures, and its glyph otherwise.
    const pieces = !cx.typed || cx.pictured(ui);
    const style = countStyleOf(cx.play, ui);
    const texts = records.map((r) => countText(style, r));
    const key = `${pieces}|${style}|${records
      .map((r, i) => `${r.value}:${texts[i]}:${countErrors.has(i) ? 1 : 0}`)
      .join(",")}`;
    if (ds.counts.shown === key) return;
    ds.counts.shown = key;
    const ts = ds.tileSize;
    const { x, y } = cx.metrics.beneathAt(ts, lay.f.depth, b.h);
    const across = countsAcross(b.w);
    const area = { x, y, w: Math.ceil(across * ts), h: ts };
    dr.drawRect(area, COL_BACKGROUND);
    const row = countsLayout(records, across);
    const font = Math.max(1, Math.floor(row.font(style) * ts));
    const glyph = cx.glyphOf(b);
    // The palette has a done gray on a board of numbers alone.
    const done = cx.typed ? cx.pal.COL_DONE : COL_INK;
    for (const [i, r] of records.entries()) {
      const { piece, count } = countBoxes(row, x, y, i, ts);
      const placed = pieces ? cx.pal.byValue.get(r.value) : undefined;
      if (placed !== undefined) placed.painter.paint(dr, piece, placed.slot, false);
      else
        dr.drawText(
          {
            x: piece.x + Math.floor(piece.w / 2),
            y: piece.y + Math.floor(piece.h / 2),
          },
          glyphFont(Math.floor((piece.h * 3) / 4)),
          COL_INK,
          glyph(r.value),
        );
      dr.drawText(
        { x: count.x, y: count.y + Math.floor(ts / 2) },
        { ...glyphFont(font), align: "left" },
        countErrors.has(i) ? COL_ERROR : r.placed === r.count ? done : COL_INK,
        texts[i],
      );
    }
    dr.drawUpdate(area);
  },
};
