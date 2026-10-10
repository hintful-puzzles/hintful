/**
 * Separate generator: a division of the grid with letters placed in it so
 * that the solver solves the board (Easy), and the Unreasonable boards made
 * from those.
 */

import { DIFF_EASY } from "../../engine/answer-search.ts";
import { divvyRectangle } from "../../engine/divvy.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { adjacentCells, redivide, regionsBeside } from "../../engine/redivide.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import {
  SOLVED,
  SolverScratch,
  searchAnswers,
  solve,
  solverAttempt,
} from "./solver.ts";
import { encodeDesc, type SeparateParams, type SeparateShape } from "./state.ts";

/** A dealt board: its letters, and the division it was filled from as each
 * region's squares. */
interface Dealt {
  letters: Uint8Array;
  regions: number[][];
}

// --- a division the solver could solve --------------------------------------

/** Each region's squares, from each square's region. */
function squaresOf(regions: Int32Array, n: number): number[][] {
  const out: number[][] = Array.from({ length: n }, () => []);
  regions.forEach((region, i) => {
    out[region].push(i);
  });
  return out;
}

/**
 * The regions that hold a ring, each once for every join it has beyond a
 * tree's: four squares in a square, or squares going round one outside.
 *
 * The solver finishes no board with such a region, whatever its letters. Its
 * only join is of a component to the one square it can still grow into, and
 * a square on a ring always has two.
 */
function ringed(p: SeparateShape, regions: Int32Array): number[] {
  return squaresOf(regions, (p.w * p.h) / p.k).flatMap((squares, region) => {
    const joins = squares
      .flatMap((i) => adjacentCells(p, i))
      .filter((j) => regions[j] === region).length;
    return new Array<number>(joins / 2 - (p.k - 1)).fill(region);
  });
}

/** The regions divided again at a time to be rid of a ring. */
const RING_WIDTH = 3;

/**
 * The re-divisions tried before a division is given up for its rings, and
 * another drawn.
 *
 * Measured 2026-10-10, no division of a board more than two wide in up to
 * eleven letters was given up at any size swept, one was at 3x12 in twelves,
 * and one in three at 3x13 in thirteens. Two rows are where it fails: 150 of
 * 190 at 2x12 in twelves.
 */
function ringSteps(p: SeparateShape): number {
  return 500 + (100 * p.w * p.h) / p.k;
}

/**
 * A division of the grid into regions of `k` with no ring, each square's
 * region numbered from 0. Null if its rings could not be got rid of.
 *
 * A division drawn at random has one in most regions of six or more, so the
 * ringed regions are divided again with their neighbors, each piece grown as
 * a tree, and the step is kept if it leaves no more rings than before.
 */
function ringlessDivision(p: SeparateShape, rng: RandomState): Int32Array | null {
  const wh = p.w * p.h;
  const dsf = divvyRectangle(p.w, p.h, p.k, rng);
  const numbered = new Int32Array(wh).fill(-1);
  let n = 0;
  for (let i = 0; i < wh; i++) if (dsf.canonify(i) === i) numbered[i] = n++;
  let regions = Int32Array.from({ length: wh }, (_, i) => numbered[dsf.canonify(i)]);
  let rings = ringed(p, regions);
  for (let steps = ringSteps(p); rings.length > 0; steps--) {
    if (steps <= 0) return null;
    const ids = [rings[randomUpto(rng, rings.length)]];
    for (let width = 1; width < RING_WIDTH; width++) {
      const beside = regionsBeside(p, regions, ids);
      if (beside.length === 0) break;
      ids.push(beside[randomUpto(rng, beside.length)]);
    }
    const next = regions.slice();
    if (!redivide(p, next, ids, rng, true)) continue;
    const nextRings = ringed(p, next);
    if (nextRings.length > rings.length) continue;
    regions = next;
    rings = nextRings;
  }
  return regions;
}

// --- letters placed for the solver ------------------------------------------

/** Where the solver stops on some letters: its scratch, and the squares whose
 * letters a deduction has read. */
interface Reading {
  sc: SolverScratch;
  read: Uint8Array;
}

