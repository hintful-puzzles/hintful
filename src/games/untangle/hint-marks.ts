/**
 * What Untangle's hint marks are drawn on: points of the graph, the spot a
 * step moves its point to, and crossings of two lines.
 */

import type { MarkKind } from "../../engine/contract/hint-words.ts";
import type { Point } from "../../engine/contract/types.ts";
import type { RationalPoint } from "./state.ts";

/** A point of the graph, by index. */
export const VERTEX: MarkKind<number> = { name: "point", key: (v) => `${v}` };

/** The spot a step moves its point to. */
export const SPOT: MarkKind<RationalPoint> = {
  name: "spot",
  key: (p) => `${p.x}/${p.d},${p.y}/${p.d}`,
};

/** A crossing of two lines, where it is drawn. `lines` names the pair, which
 * is what tells two crossings apart: a line through another's end crosses
 * both lines there, at one spot, and the sentence counts both. */
export type Crossing = Point & { readonly lines: string };

export const CROSSING: MarkKind<Crossing> = {
  name: "crossing",
  key: (c) => c.lines,
};

/** What one step marks: the point it moves, where to, the crossings of that
 * point's lines the move clears, and, on a journey, the points still to move. */
export interface UntangleMarks {
  vertex: number;
  to: RationalPoint;
  cleared: readonly Crossing[];
  marked: readonly number[];
}
