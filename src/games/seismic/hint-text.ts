/**
 * Every sentence Seismic's hint speaks. Which one a step speaks, and with what
 * values, is `hint.ts`'s `placeWords` and `strikeWords`; a strike's words are a
 * premise, which the shared walk ends with the move its step makes.
 *
 * The keep-apart rule is the one thing the two modes say differently, so every
 * sentence that states how far a number reaches takes `tectonic`.
 */

import { joinWith, narrateLatinReason, populateText } from "../../engine/hint-text.ts";

/** "1 cell", "3 cells". */
const cells = (n: number): string => (n === 1 ? "1 cell" : `${n} cells`);

/** Where a number rules itself out of, from a cell. "Within reach" is the
 * `N` cells {@link say.clean} names for a number `N`, which a sentence about
 * every number at once cannot write as a count. */
const reach = (tectonic: boolean): string =>
  tectonic
    ? "this cell's area or in a cell touching it"
    : "this cell's area or within reach along its row or column";

export const say = {
  populate: populateText("number"),

  /** The one-off setup strike. "Within N cells" is the rule's own reach: two
   * equal numbers N need at least N cells *between* them, so a distance of N or
   * less is a clash. */
  clean: (tectonic: boolean): string =>
    tectonic
      ? "Now clear the easy ones: cross out any number already in the cell's area or in a cell touching it."
      : "Now clear the easy ones: cross out any N already in the cell's area or within N cells of it in its row or column.",

  /** A note-less cell's candidates, written because a deduction rests on them. */
  note: (values: readonly number[], every: boolean, tectonic: boolean): string => {
    if (every)
      return "No number stands near enough to rule one out here yet, so pencil in every one.";
    const one = values.length === 1;
    return `Only ${joinWith(values.map(String))} ${one ? "isn't" : "aren't"} already in ${reach(tectonic)}, so pencil ${one ? "it" : "them"} in.`;
  },

  /** An area of one cell owes only a 1, and needs no notes to say so. */
  singleton: "This area is a single cell, so it can only be 1.",

  naked: (n: number): string => narrateLatinReason({ kind: "single" }, n),

  /** A note-less cell every other number is ruled out of. */
  regionsFull: (n: number, tectonic: boolean): string =>
    `Every other number is already in ${reach(tectonic)}, so it can only be ${n}.`,

  hidden: (n: number): string =>
    `No other cell in the striped area can still be ${n}, so this cell must be ${n}.`,

  /** A placement's own strikes, as the leg after it. */
  cull: (n: number, tectonic: boolean): string =>
    tectonic
      ? `The ${n} just placed rules out ${n} in its area and in the cells touching it`
      : `The ${n} just placed rules out ${n} in its area and within ${cells(n)} of it in its row and column`,

  /**
   * An area whose every remaining home for `n` clashes with the struck cells.
   * Worded as where the area *can* put its `n`, because that is what the notes in
   * the striped area show; the clash is the reach the player measures from there.
   */
  starve: (n: number, targets: number, tectonic: boolean): string => {
    const whom = targets === 1 ? "this cell" : "each of these";
    const where = tectonic
      ? `in a cell touching ${whom}`
      : `in line with ${whom} and within ${cells(n)} of it`;
    return `The striped area can put its ${n} only ${where}`;
  },

  /** What a starve strikes, named by whose notes they are. */
  starved: (n: number, targets: number): string =>
    targets === 1 ? `this cell's ${n}` : `their ${n}s`,

  /** What a cull strikes. */
  culled: (n: number): string => `those ${n}s`,
};
