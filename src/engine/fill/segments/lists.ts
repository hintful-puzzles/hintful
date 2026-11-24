/** The `lists` segment: a list kind's lists, `.` within one and `/` between
 * two. */

import { isDigit } from "../../game-id/decimal.ts";
import { type ListClues, listAt, listClues } from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import {
  type Decoding,
  elements,
  maxOf,
  type SegmentKind,
  universeOf,
} from "./segment.ts";

export type ListsSegment = { readonly lists: string; readonly order?: "columns" };

export const lists: SegmentKind<ListsSegment> = {
  encode(seg, { deal, sp, dealt }) {
    const lists = dealt[seg.lists as keyof typeof dealt] as ListClues;
    return elements(sp, universeOf(deal, seg.lists), seg.order)
      .map((e) => Array.from(listAt(lists, e) ?? []).join("."))
      .join("/");
  },
  /** Every element's list, an empty one written as nothing, held in the
   * space's order. */
  decode<C extends Clues<C>>(
    seg: ListsSegment,
    { r, deal, sp, clueMax, out }: Decoding<C>,
  ) {
    const kind = seg.lists as keyof C;
    const universe = universeOf(deal, seg.lists);
    const least = deal.least?.[seg.lists] ?? 0;
    const read = elements(sp, universe, seg.order).map((e, i) => {
      if (i > 0) r.expect("/");
      const list: number[] = [];
      if (r.peekIs(isDigit))
        do list.push(r.int(least, maxOf(clueMax, kind, sp, e)));
        while (r.accept("."));
      return [e, list] as const;
    });
    read.sort((a, b) => a[0] - b[0]);
    out[kind] = listClues(
      read.map(([e]) => e),
      read.map(([, list]) => list),
      sp[universe].length,
    );
  },
};
