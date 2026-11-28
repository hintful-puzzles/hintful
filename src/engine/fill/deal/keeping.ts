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
import { type Clues, type FieldClue, isFieldClue } from "../board.ts";
import { elementCount, type FillDeal } from "../game-id.ts";

export const byIndex = (a: number, b: number): number => a - b;

/** How many clues a kind holds: a list's, or a clue at the board's records. */
const countOf = (x: ClueList | FieldClue): number =>
  isFieldClue(x) ? x.n : x.at.length;

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
    out.push(
      out[out.length - 1] + countOf(clues[k as keyof C] as ClueList | FieldClue),
    );
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
  const all = clues[kind] as ClueList | FieldClue;
  // A clue at the board keeps its records shown, each field's entry.
  if (isFieldClue(all))
    return {
      ...clues,
      [kind]: Object.fromEntries([
        ["n", shown.length],
        ...Object.entries(all)
          .filter(([f]) => f !== "n")
          .map(([f, xs]) => [f, shown.map((i) => (xs as readonly number[])[i])]),
      ]),
    };
  return {
    ...clues,
    [kind]: clueList(
      shown.map((i) => all.at[i]),
      shown.map((i) => all.v[i]),
      elements,
    ),
  };
}

/** Whether `clues` hide one of `kind`: fewer than its universe. */
export function hidesAny<C extends Clues<C>>(
  clues: C,
  deal: FillDeal,
  sp: GridSpace,
  kind: string,
): boolean {
  return (
    countOf(clues[kind as keyof C] as ClueList | FieldClue) <
    elementCount(deal, sp, clues, kind)
  );
}
