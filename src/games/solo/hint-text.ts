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
  candidateConclusions,
  cleanObviousText,
  forcingChainPremise,
  indefinite,
  joinOr,
  joinWith,
  type LatinVocab,
  noteText,
  populateText,
} from "../../engine/hint-text.ts";
import type { ForcingLink } from "../../engine/latin-hint.ts";
import { digitChar } from "./render.ts";
import type { CageOrigin, SoloRegion } from "./solver.ts";

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

  // The strike arms below are premises, which the walk concludes with the move
  // it makes, in these words (`engine/hint-text.ts`'s `Premise`).
  conclude: candidateConclusions(SOLO_VOCAB),

  /** `regions` names the kinds of region the placed cell lies in. */
  dup: (n: number, regions: string[]): string =>
    `${indefinite(g(n), true)} ${g(n)} is placed here and can't repeat in its ${joinOr(regions)}`,

  /** Where the placement's cull strikes from. */
  dupWhere: "from these cells",

  /** Every cell of `confined` that can take `n` also lies in `target`. */
  intersect: (confined: SoloRegion, target: SoloRegion, n: number): string =>
    `In this ${regionName(confined)}, every cell that can still take ${g(n)} lies in this ${regionName(target)}`,

  /** Where an intersection strikes from: the rest of the target region. */
  intersectWhere: "from the rest of it",

  /** A set of cells inside `region` accounts for `ns`; with no region, the set
   * is a locked pattern across several lines.
   *
   * The region-less arm speaks of the cells the step outlines, because there is no
   * region to name and the lines it used to point at were never marked. What it
   * claims is what the firing checks: in the columns those cells sit in, the
   * digit fits nowhere else, so each of their rows is spoken for. */
  set: (region: SoloRegion | null, ns: number[]): string =>
    region
      ? `Other cells in this ${regionName(region)} already account for ${all(ns)}`
      : `Their columns fit ${all(ns)} only in the outlined cells, leaving no other ${all(ns)} in their rows`,

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
    forcingChainPremise(
      reason,
      struck,
      SOLO_VOCAB,
      regionName(shares),
      lastTie(lastShares),
    ),

  /** The one open cell of a {@link CageSum} must make its whole clue `n`. */
  cageSingle: (origin: CageOrigin, n: number, total: number): string => {
    switch (origin.kind) {
      case "cage":
        return origin.placed === 0
          ? `This killer cage has only this cell, so it must be its total, ${g(n)}.`
          : `This killer cage must total ${origin.total} and its other cells already make ${origin.placed}, so its last cell must be ${g(n)}.`;
      // The one sentence that states the region rule in full, the 45 and all:
      // the residual *is* the digit, so it says the number once, as the thing
      // left over, and has the room.
      case "region":
        return `This ${regionName(origin.region)} must total ${total}; the cages and digits inside it account for all but ${g(n)}, so its one open cell must be ${g(n)}.`;
      case "outside":
        return `${outsideRest(origin)}, so its last cell must be ${g(n)}.`;
    }
  },

  /** Even the extremes the other cells of a {@link CageSum} can reach leave no
   * room for `ns`. */
  cageMinMax: (origin: CageOrigin, clue: number, ns: number[]): string =>
    origin.kind === "cage" && origin.placed === 0
      ? `This killer cage must total ${clue}, and its other cells leave no room for ${any(ns)}`
      : `${cageSum(origin, clue)}; the others leave no room for ${any(ns)}`,

  /** No way to make a {@link CageSum}'s clue uses `ns` in this cell. */
  cageSums: (origin: CageOrigin, clue: number, ns: number[]): string =>
    origin.kind === "cage" && origin.placed === 0
      ? `No way to make this killer cage total ${clue} uses ${any(ns)} in this cell`
      : `${cageSum(origin, clue)}; no way to make that uses ${any(ns)} here`,
};

// The sums below lean on the picture: the region they name is hatched, the
// cells they leave a sum to are outlined, and a cage's clue and placed digits
// are on the board, so the sentence gives only the sum those leave. "Whole"
// cages are the ones the region rule takes out, not the one it leaves cells of.
// A strike on a region's sum is still two premises, the sum and the rung, and
// is listed long for it (`hint-quality.test.ts`'s `LONG_NARRATIONS`).

/** The region rule, as far as the cage its leftover cells all lie in. */
function outsideRest(origin: CageOrigin & { kind: "outside" }): string {
  const r = regionName(origin.region);
  return `This ${r}'s whole cages and digits leave ${origin.insideSum} for this killer cage's cells in the ${r}`;
}

/** Why the cells of a {@link CageSum} must make `clue`, as a clause that ends
 * on that sum. */
function cageSum(origin: CageOrigin, clue: number): string {
  switch (origin.kind) {
    case "cage":
      return `This killer cage's open cells make ${clue}`;
    case "region":
      return `This ${regionName(origin.region)}'s whole cages and digits leave ${clue} for the outlined cells`;
    case "outside":
      return `${outsideRest(origin)}, so ${clue} for the outlined ones`;
  }
}
