/**
 * **A board of blanks and dots of two kinds**, written one letter per dot: the
 * letter's offset from `a` (or `A`) is the run of blanks before the dot, and its
 * case is the dot's kind — lowercase kind 0, uppercase kind 1. A run of 25 or
 * more blanks is chunked into `z`s (or `Z`s), each standing for 25 blanks and no
 * dot, in the case of the dot that ends the run. The board closes with a
 * lowercase letter for the blanks after the last dot, as if a kind-0 dot sat
 * one past the end.
 *
 * Unruly's givens and Clusters' dots are this grammar letter for letter, both
 * from upstream. It is not `run-length.ts`'s: here a letter is a run *and* a
 * value, `z` carries 25 rather than 26, and the case is meaning — the
 * disagreements that header records about letter alphabets are why this is its
 * own module rather than a knob on that one.
 */
import { DESC_TOO_LONG, descBadCharacter } from "./desc-error.ts";
import type { DescReader } from "./desc-reader.ts";

/** The kind of a dot: which case its letter is written in. */
export type DotKind = 0 | 1;

const BASE: Record<DotKind, number> = { 0: "a".charCodeAt(0), 1: "A".charCodeAt(0) };
const CHUNK = 25;

const isLower = (c: string): boolean => c >= "a" && c <= "z";
const isUpper = (c: string): boolean => c >= "A" && c <= "Z";

/** Write `s` cells, `kindAt(i)` giving the dot at cell `i` or `null` for a blank. */
export function writeDotRuns(s: number, kindAt: (i: number) => DotKind | null): string {
  let out = "";
  let run = 0;
  for (let i = 0; i <= s; i++) {
    const kind = i === s ? 0 : kindAt(i);
    if (kind === null) {
      run++;
      continue;
    }
    for (; run >= CHUNK; run -= CHUNK) out += String.fromCharCode(BASE[kind] + CHUNK);
    out += String.fromCharCode(BASE[kind] + run);
    run = 0;
  }
  return out;
}

/**
 * Read `s` cells as {@link writeDotRuns} writes them, calling `place(i, kind)`
 * for each dot, and read to the end of the desc. A `z` chunk in the other case
 * from its dot, an uppercase closing letter, and a run past the board are all
 * refused, since the writer produces none of them.
 */
export function readDotRuns(
  r: DescReader,
  s: number,
  place: (i: number, kind: DotKind) => void,
): void {
  let pos = 0;
  for (;;) {
    let c = r.char((c) => isLower(c) || isUpper(c));
    const kind: DotKind = isUpper(c) ? 1 : 0;
    while (c === "z" || c === "Z") {
      pos += CHUNK;
      c = r.char(kind === 1 ? isUpper : isLower);
    }
    pos += c.charCodeAt(0) - BASE[kind];
    if (pos > s) r.fail(DESC_TOO_LONG);
    if (pos === s) {
      if (kind === 1) r.fail(descBadCharacter(c));
      r.end();
      return;
    }
    place(pos++, kind);
  }
}
