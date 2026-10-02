/**
 * Every sentence Seismic's hint speaks. Which one a step speaks, and with what
 * values, is `hint.ts`'s `placeWords` and `strikeWords`; a strike's words are a
 * premise, which the shared walk ends with the move its step makes.
 *
 * Every word pointing at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the cell the step decides is ringed, the area a
 * sentence names is striped, and the number just placed that a cull reasons
 * from is outlined.
 *
 * The keep-apart rule is the one thing the two modes say differently, so every
 * sentence that states how far a number reaches takes `tectonic`.
 */

import {
  joinWith,
  narrateLatinReason,
  populateText,
  thisCell,
} from "../../engine/hint-text.ts";
import {
  CELL,
  mark,
  type Narration,
  NOTE,
  type Note,
  phrase,
  type Sentence,
  so,
  unshaped,
  whole,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

/** "1 cell", "3 cells". */
const cells = (n: number): string => (n === 1 ? "1 cell" : `${n} cells`);

/** Where a number rules itself out of, from the ringed cell `at`. "Within
 * reach" is the `N` cells {@link say.clean} names for a number `N`, which a
 * sentence about every number at once cannot write as a count. */
const reach = (at: Point, tectonic: boolean): Narration =>
  tectonic
    ? phrase`${thisCell(at)}'s area or in a cell touching it`
    : phrase`${thisCell(at)}'s area or within reach along its row or column`;

/** "the striped area", over its cells. */
const stripedArea = (area: readonly Point[]): Narration =>
  mark.the("stripes", whole(CELL), area, "area");

export const say = {
  populate: populateText("number"),

  /** The one-off setup strike, over the notes it rings. "Within N cells" is the
   * rule's own reach: two equal numbers N need at least N cells *between*
   * them, so a distance of N or less is a clash. */
  clean:
    (tectonic: boolean) =>
    (marks: readonly Note[]): Sentence =>
      unshaped(
        phrase`Now clear the easy ones: cross out ${mark.as(
          "ring",
          NOTE,
          marks,
          tectonic
            ? "any number already in the cell's area or in a cell touching it"
            : "any N already in the cell's area or within N cells of it in its row or column",
        )}.`,
        "setup",
      ),

  /** A note-less cell's candidates, written because a deduction rests on them. */
  note: (
    at: Point,
    values: readonly number[],
    every: boolean,
    tectonic: boolean,
  ): Sentence => {
    if (every)
      return so({
        look: phrase`No number stands near enough to rule one out ${mark.as("ring", CELL, [at], "here")} yet`,
        move: phrase`pencil in every one`,
      });
    const one = values.length === 1;
    return so({
      look: phrase`Only ${joinWith(values.map(String))} ${one ? "isn't" : "aren't"} already in ${reach(at, tectonic)}`,
      move: phrase`pencil ${one ? "it" : "them"} in`,
    });
  },

  /** An area of one cell owes only a 1, and needs no notes to say so. */
  singleton: (at: Point): Sentence =>
    so({
      look: phrase`${mark.this("stripes", whole(CELL), [at], "area")} is a single cell`,
      move: phrase`${mark.as("ring", CELL, [at], "it")} can only be 1`,
    }),

  naked: (at: Note, w: number): Sentence =>
    narrateLatinReason({ kind: "single" }, at, w),

  /** A note-less cell every other number is ruled out of. */
  regionsFull: (at: Point, n: number, tectonic: boolean): Sentence =>
    so({
      look: phrase`Every other number is already in ${reach(at, tectonic)}`,
      move: phrase`it can only be ${n}`,
    }),

  hidden: (area: readonly Point[], at: Point, n: number): Sentence =>
    so({
      look: phrase`No other cell in ${stripedArea(area)} can still be ${n}`,
      move: phrase`${thisCell(at)} must be ${n}`,
    }),

  /** A placement's own strikes, as the leg after it: the number just placed at
   * `at`, outlined. */
  cull: (at: Point, n: number, tectonic: boolean): Narration => {
    const placed = mark.as("outline", CELL, [at], `The ${n} just placed`);
    return tectonic
      ? phrase`${placed} rules out ${n} in its area and in the cells touching it`
      : phrase`${placed} rules out ${n} in its area and within ${cells(n)} of it in its row and column`;
  },

  /**
   * An area whose every remaining home for `n` clashes with the struck cells,
   * `targets`. Worded as where the area *can* put its `n`, because that is what
   * the notes in the striped area show; the clash is the reach the player
   * measures from there.
   */
  starve: (
    area: readonly Point[],
    n: number,
    targets: readonly Point[],
    tectonic: boolean,
  ): Narration => {
    const whom =
      targets.length === 1
        ? thisCell(targets[0])
        : mark.as("ring", CELL, targets, "each of these");
    const where = tectonic
      ? phrase`in a cell touching ${whom}`
      : phrase`in line with ${whom} and within ${cells(n)} of it`;
    const striped = stripedArea(area).capitalized();
    return phrase`${striped} can put its ${n} only ${where}`;
  },

  /** What a starve strikes, named by whose notes they are. */
  starved: (n: number, targets: number): string =>
    targets === 1 ? `this cell's ${n}` : `their ${n}s`,

  /** What a cull strikes. */
  culled: (n: number): string => `those ${n}s`,
};
