/**
 * Every sentence Numgame's hint speaks.
 *
 * Which step says what is `hint.ts`'s to decide, from the line it found; this
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

const operations = (n: number): string => (n === 1 ? "1 operation" : `${n} operations`);

/**
 * A step gives away one operation of the line and nothing more of it: how
 * few operations are left, which the solver's whole search proves, and one
 * of them. The rest of the line is the player's to find.
 */
export const say = {
  /** One operation of a shortest line of several. */
  step: (target: number, fewest: number, c: Combination): Sentence =>
    sentence({
      look: phrase`${String(target)} needs at least ${operations(fewest)}`,
      move: sum(c),
      relation: { kind: "oneOf" },
    }),

  /** The target is one combination away: nothing to say but the move. */
  last: (c: Combination): Sentence => unshaped(phrase`${sum(c)}, the target.`, "bare"),
};
