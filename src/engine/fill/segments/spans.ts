/** The `spans` segment: where a one-valued clue kind sits, every cell in a
 * run of its own or of the others: a run of the kind's cells a letter, `a`
 * one to `z` 26, letters side by side adding; a run of the others its
 * length as a number (upstream crossing.c's walls). */

import { DESC_TOO_LONG } from "../../contract/desc-error.ts";
import { isDigit } from "../../game-id/decimal.ts";
import { clueList } from "../../solve/describe-runtime.ts";
import type { SegmentKind } from "./segment.ts";

export type SpansSegment = { readonly spans: string };

const isSpanLetter = (ch: string): boolean => ch >= "a" && ch <= "z";

/** A run of `n` of the kind's cells, `z` for each whole 26 before the last
 * letter, which upstream would write past `z`. */
const letters = (n: number): string =>
  "z".repeat(Math.floor((n - 1) / 26)) + String.fromCharCode(97 + ((n - 1) % 26));

export const spans: SegmentKind<SpansSegment> = {
  encode(seg, { sp, listOf }) {
    const list = listOf(seg.spans);
    let out = "";
    let run = 0;
    let on = false;
    const close = (): void => {
      if (run > 0) out += on ? letters(run) : String(run);
      run = 0;
    };
    for (const c of sp.cells) {
      const here = list.byAt[c] >= 0;
      if (here !== on) close();
      on = here;
      run++;
    }
    close();
    return out;
  },
  decode(seg, { r, sp, out }) {
    const n = sp.cells.length;
    const at: number[] = [];
    let pos = 0;
    while (pos < n) {
      if (r.peekIs(isSpanLetter)) {
        const run = r.char().charCodeAt(0) - 96;
        if (pos + run > n) r.fail(DESC_TOO_LONG);
        for (let i = 0; i < run; i++) at.push(sp.cells[pos + i]);
        pos += run;
      } else {
        pos += r.int(1, n);
        if (pos > n) r.fail(DESC_TOO_LONG);
      }
    }
    if (r.peekIs((ch) => isDigit(ch) || isSpanLetter(ch))) r.fail(DESC_TOO_LONG);
    out[seg.spans as keyof typeof out] = clueList(
      at,
      at.map(() => 0),
      n,
    );
  },
};
