/**
 * Palisade generator: a division of the grid whose clues the solver solves,
 * with clues stripped while it (Easy) or the search (Unreasonable) still
 * finds the one answer.
 */

import { DIFF_EASY } from "../../engine/answer-search.ts";
import { BORDER, DX, DY, initBorders, outOfBounds } from "../../engine/border-grid.ts";
import { divvyRectangle } from "../../engine/divvy.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { searchAnswers, solver } from "./solver.ts";
import { EMPTY, encodeDesc, type PalisadeParams, type PalisadeShape } from "./state.ts";

// --- a division the solver solves -------------------------------------------

/** The cells across each edge of `i` that is not on the rim. */
function adjacent(p: PalisadeShape, i: number): number[] {
  const out: number[] = [];
  const x = i % p.w;
  const y = Math.floor(i / p.w);
  for (let dir = 0; dir < 4; dir++) {
    const xx = x + DX[dir];
    const yy = y + DY[dir];
    if (!outOfBounds(xx, yy, p.w, p.h)) out.push(yy * p.w + xx);
  }
  return out;
}

/** A division of the grid into regions of `k`: each cell's region, as a label
 * that says only which cells share one. */
function divide(p: PalisadeShape, rng: RandomState): Int32Array {
  const dsf = divvyRectangle(p.w, p.h, p.k, rng);
  return Int32Array.from({ length: p.w * p.h }, (_, i) => dsf.canonify(i));
}

/** Each cell's clue under a division: the walls round it. */
function cluesOf(p: PalisadeShape, regions: Int32Array): Int8Array {
  return Int8Array.from(regions, (region, i) => {
    const within = adjacent(p, i).filter((j) => regions[j] === region).length;
    return 4 - within;
  });
}

/**
 * The walls of a division that the solver, given every clue, does not place,
 * each as the two cells it stands between. None means it solved the board:
 * the deductions place no wall the division lacks, so with every wall placed
 * the board is the division.
 */
function unplacedWalls(
  p: PalisadeShape,
  regions: Int32Array,
  clues: Int8Array,
): [number, number][] {
  const { w, h } = p;
  const borders = initBorders(w, h);
  if (solver(p, clues, borders)) return [];
  const walls: [number, number][] = [];
  for (let i = 0; i < w * h; i++) {
    // Right and down, so that each edge is met once.
    for (const dir of [1, 2]) {
      const x = (i % w) + DX[dir];
      const y = Math.floor(i / w) + DY[dir];
      if (outOfBounds(x, y, w, h)) continue;
      const j = y * w + x;
      if (regions[i] !== regions[j] && !(borders[i] & BORDER(dir))) walls.push([i, j]);
    }
  }
  return walls;
}

/** Whether `cells` are one connected piece. */
function connected(p: PalisadeShape, cells: number[]): boolean {
  const left = new Set(cells);
  const stack = [cells[0]];
  left.delete(cells[0]);
  for (let i = stack.pop(); i !== undefined; i = stack.pop()) {
    for (const j of adjacent(p, i)) if (left.delete(j)) stack.push(j);
  }
  return left.size === 0;
}

/** The tries at one piece before a re-division is given up. Most pieces
 * grown at random leave the rest in two parts. */
const PEEL_TRIES = 20;

/**
 * A connected piece of `k` cells of `pool`, grown at random from a random
 * cell, whose removal leaves the rest connected. Null if no try gave one.
 * `pool` is connected and holds more than `k` cells, so a piece short of `k`
 * always has a cell of the pool beside it.
 */
function peel(p: PalisadeShape, pool: number[], rng: RandomState): number[] | null {
  for (let tries = 0; tries < PEEL_TRIES; tries++) {
    const piece = new Set([pool[randomUpto(rng, pool.length)]]);
    for (let size = 1; size < p.k; size++) {
      // A cell beside two of the piece is listed twice, and so likelier.
      const beside = [...piece]
        .flatMap((i) => adjacent(p, i))
        .filter((j) => pool.includes(j) && !piece.has(j));
      piece.add(beside[randomUpto(rng, beside.length)]);
    }
    if (
      connected(
        p,
        pool.filter((i) => !piece.has(i)),
      )
    )
      return [...piece];
  }
  return null;
}

