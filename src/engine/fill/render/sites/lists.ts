/**
 * Each line's list, before its start: a row's on one line, right against
 * the board, and a column's stacked upward from it, spread over the margin
 * where it is short (upstream pattern.c's `draw_numbers`). A list is red
 * where its line breaks it, striped with its line where a step stripes
 * that, and in the cursor's color where the cursor is on its line, so the
 * cursor's row and column are found from the margin.
 */

import { COL_BACKGROUND, COL_CURSOR, COL_ERROR } from "../../../color/roles.ts";
import { glyphFont } from "../../../render/draw.ts";
import { hatchPeriod } from "../../../render/hatch.ts";
import { type ListClues, listAt } from "../../../solve/describe-runtime.ts";
import type { Clues, FillBoard } from "../../board.ts";
import { COL_INK } from "../palette.ts";
import type { FillSite } from "./site.ts";

/** The list of line `k`, the first of the list kinds that has one: empty
 * where none does. */
const listOfLine = <C extends Clues<C>>(
  lineLists: readonly (keyof C)[],
  b: FillBoard<C>,
  k: number,
): ArrayLike<number> => {
  for (const kind of lineLists) {
    const l = listAt(b.dealt[kind] as ListClues, k);
    if (l !== null) return l;
  }
  return [];
};

export const lists: FillSite = {
  on: (cx) => cx.lineLists.length > 0,
  paint({ dr, ds, cx, lay, state: b, ui, errors, hint }) {
    const { lineErrors } = errors;
    const { stripedLine } = hint;
    const [cx0, cy0] = ui.cursor.visible ? [ui.cursor.x, ui.cursor.y] : [-1, -1];
    const { depth } = lay.f;
    const { coord } = lay;
    const ts = ds.tileSize;
    const { w, h } = b;
    const from = lay.start(ts);
    const half = Math.floor(ts / 2);
    // Upstream's font: smaller where a column's list has a number of two
    // digits, or a row's runs would not fit the margin at the larger size.
    let large = true;
    for (let k = 0; k < w + h; k++) {
      const list = listOfLine(cx.lineLists, b, k);
      if (k >= h && Array.from(list).some((n) => n >= 10)) large = false;
      if (k < h && list.length * 3 - 2 > depth * 2) large = false;
    }
    const size = Math.floor(ts / (large ? 1.6 : 2.2));
    for (let k = 0; k < w + h; k++) {
      const row = k < h;
      const err = lineErrors.has(k);
      const hatched = stripedLine === k;
      const cur = row ? k === cy0 : k - h === cx0;
      const color = err ? COL_ERROR : cur ? COL_CURSOR : COL_INK;
      const key = (err ? 1 : 0) | (hatched ? 2 : 0) | (cur ? 4 : 0) | (large ? 8 : 0);
      if (!ds.lists.changed(k, key)) continue;
      const box = row
        ? { x: 0, y: coord(k, ts), w: from, h: ts }
        : { x: coord(k - h, ts), y: 0, w: ts, h: from };
      dr.clip(box);
      dr.drawRect(box, COL_BACKGROUND);
      if (hatched) dr.drawHatch(box, hatchPeriod(ts));
      const list = Array.from(listOfLine(cx.lineLists, b, k));
      if (row && list.length > 0)
        dr.drawText(
          { x: from - Math.floor(ts / 4), y: box.y + half },
          { align: "right", baseline: "mathematical", fontType: "variable", size },
          color,
          list.join(list.length > depth ? " " : "  "),
        );
      else if (list.length > 0) {
        // The last run sits a tile above the board, the first as high as
        // the list's length and the margin allow.
        const bottom = from - Math.floor((ts * 3) / 4);
        const span = bottom - half;
        const fit = Math.max(list.length, depth) - 1;
        list.forEach((n, j) => {
          dr.drawText(
            {
              x: box.x + half,
              y: bottom - Math.floor(((list.length - 1 - j) * span) / Math.max(1, fit)),
            },
            glyphFont(size),
            color,
            String(n),
          );
        });
      }
      dr.unclip();
      dr.drawUpdate(box);
    }
  },
};
