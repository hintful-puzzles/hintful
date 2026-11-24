/** The hint's rings and outlines (`hint.ts`), over every tile and every
 * frame: `HintMarks.paint` always draws. */

import type { FillSite } from "./site.ts";

export const hintRings: FillSite = {
  on: () => true,
  paint({ dr, ds, hint }) {
    ds.marks.paint(dr, hint.unlinked, hint.area, hint.markStyle);
  },
};
