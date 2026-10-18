/**
 * Every sentence Mosaic's hint speaks.
 *
 * `hint.ts` decides which rule fired and on which squares; this file decides
 * only how it reads. A number's *squares* are its block, its own square and
 * the eight around it, which the help's Hints section says; the sentence names
 * the number and the outline shows the block. The words for a square's two
 * states are the engine's, so a sentence says the color the piece is drawn in.
 */

import { apartByPosition } from "../../engine/apart-by-position.ts";
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
export interface Marked extends Numbered {
  cells: readonly Point[];
}

/** A step that compares two numbers: the first, with `cells`, and the `other`;
 * the shaded squares the first still needs, and by how many that is more than
 * the other needs. */
export interface Compared extends Marked {
  other: Numbered;
  need: number;
  by: number;
}

interface Numbered {
  clue: Point;
  n: number;
}

const thisNumber = (m: Numbered): Narration =>
  mark.this("outline", BLOCK, [m.clue], String(m.n));

/** A pair's two numbers, and the second said again in plain words. A value
 * names each apart from the other, and two of one value are named by where
 * they sit: "the upper 7" and "the lower 7". */
function pairOf(m: Compared): {
  first: Narration;
  other: Narration;
  again: string;
  /** Where one of two numbers of one value sits ("upper"), apart from its
   * value. */
  where: (c: Numbered) => string;
} {
  const name = apartByPosition<Numbered>(
    [m, m.other],
    (c) => c.clue,
    (c) => String(c.n),
  );
  const ref = (c: Numbered): Narration =>
    m.other.n === m.n
      ? mark.as("outline", BLOCK, [c.clue], `the ${name(c)}`)
      : thisNumber(c);
  return {
    first: ref(m),
    other: ref(m.other),
    again: `the ${name(m.other)}`,
    where: (c) => name(c).replace(new RegExp(`^${c.n} | ${c.n}$`), ""),
  };
}
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
  // The ringed squares are all the first number's empty squares outside the
  // other's block, so the board shows how many there are; the words give the
  // two needs, which it does not.
  needsMore: (m: Compared): Sentence => {
    const { first, other, again } = pairOf(m);
    return so({
      look: phrase`${first} needs ${m.by} more ${shadeds(m.by).slice(2)} than ${other}`,
      move: phrase`${theseSquares(m)} outside ${again}'s block must be ${SHADED_NAME}`,
    });
  },

  /** The two numbers need the same number of shaded squares, and every empty
   * square of the first is the other's too, so the other gets all of its own
   * from those and the rest of its block is clear. */
  // The first number's squares to come all lie in the other's block, and the
  // other needs as many, so they are the other's too and the rest of its
  // block is clear.
  sameNeed: (m: Compared): Sentence => {
    const { first, other, again, where } = pairOf(m);
    const look =
      m.n === m.other.n
        ? phrase`${mark.as("outline", BLOCK, [m.clue, m.other.clue], `Both ${m.n}s`)} need ${shadeds(m.need)}, and the ${where(m)} one's all lie in the ${where(m.other)} one's block`
        : phrase`${first} and ${other} both need ${shadeds(m.need)}, and the ${m.n}'s all lie in ${again}'s block`;
    return so({ look, move: phrase`${theseSquares(m)} must be ${UNSHADED_NAME}` });
  },
};
