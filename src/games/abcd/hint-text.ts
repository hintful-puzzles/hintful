/**
 * Every sentence ABCD's hint speaks. Which one a step speaks, and with what
 * letters, is `hint.ts`'s `placeWords` and `strikeWords`; a strike's words are a
 * premise, which the shared walk ends with the move its step makes.
 *
 * The no-touch rule is the one thing the two modes say differently, so every
 * sentence that says where a letter keeps its twin out of takes `diag`.
 */

import {
  joinWith,
  type LatinVocab,
  narrateLatinReason,
  populateText,
} from "../../engine/hint-text.ts";

/** The letters as a hint prints them: candidate `n` is the `n`th letter. */
export const LETTERS: LatinVocab = {
  noun: "letter",
  value: (n) => String.fromCharCode(64 + n),
};
const L = LETTERS.value;

/** Where a letter keeps its twin out of, from a cell. */
const around = (diag: boolean): string =>
  diag ? "touching it, even at a corner" : "beside, above or below it";

/** "one A", "2 more As": what a line still needs of letter `n`, `more` when
 * some are already placed. */
const needs = (k: number, n: number, more: boolean): string =>
  `${k === 1 ? "one" : k} ${more ? "more " : ""}${L(n)}${k === 1 ? "" : "s"}`;

export type LineWord = "row" | "column";

export const say = {
  populate: populateText("letter"),

  clean: (diag: boolean): string =>
    diag
      ? "Now clear the easy ones: cross out any letter already in a cell touching the cell, even at a corner."
      : "Now clear the easy ones: cross out any letter already beside, above or below the cell.",

  /** A note-less cell's candidates, written because a deduction rests on them. */
  note: (values: readonly number[], every: boolean, diag: boolean): string => {
    if (every) return "No letter stands next to this cell yet, so pencil in every one.";
    const one = values.length === 1;
    return `Only ${joinWith(values.map(L))} ${one ? "isn't" : "aren't"} already ${around(diag)}, so pencil ${one ? "it" : "them"} in.`;
  },

  naked: (n: number): string => narrateLatinReason({ kind: "single" }, n, LETTERS),

  /** A note-less cell every other letter is ruled out of. */
  regionsFull: (n: number, diag: boolean): string =>
    `Every other letter is already ${around(diag)}, so it can only be ${L(n)}.`,

  /** A placement's own strikes, as the leg after it. */
  cull: (n: number, diag: boolean): string =>
    `The ${L(n)} just placed rules out ${L(n)} in every cell ${around(diag)}`,

  /** What a cull strikes. */
  culled: (n: number): string => `those ${L(n)}s`,

  /**
   * A line whose clue for `n` is already met, or is 0. Worded as what the line
   * holds, because the placed letters are outlined and its count is drawn in
   * the hint color.
   */
  satisfied: (line: LineWord, n: number, clue: number): string =>
    clue === 0
      ? `This ${line} must hold no ${L(n)}`
      : clue === 1
        ? `This ${line} already holds its one ${L(n)}`
        : clue === 2
          ? `This ${line} already holds both its ${L(n)}s`
          : `This ${line} already holds all ${clue} of its ${L(n)}s`,

  /** What a satisfied line strikes: the rest of the line's `n` notes. */
  satisfiedStruck: (n: number, clue: number, targets: number): string =>
    `the ${clue === 0 ? "" : "other "}${L(n)}${targets === 1 ? "" : "s"} in it`,

  /**
   * The runs technique when every cell that can still take `n` must: as many
   * cells left as the line still needs. `more` is whether some are placed.
   */
  onlyHomes: (line: LineWord, n: number, need: number, more: boolean): string =>
    need === 1
      ? `This ${line} needs ${needs(1, n, more)} and no other cell in it can take one, so this cell must be ${L(n)}.`
      : `This ${line} needs ${needs(need, n, more)} and only the outlined cells can take one, so this cell must be ${L(n)}.`,

  /**
   * The runs technique proper: the outlined cells, split into stretches by the
   * cells that cannot take `n`, fit only `need` of it with no two touching (a
   * stretch of `L` cells fits `⌈L/2⌉`), and the line needs exactly that many. So
   * every stretch is packed full, and an odd one packs only one way.
   */
  packed: (line: LineWord, n: number, need: number, more: boolean): string =>
    `This ${line} needs ${needs(need, n, more)}, and the outlined cells fit only ${need} apart, so each stretch is full: this cell must be ${L(n)}.`,

  /** A later cell of the same firing. */
  alsoForced: (n: number): string => `So this cell must be ${L(n)} too.`,
};