/**
 * Divide the cells of the regions `ids`, which are connected, among them
 * again at random. False if it could not, with `regions` left part-written.
 */
function redivide(
  p: PalisadeShape,
  regions: Int32Array,
  ids: readonly number[],
  rng: RandomState,
): boolean {
  let pool: number[] = [];
  regions.forEach((region, i) => {
    if (ids.includes(region)) pool.push(i);
  });
  // The last region is what the others leave.
  for (const id of ids.slice(0, -1)) {
    const piece = peel(p, pool, rng);
    if (piece === null) return false;
    for (const i of piece) regions[i] = id;
    pool = pool.filter((i) => !piece.includes(i));
  }
  for (const i of pool) regions[i] = ids[ids.length - 1];
  return true;
}

/** The regions with a cell beside one of `ids`, those apart. */
function regionsBeside(
  p: PalisadeShape,
  regions: Int32Array,
  ids: readonly number[],
): number[] {
  const beside = new Set<number>();
  regions.forEach((region, i) => {
    if (!ids.includes(region)) return;
    for (const j of adjacent(p, i))
      if (!ids.includes(regions[j])) beside.add(regions[j]);
  });
  return [...beside];
}

/**
 * The regions divided again at a time: the two an unplaced wall stands
 * between and their neighbors, from {@link NARROWEST} up to {@link WIDEST},
 * one more for every {@link WIDEN_AFTER} steps that have left no fewer walls
 * unplaced, and then from the narrowest again.
 *
 * Few regions cannot leave some stalls: two I-shaped regions of three along
 * the rim and an L against them can be cut one other way, which gives every
 * cell the same clue. Many at once seldom leave a step worth keeping.
 *
 * Measured 2026-10-10, boards on which the generator gave up, of 2,000 at 6x6
 * in threes and of 1,000 at 9x9 in threes: 150 and 260 at three regions, none
 * and 5 at four, none and none at four to eight. The most steps a board took
 * at four to eight was 152 and 430, against 593 and 1,518 at four.
 */
const NARROWEST = 4;
const WIDEST = 8;
const WIDEN_AFTER = 20;

/** One step in this many may leave more walls unplaced, by up to
 * {@link WORSE_BY}. Measured 2026-10-10 on 300 boards of 9x9 in threes, the
 * median solver runs to a board were 94 without and 28 with. */
const WORSE_ONE_IN = 8;
const WORSE_BY = 3;

/**
 * The steps a board may take before the generator gives up, each a
 * re-division tried. Running it out is a defect, and not a size too hard to
 * deal: the steps a board takes grow with its regions and no faster.
 *
 * Measured 2026-10-10, the most steps any board took | this limit: 6x6 in
 * threes 174 of 8,000 boards | 1,100; 9x9 in threes 536 of 4,000 | 1,850;
 * 12x12 in threes 419 of 100 | 2,900; 30x30 in threes 1,769 of 2 | 15,500.
 * At 9x9 one board in a thousand took more than 430, and one in a hundred
 * more than 316. Larger regions take fewer: 10x15 in fives 68 of 40.
 */
function stepLimit(p: PalisadeShape): number {
  return 500 + 50 * Math.floor((p.w * p.h) / p.k);
}

/**
 * The clues of a division that the solver solves with every clue showing.
 *
 * A division drawn at random seldom is one. Most have a second answer under
 * the same clues, in a few regions that can be cut another way, and the more
 * regions the likelier: one division in 18 is kept at 6x6 in threes and none
 * in a thousand at 9x9. So a division is not thrown away. Where the solver
 * stalls, the regions round a wall it did not place are divided again, and
 * the step is kept if it leaves no more walls unplaced than before.
 *
 * A division the solver solves as drawn draws nothing more.
 */
