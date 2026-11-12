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
 * drag from a number or the middle of a line that replaces the line ahead. */
export const pathLines: LineRules<PathState> = {
  mark: (state, e) => state.edges[e] as EdgeMark,
  takes: (state, i) => state.takes[i],
  loops: false,
  fixed: (state, e) => state.walls[e] === 1,
  restarts: (state, i, toward) => lineAhead(state, i, toward),
};

/** One side of a square's line: its edges, out to the end of its piece, and
 * the numbers it meets on the way, in order. */
interface Side {
  run: number[];
  numbers: number[];
}

/**
 * The lines that run on from square `i`, a number or a square in the middle
 * of a line, to the end of its piece, through any numbers on the way: a
 * stroke from there draws the line again (owner, 2026-10-23 for a number,
 * 2026-11-09 for the middle of a line). A line's loose end has none, so a
 * stroke from it pulls the line back. The stroke steps first to `toward`.
 *
 * A number with room for another line, stroked a new way, replaces nothing:
 * the stroke is that line. A 3 with only its line on to the 4 lost the 4, 5
 * and 6 to a stroke toward the 2 (owner, 2026-11-12).
 *
 * In Path, the side ahead is the one the numbers rise along. Where they do
 * not say, as on a fragment that meets no number, it is the side the stroke
 * sets off along, and a stroke that sets off a new way replaces nothing. A
 * player drawing back from the 3 toward the 2 lost that line to a stroke from
 * the 3 on toward the 4 when it counted as ahead (owner, 2026-11-09). In
 * Pairs a number's one line is ahead, as in Flow Free; from the middle of a
 * line, the side away from the one number it meets, or else the side the
 * stroke sets off along.
 */
function lineAhead(state: PathState, i: number, toward: number): number[] {
  const n = state.ends[i];
  const g = squareEdges(state.w, state.h);
  const lined = (at: number, except: number): number => {
    for (let d = 0; d < 4; d++) {
      const e = g.around[at * 4 + d];
      if (e >= 0 && e !== except && state.edges[e] === LINE) return e;
    }
    return -1;
  };
  const sides: Side[] = [];
  let along: Side | null = null;
  for (let d = 0; d < 4; d++) {
    const first = g.around[i * 4 + d];
    if (first < 0 || state.edges[first] !== LINE) continue;
    const side: Side = { run: [first], numbers: [] };
    for (let at = across(g, first, i); at !== i; ) {
      if (state.ends[at] !== NO_END) side.numbers.push(state.ends[at]);
      const next = lined(at, side.run[side.run.length - 1]);
      if (next < 0) break;
      side.run.push(next);
      at = across(g, next, at);
    }
    sides.push(side);
    if (across(g, first, i) === toward) along = side;
  }
  if (n === NO_END && sides.length < 2) return [];
  if (n !== NO_END && along === null && sides.length < state.takes[i]) return [];
  if (state.mode !== MODE_PATH && n !== NO_END) return sides.flatMap((s) => s.run);
  const rises =
    state.mode === MODE_PATH ? pathRises(state, n, sides) : pairsRises(sides);
  return sides.flatMap((side, k) =>
    rises[k] > 0 || (rises[k] === 0 && side === along) ? side.run : [],
  );
}

/** For each side of a Path square holding `n` (or no number), 1 where the
 * numbers rise along it, -1 where they fall, and 0 where nothing says. */
function pathRises(state: PathState, n: number, sides: readonly Side[]): number[] {
  const highest = Math.max(...state.ends);
  const own = sides.map(({ numbers: [a, b] }) => {
    if (a === undefined) return n === 1 ? 1 : n === highest ? -1 : 0;
    if (n !== NO_END) return Math.sign(a - n);
    return b === undefined ? 0 : Math.sign(b - a);
  });
  return own.map((rise, k) => {
    if (rise !== 0) return rise;
    const other = sides.length === 2 ? 1 - k : -1;
    if (other < 0) return 0;
    if (own[other] !== 0) return -own[other];
    const [a] = sides[k].numbers;
    const [b] = sides[other].numbers;
    if (n === NO_END && a !== undefined && b !== undefined) return Math.sign(a - b);
    // One side meets one number, the other none: the 1 is behind, the
    // highest ahead.
    const only = a ?? b;
    if (n !== NO_END || only === undefined) return 0;
    const towardIt = only === 1 ? -1 : only === highest ? 1 : 0;
    return a !== undefined ? towardIt : -towardIt;
  });
}

/** For each side of a Pairs square in the middle of a line, 1 for the side
 * away from the one number the line meets, -1 for the side toward it, and 0
 * where the line meets both numbers or neither. */
function pairsRises(sides: readonly Side[]): number[] {
  const meets = sides.map((s) => s.numbers.length > 0);
  if (meets[0] === meets[1]) return [0, 0];
  return meets.map((m) => (m ? -1 : 1));
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
