/**
 * The partitions a draw deals: grown round its answer (`deal.grow`), or
 * divided apart from it (`deal.divide`).
 */

import { drawRejected } from "../../contract/deal-census.ts";
import type { Partition } from "../../solve/describe-runtime.ts";
import { type Clues, solveBoard } from "../board.ts";
import { dividePartition } from "../divide.ts";
import { dividesOn } from "../game-id.ts";
import { growPartition } from "../grow.ts";
import { searchedPositions } from "../search.ts";
import { partitionOf } from "../segments/segment.ts";
import type { DealContext, Grown } from "./context.ts";

/** The positions the mend's search for a second answer may try from where
 * the ladder stops. Where it finds none in that many, the board is taken to
 * have one answer the ladder does not reach (Norinori's, 2026-11-16). */
const MEND_SEARCH_BUDGET = 24;

/** The partitions divided apart from the answer, by name, where the deal
 * divides any; `null` where this draw left a cell alone. */
export function divided<C extends Clues<C>>(cx: DealContext<C>): Grown | null {
  const out: Record<string, Partition> = {};
  for (const divide of dividesOn(cx.deal, cx.variations)) {
    const parts = dividePartition(divide, cx.sp, cx.sizes, cx.rs);
    if (parts === null) return drawRejected("fill: the division left a cell alone");
    out[divide.partition] = partitionOf(parts);
  }
  return out;
}

/** The partitions dealt round answer `g` for tier `tier`, by name: divided,
 * or the one grown and mended for that tier; `null` where this draw dealt
 * none. */
export function grownRound<C extends Clues<C>>(
  cx: DealContext<C>,
  g: Uint8Array,
  tier: number,
): Grown | null {
  const { module, deal, sp, given, board, finishes } = cx;
  const { grow, divide } = deal;
  if (divide !== undefined) return divided(cx);
  if (grow === undefined) return {};
  if (module.growBy === undefined)
    throw new Error("deal: a grown partition with no growBy");
  const withParts = (parts: Int32Array): C =>
    module.deriveClues(g, sp, { [grow.partition]: partitionOf(parts) }, given);
  const parts = growPartition(
    { ...grow, ...module.growBy(sp, cx.sizes) },
    sp,
    g,
    tier,
    (parts) => ({
      deduce() {
        const got = solveBoard(module, board(withParts(parts)), tier);
        const open = sp.cells.filter((c) => got.values[c] === 0);
        return { open, position: got.values };
      },
      others: (position) =>
        (
          searchedPositions(
            module,
            board(withParts(parts)),
            {
              start: position,
              cap: tier,
              budget: MEND_SEARCH_BUDGET,
              last: (c) => g[c],
            },
            2,
          ) ?? []
        )
          .map((values) => sp.cells.filter((c) => values[c] === grow.value))
          .filter((cells) => cells.some((c) => g[c] !== grow.value)),
      tooEasy: tier === 0 ? null : () => finishes(withParts(parts), tier - 1),
    }),
    cx.rs,
    cx.spent,
  );
  return parts === null ? null : { [grow.partition]: partitionOf(parts) };
}
