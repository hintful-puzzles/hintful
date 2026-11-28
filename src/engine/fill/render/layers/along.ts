/**
 * The washes of a board typed along its list's sites (`play.along`): the
 * sites through the selection, the row's and the column's each its own
 * color, under the player's preference; and a held record's sites, where it
 * is read already that one, else every one it still fits, its values
 * previewed where one alone does. A shown hint owns the board's coloring,
 * so none is washed under it.
 */

import {
  fitsAlong,
  NONE_HELD,
  readSites,
  type Site,
  sitesOf,
  siteThrough,
} from "../../along.ts";
import type { Clues, FillBoard } from "../../board.ts";
import type { FillUi } from "../../play.ts";
import { listRecords } from "../../record-list.ts";
import type { FillSetup } from "../setup.ts";
import { ALONG_COLUMN, ALONG_ROW } from "../tile-word.ts";

/** Each cell's wash bits, and the value previewed on it, 0 where none. */
export interface AlongWords {
  readonly line: Int32Array;
  readonly preview: Int32Array;
}

export function alongOf<C extends Clues<C>>(
  cx: FillSetup<C>,
  b: FillBoard<C>,
  ui: FillUi,
  hinted: boolean,
): AlongWords {
  const n = b.w * b.h;
  const line = new Int32Array(n);
  const preview = new Int32Array(n);
  const kind = cx.listed;
  if (cx.play.along === undefined || kind === null || hinted) return { line, preview };
  const s = sitesOf(cx.module, b);
  const wash = (site: Site) => {
    // The row's wash is drawn where two cross.
    for (const c of site.cells)
      if ((line[c] & ALONG_ROW) === 0)
        line[c] = site.way === "row" ? ALONG_ROW : ALONG_COLUMN;
  };
  const { cursor } = ui;
  if (ui.runWash !== false && cursor.visible) {
    const c = cursor.y * b.w + cursor.x;
    for (const at of [siteThrough(s, c, "row"), siteThrough(s, c, "column")])
      if (at >= 0) wash(s.all[at]);
  }
  const held = ui.held ?? NONE_HELD;
  if (held === NONE_HELD) return { line, preview };
  const records = listRecords(b, kind);
  const read = readSites(b, s, records);
  // A record read already shows where; one still to place every site it
  // fits, its values written in only where one alone does: in two, it would
  // read as the board placing it in both, and two that cross would put two
  // values in one cell.
  const fitting =
    read[held] >= 0
      ? [read[held]]
      : s.all.flatMap((_, at) =>
          fitsAlong(b, s, records, read, at, held) ? [at] : [],
        );
  for (const at of fitting) wash(s.all[at]);
  if (fitting.length === 1 && read[held] < 0)
    s.all[fitting[0]].cells.forEach((c, k) => {
      if (b.values[c] === 0) preview[c] = records[held][k];
    });
  return { line, preview };
}
