/**
 * Separate generator — a port of `separate.c`'s `generate`, and the
 * Unreasonable boards made from what it deals.
 *
 * `divvyRectangle` picks a random `k`-omino partition; then we repeatedly fill
 * each omino with a shuffled set of the `k` letters and run the solver. The
 * solver records (via `genLock`) which squares' letters a deduction depended on;
 * those stay fixed while the rest are re-randomized, so the board is refined
 * toward one the solver can fully solve. A board is kept only when the solver
 * solves it completely, guaranteeing unique deducibility; a partition that never
 * yields a solvable board is abandoned for a fresh `divvyRectangle`.
 *
 * Every RNG draw (the `divvy` draws, the per-omino `shuffle`) is in upstream's
 * exact order over the bit-identical `random.ts`, and the solver's verdict gates
 * the loop, so an Easy desc byte-matches C's for a seed only while the solver
 * reaches C's exact verdict too. The differential checks both.
 */

import { DIFF_EASY } from "../../engine/answer-search.ts";
import { divvyRectangle } from "../../engine/divvy.ts";
import type { RandomState } from "../../engine/random/index.ts";
import { RetryLimitExceeded, retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import {
  SOLVED,
  SolverScratch,
  STUCK,
  searchAnswers,
  solve,
  solverAttempt,
} from "./solver.ts";
import { encodeDesc, type SeparateParams, type SeparateShape } from "./state.ts";

const MAX_REGENERATE = 10000;

/** A dealt board: its letters, and the division it was filled from as each
 * region's `k` squares in turn. */
interface Dealt {
  letters: Uint8Array;
  regions: Int32Array;
}

/** An Easy board, upstream's only kind: one the solver's rungs finish. */
function easyBoard(p: SeparateShape, rng: RandomState): Dealt {
  const { w, h, k } = p;
  const wh = w * h;
  const n = wh / k; // number of ominoes
  const sc = new SolverScratch(w, h, k);
  const grid = new Uint8Array(wh);
  const permutation = new Int32Array(wh); // permutation[omino*k + slot] = square
  const genLock = new Uint8Array(wh);

  for (let regen = 0; regen < MAX_REGENERATE; regen++) {
    const dsf = divvyRectangle(w, h, k, rng);

    // Number the ominoes by ascending canonical-root index (matching C), and
    // list each omino's k squares in `permutation`.
    const rootOmino = new Int32Array(wh).fill(-1);
    let j = 0;
    for (let i = 0; i < wh; i++) if (dsf.canonify(i) === i) rootOmino[i] = j++;
    const counter = new Int32Array(n);
    for (let i = 0; i < wh; i++) {
      const om = rootOmino[dsf.canonify(i)];
      permutation[om * k + counter[om]++] = i;
    }

    genLock.fill(0);
    sc.init();
    let retries = k * k;
    let m = STUCK;
    for (;;) {
      // Fill each omino with a shuffled set of the letters it still lacks
      // (the locked squares keep their letters).
      for (let i = 0; i < n; i++) {
        const lockedLetter = new Uint8Array(k);
        for (let s = 0; s < k; s++) {
          const index = permutation[i * k + s];
          if (genLock[index]) lockedLetter[grid[index]] = 1;
        }
        const remaining: number[] = [];
        for (let letter = 0; letter < k; letter++)
          if (!lockedLetter[letter]) remaining.push(letter);
        shuffle(remaining, rng); // length == free-square count; matches C
        let m2 = remaining.length;
        for (let s = 0; s < k; s++) {
          const index = permutation[i * k + s];
          if (!genLock[index]) grid[index] = remaining[--m2];
        }
      }

      m = solverAttempt(sc, grid, genLock);
      if (m === SOLVED || (m === STUCK && retries-- <= 0)) break;
      if (m !== STUCK) retries = k * k; // PROGRESS: reset the counter
    }

    if (m === SOLVED) return { letters: grid, regions: permutation };
  }
  throw new RetryLimitExceeded("separate: generation", MAX_REGENERATE);
}

/**
 * The positions the search may try when two letters are swapped on the way to
 * an Unreasonable board, far under the 2,000 it has by default. Swapping stops
 * only when the search can no longer prove one answer, so it takes a board up
 * to whatever the search is allowed, and this is how hard the tier's boards
 * are.
 *
 * Measured 2026-10-10: a dealt board needs a median of 5 positions at 4×4 and
 * 13 to 23 at the larger presets, and the hint leaves a median of 19 edges of
 * 24 undecided at 4×4, 33 of 40 at 5×5 and 53 of 60 at 6×6 in sixes. Joining
 * two squares and looking, with no rung run, settles 30 of 150 boards at 4×4,
 * 10 at 5×5 and 5 at 6×6 in fours, where joining and following the rungs from
 * it, one trial at a time, finishes all but four of the 450.
 */
const SWAP_BUDGET = 30;

/**
 * An Unreasonable board: an Easy board with pairs of letters swapped inside a
 * region, each while the search still proves one answer within
 * {@link SWAP_BUDGET}, kept if the solver then stops short. A swap inside a
 * region leaves the division the board was dealt from an answer.
 *
 * Every pair is tried, where stopping at the first swap that stops the solver
 * would leave the hint more to do (27 edges of 60 undecided against 44 at
 * 6×6 in fours). Measured 2026-10-10, a board stopped there is settled by one
 * join and a look one time in four, which is a rung the solver lacks and
 * not a search. A fill drawn at random and kept when it has one answer was
 * the other way: it needs a median of 85 positions at 6×6 in sixes, and half
 * are past a single trial.
 *
 * It costs what the Easy board did and little more (0.8 s against 0.7 s at
 * 6×6 in sixes), so it is dealt wherever Easy is.
 */
function unreasonableLetters(p: SeparateShape, rng: RandomState): Uint8Array {
  const { w, h, k } = p;
  // The Easy boards swapped before giving up. Only the smallest are often
  // thrown away for staying in the solver's reach: sixteen for a board kept
  // at 3×3, two at 4×4.
  const attempt = retryLimit(
    `separate: Unreasonable generation (${w}x${h} k${k})`,
    Math.max(20, Math.ceil(100_000 / (w * h) ** 2)),
  );
  for (;;) {
    attempt();
    const { letters, regions } = easyBoard(p, rng);
    const pairs: [number, number][] = [];
    for (let r = 0; r < regions.length; r += k)
      for (let a = 0; a < k; a++)
        for (let b = a + 1; b < k; b++) pairs.push([regions[r + a], regions[r + b]]);
    shuffle(pairs, rng);
    for (const [a, b] of pairs) {
      const was = letters[a];
      letters[a] = letters[b];
      letters[b] = was;
      if (searchAnswers(p, letters, SWAP_BUDGET).kind !== "one") {
        letters[b] = letters[a];
        letters[a] = was;
      }
    }
    if (!solve(p, letters)) return letters;
  }
}

export function newSeparateDesc(p: SeparateParams, rng: RandomState): { desc: string } {
  const letters =
    p.diff === DIFF_EASY ? easyBoard(p, rng).letters : unreasonableLetters(p, rng);
  return { desc: encodeDesc(letters, p.w * p.h) };
}
