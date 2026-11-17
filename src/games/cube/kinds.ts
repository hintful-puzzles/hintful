import type { MarkKind } from "../../engine/hint-words.ts";

/** A grid square, by its index in the arena. */
export const SQUARE: MarkKind<number> = { name: "square", key: String };
