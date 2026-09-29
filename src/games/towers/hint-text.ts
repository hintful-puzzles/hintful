/**
 * Every sentence Towers' hint speaks, and the words inside them.
 *
 * Towers keeps its own version of the generic Latin arms rather than the
 * engine's (`engine/hint-text.ts`), because its values need qualifying in some
 * arms and not others ("height 5 can go in only this cell … so it must be
 * 5"), which one vocabulary cannot say. It shares the forcing chain, and the
 * two setup steps are built by the row/column preset from the two words Towers
 * gives it (`index.ts`'s `notes`).
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): a clue is outlined in its slot beside the grid, the
 * line it sees along is striped through both clue slots, and the cell a
 * placement decides is ringed ("here", "this cell").
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads.
 */

import {
  forcingChainPremise,
  type LatinVocab,
  placedRulesOut,
  thisCell,
} from "../../engine/hint-text.ts";
import {
  CELL,
  mark,
  type Narration,
  type Note,
  phrase,
  whole,
} from "../../engine/hint-words.ts";
import type { ForcingLink } from "../../engine/latin-hint.ts";
import type { Point } from "../../engine/types.ts";

/** Towers speaks of heights, not numbers — the one word the shared chain
 * sentence needs from it. */
const TOWERS_VOCAB: LatinVocab = { noun: "height", value: (h) => String(h) };

/** A clue and the line it sees along, as the sentence names them: the clue's
 * slot (`at`, outlined) and its line of sight through both clue slots
 * (`line`, striped). */
export interface ClueSight {
  value: number;
  at: Point;
  line: readonly Point[];
}

const clue = (c: ClueSight, words = `Clue ${c.value}`): Narration =>
  mark.as("outline", CELL, [c.at], words);
const line = (c: ClueSight, words: string): Narration =>
  mark.as("stripes", whole(CELL), c.line, words);
/** "here": the ringed cell a placement decides. */
const here = (at: Point): Narration => mark.as("ring", CELL, [at], "here");

export const say = {
  /** Clue `c` sees every tower in its line, so height `n` sits at `at`. A
   * journey's later leg (`continues`) does not restate the premise its first
   * leg gave, only which clue and line it is still working along. */
  fullLine: (c: ClueSight, n: number, at: Point, continues: boolean): Narration =>
    continues
      ? phrase`Continuing up ${line(c, "the line")} from ${clue(c, `clue ${c.value}`)}, height ${n} can only sit ${here(at)}.`
      : phrase`${clue(c)} sees every tower in ${line(c, "this line")}, so heights must climb 1, 2, … from the clue: height ${n} can only sit ${here(at)}.`,

  tallestNearest: (c: ClueSight, n: number, at: Point): Narration =>
    phrase`${clue(c)} sees one tower, so the tallest must stand next to it, hiding the rest of ${line(c, "its line")}: height ${n} can only sit ${here(at)}.`,

  /** Two clues at the two ends of one line. */
  facing: (
    clues: readonly Point[],
    sight: readonly Point[],
    n: number,
    at: Point,
  ): Narration =>
    phrase`${mark.as("outline", CELL, clues, "These facing clues")} sum to one more than the grid size, pinning the tallest in ${mark.as("stripes", whole(CELL), sight, "their line")}: height ${n} can only sit ${here(at)}.`,

  // The strike arms below are premises, which the walk concludes with the move
  // it makes (`engine/hint-text.ts`'s `Premise`). The struck cells are named
  // there, by the notes the step rings.

  lineFull: (c: ClueSight, n: number): Narration =>
    phrase`${clue(c)} already sees all but one of its towers deeper in ${line(c, "the line")}, so the cell nearest the clue must be tall enough to keep everything between it and them hidden. Height ${n} is too short for that`,

  // "height N", never "a N": the article trap (docs/games/hints.md § "Name a
  // square by its value").
  lowerBound: (c: ClueSight, n: number): Narration =>
    phrase`${clue(c)} sees exactly ${c.value} towers along ${line(c, "its line")}; height ${n} so near it would hide too many`,

  arrangement: (c: ClueSight, n: number): Narration =>
    phrase`No way for ${clue(c, `clue ${c.value}`)} to show exactly ${c.value} towers along ${line(c, "its line")} puts height ${n} here`,

  /** The cull after a placement: the tower just placed, outlined. */
  dup: (placed: Point, n: number): Narration =>
    // The bare value, as the board shows it: right after its placement "the 3
    // just placed" needs no "height", and the qualified form ran over length.
    placedRulesOut({ px: placed.x, py: placed.y }, String(n)),

  /** Where the placement's cull strikes from. */
  dupWhere: "from the other cells there",

  single: (at: Point, n: number): Narration =>
    phrase`Every other height has been ruled out in ${thisCell(at)}, so it can only be ${n}.`,

  regionsFull: (at: Point, n: number): Narration =>
    phrase`${thisCell(at).capitalized()}'s row and column already hold every other height, so it can only be ${n}.`,

  hiddenSingle: (
    kind: "row" | "col",
    cells: readonly Point[],
    at: Point,
    n: number,
  ): Narration => {
    const name = kind === "row" ? "row" : "column";
    return phrase`In ${mark.this("stripes", whole(CELL), cells, name)}, height ${n} can go in only ${thisCell(at)}, since every other cell in the ${name} rules it out, so it must be ${n}.`;
  },

  set: (cells: readonly Point[], n: number): Narration =>
    phrase`${mark.the("outline", CELL, cells, "cell").capitalized()} already account for a fixed set of heights that includes ${n}`,

  // The shared chain sentence, in Towers' own vocabulary: the value needs no
  // qualifying here, because "two heights left" contextualizes the bare
  // numbers, and the numbered cells carry the chain.
  forcing: (
    reason: { chain: readonly ForcingLink[] },
    struck: Note,
    shares: "row" | "col",
  ): Narration =>
    forcingChainPremise(
      reason,
      struck,
      TOWERS_VOCAB,
      shares === "row" ? "row" : "column",
    ),
};
