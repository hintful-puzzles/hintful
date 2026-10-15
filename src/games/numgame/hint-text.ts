/**
 * Every sentence Numgame's hint speaks.
 *
 * Which step says what is `hint.ts`'s to decide, from the plan it found; this
 * file decides only how it reads.
 */

import type { HintMarkLegend } from "../../engine/game.ts";
import {
  type MarkKind,
  mark,
  type Narration,
  phrase,
  type Sentence,
  sentence,
  unshaped,
} from "../../engine/hint-words.ts";
import type { Op } from "./solver.ts";
import { OP_SIGN } from "./state.ts";

/** A number on the board, by its place. */
export const TILE: MarkKind<number> = { name: "tile", key: String };

/** An operator's button. */
export const SIGN: MarkKind<Op> = { name: "sign", key: String };

/** What each mark means here, as the help's list of marks gives it. */
export const HINT_MARKS: HintMarkLegend = {
  roles: {
    ring: "the two numbers to combine, and the operator to combine them with.",
  },
};

/** One combination as the step names it: the two numbers and the operator,
 * each ringed, and what they make. */
export interface Combination {
  readonly from: { readonly place: number; readonly value: number };
  readonly op: Op;
  readonly into: { readonly place: number; readonly value: number };
  readonly makes: number;
}

/** The larger number first, as the board writes a made number. */
const sum = (c: Combination): Narration => {
  const [hi, lo] = c.from.value >= c.into.value ? [c.from, c.into] : [c.into, c.from];
  return phrase`${mark.as("ring", TILE, [hi.place], String(hi.value))} ${mark.as("ring", SIGN, [c.op], OP_SIGN[c.op])} ${mark.as("ring", TILE, [lo.place], String(lo.value))} = ${String(c.makes)}`;
};

/** The split as the board writes a sum: `927 + 25`. */
const splitText = (s: Split): string => `${s.a} ${OP_SIGN[s.op]} ${s.b}`;

/** The combination, and the half of the split it builds: toward that half,
 * or, where it makes the half, the split it is for. */
const toward = (c: Combination, split: Split, half: number): Narration =>
  c.makes === half
    ? phrase`${sum(c)}, for ${splitText(split)}`
    : phrase`${sum(c)}, toward ${String(half)}`;

const operations = (n: number): string => (n === 1 ? "1 operation" : `${n} operations`);

/** The split a shortest line ends with: the target as `a op b`. */
export interface Split {
  readonly target: number;
  readonly fewest: number;
  readonly a: number;
  readonly op: Op;
  readonly b: number;
}

/**
 * Every step reads as a leg of one line: the first says how few operations
 * the target takes and how the line's last one splits it, and each leg after
 * says which half it builds. A count of operations is the solver's whole
 * search, so "at least" is proved, never estimated.
 */
export const say = {
  /** The first combination of a line of several. */
  first: (split: Split, c: Combination, half: number): Sentence =>
    sentence({
      look: phrase`${String(split.target)} needs at least ${operations(split.fewest)}, ending with ${splitText(split)}`,
      move: toward(c, split, half),
      relation: { kind: "sequence", at: "first" },
    }),

  /** A combination between the first and the last. */
  next: (split: Split, c: Combination, half: number): Sentence =>
    sentence({
      move: toward(c, split, half),
      relation: { kind: "sequence", at: "next" },
    }),

  /** The combination that makes the target, after others. */
  last: (c: Combination): Sentence =>
    sentence({
      move: phrase`${sum(c)}, the target`,
      relation: { kind: "sequence", at: "last" },
    }),

  /** The target is one combination away: nothing to say but the move. */
  only: (c: Combination): Sentence => unshaped(phrase`${sum(c)}, the target.`, "bare"),
};
