/** The `blocks` segment: a dealt partition as upstream's block structure
 * (`engine/game-id/block-structure.ts`). */

import { Dsf } from "../../board/dsf.ts";
import { DESC_MALFORMED } from "../../contract/desc-error.ts";
import {
  encodeBlockStructure,
  readBlockStructure,
} from "../../game-id/block-structure.ts";
import { regionNumbers } from "../../generate/divide.ts";
import type { Partition } from "../../solve/describe-runtime.ts";
import { dividesOn } from "../game-id.ts";
import { equalParts, partitionOf, type SegmentKind } from "./segment.ts";

/** After `before` and before `after` where given; with them, nothing on a
 * board that does not deal it (`FillDivide.variation`). */
export type BlocksSegment = {
  readonly blocks: string;
  readonly before?: string;
  readonly after?: string;
  /** A letter's repeats written out, never counted (Solo's). */
  readonly counts?: false;
};

export const blocks: SegmentKind<BlocksSegment> = {
  encode(seg, { sp, dealt }) {
    const partition = dealt[seg.blocks as keyof typeof dealt] as Partition | undefined;
    if (partition === undefined) return "";
    const { of } = partition;
    return (
      (seg.before ?? "") +
      encodeBlockStructure(sp.w, sp.h, (a, b) => of[a] === of[b], seg.counts) +
      (seg.after ?? "")
    );
  },
  decode(seg, { r, deal, sp, out, variations }) {
    const divide = deal.divide?.find((d) => d.partition === seg.blocks);
    if (divide !== undefined && !dividesOn(deal, variations).includes(divide)) return;
    if (seg.before !== undefined) r.expect(seg.before);
    const n = sp.cells.length;
    const joined = new Dsf(n);
    readBlockStructure(r, joined, sp.w, sp.h);
    const parts = partitionOf(regionNumbers(joined, n));
    if (!equalParts(deal, seg.blocks, sp, parts)) r.fail(DESC_MALFORMED);
    out[seg.blocks as keyof typeof out] = parts;
    if (seg.after !== undefined) r.expect(seg.after);
  },
};
