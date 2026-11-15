/**
 * What a Magnets hint's words point at: a square, a clue digit, and a row or
 * column (`MarkKind` in `engine/hint-words.ts`). The words themselves are the
 * description's (`magnets.description.yaml`'s `steps`), spoken by `speak.ts`.
 * The squares a step decides are ringed; the squares and clue digits it reasons
 * from are outlined, the digits whatever color the game paints them; the line it
 * counts along is striped.
 *
 * A line is "this row" or "this column", never a number: Magnets draws no line
 * numbers, and the hint marks the line's clue digits instead (docs/hints.md
 * § "Name elements by what the player can see").
 */

import type { MarkKind } from "../../engine/hint-words.ts";

/** A row or column, as the solver names it. */
export interface LineEl {
  roworcol: number;
  num: number;
}

/** A square of the board, by index. */
export const SQUARE: MarkKind<number> = { name: "square", key: String };

/** A clue digit, by its index around the board (`clueIndex`). */
export const CLUE: MarkKind<number> = { name: "clue", key: String };

/** A row or column, clue slots included. */
export const LINE: MarkKind<LineEl> = {
  name: "line",
  key: (l) => `${l.roworcol}:${l.num}`,
};
