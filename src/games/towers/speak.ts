/**
 * Every sentence Towers' hint speaks that is Towers' own, as the description
 * states it (`towers.description.yaml`'s `steps`).
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate` and `premise`); the words are the description's. Each function here
 * supplies a step of that name with the terms it is told by and the cells it
 * points at. The generic Latin arms (the placement's cull, the naked set, the
 * wing, the singles) are the engine's, spoken in {@link TOWERS_VOCAB}.
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/contract/hint-words.ts`): a clue is outlined in its slot beside the grid, the
 * line it sees along is striped through both clue slots, and the cell a
 * placement decides is ringed ("this cell").
 */

import {
  CELL,
  type Narration,
  type Sentence,
} from "../../engine/contract/hint-words.ts";
import type { Point } from "../../engine/contract/types.ts";
import type { LatinVocab } from "../../engine/hint-text.ts";
import { lineUnit } from "../../engine/step-voice.ts";
import { voice, WORDS } from "../../generated/games/towers/towers.compiled.ts";

/** A clue and the line it sees along, as the sentence names them: the clue's
 * slot (`at`, outlined) and its line of sight through both clue slots
 * (`line`, striped). */
export interface ClueSight {
  value: number;
  at: Point;
  line: readonly Point[];
}

type Squares = readonly Point[];

/** Every mark is a cell: a clue's slot is one, beside the grid. */
const speak = voice<Point>({ kind: CELL, value: String });

const clueMarks = (c: ClueSight) => ({
  outline: { clue: [c.at] },
  stripes: { line: c.line },
});

export const say = {
  /** Clue `c` sees every tower in its line, so height `n` sits at `at`. A
   * journey's later leg (`continues`) does not restate the premise its first
   * leg gave, only which clue and line it is still working along. */
  fullLine: (c: ClueSight, n: number, at: Point, continues: boolean): Sentence =>
    speak.sentence("fullLine", {
      ring: [at],
      terms: { v: c.value, n },
      marks: clueMarks(c),
      later: continues,
    }),

  tallestNearest: (c: ClueSight, n: number, at: Point): Sentence =>
    speak.sentence("tallestNearest", {
      ring: [at],
      terms: { v: c.value, n },
      marks: clueMarks(c),
    }),

  /** Two clues at the two ends of one line. */
  facing: (clues: Squares, sight: Squares, n: number, at: Point): Sentence =>
    speak.sentence("facing", {
      ring: [at],
      terms: { n },
      marks: { outline: { clues }, stripes: { line: sight } },
    }),

  // The strike arms below are premises, which the walk concludes with the move
  // it makes (`engine/hint-text.ts`'s `Premise`). The struck cells are named
  // there, by the notes the step rings.

  lineFull: (c: ClueSight, n: number): Narration =>
    speak.premise("lineFull", {
      terms: { v: c.value, seen: c.value - 1, n },
      marks: clueMarks(c),
    }),

  lowerBound: (c: ClueSight, n: number): Narration =>
    speak.premise("lowerBound", { terms: { v: c.value, n }, marks: clueMarks(c) }),

  arrangement: (c: ClueSight, n: number, at: Point): Narration =>
    speak.premise("arrangement", {
      ring: [at],
      terms: { v: c.value, n },
      marks: clueMarks(c),
    }),

  hiddenSingle: (kind: "row" | "col", cells: Squares, at: Point, n: number): Sentence =>
    speak.sentence("hiddenSingle", {
      ring: [at],
      terms: { axis: lineUnit(kind), n },
      marks: { stripes: { line: cells } },
    }),

  set: (cells: Squares, n: number): Narration =>
    speak.premise("set", { terms: { n }, marks: { outline: { set: cells } } }),
};

/** Towers' values in the engine's sentences: heights, bare where a confined
 * height or a wing's is said twice, since the qualified sentence runs past
 * the narration limit. */
export const TOWERS_VOCAB: LatinVocab = {
  noun: "height",
  cell: WORDS.cell,
  value: String,
};
