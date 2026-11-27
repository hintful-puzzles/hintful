/**
 * The deal of a sample that climbs (`sample.climb`): a draw keeps the cells
 * the ladder decided on the last one the deal refused and samples the rest,
 * and one the tier below finishes has a cell turned to the other value, so
 * the draws climb toward a board of the tier instead of starting afresh.
 * The answer is the one the ladder or the search finds, which an unpaired
 * board's (`deal.unpair`) is, and not the sample. Upstream's clusters.c
 * `clusters_generate`, which climbed five times faster than fresh draws at
 * 7x7 Normal and seven at 8x8 (measured 2026-10-27).
 */

import { retryLimit } from "../../contract/retry-limit.ts";
import { type RandomState, randomUpto } from "../../random/index.ts";
import { dealUnreasonable } from "../../solve/answer-search.ts";
import type { ClueList, GridSpace } from "../../solve/describe-runtime.ts";
import { encodeAnswer } from "../answer.ts";
import { type Clues, type FillBoard, perValuesOf, solveBoard } from "../board.ts";
import { encodeDesc } from "../desc.ts";
import type { FillDeal, FillParams, givenOf } from "../game-id.ts";
import { type ScatterSample, sampleAnswer } from "../sample.ts";
import { searchBoard, searches } from "../search.ts";
import { type DealtFillModule, dealBase } from "./context.ts";
import { firstKindEach } from "./first-kind.ts";
import { keepingOf, shownOf } from "./keeping.ts";
import { rulesHeld } from "./rules-held.ts";

/** One draw of a climb in this many samples every cell afresh, so a climb
 * caught where it cannot get out starts over (upstream clusters.c's
 * `force`). */
const RESTART_EVERY = 100;

/** The positions the search of a climb's candidate at a search tier may try.
 * A candidate with several answers costs the search its whole budget to prove
 * so: at 5,000, a 9x11 Clusters deal took up to 143 s, and at this at most
 * 2.3 s in six (2026-10-28). */
const CLIMB_SEARCH = 200;

export function climbFill<C extends Clues<C>>(
  module: DealtFillModule<C>,
  deal: FillDeal,
  sample: ScatterSample,
  p: FillParams,
  rs: RandomState,
): { desc: string; aux: string } {
  if (deal.grow !== undefined) throw new Error("deal: a climb grows no partition");
  const { sp, variations, given, board } = dealBase(module, deal, p, rs);
  const { value, share } = sample.scatter;
  if (share <= 0) throw new Error("deal: a climb samples no cell");
  const other = (v: number): number => (v === value ? sample.rest : value);
  const holds = rulesHeld(module, "fill: climb");
  /** What the ladder decided on the last draw, 0 on a cell it left open. */
  const position = new Uint8Array(sp.cells.length);
  let draws = 0;
  /** A board's clues as the next draw deals them, or `null` where it dealt
   * none. */
  const drawn = (): C | null => {
    const whole = ++draws % RESTART_EVERY === 0;
    const g = sampleAnswer(sample, sp, rs, whole ? null : position) as Uint8Array;
    const derived =
      sample.mend === true
        ? mended(module, g, sp, given, variations, other)
        : module.deriveClues(g, sp, {}, given, (n) => randomUpto(rs, n));
    const clues = derived === null ? null : firstKindEach(deal, p, derived);
    if (clues === null || !holds(g, sp, clues, variations)) {
      position.fill(0);
      return null;
    }
    return deal.unpair === undefined
      ? clues
      : unpaired(clues, deal.unpair as keyof C, sp);
  };
  /** The board the tier below the asked one leaves, `null` where it is no
   * board of the asked tier: the climb's next step is taken from where the
   * ladder stopped, and a board it finished, too easy, has a cell turned. */
  const below = (clues: C, tier: number): FillBoard<C> | null => {
    const b = board(clues);
    if (tier === 0) return b;
    const got = solveBoard(module, b, tier - 1);
    position.set(got.values);
    if (got.verdict === "solved") {
      const c = sp.cells[randomUpto(rs, sp.cells.length)];
      position[c] = other(position[c]);
    }
    return got.verdict === "unsolved" ? { ...b, values: got.values } : null;
  };

  if (searches(module) && p.diff === module.tiers.length - 1) {
    const top = p.diff - 1;
    let answer: Uint8Array = new Uint8Array(0);
    const clues = dealUnreasonable<C>({
      label: `fill: ${module.tiers[p.diff]} climb (${p.w}x${p.h})`,
      draw() {
        const clues = drawn();
        return clues !== null && below(clues, p.diff) !== null ? clues : null;
      },
      deduced: (clues) => solveBoard(module, board(clues), top).verdict === "solved",
      answer(clues, budget) {
        const got = searchBoard(module, board(clues), budget ?? CLIMB_SEARCH);
        if (got.kind === "one") answer = got.solution;
        return got;
      },
    });
    return {
      desc: encodeDesc(deal, sp, clues, perValuesOf(module, sp, clues)),
      aux: encodeAnswer(answer),
    };
  }

  const attempt = retryLimit("fill: climb");
  for (;;) {
    attempt();
    const clues = drawn();
    if (clues === null) continue;
    const from = below(clues, p.diff);
    if (from === null) continue;
    const got = solveBoard(module, from, p.diff);
    position.set(got.values);
    if (got.verdict === "solved")
      return {
        desc: encodeDesc(deal, sp, clues, perValuesOf(module, sp, clues)),
        aux: encodeAnswer(got.values),
      };
  }
}

/**
 * The clues `g` deals once each cell a rule breaks at has taken the other
 * value, the first in reading order at a time, until none breaks; `null`
 * where turning a cell for each of the board's cells left one breaking.
 * Upstream's clusters.c turns a tile with none of its color beside it so.
 */
function mended<C>(
  module: DealtFillModule<C>,
  g: Uint8Array,
  sp: GridSpace,
  given: ReturnType<typeof givenOf>,
  variations: readonly string[],
  other: (v: number) => number,
): C | null {
  for (let turned = 0; turned <= sp.cells.length; turned++) {
    const clues = module.deriveClues(g, sp, {}, given);
    let first = Number.POSITIVE_INFINITY;
    for (const v of module.violations(g, sp, clues, variations))
      for (const c of v.at) first = Math.min(first, c);
    if (first === Number.POSITIVE_INFINITY) return clues;
    g[first] = other(g[first]);
  }
  return null;
}

/**
 * The clues with each two of kind `kind` side by side and alike taken off,
 * in reading order, each paired with the nearest earlier of its neighbors
 * first. Two alike side by side may be meant only by each other: upstream's
 * clusters.c takes them off, so a board's answer need not keep them.
 */
function unpaired<C extends Clues<C>>(clues: C, kind: keyof C, sp: GridSpace): C {
  const list = clues[kind] as ClueList;
  const off = new Set<number>();
  for (const [i, c] of list.at.entries()) {
    if (off.has(i)) continue;
    const earlier = sp.adj4[c].filter((o) => o < c).sort((a, b) => b - a);
    for (const o of earlier) {
      const j = list.byAt[o];
      if (j < 0 || off.has(j) || list.v[j] !== list.v[i]) continue;
      off.add(i);
      off.add(j);
      break;
    }
  }
  const shown = shownOf(list).filter((i) => !off.has(i));
  return keepingOf(clues, kind, shown, sp.cells.length);
}
