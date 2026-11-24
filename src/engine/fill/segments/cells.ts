/** The `cells` segment: a clue on every cell, each one character of the desc
 * alphabet. */

import { DESC_OUT_OF_RANGE } from "../../contract/desc-error.ts";
import { c2n, n2c } from "../../game-id/desc-alphabet.ts";
import { clueList } from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import { type Decoding, maxOf, type SegmentKind } from "./segment.ts";

export type CellsSegment = { readonly cells: string };

export const cells: SegmentKind<CellsSegment> = {
  encode(seg, { sp, listOf }) {
    const list = listOf(seg.cells);
    let out = "";
    for (const c of sp.cells) out += n2c(list.valueAt[c]);
    return out;
  },
  decode<C extends Clues<C>>(
    seg: CellsSegment,
    { r, deal, sp, clueMax, out }: Decoding<C>,
  ) {
    const kind = seg.cells as keyof C;
    const least = deal.least?.[seg.cells] ?? 0;
    const v = sp.cells.map((c) => {
      const n = c2n(r.char((ch) => c2n(ch) !== null)) ?? -1;
      if (n < least || n > maxOf(clueMax, kind, sp, c)) r.fail(DESC_OUT_OF_RANGE);
      return n;
    });
    out[kind] = clueList(sp.cells, v, sp.cells.length);
  },
};
