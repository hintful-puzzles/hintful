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

import { joinOr, joinWith, type LatinVocab, thisCell } from "../../engine/hint-text.ts";
import { CELL, mark, type Narration, phrase } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { displayChar } from "./state.ts";

/** Unequal's value vocabulary for the shared generic-Latin arms. */
export function unequalVocab(order: number): LatinVocab {
  return { noun: "number", value: (n) => displayChar(n, order) };
}

/** Values that all go ("clashes with 1 and 2"), as the board prints them. */
const all = (ns: number[], order: number): string =>
  joinWith(ns.map((n) => displayChar(n, order)));

/**
 * The two cells a sign or bar deduction is about: the struck cell `at`, ringed,
 * and the cell across the sign or bar, `other`. Both are outlined, and the
 * words naming the sign or bar between them are that outline.
 */
export interface SignPair {
  at: Point;
  other: Point;
}

const sign = (p: SignPair, words: string): Narration =>
  mark.as("outline", CELL, [p.at, p.other], words);
const across = (p: SignPair, words: string): Narration =>
  mark.as("outline", CELL, [p.other], words);
const thisOne = (p: SignPair): Narration => mark.as("ring", CELL, [p.at], "this one");

/** A sign or bar deduction's premise; the walk concludes it with the move it
 * makes (`engine/hint-text.ts`'s `Premise`). */
export const say = {
  /** The struck cell is the larger side of a sign whose other cell is at least
   * `bound`. */
  greater: (p: SignPair, bound: number, order: number): Narration =>
    bound <= 1
      ? phrase`The larger side of ${sign(p, "a greater-than sign")} can't hold the smallest number`
      : phrase`${across(p, "The cell across")} ${sign(p, "this greater-than sign")} is at least ${displayChar(bound, order)}, and ${thisOne(p)} is larger`,

  /** The struck cell is the smaller side of a sign whose other cell is at most
   * `bound`, in a grid of `order`. */
  lesser: (p: SignPair, bound: number, order: number): Narration =>
    bound >= order
      ? phrase`The smaller side of ${sign(p, "a greater-than sign")} can't hold the largest number`
      : phrase`${across(p, "The cell across")} ${sign(p, "this greater-than sign")} is at most ${displayChar(bound, order)}, and ${thisOne(p)} is smaller`,

  /** A bar joins the struck cell to its neighbor holding `v` (`bar`), or none
   * does. */
  adjacent: (p: SignPair, bar: boolean, v: number, order: number): Narration => {
    const beside = across(p, `the ${displayChar(v, order)} beside it`);
    return bar
      ? phrase`${sign(p, "A bar")} joins ${thisCell(p.at)} to ${beside}, and they must differ by exactly 1`
      : phrase`${sign(p, "No bar")} joins ${thisCell(p.at)} to ${beside}, and they can't differ by 1`;
  },

  /** The same, against a neighbor that is still undecided: a struck value
   * fits none of the numbers still open there. */
  adjacentSet: (p: SignPair, bar: boolean, ns: number[], order: number): Narration =>
    bar
      ? phrase`${sign(p, "A bar")} joins ${thisCell(p.at)} to ${across(p, "a neighbor")} with nothing open one away from ${joinOr(ns.map((n) => displayChar(n, order)))}`
      : phrase`${sign(p, "No bar")} joins ${thisCell(p.at)} to ${across(p, "a neighbor")} whose every open number clashes with ${all(ns, order)}`,
};
