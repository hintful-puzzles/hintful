/**
 * Every sentence Skeleton's hint speaks, and every word inside one.
 *
 * The description's `says` decides which sentence and with what values
 * (`skeleton.description.yaml`); this file decides only how it reads. Each
 * sentence says what to look at and then what must follow (docs/hints.md
 * § "Writing the narration"). Every word that points at the board is a
 * reference to the mark it points at (`engine/hint-words.ts`): the squares a
 * step decides are ringed, the numbers it reasons from are outlined and
 * named by their value, and the squares two numbers share are striped.
 *
 * A step that decides several squares shrinks as the player makes some of
 * them, and its words are narrowed with it, so every word that counts the
 * ringed squares is a reference that re-renders from them.
 */

import type { FiringSpoken } from "../../engine/described-firing-hint.ts";
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
import type { SaysById } from "./skeleton.compiled.ts";

const squares = (n: number): string => (n === 1 ? "square" : "squares");

/** "3 purple squares", or "2 more purple squares" once some are placed. */
const needs = (need: number, placed: number): string =>
  `${need}${placed > 0 ? " more" : ""} ${SHADED_NAME} ${squares(need)}`;

const these = (cells: readonly Point[]): Narration =>
  mark.this("ring", CELL, cells, "square");

/** "this square must be" / "these squares must be". A bare "it" or "they"
 * names no mark, which `hint-quality.test.ts` refuses. */
const mustBe = (cells: readonly Point[], what: string): Narration =>
  phrase`${these(cells)} must be ${what}`;

/** A number, by its value. */
const number = (at: Point, value: number, lead = "the outlined"): Narration =>
  mark.as("outline", CELL, [at], `${lead} ${value}`);

type Spoken<K extends keyof SaysById> = FiringSpoken<SaysById[K]>;

/** One number: it has the shaded squares it counts, or needs every open square
 * beside it. */
function count({ terms: t, targets, at }: Spoken<"count">): Sentence {
  const cells = targets;
  if (t.need === 0)
    return so({
      look:
        t.value === 0
          ? phrase`${number(at(t.c), t.value)} has no ${SHADED_NAME} square beside it`
          : phrase`${number(at(t.c), t.value)} already has its ${t.value} ${SHADED_NAME} ${squares(t.value)} beside it`,
      move: phrase`${these(cells)} must be ${UNSHADED_NAME}`,
    });
  return so({
    look: phrase`${number(at(t.c), t.value)} needs ${needs(t.need, t.value - t.need)} and has only ${t.open} open ${squares(t.open)} beside it`,
    move: phrase`${these(cells)} must be ${SHADED_NAME}`,
  });
}

/**
 * Two numbers read together. The first is beside the ringed squares and the
 * second is not, which is how the words tell two numbers of one value apart:
 * every open square beside the second is beside the first too. Those squares
 * are the area the sentence is about, and are striped.
 */
function shared({ terms: t, targets, stripes, at }: Spoken<"shared">): Sentence {
  const taken = t.by === 0 ? (t.bNeed === 1 ? "it" : "them all") : `${t.bNeed}`;
  const meet = mark.as("stripes", CELL, stripes, "the striped squares");
  return so({
    look: phrase`${number(at(t.c), t.value, "the")} beside ${these(targets)} needs ${t.need}; ${number(at(t.b), t.bValue, "the other outlined")} puts ${taken} in ${meet}`,
    move: mustBe(targets, t.by > 0 ? SHADED_NAME : UNSHADED_NAME),
  });
}

/** Each technique's sentence, from what its description says of a firing
 * (`engine/described-firing-hint.ts`). */
export const sentences = { count, shared };
