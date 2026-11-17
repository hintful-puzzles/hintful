import type { MarkKind } from "../../engine/hint-words.ts";

/** A block, by the cell of the top-left square of the ones it turns. */
export const BLOCK: MarkKind<number> = { name: "block", key: (c) => `${c}` };

/** A tile, by the cell it stands on when the step is shown. */
export const TILE: MarkKind<number> = { name: "tile", key: (c) => `${c}` };

/** A finished tile a run takes out of place, by the cell it stands on when the
 * step is shown. */
export const LIFTED: MarkKind<number> = { name: "lifted", key: (c) => `${c}` };
