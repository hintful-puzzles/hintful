/**
 * The marks Skeleton's hint draws, as the engine's kinds (`hint-words.ts`):
 * the scored row a step reads, the digits in the answer row it rules out, and
 * the squares of the working row a suggested guess goes in. `render.ts`
 * paints them and the steps `skeleton.description.yaml` declares name them.
 */

import type { MarkKind } from "../../engine/contract/hint-words.ts";
import type { RuleOut } from "../../engine/mechanics/code-rows.ts";

/** A scored row, by index, taken as a whole. */
export const ROW: MarkKind<number> = {
  name: "row",
  key: (r) => `${r}`,
  unit: () => "",
};

/** A digit in an answer slot: a rule-out to set. */
export const DIGIT: MarkKind<RuleOut> = {
  name: "digit",
  key: (m) => `${m.pos}:${m.value}`,
};

/** A square of the working row, by position, where a guess's digit goes. */
export const SQUARE: MarkKind<number> = { name: "square", key: (p) => `${p}` };
