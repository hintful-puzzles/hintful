/**
 * Every sentence Rome's hint speaks (docs/games/hints.md § "The sentences live
 * in one file per game").
 *
 * ## A direction needs a word and a relation, not a glyph
 *
 * Rome is the collection's first game whose candidates are not values, and the
 * question it was picked to answer is what such a candidate needs in a
 * sentence. Measured against the arms below rather than guessed: every one of
 * them wants the **word** ("up"), four of them additionally want the
 * **relation** the direction names ("the square above", "point straight back"),
 * and *none* wants the glyph — an arrow drawn in prose is smaller than the one
 * on the board and says nothing the word does not.
 *
 * So `LatinVocab`'s `{ noun, value }` is not widened. It could not have helped
 * here anyway: Rome's generic-looking arms name an **area**, where
 * `narrateLatinReason` names a row and a column, so Rome writes its own
 * `narrate` for the same reason Solo and Towers do. The two shared setup
 * sentences *are* taken from `hint-text.ts`, because they are about penciling
 * rather than about rows.
 */

import {
  cleanObviousText,
  joinOr,
  joinWith,
  populateText,
} from "../../engine/hint-text.ts";

/** What Rome calls a board position, in every sentence here. Its help page says
 * "square", and mixing that with "cell" inside one game reads as sloppy. */
const SQUARE = "square";

/** The four arrows as words, indexed by candidate value. */
const WORD = ["", "up", "down", "left", "right"];

/** Where the neighbor an arrow of value `n` points at sits, relative to the
 * square holding it. Used only where the code guarantees the relation (the
 * struck mark's own direction), which is what a deixis tie has to rest on
 * (docs/games/hints.md § "Two marks on the board, one 'this cell'"). */
const NEIGHBOR = ["", "above", "below", "to the left", "to the right"];

/** The arrow of value `n`, as a word. */
export const arrow = (n: number): string => WORD[n];

/** The square an arrow of value `n` points at, named by its relation to the one
 * holding it. */
export const neighbor = (n: number): string => NEIGHBOR[n];

export const say = {
  /** Shared with every candidate game, in Rome's nouns. */
  populate: populateText("arrow", SQUARE),
  /** The area is the whole of Rome's uniqueness rule, so the region phrase is
   * one word where a Latin game's is "row or column". */
  cleanObvious: cleanObviousText("arrow", "placed", "area", SQUARE),

  /** A note step under the implicit reading. A square at the edge can never
   * point off the board, so what its area leaves it is said of the ways it can
   * point, never of all four. */
  note: (ns: number[], every: boolean): string => {
    if (every)
      return "Nothing in this square's area rules out a way it can point yet, so pencil in every one.";
    const one = ns.length === 1;
    return `Of the ways this square can point, only ${joinWith(ns.map(arrow))} ${one ? "isn't" : "aren't"} already used in its area, so pencil ${one ? "it" : "them"} in.`;
  },

  /** A naked single: the square's own notes have come down to one. */
  single: (n: number): string =>
    `Every other arrow has been ruled out in this square, so it must point ${arrow(n)}.`,

  /** A single in a square with no marks: its area already uses every other way
   * it can point. */
  regionsFull: (n: number): string =>
    `Every other way this square can point is already used in its area, so it must point ${arrow(n)}.`,

  /** A hidden single: a four-square area holds all four arrows, and one of them
   * has a single home left. Synthesized by the plan rather than recorded — the
   * solver only ever *places* a naked single, but the plan may reach the square
   * before it has taken every strike the solver did. */
  hiddenSingle: (n: number): string =>
    `Its area must hold all four arrows, and only this square can still point ${arrow(n)}, so it does.`,

  /** The cull around a placement, and the opening clean's per-firing form. */
  dup: (n: number): string =>
    `This area now has its ${arrow(n)} arrow, so no other square in it can point ${arrow(n)}.`,

  /** A candidate that would join a chain of arrows leading back to its own
   * square. `n` is the struck direction, so the chain starts at the neighbor it
   * points at. */
  loop: (n: number): string =>
    `Following the arrows from the square ${neighbor(n)} leads back here, so this square can never point ${arrow(n)}.`,

  /** A four-square area with only one home left for an arrow, seen as the
   * elimination of that square's other marks. */
  onlyHome: (only: number[]): string =>
    `This is the only square in its area that can still point ${joinOr(only.map(arrow))}, so its other marks must go.`,

  /** The one candidate anywhere that can still grow a goal's group. */
  reach: (): string =>
    `Every square must reach a goal, and only this mark can still point into the striped group, so the rest must go.`,

  /** A neighbor that could only point along one axis, which a mark pointing
   * into it would turn into a two-square loop. `n` is the struck direction, so
   * the two-way square is the neighbor it points at. */
  opposite: (n: number, pair: number[]): string =>
    `The square ${neighbor(n)} can only point ${joinOr(pair.map(arrow))}, so an arrow into it from here would point straight back.`,

  /** Two squares of an area holding the same two candidates between them. */
  pair: (ns: number[]): string =>
    `Two squares of this area must take ${joinOr(ns.map(arrow))} between them, so those marks must go from the rest.`,
} as const;
