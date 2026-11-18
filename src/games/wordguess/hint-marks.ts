/**
 * The marks Wordguess's hint draws, as the engine's kinds (`hint-words.ts`):
 * the scored rows a step reads, the answer slots it leans on, the letters in
 * the answer row it rules out, and the squares a guess it suggests goes in.
 * `render.ts` paints them and the steps
 * `wordguess.description.yaml` declares name them.
 */

import type { MarkKind } from "../../engine/hint-words.ts";
import type { LetterMark } from "./state.ts";

/** A scored row, by index, taken as a whole. */
export const ROW: MarkKind<number> = {
  name: "row",
  key: (r) => `${r}`,
  unit: () => "",
};

/** An answer slot, by position. */
export const SLOT: MarkKind<number> = { name: "slot", key: (p) => `${p}` };

/** A letter in an answer slot, which a step rules out. */
export const LETTER: MarkKind<LetterMark> = {
  name: "letter",
  key: (m) => `${m.pos}:${m.letter}`,
};

/** A square of the working row, by position, where a guess's letter goes. */
export const SQUARE: MarkKind<number> = { name: "square", key: (p) => `${p}` };
