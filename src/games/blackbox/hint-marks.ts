/**
 * The marks Black Box's hint draws beyond the box's squares, as the engine's
 * kinds (`hint-words.ts`), and what each role means here. `render.ts` paints
 * them and the steps `blackbox.description.yaml` declares name them.
 */

import type { HintMarkLegend } from "../../engine/contract/game.ts";
import type { MarkKind } from "../../engine/contract/hint-words.ts";

/** A square of the firing range around the box, by its laser number. */
export const LASER: MarkKind<number> = { name: "laser", key: String };

/** The corner button that checks the answer. */
export const BUTTON: MarkKind<"button"> = { name: "button", key: () => "button" };

/** What each mark means here, as the help's list of marks gives it. */
export const HINT_MARKS: HintMarkLegend = {
  roles: {
    ring: "what the step decides: the square to mark as known or to put a ball on, the laser to fire, or the button that checks your answer.",
    outline: "the ends of the fired laser the step reasons from.",
  },
};
