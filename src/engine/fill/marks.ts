/**
 * The hint marks a fill board draws beside the cells: a link between a cell
 * and the clue its mark names, and on an answer on the edges an edge a step
 * asks a value of. A line's clue is no mark of its own: the striped line
 * hatches it.
 */

import { CELL, type MarkKind } from "../contract/hint-words.ts";
import type { Point } from "../contract/types.ts";

/** An edge a step decides, at its half-grid point (`edge-target.ts`), with
 * the value it asks, which its ring draws inside it. */
export interface AskedEdge extends Point {
  readonly value: number;
}

export const ASKED_EDGE: MarkKind<AskedEdge> = { name: "edge", key: CELL.key };

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
