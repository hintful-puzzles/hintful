/** Each line's fixed label (`labels:`) before its start: the label of the
 * line drawn at its place, which a display order moves (`order.ts`). */

import { COL_BACKGROUND } from "../../../color/roles.ts";
import { shownLine } from "../../order.ts";
import { COL_LABEL } from "../palette.ts";
import type { FillSite } from "./site.ts";

export const labels: FillSite = {
  on: (cx) => cx.labelStart !== null,
  paint({ dr, ds, cx, lay, state }) {
    const { labelStart } = cx;
    if (labelStart === null) return;
    const ts = ds.tileSize;
    const { w, h } = state;
    const font = {
      align: "center",
      baseline: "mathematical",
      fontType: "variable",
      size: Math.floor((ts * 2) / 5),
    } as const;
    const start = lay.start(ts);
    const at = start - Math.floor(ts / 2);
    // Rows first, then columns, each keyed by the line its place shows.
    for (let k = 0; k < h + w; k++) {
      const row = k < h;
      const place = row ? k : k - h;
      const line = shownLine(state, place);
      if (!ds.labels.changed(k, line + 1)) continue;
      const mid = lay.coord(place, ts) + Math.floor(ts / 2);
      const box = row
        ? { x: start - ts, y: lay.coord(place, ts), w: ts, h: ts }
        : { x: lay.coord(place, ts), y: start - ts, w: ts, h: ts };
      dr.drawRect(box, COL_BACKGROUND);
      dr.drawText(
        row ? { x: at, y: mid } : { x: mid, y: at },
        font,
        COL_LABEL,
        labelStart(state, line),
      );
      dr.drawUpdate(box);
    }
  },
};
