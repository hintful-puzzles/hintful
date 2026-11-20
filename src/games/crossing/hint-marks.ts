/**
 * The mark Crossing's hint draws beyond the board's squares and notes, as the
 * engine's kind (`hint-words.ts`): a number in the clue list. `render.ts`
 * paints it and the steps `crossing.description.yaml` declares name it.
 */

import type { MarkKind } from "../../engine/contract/hint-words.ts";

/** A number in the clue list, by its index there. */
export const LISTED: MarkKind<number> = { name: "listed number", key: String };
