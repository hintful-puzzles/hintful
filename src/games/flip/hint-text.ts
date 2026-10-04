/**
 * Every sentence Flip's hint speaks. The hint works through an answer in
 * reading order, so "later" in a sentence means further on in that order, which
 * the help page's Hints section says.
 *
 * The square to press is what the step decides, so it is the ring in the roles
 * of `engine/hint-words.ts`; the dark squares the press is the last chance to
 * light are what it reasons from, the outline.
 */

import {
  CELL,
  mark,
  phrase,
  type Sentence,
  so,
  unshaped,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

export const say = {
  /** `press` is the last square in reading order that flips each of `owed`,
   * and they are dark. */
  lastChance: (press: Point, owed: readonly Point[]): Sentence =>
    so({
      look: phrase`no later square flips ${mark.the("outline", CELL, owed, "dark square")}`,
      move: phrase`${mark.this("ring", CELL, [press], "square")} must be pressed`,
    }),

  /** Every square `press` flips has a later square that flips it too, so the
   * sweep has no reason for it: the answer is the reason. `only` when no other
   * set of presses lights the board. */
  fromTheAnswer: (press: Point, only: boolean): Sentence =>
    unshaped(
      phrase`Whatever ${mark.this("ring", CELL, [press], "square")} flips can still be flipped later, so no one square decides it. ${only ? "The only" : "A shortest"} answer presses it.`,
      "setup",
    ),
};
