/**
 * What drawing a line does: the edges a drag through some squares changes,
 * and how a drag grows as the pointer or the cursor moves.
 *
 * Here and not in `index.ts` so that `render.ts`, which shows a drag as it
 * would be released, reads the same function (docs/rendering.md § "A
 * simulated-release preview lives in `moves.ts`").
 */

import {
  CROSS,
  degreeOf,
  type EdgeMark,
  edgeBetween,
  geometry,
  LINE,
  OPEN,
  type PathDrag,
  type PathState,
} from "./state.ts";

/** One edge a move sets. */
export interface EdgeChange {
  edge: number;
  mark: EdgeMark;
}

/**
 * The edges a drag through `cells` sets: a line along every edge it passes,
 * keeping the lines already there, so that a drag along a line and on past
 * its end carries the line on. A drag that passes only lines takes them up.
 * Upstream's sketch of the game took up the lines a drag started along even
 * where it went on to lay one, and a player tracing a line to continue it
 * lost it (owner, 2026-10-21).
 */
export function dragChanges(state: PathState, cells: readonly number[]): EdgeChange[] {
  const g = geometry(state.w, state.h);
  const passed: number[] = [];
  for (let k = 1; k < cells.length; k++)
    passed.push(edgeBetween(g, cells[k - 1], cells[k]));
  const lays = passed.some((e) => state.edges[e] !== LINE);
  const edges = state.edges.slice();
  for (const e of passed) edges[e] = lays ? LINE : OPEN;
  const out: EdgeChange[] = [];
  for (let e = 0; e < g.edgeCount; e++)
    if (edges[e] !== state.edges[e]) out.push({ edge: e, mark: edges[e] as EdgeMark });
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

/** How many lines square `i` has in `edges`. */
function linesAt(state: PathState, edges: Uint8Array, i: number): number {
  const g = geometry(state.w, state.h);
  let n = 0;
  for (let k = 0; k < 4; k++) {
    const e = g.around[i * 4 + k];
    if (e >= 0 && edges[e] === LINE) n++;
  }
  return n;
}

/** Whether a line can go on edge `e`: it is not crossed out, and neither
 * square it joins has all the lines it takes. The game never lets a square
 * take more, as upstream's sketch asks. */
export function lineFits(state: PathState, edges: Uint8Array, e: number): boolean {
  if (edges[e] === CROSS) return false;
  if (edges[e] === LINE) return true;
  const g = geometry(state.w, state.h);
  return [g.a[e], g.b[e]].every(
    (i) => linesAt(state, edges, i) < degreeOf(state.ends, i),
  );
}

/**
 * Carry `drag` on to square `to`. Back onto a square it has passed through,
 * it is cut back to there. Otherwise it walks a square at a time in a
 * straight line toward `to`, so a quick drag along a row loses nothing, and
 * stops where the next edge is crossed out or where its line would give a
 * square more lines than it takes. A step off the row and column it is on
 * does nothing, as upstream's sketch asks: the drag waits for the pointer to
 * come back.
 */
export function extendDrag(state: PathState, drag: PathDrag, to: number): void {
  const { w } = state;
  const g = geometry(state.w, state.h);
  const seen = drag.cells.indexOf(to);
  if (seen >= 0) {
    drag.cells.length = seen + 1;
    return;
  }
  const last = drag.cells[drag.cells.length - 1];
  const [lx, ly] = [last % w, Math.floor(last / w)];
  const [tx, ty] = [to % w, Math.floor(to / w)];
  if (lx !== tx && ly !== ty) return;
  const step = lx === tx ? (ty > ly ? w : -w) : tx > lx ? 1 : -1;
  for (let at = last; at !== to; ) {
    const next = at + step;
    if (drag.cells.includes(next)) return;
    // Judged on the board as the drag would leave it with this step, since
    // a step that lays a line keeps the lines the drag has passed.
    const e = edgeBetween(g, at, next);
    if (state.edges[e] === CROSS) return;
    const cells = [...drag.cells, next];
    const after = withChanges(state, dragChanges(state, cells));
    if ([at, next].some((i) => linesAt(state, after, i) > degreeOf(state.ends, i)))
      return;
    drag.cells.push(next);
    at = next;
  }
}
