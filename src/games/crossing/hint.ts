/**
 * Crossing's hint words: one firing (`solver.ts`), one sentence, a step of
 * `crossing.description.yaml` spoken through its voice. {@link narrateCrossing}
 * reads the runs and numbers the sentence names off the puzzle.
 */

import { joinWith } from "../../engine/hint-text.ts";
import {
  CELL,
  type MarkKind,
  mark,
  NOTE,
  phrase,
  type Sentence,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import * as crossing from "../../generated/games/crossing/crossing.compiled.ts";
import { LISTED } from "./hint-marks.ts";
import type { CrossingFiring } from "./solver.ts";
import type { CrossingPuzzle } from "./state.ts";

type Firing<K extends CrossingFiring["technique"]> = Extract<
  CrossingFiring,
  { technique: K }
>;

/** What a step marks: a square, a note in one, or a listed number. */
type Marked = Point | number;

/** The steps, spoken: a mark is drawn on a square unless its sort is a listed
 * number, and a value is a digit. */
const speak = crossing.voice<Marked>({
  kind: CELL as MarkKind<Marked>,
  kinds: {
    number: LISTED as MarkKind<Marked>,
    fitting: LISTED as MarkKind<Marked>,
    otherFitting: LISTED as MarkKind<Marked>,
  },
  value: String,
});

/** Whether a crossing's sentence leads with the across run: the tighter of
 * the two, among those allowing two digits or more. Listing both sets in full
 * is the same proof, but one of them routinely runs to six digits and reads as
 * noise; a set of one cannot be led with, and the earlier rung guarantees one
 * of two or more (a run that pinned the square alone is a `sharedDigit`). */
function leadsAcross(f: Firing<"crossRuns">): boolean {
  const across = f.acrossDigits;
  const down = f.downDigits;
  return down.length < 2 || (across.length >= 2 && across.length <= down.length);
}

const way = (horizontal: boolean): "across" | "down" =>
  horizontal ? "across" : "down";

/** The step `onlyNumber` is told as, by why only one number fits. */
const ONLY = {
  length: "onlyByLength",
  used: "onlyUnused",
  notes: "onlyByNotes",
  digits: "onlyByDigits",
} as const;

/** One firing, in one sentence: which one, with the run's length, direction
 * and number read off the puzzle. */
export function narrateCrossing(puzzle: CrossingPuzzle, f: CrossingFiring): Sentence {
  const at = (i: number): Point => ({ x: i % puzzle.w, y: Math.floor(i / puzzle.w) });
  const runCells = (r: number): Point[] => puzzle.runs[r].cells.map(at);
  const num = (k: number): number => Number(puzzle.numbers[k].join(""));
  switch (f.technique) {
    case "onlyNumber": {
      const len = puzzle.runs[f.run].cells.length;
      const said = {
        ring: { square: f.fill.map(at), number: [f.number] },
        marks: { stripes: { run: runCells(f.run) } },
      };
      const terms = { len, num: num(f.number) };
      return f.because === "notes"
        ? speak.sentence(ONLY.notes, {
            ...said,
            terms: { ...terms, partial: f.fill.length < len },
          })
        : speak.sentence(ONLY[f.because], { ...said, terms });
    }
    case "onlyRun":
      return speak.sentence("onlyRun", {
        ring: { square: f.fill.map(at), number: [f.number] },
        terms: { num: num(f.number), many: f.others > 1 },
        marks: {
          stripes: { run: runCells(f.run) },
          outline: { against: f.against.map(at) },
        },
      });
    case "sharedDigit":
      return speak.sentence("sharedDigit", {
        ring: [at(f.cell)],
        terms: { way: way(puzzle.runs[f.run].horizontal), d: f.digit },
        marks: { stripes: { run: runCells(f.run) }, outline: { fitting: f.fitting } },
      });
    case "crossRuns": {
      const across = leadsAcross(f);
      return speak.sentence("crossRuns", {
        ring: [at(f.cell)],
        terms: {
          way: across ? "across" : "down",
          far: across ? "down" : "across",
          d: f.digit,
          small: across ? f.acrossDigits : f.downDigits,
        },
        marks: {
          stripes: {
            run: runCells(across ? f.acrossRun : f.downRun),
            other: runCells(across ? f.downRun : f.acrossRun),
          },
          outline: {
            fitting: across ? f.acrossFitting : f.downFitting,
            otherFitting: across ? f.downFitting : f.acrossFitting,
          },
        },
      });
    }
    case "noteDigits":
      return speak.sentence("noteDigits", {
        ring: [at(f.cell)],
        terms: { way: way(puzzle.runs[f.run].horizontal), ds: f.digits },
        marks: { stripes: { run: runCells(f.run) }, outline: { fitting: f.fitting } },
      });
    case "noteStrike": {
      const notes = f.digits.map((n) => ({ ...at(f.cell), n }));
      // Named by value though the premise just did: "it" is no thing on the
      // board.
      const struck = mark.as("strike", NOTE, notes, (els) => {
        const ns = [...new Set(els.map((e) => e.n))].sort((a, b) => a - b);
        return ns.length === 1 ? `the ${ns[0]}` : joinWith(ns.map(String));
      });
      return speak.sentence("noteStrike", {
        ring: [at(f.cell)],
        terms: { way: way(puzzle.runs[f.run].horizontal), one: f.digits.length === 1 },
        marks: { stripes: { run: runCells(f.run) }, outline: { fitting: f.fitting } },
        struck: f.digits,
        closing: phrase`${struck} must go`,
      });
    }
  }
}
