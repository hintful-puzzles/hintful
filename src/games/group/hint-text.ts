/**
 * Every sentence Group's hint speaks that is Group's own: associativity and
 * the identity. The generic Latin arms are the engine's
 * (`engine/hint-text.ts`), spoken in element vocabulary, and so are the two
 * setup steps, built by the row/column preset from the two words Group gives it
 * (`index.ts`'s `notes`).
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads. Values arrive already
 * printed as the element letters the board shows.
 */

import { type LatinVocab, thisCell } from "../../engine/hint-text.ts";
import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  sentence,
  so,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { toChar } from "./state.ts";

/** Group's value vocabulary for the shared generic-Latin narration arms: its
 * values are the elements `a`–`z`, not digits. */
export function groupVocab(id: boolean): LatinVocab {
  return { noun: "element", value: (n) => toChar(n, id) };
}

/** A product the grid shows, named by its equation and outlined at its cell. */
const shows = (cell: Point, equation: string): Narration =>
  mark.as("outline", CELL, [cell], equation);

export const say = {
  /** `A·B = ab` at `abCell`, `B·C = bc` at `bcCell`, and one bracketing of
   * `A·B·C` is filled in as `v` at `thirdCell` (the left one when
   * `knownLeft`), so the other, at `at`, must equal it too. */
  associativity: (p: {
    A: string;
    B: string;
    C: string;
    ab: string;
    bc: string;
    v: string;
    knownLeft: boolean;
    abCell: Point;
    bcCell: Point;
    thirdCell: Point;
    at: Point;
  }): Sentence => {
    const { A, B, C } = p;
    const known = p.knownLeft ? `(${A}·${B})·${C}` : `${A}·(${B}·${C})`;
    const forced = p.knownLeft ? `${A}·(${B}·${C})` : `(${A}·${B})·${C}`;
    return so({
      look: phrase`The grid shows ${shows(p.abCell, `${A}·${B} = ${p.ab}`)}, ${shows(p.bcCell, `${B}·${C} = ${p.bc}`)} and ${shows(p.thirdCell, `${known} = ${p.v}`)}. In any group, (${A}·${B})·${C} = ${A}·(${B}·${C})`,
      move: phrase`${mark.as("ring", CELL, [p.at], forced)} must also be ${p.v}`,
    });
  },

  /** `A·B`, at `via`, came out as `A` (`productIsA`) or as `B`, which reveals
   * the other as the identity, and the cell `at` must be `value`. */
  identityFill: (
    A: string,
    B: string,
    productIsA: boolean,
    value: string,
    via: Point,
    at: Point,
  ): Sentence => {
    // "The product" opens the sentence because a sentence capitalizes its
    // first letter, which would turn an element's letter into another symbol.
    const reveals = productIsA
      ? phrase`The product ${shows(via, `${A}·${B} = ${A}`)} shows ${B} is the identity`
      : phrase`The product ${shows(via, `${A}·${B} = ${B}`)} shows ${A} is the identity`;
    return so({
      look: reveals,
      follows: phrase`its row and column are just the element labels`,
      move: phrase`${thisCell(at)} must be ${value}`,
    });
  },

  /** A later leg of the identity-fill journey: the premise is already given,
   * and the product that gave it is still outlined. Each leg places its own
   * label, so the move says no "too". */
  identityFillNext: (value: string, via: Point, at: Point): Sentence =>
    sentence({
      move: phrase`${thisCell(at)} must be ${value}`,
      relation: {
        kind: "again",
        basis: phrase`the identity ${mark.the("outline", CELL, [via], "product")} shows`,
      },
    }),

  /** `E·O` (or `O·E` when not `left`) is `product`, shown at `at`, not `O`, so
   * `E` is not the identity: the premise, which the walk concludes by striking
   * {@link say.identityMarks}. */
  identityElim: (
    E: string,
    O: string,
    product: string,
    left: boolean,
    at: Point,
  ): Narration => {
    const shown = left ? `${E}·${O} = ${product}` : `${O}·${E} = ${product}`;
    // Opens on "The product", not the equation: the finished sentence
    // capitalizes its first letter, which would change an element's letter.
    return phrase`The product ${shows(at, shown)}, not ${O} as it would be if ${E} were the identity`;
  },

  /** What an identity elimination strikes: in each cell of `E`'s row and
   * column, the note that would make it the identity there. */
  identityMarks: (E: string): string => `${E}'s identity marks`,
};
