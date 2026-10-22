/**
 * What drawing a line is in Skeleton: the rules the engine's line drawing
 * takes, and the board a drag would leave.
 *
 * Here and not in `index.ts` so that `render.ts`, which shows a drag as it
 * would be released, reads the same rules (docs/rendering.md § "A
 * simulated-release preview lives in `moves.ts`").
 */

import {
  CROSS,
  type EdgeChange,
  type EdgeMark,
  type LineRules,
} from "../../engine/line-drawing.ts";
import { LINES_PER_SQUARE, type SkeletonState } from "./state.ts";

/** Two lines through every square, one loop, and no line through a wall,
 * which the drag meets as it meets a cross. */
export const skeletonLines: LineRules<SkeletonState> = {
  mark: (state, e) => (state.walls[e] ? CROSS : (state.edges[e] as EdgeMark)),
  takes: () => LINES_PER_SQUARE,
  loops: true,
};

/** The edges of `state` with `changes` made. */
export function withChanges(
  state: SkeletonState,
  changes: readonly EdgeChange[],
): Uint8Array {
  const edges = state.edges.slice();
  for (const { edge, mark } of changes) if (!state.walls[edge]) edges[edge] = mark;
  return edges;
}
