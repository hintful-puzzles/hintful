/**
 * The words the edge-clue games' hints share: the value vocabulary for the
 * generic Latin arms (`engine/hint/hint-text.ts`).
 *
 * A value prints as the board draws it, `state.ts`'s `displayChar` at the grid's
 * order, which runs 0-based digits and then letters once the order passes 9.
 */

import type { LatinVocab } from "../hint/hint-text.ts";
import { displayChar } from "./state.ts";

/** The value vocabulary for the shared generic-Latin arms. */
export function edgeClueVocab(order: number, cell: string): LatinVocab {
  return { noun: "number", cell, value: (n) => displayChar(n, order) };
}
