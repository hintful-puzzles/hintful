/**
 * Singles (Hitori) generator, after `new_game_desc` in `singles.c`: a Latin
 * square's numbers, squares covered at random on the compiled ladder, a
 * repeated number laid under each, and the board kept where the ladder
 * grades it at the tier asked for.
 */

import { latinGenerateRect } from "../../engine/latin.ts";
import type { RandomState } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { layCovered, solveSpecific } from "./solver.ts";
import {
  DIFF_EASY,
  diffToLevel,
  encodeDesc,
  F_BLACK,
  F_CIRCLE,
  makeState,
  type SinglesParams,
  type SinglesState,
} from "./state.ts";

// --- numbers under black squares (best_black_col) --------------------------

/** Choose the number to lay under the black cell at index `i`, preferring
 * a number that erases a Latin-square uniqueness, then any non-unique one.
 * `rownums`/`colnums` count the white copies at `line * o + number - 1`;
 * the chosen number is added to them. */
function bestBlackCol(
  s: SinglesState,
  rs: RandomState,
  i: number,
  rownums: Int32Array,
  colnums: Int32Array,
): number {
  const o = s.o;
  const row = ((i / s.w) | 0) * o;
  const col = (i % s.w) * o;

  /* Randomize the order to try the numbers in (o RNG draws, as in C). */
  const order: number[] = [];
  for (let k = 0; k < o; k++) order[k] = k;
  shuffle(order, rs);

  /* Prefer numbers that only occur once in their row AND column, otherwise
   * the first number that is not unique in its row/column. */
  let v = -1;
  for (let k = 0; k < o && v < 0; k++) {
    if (rownums[row + order[k]] === 1 && colnums[col + order[k]] === 1) v = order[k];
  }
  for (let k = 0; k < o && v < 0; k++) {
    if (rownums[row + order[k]] !== 0 || colnums[col + order[k]] !== 0) v = order[k];
  }
  if (v < 0) throw new Error("singles: unable to place number under black cell");

  rownums[row + v] += 1;
  colnums[col + v] += 1;
  return v + 1;
}

// --- difficulty gate (new_game_is_good) ------------------------------------

const MAXTRIES = 20;

/**
 * Circle every number that appears once in its row and once in its column:
 * upstream's "sneaky" step. It is the generator's own, outside the
 * description, because it is unsound: the rules do not force such a square
 * clear, so the checker would rightly refuse it as a technique. It only
 * makes the test of a board too easy for its tier a little stronger.
 */
function circleUnrepeated(s: SinglesState): void {
  const { w, h } = s;
  for (let i = 0; i < s.n; i++) {
    const x = i % w;
    const y = (i / w) | 0;
    let repeated = false;
    for (let xx = 0; xx < w && !repeated; xx++)
      repeated = xx !== x && s.nums[y * w + xx] === s.nums[i];
    for (let yy = 0; yy < h && !repeated; yy++)
      repeated = yy !== y && s.nums[yy * w + x] === s.nums[i];
    if (!repeated) s.flags[i] |= F_CIRCLE;
  }
}

/** True iff the board is solvable at `diffLevel` and (above Easy) NOT
 * solvable at the level below with the sneaky circles given. */
function newGameIsGood(diffLevel: number, state: SinglesState): boolean {
  const blank = () => makeState(state.w, state.h, state.nums);
  if (solveSpecific(blank(), diffLevel) <= 0) return false;
  if (diffLevel === DIFF_EASY) return true;
  const sneaky = blank();
  circleUnrepeated(sneaky);
  return solveSpecific(sneaky, diffLevel - 1) <= 0;
}

// --- new_game_desc ---------------------------------------------------------

/** Upstream has no cap here: the ladder run after each covering keeps a
 * square's last way out clear before it can be boxed in, so laying never
 * makes the board impossible. The guard below only fires if that breaks (see
 * engine/retry-limit.ts). */
export function newSinglesDesc(p: SinglesParams, rs: RandomState): { desc: string } {
  const { w, h } = p;
  const o = Math.max(w, h);
  const n = w * h;

  const diffLevel = diffToLevel(p.diff);

  const state = makeState(w, h, new Int8Array(n));

  const cells: number[] = [];
  const rownums = new Int32Array(h * o);
  const colnums = new Int32Array(w * o);

  const attempt = retryLimit("singles: generation");
  generate: while (true) {
    attempt();

    state.flags.fill(0);
    state.nums.set(latinGenerateRect(w, h, rs));

    /* Cover squares at random, laying forced clear squares between them. */
    for (let i = 0; i < n; i++) cells[i] = i;
    shuffle(cells, rs);
    if (!layCovered(state, cells)) continue;

    /* Count white numbers per row/column. */
    rownums.fill(0);
    colnums.fill(0);
    for (let i = 0; i < n; i++) {
      if (state.flags[i] & F_BLACK) continue;
      const v = state.nums[i] - 1;
      rownums[((i / w) | 0) * o + v] += 1;
      colnums[(i % w) * o + v] += 1;
    }

    for (let tries = 0; ; tries++) {
      for (let i = 0; i < n; i++) {
        if (state.flags[i] & F_BLACK)
          state.nums[i] = bestBlackCol(state, rs, i, rownums, colnums);
      }
      if (newGameIsGood(diffLevel, state)) return { desc: encodeDesc(state) };
      if (tries >= MAXTRIES) continue generate;
    }
  }
}
