/**
 * Every sentence Path's hint speaks, and every word inside one.
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
 * The words are the help page's: lines run along the **edges** between
 * squares, and a square takes one line or two, as its mode says.
 */

import { EDGE } from "../../engine/edge-hint.ts";
import {
  CELL,
  mark,
  NARRATION_LIMIT,
  type Narration,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

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

/** What lines tried on the board would break at once. */
export type Clash =
  /** The square would have more lines than it takes. */
  | { kind: "crowded"; square: Square; lines: number }
  /** The square would have too few edges left for its lines: `ways` is its
   * lines and its open edges together. */
  | { kind: "stuck"; square: Square; ways: number }
  /** The lines would make a loop of `squares`. */
  | { kind: "closed"; squares: readonly Point[] }
  /** The lines would join two numbers that may not meet: two different
   * numbers in Pairs, and in Path two that are not one apart. */
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
      return phrase`make a loop of ${mark.as("outline", CELL, c.squares, "the outlined squares")}`;
    case "joined":
      return phrase`join ${twoNumbers(c.a, c.b)}`;
  }
};

export const say = {
  /** The square, which takes `takes` lines, has only as many edges left as
   * it still needs lines. An edge beside a square that has all its lines is
   * not one of them, which the help says. */
  forced: (
    s: Square,
    takes: number,
    need: number,
    edges: readonly number[],
  ): Sentence =>
    so({
      look:
        takes === 1
          ? phrase`${outlined(s)} has only one edge left for its line`
          : need === 2
            ? phrase`${outlined(s)} has only two edges left for its two lines`
            : phrase`${outlined(s)} has only one edge left for its second line`,
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

  /** The square the three edges meet at takes two more lines, and lines on
   * the outlined two would break the board at once. */
  pairBreaks: (tried: readonly number[], edge: number, clash: Clash): Sentence =>
    so({
      look: phrase`lines on both ${mark.as("outline", EDGE, tried, "outlined edges")} would ${clashWords(clash)}`,
      move: mustBe([edge], "line"),
    }),

  /**
   * The square takes two more lines from its four edges, and no two of the
   * outlined three can be them. Too many pairs to say each within a
   * sentence's length, so the player is shown which edges to weigh, and told
   * what every pair would do where they agree.
   */
  weighedLine: (
    others: readonly number[],
    edge: number,
    whys: readonly Why[],
  ): Sentence =>
    within(whys, (w) =>
      so({
        look: phrase`lines on any two of ${mark.as("outline", EDGE, others, "the outlined edges")} would ${w}`,
        move: mustBe([edge], "line"),
      }),
    ),

  /** The outlined square takes two more lines from its four edges, and
   * every pair of them but the ringed two would break a rule. */
  weighedPair: (s: Square, edges: readonly number[], whys: readonly Why[]): Sentence =>
    within(whys, (w) =>
      so({
        look: phrase`lines on any other two edges of ${outlined(s)} would ${w}`,
        move: mustBe(edges, "line"),
      }),
    ),

  /** The outlined square takes two more lines from its four edges, and a
   * line on the ringed one would break a rule beside any other. */
  weighedCross: (s: Square, edge: number, whys: readonly Why[]): Sentence =>
    within(whys, (w) =>
      so({
        look: phrase`a line on ${these([edge])} and any other edge of ${outlined(s)} would ${w}`,
        move: phrase`it must be crossed out`,
      }),
    ),
};

/** `say` with what the ruled-out ways would do, each said once, in the help's
 * words where they fit within a sentence's length and shorter ones where
 * not, or else with "break a rule": which rule each breaks is the detail
 * that drops first. */
function within(whys: readonly Why[], say: (would: string) => Sentence): Sentence {
  const kinds = [...new Set(whys)].sort();
  for (const words of [WHY, WHY_SHORT]) {
    const said = kinds.map((w) => words[w]);
    const listed =
      said.length > 1
        ? `${said.slice(0, -1).join(", ")} or ${said[said.length - 1]}`
        : said[0];
    const told = say(listed);
    if (told.text.length <= NARRATION_LIMIT) return told;
  }
  return say("break a rule");
}

/** What a ruled-out way of a weighed square would do. */
export type Why = "joined" | "closed" | "crowded" | "dead-end" | "cut-off";

const WHY: Readonly<Record<Why, string>> = {
  closed: "close a loop",
  crowded: "give a square too many lines",
  "cut-off": "cut a square off",
  "dead-end": "leave a square a dead end",
  joined: "join numbers that may not meet",
};

const WHY_SHORT: Readonly<Record<Why, string>> = {
  closed: "close a loop",
  crowded: "overfill a square",
  "cut-off": "cut a square off",
  "dead-end": "leave a dead end",
  joined: "join numbers wrongly",
};
