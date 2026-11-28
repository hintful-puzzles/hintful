/** The `numbers` segment: a kind's values, the first after `before` and the
 * rest after commas (or `between`), in the space's order, the columns
 * first, or on slots side by side; a kind one a value, each element's values in turn; a clue at the
 * board, each record the deal may hold in turn, its last field; or where
 * the deal reads a record a binding, every record whole, which ends the
 * desc, since its count is the board's. */

import { DESC_OUT_OF_RANGE } from "../../contract/desc-error.ts";
import { isDigit } from "../../game-id/decimal.ts";
import { c2n, n2c } from "../../game-id/desc-alphabet.ts";
import type { DescReader } from "../../game-id/desc-reader.ts";
import { clueList, compareLists } from "../../solve/describe-runtime.ts";
import type { Clues, FieldClue } from "../board.ts";
import { type FillDeal, recordsOf } from "../game-id.ts";
import {
  type Decoding,
  elementOf,
  maxOf,
  placeCount,
  placesOf,
  runsOf,
  type SegmentKind,
  type Side,
} from "./segment.ts";

export type NumbersSegment = {
  readonly numbers: string;
  readonly before?: string;
  /** What stands between two elements, where not a comma. */
  readonly between?: string;
  readonly order?: "columns";
  /** On slots, the sides in the order written (upstream Undead's clockwise
   * from the top left). */
  readonly sides?: readonly Side[];
  /** What an element without a clue is written as, where not nothing. */
  readonly hidden?: string;
  /** Whether a comma follows every element, the last too, rather than
   * standing between two. */
  readonly closed?: true;
  /** Each value one character of the desc alphabet (`desc-alphabet.ts`),
   * an absent one `hidden`, a run's characters side by side: a line's kind
   * a run an axis, any other's one run. The runs stand between commas (or
   * `between`), or with `closed` a comma follows each. */
  readonly alphabet?: true;
  /** Where the kind is one a value, each value's runs in turn, rather than
   * each element's values in turn (upstream Magnets' + counts, then its −). */
  readonly byValue?: true;
};

/** `seg`'s runs of places on the space `sp` (`runsOf`). */
const runsOfSeg = (
  seg: NumbersSegment,
  deal: FillDeal,
  sp: Parameters<typeof runsOf>[1],
  values: number,
) => runsOf(deal, sp, seg.numbers, values, seg.byValue === true, seg.order, seg.sides);

/** The runs' values a character each (`NumbersSegment.alphabet`). */
function alphabetEncoded(
  seg: NumbersSegment,
  runs: readonly (readonly number[])[],
  valueAt: ArrayLike<number>,
): string {
  const hidden = seg.hidden ?? "";
  const written = runs.map((run) =>
    run.map((e) => (valueAt[e] >= 0 ? n2c(valueAt[e]) : hidden)).join(""),
  );
  return (
    (seg.before ?? "") +
    (seg.closed === true
      ? written.map((s) => `${s},`).join("")
      : written.join(seg.between ?? ","))
  );
}

/** The runs read back a character each, each value no more than its
 * element's most (`max`). */
function alphabetDecoded(
  r: DescReader,
  seg: NumbersSegment,
  runs: readonly (readonly number[])[],
  max: (place: number) => number,
): [number, number][] {
  if (seg.before !== undefined) r.expect(seg.before);
  const read: [number, number][] = [];
  runs.forEach((run, i) => {
    if (i > 0 && seg.closed !== true) r.expect(seg.between ?? ",");
    for (const e of run) {
      if (seg.hidden !== undefined && r.accept(seg.hidden)) continue;
      const n = c2n(r.char((ch) => c2n(ch) !== null));
      if (n === null || n > max(e)) r.fail(DESC_OUT_OF_RANGE);
      read.push([e, n as number]);
    }
    if (seg.closed === true) r.expect(",");
  });
  return read;
}

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

/** The records read a binding (`FillRecords.bound`), each written whole, a
 * digit a member, between commas (or `between`). */
function boundEncoded(seg: NumbersSegment, clue: FieldClue, field: string): string {
  const lists = clue[field] as unknown as readonly ArrayLike<number>[];
  return (
    (lists.length > 0 ? (seg.before ?? "") : "") +
    lists.map((l) => Array.from(l).join("")).join(seg.between ?? ",")
  );
}

/** The records read a binding read back, up to the segment's end: at least
 * one, each of one member or more, each a digit within the range the clue
 * gives. A desc lists them in any order, and they are held sorted, as the
 * deal deals them. */
function boundDecoded(
  r: DescReader,
  seg: NumbersSegment,
  field: string,
  { least, most }: { readonly least: number; readonly most: number },
): FieldClue {
  if (seg.before !== undefined) r.expect(seg.before);
  const lists: Int32Array[] = [];
  do {
    const members = [Number(r.char(isDigit))];
    while (r.peekIs(isDigit)) members.push(Number(r.char()));
    if (members.some((m) => m < least || m > most)) r.fail(DESC_OUT_OF_RANGE);
    lists.push(Int32Array.from(members));
  } while (r.accept(seg.between ?? ","));
  lists.sort(compareLists);
  return { n: lists.length, [field]: lists } as unknown as FieldClue;
}

export const numbers: SegmentKind<NumbersSegment> = {
  encode(seg, { deal, sp, dealt, listOf, values }) {
    const clue = dealt[seg.numbers as keyof typeof dealt] as FieldClue;
    const bound =
      deal.universes[seg.numbers] === "board" ? recordsOf(deal, seg.numbers) : null;
    if (bound?.bound !== undefined) return boundEncoded(seg, clue, bound.fields[0]);
    if (seg.alphabet === true)
      return alphabetEncoded(
        seg,
        runsOfSeg(seg, deal, sp, values),
        listOf(seg.numbers).valueAt,
      );
    const vs =
      bound !== null
        ? recordValues(deal, seg.numbers, clue)
        : placesOf(deal, sp, seg.numbers, values, seg.order, seg.sides).map(
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
    const records = board ? recordsOf(deal, seg.numbers) : null;
    if (records?.bound !== undefined) {
      out[kind] = boundDecoded(r, seg, records.fields[0], records.bound);
      return;
    }
    if (seg.alphabet === true) {
      const read = alphabetDecoded(r, seg, runsOfSeg(seg, deal, sp, values), (e) =>
        maxOf(clueMax, kind, sp, elementOf(deal, seg.numbers, e)),
      );
      read.sort((a, b) => a[0] - b[0]);
      out[kind] = clueList(
        read.map(([e]) => e),
        read.map(([, x]) => x),
        placeCount(deal, sp, seg.numbers),
      );
      return;
    }
    const places = board
      ? recordsOf(deal, seg.numbers).keys.map((_, k) => k)
      : placesOf(deal, sp, seg.numbers, values, seg.order, seg.sides);
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
