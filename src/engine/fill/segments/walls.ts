/** The `walls` segment: a dealt partition as the walls between its parts
 * (`engine/game-id/wall-runs.ts`). */

import { Dsf } from "../../board/dsf.ts";
import { DESC_MALFORMED, DESC_OUT_OF_RANGE } from "../../contract/desc-error.ts";
import { encodeWallRuns, readRegionWalls } from "../../game-id/wall-runs.ts";
import { regionNumbers } from "../../generate/divide.ts";
import type { Partition } from "../../solve/describe-runtime.ts";
import { equalParts, partitionOf, type SegmentKind } from "./segment.ts";

export type WallsSegment = { readonly walls: string };

/** The largest value a cell holds: a domain is a bit a value in an int. */
const MOST_VALUE = 31;

/** Each border between two cells side by side, 1 where it divides two parts
 * of `p`: those inside the rows first, then those between them, as
 * `encodeWallRuns` writes them. */
function wallsOf(p: Partition, w: number, h: number): Uint8Array {
  const out: number[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w - 1; x++)
      out.push(p.of[y * w + x] === p.of[y * w + x + 1] ? 0 : 1);
  for (let y = 0; y < h - 1; y++)
    for (let x = 0; x < w; x++)
      out.push(p.of[y * w + x] === p.of[(y + 1) * w + x] ? 0 : 1);
  return Uint8Array.from(out);
}

export const walls: SegmentKind<WallsSegment> = {
  encode(seg, { sp, dealt }) {
    return encodeWallRuns(
      wallsOf(dealt[seg.walls as keyof typeof dealt] as Partition, sp.w, sp.h),
    );
  },
  decode(seg, { r, deal, sp, out, grown }) {
    const n = sp.cells.length;
    const joined = new Dsf(n);
    readRegionWalls(r, joined, sp.w, sp.h);
    const parts = partitionOf(regionNumbers(joined, n));
    // A part too small to hold what the deal grows each part round, or
    // a count of parts the rules do not allow, has no answer.
    const sized = deal.grow?.partition === seg.walls ? grown : null;
    if (parts.cells.some((cs) => cs.length < (sized?.holds ?? 1)))
      r.fail(DESC_MALFORMED);
    const count = sized?.parts ?? null;
    if (count !== null && parts.cells.length !== count) r.fail(DESC_MALFORMED);
    // A part the deal divides to drawn sizes holds a number for each of
    // its cells (Seismic's areas), and a cell holds at most 31.
    const divided = deal.divide?.find((d) => d.partition === seg.walls);
    if (
      divided !== undefined &&
      "sizes" in divided &&
      parts.cells.some((cs) => cs.length > MOST_VALUE)
    )
      r.fail(DESC_OUT_OF_RANGE);
    if (!equalParts(deal, seg.walls, sp, parts)) r.fail(DESC_MALFORMED);
    out[seg.walls as keyof typeof out] = parts;
  },
};
