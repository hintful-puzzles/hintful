/**
 * A params field whose bounds leave it one value: no choice a player makes.
 * Subsets' board is the case, 4x4 over four letters, the one size whose
 * sixteen sets fill sixteen squares. The Custom dialog leaves such a field
 * out, and the preset menu owes it no range of boards.
 */

import type { ParamConfigItem } from "../contract/game.ts";

export function isFixedField<P>(item: ParamConfigItem<P>): boolean {
  return (
    item.type === "string" &&
    item.bounds?.min !== undefined &&
    item.bounds.min === item.bounds.max
  );
}
