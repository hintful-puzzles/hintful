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
 * Every arm reads correctly at the degenerate clue values a hand-written
 * description can hold, even though the generator never emits them: a `0−`
 * clue and a `1÷` clue both mean "equal", and neither says "differ by 0" or
 * "divide to give 1" (docs/games/hints.md § "Sanity-read at the degenerate
 * extremes").
 */

import { joinNums, joinOr } from "../../engine/hint-text.ts";
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
      return n === 1 ? "are equal" : `divide to give ${n}`;
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
      return n === 1 ? `matches ${list}` : `divides with ${list} to give ${n}`;
    default:
      return `goes with ${list}`;
  }
}

export const say = {
  /** An `E`/`O` clue rules the wrong parity out of all four cells around it. */
  parity: (even: boolean, ns: number[]): string =>
    `The ${even ? "E" : "O"} clue means all four numbers around it are ${even ? "even" : "odd"}, so we must cross out ${joinNums(ns)}.`,

  /** An arithmetic clue read against a diagonal partner that already shows
   * `v` — the whole deduction is arithmetic the player can do in their head. */
  paired: (clue: number, v: number, ns: number[]): string =>
    `The ${clueLabel(clue)} clue means this cell and the ${v} across it ${diagonalRule(clue)}, so we must cross out ${joinNums(ns)}.`,

  /** The same clue read against a partner that is still open: nothing it could
   * hold pairs with the struck values. */
  open: (clue: number, ns: number[]): string => {
    const them = ns.length === 1 ? "it" : "them";
    return `Nothing open across the ${clueLabel(clue)} clue ${pairClause(clue, joinOr(ns))}, so we must cross ${them} out.`;
  },
};
