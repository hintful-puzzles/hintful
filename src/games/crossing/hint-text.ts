/**
 * Every sentence Crossing's hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values
 * (`hint-solver.ts`'s `narrateCrossing`, which reads the runs and numbers off
 * the puzzle); this file decides only how it reads. One firing, one sentence:
 * the indication (the pattern to learn to spot), then the premise, then the
 * forced action in the necessity voice.
 *
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the squares the step writes, the notes it rules out
 * and the listed number it writes in are the ring; the listed numbers that
 * still fit are outlined in the list; the run the sentence names is striped.
 */

import { indefinite, joinOr } from "../../engine/hint-text.ts";
import {
  CELL,
  type MarkKind,
  mark,
  type Narration,
  NOTE,
  type Note,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import type { CrossingFiring } from "./hint-solver.ts";

type Firing<K extends CrossingFiring["technique"]> = Extract<
  CrossingFiring,
  { technique: K }
>;

/** A number in the clue list, by its index there. */
export const LISTED: MarkKind<number> = { name: "listed number", key: String };

/** What a step marks, as its words name it. */
export interface Marked {
  /** The squares the move writes into. */
  targets: readonly Point[];
  /** The notes it rules out. */
  notes: readonly Note[];
  /** The cells of the run(s) the sentence names. */
  run: readonly Point[];
  /** A crossing's second run, named apart from the first. */
  otherRun: readonly Point[];
  /** The listed numbers that still fit (less `number`), and for a crossing
   * the second run's. */
  fitting: readonly number[];
  otherFitting: readonly number[];
  /** The listed number a whole-run placement writes in, or null. */
  number: number | null;
}

/** Whether a crossing's sentence leads with the across run: the tighter of
 * the two, among those allowing two digits or more. */
export function leadsAcross(f: Firing<"crossRuns">): boolean {
  const across = f.acrossDigits;
  const down = f.downDigits;
  return down.length < 2 || (across.length >= 2 && across.length <= down.length);
}

/** "across"/"down", the two words the board's own color wash already teaches. */
const way = (horizontal: boolean): string => (horizontal ? "across" : "down");

const thisSquare = (m: Marked): Narration =>
  mark.this("ring", CELL, m.targets, "square");
const thisRun = (m: Marked, words: string): Narration =>
  mark.as("stripes", CELL, m.run, words);
const fits = (m: Marked, words: string): Narration =>
  mark.as("outline", LISTED, m.fitting, words);
/** A whole-run placement's conclusion: the run's empty squares take the
 * listed number. */
const mustBe = (m: Marked, num: string): Narration =>
  phrase`${mark.as("ring", CELL, m.targets, "it")} must be ${mark.as("ring", LISTED, m.number === null ? [] : [m.number], num)}`;

export const say = {
  /** The run (`horizontal`, `len` squares) can only be `num`. */
  onlyNumber: (
    f: Firing<"onlyNumber">,
    len: number,
    num: string,
    m: Marked,
  ): Sentence => {
    const move = mustBe(m, num);
    // The fresh-board opener says nothing about entered digits: on an empty
    // run there are none, so that premise does no work and reads as plainly
    // false — the length is the whole argument there.
    if (f.because === "length") {
      return so({
        look: phrase`${thisRun(m, "This run")} is ${len} squares long, and only one number in the list is ${len} digits`,
        move,
      });
    }
    if (f.because === "used") {
      return so({
        look: phrase`Every other ${len}-digit number is already on the board`,
        follows: phrase`none can go in ${thisRun(m, "this run")}`,
        move,
      });
    }
    if (f.because === "notes") {
      const what = f.fill.length < len ? "digits and notes" : "notes";
      return so({
        look: phrase`Only one ${len}-digit number left fits the ${what} in ${thisRun(m, "this run")}`,
        move,
      });
    }
    return so({
      look: phrase`Only one ${len}-digit number left matches the digits already in ${thisRun(m, "this run")}`,
      move,
    });
  },

  sharedDigit: (f: Firing<"sharedDigit">, horizontal: boolean, m: Marked): Sentence =>
    so({
      look: phrase`Every ${fits(m, "number that still fits")} ${thisRun(m, `this ${way(horizontal)} run`)} has ${indefinite(String(f.digit))} ${f.digit} in ${thisSquare(m)}`,
      move: phrase`it must be ${f.digit}`,
    }),

  crossRuns: (f: Firing<"crossRuns">, m: Marked): Sentence => {
    // Lead with whichever run is the *tighter* constraint and let the other
    // knock out the rest: listing both sets in full is the same proof, but
    // one of them routinely runs to six digits and reads as noise. Only a set
    // of two or more can be led with — a singleton would leave "cannot take
    // here" — and the earlier rung guarantees one exists (a run that pinned
    // the square on its own is a `sharedDigit`, not this). `m.run` and
    // `m.fitting` are the lead run's.
    const leadAcross = leadsAcross(f);
    const [near, far] = leadAcross ? ["across", "down"] : ["down", "across"];
    const small = leadAcross ? f.acrossDigits : f.downDigits;
    return so({
      look: phrase`${thisRun(m, `The ${near} run's`)} ${fits(m, "numbers")} leave ${thisSquare(m)} only ${joinOr(small)}; ${mark.as("outline", LISTED, m.otherFitting, "those")} ${mark.as("stripes", CELL, m.otherRun, `of the ${far} run`)} rule out all but ${f.digit}`,
      move: phrase`it must be ${f.digit}`,
    });
  },

  /** Always two digits or more: a run leaving one would pin the square. */
  noteDigits: (f: Firing<"noteDigits">, horizontal: boolean, m: Marked): Sentence =>
    so({
      look: phrase`Every ${fits(m, "number that still fits")} ${thisRun(m, `this ${way(horizontal)} run`)} puts ${joinOr(f.digits)} in ${thisSquare(m)}`,
      move: phrase`note them`,
    }),

  noteStrike: (f: Firing<"noteStrike">, horizontal: boolean, m: Marked): Sentence => {
    const ds = joinOr(f.digits);
    const struck = mark.as("ring", NOTE, m.notes, (els) =>
      els.length === 1 ? "it" : "them",
    );
    return so({
      look: phrase`No ${fits(m, "number that still fits")} ${thisRun(m, `this ${way(horizontal)} run`)} puts ${f.digits.length === 1 ? `${indefinite(ds)} ${ds}` : ds} in ${thisSquare(m)}`,
      move: phrase`rule ${struck} out`,
    });
  },
};
