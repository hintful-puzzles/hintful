/** The `parts` segment: a clue a part of a partition read before it. */

import {
  type ClueList,
  clueList,
  type Partition,
} from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import { type Decoding, maxOf, type SegmentKind } from "./segment.ts";

/** A clue a part of partition `parts`, in the order of the parts' first
 * cells: its kind's letter (`letters`, by letter), then its number. */
export type PartsSegment = {
  readonly parts: string;
  readonly before?: string;
  readonly letters: Readonly<Record<string, string>>;
};

/** A partition's parts in the order of their first cells, as a `parts`
 * segment writes them. */
const byFirstCell = (cells: readonly (readonly number[])[]): number[] =>
  cells.map((_, r) => r).sort((a, b) => cells[a][0] - cells[b][0]);

export const parts: SegmentKind<PartsSegment> = {
  encode(seg, { dealt, listOf }) {
    let out = seg.before ?? "";
    const { cells } = dealt[seg.parts as keyof typeof dealt] as Partition;
    const letters = Object.entries(seg.letters);
    for (const r of byFirstCell(cells)) {
      const written = letters.flatMap(([letter, kind]) => {
        const list: ClueList = listOf(kind);
        return list.byAt[r] >= 0 ? [`${letter}${list.v[list.byAt[r]]}`] : [];
      });
      // A part holds one clue, which the deal deals it.
      if (written.length !== 1)
        throw new Error(`id: part ${r} holds ${written.length} clues`);
      out += written[0];
    }
    return out;
  },
  decode<C extends Clues<C>>(
    seg: PartsSegment,
    { r, deal, sp, clueMax, out }: Decoding<C>,
  ) {
    if (seg.before !== undefined) r.expect(seg.before);
    const { cells } = out[seg.parts as keyof C] as Partition;
    const read = new Map<string, { at: number[]; v: number[] }>(
      Object.values(seg.letters).map((k) => [k, { at: [], v: [] }]),
    );
    for (const part of byFirstCell(cells)) {
      const kind = seg.letters[r.char((c) => Object.hasOwn(seg.letters, c))];
      const least = deal.least?.[kind] ?? 0;
      const max = maxOf(clueMax, kind as keyof C, sp, part, out as Partial<C>);
      const got = read.get(kind) as { at: number[]; v: number[] };
      got.at.push(part);
      got.v.push(r.int(least, max));
    }
    for (const [kind, { at, v }] of read) {
      const order = at.map((_, i) => i).sort((a, b) => at[a] - at[b]);
      out[kind as keyof C] = clueList(
        order.map((i) => at[i]),
        order.map((i) => v[i]),
        cells.length,
      );
    }
  },
};
