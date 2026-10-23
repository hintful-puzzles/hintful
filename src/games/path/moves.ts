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
 * number is lower is the line behind, and stays; every other side is ahead.
 * In Pairs a number's one line is ahead, as in Flow Free.
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
  const out: number[] = [];
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
    const behind = state.mode === MODE_PATH && reached !== NO_END && reached < n;
    if (!behind) out.push(...run);
  }
  return out;
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
