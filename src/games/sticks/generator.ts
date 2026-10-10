/**
 * Sticks generator — port of `new_game_desc` in `puzzles/unreleased/sticks.c`.
 *
 * This is the byte-match surface (see sticks-differential.test.ts). The RNG
 * draw order is upstream's exactly: the symmetric black placement (shared
 * `placeSymmetricBlacks` — one `randomUpto` pair per rejection-sampling
 * attempt plus the `SYMM_ROT4` center draw), then per fill attempt one
 * `randomUpto(rs, 2)` per white cell and one `randomUpto(rs, n)` per
 * multi-cell segment's clue position, retried until the contradiction solver
 * deduces the fill back to completion (a unique, guess-free solution), then
 * one `shuffle` of the cell indices for the greedy clue minimization. The
 * solver is deterministic, so the desc is a pure function of the seed.
 */

import { DIFF_EASY } from "../../engine/answer-search.ts";
import { Dsf } from "../../engine/dsf.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { placeSymmetricBlacks } from "../../engine/symmetric-blacks.ts";
import { searchAnswers, sticksMakeDsf, sticksSolveGame } from "./solver.ts";
import { encodeDesc, F_BLOCK, F_HOR, F_VER, type SticksParams } from "./state.ts";

/** A dealt board: its blocks, in a grid whose white squares may hold lines,
 * and its clues. */
interface Dealt {
  grid: Uint8Array;
  numbers: Int16Array;
}

/** Blocks, and a fill of lines with every clue it gives, that the solver's
 * deduction finishes. Both tiers strip clues from one of these. */
function clueFill(p: SticksParams, rng: RandomState): Dealt {
  const { w, h } = p;
  const s = w * h;
  const grid = new Uint8Array(s);
  const numbers = new Int16Array(s);
  const dsf = new Dsf(s);
  const minimal = new Int32Array(s);

  // Symmetric black placement (upstream set_blacks, copied from lightup.c —
  // the shared helper reproduces its draw order; the board starts cleared).
  placeSymmetricBlacks({
    w,
    h,
    blackpc: p.blackpc,
    symm: p.symm,
    rs: rng,
    isBlack: (x, y) => (grid[y * w + x] & F_BLOCK) !== 0,
    setBlack: (x, y, black) => {
      grid[y * w + x] = black ? F_BLOCK : 0;
    },
  });

  // Fill + clue, retried until the solver deduces the board to completion
  // (which also leaves `grid` holding the unique solution's lines).
  const attempt = retryLimit("sticks: fill attempts");
  do {
    attempt();

    for (let i = 0; i < s; i++) {
      if (!(grid[i] & F_BLOCK)) grid[i] = randomUpto(rng, 2) ? F_HOR : F_VER;
    }

    sticksMakeDsf(grid, null, w, h, dsf, null);

    // Upstream's dsf_minimal (a class's smallest index), which the shared Dsf
    // doesn't track, so precompute it after all merges. Independent of the root
    // choice (docs/games/solver-and-generator.md § "The Latin family").
    minimal.fill(-1);
    for (let i = 0; i < s; i++) {
      const r = dsf.canonify(i);
      if (minimal[r] === -1) minimal[r] = i;
    }

    numbers.fill(-1);
    for (let i = 0; i < s; i++) {
      if (grid[i] & F_BLOCK) {
        // Black clue: how many lines connect to this cell.
        let n = 0;
        if (i % w > 0 && grid[i - 1] & F_HOR) n++;
        if (i % w < w - 1 && grid[i + 1] & F_HOR) n++;
        if (Math.floor(i / w) > 0 && grid[i - w] & F_VER) n++;
        if (Math.floor(i / w) < h - 1 && grid[i + w] & F_VER) n++;
        numbers[i] = n;
      } else if (minimal[dsf.canonify(i)] === i) {
        // Length clue on a randomUpto-chosen cell of the segment (the
        // minimal cell is its leftmost/topmost, so `i + offset` stays
        // inside the run).
        const n = dsf.size(i);
        if (n === 1) numbers[i] = 1;
        else if (grid[i] & F_HOR) numbers[i + randomUpto(rng, n)] = n;
        else if (grid[i] & F_VER) numbers[i + w * randomUpto(rng, n)] = n;
      }
    }
  } while (sticksSolveGame(grid, numbers, w, h) !== "complete");

  return { grid, numbers };
}

/** Greedy clue minimization: one shuffle, then each clue gone only while
 * `keeps` still holds of what is left. */
function stripClues({ numbers }: Dealt, rng: RandomState, keeps: () => boolean): void {
  const spaces = Array.from(numbers, (_, i) => i);
  shuffle(spaces, rng);
  for (const i of spaces) {
    const clue = numbers[i];
    if (clue === -1) continue;
    numbers[i] = -1;
    if (!keeps()) numbers[i] = clue;
  }
}

/**
 * The positions the search may try when a clue is stripped from an
 * Unreasonable board, far under the 2,000 it has by default. Stripping stops
 * only when the search can no longer prove one answer, so it takes a board up
 * to whatever the search is allowed, and this is how hard the tier's boards
 * are.
 *
 * Measured 2026-10-10: a dealt board needs a median of 3 to 5 positions and
 * 19 at most, and the hint leaves a median of 9 squares of 20 blank at 5×5,
 * 12 of 41 at 7×7 and 12 of 80 at 10×10. A budget of 10 deals the same boards
 * in the same time. Trying a line and following the deduction from it, one
 * trial at a time, finishes every one of 106. Trying a line and looking for a
 * square it leaves with no line to hold, with nothing followed, finishes 11
 * of 40 at 5×5, 13 of 40 at 7×7 and 5 of 26 at 10×10.
 */
const STRIP_BUDGET = 30;

/**
 * An Unreasonable board: a fill stripped by the search where an Easy one is
 * stripped by the solver, each clue gone while the search still proves one
 * answer within {@link STRIP_BUDGET}, and kept if the solver then stops
 * short.
 *
 * It is one strip and not an Easy board stripped further. Measured
 * 2026-10-10, that way took five times as long (7.6 s against 1.5 at 10×10,
 * 0.5 s against 0.14 at 7×7) and left the hint no more to do.
 */
function unreasonableBoard(p: SticksParams, rng: RandomState): Dealt {
  const { w, h } = p;
  const attempt = retryLimit(`sticks: Unreasonable generation (${w}x${h})`);
  for (;;) {
    attempt();
    const dealt = clueFill(p, rng);
    const { grid, numbers } = dealt;
    stripClues(
      dealt,
      rng,
      () => searchAnswers(grid, numbers, w, h, STRIP_BUDGET).kind === "one",
    );
    if (sticksSolveGame(grid, numbers, w, h) !== "complete") return dealt;
  }
}

/** An Easy board, upstream's only kind: a fill with every clue gone that the
 * solver's deduction can do without. */
function easyBoard(p: SticksParams, rng: RandomState): Dealt {
  const dealt = clueFill(p, rng);
  const { grid, numbers } = dealt;
  stripClues(dealt, rng, () => sticksSolveGame(grid, numbers, p.w, p.h) === "complete");
  return dealt;
}

export function newSticksDesc(p: SticksParams, rng: RandomState): { desc: string } {
  const { grid, numbers } =
    p.diff === DIFF_EASY ? easyBoard(p, rng) : unreasonableBoard(p, rng);
  return { desc: encodeDesc(grid, numbers, p.w, p.h) };
}
