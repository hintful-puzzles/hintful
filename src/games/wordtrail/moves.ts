/**
 * What drawing a line is in Wordtrail: the rules the engine's line drawing
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
  LINE,
  type LineRules,
} from "../../engine/mechanics/line-drawing.ts";
import {
  codeOf,
  isDarkEdge,
  LINE_BACK,
  lineFrom,
  type WordtrailState,
} from "./state.ts";

/** A word runs through a letter at most once, in and out, reads from its
 * first letter on, and never closes a loop; an edge beside a dark square is
 * the board's, which the drag meets as it meets a cross. */
export const wordtrailLines: LineRules<WordtrailState> = {
  mark: (state, e) =>
    isDarkEdge(state, e)
      ? CROSS
      : state.edges[e] === LINE_BACK
        ? LINE
        : (state.edges[e] as EdgeMark),
  takes: (state, i) => (state.letters[i] === 0 ? 0 : 2),
  loops: false,
  fixed: (state, e) => isDarkEdge(state, e),
  directed: { from: lineFrom },
};

/** The edges of `state` with `changes` made. */
export function withChanges(
  state: WordtrailState,
  changes: readonly EdgeChange[],
): Uint8Array {
  const edges = state.edges.slice();
  for (const change of changes)
    if (!isDarkEdge(state, change.edge)) edges[change.edge] = codeOf(state, change);
  return edges;
}
