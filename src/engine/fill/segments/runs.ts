/** The `runs` segment: where a one-valued clue kind sits, as upstream's run
 * code. */

import { DESC_TOO_LONG } from "../../contract/desc-error.ts";
import type { DescReader } from "../../game-id/desc-reader.ts";
import { type ClueList, clueList } from "../../solve/describe-runtime.ts";
import type { SegmentKind } from "./segment.ts";

export type RunsSegment = { readonly runs: string };

const isRunChar = (ch: string): boolean => ch === "_" || (ch >= "a" && ch <= "z");

/** The cells each letter's run of empty cells ends before, of `n`. */
function readRunCells(r: DescReader, n: number): ClueList {
  const at: number[] = [];
  let pos = 0;
  for (;;) {
    const ch = r.char(isRunChar);
    if (ch === "z") {
      // `z` is written only with empty cells still to follow it.
      pos += 25;
      if (pos >= n) r.fail(DESC_TOO_LONG);
      continue;
    }
    pos += ch === "_" ? 0 : ch.charCodeAt(0) - 96;
    if (pos > n) r.fail(DESC_TOO_LONG);
    if (pos === n) break;
    at.push(pos++);
  }
  return clueList(
    at,
    at.map(() => 0),
    n,
  );
}

export const runs: SegmentKind<RunsSegment> = {
  encode(seg, { sp, listOf }) {
    // `_` a clue with no gap before it, `a` to `y` one after a gap of 1 to
    // 25, `z` 25 empty cells with more to come, and a last clue past the
    // end.
    const list = listOf(seg.runs);
    const n = sp.cells.length;
    let out = "";
    let gap = 0;
    for (let c = 0; c <= n; c++) {
      if (c === n || list.byAt[c] >= 0) {
        out += gap === 0 ? "_" : String.fromCharCode(96 + gap);
        gap = 0;
        continue;
      }
      gap++;
      if (gap > 25) {
        out += "z";
        gap -= 25;
      }
    }
    return out;
  },
  decode(seg, { r, sp, out }) {
    out[seg.runs as keyof typeof out] = readRunCells(r, sp.cells.length);
  },
};
