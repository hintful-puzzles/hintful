/**
 * Each corner's clue, on a disc a third of a tile across where its four
 * cells meet, its rim and text red where it breaks. A disc lies over its
 * four tiles and the hint's marks on them, so it is drawn after both:
 * where its own look moved, where a tile under it repainted, or where a
 * mark, drawn every frame, lies on a cell under it.
 */

import { COL_ERROR } from "../../../color/roles.ts";
import { glyphFont } from "../../../render/draw.ts";
import { spaceOf } from "../../board.ts";
import { cornerCell, cornerClueAt, cornerRange, signedText } from "../../corners.ts";
import { COL_INK } from "../palette.ts";
import type { FillSite } from "./site.ts";

export const corners: FillSite = {
  on: (cx) => cx.cornered,
  paint({ dr, ds, cx, lay, state: b, errors, tiles }) {
    const broken = errors.cornerErrors;
    const { cornerKinds, module, play } = cx;
    const ts = ds.tileSize;
    const { w } = b;
    const sp = spaceOf(module, b);
    const r = Math.floor(ts / 3);
    for (const k of sp.corners) {
      const clue = cornerClueAt(cornerKinds, b, k);
      const err = broken.has(k);
      const key =
        clue === null
          ? 0
          : 1 | (err ? 2 : 0) | (cornerKinds.indexOf(clue.kind) << 2) | (clue.v << 8);
      const under = sp.cornerCells[k].map((c) => tiles[c]);
      const touched = under.some((t) => t !== null && (t.changed || t.hk !== 0));
      if (!ds.corners.changed(k, key) && !touched) continue;
      if (clue === null) continue;
      const { x, y } = cornerCell(w, k);
      const at = { x: lay.coord(x + 1, ts), y: lay.coord(y + 1, ts) };
      const ink = err ? COL_ERROR : COL_INK;
      dr.drawCircle(at, r, cx.pal.COL_GIVEN, ink);
      const { deal, clueMax } = module;
      if (deal === undefined || clueMax === undefined)
        throw new Error("render: a clue at a corner on a board dealt by no deal");
      const [least, most] = cornerRange(deal, clueMax, clue.kind, sp, b.dealt);
      const text = signedText(play.signs?.[clue.kind] ?? null, clue.v, least, most);
      dr.drawText(at, glyphFont(r), ink, text);
      dr.drawUpdate({ x: at.x - r, y: at.y - r, w: 2 * r + 1, h: 2 * r + 1 });
    }
  },
};
