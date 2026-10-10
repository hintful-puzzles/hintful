/**
 * Signpost generator — faithful port of upstream `new_game_desc`, which
 * deals the Easy boards, and the further strip that makes an Unreasonable
 * one of them.
 *
 * (1) `new_game_fill`: grow a full 1..n path by a random head+tail walk;
 * (2) mark 1 and n immutable; (3) `new_game_strip`: add immutable
 * numbers until the solver can solve it, then remove redundant ones;
 * (4) encode. Byte-match-critical: the `random_upto`/`shuffle` call
 * order must match C exactly, so the walk's head-then-tail alternation
 * and the `cell_adj` enumeration order are ported verbatim.
 */

import { DIFF_EASY } from "../../engine/answer-search.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { searchAnswers, solverFinishes, solveState } from "./solver.ts";

import {
  assignStateInto,
  blankInto,
  blankState,
  cloneState,
  DXS,
  DYS,
  dirOpposite,
  FLAG_IMMUTABLE,
  generateDesc,
  type SignpostParams,
  type SignpostState,
  stripNums,
  whichDirI,
} from "./state.ts";

/** Draws allowed when picking two distinct cells. The 1x1 grid, the only board
 * with no distinct pair, returns before this runs (see engine/retry-limit.ts). */
const MAX_DISTINCT_PICKS = 1_000_000;

/** Fill `ai`/`ad` with all non-numbered cells reachable from cell `i`
 * along each of the 8 directions; return the count. Enumeration order
 * (direction-major, outward) is byte-load-bearing. */
function cellAdj(s: SignpostState, i: number, ai: Int32Array, ad: Int32Array): number {
  const { w, h } = s;
  let n = 0;
  const sx = i % w;
  const sy = Math.floor(i / w);
  for (let a = 0; a < 8; a++) {
    let x = sx;
    let y = sy;
    const dx = DXS[a];
    const dy = DYS[a];
    for (;;) {
      x += dx;
      y += dy;
      if (x < 0 || y < 0 || x >= w || y >= h) break;
      const newi = y * w + x;
      if (s.nums[newi] === 0) {
        ai[n] = newi;
        ad[n] = a;
        n++;
      }
    }
  }
  return n;
}

/** Grow a full 1..n path between `headi` and `taili`. Returns false if
 * the walk dead-ended or the two ends didn't line up (retry). */
function newGameFill(
  s: SignpostState,
  rng: RandomState,
  headi: number,
  taili: number,
): boolean {
  const aidx = new Int32Array(s.n);
  const adir = new Int32Array(s.n);

  s.nums.fill(0);
  s.nums[headi] = 1;
  s.nums[taili] = s.n;
  s.dirs[taili] = 0;
  let nfilled = 2;

  while (nfilled < s.n) {
    // Expand from headi; keep going while there's only one option.
    let an = cellAdj(s, headi, aidx, adir);
    do {
      if (an === 0) return false;
      const j = randomUpto(rng, an);
      s.dirs[headi] = adir[j];
      s.nums[aidx[j]] = s.nums[headi] + 1;
      nfilled++;
      headi = aidx[j];
      an = cellAdj(s, headi, aidx, adir);
    } while (an === 1);

    if (nfilled === s.n) break;

    // Expand to taili; keep going while there's only one option.
    an = cellAdj(s, taili, aidx, adir);
    do {
      if (an === 0) return false;
      const j = randomUpto(rng, an);
      s.dirs[aidx[j]] = dirOpposite(adir[j]);
      s.nums[aidx[j]] = s.nums[taili] - 1;
      nfilled++;
      taili = aidx[j];
      an = cellAdj(s, taili, aidx, adir);
    } while (an === 1);
  }

  // Point headi's arrow at taili; retry if they weren't in line.
  s.dirs[headi] = whichDirI(s, headi, taili);
  return s.dirs[headi] !== -1;
}

/** Ensure FLAG_IMMUTABLE is set on exactly the numbers needed to solve.
 * Returns true if it produced a solvable puzzle. Mirrors
 * `new_game_strip`. */
