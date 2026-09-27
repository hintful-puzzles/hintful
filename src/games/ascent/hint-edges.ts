/**
 * The Edges techniques of Ascent's hint: the reasoning of 1to25, where every
 * missing number already has a line the player can see, its arrow's.
 *
 * The run techniques in [`hint.ts`](./hint.ts) reason from the placed numbers,
 * which is all a Hidato board offers. On an Edges board the placed numbers are
 * few and far apart, so a run's reach covers most of the board and says
 * nothing; what decides a square is where the lines cross. Two readings,
 * both projections of the solver's `overlap` rung over the arrows'
 * candidate lines:
 *
 * - `lines`: a number is on its own line and within `k` steps of the line of
 *   the number `k` places from it, and of each placed number as far as it is
 *   in the sequence. Where one square satisfies them all, the number goes
 *   there. `overlap` implies each premise at its fixpoint, and it runs at
 *   Normal in Edges mode, so this is a Normal technique.
 * - `pointers`: of the missing numbers whose arrows point at a square, all but
 *   one fail one of those premises there, so the square is that one's. The
 *   solver's `single-number` rung over the same candidates: Tricky when the
 *   number has a placed neighbor in the sequence, as that rung's simple form
 *   asks, Hard otherwise.
 *
 * Neither is offered outside Edges mode (`ascentPlan`), so nothing here can
 * change a hint on any other board.
 */

import {
  allows,
  type Premise,
  premisesOf,
  readBoard,
  squaresMeeting,
  squaresOnLine,
} from "./premises.ts";
import {
  type AscentState,
  CELL_NONE,
  DIFF_HARD,
  DIFF_TRICKY,
  isEdgeValid,
} from "./state.ts";

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

/** A `lines` firing: `n` at `cell`, singled out by its own line and `premises`. */
export interface LinesFound {
  n: number;
  cell: number;
  premises: Premise[];
}

/**
 * The simplest `lines` firing on the board: the one naming fewest premises,
 * then the nearest. At least one premise is a line, or the reading is only the
 * `reach` technique's, which comes first.
 */
export function findLines(
  state: AscentState,
  focus: { lo: number; hi: number } | null,
): LinesFound | null {
  const b = readBoard(state);
  let best: LinesFound | null = null;
  const cost = (f: LinesFound) =>
    f.premises.length * 100 + Math.max(0, ...f.premises.map((p) => p.d));
  for (let n = 0; n <= state.last; n++) {
    if (b.positions[n] !== CELL_NONE) continue;
    if (focus && (n < focus.lo || n > focus.hi)) continue;
    const own = b.arrows[n];
    const all = premisesOf(b, n).sort((x, y) => x.d - y.d);
    const left = squaresMeeting(b, own, all);
    if (left.length !== 1) continue;
    const cell = left[0];
    // The fewest premises that single the square out on their own.
    const line = squaresOnLine(b, own);
    let chosen: Premise[] | null = null;
    for (let k = 1; k <= MOST_PREMISES && !chosen; k++)
      for (const ps of choose(all, k)) {
        if (!ps.some((p) => p.arrow !== null)) continue;
        if (line.filter((sq) => ps.every((p) => allows(b, p, sq))).length === 1) {
          chosen = ps;
          break;
        }
      }
    if (!chosen) continue;
    const f = { n, cell, premises: chosen };
    if (!best || cost(f) < cost(best)) best = f;
  }
  return best;
}

/** A `pointers` firing: `n` at `cell`, every rival there ruled out. */
export interface PointersFound {
  n: number;
  cell: number;
  /** The other missing numbers that could otherwise stand here. */
  ruledOut: RuledOut[];
  tier: number;
}

/**
 * The square only one missing number can stand on: every other number whose
 * arrow points at it, or that has none, fails a premise there. The firing
 * with fewest rivals to rule out.
 */
export function findPointers(
  state: AscentState,
  focus: { lo: number; hi: number } | null,
): PointersFound | null {
  const b = readBoard(state);
  const { w, h, last } = state;
  const premises = new Map<number, Premise[]>();
  const premisesFor = (m: number) => {
    let ps = premises.get(m);
    if (!ps) {
      ps = premisesOf(b, m).sort((x, y) => x.d - y.d);
      premises.set(m, ps);
    }
    return ps;
  };
  let best: PointersFound | null = null;
  for (const cell of b.empty) {
    const rivals: number[] = [];
    for (let m = 0; m <= last; m++) {
      if (b.positions[m] !== CELL_NONE) continue;
      const arrow = b.arrows[m];
      if (arrow < 0 || isEdgeValid(arrow, cell, w, h)) rivals.push(m);
    }
    let keeper = -1;
    const ruledOut: RuledOut[] = [];
    for (const m of rivals) {
      // A line premise first: it is what this technique teaches.
      const ps = premisesFor(m);
      const by =
        ps.find((p) => p.arrow !== null && !allows(b, p, cell)) ??
        ps.find((p) => !allows(b, p, cell));
      if (by) ruledOut.push({ m, arrowless: b.arrows[m] < 0, by });
      else if (keeper < 0) keeper = m;
      else {
        keeper = -2;
        break;
      }
    }
    if (keeper < 0) continue;
    if (focus && (keeper < focus.lo || keeper > focus.hi)) continue;
    const placed = (m: number) => m >= 0 && m <= last && b.positions[m] !== CELL_NONE;
    const tier = placed(keeper - 1) || placed(keeper + 1) ? DIFF_TRICKY : DIFF_HARD;
    const f = { n: keeper, cell, ruledOut, tier };
    if (
      !best ||
      f.tier < best.tier ||
      (f.tier === best.tier && f.ruledOut.length < best.ruledOut.length)
    )
      best = f;
  }
  return best;
}
