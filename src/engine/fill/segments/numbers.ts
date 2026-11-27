/** The `numbers` segment: a kind's values, the first after `before` and the
 * rest after commas (or `between`), in the space's order or the columns
 * first; a kind one a value, each element's values in turn. */

import { isDigit } from "../../game-id/decimal.ts";
import { clueList } from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import {
  type Decoding,
  elementOf,
  maxOf,
  placeCount,
  placesOf,
  type SegmentKind,
} from "./segment.ts";

export type NumbersSegment = {
  readonly numbers: string;
  readonly before?: string;
  /** What stands between two elements, where not a comma. */
  readonly between?: string;
  readonly order?: "columns";
  /** What an element without a clue is written as, where not nothing. */
  readonly hidden?: string;
  /** Whether a comma follows every element, the last too, rather than
   * standing between two. */
  readonly closed?: true;
};

export const numbers: SegmentKind<NumbersSegment> = {
  encode(seg, { deal, sp, listOf, values }) {
    const list = listOf(seg.numbers);
    let out = "";
    placesOf(deal, sp, seg.numbers, values, seg.order).forEach((e, i) => {
      if (i === 0) out += seg.before ?? "";
      else if (seg.closed !== true) out += seg.between ?? ",";
      const v = list.valueAt[e];
      out += v >= 0 ? String(v) : (seg.hidden ?? "");
      if (seg.closed === true) out += ",";
    });
    return out;
  },
  decode<C extends Clues<C>>(
    seg: NumbersSegment,
    { r, deal, sp, clueMax, out, values }: Decoding<C>,
  ) {
    const kind = seg.numbers as keyof C;
    const at: number[] = [];
    const v: number[] = [];
    placesOf(deal, sp, seg.numbers, values, seg.order).forEach((e, i) => {
      if (i === 0) {
        if (seg.before !== undefined) r.expect(seg.before);
      } else if (seg.closed !== true) r.expect(seg.between ?? ",");
      // An absent clue is written as `hidden`, or as nothing.
      if (seg.hidden !== undefined && r.accept(seg.hidden)) {
        if (seg.closed === true) r.expect(",");
        return;
      }
      if (seg.hidden === undefined && !r.peekIs(isDigit)) return;
      at.push(e);
      v.push(
        r.int(
          deal.least?.[seg.numbers] ?? 0,
          maxOf(clueMax, kind, sp, elementOf(deal, seg.numbers, e)),
        ),
      );
      if (seg.closed === true) r.expect(",");
    });
    // The elements in the space's order, as a list is held.
    const byAt = at.map((e, k) => [e, v[k]] as const).sort((a, b) => a[0] - b[0]);
    out[kind] = clueList(
      byAt.map(([e]) => e),
      byAt.map(([, x]) => x),
      placeCount(deal, sp, seg.numbers),
    );
  },
};
