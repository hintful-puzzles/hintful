/**
 * Norinori's generator: place dominoes, take a region round each pair of
 * shaded squares from the engine's division, mend the regions until those
 * dominoes are the only answer, and keep the board only if the ladder
 * finishes it and needs exactly the tier asked for.
 *
 * The regions are all a board gives the player, so there is nothing to take
 * away from one that is too easy: it is dealt again.
 */

import { solvedPositions } from "../../engine/answer-search.ts";
import { drawRejected } from "../../engine/deal-census.ts";
import { type CappedSolve, solvableAtExactlyTier } from "../../engine/difficulty.ts";
import {
  growFromSeeds,
  mergeToCount,
  regionForest,
  regionNumbers,
} from "../../engine/divide.ts";
import { type MendJudge, mendDivision } from "../../engine/mend-division.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { areasOf, type NorinoriBoard, solveNorinori } from "./solver.ts";
import {
  BLANK,
  CROSSED,
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_TRICKY,
  encodeDesc,
  type NorinoriParams,
  neighbors,
  SHADED,
} from "./state.ts";

/** The squares a grid has for each domino placed on it, and so for each
 * region. */
const SQUARES_PER_DOMINO = 5;

/**
 * Dominoes at random, no two side by side, as their squares in reading
 * order: up to one for every {@link SQUARES_PER_DOMINO} squares, fewer where
 * the grid has no room left for one.
 */
function placeDominoes(p: NorinoriParams, rng: RandomState): number[] {
  const { w, h } = p;
  const shaded = new Uint8Array(w * h);
  const want = Math.floor((w * h) / SQUARES_PER_DOMINO);
  // A square is free while neither it nor a square beside it is shaded.
  const free = (i: number): boolean =>
    shaded[i] === 0 && neighbors(w, h, i).every((j) => shaded[j] === 0);
  const order = Array.from({ length: w * h }, (_, i) => i);
  shuffle(order, rng);
  let placed = 0;
  for (const i of order) {
    if (placed === want) break;
    if (!free(i)) continue;
    const partners = neighbors(w, h, i).filter((j) => {
      if (!free(j)) return false;
      shaded[i] = 1;
      const ok = neighbors(w, h, j).every((k) => k === i || shaded[k] === 0);
      shaded[i] = 0;
      return ok;
    });
    if (partners.length === 0) continue;
    shaded[i] = 1;
    shaded[partners[randomUpto(rng, partners.length)]] = 1;
    placed++;
  }
  return Array.from(shaded.keys()).filter((i) => shaded[i] === 1);
}

/** One domino in this many is dealt as a region of its own two squares, by
 * tier. An Easy board's steps read one region or one domino at a time, and
 * the boards that come right hold about one such region in two (measured
 * 2026-11-16 at 8x8: 4 to 6 of 12 where they were dealt one in four); a
 * harder tier's reach further. */
const CLOSED_ONE_IN: Readonly<Record<number, number>> = {
  [DIFF_EASY]: 2,
  [DIFF_NORMAL]: 3,
  [DIFF_TRICKY]: 4,
};

/** At most one region in this many is a closed domino. The Easy boards that
 * come right are those dealt the most, and uncapped a 6x6 one came with five
 * of its seven regions closed and one region of seventeen squares: a board
 * of givens. The limit makes an 8x8 Easy deal about half as slow again
 * (deal walk, back to back, 2026-11-16: median 6 s against 4). */
const CLOSED_AT_MOST_ONE_IN = 3;

/** The most squares a region is dealt with, against the mean of the regions
 * that are not closed dominoes, by tier. A large region says little, and the
 * Easy boards the mend gave up on had stalled furthest in regions of twelve
 * and more on an 8x8. A harder tier is left uncapped: capped as Easy, an
 * 8x8 Normal board met the retry limit, its boards coming out Easy
 * (measured 2026-11-16). */
const LARGEST_OVER_MEAN: Readonly<Record<number, number>> = {
  [DIFF_EASY]: 1.6,
  [DIFF_NORMAL]: Infinity,
  [DIFF_TRICKY]: Infinity,
};

/** What a region holds, for the merge: its shaded squares and its size. */
interface Held {
  shaded: number;
  size: number;
}

/**
 * Regions round the shaded squares `seeds`, each holding two of them, and
 * the dominoes dealt as regions of their own two squares. Some dominoes are
 * closed so, since a board's first steps start from such a region and a mend
 * seldom makes one. A region is grown round every other shaded square, and
 * those are joined in twos. `null` where the closed dominoes wall a square
 * off, or the joining ends with a region it cannot pair.
 */
function regionsRound(
  p: NorinoriParams,
  seeds: readonly number[],
  rng: RandomState,
): { regions: Int32Array; closed: ReadonlySet<number> } | null {
  const { w, h } = p;
  const grid = { w, h };
  const shaded = new Set(seeds);
  const closed = new Set<number>();
  const most = Math.floor(seeds.length / 2 / CLOSED_AT_MOST_ONE_IN);
  // In a random order, so that the limit leaves no part of the board open.
  const order = [...seeds];
  shuffle(order, rng);
  for (const i of order) {
    if (closed.size / 2 >= most) break;
    // A domino is drawn once, from its first square.
    const partner = neighbors(w, h, i).find((j) => shaded.has(j)) as number;
    if (partner > i && randomUpto(rng, CLOSED_ONE_IN[p.diff]) === 0)
      closed.add(i).add(partner);
  }
  const open = seeds.filter((i) => !closed.has(i));
  if (open.length === 0) return drawRejected("norinori: every domino closed");
  const grown = growFromSeeds(grid, open, rng, closed);
  if (grown === null) return null;
  for (const i of closed)
    grown.merge(i, neighbors(w, h, i).find((j) => closed.has(j)) as number);
  const count = seeds.length / 2;
  const largest = Math.ceil(
    (LARGEST_OVER_MEAN[p.diff] * (w * h - closed.size)) / (count - closed.size / 2),
  );
  // A closed domino holds its two shaded squares already, so joins nothing.
  const joined = mergeToCount<Held>(
    grid,
    rng,
    {
      from: grown,
      of: (i) => ({ shaded: closed.has(i) ? 2 : 1, size: grown.size(i) }),
      join: (a, b) =>
        a.shaded + b.shaded > 2 || a.size + b.size > largest
          ? null
          : { shaded: a.shaded + b.shaded, size: a.size + b.size },
    },
    count,
  );
  return joined && { regions: regionNumbers(joined, w * h), closed };
}

