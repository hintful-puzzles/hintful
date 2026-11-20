/**
 * The mark ABCD's hint draws beyond the board's cells and notes, as the
 * engine's kind (`hint-words.ts`). `render.ts` paints it and the steps
 * `abcd.description.yaml` declares name it.
 */

import type { MarkKind } from "../../engine/contract/hint-words.ts";

/** A line's clue for one letter, as its index in `numbers`: the count a step
 * reads, drawn in the hint color. */
export const CLUE: MarkKind<number> = { name: "clue", key: String };
