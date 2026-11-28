/** The `numbers` segment: a kind's values, the first after `before` and the
 * rest after commas (or `between`), in the space's order or the columns
 * first; a kind one a value, each element's values in turn; a clue at the
 * board, each record the deal may hold in turn, its last field. */

import { isDigit } from "../../game-id/decimal.ts";
import { clueList } from "../../solve/describe-runtime.ts";
import type { Clues, FieldClue } from "../board.ts";
import { type FillDeal, recordsOf } from "../game-id.ts";
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

/** The values a clue at the board is written as: by each record the deal may
 * hold, in turn, the last field of the one dealt, or `-1`. */
function recordValues(deal: FillDeal, kind: string, clue: FieldClue): number[] {
  const { fields, keys } = recordsOf(deal, kind);
  const field = (f: number): readonly number[] => clue[fields[f]] as readonly number[];
  return keys.map((key) => {
    for (let i = 0; i < clue.n; i++)
      if (key.every((v, f) => field(f)[i] === v)) return field(fields.length - 1)[i];
    return -1;
  });
}

/** The records of a clue at the board read back: each the deal may hold whose
 * value `vs` gives, by its index among them. */
function recordsRead(
  deal: FillDeal,
  kind: string,
  read: readonly (readonly [number, number])[],
): FieldClue {
  const { fields, keys } = recordsOf(deal, kind);
  return Object.fromEntries([
    ["n", read.length],
    ...fields.map((f, i) => [
      f,
      read.map(([k, v]) => (i < fields.length - 1 ? keys[k][i] : v)),
    ]),
  ]) as FieldClue;
}

export const numbers: SegmentKind<NumbersSegment> = {
  encode(seg, { deal, sp, dealt, listOf, values }) {
    const vs =
      deal.universes[seg.numbers] === "board"
        ? recordValues(
            deal,
            seg.numbers,
            dealt[seg.numbers as keyof typeof dealt] as FieldClue,
          )
        : placesOf(deal, sp, seg.numbers, values, seg.order).map(
            (e) => listOf(seg.numbers).valueAt[e],
          );
    let out = "";
    vs.forEach((v, i) => {
      if (i === 0) out += seg.before ?? "";
      else if (seg.closed !== true) out += seg.between ?? ",";
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
    const board = deal.universes[seg.numbers] === "board";
    const places = board
      ? recordsOf(deal, seg.numbers).keys.map((_, k) => k)
      : placesOf(deal, sp, seg.numbers, values, seg.order);
    const read: [number, number][] = [];
    places.forEach((e, i) => {
      if (i === 0) {
        if (seg.before !== undefined) r.expect(seg.before);
      } else if (seg.closed !== true) r.expect(seg.between ?? ",");
      // An absent clue is written as `hidden`, or as nothing.
      if (seg.hidden !== undefined && r.accept(seg.hidden)) {
        if (seg.closed === true) r.expect(",");
        return;
      }
      if (seg.hidden === undefined && !r.peekIs(isDigit)) return;
      read.push([
        e,
        r.int(
          deal.least?.[seg.numbers] ?? 0,
          maxOf(clueMax, kind, sp, board ? 0 : elementOf(deal, seg.numbers, e)),
        ),
      ]);
      if (seg.closed === true) r.expect(",");
    });
    if (board) {
      out[kind] = recordsRead(deal, seg.numbers, read);
      return;
    }
    // The elements in the space's order, as a list is held.
    read.sort((a, b) => a[0] - b[0]);
    out[kind] = clueList(
      read.map(([e]) => e),
      read.map(([, x]) => x),
      placeCount(deal, sp, seg.numbers),
    );
  },
};
