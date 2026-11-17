/**
 * The marks Guess's hint draws, as the engine's kinds (`hint-words.ts`):
 * the scored rows a step reads, the answer slots it leans on, and the colors
 * in the answer row it acts on. `render.ts` paints them and the steps
 * `guess.description.yaml` declares name them.
 */

import type { MarkKind } from "../../engine/hint-words.ts";
import type { SlotMark } from "./state.ts";

/** A scored row, by index, taken as a whole. */
export const ROW: MarkKind<number> = {
  name: "row",
  key: (r) => `${r}`,
  unit: () => "",
};

/** An answer slot, by position. */
export const SLOT: MarkKind<number> = { name: "slot", key: (p) => `${p}` };

/** A color in an answer slot: a rule-out to set, or a probe's pick. */
export const COLOR: MarkKind<SlotMark> = {
  name: "color",
  key: (m) => `${m.pos}:${m.color}`,
};
