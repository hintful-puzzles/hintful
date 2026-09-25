/**
 * Every sentence Solo's hint speaks, and the words inside them.
 *
 * Solo keeps its own version of the generic Latin arms rather than the
 * engine's (`engine/hint-text.ts`), because it names a different region set
 * per arm ("row, column and block", or the block or diagonal a hidden single
 * sits in), which one vocabulary cannot say. It shares the forcing chain and
 * the two setup steps.
 *
 * A value prints as the board draws it (`render.ts`'s `digitChar`: 1 to 9,
 * then a, b, … past 9), so a 12×12 grid's hint names the "c" the player can
 * see rather than a "12" they cannot.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads.
 */

import {
  cleanObviousText,
  indefinite,
  joinOr,
  joinWith,
  type LatinVocab,
  narrateForcingChain,
  noteText,
  populateText,
} from "../../engine/hint-text.ts";
import type { ForcingLink } from "../../engine/latin-hint.ts";
import { digitChar } from "./render.ts";
import type { SoloRegion } from "./solver.ts";

/** The reader-facing name of a region — the one statement of what a sentence
 * calls each region, read both by the sentences below and by `regionsOf`, which
 * tags every region it builds with it. */
export function regionName(region: SoloRegion): string {
  switch (region.kind) {
    case "row":
      return "row";
    case "col":
      return "column";
    case "block":
      return "block";
    case "diag0":
    case "diag1":
      return "diagonal";
  }
}

/** How a chain's last link lines up with this cell, where it is not by row or
 * column (the shared sentence's own default). */
function lastTie(region: SoloRegion): string | null {
  if (region.kind === "block") return "in this cell's block";
  if (region.kind === "diag0" || region.kind === "diag1")
    return "on this cell's diagonal";
  return null;
}

const g = digitChar;
/** Values that all go ("cross out 1 and 2"). */
const all = (ns: number[]): string => joinWith(ns.map(g));
/** Values of which any one would do, or none can ("no room for 1 or 2"). */
const any = (ns: number[]): string => joinOr(ns.map(g));

/** Solo's values are numbers, printed as the board prints them — the one word
 * and the one glyph the shared chain sentence needs from it. */
const SOLO_VOCAB: LatinVocab = { noun: "number", value: digitChar };

export const say = {
  populate: populateText("number"),

  /** `regions` names every kind of region a digit may not repeat in. */
  cleanObvious: (regions: string[]): string =>
    cleanObviousText("number", "placed", joinOr(regions)),

  /** A note step under the implicit reading; `regions` names the kinds of
   * region the cell lies in. */
  note: (ns: number[], every: boolean, regions: string[]): string =>
    noteText(ns.map(g), every, {
      noun: "number",
      placedVerb: "placed",
      regions: joinOr(regions),
    }),

  single: (n: number): string =>
    `Every other number has been ruled out in this cell, so it can only be ${g(n)}.`,

  /** A single in a note-less cell; `regions` as for {@link say.note}. */
  regionsFull: (n: number, regions: string[]): string =>
    `This cell's ${joinWith(regions)} already hold every other number, so it can only be ${g(n)}.`,

  hiddenSingle: (region: SoloRegion, n: number): string => {
    const r = regionName(region);
    return `In this ${r}, ${g(n)} can go in only this cell, since every other cell in the ${r} rules it out, so it must be ${g(n)}.`;
  },

  /** `regions` names the kinds of region the placed cell lies in. */
  dup: (n: number, regions: string[]): string =>
    `${indefinite(g(n), true)} ${g(n)} is placed here, so it can't repeat in its ${joinOr(regions)}: cross out the ${g(n)} from these cells.`,

  /** Every cell of `confined` that can take `n` also lies in `target`. */
  intersect: (confined: SoloRegion, target: SoloRegion, n: number): string => {
    const cName = regionName(confined);
    const tName = regionName(target);
    return `In this ${cName}, every cell that can still take ${g(n)} lies in this ${tName}, so ${g(n)} must be crossed out of the rest of it.`;
  },

  /** A set of cells inside `region` accounts for `ns`; with no region, the set
   * is a locked pattern across several lines.
   *
   * The region-less arm speaks of the cells the step shades, because there is no
   * region to name and the lines it used to point at were never marked. What it
   * claims is what the firing checks: in the columns those cells sit in, the
   * digit fits nowhere else, so each of their rows is spoken for. */
  set: (region: SoloRegion | null, ns: number[]): string =>
    region
      ? `Other cells in this ${regionName(region)} already account for ${all(ns)}, so ${ns.length === 1 ? "it" : "they"} must be crossed out here.`
      : `The highlighted cells are the only places ${all(ns)} fits in their columns, so no other ${all(ns)} fits in their rows: cross out ${all(ns)}.`,

  // The shared chain sentence, with Solo's own region vocabulary — its chain
  // hops through blocks and diagonals as well as lines, so both the region that
  // ties the conclusion back to the origin and the one that ties it to the last
  // link are named rather than assumed.
  forcing: (
    reason: { chain: readonly ForcingLink[] },
    struck: number,
    shares: SoloRegion,
    lastShares: SoloRegion,
  ): string =>
    narrateForcingChain(
      reason,
      struck,
      SOLO_VOCAB,
      regionName(shares),
      lastTie(lastShares),
    ),

  cageSingle: (n: number): string =>
    `The rest of this killer cage is filled in, and the one cell left must bring the cage to its total, so it can only be ${g(n)}.`,

  /** A row, column or block whose cages and filled digits leave one open cell.
   * The residual *is* the digit on this rung, so the sentence says it once, as
   * the thing left over. `total` is what the region must come to; every cell of
   * it belongs to some cage, so "the cages and digits inside it" never names an
   * empty set. */
  cageIntersect: (region: SoloRegion, total: number, n: number): string =>
    `This ${regionName(region)} must total ${total}; the cages and digits inside it account for all but ${g(n)}, so its one open cell must be ${g(n)}.`,

  cageMinMax: (clue: number, ns: number[]): string =>
    `This killer cage must total ${clue}; its other cells leave no room for ${any(ns)}, so ${ns.length === 1 ? "it" : "they"} must be crossed out.`,

  cageSums: (clue: number, ns: number[]): string =>
    `No way to make this killer cage total ${clue} uses ${any(ns)} in this cell, so ${ns.length === 1 ? "it" : "they"} must be crossed out.`,
};
