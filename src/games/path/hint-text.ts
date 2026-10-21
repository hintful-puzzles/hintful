/**
 * Every sentence Path's hint speaks, and every word inside one.
 *
 * The deduction decides which sentence and with what values
 * ([`hint.ts`](./hint.ts)); this file decides only how it reads. Each
 * sentence says what to look at and then what must follow (docs/hints.md
 * § "Writing the narration"). Every word that points at the board is a
 * reference to the mark it points at (`engine/hint-words.ts`): the edges a
 * step decides are ringed, drawn as the line or cross it asks for; the
 * squares it reasons from are outlined; and the edges a supposition would
 * force are outlined too, drawn thin and numbered in the order they follow.
 *
 * The words are the help page's: lines run along the **edges** between
 * squares, a number takes one line and every other square two.
 */

import {
  CELL,
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** An edge between two squares, by its index. */
export const EDGE: MarkKind<number> = { name: "edge", key: String };

/** A square, and the number on it where it has one. */
export interface Square {
  at: Point;
  number: number | null;
}

const these = (edges: readonly number[]): Narration =>
  mark.this("ring", EDGE, edges, "edge");

/** "this edge must be a line", "these edges must be lines", or crossed out. */
const mustBe = (edges: readonly number[], what: "line" | "cross"): Narration =>
  phrase`${these(edges)} must be ${what === "cross" ? "crossed out" : edges.length > 1 ? "lines" : "a line"}`;

/** A square by what is on it: "the outlined 3", or "the outlined square". */
const outlined = (s: Square, lead = "the outlined"): Narration =>
  mark.as("outline", CELL, [s.at], `${lead} ${s.number ?? "square"}`);

/** Two numbers, outlined together: "the outlined 2 to the 5". */
const twoNumbers = (a: Square, b: Square): Narration =>
  mark.as("outline", CELL, [a.at, b.at], `the outlined ${a.number} to the ${b.number}`);

/** A square's count of lines in words, so it does not run into its number. */
const COUNTS = ["no", "one", "two", "three", "four"] as const;

/** What breaks a board a supposition has led to. */
export type Clash =
  /** The square would have more lines than it takes. */
  | { kind: "crowded"; square: Square; lines: number }
  /** The square would have too few edges left for its lines: `ways` is its
   * lines and its open edges together. */
  | { kind: "stuck"; square: Square; ways: number }
  /** The lines would close a loop round `squares`. */
  | { kind: "closed"; squares: readonly Point[] }
  /** The lines would join two different numbers. */
  | { kind: "joined"; a: Square; b: Square };

const clashWords = (c: Clash): Narration => {
  switch (c.kind) {
    case "crowded":
      return phrase`give ${outlined(c.square)} ${COUNTS[c.lines]} lines`;
    // A square with one way in and none out is a dead end; one with no way
    // at all, or a number with none, is cut off.
    case "stuck":
      return c.ways > 0
        ? phrase`leave ${outlined(c.square)} a dead end`
        : phrase`cut off ${outlined(c.square)}`;
    case "closed":
      return phrase`close a loop round ${mark.as("outline", CELL, c.squares, "the outlined squares")}`;
    case "joined":
      return phrase`join ${twoNumbers(c.a, c.b)}`;
  }
};

export const say = {
  /** The square has only as many edges left as it still needs lines. An
   * edge beside a square that has all its lines is not one of them, which
   * the help says. */
  forced: (s: Square, need: number, edges: readonly number[]): Sentence =>
    so({
      look:
        s.number !== null
          ? phrase`${outlined(s)} has only one edge left for its line`
          : need === 2
            ? phrase`${outlined(s)} has only two edges left for its two lines`
            : phrase`${outlined(s)} has only one edge left for its second line`,
      move: mustBe(edges, "line"),
    }),

  /**
   * Supposing the other mark on the edge forces the numbered edges, one rung
   * at a time, and then breaks the board: the walk is shown whole and said in
   * one sentence (docs/hints-marks.md § "Show the what-if walk statically").
   */
  lookahead: (
    edge: number,
    supposed: "line" | "cross",
    chain: readonly number[],
    clash: Clash,
  ): Sentence => {
    const what = supposed === "line" ? "a line here would" : "a cross here would";
    const forced =
      chain.length > 0
        ? phrase` force ${mark.as("outline", EDGE, chain, "the numbered edges")} and`
        : phrase``;
    return so({
      look: phrase`${what}${forced} ${clashWords(clash)}`,
      move: mustBe([edge], supposed === "line" ? "cross" : "line"),
    });
  },
};