/**
 * The swaps of letters the solver has read that may go by without leaving
 * fewer edges open, before a division is given up.
 *
 * More buys nothing. Measured 2026-10-10 at 12x12 in twelves, the edges open
 * when a division was given up were a median of 66 at 100, 63 at 400 and 61
 * at 1,600. Dividing the regions round an open edge again in place of a
 * swap was tried as well, and was faster at 8x8 in eights and slower at 12x12
 * by as much.
 */
const STALLED_SWAPS = 100;

/** One such swap in this many may leave more edges open, by up to
 * {@link WORSE_BY}. */
const WORSE_ONE_IN = 8;
const WORSE_BY = 2;

/**
 * Letters for a division, placed so that the solver solves the board. Null
 * if it stalled.
 *
 * Upstream filled the regions at random, kept the letters a deduction had
 * read and filled the rest again, until the solver finished or a fill gave
 * it nothing new. Measured 2026-10-10, that ends with four letters in five
 * read and almost nothing joined: 2 divisions in 400 were finished at 6x6 in
 * fours and none in 400 at 8x8.
 *
 * So no fill is left to chance. Where the solver stops, an edge it has not
 * decided between two regions is taken, and one side is given a letter the
 * other holds by swapping two squares of its region, which walls that edge.
 * While both squares are ones no deduction has read, nothing the solver
 * found is undone, and it goes on from where it was. When no such swap is
 * left, letters it has read are swapped, the board is solved again from
 * nothing, and the swap is kept if no more edges are left open than before.
 *
 * The edge taken is on the component nearest to being forced: one with a
 * single square of its own region to grow into and the fewest open edges to
 * other regions, since walling those is what makes the solver join it.
 */
