/**
 * The marks Subsets' hint draws, as the engine's roles (`hint-words.ts`).
 *
 * A step decides one letter's position in a cell, framed on its own, so a
 * letter position is a kind of its own, drawn inside its cell. The tally below
 * the grid lists every set by value, and a hint boxes entries there: the set a
 * rule-out step decides is ringed, and the sets a step counts are outlined.
 */

import type { MarkKind } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

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
