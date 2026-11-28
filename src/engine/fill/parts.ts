/**
 * A board whose cells are the parts of a partition of a grid of squares
 * (`space.parts`, Map's regions). The rules, the notes, the walk and the
 * mistakes read the parts, stored as one row of cells numbered in reading
 * order of their first squares; the squares are where the deal divides,
 * the ID writes and the board is drawn and pressed. The partition is a
 * `Squares`, which holds its parts' sides, so a relation the description
 * reads off it (`sides`) is no second copy any deal or ID keeps.
 */

import { describedSpace, type GridSpace } from "../solve/describe-runtime.ts";

/** What the compiled deal says of a board of parts. */
export interface PartsSpace {
  /** The partition of the squares, which the board deals. */
  readonly of: string;
  /** The size the params give that counts the parts. */
  readonly count: string;
}

/** The grid of squares a board of parts of the params `p` is divided on. */
export const squareSpace = (p: { w: number; h: number }): GridSpace =>
  describedSpace([], p.w, p.h);

/** The stored size of a board of parts: its parts in one row. */
export function partsStore(
  parts: PartsSpace,
  sizes: Readonly<Record<string, number>>,
): { w: number; h: number } {
  const n = sizes[parts.count];
  if (n === undefined) throw new Error(`parts: no size ${parts.count} on the board`);
  return { w: n, h: 1 };
}
