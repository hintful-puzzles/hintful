/** The `records` segment: a record a cell, closed by a comma (upstream
 * unequal.c's). */

import { DESC_CONTRADICTORY, DESC_OUT_OF_RANGE } from "../../contract/desc-error.ts";
import { clueList, type GridSpace } from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import { type Decoding, maxOf, type SegmentKind } from "./segment.ts";

/** Its clue of `records` as a number, 0 for none, then a side letter
 * (`SIDES`) for each clue of `sides`, a kind at edges valued one of the
 * edge's ends, that it is the value of. Where `both`, `sides` is valued 0 or
 * 1 at every edge, and an edge's clue 1 is written from both its ends
 * (upstream's Adjacent), every other edge's 0. */
export type RecordsSegment = {
  readonly records: string;
  readonly sides: string;
  readonly both?: true;
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

export const records: SegmentKind<RecordsSegment> = {
  encode(seg, { sp, listOf }) {
    const numbers = listOf(seg.records);
    const sides = listOf(seg.sides);
    let out = "";
    for (const c of sp.cells) {
      out += String(Math.max(0, numbers.valueAt[c]));
      for (let d = 0; d < SIDES.length; d++) {
        const n = across(sp, c, d);
        if (n >= 0 && sides.valueAt[sp.edgeOf(c, n)] === (seg.both ? 1 : c))
          out += SIDES[d];
      }
      out += ",";
    }
    return out;
  },
  /** A cell's number (0 for none) and the sides whose edge's clue it is the
   * value of, or, where `both`, whose edge's clue is 1. */
  decode<C extends Clues<C>>(
    seg: RecordsSegment,
    { r, deal, sp, clueMax, out }: Decoding<C>,
  ) {
    const kind = seg.records as keyof C;
    const least = deal.least?.[seg.records] ?? 1;
    const at: number[] = [];
    const v: number[] = [];
    // The end each edge's clue is valued, -1 for none; where `both`, one less
    // than the ends that write it.
    const end = new Int32Array(sp.edges.length).fill(-1);
    for (const c of sp.cells) {
      const n = r.int(0, maxOf(clueMax, kind, sp, c));
      if (n > 0) {
        if (n < least) r.fail(DESC_OUT_OF_RANGE);
        at.push(c);
        v.push(n);
      }
      for (let d = 0; d < SIDES.length; d++) {
        if (!r.accept(SIDES[d])) continue;
        const other = across(sp, c, d);
        if (other < 0) r.fail(DESC_OUT_OF_RANGE);
        const e = sp.edgeOf(c, other);
        if (seg.both) end[e]++;
        // A clue valued both its ends says two things of one edge.
        else if (end[e] >= 0) r.fail(DESC_CONTRADICTORY);
        else end[e] = c;
      }
      r.expect(",");
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
    const edges = sp.edges.filter((e) => end[e] >= 0);
    out[seg.sides as keyof C] = clueList(
      edges,
      edges.map((e) => end[e]),
      sp.edges.length,
    );
  },
};
