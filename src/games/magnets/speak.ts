/**
 * Every sentence the Magnets hint speaks, as the description states it
 * (`magnets.description.yaml`'s `steps`).
 *
 * The deduction decides *which* sentence and *with what values*
 * ([`hint.ts`](./hint.ts)'s `tell`); the words are the description's. Each
 * function here takes what the board's reading found (a pole beside a square, a
 * line whose count is met, the far end of a tile) and supplies it to the step
 * of that name as the flags it is told by and the squares and clue digits it
 * points at. The squares a step decides are ringed (`ring`).
 */

import type { MarkKind, Sentence } from "../../engine/hint-words.ts";
import { type PlannedKind, plannedSentence } from "../../engine/stated.ts";
import { CLUE, LINE, type LineEl, SQUARE } from "./kinds.ts";
import { STEPS, type StepsById } from "./magnets.compiled.ts";
import { NEGATIVE, POSITIVE } from "./state.ts";

export type Axis = "row" | "column";

/** Why a pole cannot go at a square, as the board shows it. */
export type Cause =
  /** The pole already at `at`, beside the square. */
  | { kind: "touch"; at: number }
  /** The line's clue for the pole is met, `marked` when only by counting the
   * marked magnets lying along it. `line` tells two ends' lines apart; `clue`
   * is the digit met, and `hatched` the line when it is the one striped. */
  | {
      kind: "full";
      axis: Axis;
      line: number;
      marked: boolean;
      clue: number;
      hatched: LineEl | null;
    };

/** Why a square of a counted line cannot take the line's pole, as what that
 * pole there would do: touch its own kind or exceed the square's line's clue, or
 * force the opposite pole on the other end into one of those. Each carries the
 * marks that show it: the pole touched, or the clue digit met. */
export type RuleOut =
  | { kind: "touch"; at: readonly number[] }
  | { kind: "full"; axis: Axis; clues: readonly number[] }
  | { kind: "partnerTouch"; at: readonly number[] }
  /** The other end's met line, by where it lies from the line the sentence
   * counts: that line itself, the one beside it, or one across it. Two
   * parallel lines are never both "a column", since the player has to tell
   * which one the hatch is. */
  | { kind: "partnerFull"; axis: Axis; place: LinePlace; clues: readonly number[] };

/** What an `onlyEndLeft` step concludes: `squares` squares of tiles
 * crossing the line, or one end of a tile lying along it, with why its far
 * end (`far`) cannot take the pole. */
export type OnlyEnd =
  | { kind: "crosses"; squares: number }
  | { kind: "along"; why: RuleOut; far: number };

/** Where a line lies from the counted one. */
export type LinePlace = "same" | "beside" | "across";

/** The marks a sentence about a line points at: the line, the clue digits it
 * counts with, and the squares the step decides. */
export interface LineMarks {
  line: LineEl;
  clues: readonly number[];
  targets: readonly number[];
}

/** The squares a line's other squares are ruled out by, as a count premise
 * cites them. */
interface Elsewhere {
  why: readonly RuleOut[];
  ruled: readonly number[];
  tiles: number;
}

/** What a mark is drawn on: a square, a clue digit or a line. */
type Elem = number | LineEl;

/** What a reference to each sort the description's steps name is drawn on. */
const SORT_KINDS: Readonly<Record<string, MarkKind<Elem>>> = {
  ...Object.fromEntries(
    [
      "magnet",
      "touched",
      "otherTouched",
      "plusAt",
      "minusAt",
      "touchAt",
      "ruled",
      "marked",
      "far",
      "endAt",
    ].map((sort) => [sort, SQUARE as MarkKind<Elem>]),
  ),
  ...Object.fromEntries(
    ["clue", "otherClue", "fullClues", "endClue"].map((sort) => [
      sort,
      CLUE as MarkKind<Elem>,
    ]),
  ),
  line: LINE as MarkKind<Elem>,
};

type Steps = StepsById<Elem>;

/** The words of step `id`, over what the board's reading supplies. */
function speak<K extends keyof Steps & string>(
  id: K,
  terms: Steps[K]["terms"],
  marks: Steps[K]["marks"],
  ring: readonly number[],
): Sentence {
  return plannedSentence(
    STEPS[id] as unknown as PlannedKind<Steps[K]["terms"], Steps[K]["marks"]>,
    { terms, marks },
    { kind: SQUARE as MarkKind<Elem>, kinds: SORT_KINDS, ring, value: String },
  );
}

