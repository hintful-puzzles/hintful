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
  type LineRules,
} from "../../engine/line-drawing.ts";
import { isDarkEdge, type WordtrailState } from "./state.ts";

/** A word runs through a letter at most once, in and out, and never closes
 * a loop; an edge beside a dark square is the board's, which the drag meets
 * as it meets a cross. */
export const wordtrailLines: LineRules<WordtrailState> = {
  mark: (state, e) => (isDarkEdge(state, e) ? CROSS : (state.edges[e] as EdgeMark)),
  takes: (state, i) => (state.letters[i] === 0 ? 0 : 2),
  loops: false,
  fixed: (state, e) => isDarkEdge(state, e),
};

/** The edges of `state` with `changes` made. */
export function withChanges(
  state: WordtrailState,
  changes: readonly EdgeChange[],
): Uint8Array {
  const edges = state.edges.slice();
  for (const { edge, mark } of changes)
    if (!isDarkEdge(state, edge)) edges[edge] = mark;
  return edges;
}
