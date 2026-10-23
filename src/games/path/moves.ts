/**
 * What drawing a line is in Path: the rules the engine's line drawing takes,
 * and the board a drag would leave.
 *
 * Here and not in `index.ts` so that `render.ts`, which shows a drag as it
 * would be released, reads the same rules (docs/rendering.md § "A
 * simulated-release preview lives in `moves.ts`").
 */

import type { EdgeChange, EdgeMark, LineRules } from "../../engine/line-drawing.ts";
import type { PathState } from "./state.ts";

/** The lines each square takes, no loops, and walls no input changes. */
export const pathLines: LineRules<PathState> = {
  mark: (state, e) => state.edges[e] as EdgeMark,
  takes: (state, i) => state.takes[i],
  loops: false,
  fixed: (state, e) => state.walls[e] === 1,
};

/** The edges of `state` with `changes` made. */
export function withChanges(
  state: PathState,
  changes: readonly EdgeChange[],
): Uint8Array {
  const edges = state.edges.slice();
  for (const { edge, mark } of changes) edges[edge] = mark;
  return edges;
}
