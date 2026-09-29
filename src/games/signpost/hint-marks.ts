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

import { CELL, type MarkKind, type MarkRef } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import type { SignpostHint } from "./hint.ts";

/** The arrow in a square: the end a link leaves by. */
export const ARROW: MarkKind<Point> = {
  name: "arrow",
  key: (p) => `${p.x},${p.y}`,
};

/** What a step's highlights draw: the `drawn` half of Signpost's legend. */
export function signpostHintMarks(h: SignpostHint): MarkRef[] {
  return [
    { role: "ring", kind: ARROW, elements: [h.arrow] },
    { role: "ring", kind: CELL, elements: [h.target] },
    { role: "stripes", kind: CELL, elements: h.line },
    { role: "outline", kind: CELL, elements: h.others },
  ] as MarkRef[];
}
