/**
 * What a Dominosa hint's words point at that is not a square: a spot. The
 * words themselves are the description's (`dominosa.description.yaml`), spoken
 * by `hint.ts`.
 */

import type { MarkKind } from "../../engine/contract/hint-words.ts";

/** A spot: two neighboring squares, by index, which a domino could cover. A
 * step decides one, and rings its two squares as one domino, with a line drawn
 * across its middle when it rules one out. */
export type Spot = readonly [number, number];

export const SPOT: MarkKind<Spot> = {
  name: "spot",
  key: ([a, b]) => (a < b ? `${a}-${b}` : `${b}-${a}`),
};
