/**
 * Star Battle's generator: place the stars, take a region round them from
 * the engine's division, mend the regions until those stars are the only
 * answer, and keep the board only if the ladder finishes it and needs
 * exactly the tier asked for.
 *
 * The regions are all a board gives the player, so there is nothing to take
 * away from one that is too easy: it is dealt again.
 */

import { solvedPositions } from "../../engine/answer-search.ts";
import { type CappedSolve, solvableAtExactlyTier } from "../../engine/difficulty.ts";
import { growFromSeeds, mergeToCount, regionNumbers } from "../../engine/divide.ts";
import { Dsf } from "../../engine/dsf.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { adjacentCells } from "../../engine/redivide.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { StarbattleBoard, solveStarbattle } from "./solver.ts";
import { BLANK, CROSSED, encodeDesc, STAR, type StarbattleParams } from "./state.ts";

/** Every way to put `stars` stars in a row of `size` cells with no two
 * side by side, each as its columns in order. */
function rowChoices(size: number, stars: number): number[][] {
  const out: number[][] = [];
  const extend = (from: number, chosen: number[]): void => {
    if (chosen.length === stars) {
      out.push(chosen);
      return;
    }
    for (let x = from; x < size; x++) extend(x + 2, [...chosen, x]);
  };
  extend(0, []);
  return out;
}

/**
 * Stars at random, `p.stars` to every row and column and no two touching, as
 * cells in reading order. `null` where the grid has no arrangement at all.
 *
 * A search down the rows that tries each row's arrangements in a random
 * order and backs up from a row that has none left.
 */
function placeStars(
  p: StarbattleParams,
  choices: readonly number[][],
  rng: RandomState,
): number[] | null {
  const { size, stars } = p;
  const held = new Int32Array(size);
  const placed: number[][] = [];

  const fill = (y: number): boolean => {
    if (y === size) return true;
    const above = placed[y - 1] ?? [];
    // A column takes a star every other row at most, and none in this row
    // under one it has just taken.
    const left = size - y;
    for (let x = 0; x < size; x++) {
      const room = above.includes(x) ? left - 1 : left;
      if (stars - held[x] > Math.ceil(room / 2)) return false;
    }
    const order = choices.filter((row) =>
      row.every((x) => held[x] < stars && above.every((a) => a < x - 1 || a > x + 1)),
    );
    shuffle(order, rng);
    for (const row of order) {
      for (const x of row) held[x]++;
      placed.push(row);
      if (fill(y + 1)) return true;
      placed.pop();
      for (const x of row) held[x]--;
    }
    return false;
  };

  if (!fill(0)) return null;
  return placed.flatMap((row, y) => row.map((x) => y * size + x));
}

/**
 * Regions round the stars at `seeds`, each holding `p.stars` of them: one
 * grown round every star, and those joined until there are as many as the
 * grid is wide. `null` where the joining ends with a region it cannot place.
 */
function regionsRound(
  p: StarbattleParams,
  seeds: readonly number[],
  rng: RandomState,
): Int32Array | null {
  const grid = { w: p.size, h: p.size };
  const one = growFromSeeds(grid, seeds, rng);
  const joined =
    p.stars === 1
      ? one
      : mergeToCount(
          grid,
          rng,
          {
            from: one,
            of: () => 1,
            join: (a, b) => (a + b <= p.stars ? a + b : null),
          },
          p.size,
        );
  return joined && regionNumbers(joined, p.size * p.size);
}

/** The positions a search for a second answer may try from where the ladder
 * stops. Where it finds none in that many, the board is taken to have one
 * answer the ladder does not reach. */
const SEARCH_BUDGET = 24;

/**
 * The stars of an arrangement that fits `regions`, agrees with the marks in
 * `from` and is not `answer`, or `null` where the search met none.
 *
 * Trial and error over the ladder (`engine/answer-search.ts`). Where the
 * ladder stops, a cell of the row, column or region with the fewest open
 * cells is assumed each way, the way `answer` does not have it first, so a
 * second answer is met before the first is.
 */
function otherAnswer(
  p: StarbattleParams,
  regions: Int32Array,
  answer: ReadonlySet<number>,
  from: Uint8Array,
  cap: number,
): number[] | null {
  const { size, stars } = p;
  const board = (grid: Uint8Array): StarbattleBoard =>
    new StarbattleBoard(size, stars, regions, grid);
  const starsOf = (grid: Uint8Array): number[] =>
    Array.from(grid.keys()).filter((i) => grid[i] === STAR);
  const found = solvedPositions<Uint8Array, Uint8Array>(
    {
      start: from.slice(),
      deduce: (grid) => {
        const verdict = solveStarbattle(board(grid), cap);
        if (verdict === "impossible") return "contradiction";
        return verdict === "solved" ? "solved" : "stuck";
      },
      assume: (grid) => {
        const b = board(grid);
        let fewest: number[] = [];
        for (let unit = 0; unit < b.units.length; unit++) {
          const open = b.open(unit);
          if (open.length > 0 && (fewest.length === 0 || open.length < fewest.length))
            fewest = open;
        }
        const cell = fewest[0];
        return (answer.has(cell) ? [CROSSED, STAR] : [STAR, CROSSED]).map((mark) => {
          const next = grid.slice();
          next[cell] = mark;
          return next;
        });
      },
      solution: (grid) => grid,
      budget: SEARCH_BUDGET,
    },
    2,
  );
  return found?.map(starsOf).find((cells) => cells.some((i) => !answer.has(i))) ?? null;
}

