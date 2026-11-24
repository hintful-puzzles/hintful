/** Each gap's clue (`play.gaps`), where it has moved: in ink, red where it
 * breaks, and else gray where the player marked it done. */

import { COL_BACKGROUND, COL_ERROR } from "../../../color/roles.ts";
import { spaceOf } from "../../board.ts";
import { isDone } from "../../done.ts";
import { gapClueAt } from "../../gaps.ts";
import { COL_INK } from "../palette.ts";
import type { FillSite } from "./site.ts";

export const gaps: FillSite = {
  on: (cx) => cx.gapped,
  paint({ dr, ds, cx, lay, state: b, errors }) {
    const broken = errors.gapErrors;
    const { coord } = lay;
    const ts = ds.tileSize;
    const g = lay.m.gapOf(ts);
    const sp = spaceOf(cx.module, b);
    for (const e of sp.edges) {
      const clue = gapClueAt(cx.gapKinds, b, sp, e);
      const err = broken.has(e);
      const done = clue !== null && isDone(b, clue.name, clue.k);
      const key =
        clue === null
          ? 0
          : 1 |
            (clue.kind << 1) |
            (clue.clue.toward << 8) |
            (err ? 1 << 10 : 0) |
            (done ? 1 << 11 : 0) |
            (clue.clue.value << 12);
      if (!ds.gaps.changed(e, key)) continue;
      const a = sp.edgeEnds[2 * e];
      const [x, y] = [a % b.w, Math.floor(a / b.w)];
      const right = sp.edgeEnds[2 * e + 1] === a + 1;
      // The gap past cell `a`, and inside it the part no cell's frame takes.
      const gap = right
        ? { x: coord(x, ts) + ts, y: coord(y, ts), w: g, h: ts }
        : { x: coord(x, ts), y: coord(y, ts) + ts, w: ts, h: g };
      const open = right
        ? { x: gap.x + 1, y: gap.y, w: g - 1, h: ts + 1 }
        : { x: gap.x, y: gap.y + 1, w: ts + 1, h: g - 1 };
      dr.clip(open);
      dr.drawRect(open, COL_BACKGROUND);
      clue?.painter.paint(
        dr,
        gap,
        clue.clue,
        err ? COL_ERROR : done ? cx.pal.COL_DONE : COL_INK,
        err,
      );
      dr.unclip();
      dr.drawUpdate(open);
    }
  },
};
