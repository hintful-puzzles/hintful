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

/** The rounds of {@link placeDominoes}' refill. A greedy fill alone stops at
 * about 36% of the squares shaded at any size; 300 rounds reach about 45%
 * in under 10 ms at 10x10, and 1,500 only 48% for five times the cost
 * (measured 2026-11-16). */
const REFILL_ROUNDS = 300;

/**
 * Dominoes at random, no two side by side, as their squares in reading
 * order, packed as densely as {@link REFILL_ROUNDS} rounds of a refill get
 * them: take one domino away, fill the grid again greedily, and keep the
 * result where no fewer come back.
 *
 * Density is what makes a board come right. Each region holds two shaded
 * squares, so the denser the dominoes the smaller the regions, and a region's
 * room for other answers grows with its size. Packed so, a 10x10 Easy board
 * deals in under a second where it took a minute and more (deal walk,
 * 2026-11-16). The refill is sen-ltd/norinori's (`inducedMatching`, MIT).
 */
function placeDominoes(p: NorinoriParams, rng: RandomState): number[] {
  const { w, h } = p;
  const shaded = new Uint8Array(w * h);
  // A square is free while neither it nor a square beside it is shaded.
  const free = (i: number): boolean =>
    shaded[i] === 0 && neighbors(w, h, i).every((j) => shaded[j] === 0);
  /** Place dominoes in random order wherever one fits; how many. */
  const fill = (): number => {
    const order = Array.from({ length: w * h }, (_, i) => i);
    shuffle(order, rng);
    let placed = 0;
    for (const i of order) {
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
    return placed;
  };
  let count = fill();
  for (let round = 0; round < REFILL_ROUNDS && count > 0; round++) {
    const was = shaded.slice();
    const cells = Array.from(shaded.keys()).filter((i) => shaded[i] === 1);
    const taken = cells[randomUpto(rng, cells.length)];
    // Its partner is the one shaded square beside it.
    for (const j of [taken, ...neighbors(w, h, taken)]) shaded[j] = 0;
    const placed = fill();
    if (placed >= 1) count += placed - 1;
    else shaded.set(was);
  }
  return Array.from(shaded.keys()).filter((i) => shaded[i] === 1);
}

/** One domino in this many is dealt as a region of its own two squares, by
 * tier. An Easy board's steps read one region or one domino at a time, so it
 * needs the most places to start from; a harder tier's steps reach further
 * from fewer. */
const CLOSED_ONE_IN: Readonly<Record<number, number>> = {
  [DIFF_EASY]: 2,
  [DIFF_NORMAL]: 3,
  [DIFF_TRICKY]: 4,
};

/** At most one region in this many is a closed domino. The Easy boards that
 * come right are those dealt the most, and uncapped a 6x6 one came with five
 * of its seven regions closed and one region of seventeen squares: a board
 * of givens. */
const CLOSED_AT_MOST_ONE_IN = 3;

/**
 * Regions round the shaded squares `seeds`, each holding two of them, and
 * the dominoes dealt as regions of their own two squares. Some dominoes are
 * closed so, since a board's first steps start from such a region and a mend
 * seldom makes one. A region is grown round every other shaded square, and
 * those are joined in twos. `null` where the closed dominoes wall a square
 * off, or the joining ends with a region it cannot pair.
 *
 * The closed dominoes are spread apart, each the farthest from those before
 * it: the deductions on a blank board start only from them, so a part of the
 * board far from every one has nowhere to start and no mend gives it one.
 * Spread so rather than placed at random, a 10x10 Easy board dealt in a
 * median of 0.3 s against 0.7 (deal walk, 2026-11-16).
 */
function regionsRound(
  p: NorinoriParams,
  seeds: readonly number[],
  rng: RandomState,
): { regions: Int32Array; closed: ReadonlySet<number> } | null {
  const { w, h } = p;
  const grid = { w, h };
  const shaded = new Set(seeds);
  const partnerOf = (i: number): number =>
    neighbors(w, h, i).find((j) => shaded.has(j)) as number;
  // Each domino once, by its first square, in random order for the ties.
  const dominoes = seeds.filter((i) => partnerOf(i) > i);
  shuffle(dominoes, rng);
  let closing = 0;
  for (const _ of dominoes) if (randomUpto(rng, CLOSED_ONE_IN[p.diff]) === 0) closing++;
  closing = Math.min(closing, Math.floor(dominoes.length / CLOSED_AT_MOST_ONE_IN));
  // Each the domino farthest from those closed before it.
  const closed = new Set<number>();
  const apart = (i: number): number => {
    let d = Infinity;
    for (const c of closed)
      d = Math.min(
        d,
        Math.abs((c % w) - (i % w)) + Math.abs(((c / w) | 0) - ((i / w) | 0)),
      );
    return d;
  };
  while (closed.size / 2 < closing) {
    let best = -1;
    for (const i of dominoes)
      if (!closed.has(i) && (best === -1 || apart(i) > apart(best))) best = i;
    closed.add(best).add(partnerOf(best));
  }
  const open = seeds.filter((i) => !closed.has(i));
  if (open.length === 0) return drawRejected("norinori: every domino closed");
  const grown = growFromSeeds(grid, open, rng, closed);
  if (grown === null) return null;
  for (const i of closed)
    grown.merge(i, neighbors(w, h, i).find((j) => closed.has(j)) as number);
  // Each region joins its shaded squares in twos; a closed domino holds its
  // two already, so joins nothing.
  const joined = mergeToCount<number>(
    grid,
    rng,
    {
      from: grown,
      of: (i) => (closed.has(i) ? 2 : 1),
      join: (a, b) => (a + b > 2 ? null : a + b),
    },
    seeds.length / 2,
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
