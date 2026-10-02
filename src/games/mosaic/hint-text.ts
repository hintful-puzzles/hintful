/**
 * Every sentence Mosaic's hint speaks.
 *
 * `hint.ts` decides which rule fired and on which squares; this file decides
 * only how it reads. A number's *squares* are its block, its own square and
 * the eight around it, which the help's Hints section says; the sentence names
 * the number and the outline shows the block.
 */

import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { BLOCK } from "./hint-marks.ts";

/** What a step marks: the number it reasons from, its value, and the squares
 * it decides. */
export interface Marked {
  clue: Point;
  n: number;
  cells: readonly Point[];
}

const thisNumber = (m: Marked): Narration =>
  mark.this("outline", BLOCK, [m.clue], String(m.n));
const theseSquares = (m: Marked): Narration =>
  mark.this("ring", CELL, m.cells, ["square", "squares"]);
const blacks = (n: number): string => `${n} black square${n === 1 ? "" : "s"}`;

export const say = {
  /** The number has all its black squares, so the rest of its block is white. */
  met: (m: Marked): Sentence =>
    so({
      look:
        m.n === 0
          ? phrase`${thisNumber(m)} allows no black squares`
          : phrase`${thisNumber(m)} already has its ${blacks(m.n)}`,
      move: phrase`${theseSquares(m)} must be white`,
    }),

  /** Only as many of the block's squares are not white as the number needs,
   * so every one of them is black. `size` is the block's size. */
  needsAll: (m: Marked, size: number): Sentence =>
    so({
      look:
        m.n === size
          ? phrase`${thisNumber(m)} needs all ${size} of its squares black`
          : phrase`${thisNumber(m)} needs ${blacks(m.n)}, and only ${m.n} of its squares are not white`,
      move: phrase`${theseSquares(m)} must be black`,
    }),
};
