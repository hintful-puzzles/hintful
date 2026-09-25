/**
 * Every sentence Unequal's hint speaks that is Unequal's own: the inequality
 * signs and Adjacent mode's bars. The generic Latin arms are the engine's
 * (`engine/hint-text.ts`), spoken in {@link unequalVocab}, and so are the two
 * setup steps, built by the row/column preset from the two words Unequal gives
 * it (`index.ts`'s `notes`).
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads. Every arm reads correctly
 * at the value extremes: a trivial inequality bound becomes "the
 * smallest/largest number" rather than the vacuous "no less than 1", and the
 * differ-by-1 clue says "one away from N", never "N−1 or N+1".
 *
 * A value prints as the board draws it, `state.ts`'s `displayChar` at the grid's
 * order, which runs 0-based digits and then letters once the order passes 9.
 */

import { joinOr, joinWith, type LatinVocab } from "../../engine/hint-text.ts";
import { displayChar } from "./state.ts";

/** Unequal's value vocabulary for the shared generic-Latin arms. */
export function unequalVocab(order: number): LatinVocab {
  return { noun: "number", value: (n) => displayChar(n, order) };
}

/** Values that all go ("clashes with 1 and 2"), as the board prints them. */
const all = (ns: number[], order: number): string =>
  joinWith(ns.map((n) => displayChar(n, order)));

/** A sign or bar deduction's premise; the walk concludes it with the move it
 * makes (`engine/hint-text.ts`'s `Premise`). */
export const say = {
  /** This cell is the larger side of a sign whose other cell is at least
   * `bound`. */
  greater: (bound: number, order: number): string =>
    bound <= 1
      ? "The larger side of a greater-than sign can't hold the smallest number"
      : `The cell across this greater-than sign is at least ${displayChar(bound, order)}, and this one is larger`,

  /** This cell is the smaller side of a sign whose other cell is at most
   * `bound`, in a grid of `order`. */
  lesser: (bound: number, order: number): string =>
    bound >= order
      ? "The smaller side of a greater-than sign can't hold the largest number"
      : `The cell across this greater-than sign is at most ${displayChar(bound, order)}, and this one is smaller`,

  /** A bar joins this cell to its neighbor holding `v` (`bar`), or none does. */
  adjacent: (bar: boolean, v: number, order: number): string =>
    bar
      ? `A bar joins this cell to the ${displayChar(v, order)} beside it, and they must differ by exactly 1`
      : `No bar joins this cell to the ${displayChar(v, order)} beside it, and they can't differ by 1`,

  /** The same, against a neighbor that is still undecided: a struck value
   * fits none of the numbers still open there. */
  adjacentSet: (bar: boolean, ns: number[], order: number): string =>
    bar
      ? `A bar joins this cell to a neighbor with nothing open one away from ${joinOr(ns.map((n) => displayChar(n, order)))}`
      : `No bar joins this cell to a neighbor whose every open number clashes with ${all(ns, order)}`,
};
