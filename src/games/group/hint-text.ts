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

import type { LatinVocab } from "../../engine/hint-text.ts";
import { toChar } from "./state.ts";

/** Group's value vocabulary for the shared generic-Latin narration arms: its
 * values are the elements `a`–`z`, not digits. */
export function groupVocab(id: boolean): LatinVocab {
  return { noun: "element", value: (n) => toChar(n, id) };
}

export const say = {
  /** `A·B = ab`, `B·C = bc`, and one bracketing of `A·B·C` is filled in as `v`
   * (the left one when `knownLeft`), so the other must equal it too. */
  associativity: (p: {
    A: string;
    B: string;
    C: string;
    ab: string;
    bc: string;
    v: string;
    knownLeft: boolean;
  }): string => {
    const { A, B, C } = p;
    const known = p.knownLeft ? `(${A}·${B})·${C}` : `${A}·(${B}·${C})`;
    const forced = p.knownLeft ? `${A}·(${B}·${C})` : `(${A}·${B})·${C}`;
    return `The grid shows ${A}·${B} = ${p.ab}, ${B}·${C} = ${p.bc} and ${known} = ${p.v}. Because (${A}·${B})·${C} = ${A}·(${B}·${C}) in any group, ${forced} must also be ${p.v}.`;
  },

  /** `A·B` came out as `A` (`productIsA`) or as `B`, which reveals the other
   * as the identity, and this cell must be `value`. */
  identityFill: (A: string, B: string, productIsA: boolean, value: string): string => {
    const shows = productIsA
      ? `${A}·${B} = ${A} shows ${B} is the identity`
      : `${A}·${B} = ${B} shows ${A} is the identity`;
    return `${shows}, so its row and column are just the element labels, and this cell must be ${value}.`;
  },

  /** A later leg of the identity-fill journey: the premise is already given. */
  identityFillNext: (value: string): string =>
    `The identity's row and column are just the element labels, so this cell must be ${value}.`,

  /** `E·O` (or `O·E` when not `left`) is `product`, not `O`, so `E` is not the
   * identity: the premise, which the walk concludes by striking
   * {@link say.identityMarks}. */
  identityElim: (E: string, O: string, product: string, left: boolean): string => {
    const shown = left ? `${E}·${O} = ${product}` : `${O}·${E} = ${product}`;
    return `${shown}, not ${O}, and the identity would leave ${O} unchanged, which rules ${E} out`;
  },

  /** What an identity elimination strikes: in each cell of the element's row
   * and column, the note that would make it the identity there. */
  identityMarks: "its identity marks",
};
