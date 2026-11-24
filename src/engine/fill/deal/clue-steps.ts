/**
 * What a draw does to the clues its answer derives, before the answer is
 * checked: each step in `CLUE_STEPS`' order, since the latin step and the
 * one-kind step draw from the deal's rng, and a seed must deal the board it
 * dealt.
 */

import { drawRejected } from "../../contract/deal-census.ts";
import type { RandomState } from "../../random/index.ts";
import { clueList, type GridSpace } from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import type { FillDeal, FillParams } from "../game-id.ts";
import { isOn } from "../params/settings.ts";
import type { DealContext } from "./context.ts";
import { firstKindEach } from "./first-kind.ts";
import { latinNumbers } from "./latin-numbers.ts";
import { oneKindEach } from "./one-kind.ts";

/** The draw a step works on: its answer, the board's units with the
 * partitions dealt, and the tier it is dealt for. */
interface DrawAt {
  readonly g: Uint8Array;
  readonly on: GridSpace;
  readonly tier: number;
}

/** A step: the clues it leaves, or `null`, the draw refused, where they are
 * no board. */
type ClueStep = <C extends Clues<C>>(
  clues: C,
  cx: DealContext<C>,
  at: DrawAt,
) => C | null;

/** Whether board `p` deals the one-a-part kinds' `alone` set alone. */
const aloneOn = (deal: FillDeal, p: FillParams): boolean => {
  const alone = deal.oneKind?.alone;
  return alone !== undefined && isOn(deal, p, alone.when);
};

/** The clues with the deal's Latin kind numbered round answer `g`, where it
 * has one. A build numbers its blank board's so as well (`build.ts`). */
export function withLatin<C extends Clues<C>>(
  clues: C,
  deal: FillDeal,
  sp: GridSpace,
  g: Uint8Array,
  rs: RandomState,
): C {
  const { latin } = deal;
  if (latin === undefined) return clues;
  const n = sp.cells.length;
  return {
    ...clues,
    [latin.kind]: clueList(sp.cells, latinNumbers(g, sp, latin.under, rs), n),
  };
}

export const CLUE_STEPS: readonly ClueStep[] = [
  (clues, cx, { g }) => withLatin(clues, cx.deal, cx.sp, g, cx.rs),
  (clues, cx) => firstKindEach(cx.deal, cx.p, clues),
  (clues, cx, { on, tier }) =>
    oneKindEach(cx.module, cx.deal, on, clues, tier, aloneOn(cx.deal, cx.p), cx.rs) ??
    drawRejected("fill: a part suits none of the kinds"),
];
