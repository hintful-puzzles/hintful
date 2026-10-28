/**
 * Every sentence Skeleton's hint speaks, and every word inside one.
 *
 * The deduction decides which sentence and with what values
 * ([`hint.ts`](./hint.ts)); this file decides only how it reads. Each
 * sentence says what to look at and then what must follow (docs/hints.md
 * § "Writing the narration"). Every word that points at the board is a
 * reference to the mark it points at (`engine/hint-words.ts`): the edges a
 * step decides are ringed, drawn as the line or cross it asks for; the
 * squares it reasons from are outlined; and the edges a step tries lines on
 * are outlined too, drawn thin.
 *
 * The words are the help page's: the loop runs along the **edges** between
 * squares, and every square takes two lines.
 */

import { EDGE } from "../../engine/edge-hint.ts";
import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

const these = (edges: readonly number[]): Narration =>
  mark.this("ring", EDGE, edges, "edge");

/** "this edge must be a line", "these edges must be lines", or crossed out. */
const mustBe = (edges: readonly number[], what: "line" | "cross"): Narration =>
  phrase`${these(edges)} must be ${what === "cross" ? "crossed out" : edges.length > 1 ? "lines" : "a line"}`;

const outlined = (at: Point): Narration =>
  mark.as("outline", CELL, [at], "the outlined square");

/** A square's count of lines in words, so it does not read as a coordinate. */
const COUNTS = ["no", "one", "two", "three", "four"] as const;

/** What lines tried on the board would break at once. */
export type Clash =
  /** The square would have more lines than it takes. */
  | { kind: "crowded"; at: Point; lines: number }
  /** The square would have too few edges left for its lines: `ways` is its
   * lines and its open edges together. */
  | { kind: "stuck"; at: Point; ways: number }
  /** The lines would make a loop of `squares`, short of the rest. */
  | { kind: "closed"; squares: readonly Point[] };

const clashWords = (c: Clash): Narration => {
  switch (c.kind) {
    case "crowded":
      return phrase`give ${outlined(c.at)} ${COUNTS[c.lines]} lines`;
    // A square with one way in and none out is a dead end; one with no way
    // at all is cut off.
    case "stuck":
      return c.ways > 0
        ? phrase`leave ${outlined(c.at)} a dead end`
        : phrase`cut off ${outlined(c.at)}`;
    case "closed":
      return phrase`make a loop of ${mark.as("outline", CELL, c.squares, "the outlined squares")}`;
  }
};

export const say = {
  /** The square has only as many edges left as it still needs lines. An
   * edge beside a square that has its two lines, or one whose line would
   * close a loop too soon, is not one of them, which the help says. */
  forced: (at: Point, need: number, edges: readonly number[]): Sentence =>
    so({
      look:
        need === 2
          ? phrase`${outlined(at)} has only two edges left for its two lines`
          : phrase`${outlined(at)} has only one edge left for its second line`,
      move: mustBe(edges, "line"),
    }),

  /** A line on the edge would break the board at once. The edge is named
   * where the sentence tries a line on it, never as a bare "here", and the
   * move after says "it" of the same edge. */
  lineBreaks: (edge: number, clash: Clash): Sentence =>
    so({
      look: phrase`a line on ${these([edge])} would ${clashWords(clash)}`,
      move: phrase`it must be crossed out`,
    }),

  /** The square the three edges meet at takes two lines, and lines on the
   * outlined two would break the board at once. */
  pairBreaks: (tried: readonly number[], edge: number, clash: Clash): Sentence =>
    so({
      look: phrase`lines on both ${mark.as("outline", EDGE, tried, "outlined edges")} would ${clashWords(clash)}`,
      move: mustBe([edge], "line"),
    }),
};
