/**
 * What drawing a line is in Path: the rules the engine's line drawing takes,
 * and the board a drag would leave.
 *
 * Here and not in `index.ts` so that `render.ts`, which shows a drag as it
 * would be released, reads the same rules (docs/rendering.md § "A
 * simulated-release preview lives in `moves.ts`").
 */

import type { EdgeChange, EdgeMark, LineRules } from "../../engine/line-drawing.ts";
import { degreeOf, type PathState } from "./state.ts";

/** One line from a number, two through any other square, and no loops. */
export const pathLines: LineRules<PathState> = {
  mark: (state, e) => state.edges[e] as EdgeMark,
  takes: (state, i) => degreeOf(state.ends, i),
  loops: false,
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
