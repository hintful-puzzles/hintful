/**
 * Every sentence Pattern's hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads: the indication (the spotted
 * pattern) first, the conclusion in the necessity voice, terse. Every word that
 * points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`, `hint-marks.ts`).
 */

import {
  CELL,
  mark,
  type Narration,
  phrase,
  pronoun,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import { SHADED_NAME, UNSHADED_NAME } from "../../engine/piece.ts";
import type { Point } from "../../engine/types.ts";
import { CLUE, LINE } from "./hint-marks.ts";

/** What a step marks: the cells it decides, the placed cells it reasons from,
 * and its line, whose clue is `line` too. */
export interface Marked {
  cells: readonly Point[];
  refs: readonly Point[];
  line: number;
  orient: "row" | "column";
}

const theseCells = (m: Marked): Narration => mark.this("ring", CELL, m.cells, "cell");
/** "it" or "they" for the decided cells, re-rendered when a step shrinks. */
const they = (m: Marked): Narration =>
  mark.as("ring", CELL, m.cells, (els) =>
    pronoun(CELL, els) === "it" ? "it" : "they",
  );
const thisLine = (m: Marked): Narration =>
  mark.this("stripes", LINE, [m.line], m.orient);
const clue = (m: Marked, words: string): Narration =>
  mark.as("outline", CLUE, [m.line], words);
/** ", given the outlined cells" when the step cites placed cells. */
const given = (m: Marked): Narration | string =>
  m.refs.length > 0 ? phrase`, given ${mark.the("outline", CELL, m.refs, "cell")}` : "";

export const say = {
  /** A run of `run` that can slide only `slack` cells along the line. */
  overlap: (m: Marked, run: number, slack: number): Sentence =>
    so({
      look:
        slack === 0
          ? phrase`${thisLine(m)}'s ${clue(m, `run of ${run}`)} has nowhere to slide${given(m)}`
          : phrase`${thisLine(m)}'s ${clue(m, `run of ${run}`)} can slide only ${slack} cell${
              slack > 1 ? "s" : ""
            }${given(m)}`,
      move: phrase`${theseCells(m)} must be ${SHADED_NAME}`,
    }),

  unreachable: (m: Marked): Sentence =>
    so({
      look: phrase`No run of ${thisLine(m)}'s ${clue(m, "clue")} can reach ${theseCells(m)}`,
      move: phrase`${they(m)} must be ${UNSHADED_NAME}`,
    }),

  lineEmpty: (m: Marked): Sentence =>
    so({
      look: phrase`${thisLine(m)} has no clues`,
      move: phrase`${theseCells(m)} must be ${UNSHADED_NAME}`,
    }),

  /** Every fit of the line's runs agrees these cells are `shaded`, or clear. */
  intersection: (m: Marked, shaded: boolean): Sentence =>
    so({
      look: phrase`Every way ${thisLine(m)}'s ${clue(m, "runs")} can fit ${shaded ? "covers" : "leaves out"} ${theseCells(m)}`,
      move: phrase`${they(m)} must be ${shaded ? SHADED_NAME : UNSHADED_NAME}`,
    }),
};
