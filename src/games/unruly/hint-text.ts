/**
 * Every sentence Unruly's hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads. Every word that points at
 * the board is a reference to the mark it points at (`engine/hint-words.ts`):
 * the cell the step colors is ringed, the cells whose colors are the reason
 * are outlined, and the row or column the sentence calls "this row" is striped.
 */

import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
  whole,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { ONE, ZERO } from "./constants.ts";
import type { HintReason } from "./solver.ts";

type R<K extends HintReason["kind"]> = Extract<HintReason, { kind: K }>;

/** The cells a step marks: the one it colors, the evidence, and the line it
 * names (empty when it names none). */
export interface Marked {
  target: Point;
  evidence: readonly Point[];
  line: readonly Point[];
}

const colorName = (c: number): string => (c === ONE ? "black" : "white");
const oppositeName = (c: number): string => colorName(c === ONE ? ZERO : ONE);
const lineName = (horizontal: boolean): string => (horizontal ? "row" : "column");

const thisCell = (m: Marked): Narration => mark.this("ring", CELL, [m.target], "cell");
const thisLine = (m: Marked, horizontal: boolean): Narration =>
  mark.this("stripes", whole(CELL), m.line, lineName(horizontal));

export const say = {
  threes: (reason: R<"threes">, m: Marked): Sentence =>
    so({
      look: phrase`${mark.the("outline", CELL, m.evidence, "cell")} are already ${colorName(reason.color)}`,
      follows: phrase`${thisCell(m)} would make three in a row`,
      move: phrase`it must be ${oppositeName(reason.color)}`,
    }),

  complete: (reason: R<"complete">, m: Marked): Sentence =>
    so({
      look: phrase`${thisLine(m, reason.horizontal)} already holds ${mark.paren("outline", CELL, m.evidence, `all of its ${colorName(reason.full)} cells`)}`,
      move: phrase`${thisCell(m)} and every other empty one in it must be ${colorName(reason.fill)}`,
    }),

  unique: (reason: R<"unique">, m: Marked): Sentence =>
    so({
      look: phrase`${thisLine(m, reason.horizontal)}'s ${oppositeName(reason.fill)}s all sit where ${mark.the("outline", whole(CELL), m.evidence, lineName(reason.horizontal))}'s do`,
      follows: phrase`a ${oppositeName(reason.fill)} in ${thisCell(m)} would copy it`,
      move: phrase`it must be ${colorName(reason.fill)}`,
    }),

  nearcomplete: (reason: R<"nearcomplete">, m: Marked): Sentence =>
    so({
      look: phrase`The last ${oppositeName(reason.fill)} in ${thisLine(m, reason.horizontal)} fits only in ${mark.as("outline", CELL, m.evidence, "an outlined cell")} without making three ${colorName(reason.fill)}s`,
      move: phrase`${thisCell(m)} must be ${colorName(reason.fill)}`,
    }),
};