/** The positions a search for a second answer may try from where the ladder
 * stops. Where it finds none in that many, the board is taken to have one
 * answer the ladder does not reach. */
const SEARCH_BUDGET = 24;

/**
 * The shaded squares of each answer the search met that fits `regions`,
 * agrees with the marks in `from` and is not `answer`: none where it met
 * none.
 *
 * Trial and error over the ladder (`engine/answer-search.ts`). Where the
 * ladder stops, an open square of the region with the fewest is assumed each
 * way, the way `answer` does not have it first, so a second answer is met
 * before the first is.
 */
function otherAnswers(
  p: NorinoriParams,
  regions: Int32Array,
  answer: ReadonlySet<number>,
  from: Uint8Array,
  cap: number,
): number[][] {
  const { w, h } = p;
  const areas = areasOf(regions);
  const board = (grid: Uint8Array): NorinoriBoard => ({ w, h, regions, grid });
  const found = solvedPositions<Uint8Array, Uint8Array>(
    {
      start: from.slice(),
      deduce: (grid) => {
        const verdict = solveNorinori(board(grid), cap);
        if (verdict === "impossible") return "contradiction";
        return verdict === "solved" ? "solved" : "stuck";
      },
      assume: (grid) => {
        let fewest: number[] = [];
        for (const area of areas) {
          const open = area.filter((i) => grid[i] === BLANK);
          if (open.length > 0 && (fewest.length === 0 || open.length < fewest.length))
            fewest = open;
        }
        const cell = fewest[0];
        return (answer.has(cell) ? [CROSSED, SHADED] : [SHADED, CROSSED]).map(
          (mark) => {
            const next = grid.slice();
            next[cell] = mark;
            return next;
          },
        );
      },
      solution: (grid) => grid,
      budget: SEARCH_BUDGET,
    },
    2,
  );
  return (found ?? [])
    .map((grid) => Array.from(grid.keys()).filter((i) => grid[i] === SHADED))
    .filter((cells) => cells.some((i) => !answer.has(i)));
}

/** The fewest squares a region is dealt with, but for a closed domino's. A
 * region of two is both its shaded squares at a glance, and a mend left to
 * make them deals boards that are little else. */
const SMALLEST_REGION = 3;

/**
 * The mend's judge (`engine/mend-division.ts`): the ladder capped at `cap`
 * on the regions as they stand, a second answer's shaded squares, and the
 * ladder a tier lower.
 */
function judgeOf(
  p: NorinoriParams,
  regions: Int32Array,
  answer: ReadonlySet<number>,
  cap: number,
): MendJudge<Uint8Array> {
  const { w, h } = p;
  const deduce = (tier: number) => {
    const marks = new Uint8Array(w * h);
    solveNorinori({ w, h, regions, grid: marks }, tier);
    const open = Array.from(marks.keys()).filter((i) => marks[i] === BLANK);
    return { open, position: marks };
  };
  return {
    deduce: () => deduce(cap),
    others: (marks) => otherAnswers(p, regions, answer, marks, cap),
    tooEasy: cap === 0 ? null : () => deduce(cap - 1).open.length === 0,
  };
}

/** A board the ladder finishes when capped at `cap`, as each square's
 * region. `null` where this draw came to nothing. `spent` is as
 * `mendDivision` has it. */
function drawRegions(
  p: NorinoriParams,
  cap: number,
  rng: RandomState,
  spent: { moves: number },
): Int32Array | null {
  const seeds = placeDominoes(p, rng);
  if (seeds.length === 0) return drawRejected("norinori: no room for a domino");
  const round = regionsRound(p, seeds, rng);
  if (round === null) return null;
  const { regions, closed } = round;
  const sizes = new Int32Array(seeds.length / 2);
  for (const r of regions) sizes[r]++;
  if (regions.some((r, i) => !closed.has(i) && sizes[r] < SMALLEST_REGION))
    return drawRejected(`norinori: a region under ${SMALLEST_REGION} squares`);
  const answer = new Set(seeds);
  const mended = mendDivision({
    grid: { w: p.w, h: p.h },
    regions,
    fixed: answer,
    smallest: SMALLEST_REGION,
    judge: judgeOf(p, regions, answer, cap),
    rng,
    spent,
  });
  return mended ? regions : null;
}

export function newNorinoriDesc(p: NorinoriParams, rng: RandomState): { desc: string } {
  const { w, h } = p;
  const attempt = retryLimit("norinori: generation");
  const spent = { moves: 0 };
  for (;;) {
    attempt();
    const regions = drawRegions(p, p.diff, rng, spent);
    if (regions === null) continue;
    const capped: CappedSolve = (cap) =>
      solveNorinori({ w, h, regions, grid: new Uint8Array(w * h) }, cap);
    if (solvableAtExactlyTier(capped, p.diff))
      return { desc: encodeDesc(regionForest({ w, h }, regions), w, h) };
  }
}
