import type { MarkKind } from "../../engine/hint-words.ts";

/** A tile, by its number, wherever it sits: what a hint step slides. */
export const TILE: MarkKind<number> = { name: "tile", key: (t) => `${t}` };
