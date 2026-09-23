/**
 * Every sentence Seismic's hint speaks. Which one a step speaks, and with what
 * values, is `hint.ts`'s `narrate`.
 *
 * The keep-apart rule is the one thing the two modes say differently, so every
 * sentence that states how far a number reaches takes `tectonic`.
 */

import { narrateLatinReason, populateText } from "../../engine/hint-text.ts";

/** "1 cell", "3 cells". */
const cells = (n: number): string => (n === 1 ? "1 cell" : `${n} cells`);

export const say = {
  populate: populateText("number"),

  /** The one-off setup strike. "Within N cells" is the rule's own reach: two
   * equal numbers N need at least N cells *between* them, so a distance of N or
   * less is a clash. */
  clean: (tectonic: boolean): string =>
    tectonic
      ? "Now clear the easy ones: cross out any number already in the cell's area or in a cell touching it."
      : "Now clear the easy ones: cross out any N already in the cell's area or within N cells of it in its row or column.",

  /** An area of one cell owes only a 1, and needs no notes to say so. */
  singleton: "This area is a single cell, so it can only be 1.",

  naked: (n: number): string => narrateLatinReason({ kind: "single" }, [n]),

  hidden: (n: number): string =>
    `No other cell in the striped area can still be ${n}, so this cell must be ${n}.`,

  /** A placement's own strikes, as the leg after it. */
  cull: (n: number, tectonic: boolean): string =>
    tectonic
      ? `The ${n} just placed rules out ${n} in its area and in the cells touching it, so cross those out.`
      : `The ${n} just placed rules out ${n} in its area and within ${cells(n)} of it in its row and column, so cross those out.`,

  /**
   * An area whose every remaining home for `n` clashes with the struck cells.
   * Worded as where the area *can* put its `n`, because that is what the notes in
   * the striped area show; the clash is the reach the player measures from there.
   */
  starve: (n: number, targets: number, tectonic: boolean): string => {
    const one = targets === 1;
    const whom = one ? "this cell" : "each of these";
    const where = tectonic
      ? `in a cell touching ${whom}`
      : `in line with ${whom} and within ${cells(n)} of it`;
    const verdict = one ? `this cell can't be ${n}` : `none of them can be ${n}`;
    return `The striped area can put its ${n} only ${where}, so ${verdict}.`;
  },
};
