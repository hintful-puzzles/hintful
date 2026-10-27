/**
 * Every sentence Skeleton's hint speaks, and every word inside one.
 *
 * The deduction decides which sentence and with what values
 * ([`hint.ts`](./hint.ts)); this file decides only how it reads. Each
 * sentence says what to look at and then what must follow (docs/hints.md
 * § "Writing the narration"). Every word that points at the board is a
 * reference to the mark it points at (`engine/hint-words.ts`): the edges a
 * step decides are ringed, drawn as the line or cross it asks for; the
 * squares it reasons from are outlined; and the edges a supposition would
 * force are outlined too, drawn thin.
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

/** What breaks a board a supposition has led to. */
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

  /**
   * Supposing the other mark on the edge forces the outlined edges, one rung
   * at a time, and then breaks the board: the walk is shown whole and said in
   * one sentence (docs/hints-marks.md § "Show the what-if walk statically").
   */
  lookahead: (
    edge: number,
    supposed: "line" | "cross",
    chain: readonly number[],
    clash: Clash,
  ): Sentence => {
    const forced =
      chain.length > 0
        ? phrase` force ${mark.as("outline", EDGE, chain, "the outlined edges")} and`
        : phrase``;
    // The edge is named where the sentence supposes on it, never as a bare
    // "here", and the move after says "it" of the same edge.
    const other = supposed === "line" ? "crossed out" : "a line";
    return so({
      look: phrase`a ${supposed} on ${these([edge])} would${forced} ${clashWords(clash)}`,
      move: phrase`it must be ${other}`,
    });
  },
};
