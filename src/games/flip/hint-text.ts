/**
 * Every sentence Flip's hint speaks.
 *
 * The square to press is what the step decides, so it is the ring in the roles
 * of `engine/hint-words.ts`. The dark squares the press is for are what it
 * reasons from, the outline. Whatever else the press flips is striped, so no
 * square a step changes goes unmarked.
 */

import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  sentence,
  so,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

const thisSquare = (press: Point): Narration =>
  mark.this("ring", CELL, [press], "square");

export const say = {
  /** `press` is the last square in reading order that flips each of `owed`,
   * and they are dark; `also` is every other square it flips. "Row by row" is
   * the order, said on the step because "can still" is false without it: an
   * earlier square could light them if the player went back to one. */
  lastChance: (
    press: Point,
    owed: readonly Point[],
    also: readonly Point[],
  ): Sentence => {
    const must = phrase`it must be pressed`;
    const striped = mark.as("stripes", CELL, also, (els) =>
      els.length === 1 ? "the striped one" : "the striped ones",
    );
    return so({
      look: phrase`row by row, only ${thisSquare(press)} can still light ${mark.the("outline", CELL, owed, "square")}`,
      move: also.length > 0 ? phrase`${must}. It flips ${striped} too` : must,
    });
  },

  /** A press the order gives no reason for, so the step gives the one it has:
   * the board takes `left` presses and no fewer, and this is one of them.
   * `only` when no other set of presses lights the board. */
  fromTheAnswer: (press: Point, left: number, only: boolean): Sentence =>
    sentence({
      look: only
        ? phrase`there is only one way to light the whole board, and it takes ${left} presses`
        : phrase`the whole board can be lit in ${left} presses, and no fewer`,
      move: phrase`press ${thisSquare(press)}`,
      relation: { kind: "oneOf" },
    }),

  /** The press that leaves no square dark. `lit` is every dark square but
   * `press` itself, all of which it flips. */
  lastPress: (press: Point, lit: readonly Point[]): Sentence =>
    sentence({
      move: phrase`press ${thisSquare(press)}`,
      relation: {
        kind: "effect",
        effect:
          lit.length > 0
            ? phrase`that lights ${mark.the("outline", CELL, lit, "square")} and finishes the board`
            : phrase`that finishes the board`,
      },
    }),
};
