/**
 * Every sentence Salad's hint speaks that is Salad's own, and the words inside
 * them: the border clues, the empty-square counts, and the two setup steps in
 * Salad's words. The generic Latin arms are the engine's
 * (`engine/hint-text.ts`), spoken in {@link saladVocab}.
 *
 * The deduction decides which sentence and with what values (`hint.ts`'s
 * `narrate`); this file decides only how it reads. Salad's two modes speak two
 * vocabularies, so {@link say} takes the mode and returns its sentences in it.
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the square a step decides is ringed, the row or
 * column a sentence names is striped, and the squares and border clue it
 * reasons from are outlined (a clue by lighting its letter, {@link CLUE}).
 */

import {
  cleanObviousText,
  joinWith,
  type LatinVocab,
  thisCell,
} from "../../engine/hint-text.ts";
import {
  CELL,
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Sentence,
  sentence,
  so,
  whole,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { GAMEMODE_LETTERS, symbolChar } from "./state.ts";

/** A border clue, by its index round the board (`clueSide`): marked by drawing
 * its letter in the hint color. */
export const CLUE: MarkKind<number> = { name: "clue", key: (c) => String(c) };

/** What a mode calls a symbol — the one place Salad's two modes differ in words
 * rather than logic. */
const nounOf = (mode: number): string =>
  mode === GAMEMODE_LETTERS ? "letter" : "number";

/** Salad's value vocabulary for the shared generic-Latin narration arms. The
 * value past the `nums` symbols is the "might be empty" note, which prints as
 * the X the player pencils for it. */
export function saladVocab(mode: number, nums: number): LatinVocab {
  return {
    noun: nounOf(mode),
    value: (n) => (n > nums ? "X" : symbolChar(mode, n)),
    cell: "square",
  };
}

function count(k: number, one: string, many = `${one}s`): string {
  return `${k} ${k === 1 ? one : many}`;
}

type Side = "top" | "left" | "bottom" | "right";
type Line = "row" | "col";
type Squares = readonly Point[];

const axisName = (line: Line): string => (line === "row" ? "row" : "column");

/** "This row" / "this column", striped over the line's squares. */
const thisLine = (line: Line, cells: Squares): Narration =>
  mark.this("stripes", whole(CELL), cells, axisName(line));

/** The square a count leg settles, ringed, and the others it will settle after
 * it, which the words name but the leg does not ring: each leg of the journey
 * rings its own. */
const thisSquareAndTheRest = (at: Point): Narration =>
  phrase`${mark.this("ring", CELL, [at], "square")} and the rest of it`;

/** A border clue named by where the player sees it, as a sentence opener:
 * the line it looks along, striped, and the clue itself, lit. */
function clueName(side: Side, clue: number, line: Squares): Narration {
  const axis = side === "top" || side === "bottom" ? "col" : "row";
  const which =
    side === "top"
      ? "top clue"
      : side === "bottom"
        ? "bottom clue"
        : side === "left"
          ? "left-hand clue"
          : "right-hand clue";
  return phrase`${thisLine(axis, line).capitalized()}'s ${mark.as("outline", CLUE, [clue], which)}`;
}

/** A line's full quota of `k` empty squares, as the object of "already has".
 * Reads correctly at the degenerate extreme too: `nums = order − 1` leaves
 * exactly one empty square per line. */
function allItsHoles(k: number): string {
  if (k === 1) return "its one empty square";
  if (k === 2) return "both of its empty squares";
  return `all ${k} of its empty squares`;
}

/** Where a border clue's argument sits on the board: the clue, the line it
 * looks along, and the square the step decides. */
interface ClueAt {
  side: Side;
  clue: number;
  line: Squares;
}

/** Salad's sentences, in the vocabulary of the mode being played. */
export function say(mode: number) {
  const noun = nounOf(mode);
  const sym = (n: number): string => symbolChar(mode, n);
  const square = (at: Point): Narration => thisCell(at, "square");

  return {
    populate: `Start by penciling every candidate ${noun} into each empty square that has none yet, so there is something to cross out.`,

    cleanObvious: cleanObviousText(noun, "placed", "row or column", "square"),

    // The strike arms below are premises, which the walk concludes with the
    // move it makes (`engine/hint-text.ts`'s `Premise`).

    /** The clue sees `clueVal` first, and the `between` squares between it and
     * the one at `at` are empty: only `clueVal` can go there. */
    borderNear: (
      c: ClueAt,
      clueVal: number,
      between: Squares,
      at: Point,
    ): Narration => {
      const clue = sym(clueVal);
      const lead = phrase`${clueName(c.side, c.clue, c.line)} sees ${clue} first`;
      const k = between.length;
      // With nothing skipped, the square it decides is the whole run the clue
      // sees across, so it is outlined as the premise as well as ringed.
      const gap =
        k === 0
          ? phrase` and ${mark.as("outline", CELL, [at], "this square")} is nearest to it`
          : phrase`, and ${mark.as("outline", CELL, between, k === 1 ? "the square between" : `the ${count(k, "square")} between`)} ${k === 1 ? "is" : "are"} marked empty`;
      return phrase`${lead}${gap}, which leaves only ${clue} for ${square(at)}`;
    },

    /** The clue's own symbol cannot sit this far in: cut off at the square
     * `blockedAt`, known to hold a symbol, or past the `reach` its line's
     * `holes` allow, `tightenedBy` empties already marked beyond it. `run` is
     * the squares the symbol is kept to. */
    borderFar: (
      c: ClueAt,
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
      const clue = sym(p.clueVal);
      const named = clueName(c.side, c.clue, c.line);
      if (p.blockedAt) {
        return phrase`${named} sees ${clue} first, and ${mark.the("outline", CELL, [p.blockedAt], "square")} furthest from it already holds a ${noun}, which keeps the ${clue} somewhere in ${mark.the("outline", whole(CELL), p.run, "run")}`;
      }
      const bound =
        p.reach === 0
          ? mark.as("outline", CELL, p.run, "in the square nearest the clue")
          : mark.as(
              "outline",
              CELL,
              p.run,
              `within the first ${count(p.reach + 1, "square")} from the clue`,
            );
      // "later in the row", not "further along": the phrase this used to say is
      // the collection's word for a deduction the reader has to carry on by
      // themselves ("a contradiction further along", engine/hint-text.ts), and
      // `hint-quality.test.ts` forbids it for that reason. Here it meant a
      // *place* on the line, which the axis name says without the ambiguity.
      const tighten =
        p.tightenedBy > 0
          ? ` and ${p.tightenedBy === 1 ? "one of them is" : `${p.tightenedBy} of them are`} already marked later in the ${p.axis}`
          : ``;
      const axis = p.axis === "row" ? "row" : "col";
      return phrase`${named} sees ${clue} first, so every square before its ${clue} must be empty. ${thisLine(axis, c.line).capitalized()} has room for only ${count(p.holes, "empty square")}${tighten}, which keeps the ${clue} ${bound}`;
    },

    /** Where a far border strike crosses the clue's symbol out: past the
     * blocking square (`blocked`), or beyond the reach. */
    borderFarWhere: (blocked: boolean): string => (blocked ? "past it" : "beyond that"),

    /** The line `cells` already has all `k` of its empty squares; `at` is the
     * square the leg settles. */
    countHolesDone: (line: Line, cells: Squares, k: number, at: Point): Sentence =>
      so({
        look: phrase`${thisLine(line, cells)} already has ${allItsHoles(k)}`,
        move: phrase`${thisSquareAndTheRest(at)} must hold a ${noun}`,
      }),

    /** The line `cells`' `nums` symbols are all placed (`allPlaced`), or at
     * least their squares are known; `at` is the square the leg settles. */
    countLettersDone: (
      line: Line,
      cells: Squares,
      allPlaced: boolean,
      nums: number,
      at: Point,
    ): Sentence => {
      const theLine = thisLine(line, cells);
      // The two halves of one firing: either the line's symbols are all written
      // in, or we merely know *which* squares hold them (a line of balls). Each
      // claims only what it has.
      return so({
        look: allPlaced
          ? phrase`${nums === 1 ? `The one ${noun}` : nums === 2 ? `Both ${noun}s` : `All ${count(nums, noun)}`} of ${theLine} ${nums === 1 ? "is" : "are"} already placed`
          : phrase`We already know which ${nums === 1 ? "square" : count(nums, "square")} of ${theLine} ${nums === 1 ? `holds its ${noun}` : `hold its ${noun}s`}`,
        move: phrase`${thisSquareAndTheRest(at)} must be empty`,
      });
    },

    /** A count firing's later leg: the square `at`, settled by the same line
     * `cells` its first leg named, as `empty` or as holding a symbol. */
    countAgain: (line: Line, cells: Squares, at: Point, empty: boolean): Sentence =>
      sentence({
        move: phrase`${mark.this("ring", CELL, [at], "square")} must ${empty ? "be empty" : `hold a ${noun}`} too`,
        relation: {
          kind: "again",
          basis: mark.as("stripes", whole(CELL), cells, `the same ${axisName(line)}`),
        },
      }),

    crossNaked: (at: Point): Sentence =>
      so({
        look: phrase`Every ${noun} is ruled out here`,
        follows: phrase`the empty-square mark is the only one left`,
        move: phrase`${square(at)} must be empty`,
      }),

    /** The square at `at` has notes, and the empty-square mark is not among
     * them. */
    xNoteGone: (at: Point): Sentence =>
      // Not "has been crossed out": a player's own notes may never have held it.
      so({
        look: phrase`${square(at).capitalized()}'s pencil marks have no empty-square mark among them`,
        move: phrase`it must hold a ${noun}`,
      }),

    /** A set that rules a square out as empty: the outlined `cells` hold all
     * `k` empty squares of their `line`, and the symbols `also` struck from
     * the square with the mark. Kept short: it names a set, a count and two
     * kinds of mark. */
    setHoles: (
      cells: Squares,
      also: readonly number[],
      line: Line,
      k: number,
    ): Narration => {
      const symbols = also.length > 0 ? `${joinWith(also.map(sym))} and ` : "";
      const holes =
        k === 1
          ? "the one empty square"
          : k === 2
            ? "both empty squares"
            : `all ${k} empty squares`;
      return phrase`${mark.the("outline", CELL, cells, "square").capitalized()} account for ${symbols}${holes} of their ${axisName(line)}`;
    },

    /** What a set's strike calls the notes it crosses out of one square when
     * the empty-square mark is among them: the X it is penciled as, which is
     * how the shared sentences print it among a square's candidates. */
    setHolesStruck: (also: readonly number[]): string =>
      also.length > 0 ? `${joinWith(also.map(sym))} and the X here` : "the X here",

    /** The squares `cells`, just settled as holding a symbol, keep no
     * empty-square mark. */
    circleXNote: (cells: Squares): Narration =>
      phrase`${mark.this("ring", CELL, cells, "square").capitalized()} ${cells.length === 1 ? "is" : "are"} now known to hold a ${noun}`,

    /** What a strike of the "might be empty" note calls it, on `count` squares. */
    emptyMarks: (count: number): string =>
      count === 1 ? "its empty-square mark" : "their empty-square marks",
  };
}
