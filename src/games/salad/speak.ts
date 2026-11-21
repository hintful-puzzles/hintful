/**
 * Every sentence the Salad hint speaks that is Salad's own, as the description
 * states it (`salad.description.yaml`'s `steps`).
 *
 * The deduction decides *which* sentence and *with what values*
 * ([`hint.ts`](./hint.ts)'s `narrate` and `premise`); the words are the
 * description's. Each function here supplies a step of that name with the flags
 * it is told by and the squares and border clues it points at. The generic
 * Latin arms are the engine's (`engine/hint/hint-text.ts`), spoken in
 * {@link saladVocab}.
 *
 * Salad's two modes speak two vocabularies, so {@link say} takes the mode and
 * returns its sentences in it.
 */

import {
  CELL,
  type Narration,
  type Sentence,
} from "../../engine/contract/hint-words.ts";
import type { Point } from "../../engine/contract/types.ts";
import { cleanObviousText, type LatinVocab } from "../../engine/hint/hint-text.ts";
import { lineUnit } from "../../engine/hint/step-voice.ts";
import { voice, WORDS } from "../../generated/games/salad/salad.compiled.ts";
import { CLUE } from "./kinds.ts";
import { GAMEMODE_LETTERS, symbolChar } from "./state.ts";

type Line = "row" | "col";
type Squares = readonly Point[];

/** What a mark is drawn on: a square or a border clue. */
type Elem = Point | number;

/** What a mode calls a symbol. */
const nounOf = (mode: number): string =>
  mode === GAMEMODE_LETTERS ? "letter" : "number";

/** Salad's value vocabulary for the shared generic-Latin narration arms. The
 * value past the `nums` symbols is the "might be empty" note, which prints as
 * the X the player pencils for it. */
export function saladVocab(mode: number, nums: number): LatinVocab {
  return {
    noun: nounOf(mode),
    value: (n) => (n > nums ? "X" : symbolChar(mode, n)),
    cell: WORDS.cell,
  };
}

/** A count of `k` empty squares or symbols, as the words tell it apart. */
const countOf = (k: number) => ({ one: k === 1, two: k === 2, k });

