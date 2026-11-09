/**
 * What drawing a line is in Path: the rules the engine's line drawing takes,
 * and the board a drag would leave.
 *
 * Here and not in `index.ts` so that `render.ts`, which shows a drag as it
 * would be released, reads the same rules (docs/rendering.md § "A
 * simulated-release preview lives in `moves.ts`").
 */

import {
  type EdgeChange,
  type EdgeMark,
  LINE,
  type LineRules,
} from "../../engine/line-drawing.ts";
import { across, squareEdges } from "../../engine/square-edges.ts";
import { MODE_PATH, NO_END, type PathState } from "./state.ts";

/** The lines each square takes, no loops, walls no input changes, and a
 * drag from a number that replaces its line ahead. */
export const pathLines: LineRules<PathState> = {
  mark: (state, e) => state.edges[e] as EdgeMark,
  takes: (state, i) => state.takes[i],
  loops: false,
  fixed: (state, e) => state.walls[e] === 1,
  restarts: (state, i) => lineAhead(state, i),
};

/**
 * The lines that run on from the number on square `i`, to the end of its
 * piece, through any numbers on the way: a stroke from a number draws its
 * line again from there (owner, 2026-10-23). In Path, a side whose first
 * number is lower is the line behind, and stays, and one whose first number
 * is higher is ahead. A side that reaches no number runs opposite to the
 * number's other side; the 1's is ahead and the last number's behind. A
 * middle number's lone loose side may be either, so it stays while the
 * number has room for the stroke: a player drawing back toward the number
 * before lost it to a stroke on toward the next (owner, 2026-11-09). In
 * Pairs a number's one line is ahead, as in Flow Free.
 */
function lineAhead(state: PathState, i: number): number[] {
  const n = state.ends[i];
  if (n === NO_END) return [];
  const g = squareEdges(state.w, state.h);
  const lined = (at: number, except: number): number => {
    for (let d = 0; d < 4; d++) {
      const e = g.around[at * 4 + d];
      if (e >= 0 && e !== except && state.edges[e] === LINE) return e;
    }
    return -1;
  };
  const sides: { run: number[]; reached: number }[] = [];
  for (let d = 0; d < 4; d++) {
    const first = g.around[i * 4 + d];
    if (first < 0 || state.edges[first] !== LINE) continue;
    const run = [first];
    let reached = NO_END;
    for (let at = across(g, first, i); at !== i; ) {
      if (reached === NO_END) reached = state.ends[at];
      const next = lined(at, run[run.length - 1]);
      if (next < 0) break;
      run.push(next);
      at = across(g, next, at);
    }
    sides.push({ run, reached });
  }
  if (state.mode !== MODE_PATH) return sides.flatMap((s) => s.run);
  const last = n !== 1 && state.takes[i] === 1;
  const ahead = (side: { reached: number }, other: { reached: number } | null) => {
    if (side.reached !== NO_END) return side.reached > n;
    if (n === 1 || last) return n === 1;
    if (other === null) return false;
    if (other.reached !== NO_END) return other.reached < n;
    // Two loose sides fill the number, and nothing says which runs on.
    return true;
  };
  return sides.flatMap((side, k) =>
    ahead(side, sides.length > 1 ? sides[1 - k] : null) ? side.run : [],
  );
}

/** The edges of `state` with `changes` made. */
export function withChanges(
  state: PathState,
  changes: readonly EdgeChange[],
): Uint8Array {
  const edges = state.edges.slice();
  for (const { edge, mark } of changes) edges[edge] = mark;
  return edges;
}
