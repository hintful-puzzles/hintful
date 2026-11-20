/**
 * The mark Wordguess's hint draws, as the engine's kind (`hint-words.ts`):
 * the squares of the working row a suggested guess goes in. `render.ts`
 * paints it and the steps `wordguess.description.yaml` declares name it.
 */

import type { MarkKind } from "../../engine/contract/hint-words.ts";

/** A square of the working row, by position, where a guess's letter goes. */
export const SQUARE: MarkKind<number> = { name: "square", key: (p) => `${p}` };
