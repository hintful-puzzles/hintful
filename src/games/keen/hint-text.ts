/**
 * Every sentence Keen's hint speaks that is Keen's own: the cage arithmetic.
 * The generic Latin arms are the engine's (`engine/hint-text.ts`), which Keen
 * speaks unchanged, and so are the two setup steps, built by the row/column
 * preset from the two words Keen gives it (`index.ts`'s `notes`).
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads.
 */

import { indefinite, joinOr, thisCell } from "../../engine/hint-text.ts";
import { CELL, mark, type Narration, phrase, whole } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import { C_ADD, C_DIV, C_MUL, C_SUB } from "./state.ts";

/** The cage's arithmetic goal as a verb phrase, read off its packed clue — the
 * indication a cage deduction leads with (docs/games/hints.md § "Lead with the indication"). Reads across the
 * whole operation set: `sum to 15`, `multiply to 72`, `differ by 3`,
 * `have a ratio of 2`. */
function cageGoal(op: number, value: number): string {
  switch (op) {
    case C_ADD:
      return `sum to ${value}`;
    case C_MUL:
      return `multiply to ${value}`;
    case C_SUB:
      return `differ by ${value}`;
    case C_DIV:
      return `have a ratio of ${value}`;
    default:
      return `total ${value}`;
  }
}

/** "this cage", striped over its cells. */
const thisCage = (cage: readonly Point[]): Narration =>
  mark.this("stripes", whole(CELL), cage, "cage");

/** A cage deduction's premise; the walk concludes it with the move it makes
 * (`engine/hint-text.ts`'s `Premise`). */
export const say = {
  /** No way to fill `cage` (operator `op`, target `value`) leaves room for `ns`
   * in the struck cell `at`. */
  cage: (
    cage: readonly Point[],
    op: number,
    value: number,
    ns: number[],
    at: Point,
  ): Narration =>
    phrase`No way to make ${thisCage(cage)} ${cageGoal(op, value)} puts ${joinOr(ns)} in ${thisCell(at)}`,

  /** Every way to fill `cage` places `n` in the row (`horizontal`) or column
   * the cage lies along. */
  cageLine: (
    cage: readonly Point[],
    op: number,
    value: number,
    n: number,
    horizontal: boolean,
  ): Narration =>
    phrase`${thisCage(cage).capitalized()} must ${cageGoal(op, value)}, and every way to fill it places ${indefinite(String(n))} ${n} in its ${horizontal ? "row" : "column"}`,
};
