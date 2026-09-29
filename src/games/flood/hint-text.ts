/**
 * Every sentence Flood's hint speaks. The hint replays the solver's fills, so
 * a step names the color to fill with and what that fill gains; the color words
 * are the palette's own (`render.ts`'s `COLOR_NAMES`).
 *
 * The squares the fill joins to the region are what the step decides, so they
 * are the ring in the roles of `engine/hint-words.ts`, drawn as a dot in each;
 * the words that point at them are a reference.
 */

import { CELL, mark, type Narration, phrase } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { COLOR_NAMES } from "./render.ts";

export const say = {
  /** Fill with `color`, joining the `joined` squares to the region. */
  fill: (color: number, joined: readonly Point[]): Narration => {
    const name = COLOR_NAMES[color] ?? `color ${color}`;
    return joined.length === 0
      ? phrase`Fill with ${name}.`
      : phrase`Fill with ${name} to join ${mark.as("ring", CELL, joined, (els) => (els.length === 1 ? "the dotted square" : "the dotted squares"))} to your region.`;
  },
};
