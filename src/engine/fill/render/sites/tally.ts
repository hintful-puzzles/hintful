/** The board's tally of pieces (`deal.tally`) beneath it, as the piece whose
 * painter runs, where what it shows found has moved. */

import { COL_BACKGROUND, COL_ERROR } from "../../../color/roles.ts";
import { drawTally, tallyPlaced, wholePieces } from "../../tally-display.ts";
import { COL_INK, COL_LABEL } from "../palette.ts";
import type { FillSite } from "./site.ts";

export const tally: FillSite = {
  on: (cx) => cx.tallied !== null,
  paint({ dr, ds, cx, lay, shown: b }) {
    const t = cx.tallied;
    if (t === null) return;
    const counts = cx.tallyCounts(b, t.kind, t.count);
    const full = tallyPlaced(b.values, t.value, counts);
    const found = wholePieces(b.values, b.w, b.h, t.value, counts.length, full);
    const key = found.join(",");
    if (ds.tally.shown === key) return;
    ds.tally.shown = key;
    const ts = ds.tileSize;
    drawTally(
      dr,
      ts,
      { x: lay.coord(0, ts), y: lay.coord(b.h, ts) + ts, w: b.w },
      counts,
      found,
      t.piece.painter,
      {
        piece: t.piece.slot,
        found: COL_LABEL,
        strike: COL_INK,
        over: COL_ERROR,
        background: COL_BACKGROUND,
      },
    );
  },
};
