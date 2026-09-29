/**
 * The marks Subsets' hint draws, as the engine's roles (`hint-words.ts`).
 *
 * A step decides one letter's position in a cell, framed on its own, so a
 * letter position is a kind of its own, drawn inside its cell. The tally below
 * the grid lists every set by value, and a hint boxes entries there: the set a
 * rule-out step decides is ringed, and the sets a step counts are outlined.
 */

import { CELL, type MarkKind, type MarkRef } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import type { SubsetsHintHighlights } from "./index.ts";

/** One letter's position in a cell: letter `bit` of the cell at (x, y). */
export type Slot = Point & { readonly bit: number };

const cellKey = (p: Point): string => `${p.x},${p.y}`;

export const SLOT: MarkKind<Slot> = {
  name: "slot",
  key: (s) => `${cellKey(s)}:${s.bit}`,
  unit: cellKey,
  within: (s) => ({ kind: "cell", key: cellKey(s) }),
};

/** A set's entry in the tally, by its value. */
export const TALLY_SET: MarkKind<number> = {
  name: "tally set",
  key: (v) => `${v}`,
};

/** What a step's highlights draw: the `drawn` half of Subsets' legend. */
export function subsetsHintMarks(h: SubsetsHintHighlights): MarkRef[] {
  return [
    h.slot === null
      ? { role: "ring", kind: CELL, elements: [h.target] }
      : { role: "ring", kind: SLOT, elements: [{ ...h.target, bit: h.slot }] },
    { role: "ring", kind: TALLY_SET, elements: h.rule === null ? [] : [h.rule] },
    { role: "outline", kind: CELL, elements: h.cells },
    { role: "outline", kind: TALLY_SET, elements: h.sets },
    { role: "stripes", kind: CELL, elements: h.spotlight },
  ] as MarkRef[];
}
