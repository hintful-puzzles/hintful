/**
 * Each line's clues one a value, in the margin before its start, a tile a
 * value (`value-margin.ts`): red where the rules break it, gray where the
 * player marks it done, hatched where a step stripes its line, and
 * outlined where a step reads it. The headings are the frame's
 * (`frame.ts`).
 */

import { COL_BACKGROUND, COL_ERROR, COL_HINT_OUTLINE } from "../../../color/roles.ts";
import { CELL } from "../../../contract/hint-words.ts";
import { drawThickRectOutline, glyphFont } from "../../../render/draw.ts";
import { hatchPeriod } from "../../../render/hatch.ts";
import { perPlace } from "../../../solve/describe-runtime.ts";
import { isDone } from "../../done.ts";
import { marginClueAt, marginPlaceAt, marginPoint } from "../../value-margin.ts";
import { COL_INK } from "../palette.ts";
import type { FillSite } from "./site.ts";

export const valueMargins: FillSite = {
  on: (cx) => cx.margined,
  paint({ dr, ds, cx, lay, state: b, errors, hint }) {
    const { marginErrors } = errors;
    const { stripedLine, marks } = hint;
    const { coord } = lay;
    const ts = ds.tileSize;
    const { w, h } = b;
    const values = cx.marginValues(b);
    // A step names a clue by the square it lies in, off the grid.
    const outlined = new Set(
      marks.of("outline", CELL).map((c) => marginPlaceAt(w, h, values, c.x, c.y)),
    );
    for (let line = 0; line < w + h; line++)
      for (let v = 1; v <= values; v++) {
        const place = perPlace(line, v);
        const clue = marginClueAt(cx.valueMargins, b, place);
        const err = marginErrors.has(place);
        const done = clue !== null && isDone(b, clue.kind, clue.k);
        const key =
          (err ? 1 : 0) |
          (stripedLine === line ? 2 : 0) |
          (done ? 4 : 0) |
          (outlined.has(place) ? 8 : 0);
        if (!ds.margins.changed(place, key)) continue;
        const p = marginPoint(h, values, place);
        const box = { x: coord(p.x, ts), y: coord(p.y, ts), w: ts, h: ts };
        dr.drawRect(box, COL_BACKGROUND);
        if (key & 2) dr.drawHatch(box, hatchPeriod(ts));
        if (clue !== null)
          dr.drawText(
            { x: box.x + Math.floor(ts / 2), y: box.y + Math.floor(ts / 2) },
            glyphFont(Math.floor(ts / 2)),
            err ? COL_ERROR : done ? cx.pal.COL_DONE : COL_INK,
            String(clue.v),
          );
        if (key & 8) {
          const thick = Math.max(2, Math.floor(ts / 16));
          drawThickRectOutline(dr, box.x, box.y, ts, ts, thick, COL_HINT_OUTLINE);
        }
        dr.drawUpdate(box);
      }
  },
};