type Full = Cause & { kind: "full" };

const isPlus = (pole: number): boolean => pole === POSITIVE;
const isColumn = (axis: Axis): boolean => axis === "column";

/** The line a sentence names, striped when it is the one hatched. */
const hatchedLine = (c: Full): readonly LineEl[] => (c.hatched ? [c.hatched] : []);

/** A cause as the flags and marks that say it: a pole beside the square, or a
 * line's count met. */
function becauseOf(c: Cause) {
  const full = c.kind === "full";
  return {
    terms: {
      touch: !full,
      hatched: full && c.hatched !== null,
      col: full && isColumn(c.axis),
      marked: full && c.marked,
    },
    touched: full ? [] : [c.at],
    clue: full ? [c.clue] : [],
    line: full ? hatchedLine(c) : [],
  };
}

/** The squares the pole at a ruled-out square would do: its flags and the
 * squares and digits that name them, for a count premise's "; a + in an
 * outlined tile would …". */
function elsewhereOf({ why, ruled, tiles }: Elsewhere) {
  const kinds = (k: RuleOut["kind"]) => why.filter((r) => r.kind === k);
  const at = (rs: readonly RuleOut[]) => rs.flatMap((r) => ("at" in r ? r.at : []));
  const clues = (rs: readonly RuleOut[]) =>
    rs.flatMap((r) => ("clues" in r ? r.clues : []));
  const [touch, partnerTouch, full, partnerFull] = [
    kinds("touch"),
    kinds("partnerTouch"),
    kinds("full"),
    kinds("partnerFull"),
  ];
  return {
    terms: {
      rest: why.length > 0,
      tiles0: tiles === 0,
      tiles1: tiles === 1,
      touchAny: touch.length + partnerTouch.length > 0,
      touchOwn: touch.length > 0,
      touchPartner: partnerTouch.length > 0,
      fullAny: full.length + partnerFull.length > 0,
      fullOwn: full.length > 0,
      fullPartner: partnerFull.length > 0,
      fullMany: clues(full).length > 1,
    },
    ruled,
    touchAt: [...at(touch), ...at(partnerTouch)],
    fullClues: [...clues(full), ...clues(partnerFull)],
  };
}

