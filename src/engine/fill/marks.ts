/**
 * The hint mark a fill board draws beside the cells: a link between a cell
 * and the clue its mark names. A line's clue is no mark of its own: the
 * striped line hatches it.
 */

import type { MarkKind } from "../contract/hint-words.ts";

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
