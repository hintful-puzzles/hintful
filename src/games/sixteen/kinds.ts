import type { MarkKind } from "../../engine/contract/hint-words.ts";

/** A tile, by its number, wherever it sits; its mark includes the arrow that
 * slides it. */
export const TILE: MarkKind<number> = { name: "tile", key: (t) => `${t}` };

/** A square of the board, by flat index. */
export const SQUARE: MarkKind<number> = { name: "square", key: (i) => `${i}` };
