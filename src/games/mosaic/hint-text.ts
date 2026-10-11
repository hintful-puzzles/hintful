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

/** A step that compares two numbers: the first, with `cells`, and the `other`;
 * the shaded squares the first still needs, and by how many that is more than
 * the other needs. */
export interface Compared extends Marked {
  other: { clue: Point; n: number };
  need: number;
  by: number;
}

const thisNumber = (m: Marked): Narration =>
  mark.this("outline", BLOCK, [m.clue], String(m.n));
/** The second number of a pair. A value names it apart from the first, and
 * where the two are the same number it is "the other". */
const otherNumber = (m: Compared): Narration =>
  m.other.n === m.n
    ? mark.as("outline", BLOCK, [m.other.clue], `the other ${m.n}`)
    : mark.this("outline", BLOCK, [m.other.clue], String(m.other.n));
/** The second number said again, in plain words. */
const otherAgain = (m: Compared): string =>
  m.other.n === m.n ? "the other" : `the ${m.other.n}`;
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

  /** The number needs `by` more shaded squares than the other, and only `by`
   * of its empty squares are not the other's too, so each of them is shaded. */
  needsMore: (m: Compared): Sentence => {
    const fresh = m.need === m.n && m.need - m.by === m.other.n;
    return so({
      look: phrase`${thisNumber(m)} ${fresh ? "" : "still "}needs ${m.by} more ${shadeds(m.by).slice(2)} than ${otherNumber(m)}, and only ${m.by} of its empty squares ${m.by === 1 ? "is" : "are"} outside ${otherAgain(m)}'s block`,
      move: phrase`${theseSquares(m)} must be ${SHADED_NAME}`,
    });
  },

  /** The two numbers need the same number of shaded squares, and every empty
   * square of the first is the other's too, so the other gets all of its own
   * from those and the rest of its block is clear. */
  sameNeed: (m: Compared): Sentence => {
    const fresh = m.need === m.n && m.need === m.other.n;
    return so({
      look: phrase`${thisNumber(m)}'s empty squares are all in ${otherNumber(m)}'s block, and both ${fresh ? "" : "still "}need ${shadeds(m.need)}`,
      follows: phrase`${otherAgain(m)} gets its ${m.need} there`,
      move: phrase`${theseSquares(m)} must be ${UNSHADED_NAME}`,
    });
  },
};
