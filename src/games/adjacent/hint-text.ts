/**
 * Every sentence Adjacent's hint speaks that is Adjacent's own: the bars, and
 * their absence. The generic Latin arms are the engine's
 * (`engine/hint-text.ts`), spoken in `edgeClueVocab`, and so are the two setup
 * steps, built by the row/column preset from the two words Adjacent gives it
 * (`index.ts`'s `notes`).
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `premise`); this file decides only how it reads. Every arm reads correctly
 * at the value extremes: the differ-by-1 clue says "one away from N", never
 * "N−1 or N+1".
 */

import {
  across,
  allOf,
  type CluePair,
  theClue,
} from "../../engine/edge-clue-latin/hint-text.ts";
import { displayChar } from "../../engine/edge-clue-latin/state.ts";
import { joinOr, thisCell } from "../../engine/hint-text.ts";
import { type Narration, phrase } from "../../engine/hint-words.ts";

/** A bar deduction's premise; the walk concludes it with the move it makes
 * (`engine/hint-text.ts`'s `Premise`). */
export const say = {
  /** A bar joins the struck cell to its neighbor holding `v` (`bar`), or none
   * does. */
  adjacent: (p: CluePair, bar: boolean, v: number, order: number): Narration => {
    const beside = across(p, `the ${displayChar(v, order)} beside it`);
    return bar
      ? phrase`${theClue(p, "A bar")} joins ${thisCell(p.at)} to ${beside}: they differ by 1`
      : phrase`${theClue(p, "No bar")} joins ${thisCell(p.at)} to ${beside}: they can't differ by 1`;
  },

  /** The same, against a neighbor that is still undecided: a struck value
   * fits none of the numbers still open there. */
  adjacentSet: (p: CluePair, bar: boolean, ns: number[], order: number): Narration =>
    bar
      ? phrase`${theClue(p, "A bar")} joins ${thisCell(p.at)} to ${across(p, "its neighbor")} with nothing open one away from ${joinOr(ns.map((n) => displayChar(n, order)))}`
      : phrase`${theClue(p, "No bar")} joins ${thisCell(p.at)} to ${across(p, "its neighbor")}, whose numbers all clash with ${allOf(ns, order)}`,
};
