/** The `pairs` segment: a dealt partition of pairs of neighboring squares,
 * a letter a cell saying where its partner lies (upstream laydomino.c's
 * layouts, as Magnets writes its tiles). */

import { puzzleDescError } from "../../contract/desc-error.ts";
import type { Partition } from "../../solve/describe-runtime.ts";
import { partitionOf, type SegmentKind } from "./segment.ts";

export type PairsSegment = {
  readonly pairs: string;
  readonly before?: string;
};

/** A cell's letter: its partner lies right of it (`L`, it is the left
 * end), left of it, below, above, or nowhere (`*`, a square alone). */
const LETTERS = "LRTB*";

export const pairs: SegmentKind<PairsSegment> = {
  encode(seg, { sp, dealt }) {
    const { of, cells } = dealt[seg.pairs as keyof typeof dealt] as Partition;
    const { w } = sp;
    let out = seg.before ?? "";
    for (const c of sp.cells) {
      const part = cells[of[c]];
      if (part.length > 2)
        throw new Error(`id: ${seg.pairs} has a part of more than two`);
      const p = part.length === 1 ? c : part[0] === c ? part[1] : part[0];
      const step = [1, -1, w, -w, 0].indexOf(p - c);
      if (step < 0) throw new Error(`id: ${seg.pairs} has a pair apart`);
      out += LETTERS[step];
    }
    return out;
  },
  decode(seg, { r, sp, out }) {
    if (seg.before !== undefined) r.expect(seg.before);
    const { w, h } = sp;
    const n = sp.cells.length;
    const partner = new Int32Array(n);
    for (const c of sp.cells) {
      const i = LETTERS.indexOf(r.char((ch) => LETTERS.includes(ch)));
      const x = c % w;
      const y = Math.floor(c / w);
      // A partner off the board, or across its edge, is no neighbor.
      const off =
        (i === 0 && x === w - 1) ||
        (i === 1 && x === 0) ||
        (i === 2 && y === h - 1) ||
        (i === 3 && y === 0);
      partner[c] = off ? -1 : c + [1, -1, w, -w, 0][i];
    }
    const part = new Int32Array(n);
    for (const c of sp.cells) {
      const p = partner[c];
      if (p < 0 || partner[p] !== c)
        r.fail(
          puzzleDescError(
            "This game ID has a pair of squares that don't point at each other.",
          ),
        );
      part[c] = Math.min(c, p);
    }
    // Numbered by the parts' first cells, as `partitionOf` reads them.
    const number = new Map<number, number>();
    for (const c of sp.cells) {
      if (!number.has(part[c])) number.set(part[c], number.size);
      part[c] = number.get(part[c]) as number;
    }
    out[seg.pairs as keyof typeof out] = partitionOf(part);
  },
};