/** Salad's sentences, in the vocabulary of the mode being played. */
export function say(mode: number) {
  const noun = nounOf(mode);
  const speak = voice<Elem>({
    kind: CELL,
    kinds: { clue: CLUE },
    value: (n) => symbolChar(mode, n),
    valueNoun: noun,
  });

  return {
    populate: speak.premise("populate", {}).text,

    cleanObvious: cleanObviousText(noun, "placed", "row or column", WORDS.cell),

    // The strike arms below are premises, which the walk concludes with the
    // move it makes (`engine/hint/hint-text.ts`'s `Premise`).

    /** The clue sees `clueVal` first, and the `between` squares between it and
     * the one at `at` are empty: only `clueVal` can go there. */
    borderNear: (
      clue: number,
      clueVal: number,
      between: Squares,
      at: Point,
    ): Narration => {
      // With nothing skipped, the square it decides is the whole run the clue
      // sees across, so it is outlined as the premise as well as ringed, and
      // named once, by its outline: the ring is its conclusion's.
      const skipped = between.length > 0;
      return speak.premise("borderNear", {
        ring: [at],
        terms: {
          clueV: clueVal,
          skipped,
          k: between.length,
          one: between.length === 1,
        },
        marks: { outline: { clue: [clue], between, at: skipped ? [] : [at] } },
      });
    },

    /** The clue's own symbol cannot sit this far in: cut off at the square
     * `blockedAt`, known to hold a symbol, or past the `reach` its line's
     * `holes` allow, `tightenedBy` empties already marked beyond it. `run` is
     * the squares the symbol is kept to. */
    borderFar: (
      clue: number,
      p: {
        axis: "row" | "column";
        clueVal: number;
        blockedAt: Point | null;
        reach: number;
        holes: number;
        tightenedBy: number;
        run: Squares;
      },
    ): Narration => {
      // Every square before the symbol a clue sees is empty (the help's rule),
      // so it comes after no more empty squares than the line has left.
      const room = p.holes - p.tightenedBy;
      return speak.premise("borderFar", {
        terms: {
          clueV: p.clueVal,
          blocked: p.blockedAt !== null,
          axis: p.axis,
          near: p.reach === 0,
          n: p.reach + 1,
          roomNone: room === 0,
          holesOne: p.holes === 1,
          room,
          roomOne: room === 1,
        },
        marks: {
          outline: {
            clue: [clue],
            blockedAt: p.blockedAt ? [p.blockedAt] : [],
            run: p.blockedAt ? [] : p.run,
          },
        },
      });
    },

    /** Where a far border strike crosses the clue's symbol out: past the
     * blocking square (`blocked`), or beyond the reach. */
    borderFarWhere: (blocked: boolean): string =>
      speak.part("borderFarWhere", "move", { terms: { blocked } }).text,

    /** The line `cells` already has all `k` of its empty squares; `at` is the
     * square the leg settles. */
    countHolesDone: (line: Line, cells: Squares, k: number, at: Point): Sentence =>
      speak.sentence("countHolesDone", {
        ring: [at],
        terms: { axis: lineUnit(line), ...countOf(k) },
        marks: { stripes: { line: cells } },
      }),

    /** The line `cells`' `nums` symbols are all placed (`allPlaced`), or at
     * least their squares are known; `at` is the square the leg settles. */
    countLettersDone: (
      line: Line,
      cells: Squares,
      allPlaced: boolean,
      nums: number,
      at: Point,
    ): Sentence =>
      speak.sentence("countLettersDone", {
        ring: [at],
        terms: {
          axis: lineUnit(line),
          allPlaced,
          nums,
          one: nums === 1,
          two: nums === 2,
        },
        marks: { stripes: { line: cells } },
      }),

    /** A count firing's later leg: the square `at`, settled by the same line
     * `cells` its first leg named, as `empty` or as holding a symbol. */
    countAgain: (
      line: Line,
      cells: Squares,
      at: Point,
      empty: boolean,
      allPlaced: boolean,
    ): Sentence =>
      empty
        ? speak.sentence("countLettersDone", {
            ring: [at],
            later: true,
            terms: { axis: lineUnit(line), allPlaced, nums: 0, one: false, two: false },
            marks: { stripes: { line: cells } },
          })
        : speak.sentence("countHolesDone", {
            ring: [at],
            later: true,
            terms: { axis: lineUnit(line), ...countOf(0) },
            marks: { stripes: { line: cells } },
          }),

    crossNaked: (at: Point): Sentence => speak.sentence("crossNaked", { ring: [at] }),

    /** The square at `at` has notes, and the empty-square mark is not among
     * them. */
    xNoteGone: (at: Point): Sentence => speak.sentence("xNoteGone", { ring: [at] }),

    /** A set that rules a square out as empty: the outlined `cells` hold all
     * `k` empty squares of their `line`, and the symbols `also` struck from
     * the square with the mark. Kept short: it names a set, a count and two
     * kinds of mark. */
    setHoles: (
      cells: Squares,
      also: readonly number[],
      line: Line,
      k: number,
    ): Narration =>
      speak.premise("setHoles", {
        struck: also,
        terms: { any: also.length > 0, axis: lineUnit(line), ...countOf(k) },
        marks: { outline: { set: cells } },
      }),

    /** What a set's strike calls the notes it crosses out of one square when
     * the empty-square mark is among them: the X it is penciled as, which is
     * how the shared sentences print it among a square's candidates. */
    setHolesStruck: (also: readonly number[]): string =>
      speak.part("setHolesStruck", "move", {
        struck: also,
        terms: { any: also.length > 0 },
      }).text,

    /** The squares `cells`, just settled as holding a symbol, keep no
     * empty-square mark. */
    circleXNote: (cells: Squares): Narration =>
      speak.premise("circleXNote", { ring: cells, terms: { one: cells.length === 1 } }),

    /** What a strike of the "might be empty" note calls it, on `count` squares. */
    emptyMarks: (count: number): string =>
      speak.part("emptyMarks", "move", { terms: { one: count === 1 } }).text,
  };
}
