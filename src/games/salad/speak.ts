/**
 * Every sentence the Salad hint speaks that is Salad's own, as the description
 * states it (`salad.description.yaml`'s `steps`).
 *
 * The deduction decides *which* sentence and *with what values*
 * ([`hint.ts`](./hint.ts)'s `narrate` and `premise`); the words are the
 * description's. Each function here supplies a step of that name with the flags
 * it is told by and the squares and border clues it points at. The generic
 * Latin arms are the engine's (`engine/hint-text.ts`), spoken in
 * {@link saladVocab}.
 *
 * Salad's two modes speak two vocabularies, so {@link say} takes the mode and
 * returns its sentences in it.
 */

import { cleanObviousText, type LatinVocab } from "../../engine/hint-text.ts";
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
import { CLUE } from "./kinds.ts";
import { STEPS, type StepsById, WORDS } from "./salad.compiled.ts";
import { GAMEMODE_LETTERS, symbolChar } from "./state.ts";

type Line = "row" | "col";
type Squares = readonly Point[];

/** What a mark is drawn on: a square or a border clue. */
type Elem = Point | number;
type Steps = StepsById<Elem>;

/** What a reference to each sort the description's steps name is drawn on. */
const SORT_KINDS: Readonly<Record<string, MarkKind<Elem>>> = {
  ...Object.fromEntries(
    ["line", "between", "at", "blockedAt", "run", "set"].map((sort) => [
      sort,
      CELL as MarkKind<Elem>,
    ]),
  ),
  clue: CLUE as MarkKind<Elem>,
};

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

/** What a step is spoken in: the mode's words, the squares it decides, and the
 * values its strike names. */
interface Voice {
  mode: number;
  ring?: Squares;
  later?: boolean;
  struck?: readonly number[];
}

function contextOf(v: Voice, said: Pick<StatedContext<Elem>, "terms" | "marks">) {
  return {
    kind: CELL as MarkKind<Elem>,
    kinds: SORT_KINDS,
    ring: v.ring ?? [],
    value: (n: number) => symbolChar(v.mode, n),
    valueNoun: nounOf(v.mode),
    noun: WORDS.cell,
    ...(v.later === undefined ? {} : { later: v.later }),
    ...(v.struck === undefined ? {} : { struck: v.struck }),
    ...said,
  };
}

/** The words of step `id`, over what the board's reading supplies. */
function speak<K extends keyof Steps & string>(
  id: K,
  v: Voice,
  terms: Steps[K]["terms"],
  marks: Steps[K]["marks"],
): Sentence {
  return plannedSentence(
    STEPS[id] as unknown as PlannedKind<Steps[K]["terms"], Steps[K]["marks"]>,
    { terms, marks },
    contextOf(v, { terms, marks: {} }),
  );
}

/** What a step reads off the board, for a strike's premise: the `look` of the
 * wording that holds. */
function looks<K extends keyof Steps & string>(
  id: K,
  v: Voice,
  terms: Steps[K]["terms"],
  marks: Steps[K]["marks"],
): Narration {
  const kind = STEPS[id] as unknown as PlannedKind<
    Steps[K]["terms"],
    Steps[K]["marks"]
  >;
  const i = kind.when.findIndex((w) => w === null || w(terms, marks));
  const { look } = statedParts(kind.clauses[i], {
    ...contextOf(v, {
      terms: terms as Readonly<Record<string, unknown>>,
      marks: marks as StatedContext<Elem>["marks"],
    }),
    at: () => {
      throw new Error("a planned step has no element terms");
    },
  });
  if (look === undefined) throw new Error(`Salad's ${id} states no look`);
  return look;
}

/** A fragment a strike's sentence joins to its own words: the `move` of the
 * wording that holds, as plain text. */
function fragment<K extends keyof Steps & string>(
  id: K,
  v: Voice,
  terms: Steps[K]["terms"],
): string {
  const kind = STEPS[id] as unknown as PlannedKind<
    Steps[K]["terms"],
    Steps[K]["marks"]
  >;
  const i = kind.when.findIndex((w) => w === null || w(terms, {} as Steps[K]["marks"]));
  const { move } = statedParts(kind.clauses[i], {
    ...contextOf(v, { terms: terms as Readonly<Record<string, unknown>>, marks: {} }),
    at: () => {
      throw new Error("a planned step has no element terms");
    },
  });
  if (move === undefined) throw new Error(`Salad's ${id} states no fragment`);
  return move.text;
}

