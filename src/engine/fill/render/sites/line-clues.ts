/** Each line's clue past its end, red where its line breaks it and hatched
 * where a step stripes its line. */

import { COL_BACKGROUND, COL_ERROR } from "../../../color/roles.ts";
import { hatchPeriod } from "../../../render/hatch.ts";
import { clueAt } from "../../../solve/describe-runtime.ts";
import { type Clues, type FillBoard, listOf } from "../../board.ts";
import { COL_INK } from "../palette.ts";
import type { FillSite } from "./site.ts";

/** The clue of line `k`, the first of the line clue kinds it has, or
 * `-1`. */
const lineClue = <C extends Clues<C>>(
  lineClues: readonly (keyof C)[],
  b: FillBoard<C>,
  k: number,
): number => {
  for (const kind of lineClues) {
    const v = clueAt(listOf(b.dealt, kind), k);
    if (v >= 0) return v;
  }
  return -1;
};

export const lineClues: FillSite = {
  on: (cx) => cx.lineClues.length > 0,
  paint({ dr, ds, cx, lay, state, errors, hint }) {
    const { lineErrors } = errors;
    const { stripedLine } = hint;
    const { coord } = lay;
    const ts = ds.tileSize;
    const { w, h } = state;
    const end = lay.m.end(ts);
    const size = Math.floor(ts / 2);
    for (let k = 0; k < w + h; k++) {
      const v = lineClue(cx.lineClues, state, k);
      const hatched = stripedLine === k;
      const err = lineErrors.has(k);
      const key = (err ? 1 : 0) | (hatched ? 2 : 0);
      if (!ds.clues.changed(k, key)) continue;
      const row = k < h;
      const box = row
        ? { x: coord(w, ts) + 1, y: coord(k, ts), w: end - 1, h: ts }
        : { x: coord(k - h, ts), y: coord(h, ts) + 1, w: ts, h: end - 1 };
      dr.drawRect(box, COL_BACKGROUND);
      if (hatched) dr.drawHatch(box, hatchPeriod(ts));
      if (v >= 0)
        dr.drawText(
          row
            ? { x: coord(w + 1, ts), y: coord(k, ts) + Math.floor(ts / 2) }
            : { x: coord(k - h, ts) + Math.floor(ts / 2), y: coord(h + 1, ts) },
          {
            align: row ? "right" : "center",
            baseline: row ? "mathematical" : "alphabetic",
            fontType: "variable",
            size,
          },
          err ? COL_ERROR : COL_INK,
          String(v),
        );
      dr.drawUpdate(box);
    }
  },
};
