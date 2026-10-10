/**
 * Filling (Fillomino) generator — byte-faithful port of `filling.c`'s
 * `make_board` + `minimize_clue_set`: the same `shuffle` and `randomUpto`
 * draws in the same order, so a desc reproduces C's for the same seed (the
 * differential checks it). That is an Easy board. An Unreasonable one hides
 * clues by the search in `solver.ts` where upstream hides them by the solver.
 *
 * Generation uses a plain mutable `number[]` board (negative sentinels appear
 * transiently in `mergeOnes`), distinct from the immutable game state.
 */
import { DIFF_EASY } from "../../engine/answer-search.ts";
import { Dsf } from "../../engine/dsf.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { searchAnswers, solveFilling } from "./solver.ts";
import {
  DX,
  DY,
  encodeDesc,
  type FillingParams,
  largestNumber,
  makeRegionDsf,
} from "./state.ts";

/** Flood the region of value `n` from `i`, marking cells `-1`; return false
 * as soon as a cell of value `m` is touched (upstream `mark_region`). */
function markRegion(
  board: number[],
  w: number,
  h: number,
  i: number,
  n: number,
  m: number,
): boolean {
  board[i] = -1;
  const x = i % w;
  const y = (i / w) | 0;
  for (let j = 0; j < 4; j++) {
    const nx = x + DX[j];
    const ny = y + DY[j];
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
    const ii = ny * w + nx;
    if (board[ii] === m) return false;
    if (board[ii] !== n) continue;
    if (!markRegion(board, w, h, ii, n, m)) return false;
  }
  return true;
}

/** Size of the region (equal-valued, connected) containing `i`, restoring
 * the board afterwards (upstream `region_size`). */
function regionSize(board: number[], w: number, h: number, i: number): number {
  if (board[i] === 0) return 0;
  const copy = board[i];
  markRegion(board, w, h, i, board[i], w * h + 1); // SENTINEL never matches
  let size = 0;
  const sz = w * h;
  for (let j = 0; j < sz; j++) {
    if (board[j] !== -1) continue;
    size++;
    board[j] = copy;
  }
  return size;
}

/** Absorb every size-1 region into a non-maxsize neighbor, renumbering the
 * merged region to its new size (upstream `merge_ones`). */
function mergeOnes(board: number[], w: number, h: number): void {
  const sz = w * h;
  const maxsize = largestNumber(w, h);
  let change: boolean;
  do {
    change = false;
    for (let i = 0; i < sz; i++) {
      if (board[i] !== 1) continue;
      let matched = false;
      for (let j = 0; j < 4; j++) {
        board[i] = 1; // upstream's per-iteration reset (the loop's increment)
        const x = (i % w) + DX[j];
        const y = ((i / w) | 0) + DY[j];
        if (x < 0 || x >= w || y < 0 || y >= h) continue;
        const ii = y * w + x;
        if (board[ii] === maxsize) continue;
        const oldsize = board[ii];
        board[i] = oldsize;
        const newsize = regionSize(board, w, h, i);
        if (newsize > maxsize) continue;
        const ok = markRegion(board, w, h, i, oldsize, newsize);
        for (let k = 0; k < sz; k++) {
          if (board[k] === -1) board[k] = ok ? newsize : oldsize;
        }
        if (ok) {
          matched = true;
          break;
        }
      }
      // C's loop increment runs once more after the final fall-through: a
      // 1-cell that failed to merge must be left as a 1 (else it stays part
      // of the neighbor region, overflowing it by one).
      if (matched) change = true;
      else board[i] = 1;
    }
  } while (change);
}

/**
 * The draws a fill may make, over the house default: a draw is thrown away
 * whole at the first pair of equal neighbors it cannot merge, which grows
 * more likely with every square. Sized against what `validateParams` admits.
 * Its rarest board is 1×300, filled once in about 1,300 draws, and the rarest
 * that is not a strip is 15×20, once in 500. Running out takes seven seconds.
 */
const FILL_MAX_DRAWS = 30_000;

/** Build a random valid board: a shuffled DSF region partition with
 * conflicting equal-size neighbors merged, then size-1 absorption. The
 * returned `number[]` holds each cell's region size (the full solution). */
