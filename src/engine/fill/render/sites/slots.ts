/**
 * Each slot's clue, in the margin beyond its line's end: red where the rules
 * break it, gray where the player marks it done, hatched where a step
 * stripes its line, and outlined where a step reasons from it. The raised
 * values of the top row and right column reach in over it.
 */

import { COL_BACKGROUND, COL_ERROR, COL_HINT_OUTLINE } from "../../../color/roles.ts";
import { CELL } from "../../../contract/hint-words.ts";
import { drawThickRectOutline, glyphFont } from "../../../render/draw.ts";
import { hatchPeriod } from "../../../render/hatch.ts";
import { spaceOf } from "../../board.ts";
import { isDone } from "../../done.ts";
import { slotAt, slotClueAt, slotPoint } from "../../slots.ts";
import { COL_GRID, COL_INK } from "../palette.ts";
import { paintRaised } from "../three-d.ts";
import type { FillSite } from "./site.ts";

export const slots: FillSite = {
  on: (cx) => cx.slotted,
  paint({ dr, ds, cx, lay, state: b, errors, hint, raisedInto }) {
    const { slotErrors } = errors;
    const { stripedLine, marks } = hint;
    const { coord } = lay;
    const ts = ds.tileSize;
    const { w, h } = b;
    const sp = spaceOf(cx.module, b);
    // A step names a slot by the square it lies in, off the grid.
    const outlined = new Set(
      marks.of("outline", CELL).map((c) => slotAt(w, h, c.x, c.y)),
    );
    for (const s of sp.slots) {
      const clue = slotClueAt(cx.slotClues, b, s);
      const p = slotPoint(w, h, s);
      // The slot's line, as `stripedLine` numbers it: the rows, then the
      // columns.
      const line = p.y >= 0 && p.y < h ? p.y : h + p.x;
      const err = slotErrors.has(s);
      const done = clue !== null && isDone(b, clue.kind, clue.k);
      const key =
        (err ? 1 : 0) |
        (stripedLine === line ? 2 : 0) |
        (done ? 4 : 0) |
        (outlined.has(s) ? 8 : 0);
      if (!ds.slots.changed(s, key)) continue;
      const box = { x: coord(p.x, ts), y: coord(p.y, ts), w: ts, h: ts };
      dr.drawRect(box, COL_BACKGROUND);
      if (key & 2) dr.drawHatch(box, hatchPeriod(ts));
      // The grid's frame runs down the first column of a slot right of the
      // board and along the first row of one below it.
      const frame = ds.parts === null ? COL_GRID : cx.pal.COL_WALL;
      if (p.x === w) dr.drawRect({ x: box.x, y: box.y, w: 1, h: ts }, frame);
      if (p.y === h) dr.drawRect({ x: box.x, y: box.y, w: ts, h: 1 }, frame);
      if (clue !== null)
        dr.drawText(
          { x: box.x + Math.floor(ts / 2), y: box.y + Math.floor(ts / 2) },
          glyphFont(Math.floor(ts / 2)),
          err ? COL_ERROR : done ? cx.pal.COL_DONE : COL_INK,
          cx.glyphClues.includes(clue.kind) ? cx.glyphOf(b)(clue.v) : String(clue.v),
        );
      if (key & 8) {
        const thick = Math.max(2, Math.floor(ts / 16));
        drawThickRectOutline(dr, box.x, box.y, ts, ts, thick, COL_HINT_OUTLINE);
      }
      const raised = raisedInto(p.x, p.y);
      if (raised.length > 0) {
        dr.clip(box);
        for (const r of raised)
          paintRaised(cx, lay.f.top, dr, r.tile, r, cx.glyphOf(b));
        dr.unclip();
      }
      dr.drawUpdate(box);
    }
  },
};
