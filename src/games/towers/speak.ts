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
 * (`engine/hint-words.ts`): a clue is outlined in its slot beside the grid, the
 * line it sees along is striped through both clue slots, and the cell a
 * placement decides is ringed ("this cell").
 */

import type { LatinVocab } from "../../engine/hint-text.ts";
import {
  CELL,
  type MarkKind,
  type Narration,
  type Sentence,
} from "../../engine/hint-words.ts";
import {
  type PlannedKind,
  plannedSentence,
  type StatedContext,
  statedParts,
} from "../../engine/stated.ts";
import type { Point } from "../../engine/types.ts";
import { STEPS, type StepsById, WORDS } from "./towers.compiled.ts";

/** A clue and the line it sees along, as the sentence names them: the clue's
 * slot (`at`, outlined) and its line of sight through both clue slots
 * (`line`, striped). */
export interface ClueSight {
  value: number;
  at: Point;
  line: readonly Point[];
}

type Steps = StepsById<Point>;
type Squares = readonly Point[];

/** What a reference to each sort the description's steps name is drawn on: all
 * of them cells (a clue's slot is one, beside the grid). */
const KINDS: Readonly<Record<string, MarkKind<Point>>> = Object.fromEntries(
  ["clue", "clues", "line", "set"].map((sort) => [sort, CELL as MarkKind<Point>]),
);

const contextOf = (
  ring: Squares,
  said: Pick<StatedContext<Point>, "terms" | "marks">,
  later = false,
) => ({
  kind: CELL as MarkKind<Point>,
  kinds: KINDS,
  ring,
  value: String,
  noun: WORDS.cell,
  later,
  ...said,
});

/** The words of step `id`, for the cell(s) `ring` it decides. */
function speak<K extends keyof Steps & string>(
  id: K,
  ring: Squares,
  terms: Steps[K]["terms"],
  marks: Steps[K]["marks"],
  later = false,
): Sentence {
  return plannedSentence(
    STEPS[id] as unknown as PlannedKind<Steps[K]["terms"], Steps[K]["marks"]>,
    { terms, marks },
    contextOf(ring, { terms, marks: {} }, later),
  );
}

/** What a step reads off the board, as a strike's premise: the `look` of the
 * wording that holds. */
function looks<K extends keyof Steps & string>(
  id: K,
  ring: Squares,
  terms: Steps[K]["terms"],
  marks: Steps[K]["marks"],
): Narration {
  const kind = STEPS[id] as unknown as PlannedKind<
    Steps[K]["terms"],
    Steps[K]["marks"]
  >;
  const i = kind.when.findIndex((w) => w === null || w(terms, marks));
  const { look } = statedParts(kind.clauses[i], {
    ...contextOf(ring, {
      terms: terms as Readonly<Record<string, unknown>>,
      marks: marks as StatedContext<Point>["marks"],
    }),
    at: () => {
      throw new Error("a planned step has no element terms");
    },
  });
  if (look === undefined) throw new Error(`Towers' ${id} states no look`);
  return look;
}

const clueMarks = (c: ClueSight) => ({
  outline: { clue: [c.at] },
  stripes: { line: c.line },
});

export const say = {
  /** Clue `c` sees every tower in its line, so height `n` sits at `at`. A
   * journey's later leg (`continues`) does not restate the premise its first
   * leg gave, only which clue and line it is still working along. */
  fullLine: (c: ClueSight, n: number, at: Point, continues: boolean): Sentence =>
    speak("fullLine", [at], { v: c.value, n }, clueMarks(c), continues),

  tallestNearest: (c: ClueSight, n: number, at: Point): Sentence =>
    speak("tallestNearest", [at], { v: c.value, n }, clueMarks(c)),

  /** Two clues at the two ends of one line. */
  facing: (clues: Squares, sight: Squares, n: number, at: Point): Sentence =>
    speak("facing", [at], { n }, { outline: { clues }, stripes: { line: sight } }),

  // The strike arms below are premises, which the walk concludes with the move
  // it makes (`engine/hint-text.ts`'s `Premise`). The struck cells are named
  // there, by the notes the step rings.

  lineFull: (c: ClueSight, n: number): Narration =>
    looks("lineFull", [], { v: c.value, seen: c.value - 1, n }, clueMarks(c)),

  lowerBound: (c: ClueSight, n: number): Narration =>
    looks("lowerBound", [], { v: c.value, n }, clueMarks(c)),

  arrangement: (c: ClueSight, n: number, at: Point): Narration =>
    looks("arrangement", [at], { v: c.value, n }, clueMarks(c)),

  hiddenSingle: (kind: "row" | "col", cells: Squares, at: Point, n: number): Sentence =>
    speak(
      "hiddenSingle",
      [at],
      { col: kind === "col", n },
      { stripes: { line: cells } },
    ),

  set: (cells: Squares, n: number): Narration =>
    looks("set", [], { n }, { outline: { set: cells } }),
};

/** Towers' values in the engine's sentences: heights, bare where a confined
 * height or a wing's is said twice, since the qualified sentence runs past
 * the narration limit. */
export const TOWERS_VOCAB: LatinVocab = {
  noun: "height",
  cell: WORDS.cell,
  value: String,
};
