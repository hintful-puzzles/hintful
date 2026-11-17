import type { MarkKind } from "../../engine/hint-words.ts";

/** The tile a hint step moves, by the cell it sits in; its mark includes the
 * arrow that slides it. */
export const TILE: MarkKind<number> = { name: "tile", key: String };
