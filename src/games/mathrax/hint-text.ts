/**
 * Every sentence Mathrax's hint speaks that is Mathrax's own: the clue at an
 * interior intersection, read three ways. The generic Latin arms (naked and
 * hidden singles, the placement cull, set elimination, forcing chains) are the
 * engine's, `engine/hint-text.ts`, and so are the two setup steps, built by the
 * row/column preset from the two words Mathrax gives it (`index.ts`'s `notes`).
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads.
 *
 * **A clue's operation is stated in words, not left to its glyph.** `7+` on the
 * board says which clue, and the sentence names it so the player can point at
 * it — but "add to 7" is the technique, and a hint that only cites the glyph
 * teaches nothing the board did not already show (docs/games/hints.md
 * § "Lead with the indication"). The rules are in `help/games/mathrax.md` too;
 * one clause per step is what earns its room here.
 *
 * The subtraction arms read correctly at the degenerate value: a `0−` clue is
 * the `=` clue and means "equal", never "differ by 0" (docs/games/hints.md
 * § "Sanity-read at the degenerate extremes"). Division has no such value: the
 * desc reader in `state.ts` refuses a quotient of 1.
 */

import { joinOr, thisCell } from "../../engine/hint-text.ts";
import { CELL, mark, type Narration, phrase } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import {
  CLUE_ADD,
  CLUE_DIV,
  CLUE_MUL,
  CLUE_SUB,
  clueLabel,
  clueNum,
  clueType,
} from "./state.ts";

/**
 * What the two cells on a clue's diagonal must do, as a clause following them:
 * "this cell and the 3 across it **add to 7**".
 */
function diagonalRule(clue: number): string {
  const n = clueNum(clue);
  switch (clueType(clue)) {
    case CLUE_ADD:
      return `add to ${n}`;
    case CLUE_SUB:
      return n ? `differ by ${n}` : "are equal";
    case CLUE_MUL:
      return `multiply to ${n}`;
    case CLUE_DIV:
      return `divide to give ${n}`;
    default:
      return "go together";
  }
}

/**
 * The same rule as a clause about one cell pairing with a value list: "no
 * number open there **adds with 1 or 2 to make 7**". `list` is already joined
 * with "or", since it is read under a negation.
 */
function pairClause(clue: number, list: string): string {
  const n = clueNum(clue);
  switch (clueType(clue)) {
    case CLUE_ADD:
      return `adds with ${list} to make ${n}`;
    case CLUE_SUB:
      return n ? `is ${n} away from ${list}` : `matches ${list}`;
    case CLUE_MUL:
      return `multiplies with ${list} to make ${n}`;
    case CLUE_DIV:
      return `divides with ${list} to give ${n}`;
    default:
      return `goes with ${list}`;
  }
}

/** A clue deduction's premise; the walk concludes it with the move it makes
 * (`engine/hint-text.ts`'s `Premise`). A clue sits where four cells meet, so the
 * board cannot mark the clue itself: its name is a reference to the cells it
 * constrains, outlined, which meet at that one intersection. */
export const say = {
  /** An `E`/`O` clue rules the wrong parity out of all four cells around it,
   * `cells`. */
  parity: (even: boolean, cells: readonly Point[]): Narration =>
    phrase`${mark.as("outline", CELL, cells, `The ${even ? "E" : "O"} clue`)} means all four numbers around it are ${even ? "even" : "odd"}`,

  /** An arithmetic clue over the diagonal `pair` (the struck cell `at`, then
   * its partner), read against a partner that already shows `v`: the whole
   * deduction is arithmetic the player can do in their head. */
  paired: (clue: number, pair: readonly Point[], at: Point, v: number): Narration =>
    phrase`${mark.as("outline", CELL, pair, `The ${clueLabel(clue)} clue`)} means ${thisCell(at)} and the ${v} across it ${diagonalRule(clue)}`,

  /** The same clue read against a partner that is still open: nothing it could
   * hold pairs with the struck values. */
  open: (clue: number, pair: readonly Point[], ns: number[]): Narration =>
    phrase`Nothing open across ${mark.as("outline", CELL, pair, `the ${clueLabel(clue)} clue`)} ${pairClause(clue, joinOr(ns))}`,
};
