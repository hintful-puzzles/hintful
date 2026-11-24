/**
 * The clues a deal keeps of the kinds it hides, by their index in one
 * numbering of them all: each hidden kind's clues in turn, in the order the
 * deal names the kinds.
 */

import {
  type ClueList,
  clueList,
  type GridSpace,
} from "../../solve/describe-runtime.ts";
import type { Clues } from "../board.ts";
import { elementCount, type FillDeal } from "../game-id.ts";

export const byIndex = (a: number, b: number): number => a - b;

/** The indices of a list's clues. */
export const shownOf = (list: ClueList): number[] => Array.from(list.at.keys());

/** Where each hidden kind's clues start in one numbering of them all, the
 * kinds in turn, and after the last where they end. */
export function offsetsOf<C extends Clues<C>>(
  clues: C,
  kinds: readonly string[],
): number[] {
  const out = [0];
  for (const k of kinds)
    out.push(out[out.length - 1] + (clues[k as keyof C] as ClueList).at.length);
  return out;
}

/** The clues with only the clues `shown` of the hidden kinds, by their
 * indices in one numbering of them all ({@link offsetsOf}). */
export function keepingAll<C extends Clues<C>>(
  clues: C,
  deal: FillDeal,
  kinds: readonly string[],
  sp: GridSpace,
  shown: readonly number[],
): C {
  const offsets = offsetsOf(clues, kinds);
  let kept = clues;
  for (const [n, k] of kinds.entries()) {
    const of = shown.filter((i) => i >= offsets[n] && i < offsets[n + 1]);
    kept = keepingOf(
      kept,
      k as keyof C,
      of.map((i) => i - offsets[n]),
      elementCount(deal, sp, clues, k),
    );
  }
  return kept;
}

/** The clues with only the clues `shown` of kind `kind`, by their indices
 * in its list. */
export function keepingOf<C extends Clues<C>>(
  clues: C,
  kind: keyof C,
  shown: readonly number[],
  elements: number,
): C {
  const all = clues[kind] as ClueList;
  return {
    ...clues,
    [kind]: clueList(
      shown.map((i) => all.at[i]),
      shown.map((i) => all.v[i]),
      elements,
    ),
  };
}

/** Whether `clues` hide one of the hide flag's kind: fewer than its
 * universe. */
export function hidesAny<C extends Clues<C>>(
  clues: C,
  deal: FillDeal,
  sp: GridSpace,
): boolean {
  const kind = deal.hideFlag?.kind;
  if (kind === undefined) return false;
  return (
    (clues[kind as keyof C] as ClueList).at.length < elementCount(deal, sp, clues, kind)
  );
}
