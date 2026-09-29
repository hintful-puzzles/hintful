/**
 * Every sentence Clusters' hint speaks, and the words inside them.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads. Each is a proof by
 * contradiction: premise, the rule the refuted color breaks, conclusion in the
 * necessity voice (docs/games/hints.md § "Necessity for deductions, imperative
 * for moves"). Every word that points at the board is a reference to the mark
 * it points at (`engine/hint-words.ts`): the cell the step colors is ringed,
 * the tile the refuted color would break is outlined, and a chain's forced
 * cells are outlined and named by their numbers.
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

import { CELL, mark, type Narration, phrase } from "../../engine/hint-words.ts";
import type { Point } from "../../engine/types.ts";
import type { ClustersDeduction } from "./solver.ts";
import { type ClustersFill, F_COLOR_0 } from "./state.ts";

/** The cells a step marks: the one it colors, the tile the refuted color would
 * break (null when that is the target itself), and a chain's forced cells. */
export interface Marked {
  target: Point;
  danger: Point | null;
  chain: readonly Point[];
}

const colorName = (fill: ClustersFill): string => (fill === F_COLOR_0 ? "red" : "blue");

const thisCell = (m: Marked): Narration => mark.this("ring", CELL, [m.target], "cell");
const thisVeryCell = (m: Marked): Narration =>
  mark.as("ring", CELL, [m.target], "this very cell");

/** The danger tile, which every branch naming it has. */
const danger = (m: Marked): Point[] => (m.danger ? [m.danger] : []);

export const say = {
  /** A lookahead firing: one standing hypothesis plus the forced single-cell
   * consequences (never nested), shown statically as the numbered cells. */
  chain: (d: ClustersDeduction, m: Marked): Narration => {
    const f = colorName(d.fill);
    const t = colorName(d.refuted);
    const at = d.reason.at;
    const end =
      at.kind === "dotOvercount"
        ? phrase`${mark.the("outline", CELL, danger(m), "dot")} would touch a second tile of its own color`
        : at.cell === d.index
          ? at.kind === "surrounded"
            ? phrase`${thisVeryCell(m)} would be sealed off from every ${t} tile`
            : phrase`${thisVeryCell(m)} could no longer touch two ${t} tiles`
          : at.kind === "surrounded"
            ? phrase`${mark.the("outline", CELL, danger(m), "tile")} would be sealed off from its own color`
            : phrase`${mark.the("outline", CELL, danger(m), "tile")} could no longer touch two of its own color`;
    // The chain's break is adjacent to the *last forced cell*, not to the
    // target, so the neighbor relation above is unavailable here. The tie is
    // instead that the chain runs **from** this cell — the deixis the guard in
    // `clusters-hint.test.ts` checks. The board's ordinals say which
    // consequence came when; they do not say which mark "this cell" means.
    //
    // The sentence names the two ends and lets the numbers carry the middle:
    // reciting the links would put the chain back in the reader's head, which
    // is what the picture exists to prevent (docs/games/hints.md § "The forcing
    // boundary").
    const n = m.chain.length;
    const cells = mark.as(
      "outline",
      CELL,
      m.chain,
      n === 1 ? "cell 1" : n === 2 ? "cells 1 and 2" : `cells 1 to ${n}`,
    );
    const run =
      n === 1
        ? phrase`${cells} is then forced from it, and`
        : phrase`${cells} are then forced from it, and by ${n}`;
    return phrase`Suppose ${thisCell(m)} were ${t}: ${run} ${end}, so ${thisCell(m)} must be ${f}.`;
  },

  /** A direct firing: the refuted color breaks a rule at once. */
  direct: (d: ClustersDeduction, m: Marked): Narration => {
    const f = colorName(d.fill);
    const t = colorName(d.refuted);
    const at = d.reason.at;
    if (at.cell === d.index) {
      if (at.kind === "surrounded") {
        return phrase`Every neighbor of ${thisCell(m)} is ${f}. A ${t} tile here could never touch another ${t} tile, so it must be ${f}.`;
      }
      // reachTwo at the cell itself (an empty cell is never a dot). Count- and
      // edge-neutral: at a corner the board edge does part of the hemming, and
      // "at most one" stays honest when one open neighbor remains.
      return phrase`If ${thisCell(m)} were ${t}, at most one neighbor could ever match it, but it needs to touch two, so it must be ${f}.`;
    }
    if (at.kind === "dotOvercount") {
      // "its one" carries the rule (a dot touches exactly one tile of its color),
      // and the rule itself is the help's to state.
      return phrase`${mark.the("outline", CELL, danger(m), `${t} dot`).capitalized()} beside ${thisCell(m)} already touches its one ${t} tile, so ${thisCell(m)} must be ${f}.`;
    }
    const neighbor = mark.as("outline", CELL, danger(m), `its outlined ${f} neighbor`);
    if (at.kind === "surrounded") {
      return phrase`Painting ${thisCell(m)} ${t} would seal ${neighbor} off from every other ${f} tile, so ${thisCell(m)} must be ${f}.`;
    }
    return phrase`If ${thisCell(m)} were ${t}, ${neighbor} could never touch two ${f} tiles, so ${thisCell(m)} must be ${f}.`;
  },
};
