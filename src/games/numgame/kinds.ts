import type { HintMarkLegend } from "../../engine/contract/game.ts";
import type { MarkKind } from "../../engine/contract/hint-words.ts";
import type { Op } from "./solver.ts";

/** A number on the board, by its place. */
export const TILE: MarkKind<number> = { name: "tile", key: String };

/** An operator's button. */
export const SIGN: MarkKind<Op> = { name: "sign", key: String };

/** What each mark means here, as the help's list of marks gives it. */
export const HINT_MARKS: HintMarkLegend = {
  roles: {
    ring: "the two numbers to combine, and the operator to combine them with.",
  },
};
