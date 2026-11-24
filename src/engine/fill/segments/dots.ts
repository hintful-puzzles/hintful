/** The `dots` segment: a two-valued kind at cells as upstream's dot runs. */

import { readDotRuns, writeDotRuns } from "../../game-id/dot-runs.ts";
import { clueList } from "../../solve/describe-runtime.ts";
import type { SegmentKind } from "./segment.ts";

/** Its value the letter's case (`cases`, lowercase then uppercase), after
 * `before` and written only where one is dealt where `before` is given. */
export type DotsSegment = {
  readonly dots: string;
  readonly cases: readonly [number, number];
  readonly before?: string;
};

export const dots: SegmentKind<DotsSegment> = {
  encode(seg, { sp, listOf }) {
    const list = listOf(seg.dots);
    // Behind its mark, the segment is written only where it holds a clue.
    if (seg.before !== undefined && list.at.length === 0) return "";
    const [lower, upper] = seg.cases;
    return (
      (seg.before ?? "") +
      writeDotRuns(sp.cells.length, (c) => {
        const v = list.valueAt[c];
        return v === upper ? 1 : v === lower ? 0 : null;
      })
    );
  },
  decode(seg, { r, sp, out }) {
    const at: number[] = [];
    const v: number[] = [];
    if (seg.before === undefined || r.accept(seg.before))
      readDotRuns(r, sp.cells.length, (c, kind) => {
        at.push(c);
        v.push(seg.cases[kind]);
      });
    out[seg.dots as keyof typeof out] = clueList(at, v, sp.cells.length);
  },
};