/** The fewest cells a region is dealt with: twice its stars, so that none
 * hands its stars over at a glance. */
const smallestRegion = (p: StarbattleParams): number => 2 * p.stars;

/** Whether the region of `cell` is still one piece, and large enough,
 * without it. */
function sparable(p: StarbattleParams, regions: Int32Array, cell: number): boolean {
  const grid = { w: p.size, h: p.size };
  const rest: number[] = [];
  regions.forEach((r, i) => {
    if (r === regions[cell] && i !== cell) rest.push(i);
  });
  if (rest.length < smallestRegion(p)) return false;
  const left = new Set(rest);
  const stack = [rest[0]];
  left.delete(rest[0]);
  for (let i = stack.pop(); i !== undefined; i = stack.pop())
    for (const j of adjacentCells(grid, i)) if (left.delete(j)) stack.push(j);
  return left.size === 0;
}

/** The moves of a cell at one board before it is given up, for each cell of
 * its area. A board that needs more is going round in circles. */
const MENDS_PER_CELL = 2;

/**
 * Change `regions` until the ladder, capped at `cap`, finishes the board, and
 * say whether that was reached. The stars at `answer` fit the regions before
 * and after.
 *
 * Each pass takes one cell where `answer` has no star into a region beside
 * it, the regions staying connected. Where the board has another answer the
 * cell is one of its stars: the region it joins then holds a star too many in
 * that answer and the one it left a star too few. Where it has none, the cell
 * is one the ladder left open, and the move is kept unless it leaves more
 * cells open than before.
 */
function mend(
  p: StarbattleParams,
  regions: Int32Array,
  answer: ReadonlySet<number>,
  cap: number,
  rng: RandomState,
): boolean {
  const { size, stars } = p;
  const grid = { w: size, h: size };
  const deduce = (): { marks: Uint8Array; open: number } => {
    const marks = new Uint8Array(size * size);
    solveStarbattle(new StarbattleBoard(size, stars, regions, marks), cap);
    return { marks, open: marks.reduce((n, m) => n + (m === BLANK ? 1 : 0), 0) };
  };

  /** Each way to take one of `from` into a region beside it. */
  const waysFrom = (from: Iterable<number>): [cell: number, to: number][] => {
    const ways: [cell: number, to: number][] = [];
    for (const cell of from) {
      if (answer.has(cell) || !sparable(p, regions, cell)) continue;
      for (const j of adjacentCells(grid, cell))
        if (regions[j] !== regions[cell]) ways.push([cell, regions[j]]);
    }
    return ways;
  };

  let at = deduce();
  // The search's answer for the board as it stands. A move taken back leaves
  // the board as it was, so the search is not run again after one.
  let other: number[] | null = null;
  let searched = false;
  for (let moves = 0; moves < MENDS_PER_CELL * size * size; moves++) {
    if (at.open === 0) return true;
    if (!searched) other = otherAnswer(p, regions, answer, at.marks, cap);
    searched = true;
    let ways = waysFrom(
      other ?? Array.from(at.marks.keys()).filter((i) => at.marks[i] === BLANK),
    );
    // Another answer none of whose stars can move is broken up from
    // anywhere: the next pass meets a different one.
    if (ways.length === 0 && other) ways = waysFrom(at.marks.keys());
    if (ways.length === 0) return false;
    const [cell, to] = ways[randomUpto(rng, ways.length)];
    const was = regions[cell];
    regions[cell] = to;
    const next = deduce();
    if (other === null && next.open > at.open) regions[cell] = was;
    else {
      at = next;
      searched = false;
    }
  }
  return false;
}

/** A board the ladder finishes when capped at `cap`, as each cell's region.
 * `null` where this draw came to nothing. */
function drawRegions(
  p: StarbattleParams,
  cap: number,
  rng: RandomState,
): Int32Array | null {
  const seeds = placeStars(p, rowChoices(p.size, p.stars), rng);
  if (seeds === null) return null;
  const regions = regionsRound(p, seeds, rng);
  if (regions === null) return null;
  const cells = new Int32Array(p.size);
  for (const r of regions) cells[r]++;
  if (cells.some((n) => n < smallestRegion(p))) return null;
  return mend(p, regions, new Set(seeds), cap, rng) ? regions : null;
}

/** The regions as the forest the desc is written from. */
function joinedCells(size: number, regions: Int32Array): Dsf {
  const grid = { w: size, h: size };
  const joined = new Dsf(size * size);
  regions.forEach((r, i) => {
    for (const j of adjacentCells(grid, i)) if (regions[j] === r) joined.merge(i, j);
  });
  return joined;
}

export function newStarbattleDesc(
  p: StarbattleParams,
  rng: RandomState,
): { desc: string } {
  const cells = p.size * p.size;
  const attempt = retryLimit("starbattle: generation");
  for (;;) {
    attempt();
    const regions = drawRegions(p, p.diff, rng);
    if (regions === null) continue;
    const capped: CappedSolve = (cap) =>
      solveStarbattle(
        new StarbattleBoard(p.size, p.stars, regions, new Uint8Array(cells)),
        cap,
      );
    if (solvableAtExactlyTier(capped, p.diff))
      return { desc: encodeDesc(joinedCells(p.size, regions), p.size) };
  }
}
