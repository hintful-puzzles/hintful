/**
 * Every sentence Separate's hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `explain`); this file decides only how it reads. A later leg of a firing that
 * sets several edges speaks the border grid's shared continuation
 * (`edgeContinuation`), pointing back at the regions the first leg named.
 *
 * A region here is whatever the player's no-wall marks already join, so a
 * single square is a region too. When a sentence is about two regions it tells
 * them apart by their marks, one striped and one outlined, because two
 * outlined regions side by side read as one; a lone square is named by its
 * letter instead, since "region" for one letter reads as if the player had
 * missed something. Every such word is a reference to its mark
 * (`engine/hint-words.ts`), and `edges` are the ringed edges the leg sets and
 * those still to come.
 */

import { EDGE, type ForcedBorderEdge } from "../../engine/border-grid-hint.ts";
import { indefinite } from "../../engine/hint-text.ts";
import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
  whole,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";

type Edges = readonly ForcedBorderEdge[];
type Squares = readonly Point[];

const letterName = (letter: number): string => String.fromCharCode(65 + letter);

/** "the striped and outlined regions", each word a reference to its region. */
function bothRegions(striped: Squares, outlined: Squares, det: string): Narration {
  return phrase`${det} ${mark.as("stripes", whole(CELL), striped, "striped")} and ${mark.as("outline", whole(CELL), outlined, "outlined regions")}`;
}

export const say = {
  /** Two touching regions both holding `letter`: `striped` and `outlined`
   * (the striped one is never the lone square of a mixed pair, and two lone
   * squares are both outlined, with `striped` empty). `edges` separate them. */
  sharedLetter: (
    letter: number,
    striped: Squares,
    outlined: Squares,
    edges: Edges,
  ): Sentence => {
    const l = letterName(letter);
    const a = indefinite(l);
    const move =
      edges.length > 1
        ? phrase`${mark.as("ring", EDGE, edges, "every edge between them")} must be a wall`
        : phrase`${mark.as("ring", EDGE, edges, "the edge between them")} must be a wall`;
    if (striped.length === 0)
      return so({
        look: phrase`${mark.as("outline", CELL, outlined, `These two ${l}s`)} can't share a region`,
        move,
      });
    const region = mark.the("stripes", whole(CELL), striped, "region");
    if (outlined.length === 1)
      return so({
        look: phrase`${region} already holds ${a} ${l}`,
        follows: phrase`${mark.the("outline", CELL, outlined, l)} can't join it`,
        move,
      });
    return so({
      look: phrase`${bothRegions(striped, outlined, "The")} both hold ${a} ${l}`,
      follows: phrase`they can't join`,
      move,
    });
  },

  /** The regions `striped` and `outlined`, which a wall already separates,
   * with `edges` between them still open. */
  walledApart: (striped: Squares, outlined: Squares, edges: Edges): Sentence =>
    so({
      look: phrase`A wall already separates ${bothRegions(striped, outlined, "the")}`,
      move:
        edges.length > 1
          ? phrase`${mark.as("ring", EDGE, edges, "every other edge between them")} must be a wall too`
          : phrase`${mark.as("ring", EDGE, edges, "this edge between them")} must be a wall too`,
    }),

  /** The region `region`, short of `k` squares, with one square it can grow
   * into; `letter` names it when it is a lone square. */
  onlyWay: (region: Squares, k: number, letter: number, edges: Edges): Sentence => {
    const move = phrase`${mark.this("ring", EDGE, edges, "edge")} can't be a wall`;
    if (region.length === 1) {
      const l = letterName(letter);
      return so({
        look: phrase`${mark.as("stripes", whole(CELL), region, `This ${l}`)} is walled in on every side but one`,
        move,
      });
    }
    return so({
      look: phrase`${mark.the("stripes", whole(CELL), region, "region")} has ${region.length} of its ${k} squares and one square left to grow into`,
      move,
    });
  },

  /** What a later leg points back to: the regions its first leg named. */
  basis: (striped: Squares, outlined: Squares, letter: number): Narration =>
    striped.length === 0
      ? mark.as("outline", CELL, outlined, `the same two ${letterName(letter)}s`)
      : outlined.length === 0
        ? mark.the("stripes", whole(CELL), striped, "region", "the same")
        : bothRegions(striped, outlined, "the same"),
};
