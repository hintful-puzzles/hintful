/**
 * Every sentence ABCD's hint speaks. Which one a step speaks, and with what
 * letters, is `hint.ts`'s `placeWords` and `strikeWords`; a strike's words are a
 * premise, which the shared walk ends with the move its step makes.
 *
 * The no-touch rule is the one thing the two modes say differently, so every
 * sentence that says where a letter keeps its twin out of takes `diag`.
 *
 * Every word pointing at the board is a reference to its mark
 * (`engine/hint-words.ts`): "this cell" the ringed cell, "this row" the striped
 * line, the letters and cells a step reasons from outlined, and the count it
 * reads, drawn in the hint color, by the words that state it ("its one A").
 */

import {
  joinWith,
  type LatinVocab,
  narrateLatinReason,
  populateText,
  thisCell,
} from "../../engine/hint-text.ts";
import {
  CELL,
  type MarkKind,
  mark,
  type Narration,
  NOTE,
  type Note,
  phrase,
  whole,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** The letters as a hint prints them: candidate `n` is the `n`th letter. */
export const LETTERS: LatinVocab = {
  noun: "letter",
  value: (n) => String.fromCharCode(64 + n),
};
const L = LETTERS.value;

/** A line's clue for one letter, as its index in `numbers`: the count a step
 * reads, drawn in the hint color. */
export const CLUE: MarkKind<number> = { name: "clue", key: String };

/** Where a letter keeps its twin out of, from `what`. */
const around = (diag: boolean, what: Narration | string): Narration =>
  diag
    ? phrase`touching ${what}, even at a corner`
    : phrase`beside, above or below ${what}`;

/** "one A", "2 more As": what a line still needs of letter `n`, `more` when
 * some are already placed. */
const needs = (k: number, n: number, more: boolean): string =>
  `${k === 1 ? "one" : k} ${more ? "more " : ""}${L(n)}${k === 1 ? "" : "s"}`;

export type LineWord = "row" | "column";

/** A line a step names, and its clue for the letter the step reads. */
export interface LineMarks {
  word: LineWord;
  cells: readonly Point[];
  clue: number;
}

const thisLine = (line: LineMarks): Narration =>
  mark.this("stripes", whole(CELL), line.cells, line.word).capitalized();

/** Words stating the count a line's clue gives, bound to the clue. */
const count = (line: LineMarks, words: string): Narration =>
  mark.as("outline", CLUE, [line.clue], words);

export const say = {
  populate: populateText("letter"),

  clean:
    (diag: boolean) =>
    (marks: readonly Note[]): Narration =>
      phrase`Now clear the easy ones: cross out ${mark.as(
        "ring",
        NOTE,
        marks,
        diag
          ? "any letter already in a cell touching the cell, even at a corner"
          : "any letter already beside, above or below the cell",
      )}.`,

  /** A note-less cell's candidates, written because a deduction rests on them. */
  note: (
    at: Point,
    values: readonly number[],
    every: boolean,
    diag: boolean,
  ): Narration => {
    if (every)
      return phrase`No letter stands next to ${thisCell(at)} yet, so pencil in every one.`;
    const one = values.length === 1;
    return phrase`Only ${joinWith(values.map(L))} ${one ? "isn't" : "aren't"} already ${around(diag, thisCell(at))}, so pencil ${one ? "it" : "them"} in.`;
  },

  naked: (at: Note, w: number): Narration =>
    narrateLatinReason({ kind: "single" }, at, w, LETTERS),

  /** A note-less cell every other letter is ruled out of. */
  regionsFull: (at: Note, diag: boolean): Narration =>
    phrase`Every other letter is already ${around(diag, thisCell(at))}, so it can only be ${L(at.n)}.`,

  /** A placement's own strikes, as the leg after it, from the letter just
   * placed at `placed`. */
  cull: (placed: Point, n: number, diag: boolean): Narration =>
    phrase`${mark.as("outline", CELL, [placed], `The ${L(n)} just placed`)} rules out ${L(n)} in every cell ${around(diag, "it")}`,

  /** What a cull strikes. */
  culled: (n: number): string => `those ${L(n)}s`,

  /**
   * A line whose clue for `n` is already met, or is 0. Worded as what the line
   * holds: the placed letters are outlined, and the words that give the count
   * name the clue, drawn in the hint color.
   */
  satisfied: (
    line: LineMarks,
    n: number,
    clue: number,
    placed: readonly Point[],
  ): Narration => {
    const letters = (words: string) => mark.as("outline", CELL, placed, words);
    const l = L(n);
    return clue === 0
      ? phrase`${thisLine(line)} must hold ${count(line, `no ${l}`)}`
      : clue === 1
        ? phrase`${thisLine(line)} already holds ${count(line, "its one")} ${letters(l)}`
        : clue === 2
          ? phrase`${thisLine(line)} already holds ${count(line, "both its")} ${letters(`${l}s`)}`
          : phrase`${thisLine(line)} already holds ${count(line, `all ${clue} of its`)} ${letters(`${l}s`)}`;
  },

  /** What a satisfied line strikes: the rest of the line's `n` notes. */
  satisfiedStruck: (n: number, clue: number, targets: number): string =>
    `the ${clue === 0 ? "" : "other "}${L(n)}${targets === 1 ? "" : "s"} in it`,

  /**
   * The runs technique when every cell that can still take `n` must: as many
   * cells left as the line still needs. `more` is whether some are placed;
   * `open` the cells that can, outlined when there are several.
   */
  onlyHomes: (
    line: LineMarks,
    at: Note,
    need: number,
    more: boolean,
    open: readonly Point[],
  ): Narration =>
    need === 1
      ? phrase`${thisLine(line)} needs ${count(line, needs(1, at.n, more))} and no other cell in it can take one, so ${thisCell(at)} must be ${L(at.n)}.`
      : phrase`${thisLine(line)} needs ${count(line, needs(need, at.n, more))} and only ${mark.the("outline", CELL, open, "cell")} can take one, so ${thisCell(at)} must be ${L(at.n)}.`,

  /**
   * The runs technique proper: the outlined cells, split into stretches by the
   * cells that cannot take `n`, fit only `need` of it with no two touching (a
   * stretch of `L` cells fits `⌈L/2⌉`), and the line needs exactly that many. So
   * every stretch is packed full, and an odd one packs only one way.
   */
  packed: (
    line: LineMarks,
    at: Note,
    need: number,
    more: boolean,
    open: readonly Point[],
  ): Narration =>
    phrase`${thisLine(line)} needs ${count(line, needs(need, at.n, more))}, and ${mark.the("outline", CELL, open, "cell")} fit only ${need} apart, so each stretch is full: ${thisCell(at)} must be ${L(at.n)}.`,

  /** A later cell of the same firing: the line its first leg named is still
   * striped, and the words point back to it. */
  alsoForced: (line: LineMarks, at: Note): Narration =>
    phrase`So ${thisCell(at)} must be ${L(at.n)} too, for ${mark.the("stripes", whole(CELL), line.cells, line.word, "the same")}.`,
};
