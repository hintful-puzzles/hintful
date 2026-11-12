/**
 * Every sentence Unruly's hint speaks, and the words inside them.
 *
 * The description says which values a step speaks of (`unruly.description.yaml`'s
 * `says`) and the engine builds the step (`engine/described-hint.ts`); this file
 * decides only how it reads. Every word that points at the board is a reference
 * to the mark it points at (`engine/hint-words.ts`): the cell the step colors is
 * ringed, the cells whose colors are the reason are outlined, and the row or
 * column the sentence calls "this row" is striped.
 */

import type { ColorWord } from "../../engine/color/color-word.ts";
import { TWO_NAMES } from "../../engine/color/colors.ts";
import type { Spoken } from "../../engine/described-hint.ts";
import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
  whole,
} from "../../engine/hint-words.ts";
import { ONE, pairIndex, ZERO } from "./constants.ts";
import type { SaysById } from "./unruly.compiled.ts";

/** The word for a piece: the palette's, so it is the color the piece is. */
export const colorName = (c: number): ColorWord => TWO_NAMES[pairIndex(c)];
const oppositeName = (c: number): ColorWord => colorName(c === ONE ? ZERO : ONE);
const lineName = (horizontal: boolean): string => (horizontal ? "row" : "column");

const thisCell = (s: Spoken<unknown>): Narration =>
  mark.this("ring", CELL, [s.target], "cell");
const thisLine = (s: Spoken<unknown>, horizontal: boolean): Narration =>
  mark.this("stripes", whole(CELL), s.stripes, lineName(horizontal));

/** A line that holds all its `full` pieces, so its empty cells are the other. */
const complete = (s: Spoken<SaysById["quota"]["terms"]>): Sentence =>
  so({
    look: phrase`${thisLine(s, s.terms.horizontal)} has ${mark.paren("outline", CELL, s.outline, `all its ${colorName(s.terms.full).only} cells`)}`,
    move: phrase`${thisCell(s)} and the ${lineName(s.terms.horizontal)}'s other empty cells must be ${colorName(s.terms.fill)}`,
  });

/** Each technique's sentence, by the id the description gives it. */
export const say: {
  [K in keyof SaysById]: (spoken: Spoken<SaysById[K]["terms"]>) => Sentence;
} = {
  threes: (s) =>
    so({
      look: phrase`${mark.the("outline", CELL, s.outline, "cell")} are already ${colorName(s.terms.color)}`,
      follows: phrase`${thisCell(s)} would make three in a row`,
      move: phrase`it must be ${oppositeName(s.terms.color)}`,
    }),

  lastGap: complete,
  quota: complete,

  unique: (s) =>
    so({
      look: phrase`${thisLine(s, s.terms.horizontal)}'s ${oppositeName(s.terms.fill)}s all sit where ${mark.the("outline", whole(CELL), s.outline, lineName(s.terms.horizontal))}'s do`,
      follows: phrase`a ${oppositeName(s.terms.fill)} in ${thisCell(s)} would copy it`,
      move: phrase`it must be ${colorName(s.terms.fill)}`,
    }),

  lastOne: (s) =>
    so({
      look: phrase`The last ${oppositeName(s.terms.fill)} in ${thisLine(s, s.terms.horizontal)} fits only in ${mark.as("outline", CELL, s.outline, "an outlined cell")} without making three ${colorName(s.terms.fill)}s`,
      move: phrase`${thisCell(s)} must be ${colorName(s.terms.fill)}`,
    }),
};
