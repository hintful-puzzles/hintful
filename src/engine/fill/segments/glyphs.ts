/** The `glyphs` segment: a cell kind written a letter a clue, each letter one
 * of its values, between runs of empty cells `a` to `z`, the last run left
 * off. */

import { DESC_TOO_LONG } from "../../contract/desc-error.ts";
import type { DescReader } from "../../game-id/desc-reader.ts";
import { type ClueList, clueList } from "../../solve/describe-runtime.ts";
import type { SegmentKind } from "./segment.ts";

export type GlyphsSegment = {
  readonly glyphs: string;
  readonly values: Readonly<Record<string, number>>;
};

/** A run letter skips 1 to 26 empty cells of `n`, and each of `values`'
 * letters is a clue on the next. */
function readGlyphs(
  r: DescReader,
  n: number,
  values: Readonly<Record<string, number>>,
): ClueList {
  const at: number[] = [];
  const v: number[] = [];
  let cell = 0;
  while (r.peekIs((ch) => (ch >= "a" && ch <= "z") || Object.hasOwn(values, ch))) {
    const ch = r.char();
    if (ch >= "a" && ch <= "z") {
      cell += ch.charCodeAt(0) - 96;
      if (cell > n) r.fail(DESC_TOO_LONG);
      continue;
    }
    if (cell >= n) r.fail(DESC_TOO_LONG);
    at.push(cell++);
    v.push(values[ch]);
  }
  return clueList(at, v, n);
}

export const glyphs: SegmentKind<GlyphsSegment> = {
  encode(seg, { sp, listOf }) {
    const list = listOf(seg.glyphs);
    const letter = new Map(Object.entries(seg.values).map(([l, v]) => [v, l]));
    let out = "";
    // A run is written when a clue ends it or it reaches 26, so one at the
    // end is left off (upstream boats.c).
    let run = 0;
    for (const c of sp.cells) {
      const v = list.valueAt[c];
      if (v < 0) run++;
      if (run > 0 && (run === 26 || v >= 0)) {
        out += String.fromCharCode(96 + run);
        run = 0;
      }
      if (v >= 0) out += letter.get(v) ?? "";
    }
    return out;
  },
  decode(seg, { r, sp, out }) {
    out[seg.glyphs as keyof typeof out] = readGlyphs(r, sp.cells.length, seg.values);
  },
};
