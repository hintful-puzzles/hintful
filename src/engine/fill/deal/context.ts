/**
 * What every step of a fill deal reads: the module, the description's deal
 * and the params, the board's space, and the state the draws of one deal
 * share. `deal.ts` builds one a deal and hands it to each step.
 */

import type { RandomState } from "../../random/index.ts";
import type { GridSpace, Partition } from "../../solve/describe-runtime.ts";
import {
  type Clues,
  type FillBoard,
  newBoard,
  paramSpaceOf,
  solveBoard,
} from "../board.ts";
import { type FillDeal, type FillParams, givenOf, sizesOf } from "../game-id.ts";
import type { GrowSizes } from "../grow.ts";
import { variationsOf } from "../params/flag.ts";
import { isOn } from "../params/settings.ts";
import type { SearchedFillModule } from "../search.ts";
import { type HideSettings, hideSettingsOf } from "./hide-settings.ts";
import type { OneKindModule } from "./one-kind.ts";

/** The partitions a deal grew round its answer, by name: none where it grows
 * none. */
export type Grown = Readonly<Record<string, Partition>>;

/** A fill module whose deal samples its answer: its clues derived from it,
 * beside the partitions grown round it and the clues the params give
 * (`givenOf`); and where it grows a partition, what the parts hold on a
 * board. */
export type DealtFillModule<C> = SearchedFillModule<C> &
  OneKindModule<C> & {
    deriveClues(
      g: ArrayLike<number>,
      sp: GridSpace,
      grown: Grown,
      given: ReturnType<typeof givenOf>,
      /** A random one of `n`, which a kind dealt one in each group is put at
       * (`deal.oneIn`). */
      pick?: (n: number) => number,
    ): C;
    growBy?(sp: GridSpace, sizes: Readonly<Record<string, number>>): GrowSizes;
    /** Where a hidden clue of `kind` at `at` goes in the hide, read on the
     * clues as dealt (`deal.hideBy`): a higher one is hidden first. */
    hideRank?(sp: GridSpace, cl: C, kind: string, at: number): number;
  };

/** What a deal's board is, and how the ladder does on one. */
export interface DealBase<C extends Clues<C>> {
  readonly module: DealtFillModule<C>;
  readonly deal: FillDeal;
  readonly p: FillParams;
  readonly rs: RandomState;
  readonly sp: GridSpace;
  readonly variations: readonly string[];
  readonly given: ReturnType<typeof givenOf>;
  board(clues: C): FillBoard<C>;
  /** Whether the ladder up to `cap` finishes the board of `clues`. */
  finishes(clues: C, cap: number | Parameters<typeof solveBoard>[2]): boolean;
}

/** A deal's base, and what its draws share. */
export interface DealContext<C extends Clues<C>> extends DealBase<C> {
  readonly sizes: Readonly<Record<string, number>>;
  readonly thorough: boolean;
  readonly hide: HideSettings<C>;
  /** The moves a grown partition's mend has spent, over every draw. */
  readonly spent: { moves: number };
  /** The draws so far, which a ramp of the `first` cells' share counts. */
  layouts: number;
  /**
   * The tier a build ladders at, which climbs a tier at each build that met
   * a dead end or built an answer that breaks a rule. A higher tier steers
   * some builds clear of both (Unruly's 12x16 built at the lowest took 1,169
   * draws a deal and 3 at its whole ladder, Singles' 12x12 Tricky 259 and 1)
   * and decides nothing in others, where it is only paid for (Light Up's
   * 12x16 built the same answers at the lowest, a third of the cost;
   * 2026-11-23).
   */
  buildTier: number;
  /** Draws in a row the lowest tier did not finish with every clue
   * (`hide.ts`, `SHORT_OF_LOWEST_RUN`). */
  shortOfLowest: number;
}

export function dealBase<C extends Clues<C>>(
  module: DealtFillModule<C>,
  deal: FillDeal,
  p: FillParams,
  rs: RandomState,
): DealBase<C> {
  const sp = paramSpaceOf(module, p);
  const variations = variationsOf(p);
  const board = (clues: C): FillBoard<C> =>
    newBoard(module, sp.w, sp.h, clues, variations);
  return {
    module,
    deal,
    p,
    rs,
    sp,
    variations,
    given: givenOf(deal, p),
    board,
    finishes: (clues, cap) =>
      solveBoard(module, board(clues), cap).verdict === "solved",
  };
}

export function dealContext<C extends Clues<C>>(
  module: DealtFillModule<C>,
  deal: FillDeal,
  p: FillParams,
  rs: RandomState,
): DealContext<C> {
  const base = dealBase(module, deal, p, rs);
  return {
    ...base,
    sizes: sizesOf(p),
    thorough: deal.thorough === undefined || isOn(deal, p, deal.thorough),
    hide: hideSettingsOf<C>(deal, p, base.variations),
    spent: { moves: 0 },
    layouts: 0,
    buildTier: 0,
    shortOfLowest: 0,
  };
}
