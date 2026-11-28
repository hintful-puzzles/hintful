/** The list beneath the board (`play.list`): each record its members'
 * glyphs, struck and gray once it holds of the board as placed, red where
 * the rules break it, and outlined or ringed where a step marks it. */

import { COL_BACKGROUND, COL_ERROR, COL_HINT_OUTLINE } from "../../../color/roles.ts";
import { CELL } from "../../../contract/hint-words.ts";
import type { DrawTextOptions } from "../../../contract/types.ts";
import { drawRectOutline } from "../../../render/draw.ts";
import { drawMarkSides, MARK_ALL } from "../../../render/hint-mark.ts";
import { textBox } from "../../../render/ring.ts";
import { NONE_HELD } from "../../along.ts";
import { spaceOf } from "../../board.ts";
import {
  LIST_HEIGHT,
  listPixels,
  listRecords,
  recordAt,
  recordTexts,
} from "../../record-list.ts";
import { COL_INK } from "../palette.ts";
import type { FillSite } from "./site.ts";

/** A record's state: struck, red, outlined, ringed, held (`play.along`). */
const STRUCK = 1;
const BROKEN = 2;
const OUTLINED = 4;
const RINGED = 8;
const HELD = 16;

export const recordList: FillSite = {
  on: (cx) => cx.listed !== null,
  paint({ dr, ds, cx, lay, state: b, ui, errors, hint }) {
    const kind = cx.listed;
    if (kind === null) return;
    const holds = cx.module.recordHolds;
    if (holds === undefined)
      throw new Error("play list: the module has no recordHolds");
    const records = listRecords(b, kind);
    const held = ui.held ?? NONE_HELD;
    const sp = spaceOf(cx.module, b);
    const marked = (role: "outline" | "ring"): ReadonlySet<number> =>
      new Set(hint.marks.of(role, CELL).map((p) => recordAt(b.h, p)));
    const outlined = marked("outline");
    const ringed = marked("ring");
    const states = records.map(
      (_, k) =>
        (errors.recordErrors.has(k)
          ? BROKEN
          : holds(b.values, sp, b.dealt, k)
            ? STRUCK
            : 0) |
        (outlined.has(k) ? OUTLINED : 0) |
        (ringed.has(k) ? RINGED : 0) |
        (k === held ? HELD : 0),
    );
    const key = states.join(",");
    if (ds.recordList.shown === key) return;
    ds.recordList.shown = key;
    const ts = ds.tileSize;
    const texts = recordTexts(b, kind, cx.glyphOf(b));
    const { x, y } = cx.metrics.beneathAt(ts, lay.f.depth, b.h);
    // A mark reaches past a record's text, the first column's into the
    // board's left margin.
    const reach = Math.floor(ts / 4);
    const area = {
      x: x - reach,
      y,
      w: b.w * ts + 2 * reach,
      h: Math.ceil(LIST_HEIGHT * ts),
    };
    dr.drawRect(area, COL_BACKGROUND);
    const { font, origins } = listPixels(texts, b.w, ts, x, y);
    const opts: DrawTextOptions = {
      align: "left",
      baseline: "alphabetic",
      fontType: "fixed",
      size: font,
    };
    const pad = Math.max(2, Math.round(font * 0.15));
    const thick = Math.max(2, Math.round(font / 8));
    // The ink of each record's state.
    const done = cx.typed ? cx.pal.COL_DONE : COL_INK;
    for (const [k, o] of origins.entries()) {
      const s = states[k];
      const box = {
        x: o.x - pad,
        y: Math.round(o.y - font * 0.85),
        w: o.w + 2 * pad,
        h: Math.round(font * 1.1),
      };
      if (s & OUTLINED)
        drawMarkSides(dr, { box, outer: thick, inner: 0 }, MARK_ALL, COL_HINT_OUTLINE);
      else if (s & RINGED) {
        const avoid = origins.flatMap((q, j) =>
          j === k ? [] : [textBox(q, opts, texts[j])],
        );
        dr.drawRing(box, { enclose: [textBox(o, opts, texts[k])], avoid }, thick, {
          room: area,
        });
      }
      const ink = s & BROKEN ? COL_ERROR : s & STRUCK ? done : COL_INK;
      dr.drawText(o, opts, ink, texts[k]);
      // A held record is boxed, its ink left saying what it is; a hint's
      // outline lies outside the box, so a record both shows both.
      if (s & HELD) drawRectOutline(dr, box.x, box.y, box.w, box.h, COL_INK);
      if (s & STRUCK) {
        const at = Math.round(o.y - font * 0.3);
        dr.drawLine(
          { x: o.x, y: at },
          { x: o.x + o.w, y: at },
          ink,
          Math.max(1, Math.round(font / 12)),
        );
      }
    }
    dr.drawUpdate(area);
  },
};
