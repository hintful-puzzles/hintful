/**
 * The marks Signpost's hint draws, as the engine's roles (`hint-words.ts`).
 *
 * A step decides a **link**, and a link has two ends that are different
 * things: the arrow it leaves by and the square it arrives at. So both ends are
 * rings, in two kinds: the arrow is redrawn in the action color, and the square
 * is ringed on its border. That is what lets one sentence say "this arrow" and
 * "the ringed square" with two rings on the board and mean one of each; two
 * ringed squares would leave "this square" pointing at neither.
 */

import type { MarkKind } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** The arrow in a square: the end a link leaves by. */
export const ARROW: MarkKind<Point> = {
  name: "arrow",
  key: (p) => `${p.x},${p.y}`,
};
