/**
 * Every sentence Clusters' hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads. Each is a proof by
 * contradiction: premise, the rule the refuted color breaks, conclusion in the
 * necessity voice (docs/hints.md § "Necessity for deductions, imperative
 * for moves"). Every word that points at the board is a reference to the mark
 * it points at (`engine/hint-words.ts`): the cell the step colors is ringed,
 * the tile the refuted color would break is outlined, and so are the two
 * tiles a count reads.
 *
 * **Where a second mark is on the board, "this cell" is tied to it by geometry**,
 * because beside an outlined tile a bare "this cell" points at neither. Not by
 * color (*"the cell marked purple"*): `hints.md` forbids color as the only cue,
 * and a sentence naming a hue is wrong the moment the scheme flips or the reader
 * is color-blind. `contradictionAround` only ever reports the placed cell **or
 * one of its four orthogonal neighbors**, so on every branch below the outlined
 * tile is literally *this cell's neighbor*, and the sentence says so.
 *
 * The two `at.cell === d.index` branches have no second mark, so "this cell" is
 * unambiguous there and a disambiguating phrase would be noise.
 */

import type { ColorWord } from "../../engine/color/color-word.ts";
import { TWO_NAMES } from "../../engine/color/colors.ts";
import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
} from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import type { ClustersDeduction } from "./solver.ts";
import { type ClustersFill, pairIndex } from "./state.ts";

/** The cells a direct step marks: the one it colors, and the tile the refuted
 * color would break (null when that is the target itself). */
export interface Marked {
  target: Point;
  danger: Point | null;
}

/** A tile a count reads: where it is, its color and whether it is a dot. */
export interface Tile {
  at: Point;
  fill: ClustersFill;
  dot: boolean;
}

/** The word for a color: the palette's, so it is the color the piece is. */
export const colorName = (fill: ClustersFill): ColorWord => TWO_NAMES[pairIndex(fill)];

const thisCell = (m: Marked): Narration => mark.this("ring", CELL, [m.target], "cell");

/** The danger tile, which every branch naming it has. */
const danger = (m: Marked): Point[] => (m.danger ? [m.danger] : []);

/** A count in words, so it does not read as a coordinate. */
const COUNTS = ["no", "one", "two", "three", "four"] as const;

/** A tile by its color and kind: "red dot", "blue tile". */
const kindOf = (t: Tile): string =>
  `${colorName(t.fill).only} ${t.dot ? "dot" : "tile"}`;

export const say = {
  /**
   * A Normal firing: tile `b`'s count over the squares it shares with tile
   * `a` settles `a`'s other empty neighbors, this cell among them. Both tiles
   * are outlined and told apart by color and kind, or, where those agree, by
   * order ("the other"); "this cell" is tied to them as one of `a`'s
   * neighbors the shared squares leave out.
   */
  count: (d: ClustersDeduction, target: Point, a: Tile, b: Tile): Sentence => {
    if (d.reason.kind !== "count") throw new Error("not a count");
    const ca = colorName(a.fill);
    const same = kindOf(a) === kindOf(b);
    const noun = a.dot ? "dot" : "tile";
    const tileA = (words: string) => mark.as("outline", CELL, [a.at], words);
    const tileB = (words: string) => mark.as("outline", CELL, [b.at], words);
    const move = phrase`${mark.this("ring", CELL, [target], "cell")} must be ${colorName(d.fill)}`;
    // "Also touch" and "beside" are the squares the two share.
    if (d.reason.form === "full") {
      const other = same ? `the other outlined ${noun}` : `the outlined ${kindOf(b)}`;
      return so({
        look: phrase`${tileA(`the outlined ${kindOf(a)}`)}'s last ${ca} must also touch ${tileB(other)}`,
        move,
      });
    }
    const most = d.reason.most === 0 ? "no" : `at most ${COUNTS[d.reason.most]}`;
    const first = same ? `one outlined ${kindOf(b)}` : `the outlined ${kindOf(b)}`;
    const second = same ? "the other" : `the outlined ${kindOf(a)}`;
    return so({
      look: phrase`${tileB(first)} allows ${most} ${ca} beside ${tileA(second)}`,
      move,
    });
  },

  /** A direct firing: the refuted color breaks a rule at once. */
  direct: (d: ClustersDeduction, m: Marked): Sentence => {
    const f = colorName(d.fill);
    const t = colorName(d.refuted);
    if (d.reason.kind !== "direct") throw new Error("not a direct firing");
    const at = d.reason.at;
    const itMust = phrase`it must be ${f}`;
    const thisMust = phrase`${thisCell(m)} must be ${f}`;
    if (at.cell === d.index) {
      if (at.kind === "surrounded") {
        return so({
          look: phrase`Every neighbor of ${thisCell(m)} is ${f}. As ${t}, it could never touch another ${t} tile`,
          move: itMust,
        });
      }
      // reachTwo at the cell itself (an empty cell is never a dot). Count- and
      // edge-neutral: at a corner the board edge does part of the hemming, and
      // "at most one" stays honest when one open neighbor remains.
      return so({
        look: phrase`If ${thisCell(m)} were ${t}, at most one neighbor could ever match it, but it needs to touch two`,
        move: itMust,
      });
    }
    if (at.kind === "dotOvercount") {
      // "its one" carries the rule (a dot touches exactly one tile of its color),
      // and the rule itself is the help's to state.
      return so({
        look: phrase`${mark.the("outline", CELL, danger(m), `${t.only} dot`)} beside ${thisCell(m)} already touches its one ${t} tile`,
        move: thisMust,
      });
    }
    const neighbor = mark.as(
      "outline",
      CELL,
      danger(m),
      `its outlined ${f.only} neighbor`,
    );
    if (at.kind === "surrounded") {
      return so({
        look: phrase`Painting ${thisCell(m)} ${t} would seal ${neighbor} off from its own color`,
        move: thisMust,
      });
    }
    return so({
      look: phrase`If ${thisCell(m)} were ${t}, ${neighbor} could never touch two ${f} tiles`,
      move: thisMust,
    });
  },
};
