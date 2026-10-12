/**
 * Every sentence Skeleton's hint speaks, and every word inside one.
 *
 * The deduction decides which sentence and with what values
 * ([`hint.ts`](./hint.ts)); this file decides only how it reads. Each sentence
 * says what to look at and then what must follow (docs/hints.md
 * § "Writing the narration"). Every word that points at the board is a
 * reference to the mark it points at (`engine/hint-words.ts`): the squares a
 * step decides are ringed, and the numbers it reasons from are outlined and
 * named by their value.
 *
 * A step that decides several squares shrinks as the player makes some of
 * them, and its words are narrowed with it, so every word that counts the
 * ringed squares is a reference that re-renders from them.
 */

import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import { SHADED_NAME, UNSHADED_NAME } from "../../engine/piece.ts";
import type { Point } from "../../engine/types.ts";

const squares = (n: number): string => (n === 1 ? "square" : "squares");

/** "3 purple squares", or "2 more purple squares" once some are placed. */
const needs = (need: number, placed: number): string =>
  `${need}${placed > 0 ? " more" : ""} ${SHADED_NAME} ${squares(need)}`;

const these = (cells: readonly Point[]): Narration =>
  mark.this("ring", CELL, cells, "square");

/** "it must be" / "they must be", over the ringed squares. */
const mustBe = (cells: readonly Point[], what: string): Narration =>
  phrase`${mark.as("ring", CELL, cells, (els) => (els.length > 1 ? "they" : "it"))} must be ${what}`;

/** A number, by its value. */
const number = (at: Point, value: number, lead = "the outlined"): Narration =>
  mark.as("outline", CELL, [at], `${lead} ${value}`);

/** A number as a count rung reads it. */
export interface Counted {
  at: Point;
  value: number;
  /** How many more shaded squares it needs. */
  need: number;
}

export const say = {
  /** The number has every shaded square it counts. */
  countMet: (c: Counted, cells: readonly Point[]): Sentence =>
    so({
      look:
        c.value === 0
          ? phrase`${number(c.at, c.value)} has no ${SHADED_NAME} square beside it`
          : phrase`${number(c.at, c.value)} already has its ${c.value} ${SHADED_NAME} ${squares(c.value)} beside it`,
      move: phrase`${these(cells)} must be ${UNSHADED_NAME}`,
    }),

  /** The number needs every open square beside it. */
  countAll: (c: Counted, open: number, cells: readonly Point[]): Sentence =>
    so({
      look: phrase`${number(c.at, c.value)} needs ${needs(c.need, c.value - c.need)} and has only ${open} open ${squares(open)} beside it`,
      move: phrase`${these(cells)} must be ${SHADED_NAME}`,
    }),

  /**
   * Two numbers read together. `outer` is beside the ringed squares and
   * `inner` is not, which is how the words tell two numbers of one value
   * apart: every open square beside `inner` is beside `outer` too.
   */
  shared: (
    outer: Counted,
    inner: Counted,
    cells: readonly Point[],
    mark_: "shaded" | "clear",
  ): Sentence => {
    const left = outer.need - inner.need;
    const taken = left === 0 ? (inner.need === 1 ? "it" : "them all") : `${inner.need}`;
    return so({
      look: phrase`${number(outer.at, outer.value, "the")} beside ${these(cells)} still needs ${outer.need}, and ${number(inner.at, inner.value, "the other outlined")} puts ${taken} where they meet`,
      move: mustBe(cells, mark_ === "shaded" ? SHADED_NAME : UNSHADED_NAME),
    });
  },
};
