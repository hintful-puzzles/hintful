/**
 * Which kinds of clue a board deals: those a `set` setting switches on
 * (Mathrax's `A S M D E O`), and of a `deal.oneKind` that picks first
 * one clue an element, the first kind in its order that the answer makes
 * there (upstream mathrax.c's cascade, where four squares that are all odd
 * and add in pairs to 6 are a sum and never Odd).
 */

import { type ClueList, clueList } from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import type { FillDeal, FillParams } from "../game-id.ts";
import { kindsOn } from "../params/set.ts";

/**
 * `derived` with no clue of a kind board `p` switches off, and of
 * `FillDeal.firstKind`'s kinds only the first that holds at each element.
 */
export function firstKindEach<C extends Clues<C>>(
  deal: FillDeal,
  p: FillParams,
  derived: C,
): C {
  const members = deal.settings.flatMap((s) =>
    s.kind === "set" ? s.members.map((m) => m.kind) : [],
  );
  const order = deal.firstKind ?? [];
  if (members.length === 0 && order.length === 0) return derived;
  const on = new Set(kindsOn(deal, p) ?? members);
  const off = new Set(members.filter((k) => !on.has(k)));
  const out: Record<string, unknown> = { ...derived };
  const list = (k: string) => derived[k as keyof C] as ClueList;
  /** The elements an earlier kind of `order` holds. */
  const taken = new Set<number>();
  for (const k of order) {
    const was = list(k);
    const keep = off.has(k)
      ? []
      : [...was.at.keys()].filter((i) => !taken.has(was.at[i]));
    for (const i of keep) taken.add(was.at[i]);
    out[k] = clueList(
      keep.map((i) => was.at[i]),
      keep.map((i) => was.v[i]),
      was.byAt.length,
    );
  }
  for (const k of off)
    if (!order.includes(k)) out[k] = clueList([], [], list(k).byAt.length);
  return out as C;
}