/** A count of `k` empty squares or symbols, as the words tell it apart. */
const countOf = (k: number) => ({ one: k === 1, two: k === 2, k });

/** Salad's sentences, in the vocabulary of the mode being played. */
export function say(mode: number) {
  const noun = nounOf(mode);
  const v = (ring?: Squares): Voice => ({
    mode,
    ...(ring === undefined ? {} : { ring }),
  });

  return {
    populate: looks("populate", v(), {}, {}).text,

    cleanObvious: cleanObviousText(noun, "placed", "row or column", WORDS.cell),

    // The strike arms below are premises, which the walk concludes with the
    // move it makes (`engine/hint-text.ts`'s `Premise`).

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
      return looks(
        "borderNear",
        v([at]),
        { clueV: clueVal, skipped, k: between.length, one: between.length === 1 },
        {
          outline: {
            clue: [clue],
            between,
            at: skipped ? [] : [at],
          },
        },
      );
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
      return looks(
        "borderFar",
        v(),
        {
          clueV: p.clueVal,
          blocked: p.blockedAt !== null,
          col: p.axis === "column",
          near: p.reach === 0,
          n: p.reach + 1,
          roomNone: room === 0,
          holesOne: p.holes === 1,
          room,
          roomOne: room === 1,
        },
        {
          outline: {
            clue: [clue],
            blockedAt: p.blockedAt ? [p.blockedAt] : [],
            run: p.blockedAt ? [] : p.run,
          },
        },
      );
    },

    /** Where a far border strike crosses the clue's symbol out: past the
     * blocking square (`blocked`), or beyond the reach. */
    borderFarWhere: (blocked: boolean): string =>
      fragment("borderFarWhere", v(), { blocked }),

    /** The line `cells` already has all `k` of its empty squares; `at` is the
     * square the leg settles. */
    countHolesDone: (line: Line, cells: Squares, k: number, at: Point): Sentence =>
      speak(
        "countHolesDone",
        v([at]),
        { col: line === "col", ...countOf(k) },
        { stripes: { line: cells } },
      ),

    /** The line `cells`' `nums` symbols are all placed (`allPlaced`), or at
     * least their squares are known; `at` is the square the leg settles. */
    countLettersDone: (
      line: Line,
      cells: Squares,
      allPlaced: boolean,
      nums: number,
      at: Point,
    ): Sentence =>
      speak(
        "countLettersDone",
        v([at]),
        { col: line === "col", allPlaced, nums, one: nums === 1, two: nums === 2 },
        { stripes: { line: cells } },
      ),

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
        ? speak(
            "countLettersDone",
            { ...v([at]), later: true },
            { col: line === "col", allPlaced, nums: 0, one: false, two: false },
            { stripes: { line: cells } },
          )
        : speak(
            "countHolesDone",
            { ...v([at]), later: true },
            { col: line === "col", ...countOf(0) },
            { stripes: { line: cells } },
          ),

    crossNaked: (at: Point): Sentence => speak("crossNaked", v([at]), {}, {}),

    /** The square at `at` has notes, and the empty-square mark is not among
     * them. */
    xNoteGone: (at: Point): Sentence => speak("xNoteGone", v([at]), {}, {}),

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
      looks(
        "setHoles",
        { ...v(), struck: also },
        { any: also.length > 0, col: line === "col", ...countOf(k) },
        { outline: { set: cells } },
      ),

    /** What a set's strike calls the notes it crosses out of one square when
     * the empty-square mark is among them: the X it is penciled as, which is
     * how the shared sentences print it among a square's candidates. */
    setHolesStruck: (also: readonly number[]): string =>
      fragment("setHolesStruck", { ...v(), struck: also }, { any: also.length > 0 }),

    /** The squares `cells`, just settled as holding a symbol, keep no
     * empty-square mark. */
    circleXNote: (cells: Squares): Narration =>
      looks("circleXNote", v(cells), { one: cells.length === 1 }, {}),

    /** What a strike of the "might be empty" note calls it, on `count` squares. */
    emptyMarks: (count: number): string =>
      fragment("emptyMarks", v(), { one: count === 1 }),
  };
}
