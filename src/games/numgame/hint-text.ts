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
  type Relation,
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

/** How few operations are left, which the solver's whole search proves. The
 * target is on the board, so the words do not repeat it; and not "this can be
 * solved", since a "this" in a hint points at a mark. */
const solvedIn = (n: number): string =>
  `You can finish in ${n} more ${n === 1 ? "operation" : "operations"}`;

/**
 * A step gives away one operation of the line and nothing more of it: how
 * few operations are left, how many ways there are to start, and one of
 * them. The rest of the line is the player's to find. The relation is the
 * rival judging's own, so "so" is said only where every other start was
 * proved to need more operations.
 */
export const say = {
  /** One of several ways to start a shortest line; `ways` counts boards, so
   * two equal numbers used alike are one way. */
  starts: (
    fewest: number,
    ways: number,
    c: Combination,
    relation: Relation,
  ): Sentence =>
    sentence({
      look: phrase`${solvedIn(fewest)}, starting ${String(ways)} ways`,
      move: sum(c),
      relation,
    }),

  /** The one way to start a shortest line. */
  onlyStart: (fewest: number, c: Combination, relation: Relation): Sentence =>
    sentence({
      look: phrase`${solvedIn(fewest)}, and only one first combination does it`,
      move: sum(c),
      relation,
    }),

  /** The target is one combination away: nothing to say but the move. */
  last: (c: Combination): Sentence => unshaped(phrase`${sum(c)}, the target.`, "bare"),
};