function makeBoard(w: number, h: number, rng: RandomState): number[] {
  const sz = w * h;
  const maxsize = largestNumber(w, h);
  const board = Array.from({ length: sz }, (_, i) => i); // shuffled cell indices
  const dsf = new Dsf(sz);

  const attempt = retryLimit("filling: makeBoard", FILL_MAX_DRAWS);
  retry: while (true) {
    attempt();

    dsf.reinit();
    shuffle(board, rng);
    let change = true;
    while (change) {
      change = false;
      for (let i = 0; i < sz; i++) {
        const square = dsf.canonify(board[i]);
        const size = dsf.size(square);
        let merge = -1; // SENTINEL
        let min = maxsize - size + 1;
        let error = false;
        const directions = [0, 1, 2, 3];
        shuffle(directions, rng);
        for (let j = 0; j < 4; j++) {
          const x = (board[i] % w) + DX[directions[j]];
          const y = ((board[i] / w) | 0) + DY[directions[j]];
          if (x < 0 || x >= w || y < 0 || y >= h) continue;
          const neighbor = dsf.canonify(w * y + x);
          if (square === neighbor) continue;
          const neighborSize = dsf.size(neighbor);
          if (size === neighborSize) error = true;
          // The randomUpto(rng,10) draw is taken only when the size test
          // passes — short-circuit order preserved exactly as upstream.
          if (neighborSize < min && randomUpto(rng, 10)) {
            min = neighborSize;
            merge = neighbor;
          }
        }
        if (!error) continue;
        if (merge === -1) continue retry; // can't fix: restart the whole board
        dsf.merge(square, merge);
        change = true;
      }
    }
    break;
  }

  for (let i = 0; i < sz; i++) board[i] = dsf.size(i);
  mergeOnes(board, w, h);
  return board;
}

/** Reduce the full board to a minimal clue set: first try removing whole
 * regions (a good "ghost region" puzzle), then individual clues, each gone
 * only while `keeps` still holds of what is left (upstream
 * `minimize_clue_set`, whose test is that the solver still solves). Its only
 * RNG is one `shuffle(shuf)`. */
function minimizeClueSet(
  board: number[],
  w: number,
  h: number,
  rng: RandomState,
  keeps: (board: number[]) => boolean,
): void {
  const sz = w * h;
  const shuf = Array.from({ length: sz }, (_, i) => i);
  shuffle(shuf, rng);

  // Region partition computed once from the full board (as upstream).
  const dsf = makeRegionDsf(board, w, h);
  const tried = new Set<number>();
  for (let i = 0; i < sz; i++) {
    const root = dsf.canonify(shuf[i]);
    if (tried.has(root)) continue;
    tried.add(root);
    const cells: number[] = [];
    for (let k = 0; k < sz; k++) if (dsf.canonify(k) === root) cells.push(k);
    const val = board[root];
    for (const c of cells) board[c] = 0;
    if (!keeps(board)) {
      for (const c of cells) board[c] = val;
    }
  }

  for (let i = 0; i < sz; i++) {
    const tmp = board[shuf[i]];
    if (tmp === 0) continue; // gone with its region
    board[shuf[i]] = 0;
    if (!keeps(board)) board[shuf[i]] = tmp;
  }
}

/**
 * The positions the search may try when a clue is hidden from an Unreasonable
 * board, far under the 2,000 it has by default. Hiding stops only when the
 * search can no longer prove one answer, so it takes every board up to
 * whatever the search is allowed, and this is how hard the tier's boards are.
 *
 * Measured 2026-10-10 at the three presets. At 30 a dealt board needs a
 * median of 21 to 29 positions, and of 66 boards a number that breaks the
 * rule as soon as it is written settles 3, where trying a number and
 * following the deductions from it, one trial at a time, settles 63. At 10
 * the first settles 24 of 66, which is a deduction the solver lacks and not
 * a search.
 */
const HIDING_BUDGET = 30;

/**
 * An Unreasonable board: a full board with clues hidden while the search
 * still proves one answer within {@link HIDING_BUDGET}, kept if the solver
 * then stops short. It nearly always does, since the search goes on hiding
 * where the solver would have stopped: 198 of 200 at 7×9 and every one seen
 * at the larger presets.
 */
function unreasonableClues(w: number, h: number, rng: RandomState): number[] {
  const one = (left: number[]) =>
    searchAnswers(left, w, h, HIDING_BUDGET).kind === "one";
  // The boards stripped before giving up. Only the smallest are often thrown
  // away: 1×5 keeps one in fifty, and has 1,000 tries. A large board costs
  // most of a second and has twenty.
  const attempt = retryLimit(
    `filling: Unreasonable generation (${w}x${h})`,
    Math.max(20, Math.ceil(25_000 / (w * h) ** 2)),
  );
  for (;;) {
    attempt();
    const board = makeBoard(w, h, rng);
    minimizeClueSet(board, w, h, rng, one);
    if (!solveFilling(board, w, h).solved) return board;
  }
}

/** An Easy board, upstream's only kind: clues hidden while the solver still
 * solves. Asking the solver is asking the hint as well, which is what an
 * Easy board is held to at load: the hint's plan falls back on the solver's
 * own run from the clues, so it finishes exactly the boards the solver does. */
function easyClues(w: number, h: number, rng: RandomState): number[] {
  const board = makeBoard(w, h, rng);
  minimizeClueSet(board, w, h, rng, (left) => solveFilling(left, w, h).solved);
  return board;
}

export function newFillingDesc(p: FillingParams, rng: RandomState): { desc: string } {
  const { w, h } = p;
  const clues =
    p.diff === DIFF_EASY ? easyClues(w, h, rng) : unreasonableClues(w, h, rng);
  return { desc: encodeDesc(clues, w * h) };
}
