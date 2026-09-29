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
  type Conclusions,
  cleanObviousText,
  joinOr,
  joinWith,
  populateText,
  thisCell,
} from "../../engine/hint-text.ts";
import { CELL, mark, type Narration, phrase, whole } from "../../engine/hint-words.ts";
import type { OrderedCell } from "../../engine/overlay-sidecar.ts";
import type { Point } from "../../engine/types.ts";

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

/** The same relation as an adjective, for "its left neighbor". */
const SIDE = ["", "upper", "lower", "left", "right"];

/** The arrow of value `n`, as a word. */
export const arrow = (n: number): string => WORD[n];

/** The square an arrow of value `n` points at, named by its relation to the one
 * holding it. */
export const neighbor = (n: number): string => NEIGHBOR[n];

/** "this square", ringed. */
const here = (at: Point): Narration => thisCell(at, SQUARE);

/** "Its area", striped: the area a sentence reasons over. */
const itsArea = (region: readonly Point[]): Narration =>
  mark.as("stripes", whole(CELL), region, "Its area");

export const say = {
  /** Shared with every candidate game, in Rome's nouns. */
  populate: populateText("arrow", SQUARE),
  /** The area is the whole of Rome's uniqueness rule, so the region phrase is
   * one word where a Latin game's is "row or column". */
  cleanObvious: cleanObviousText("arrow", "placed", "area", SQUARE),

  /** A note step under the implicit reading. A square at the edge can never
   * point off the board, so what its area leaves it is said of the ways it can
   * point, never of all four. */
  note: (at: Point, ns: number[], every: boolean): Narration => {
    if (every)
      return phrase`Nothing in ${here(at)}'s area rules out a way it can point yet, so pencil in every one.`;
    const one = ns.length === 1;
    return phrase`Of the ways ${here(at)} can point, only ${joinWith(ns.map(arrow))} ${one ? "isn't" : "aren't"} already used in its area, so pencil ${one ? "it" : "them"} in.`;
  },

  /** A naked single: the square's own notes have come down to one. */
  single: (at: Point, n: number): Narration =>
    phrase`Every other arrow has been ruled out in ${here(at)}, so it must point ${arrow(n)}.`,

  /** A single in a square with no marks: its area already uses every other way
   * it can point. */
  regionsFull: (at: Point, n: number): Narration =>
    phrase`Every other way ${here(at)} can point is already used in its area, so it must point ${arrow(n)}.`,

  /** A hidden single: a four-square area, `region`, holds all four arrows, and
   * one of them has a single home left. Synthesized by the plan rather than
   * recorded — the solver only ever *places* a naked single, but the plan may
   * reach the square before it has taken every strike the solver did. */
  hiddenSingle: (region: readonly Point[], at: Point, n: number): Narration =>
    phrase`${itsArea(region)} must hold all four arrows, and only ${here(at)} can still point ${arrow(n)}, so it does.`,

  /** How a step ends, by the move it makes, said of the ways a square points.
   * A strike with a `where` speaks for the other squares it names; one whose
   * premise named what goes refers back to it. */
  conclude: {
    // A pair strikes the same arrow from several squares; each is named once.
    strike: (ns, { where, struck, named }) => {
      const ways = joinOr([...new Set(ns)].sort((a, b) => a - b).map(arrow));
      if (where) return `no other square ${where} can point ${ways}`;
      if (struck) return `${struck} must go`;
      if (named) return `${ns.length === 1 ? "that arrow" : "those arrows"} must go`;
      return `this square can't point ${ways}`;
    },
    place: (n) => `this square must point ${arrow(n)}`,
    keep: (ns) => `pencil in only ${joinWith(ns.map(arrow))}`,
  } satisfies Conclusions,

  // The strike arms below are premises, concluded in the words above.

  /** The cull around a placement, and the opening clean's per-firing form:
   * the area `area` striped, the arrow just placed at `placed` outlined. */
  dup: (area: readonly Point[], placed: Point, n: number): Narration =>
    phrase`${mark.this("stripes", whole(CELL), area, "area").capitalized()} now has ${mark.as("outline", CELL, [placed], `its ${arrow(n)} arrow`)}`,
  dupWhere: "in it",

  /** A candidate that would join a chain of arrows, `path` (numbered), leading
   * back to its own square. `n` is the struck direction, so the chain starts at
   * the neighbor it points at. */
  loop: (path: readonly OrderedCell[], n: number): Narration =>
    phrase`Following ${mark.as("outline", CELL, path, `the arrows from the square ${neighbor(n)}`)} leads back here`,

  /** A four-square area, `region`, with only one home left for an arrow, seen
   * as the elimination of that square's other marks. */
  onlyHome: (region: readonly Point[], at: Point, only: number[]): Narration =>
    phrase`${itsArea(region)} must hold all four arrows, and only ${here(at)} can still point ${joinOr(only.map(arrow))}`,
  onlyHomeStruck: "its other marks",

  /** The one candidate anywhere that can still grow a goal's `group`, and what
   * its strike calls the square's other marks. The mark kept is in the ringed
   * square `at`. */
  reach: (group: readonly Point[], at: Point): Narration =>
    phrase`Every square must reach a goal, and only ${mark.as("ring", CELL, [at], "this mark")} still leads into ${mark.the("stripes", whole(CELL), group, "group")}`,
  reachStruck: "the rest",

  /** A neighbor, `side`, that could only point along one axis, which a mark
   * pointing into it would turn into a two-square loop. `n` is the struck
   * direction, so the two-way square is the neighbor it points at, and "an
   * arrow into it" names what is struck. */
  opposite: (
    side: Point,
    area: readonly Point[],
    n: number,
    pair: number[],
  ): Narration =>
    phrase`${mark.as("outline", CELL, [side], `Its ${SIDE[n]} neighbor`)} in ${mark.this("stripes", whole(CELL), area, "area")} can only point ${joinOr(pair.map(arrow))}: an arrow into it would close a loop or be the area's second ${arrow(n)}`,

  /** Two squares, `pair`, of the area `region` holding the same two
   * candidates between them. */
  pair: (pair: readonly Point[], region: readonly Point[], ns: number[]): Narration =>
    phrase`${mark.as("outline", CELL, pair, "Two squares")} of ${mark.this("stripes", whole(CELL), region, "area")} must take ${joinOr(ns.map(arrow))} between them`,
  pairWhere: "of the area",
} as const;
