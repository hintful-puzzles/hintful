/**
 * Every sentence Unequal's hint speaks that is Unequal's own: the inequality
 * signs. The generic Latin arms are the engine's (`engine/hint-text.ts`),
 * spoken in `edgeClueVocab`, and so are the two setup steps, built by the
 * row/column preset from the two words Unequal gives it (`index.ts`'s
 * `notes`).
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `premise`); this file decides only how it reads. Every arm reads correctly
 * at the value extremes: a trivial inequality bound becomes "the
 * smallest/largest number" rather than the vacuous "no less than 1".
 */

import {
  across,
  type CluePair,
  theClue,
} from "../../engine/edge-clue-latin/hint-text.ts";
import { displayChar } from "../../engine/edge-clue-latin/state.ts";
import { type Narration, phrase } from "../../engine/hint-words.ts";

/** A sign deduction's premise; the walk concludes it with the move it makes
 * (`engine/hint-text.ts`'s `Premise`). */
export const say = {
  /** The struck cell is the larger side of a sign whose other cell is at least
   * `bound`. */
  greater: (p: CluePair, bound: number, order: number): Narration =>
    bound <= 1
      ? phrase`The larger side of ${theClue(p, "this greater-than sign")} can't hold the smallest number`
      : phrase`${across(p, "The outlined smaller side")} of ${theClue(p, "this greater-than sign")} is at least ${displayChar(bound, order)}`,

  /** The struck cell is the smaller side of a sign whose other cell is at most
   * `bound`, in a grid of `order`. */
  lesser: (p: CluePair, bound: number, order: number): Narration =>
    bound >= order
      ? phrase`The smaller side of ${theClue(p, "this greater-than sign")} can't hold the largest number`
      : phrase`${across(p, "The outlined larger side")} of ${theClue(p, "this greater-than sign")} is at most ${displayChar(bound, order)}`,
};
