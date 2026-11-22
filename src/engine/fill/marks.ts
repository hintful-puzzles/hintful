/**
 * The hint marks a fill board draws beside the cells: a line's clue in the
 * margin, and a link between a cell and the clue its mark names.
 */

import type { MarkKind } from "../contract/hint-words.ts";

/** A line's clue in the margin, by the line's index in the space's `lines`:
 * the rows, then the columns. */
export const LINE: MarkKind<number> = { name: "line", key: String };

/** A link from cell `cell` to the clue's cell `to`, its orthogonal
 * neighbor. */
export interface FillLink {
  readonly cell: number;
  readonly to: number;
}

export const LINK: MarkKind<FillLink> = {
  name: "link",
  key: (l) => `${l.cell}:${l.to}`,
};
