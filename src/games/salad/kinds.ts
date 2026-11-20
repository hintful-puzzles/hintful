/**
 * What a Salad hint's words point at beyond a square: a border clue, drawn by
 * lighting its letter in the hint color (`render.ts`). The words themselves are
 * the description's (`salad.description.yaml`'s `steps`), spoken by `speak.ts`.
 */

import type { MarkKind } from "../../engine/contract/hint-words.ts";

/** A border clue, by its index round the board (`clueSide`). */
export const CLUE: MarkKind<number> = { name: "clue", key: (c) => String(c) };
