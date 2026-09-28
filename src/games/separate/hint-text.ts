/**
 * Every sentence Separate's hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `explain`); this file decides only how it reads. A later leg of a firing that
 * sets several edges speaks the border grid's shared continuation
 * (`edgeContinuation`), not a sentence of its own.
 *
 * A region here is whatever the player's no-wall marks already join, so a
 * single square is a region too. When a sentence is about two regions it tells
 * them apart by their marks, one hatched and one outlined, because two
 * outlined regions side by side read as one; a lone square is named by its
 * letter instead, since "region" for one letter reads as if the player had
 * missed something.
 */

import { indefinite } from "../../engine/hint-text.ts";

const letterName = (letter: number): string => String.fromCharCode(65 + letter);

export const say = {
  /** Two touching regions both holding `letter`: `hatchedSize` and
   * `outlinedSize` squares (the hatched one is never the lone square of a
   * mixed pair). `multi` when more than one edge separates them. */
  sharedLetter: (
    letter: number,
    hatchedSize: number,
    outlinedSize: number,
    multi: boolean,
  ): string => {
    const l = letterName(letter);
    const a = indefinite(l);
    const tail = multi
      ? "every edge between them must be a wall"
      : "the edge between them must be a wall";
    if (hatchedSize === 1 && outlinedSize === 1)
      return `These two ${l}s can't share a region, so ${tail}.`;
    if (outlinedSize === 1)
      return `The hatched region already holds ${a} ${l}, so the outlined ${l} can't join it: ${tail}.`;
    return `The hatched and outlined regions both hold ${a} ${l}, so they can't join: ${tail}.`;
  },

  /** Two regions a wall already separates, with `multi` edges between them
   * still open. */
  walledApart: (multi: boolean): string =>
    multi
      ? "A wall already separates the hatched and outlined regions, so every other edge between them must be a wall too."
      : "A wall already separates the hatched and outlined regions, so this edge between them must be a wall too.",

  /** A region of `size` squares, short of `k`, with one square it can grow
   * into; `letter` names it when it is a lone square. */
  onlyWay: (size: number, k: number, letter: number): string => {
    if (size === 1) {
      const l = letterName(letter);
      return `This ${l} is walled in on every side but one, so this edge can't be a wall.`;
    }
    return `The hatched region has ${size} of its ${k} squares and one square left to grow into, so this edge can't be a wall.`;
  },
};