export const say = {
  /** A marked magnet whose pole `banned` cannot go at this end, so the end
   * takes the other pole. `partner` is the magnet's other end. */
  magnetHere: (
    targets: readonly number[],
    partner: number,
    banned: number,
    cause: Cause,
  ): Sentence => {
    const { terms, touched, clue, line } = becauseOf(cause);
    return speak(
      "magnetHere",
      { plus: isPlus(banned), ...terms },
      { outline: { magnet: [partner], touched, clue }, stripes: { line } },
      targets,
    );
  },

  /** A marked magnet whose pole `banned` cannot go at the far end, so it goes
   * at this one. */
  magnetThere: (
    targets: readonly number[],
    partner: number,
    banned: number,
    cause: Cause,
  ): Sentence => {
    const { terms, touched, clue, line } = becauseOf(cause);
    return speak(
      "magnetThere",
      { plus: isPlus(banned), ...terms },
      { outline: { magnet: [partner], touched, clue }, stripes: { line } },
      targets,
    );
  },

  /** Both ends touch the same pole, at `at`. */
  bothEndsTouch: (
    targets: readonly number[],
    pole: number,
    at: readonly number[],
  ): Sentence =>
    speak(
      "bothEndsTouch",
      { plus: isPlus(pole) },
      { outline: { touched: at } },
      targets,
    ),

  /** The tile lies along a line whose `pole` count is met: a magnet there
   * would add one more. */
  alongFull: (targets: readonly number[], pole: number, c: Full): Sentence =>
    speak(
      "alongFull",
      { plus: isPlus(pole), hatched: c.hatched !== null, col: isColumn(c.axis) },
      { outline: { clue: [c.clue] }, stripes: { line: hatchedLine(c) } },
      targets,
    ),

  /** Each end is in its own line of one axis, both with their `pole` count
   * met. */
  bothInFull: (targets: readonly number[], pole: number, a: Full, b: Full): Sentence =>
    speak(
      "bothInFull",
      { plus: isPlus(pole), col: isColumn(a.axis) },
      { outline: { clue: [a.clue, b.clue] } },
      targets,
    ),

  /** Neither end can take `pole`, for a different reason at each. */
  neitherEnd: (
    targets: readonly number[],
    pole: number,
    one: Cause,
    two: Cause,
  ): Sentence => {
    // The touch first, so a mixed pair always reads the same way round.
    const [a, b] = one.kind === "touch" ? [one, two] : [two, one];
    const none = { touched: [], otherTouched: [], clue: [], otherClue: [] };
    const plus = isPlus(pole);
    if (a.kind === "full" && b.kind === "full") {
      const sameAxis = a.axis === b.axis;
      return speak(
        "neitherEnd",
        {
          plus,
          fullBoth: true,
          sameAxis,
          bTouch: false,
          hatched: false,
          col: isColumn(a.axis),
        },
        {
          outline: {
            ...none,
            clue: sameAxis ? [a.clue, b.clue] : [a.clue],
            otherClue: sameAxis ? [] : [b.clue],
          },
          stripes: { line: [] },
        },
        targets,
      );
    }
    if (a.kind !== "touch")
      throw new Error("magnets hint: a pair with no full line has a touch first");
    const bTouch = b.kind === "touch";
    return speak(
      "neitherEnd",
      {
        plus,
        fullBoth: false,
        sameAxis: false,
        bTouch,
        hatched: !bTouch && b.hatched !== null,
        col: !bTouch && isColumn(b.axis),
      },
      {
        outline: {
          ...none,
          touched: [a.at],
          otherTouched: bTouch ? [b.at] : [],
          clue: bTouch ? [] : [b.clue],
        },
        stripes: { line: bTouch ? [] : hatchedLine(b) },
      },
      targets,
    );
  },

  /** One end can take neither pole. */
  oneEndNeither: (targets: readonly number[], plus: Cause, minus: Cause): Sentence => {
    const none = { plusAt: [], minusAt: [], touched: [], clue: [], otherClue: [] };
    const flags = {
      plus: false,
      kindTouch: false,
      kindFull: false,
      sameAxis: false,
      hatched: false,
      col: false,
    };
    if (plus.kind === "touch" && minus.kind === "touch")
      return speak(
        "oneEndNeither",
        { ...flags, kindTouch: true },
        {
          outline: { ...none, plusAt: [plus.at], minusAt: [minus.at] },
          stripes: { line: [] },
        },
        targets,
      );
    if (plus.kind === "full" && minus.kind === "full") {
      const sameAxis = plus.axis === minus.axis;
      return speak(
        "oneEndNeither",
        {
          ...flags,
          kindFull: true,
          sameAxis,
          hatched: plus.hatched !== null,
          col: isColumn(plus.axis),
        },
        {
          outline: {
            ...none,
            clue: sameAxis ? [plus.clue, minus.clue] : [plus.clue],
            otherClue: sameAxis ? [] : [minus.clue],
          },
          stripes: { line: hatchedLine(plus) },
        },
        targets,
      );
    }
    const [touch, full, filled] =
      plus.kind === "touch"
        ? [plus, minus as Full, NEGATIVE]
        : [minus as Cause & { kind: "touch" }, plus as Full, POSITIVE];
    return speak(
      "oneEndNeither",
      {
        ...flags,
        plus: isPlus(filled),
        hatched: full.hatched !== null,
        col: isColumn(full.axis),
      },
      {
        outline: { ...none, touched: [touch.at], clue: [full.clue] },
        stripes: { line: hatchedLine(full) },
      },
      targets,
    );
  },

  /** Every empty square of the line needs a pole. */
  polesEverywhere: (m: LineMarks, axis: Axis): Sentence =>
    speak(
      "polesEverywhere",
      { col: isColumn(axis), k: m.clues.length },
      { outline: { clue: m.clues }, stripes: { line: [m.line] } },
      m.targets,
    ),

  /** The line has room for one more neutral square: none of its tiles
   * lying along it can be neutral. */
  oneNeutralLeft: (m: LineMarks, axis: Axis, tiles: number): Sentence =>
    speak(
      "oneNeutralLeft",
      { col: isColumn(axis), k: m.clues.length, one: tiles === 1 },
      { outline: { clue: m.clues }, stripes: { line: [m.line] } },
      m.targets,
    ),

  /** The line needs as many more `pole`s as it has undecided tiles. */
  everyDominoNeeded: (m: LineMarks, axis: Axis, pole: number, n: number): Sentence =>
    speak(
      "tilesNeeded",
      { plus: isPlus(pole), col: isColumn(axis), n },
      { outline: { clue: m.clues }, stripes: { line: [m.line] } },
      m.targets,
    ),

  /** The line needs `n` more `pole`s and has exactly `n` squares that can
   * still take one; `elsewhere` is why each of its other empty squares
   * cannot. */
  lineExact: (
    m: LineMarks,
    axis: Axis,
    pole: number,
    n: number,
    elsewhere: Elsewhere,
  ): Sentence => {
    const { terms, ruled, touchAt, fullClues } = elsewhereOf(elsewhere);
    return speak(
      "lineExact",
      {
        plus: isPlus(pole),
        col: isColumn(axis),
        n,
        one: n === 1,
        several: m.targets.length > 1,
        ...terms,
      },
      {
        outline: { clue: m.clues, ruled, touchAt, fullClues },
        stripes: { line: [m.line] },
      },
      m.targets,
    );
  },

  /** The line's clues are met, so every empty square in it is neutral: the
   * `neutralExact` premise with no marked magnet in the line to set aside. */
  noPolesLeft: (m: LineMarks, axis: Axis): Sentence =>
    speak(
      "noPolesLeft",
      { col: isColumn(axis), k: m.clues.length },
      { outline: { clue: m.clues }, stripes: { line: [m.line] } },
      m.targets,
    ),

  /** The line needs `n` more neutral squares and exactly `n` are not in
   * marked magnets, which are `marked`'s squares. */
  neutralExact: (
    m: LineMarks,
    axis: Axis,
    n: number,
    marked: readonly number[],
  ): Sentence =>
    speak(
      "neutralExact",
      { col: isColumn(axis), n },
      { outline: { clue: m.clues, marked }, stripes: { line: [m.line] } },
      m.targets,
    ),

  /** Every empty square in the line holds a pole, alternating, with one more
   * `pole` than its opposite: only the one odd-length gap can supply it. */
  oddGap: (m: LineMarks, axis: Axis, pole: number): Sentence =>
    speak(
      "oddGap",
      { plus: isPlus(pole), col: isColumn(axis) },
      { outline: { clue: m.clues }, stripes: { line: [m.line] } },
      m.targets,
    ),

  /** The line needs a `pole` from each tile that can still give one, and
   * `elsewhere` is why no other square of it can. `end` is what the step
   * concludes: the squares of the tiles crossing the line (each its tile's only
   * square in it), or one end of a tile lying along it and why its far end
   * cannot take the pole. */
  onlyEndLeft: (
    m: LineMarks,
    axis: Axis,
    pole: number,
    n: number,
    elsewhere: Elsewhere,
    end: OnlyEnd,
  ): Sentence => {
    const { terms, ruled, touchAt, fullClues } = elsewhereOf(elsewhere);
    const head = {
      plus: isPlus(pole),
      col: isColumn(axis),
      n,
      one: n === 1,
      ...terms,
    };
    const outline = { clue: m.clues, ruled, touchAt, fullClues };
    const stripes = { line: [m.line] };
    if (end.kind === "crosses")
      return speak(
        "onlyEndCrosses",
        { ...head, several: m.targets.length > 1 },
        { outline, stripes },
        m.targets,
      );
    const { why } = end;
    return speak(
      "onlyEndAlong",
      {
        ...head,
        endTouch: why.kind === "touch",
        endPartnerTouch: why.kind === "partnerTouch",
        // Said "its clue" where the one count met is the end's own line's.
        endOne: why.kind === "full" && why.clues.length === 1,
      },
      {
        outline: {
          ...outline,
          far: [end.far],
          endAt: "at" in why ? why.at : [],
          endClue: "clues" in why ? why.clues : [],
        },
        stripes,
      },
      m.targets,
    );
  },
};
