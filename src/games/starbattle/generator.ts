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
import {
  growFromSeeds,
  mergeToCount,
  regionForest,
  regionNumbers,
} from "../../engine/divide.ts";
import { type MendJudge, mendDivision } from "../../engine/mend-division.ts";
import type { RandomState } from "../../engine/random/index.ts";
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
 * The stars of each arrangement the search met that fits `regions`, agrees
 * with the marks in `from` and is not `answer`: none where it met none.
 *
 * Trial and error over the ladder (`engine/answer-search.ts`). Where the
 * ladder stops, a cell of the row, column or region with the fewest open
 * cells is assumed each way, the way `answer` does not have it first, so a
 * second answer is met before the first is.
 */
function otherAnswers(
  p: StarbattleParams,
  regions: Int32Array,
  answer: ReadonlySet<number>,
  from: Uint8Array,
  cap: number,
): number[][] {
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
  return (found ?? [])
    .map(starsOf)
    .filter((cells) => cells.some((i) => !answer.has(i)));
}

/** The fewest cells a region is dealt with: twice its stars, so that none
 * hands its stars over at a glance. */
const smallestRegion = (p: StarbattleParams): number => 2 * p.stars;

/**
 * The mend's judge (`engine/mend-division.ts`): the ladder capped at `cap`
 * on the regions as they stand, a second answer's stars, and the ladder a
 * tier lower. A star of a second answer moved to another region leaves that
 * region a star too many in it.
 */
function judgeOf(
  p: StarbattleParams,
  regions: Int32Array,
  answer: ReadonlySet<number>,
  cap: number,
): MendJudge<Uint8Array> {
  const { size, stars } = p;
  const deduce = (tier: number) => {
    const marks = new Uint8Array(size * size);
    solveStarbattle(new StarbattleBoard(size, stars, regions, marks), tier);
    const open = Array.from(marks.keys()).filter((i) => marks[i] === BLANK);
    return { open, position: marks };
  };
  return {
    deduce: () => deduce(cap),
    others: (marks) => otherAnswers(p, regions, answer, marks, cap),
    tooEasy: cap === 0 ? null : () => deduce(cap - 1).open.length === 0,
  };
}

/** A board the ladder finishes when capped at `cap`, as each cell's region.
 * `null` where this draw came to nothing. `spent` is as `mendDivision` has
 * it. */
function drawRegions(
  p: StarbattleParams,
  cap: number,
  rng: RandomState,
  spent: { moves: number },
): Int32Array | null {
  const seeds = placeStars(p, rowChoices(p.size, p.stars), rng);
  if (seeds === null) return null;
  const regions = regionsRound(p, seeds, rng);
  if (regions === null) return null;
  const cells = new Int32Array(p.size);
  for (const r of regions) cells[r]++;
  if (cells.some((n) => n < smallestRegion(p))) return null;
  const answer = new Set(seeds);
  const mended = mendDivision({
    grid: { w: p.size, h: p.size },
    regions,
    fixed: answer,
    smallest: smallestRegion(p),
    judge: judgeOf(p, regions, answer, cap),
    rng,
    spent,
  });
  return mended ? regions : null;
}

export function newStarbattleDesc(
  p: StarbattleParams,
  rng: RandomState,
): { desc: string } {
  const cells = p.size * p.size;
  const attempt = retryLimit("starbattle: generation");
  const spent = { moves: 0 };
  for (;;) {
    attempt();
    const regions = drawRegions(p, p.diff, rng, spent);
    if (regions === null) continue;
    const capped: CappedSolve = (cap) =>
      solveStarbattle(
        new StarbattleBoard(p.size, p.stars, regions, new Uint8Array(cells)),
        cap,
      );
    if (solvableAtExactlyTier(capped, p.diff))
      return {
        desc: encodeDesc(regionForest({ w: p.size, h: p.size }, regions), p.size),
      };
  }
}
