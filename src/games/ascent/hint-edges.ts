/**
 * The Edges narrations of Ascent's hint: the reasoning of 1to25, where every
 * missing number already has a line the player can see, its arrow's.
 *
 * The run narrations in [`hint.ts`](./hint.ts) reason from the placed numbers,
 * which is all a Hidato board offers. On an Edges board the placed numbers are
 * few and far apart, so a run's reach covers most of the board and says
 * nothing; what decides a square is where the lines cross. Both narrations
 * tell a placement the `route` reading makes (the ladder's `overlapEdges`
 * over each number's arrow line, `onLine`), from premises a player sees:
 *
 * - `lines`: a number is on its own line and within `k` steps of the line of
 *   the number `k` places from it, and of each placed number as far as it is
 *   in the sequence. Where one square satisfies them all, the number goes
 *   there: an `onlySquare` placement. `overlapEdges` implies each premise at
 *   its fixpoint.
 * - `pointers`: of the missing numbers whose arrows point at a square, all but
 *   one fail one of those premises there, so the square is that one's: an
 *   `onlyNumberNear` or `onlyNumber` placement.
 *
 * A placement the premises do not explain is told by the run narrations.
 */

import {
  allows,
  type Premise,
  premisesOf,
  readBoard,
  squaresMeeting,
  squaresOnLine,
} from "./premises.ts";
import { type AscentState, CELL_NONE, isEdgeValid } from "./state.ts";

/** A number ruled out of a square, and the premise it fails there. */
export interface RuledOut {
  m: number;
  /** `m` has no arrow, so only its neighbors keep it out. */
  arrowless: boolean;
  by: Premise;
}

/** The most premises a `lines` sentence names beside the number's own line. */
const MOST_PREMISES = 3;

/** Subsets of `xs` of size `k`, in order. */
function* choose<T>(xs: readonly T[], k: number, from = 0): Generator<T[]> {
  if (k === 0) {
    yield [];
    return;
  }
  for (let i = from; i <= xs.length - k; i++)
    for (const rest of choose(xs, k - 1, i + 1)) yield [xs[i], ...rest];
}

/**
 * The fewest premises that, with its own line, single out `cell` for missing
 * number `n`, at least one of them a line; `null` where the premises leave
 * another square, or need more than {@link MOST_PREMISES} to say.
 */
export function linesAt(state: AscentState, n: number, cell: number): Premise[] | null {
  const b = readBoard(state);
  const own = b.arrows[n];
  const all = premisesOf(b, n).sort((x, y) => x.d - y.d);
  const left = squaresMeeting(b, own, all);
  if (left.length !== 1 || left[0] !== cell) return null;
  const line = squaresOnLine(b, own);
  for (let k = 1; k <= MOST_PREMISES; k++)
    for (const ps of choose(all, k)) {
      if (!ps.some((p) => p.arrow !== null)) continue;
      if (line.filter((sq) => ps.every((p) => allows(b, p, sq))).length === 1)
        return ps;
    }
  return null;
}

/** How hard a `lines` sentence is to follow: its premises, then the
 * farthest of them. */
export const linesCost = (premises: readonly Premise[]): number =>
  premises.length * 100 + Math.max(0, ...premises.map((p) => p.d));

/**
 * Every other missing number that could stand on `cell`, by its arrow or for
 * want of one, each with the premise it fails there; `null` where one fails
 * none.
 */
export function pointersAt(
  state: AscentState,
  n: number,
  cell: number,
): RuledOut[] | null {
  const b = readBoard(state);
  const { w, h, last } = state;
  const ruledOut: RuledOut[] = [];
  for (let m = 0; m <= last; m++) {
    if (m === n || b.positions[m] !== CELL_NONE) continue;
    const arrow = b.arrows[m];
    if (arrow >= 0 && !isEdgeValid(arrow, cell, w, h)) continue;
    // A line premise first: it is what this narration teaches.
    const ps = premisesOf(b, m).sort((x, y) => x.d - y.d);
    const by =
      ps.find((p) => p.arrow !== null && !allows(b, p, cell)) ??
      ps.find((p) => !allows(b, p, cell));
    if (!by) return null;
    ruledOut.push({ m, arrowless: arrow < 0, by });
  }
  return ruledOut;
}
