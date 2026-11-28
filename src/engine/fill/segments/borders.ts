/** The `borders` segment: the partition of a board of parts (`parts.ts`) as
 * upstream map.c's edge list. The sides between two squares are read in
 * one order, those between the rows first, row by row, then those between
 * the columns, column by column; each is a border or not, and the list
 * writes their runs, from a notional side before the first that is none.
 * A letter `a` to `y` is a run of 1 to 25 after which a border turns to
 * none or none to a border; `z` is 25 that turns nothing. Upstream's own
 * clue list after it is the shared run-letter stream, whose `z` is 26: the
 * two only look alike. */

import { Dsf } from "../../board/dsf.ts";
import {
  DESC_MALFORMED,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
} from "../../contract/desc-error.ts";
import { regionNumbers } from "../../generate/divide.ts";
import { type Squares, squares as squaresOf } from "../../solve/describe-runtime.ts";
import { partitionOf, type SegmentKind } from "./segment.ts";

export type BordersSegment = { readonly borders: string };

/** The longest run a letter writes. */
const RUN = 25;

/** The two squares either side of side `i` of a `w` by `h` grid, in the
 * list's order. */
function sideSquares(w: number, h: number, i: number): [number, number] {
  if (i < w * (h - 1)) return [i, i + w];
  const x = Math.floor((i - w * (h - 1)) / h);
  const y = (i - w * (h - 1)) % h;
  return [y * w + x, y * w + x + 1];
}

const sideCount = (w: number, h: number): number => w * (h - 1) + (w - 1) * h;

const isRunLetter = (c: string): boolean => c >= "a" && c <= "z";

const letter = (run: number): string => String.fromCharCode(96 + run);

export const borders: SegmentKind<BordersSegment> = {
  encode(seg, { dealt }) {
    const sq = dealt[seg.borders as keyof typeof dealt] as Squares;
    const { w, h, of } = sq;
    let out = "";
    let run = 1;
    let border = false;
    for (let i = 0; i < sideCount(w, h); i++) {
      const [a, b] = sideSquares(w, h, i);
      const is = of[a] !== of[b];
      if (is !== border) {
        out += letter(run);
        run = 1;
        border = is;
        continue;
      }
      if (run === RUN) {
        out += "z";
        run = 0;
      }
      run++;
    }
    return out + letter(run);
  },
  decode(seg, { r, sp, squares, out }) {
    if (squares === null) throw new Error(`id borders: ${seg.borders} on no squares`);
    const { w, h } = squares;
    const sides = sideCount(w, h);
    const joined = new Dsf(w * h);
    let pos = -1;
    let border = false;
    while (pos < sides) {
      // The clue list's `,` where a run belongs: the list stops short.
      if (r.peek() === ",") r.fail(DESC_TOO_SHORT);
      const c = r.char(isRunLetter);
      const k = c === "z" ? RUN : c.charCodeAt(0) - 96;
      if (pos + k > sides) r.fail(DESC_TOO_LONG);
      if (!border)
        for (let i = Math.max(pos, 0); i < pos + k; i++) {
          const [a, b] = sideSquares(w, h, i);
          joined.merge(a, b);
        }
      pos += k;
      if (c !== "z") border = !border;
    }
    const parts = partitionOf(regionNumbers(joined, w * h));
    // As many parts as the board has cells, which the params count.
    if (parts.cells.length !== sp.cells.length) r.fail(DESC_MALFORMED);
    out[seg.borders as keyof typeof out] = squaresOf(parts, w, h);
  },
};
