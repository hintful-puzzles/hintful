/** The `records` segment: a record a cell, closed by a comma (upstream
 * unequal.c's), or with `closed: false` a comma between two (upstream
 * subsets.c's). */

import { DESC_CONTRADICTORY, DESC_OUT_OF_RANGE } from "../../contract/desc-error.ts";
import { clueList, type GridSpace } from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import { type Decoding, maxOf, type SegmentKind } from "./segment.ts";

/** Its clue of `records` as a number, 0 for none (or `hidden`), one less
 * where `from` is 0; then a side letter (`SIDES`) for each clue of `sides`
 * that names it. A kind at edges valued one of the edge's ends names the end
 * it is valued; where `ends`, `sides` is valued 0 to 2 at every edge and 1
 * names its first end and 2 its second (upstream's Subsets); where `both`,
 * it is valued 0 or 1 at every edge, and 1 names both ends (upstream's
 * Adjacent). The compiler reads `ends` and `both` off the kind. */
export type RecordsSegment = {
  readonly records: string;
  readonly sides: string;
  readonly hidden?: string;
  readonly from?: 0;
  readonly closed?: false;
  readonly both?: true;
  readonly ends?: true;
};

/** A record's side letters, up, right, down and left (upstream unequal.c's
 * `adjthan` order). */
const SIDES = "URDL";
const SIDE_STEP: readonly (readonly [number, number])[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

/** The cell a step of side `d` from cell `c` reaches, `-1` off the grid. */
function across(sp: GridSpace, c: number, d: number): number {
  const [dx, dy] = SIDE_STEP[d];
  const x = (c % sp.w) + dx;
  const y = Math.floor(c / sp.w) + dy;
  return x < 0 || y < 0 || x >= sp.w || y >= sp.h ? -1 : y * sp.w + x;
}

/** The value of edge `e`'s clue of `sides` that names its end `c`. */
const naming = (seg: RecordsSegment, sp: GridSpace, e: number, c: number): number =>
  seg.both ? 1 : seg.ends ? (sp.edgeEnds[2 * e] === c ? 1 : 2) : c;

export const records: SegmentKind<RecordsSegment> = {
  encode(seg, { sp, listOf }) {
    const numbers = listOf(seg.records);
    const sides = listOf(seg.sides);
    const shift = seg.from === 0 ? 1 : 0;
    const out: string[] = [];
    for (const c of sp.cells) {
      const v = numbers.valueAt[c];
      let rec = v > 0 ? String(v - shift) : (seg.hidden ?? "0");
      for (let d = 0; d < SIDES.length; d++) {
        const n = across(sp, c, d);
        if (n < 0) continue;
        const e = sp.edgeOf(c, n);
        if (sides.valueAt[e] === naming(seg, sp, e, c)) rec += SIDES[d];
      }
      out.push(rec);
    }
    return seg.closed === false ? out.join(",") : out.map((rec) => `${rec},`).join("");
  },
  /** A cell's number (none where 0 or `hidden`) and the sides whose edge's
   * clue names it. */
  decode<C extends Clues<C>>(
    seg: RecordsSegment,
    { r, deal, sp, clueMax, out }: Decoding<C>,
  ) {
    const kind = seg.records as keyof C;
    const least = deal.least?.[seg.records] ?? 1;
    const shift = seg.from === 0 ? 1 : 0;
    const at: number[] = [];
    const v: number[] = [];
    // The end each edge's clue names, -1 for none; where `both`, one less
    // than the ends that write it.
    const end = new Int32Array(sp.edges.length).fill(-1);
    for (const c of sp.cells) {
      if (seg.closed === false && c !== sp.cells[0]) r.expect(",");
      const max = maxOf(clueMax, kind, sp, c);
      if (seg.hidden === undefined) {
        const n = r.int(0, max);
        if (n > 0) {
          if (n < least) r.fail(DESC_OUT_OF_RANGE);
          at.push(c);
          v.push(n);
        }
      } else if (!r.accept(seg.hidden)) {
        at.push(c);
        v.push(r.int(least - shift, max - shift) + shift);
      }
      for (let d = 0; d < SIDES.length; d++) {
        if (!r.accept(SIDES[d])) continue;
        const other = across(sp, c, d);
        if (other < 0) r.fail(DESC_OUT_OF_RANGE);
        const e = sp.edgeOf(c, other);
        if (seg.both) end[e]++;
        // A clue that names both its ends says two things of one edge.
        else if (end[e] >= 0) r.fail(DESC_CONTRADICTORY);
        else end[e] = c;
      }
      if (seg.closed !== false) r.expect(",");
    }
    out[kind] = clueList(at, v, sp.cells.length);
    if (seg.both) {
      // An edge written from one end alone says two things of it.
      if (sp.edges.some((e) => end[e] === 0)) r.fail(DESC_CONTRADICTORY);
      out[seg.sides as keyof C] = clueList(
        sp.edges,
        sp.edges.map((e) => (end[e] > 0 ? 1 : 0)),
        sp.edges.length,
      );
      return;
    }
    if (seg.ends) {
      out[seg.sides as keyof C] = clueList(
        sp.edges,
        sp.edges.map((e) => (end[e] < 0 ? 0 : naming(seg, sp, e, end[e]))),
        sp.edges.length,
      );
      return;
    }
    const edges = sp.edges.filter((e) => end[e] >= 0);
    out[seg.sides as keyof C] = clueList(
      edges,
      edges.map((e) => end[e]),
      sp.edges.length,
    );
  },
};
