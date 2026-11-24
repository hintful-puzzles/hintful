/** The pencil-mode indicator, at the top right of a board that keeps
 * notes. */

import {
  pencilIndicatorBox,
  repaintPencilIndicator,
} from "../../../render/pencil-indicator.ts";
import type { FillSite } from "./site.ts";

export const pencil: FillSite = {
  on: (cx) => cx.notes,
  paint({ dr, ds, cx, state: b, ui }) {
    const ts = ds.tileSize;
    const { tallied } = cx;
    const counts =
      tallied === null ? null : cx.tallyCounts(b, tallied.kind, tallied.count);
    repaintPencilIndicator(
      dr,
      ds,
      ui.pencilMode === true,
      pencilIndicatorBox(cx.metrics.canvasOf(b, counts, ts), ts),
      cx.pal.PENCIL_STYLE,
    );
  },
};
