/**
 * A board whose cells are the parts of a partition of a grid of squares
 * (`space.parts`, Map's regions). The rules, the notes, the walk and the
 * mistakes read the parts, stored as one row of cells numbered in reading
 * order of their first squares; the squares are where the deal divides,
 * the ID writes and the board is drawn and pressed. The partition is a
 * `Squares`, which holds its parts' sides, so a relation the description
 * reads off it (`sides`) is no second copy any deal or ID keeps.
 */

import {
  describedSpace,
  type GridSpace,
  type Squares,
} from "../solve/describe-runtime.ts";
import { type Clues, type FillBoard, type FillModule, spaceOf } from "./board.ts";
import { encodeDesc } from "./desc.ts";
import { type PartsGeometry, partsGeometry } from "./render/parts-geometry.ts";

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

/** Where a board of parts lies on its squares, which its drawing and its
 * input both read: one board is drawn and pressed frame after frame, so a
 * board's geometry is made once, from its clues. */
export function geometryOfParts<C extends Clues<C>>(
  module: FillModule<C>,
  parts: PartsSpace,
): (b: FillBoard<C>) => PartsGeometry {
  const deal = module.deal;
  if (deal === undefined) throw new Error("parts: a board of parts is dealt");
  const made = new WeakMap<object, PartsGeometry>();
  return (b) => {
    const key = b.dealt as object;
    let got = made.get(key);
    if (got === undefined) {
      const map = b.dealt[parts.of as keyof C] as unknown as Squares;
      // Upstream seeds the smoothing with the ID, which the board's clues
      // write again.
      got = partsGeometry(map, encodeDesc(module, deal, spaceOf(module, b), b.dealt));
      made.set(key, got);
    }
    return got;
  };
}
