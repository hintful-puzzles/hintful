/**
 * What Ascent's hint marks are drawn on: squares by index, and a whole run's
 * route, which the render draws as the game's path line inside each square's
 * ring.
 */

import type { MarkKind } from "../../engine/contract/hint-words.ts";

/** A square of the board, by index. */
export const SQUARE: MarkKind<number> = { name: "square", key: String };

/** A square of a whole run's route: each square it fills is ringed, with the
 * game's path line through it inside the ring. */
export const PATH: MarkKind<number> = {
  name: "path",
  key: String,
  within: (i) => ({ kind: SQUARE.name, key: String(i) }),
};
