/**
 * Every sentence Flood's hint speaks. The hint replays the solver's fills, so
 * a step names the color to fill with and what that fill gains; the color words
 * are the palette's own (`render.ts`'s `COLOR_NAMES`).
 *
 * The squares the fill joins to the region are what the step decides, so they
 * are the ring in the roles of `engine/hint-words.ts`, drawn as a dot in each;
 * the words that point at them are a reference.
 */

import {
  CELL,
  mark,
  phrase,
  type Sentence,
  sentence,
  unshaped,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { COLOR_NAMES } from "./render.ts";

export const say = {
  /** Fill with `color`, joining the `joined` squares to the region. The
   * fill is the solver's heuristic choice, not one its rivals were proved
   * worse than, so the step says what it does and claims no more. */
  fill: (color: number, joined: readonly Point[]): Sentence => {
    const name = COLOR_NAMES[color] ?? `color ${color}`;
    // A fill that joins nothing gains no square to point at: the move is all
    // there is to say.
    if (joined.length === 0) return unshaped(phrase`Fill with ${name}.`, "bare");
    return sentence({
      move: phrase`fill with ${name}`,
      relation: {
        kind: "effect",
        effect: phrase`it joins ${mark.as("ring", CELL, joined, (els) => (els.length === 1 ? "the dotted square" : "the dotted squares"))} to your region`,
      },
    });
  },
};
