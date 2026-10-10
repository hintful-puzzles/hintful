/**
 * Pattern generator, a port of `generate` + `generate_soluble` in pattern.c.
 * Splatter random values, smooth them with one cellular-automaton averaging
 * pass, threshold at the median to make about half the cells black, then
 * regenerate until the board is non-trivial (no monochrome row or column) and
 * of the tier asked for: decided a line at a time, or with one answer that
 * the lines alone do not reach.
 *
 * Byte-match note: upstream computes the value grid in single-precision
 * `float`, and the median threshold decides each cell with a `>=`, so
 * reproducing the C desc bit-for-bit needs single-precision arithmetic: every
 * intermediate goes through `Math.fround`. A division is computed in double
 * then rounded (JS has no single-precision divide), so a double-rounding ULP
 * difference could in principle flip a knife-edge cell; the differential is
 * what shows the match holds on real boards (docs/games/testing.md
 * § "Byte-match: fidelity where there is a right answer").
 */
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { RetryLimitExceeded } from "../../engine/retry-limit.ts";
import { isSoluble, searchAnswers } from "./solver.ts";
import {
  computeRuns,
  DIFF_EASY,
  encodeClues,
  GRID_EMPTY,
  GRID_FULL,
  type PatternParams,
} from "./state.ts";

const f = Math.fround;
/** Generous backstop: a faithful port always terminates here, so an
 * exceeded cap means a divergence, not a hard puzzle. */
const MAX_REGENERATE = 100000;

/** One CA-smoothed, median-thresholded random board (upstream `generate`),
 * written into `grid` as GRID_FULL / GRID_EMPTY. */
function generate(rs: RandomState, w: number, h: number, grid: Uint8Array): void {
  const n = w * h;
  const noise = new Float64Array(n); // holds float32-valued samples
  for (let i = 0; i < n; i++) {
    noise[i] = f(f(randomUpto(rs, 100000000)) / f(100000000));
  }

  // One averaging pass: each cell becomes the mean of its (up to) nine
  // neighbors, except along a dimension of size 2 (else a 2×2 grid would be
  // four identical cells).
  const smooth = new Float64Array(n);
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      let cnt = 0;
      let sum = 0;
      for (let p = -1; p <= 1; p++) {
        for (let q = -1; q <= 1; q++) {
          if (i + p < 0 || i + p >= h || j + q < 0 || j + q >= w) continue;
          if ((h === 2 && p !== 0) || (w === 2 && q !== 0)) continue;
          cnt++;
          sum = f(sum + noise[(i + p) * w + (j + q)]);
        }
      }
      smooth[i * w + j] = f(sum / cnt);
    }
  }

  // Choose the threshold that makes (about) half the cells black.
  const sorted = Float64Array.from(smooth).sort();
  let index = Math.floor((w * h) / 2);
  if (w & h & 1) index += randomUpto(rs, 2);
  const threshold = index < n ? sorted[index] : f(sorted[n - 1] + 1);

  for (let i = 0; i < n; i++) {
    grid[i] = smooth[i] >= threshold ? GRID_FULL : GRID_EMPTY;
  }
}

/** Per-line run-length clues of a fully-decided grid (cols `0..w-1`, then
 * rows). */
function cluesOf(grid: Uint8Array, w: number, h: number): number[][] {
  const clues: number[][] = [];
  for (let i = 0; i < w; i++) clues.push(computeRuns(grid, i, h, w) ?? []);
  for (let i = 0; i < h; i++) clues.push(computeRuns(grid, i * w, w, 1) ?? []);
  return clues;
}

/**
 * The squares an Unreasonable deal may draw before it gives up. Its bound is
 * in squares and not in pictures because the rarest sizes are the smallest: a
 * 3x4 picture that needs search turns up once in about 100,000 and costs
 * microseconds, where a 30x30 one turns up once in 12 and costs a
 * millisecond. This gives a 3x4 about 3,300,000 pictures and a 30x30 about
 * 44,000, and either runs out in seconds.
 */
const UNREASONABLE_SQUARES = 40_000_000;

/**
 * Whether a drawn picture's clues make a board of the tier asked for. An Easy
 * one is decided a line at a time. An Unreasonable one is not, and the search
 * proves it has the one answer all the same: most pictures the lines do not
 * decide have several.
 */
function meetsTier(diff: number, w: number, h: number, clues: number[][]): boolean {
  const easy = isSoluble(w, h, clues);
  if (diff === DIFF_EASY) return easy;
  return !easy && searchAnswers(w, h, clues).kind === "one";
}

export function newPatternDesc(p: PatternParams, rng: RandomState): { desc: string } {
  const { w, h, diff } = p;
  const grid = new Uint8Array(w * h);
  const limit =
    diff === DIFF_EASY ? MAX_REGENERATE : Math.ceil(UNREASONABLE_SQUARES / (w * h));

  for (let tries = 0; tries < limit; tries++) {
    generate(rng, w, h, grid);

    // Reject a board with any monochrome row/column (too easy), except on
    // dimensions under 3 (else nothing would ever generate).
    let ok = true;
    if (w > 2) {
      for (let i = 0; i < h && ok; i++) {
        let colors = 0;
        for (let j = 0; j < w; j++) colors |= grid[i * w + j] === GRID_FULL ? 2 : 1;
        if (colors !== 3) ok = false;
      }
    }
    if (ok && h > 2) {
      for (let j = 0; j < w && ok; j++) {
        let colors = 0;
        for (let i = 0; i < h; i++) colors |= grid[i * w + j] === GRID_FULL ? 2 : 1;
        if (colors !== 3) ok = false;
      }
    }
    if (!ok) continue;

    const clues = cluesOf(grid, w, h);
    if (meetsTier(diff, w, h, clues)) return { desc: encodeClues(clues) };
  }
  throw new RetryLimitExceeded("pattern: generation", limit);
}
