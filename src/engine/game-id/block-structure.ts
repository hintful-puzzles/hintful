/**
 * **A partition as upstream's block structure**, the first half of Keen's
 * desc (`⟨blocks⟩,⟨clues⟩`) and of Solo's jigsaw and killer sections
 * (upstream keen.c and solo.c, `encode_block_structure`).
 *
 * It lists the borders between two cells side by side: the `(w-1)·h` inside
 * the rows in reading order, then the `w·(h-1)` between them column by
 * column, and one virtual border past the end. Each border between two parts
 * closes a run of borders inside a part before it: `_` a run of none, `a` to
 * `y` a run of 1 to 25, and `z` a run of 25 that closes no border, so a longer
 * run is written as `z`s and a remainder. A letter three times or more in a
 * row is written once and then the count, and twice as itself (Keen's
 * second pass; Solo writes none, and reads none).
 */

import type { Dsf } from "../board/dsf.ts";
import { DESC_TOO_LONG } from "../contract/desc-error.ts";
import { isDigit } from "./decimal.ts";
import type { DescReader } from "./desc-reader.ts";

/** The two cells either side of border `i`, in the order the structure
 * lists them. */
function borderCells(i: number, w: number, h: number): [number, number] {
  const inRows = (w - 1) * h;
  if (i < inRows) {
    const cell = Math.floor(i / (w - 1)) * w + (i % (w - 1));
    return [cell, cell + 1];
  }
  const j = i - inRows;
  const cell = (j % (h - 1)) * w + Math.floor(j / (h - 1));
  return [cell, cell + w];
}

/** The count of borders the structure lists, the virtual one aside. */
const bordersOf = (w: number, h: number): number => (w - 1) * h + w * (h - 1);

/** The block structure of `joined`, which holds two cells together where
 * they share a part; with `counts` false, a letter's repeats written out,
 * as Solo's are. */
export function encodeBlockStructure(
  w: number,
  h: number,
  joined: (a: number, b: number) => boolean,
  counts = true,
): string {
  let raw = "";
  let run = 0;
  const total = bordersOf(w, h);
  for (let i = 0; i <= total; i++) {
    // The last border is the virtual one, which closes the last run.
    if (i < total && joined(...borderCells(i, w, h))) {
      run++;
      continue;
    }
    while (run > 25) {
      raw += "z";
      run -= 25;
    }
    raw += run > 0 ? String.fromCharCode(96 + run) : "_";
    run = 0;
  }
  if (!counts) return raw;
  // A run of one letter where the count is shorter.
  let out = "";
  for (let r = 0; r < raw.length; ) {
    const c = raw[r];
    let n = 0;
    while (raw[r + n] === c) n++;
    out += n === 2 ? c + c : n > 2 ? `${c}${n}` : c;
    r += n;
  }
  return out;
}

/** Read a block structure into `dsf`, joining the cells either side of
 * each border inside a part, up to and past the virtual border. */
export function readBlockStructure(
  r: DescReader,
  dsf: Dsf,
  w: number,
  h: number,
): void {
  const total = bordersOf(w, h);
  let pos = 0;
  while (pos < total + 1) {
    const letter = r.char((c) => c === "_" || (c >= "a" && c <= "z"));
    // `z` is the run of 25 that closes no border. Upstream keen.c reads `y`
    // so and `z` as a run of 26, which its writer never meant; no board of
    // cages of six has such a run.
    const closes = letter !== "z";
    const run = letter === "_" ? 0 : closes ? letter.charCodeAt(0) - 96 : 25;
    const repeats = r.peekIs(isDigit) ? r.int(3, total + 1) : 1;
    for (let k = 0; k < repeats; k++) {
      for (let c = run; c > 0; c--) {
        if (pos >= total) r.fail(DESC_TOO_LONG);
        dsf.merge(...borderCells(pos, w, h));
        pos++;
      }
      if (closes) {
        pos++;
        if (pos > total + 1) r.fail(DESC_TOO_LONG);
      }
    }
  }
}
