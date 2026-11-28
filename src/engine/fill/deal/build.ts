/**
 * An answer built by the ladder (`sample: build`), Unruly's and Light Up's
 * sampler (`samplers.ts`).
 */

import { shuffle } from "../../board/shuffle.ts";
import { drawRejected } from "../../contract/deal-census.ts";
import { type RandomState, randomUpto } from "../../random/index.ts";
import type { GridSpace } from "../../solve/describe-runtime.ts";
import { ladderTechniques, runLadder } from "../../solve/ladder-runtime.ts";
import { type Clues, capsOf, marksOf, newBoard } from "../board.ts";
import { type FillDeal, type FillParams, givenOf, sizesOf } from "../game-id.ts";
import { variationsOf } from "../params/flag.ts";
import type { BuiltSample } from "../sample.ts";
import { withLatin } from "./clue-steps.ts";
import type { DealContext, DealtFillModule } from "./context.ts";
import { firstLaid } from "./first-laid.ts";
import { hiddenKinds } from "./hide-settings.ts";
import { keepingAll } from "./keeping.ts";
import { sightlinesLaid } from "./sightlines.ts";

/** What a build returns where a placement left no answer or a cell undecided:
 * a sign that its ladder was too low to steer it. */
export const DEAD_END = "dead end";

/** The resolution a build's share is drawn at. */
const CHANCE = 1 << 20;

/** The draw refused at `stage`, a build having met a dead end or built an
 * answer that breaks a rule: the next builds at a tier higher
 * (`DealContext.buildTier`). */
export function climbBuild<C extends Clues<C>>(
  cx: DealContext<C>,
  stage: string,
): null {
  cx.buildTier = Math.min(cx.buildTier + 1, cx.module.tiers.length - 1);
  return drawRejected(stage);
}

/**
 * A random value of its domain, or the build's one value, on a random
 * undecided cell, then every cell the ladder up to `tier` decides from
 * those, until none is left; {@link DEAD_END} where a placement left no
 * answer or a cell undecided, and `null` where the board offers none at
 * all. The board is built on the clues a blank board derives, which are
 * none where the clues are the placed cells (Unruly's givens). Upstream's
 * unruly.c `unruly_fill_game`. With `first`, its value is dealt first on a
 * share of the cells, as symmetric as the options ask, and the build is on
 * the clues those cells derive with every clue of the hidden kind hidden
 * (Light Up's walls, upstream's lightup.c `set_blacks`).
 */
export function buildAnswer<C extends Clues<C>>(
  module: DealtFillModule<C>,
  deal: FillDeal,
  sample: BuiltSample,
  sp: GridSpace,
  p: FillParams,
  rs: RandomState,
  draw: number,
  tier: number,
): Uint8Array | typeof DEAD_END | null {
  const { first } = sample;
  const start =
    first === undefined
      ? new Uint8Array(sp.cells.length)
      : firstLaid(first, deal, p, rs, draw);
  const derived = module.deriveClues(start, sp, {}, givenOf(deal, p));
  // A Latin kind is a Latin square's on the cells built round, so the ladder
  // reads numbers none of which repeats (upstream singles.c's new_game_desc).
  const numbered = withLatin(derived, deal, sp, start, rs);
  // With nothing laid first, the build reads no clue the answer derives: a
  // blank board's are no answer's (a line's count of a letter is 0 on it,
  // ABCD's). A kind dealt apart from the answer is read: a Latin kind's
  // numbers (Singles'), and a hexagon's corners (Bricks').
  // Laid first, the build reads the shown kinds the domain reads (Light Up's
  // walls, Undead's mirrors), each other kind derived from the first cells
  // alone being no answer's (Undead's sightlines over a board of mirrors).
  const apart = [deal.latin?.kind, deal.hexagon?.outside];
  const hidden = first === undefined ? [] : hiddenKinds(deal, p);
  const read = (k: string): boolean =>
    first === undefined
      ? apart.includes(k)
      : (sample.reads ?? []).includes(k) && !hidden.includes(k);
  const blank = keepingAll(
    numbered,
    deal,
    Object.keys(deal.universes).filter((k) => !read(k)),
    sp,
    [],
  );
  if (module.firstKeeps?.(sp, { ...blank, ...sizesOf(p) }, p.diff) === false)
    return drawRejected("fill: the first cells' keep refuses them");
  const board = newBoard(module, sp.w, sp.h, blank, variationsOf(p));
  // One set of marks the whole build, the ladder run again after each
  // placement: a fresh solve each time cost a 12x16 Light Up deal seconds.
  const { marks, ok, entries } = marksOf(module, board);
  if (!ok) return null;
  const ladder = ladderTechniques(marks, entries, capsOf(module, tier), {});
  if (runLadder(marks, ladder)) return null;
  if (sample.sightlines !== undefined) {
    const laid = sightlinesLaid(module, sample.sightlines, start, sp, blank, p, rs);
    for (const c of sp.cells)
      if (start[c] === 0 && laid[c] !== 0) marks.place(c, laid[c]);
    if (runLadder(marks, ladder)) return DEAD_END;
  }
  const build = sample.build === true ? null : sample.build;
  const order = Array.from(sp.cells);
  if (build?.order === "upward")
    order.sort((a, b) => Math.floor(b / sp.w) - Math.floor(a / sp.w) || a - b);
  else shuffle(order, rs);
  const open = order.filter((c) => board.fixed[c] === 0);
  // With a share, each cell in turn takes the build's value at that chance
  // where it may, and another value otherwise; without, the value alone.
  const only = build === null || build.share !== undefined ? null : build.value;
  for (const c of order) {
    if (marks.grid[c] !== 0) continue;
    const values: number[] = [];
    for (let m = module.domainOf(sp, blank, c); m !== 0; m &= m - 1) {
      const v = 31 - Math.clz32(m & -m);
      if (marks.has(c, v) && (only === null || v === only)) values.push(v);
    }
    if (values.length === 0) {
      if (only === null) return DEAD_END;
      continue;
    }
    marks.place(c, pickValue(values, build, rs));
    if (runLadder(marks, ladder)) return DEAD_END;
  }
  if (marks.grid.includes(0)) return DEAD_END;
  const least = build?.least;
  if (
    least !== undefined &&
    open.filter((c) => marks.grid[c] === build?.value).length < least * open.length
  )
    return null;
  return Uint8Array.from(marks.grid);
}

/** The value a build lays on a cell that may hold `values`: with a share,
 * the build's own at that chance and another otherwise; else one at random. */
function pickValue(
  values: readonly number[],
  build: Exclude<BuiltSample["build"], true> | null,
  rs: RandomState,
): number {
  const share = build?.share;
  if (build === null || share === undefined)
    return values[randomUpto(rs, values.length)];
  const others = values.filter((v) => v !== build.value);
  if (others.length === 0) return build.value;
  if (values.includes(build.value) && randomUpto(rs, CHANCE) < share * CHANCE)
    return build.value;
  return others[randomUpto(rs, others.length)];
}