function solvableClues(p: PalisadeShape, rng: RandomState): Int8Array {
  let regions = divide(p, rng);
  let clues = cluesOf(p, regions);
  let unplaced = unplacedWalls(p, regions, clues);
  const step = retryLimit(`palisade: generation (${p.w}x${p.h} k${p.k})`, stepLimit(p));
  let fewest = unplaced.length;
  let stalled = 0;
  while (unplaced.length > 0) {
    step();
    const width =
      NARROWEST + (Math.floor(stalled++ / WIDEN_AFTER) % (WIDEST - NARROWEST + 1));
    const ids = [...unplaced[randomUpto(rng, unplaced.length)]].map((i) => regions[i]);
    for (let n = ids.length; n < width; n++) {
      const beside = regionsBeside(p, regions, ids);
      if (beside.length === 0) break;
      ids.push(beside[randomUpto(rng, beside.length)]);
    }
    const next = regions.slice();
    if (!redivide(p, next, ids, rng)) continue;
    const nextClues = cluesOf(p, next);
    // The same division, or one no clue tells from it.
    if (nextClues.every((clue, i) => clue === clues[i])) continue;
    const nextUnplaced = unplacedWalls(p, next, nextClues);
    const worse = randomUpto(rng, WORSE_ONE_IN) === 0 ? WORSE_BY : 0;
    if (nextUnplaced.length > unplaced.length + worse) continue;
    regions = next;
    clues = nextClues;
    unplaced = nextUnplaced;
    if (unplaced.length < fewest) {
      fewest = unplaced.length;
      stalled = 0;
    }
  }
  return clues;
}

// --- stripping --------------------------------------------------------------

/** Strip clues in a random order, each gone only while `keeps` still holds
 * of what is left. */
function stripClues(
  numbers: Int8Array,
  rng: RandomState,
  keeps: (numbers: Int8Array) => boolean,
): void {
  const shuf: number[] = Array.from(numbers, (_, i) => i);
  shuffle(shuf, rng);
  for (const idx of shuf) {
    const copy = numbers[idx];
    if (copy === EMPTY) continue;
    numbers[idx] = EMPTY;
    if (!keeps(numbers)) numbers[idx] = copy;
  }
}

/** An Easy board, upstream's only kind: a division the solver solves,
 * stripped of clues while it still does. */
function easyClues(p: PalisadeShape, rng: RandomState): Int8Array {
  const rim = initBorders(p.w, p.h);
  const numbers = solvableClues(p, rng);
  stripClues(numbers, rng, (left) => solver(p, left, rim.slice()));
  return numbers;
}

/**
 * The positions the search may try when a clue is stripped from an
 * Unreasonable board, far under the 2,000 it has by default. Stripping stops
 * only when the search can no longer prove one answer, so it takes a board up
 * to whatever the search is allowed, and this is how hard the tier's boards
 * are.
 *
 * Measured 2026-10-10: a dealt board needs a median of 9 positions at 5×5 and
 * 25 to 29 at the larger presets, and the hint leaves a median of 25 edges of
 * 40 undecided at 5×5, 53 of 82 at 6×8 and 155 of 333 at 12×15. No edge on
 * these boards is wrong at a glance: assuming one and looking, with no
 * deduction run, settled none of 90, where assuming one and following the
 * deductions from it, one trial at a time, finished most.
 */
const HIDING_BUDGET = 30;

/**
 * An Unreasonable board: an Easy board with more clues stripped, each while
 * the search still proves one answer within {@link HIDING_BUDGET}, kept if the
 * solver then stops short. An Easy board is one the solver stops short on
 * with any clue gone, so stripping one is what takes it out of reach.
 *
 * It starts from an Easy board and not from every clue, which the search
 * could strip as well. Measured 2026-10-10, that way took twice as long and
 * left the solver less to do at every preset.
 */
function unreasonableClues(p: PalisadeShape, rng: RandomState): Int8Array {
  const rim = initBorders(p.w, p.h);
  const one = (left: Int8Array) => searchAnswers(p, left, HIDING_BUDGET).kind === "one";
  // The boards stripped before giving up. Only the smallest are thrown away
  // for giving up no clue.
  const attempt = retryLimit(
    `palisade: Unreasonable generation (${p.w}x${p.h} k${p.k})`,
    Math.max(20, Math.ceil(100_000 / (p.w * p.h) ** 2)),
  );
  for (;;) {
    attempt();
    const numbers = easyClues(p, rng);
    stripClues(numbers, rng, one);
    if (!solver(p, numbers, rim.slice())) return numbers;
  }
}

export function newDesc(p: PalisadeParams, rng: RandomState): { desc: string } {
  const numbers = p.diff === DIFF_EASY ? easyClues(p, rng) : unreasonableClues(p, rng);
  return { desc: encodeDesc(numbers, p.w * p.h) };
}