function newGameStrip(s: SignpostState, rng: RandomState): boolean {
  const copy = cloneState(s);

  stripNums(copy);
  if (solveState(copy) > 0) return true;

  const order = Array.from({ length: s.n }, (_, i) => i);
  shuffle(order, rng);

  let solved = false;
  // Add set numbers to empty squares until it becomes solvable.
  for (const j of order) {
    if (copy.nums[j] > 0 && copy.nums[j] <= s.n) continue; // already solved here
    copy.nums[j] = s.nums[j];
    copy.flags[j] |= FLAG_IMMUTABLE;
    s.flags[j] |= FLAG_IMMUTABLE;
    stripNums(copy);
    if (solveState(copy) > 0) {
      solved = true;
      break;
    }
  }
  if (!solved) return false;

  // Try to remove numbers again, keeping them out where still solvable
  // (never the anchors 1 and n).
  for (const j of order) {
    if (s.flags[j] & FLAG_IMMUTABLE && s.nums[j] !== 1 && s.nums[j] !== s.n) {
      s.flags[j] &= ~FLAG_IMMUTABLE;
      assignStateInto(copy, s);
      stripNums(copy);
      if (solveState(copy) <= 0) {
        copy.nums[j] = s.nums[j];
        s.flags[j] |= FLAG_IMMUTABLE;
      }
    }
  }
  return true;
}

/**
 * The positions the search may try when a number is stripped from an
 * Unreasonable board, far under the 2,000 it has by default. Stripping stops
 * only when the search can no longer prove one answer, so it takes a board up
 * to whatever the search is allowed, and this is how hard the tier's boards
 * are.
 *
 * Measured 2026-10-10: a dealt board needs a median of 3 positions at 4×4, 7
 * at 5×5, 15 at 6×6 and 25 at 7×7, and the hint leaves a median of 7 links of
 * 15 unmade at 4×4, 22 of 35 at 6×6 and 30 of 48 at 7×7. Making a link and
 * looking, with no forced link followed, settles 34 of 150 boards at 4×4, 19
 * at 5×5 and 7 at 6×6. Making one and following the forced links from it,
 * one trial at a time, finishes 150, 139 and 132.
 */
const STRIP_BUDGET = 30;

/**
 * An Unreasonable board's numbers: an Easy board's with more stripped, each
 * while the search still proves one answer within {@link STRIP_BUDGET}.
 * Returns whether the solver then stops short. An Easy board is one the
 * solver stops short on with any number gone, so stripping one is what takes
 * it out of reach.
 *
 * It starts from an Easy board and not from the first and last numbers
 * alone, adding numbers until the search proves one answer. Measured
 * 2026-10-10, that way took twice as long (16 ms against 8 at 7×7) and left
 * the hint no more to do (24 links of 35 unmade against 22 at 6×6).
 */
function unreasonableStrip(s: SignpostState, rng: RandomState): boolean {
  if (!newGameStrip(s, rng)) return false;
  const one = () => searchAnswers(s, STRIP_BUDGET).kind === "one";
  const order = Array.from({ length: s.n }, (_, i) => i);
  shuffle(order, rng);
  for (const j of order) {
    // Never the first and last numbers, which every dealt board shows.
    if (!(s.flags[j] & FLAG_IMMUTABLE) || s.nums[j] === 1 || s.nums[j] === s.n)
      continue;
    s.flags[j] &= ~FLAG_IMMUTABLE;
    if (!one()) s.flags[j] |= FLAG_IMMUTABLE;
  }
  return !solverFinishes(s);
}

export function newSignpostDesc(p: SignpostParams, rng: RandomState): { desc: string } {
  if (p.w === 1 && p.h === 1) return { desc: "1a" };

  const s = blankState(p);
  const attempt = retryLimit("signpost: generation");
  for (;;) {
    attempt();

    blankInto(s);

    // Keep trying head/tail choices until we fill successfully.
    let headi = 0;
    let taili = 0;
    const fill = retryLimit("signpost: newGameFill");
    do {
      fill();

      if (p.forceCornerStart) {
        headi = 0;
        taili = s.n - 1;
      } else {
        const pick = retryLimit("signpost: head/tail selection", MAX_DISTINCT_PICKS);
        do {
          pick();
          headi = randomUpto(rng, s.n);
          taili = randomUpto(rng, s.n);
        } while (headi === taili);
      }
    } while (!newGameFill(s, rng, headi, taili));

    s.flags[headi] |= FLAG_IMMUTABLE;
    s.flags[taili] |= FLAG_IMMUTABLE;

    const stripped =
      p.diff === DIFF_EASY ? newGameStrip(s, rng) : unreasonableStrip(s, rng);
    if (!stripped) continue; // regenerate
    stripNums(s);
    return { desc: generateDesc(s) };
  }
}
