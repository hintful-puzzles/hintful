/**
 * Every sentence Mosaic's hint speaks.
 *
 * `hint.ts` decides which rule fired and on which squares; this file decides
 * only how it reads. A number's *squares* are its block, its own square and
 * the eight around it, which the help's Hints section says; the sentence names
 * the number and the outline shows the block. The words for a square's two
 * states are the engine's, so a sentence says the color the piece is drawn in.
 */

import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import { SHADED_NAME, UNSHADED_NAME } from "../../engine/piece.ts";
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
const shadeds = (n: number): string =>
  `${n} ${SHADED_NAME} square${n === 1 ? "" : "s"}`;

export const say = {
  /** The number has all its shaded squares, so the rest of its block is clear. */
  met: (m: Marked): Sentence =>
    so({
      look:
        m.n === 0
          ? phrase`${thisNumber(m)} allows no ${SHADED_NAME} squares`
          : phrase`${thisNumber(m)} already has its ${shadeds(m.n)}`,
      move: phrase`${theseSquares(m)} must be ${UNSHADED_NAME}`,
    }),

  /** Only as many of the block's squares are not clear as the number needs,
   * so every one of them is shaded. `size` is the block's size. */
  needsAll: (m: Marked, size: number): Sentence =>
    so({
      look:
        m.n === size
          ? phrase`${thisNumber(m)} needs all ${size} of its squares ${SHADED_NAME}`
          : phrase`${thisNumber(m)} needs ${shadeds(m.n)}, and only ${m.n} of its squares are not ${UNSHADED_NAME}`,
      move: phrase`${theseSquares(m)} must be ${SHADED_NAME}`,
    }),
};
