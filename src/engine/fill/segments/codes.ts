/** The `codes` segment: clues of several kinds at one place, each written by
 * a code (upstream Mathrax's). */

import { DESC_TOO_LONG } from "../../contract/desc-error.ts";
import { clueList } from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import { type Decoding, maxOf, type SegmentKind, universeOf } from "./segment.ts";

/** A clue an element of its kinds' one place, in the space's order, between
 * runs of 1 to 26 elements without one, `a` to `z`, the last run written
 * too: its code, by `codes`, a kind followed by the clue's number, or a kind
 * and one of its values (`parity 0`) standing whole. The longest code that
 * matches is read. */
export type CodesSegment = {
  readonly codes: Readonly<Record<string, string>>;
  readonly before?: string;
};

/** A `codes` segment's codes, each with the kind it stands for and, where
 * it stands whole, the value: the longest first, as they are read. */
function codesOf(
  codes: Readonly<Record<string, string>>,
): { readonly code: string; readonly kind: string; readonly value: number | null }[] {
  return Object.entries(codes)
    .map(([code, said]) => {
      const [kind, value] = said.split(" ");
      return { code, kind, value: value === undefined ? null : Number(value) };
    })
    .sort((a, b) => b.code.length - a.code.length);
}

export const codes: SegmentKind<CodesSegment> = {
  encode(seg, { deal, sp, listOf }) {
    let out = seg.before ?? "";
    const codes = codesOf(seg.codes);
    const kinds = [...new Set(codes.map((c) => c.kind))];
    // A run is written when a clue ends it, at the end, or before a 27th.
    let run = 0;
    const flush = (): void => {
      if (run > 0) out += String.fromCharCode(96 + run);
      run = 0;
    };
    for (const e of sp[universeOf(deal, kinds[0])]) {
      const here = kinds.flatMap((kind) => {
        const v = listOf(kind).valueAt[e];
        return v >= 0 ? [{ kind, v }] : [];
      });
      if (here.length > 1)
        throw new Error(`id: element ${e} holds ${here.length} clues`);
      if (here.length === 0) {
        if (run === 26) flush();
        run++;
        continue;
      }
      flush();
      const [{ kind, v }] = here;
      const whole = codes.find((c) => c.kind === kind && c.value === v);
      const numbered = codes.find((c) => c.kind === kind && c.value === null);
      if (whole === undefined && numbered === undefined)
        throw new Error(`id: no code writes ${kind} ${v}`);
      out += whole?.code ?? `${numbered?.code}${v}`;
    }
    flush();
    return out;
  },
  /** A run letter skips 1 to 26 elements, and a code is a clue on the next,
   * its number after it where the code stands for a kind alone; the elements
   * end with the segment. */
  decode<C extends Clues<C>>(
    seg: CodesSegment,
    { r, deal, sp, clueMax, out }: Decoding<C>,
  ) {
    if (seg.before !== undefined) r.expect(seg.before);
    const codes = codesOf(seg.codes);
    const read = new Map(
      codes.map((c) => [c.kind, { at: [] as number[], v: [] as number[] }]),
    );
    const elements = sp[universeOf(deal, codes[0].kind)];
    const n = elements.length;
    for (let pos = 0; pos < n; ) {
      if (r.peekIs((ch) => ch >= "a" && ch <= "z")) {
        pos += r.char().charCodeAt(0) - 96;
        if (pos > n) r.fail(DESC_TOO_LONG);
        continue;
      }
      const code = codes.find((c) => r.accept(c.code));
      if (code === undefined) {
        // Refused: a character no code begins with, or the end of the desc.
        r.char(() => false);
        continue;
      }
      const e = elements[pos++];
      const least = deal.least?.[code.kind] ?? 0;
      const got = read.get(code.kind) as { at: number[]; v: number[] };
      got.at.push(e);
      got.v.push(
        code.value ?? r.int(least, maxOf(clueMax, code.kind as keyof C, sp, e)),
      );
    }
    for (const [kind, { at, v }] of read) out[kind as keyof C] = clueList(at, v, n);
  },
};
