/**
 * One clue a part, chosen in the deal (`deal.oneKind`): of the clues the
 * answer derives at each part of the divided partition, one kind's is kept.
 * The kinds are dealt in turn, over and over, each to the first part in a
 * random order that holds none yet and that it suits well, or else poorly,
 * until a round deals none, so each kind is about as common as the parts
 * allow (upstream keen.c's clue mix, where every cage of two takes a
 * division where it can, then a subtraction, a product and a sum).
 */

import { shuffle } from "../../board/shuffle.ts";
import type { RandomState } from "../../random/index.ts";
import {
  type ClueList,
  clueList,
  type GridSpace,
  type Partition,
} from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import type { FillDeal } from "../game-id.ts";

/** A module whose deal keeps one clue a part: how well a kind's clue suits a
 * part, 0 never, 1 poorly, 2 well, on a board of a tier. */
export interface OneKindModule<C> {
  suits?(
    sp: GridSpace,
    cl: C,
    kind: string,
    at: number,
    v: number,
    tier: number,
  ): number;
}

/** How well the kinds suit a part, as `suits` says. */
const POORLY = 1;
const WELL = 2;

/**
 * `derived` with one clue a part of `deal.oneKind`'s kinds, those the only
 * flag deals alone where `only`; `null` where a part is left with none.
 */
export function oneKindEach<C extends Clues<C>>(
  module: OneKindModule<C>,
  deal: FillDeal,
  sp: GridSpace,
  derived: C,
  tier: number,
  only: boolean,
  rs: RandomState,
): C | null {
  const one = deal.oneKind;
  if (one === undefined) return derived;
  if (module.suits === undefined) throw new Error("deal: oneKind with no suits");
  const suits = module.suits;
  const kinds = only && deal.onlyFlag !== undefined ? deal.onlyFlag.kinds : one.kinds;
  const parts = (derived[one.partition as keyof C] as Partition).parts.length;
  const lists = kinds.map((k) => derived[k as keyof C] as ClueList);
  /** How well kind `n` suits part `r`, 0 where the answer derives none. */
  const howWell = (n: number, r: number): number => {
    const i = lists[n].byAt[r];
    return i < 0 ? 0 : suits(sp, derived, kinds[n], r, lists[n].v[i], tier);
  };
  const order = Array.from({ length: parts }, (_, r) => r);
  shuffle(order, rs);
  const kindOf = new Int32Array(parts).fill(-1);
  const take = (n: number, how: number): boolean => {
    const r = order.find((p) => kindOf[p] < 0 && howWell(n, p) === how);
    if (r === undefined) return false;
    kindOf[r] = n;
    return true;
  };
  for (let dealt = true; dealt; ) {
    dealt = false;
    for (const n of kinds.keys()) if (take(n, WELL) || take(n, POORLY)) dealt = true;
  }
  if (kindOf.includes(-1)) return null;
  const out: Record<string, ClueList> = {};
  for (const k of one.kinds) {
    const n = kinds.indexOf(k);
    const list = derived[k as keyof C] as ClueList;
    const at: number[] = [];
    const v: number[] = [];
    for (let r = 0; r < parts; r++)
      if (n >= 0 && kindOf[r] === n) {
        at.push(r);
        v.push(list.v[list.byAt[r]]);
      }
    out[k] = clueList(at, v, parts);
  }
  return { ...derived, ...out };
}