function placedLetters(
  p: SeparateShape,
  regions: Int32Array,
  squares: number[][],
  rng: RandomState,
): Uint8Array | null {
  const { w, h, k } = p;
  const wh = w * h;
  const letters = new Uint8Array(wh);
  for (const region of squares) {
    const order = Array.from({ length: k }, (_, letter) => letter);
    shuffle(order, rng);
    region.forEach((sq, i) => {
      letters[sq] = order[i];
    });
  }
  let at: Reading = { sc: new SolverScratch(w, h, k), read: new Uint8Array(wh) };
  let spare: Reading = { sc: new SolverScratch(w, h, k), read: new Uint8Array(wh) };
  at.sc.init();

  const swap = (a: number, b: number): void => {
    const was = letters[a];
    letters[a] = letters[b];
    letters[b] = was;
  };
  /** The squares of `i`'s component, which lie in its region. */
  const component = (i: number): number[] =>
    squares[regions[i]].filter((sq) => at.sc.dsf.equivalent(sq, i));

  /**
   * Give `x`'s component a letter that `y`'s holds, by swapping one of its
   * squares with the square of its region that has the letter. Returns the
   * two swapped. With `unread`, only squares no deduction has read are
   * swapped, and null says there are none to.
   */
  const share = (x: number, y: number, unread: boolean): [number, number] | null => {
    const mine = component(x).filter((sq) => !(unread && at.read[sq]));
    if (mine.length === 0) return null;
    const theirs = component(y);
    shuffle(theirs, rng);
    // A letter a deduction has read already is one fewer newly read.
    if (unread) theirs.sort((a, b) => at.read[b] - at.read[a]);
    for (const holder of theirs) {
      // Not in `x`'s component, or the solver would have walled the two.
      const from = squares[regions[x]].find((sq) => letters[sq] === letters[holder]);
      if (from === undefined || (unread && at.read[from])) continue;
      const to = mine[randomUpto(rng, mine.length)];
      swap(to, from);
      return [to, from];
    }
    return null;
  };

  /**
   * Run the solver on, and return the edges between two regions that it
   * leaves open, the nearest to forcing a join first. Null once it has
   * solved the board.
   */
  const solveOn = (): [number, number][] | null => {
    const { sc } = at;
    if (solverAttempt(sc, letters, at.read) === SOLVED) return null;
    /** By component: the joins it has yet to make, and its open edges. */
    const joins = new Int32Array(wh);
    const openTo = new Int32Array(wh);
    const edges: [number, number][] = [];
    for (let i = 0; i < wh; i++) {
      const a = sc.dsf.canonify(i);
      // Right and down, so that each edge is met once.
      for (const j of [i % w < w - 1 ? i + 1 : -1, i + w < wh ? i + w : -1]) {
        if (j < 0) continue;
        const b = sc.dsf.canonify(j);
        if (a === b) continue;
        if (regions[i] === regions[j]) {
          joins[a]++;
          joins[b]++;
        } else if (!sc.disconnect[a * wh + b]) {
          openTo[a]++;
          openTo[b]++;
          edges.push([i, j]);
        }
      }
    }
    // With no ring in a region, a component walled off from every other
    // region has one square to grow into at some end, and the solver joins it.
    if (edges.length === 0) throw new Error("separate: stopped with no edge open");
    const far = (i: number): number => {
      const root = sc.dsf.canonify(i);
      return openTo[root] + (joins[root] === 1 ? 0 : wh * 4);
    };
    shuffle(edges, rng);
    return edges
      .map((edge) => ({ edge, far: Math.min(far(edge[0]), far(edge[1])) }))
      .sort((a, b) => a.far - b.far)
      .map(({ edge }) => edge);
  };

  /** Wall the first of `open` that a swap of unread squares can. */
  const shareUnread = (open: [number, number][]): boolean => {
    for (const [i, j] of open) {
      const [x, y] = randomUpto(rng, 2) === 0 ? [i, j] : [j, i];
      if (share(x, y, true) ?? share(y, x, true)) return true;
    }
    return false;
  };

  let open = solveOn();
  let fewest = open?.length ?? 0;
  let stalled = 0;
  while (open !== null) {
    if (shareUnread(open)) {
      open = solveOn();
    } else {
      if (stalled++ >= STALLED_SWAPS) return null;
      // Likelier an edge near the front.
      const [i, j] = open[randomUpto(rng, randomUpto(rng, open.length) + 1)];
      const [x, y] = randomUpto(rng, 2) === 0 ? [i, j] : [j, i];
      const swapped = share(x, y, false);
      if (swapped === null) continue;
      [at, spare] = [spare, at];
      at.sc.init();
      at.read.fill(0);
      const next = solveOn();
      const worse = randomUpto(rng, WORSE_ONE_IN) === 0 ? WORSE_BY : 0;
      if (next !== null && next.length > open.length + worse) {
        swap(...swapped);
        [at, spare] = [spare, at];
        continue;
      }
      open = next;
    }
    if (open !== null && open.length < fewest) {
      fewest = open.length;
      stalled = 0;
    }
  }
  return letters;
}

/**
 * The divisions tried before the generator gives up, sized to the rarest
 * board it is asked for.
 *
 * Measured 2026-10-10, the divisions a board took. Up to five letters: one,
 * and four at most, at every size to 20x20. Six and seven: a median of 1 to
 * 10 and 47 at 15x21 in sevens. From eight letters it follows the squares
 * times the letters squared, which the sizes dealt keep to 10,000: a median
 * of 5 at 12x12 in eights and 35 at most, 32 and 176 at 10x10 in tens, 181
 * and 197 at 6x10 in twelves, 298 and 419 at 4x6 in twelves, and 379 for the
 * one board of 7x11 in elevens that was waited for. A size that takes a
 * median of 400 runs this out once in a thousand boards.
 */
const DIVISIONS = 4_000;

/** An Easy board, upstream's only kind: one the solver's rungs finish. */
function easyBoard(p: SeparateShape, rng: RandomState): Dealt {
  const attempt = retryLimit(`separate: generation (${p.w}x${p.h} k${p.k})`, DIVISIONS);
  for (;;) {
    attempt();
    const division = ringlessDivision(p, rng);
    if (division === null) continue;
    const regions = squaresOf(division, (p.w * p.h) / p.k);
    const letters = placedLetters(p, division, regions, rng);
    if (letters !== null) return { letters, regions };
  }
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
    for (const region of regions)
      for (let a = 0; a < k; a++)
        for (let b = a + 1; b < k; b++) pairs.push([region[a], region[b]]);
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
