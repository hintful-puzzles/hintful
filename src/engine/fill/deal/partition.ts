/**
 * The partitions a draw deals: grown round its answer (`deal.grow`),
 * divided apart from it (`deal.divide`), or merged on it (`deal.merge`).
 */

import { shuffle } from "../../board/shuffle.ts";
import { drawRejected } from "../../contract/deal-census.ts";
import {
  type GridSpace,
  type Partition,
  squares as squaresOf,
} from "../../solve/describe-runtime.ts";
import { type Clues, solveBoard, spaceOf } from "../board.ts";
import { dividePartition } from "../divide.ts";
import { dividesOn, type FillDeal } from "../game-id.ts";
import { growPartition } from "../grow.ts";
import { squareSpace } from "../parts.ts";
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
  const squares = cx.deal.parts?.of;
  for (const divide of dividesOn(cx.deal, cx.variations)) {
    // A board of parts divides its squares, not its cells, which the parts
    // are.
    const on = divide.partition === squares ? squareSpace(cx.p) : cx.sp;
    const parts = dividePartition(divide, on, cx.sizes, cx.rs);
    if (parts === null) return drawRejected("fill: the division left a cell alone");
    const p = partitionOf(parts);
    out[divide.partition] = divide.partition === squares ? squaresOf(p, on.w, on.h) : p;
  }
  return out;
}

/** The partition the deal merges on its answer, each cell a part of its
 * own, as it is while the answer is drawn; none where it merges none. */
export function unmerged(deal: FillDeal, sp: GridSpace): Grown {
  const { merge } = deal;
  if (merge === undefined) return {};
  return { [merge.partition]: partitionOf(Int32Array.from(sp.cells.keys())) };
}

/**
 * The partition the deal merges on answer `g`: from a part a cell, each two
 * neighboring cells in a random order, their parts joined wherever `g`, its
 * clues derived on the joined partition, is still an answer (upstream
 * rome.c's `generate_regions`, which joins where the two hold no arrow
 * alike and neither a goal: Rome's rules, read here off its description).
 * Each try derives and checks the whole board: a 10x10 board of the
 * `merging` fixture, Rome's rules, merges in 8 ms, a quarter of its deal,
 * and a 6x6 in 1.2 (2026-11-28).
 */
function merged<C extends Clues<C>>(cx: DealContext<C>, g: Uint8Array): Grown {
  const { module, deal, sp, given, sizes, variations } = cx;
  const name = (deal.merge as { partition: string }).partition;
  const part = Int32Array.from(sp.cells.keys());
  const members = Array.from(sp.cells.keys(), (c) => [c]);
  // Neighbors share a side, which on a king's space its diagonals do not.
  const pairs = sp.cells.flatMap((a) =>
    (sp.king ? sp.adj4[a] : sp.edgeAdj[a])
      .filter((b) => b > a)
      .map((b): [number, number] => [a, b]),
  );
  shuffle(pairs, cx.rs);
  const dealt = (): Grown => ({ [name]: partitionOf(compacted(part)) });
  const holds = (): boolean => {
    const grown = dealt();
    const on = spaceOf(module, {
      w: sp.w,
      h: sp.h,
      dealt: { ...sizes, ...grown },
      variations,
    });
    return module.isAnswer(g, on, module.deriveClues(g, on, grown, given), variations);
  };
  for (const [a, b] of pairs) {
    const [kept, gone] =
      members[part[a]].length >= members[part[b]].length
        ? [part[a], part[b]]
        : [part[b], part[a]];
    if (kept === gone) continue;
    for (const c of members[gone]) part[c] = kept;
    if (holds()) {
      members[kept].push(...members[gone]);
      members[gone] = [];
    } else for (const c of members[gone]) part[c] = gone;
  }
  return dealt();
}

/** `part`'s parts numbered from 0 in the order their first cells come. */
function compacted(part: Int32Array): Int32Array {
  const index = new Map<number, number>();
  return part.map((r) => {
    const known = index.get(r);
    if (known !== undefined) return known;
    index.set(r, index.size);
    return index.size - 1;
  });
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
  if (deal.merge !== undefined) return merged(cx, g);
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
