/**
 * What a Pearl hint's words point at: a square, which a step outlines where it
 * reads it, and the edges it decides, which `engine/edge-hint.ts`'s `EDGE`
 * names. The words themselves are the description's
 * (`pearl.description.yaml`), spoken by `hint.ts`.
 */

import type { MarkKind } from "../../engine/contract/hint-words.ts";

/** A square, by its index. */
export const SQUARE: MarkKind<number> = { name: "square", key: String };
