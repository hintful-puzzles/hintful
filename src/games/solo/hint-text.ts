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
 * Every word that points at the board is a reference to the mark it points at
 * (`engine/hint-words.ts`): the region a sentence is about ("this block", "this
 * killer cage") is striped, the particular cells it reasons from are outlined,
 * and "this cell" is the ringed cell the step decides. The walk reads the
 * step's marks off these references, so `cells` is how a sentence finds a
 * region's cells to stripe.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this file decides only how it reads.
 */

import {
  candidateConclusions,
  cleanObviousText,
  forcingChainPremise,
  joinOr,
  joinWith,
  type LatinVocab,
  noteText,
  placedRulesOut,
  populateText,
  thisCell,
} from "../../engine/hint-text.ts";
import {
  CELL,
  mark,
  type Narration,
  phrase,
  type Sentence,
  so,
  whole,
} from "../../engine/hint-words.ts";
import type { ForcingLink } from "../../engine/latin-hint.ts";
import type { Point } from "../../engine/types.ts";
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

/** A region's cells, for the sentence that stripes it. */
export type RegionCells = (region: SoloRegion) => readonly Point[];

/** "this row", "this block": the region the sentence is about, striped. */
function thisRegion(region: SoloRegion, cells: RegionCells): Narration {
  return mark.this("stripes", whole(CELL), cells(region), regionName(region));
}

/** "this killer cage", striped over the cage cells the deduction counts. */
const thisCage = (cage: readonly Point[]): Narration =>
  mark.this("stripes", whole(CELL), cage, "killer cage");

/** How a chain's last link lines up with this cell, where it is not by row or
 * column (the shared sentence's own default). */
function lastTie(region: SoloRegion): ((here: Narration) => Narration) | null {
  if (region.kind === "block") return (here) => phrase`in ${here}'s block`;
  if (region.kind === "diag0" || region.kind === "diag1")
    return (here) => phrase`on ${here}'s diagonal`;
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
  cleanObvious: (regions: string[]) =>
    cleanObviousText("number", "placed", joinOr(regions)),

  /** A note step under the implicit reading at `at`; `regions` names the
   * kinds of region the cell lies in. */
  note: (at: Point, ns: number[], every: boolean, regions: string[]): Sentence =>
    noteText(at, ns.map(g), every, {
      noun: "number",
      placedVerb: "placed",
      regions: joinOr(regions),
    }),

  single: (at: Point, n: number): Sentence =>
    so({
      look: phrase`Every other number has been ruled out in ${thisCell(at)}`,
      move: phrase`it can only be ${g(n)}`,
    }),

  /** A single in a note-less cell; `regions` as for {@link say.note}. */
  regionsFull: (at: Point, n: number, regions: string[]): Sentence =>
    so({
      look: phrase`${thisCell(at)}'s ${joinWith(regions)} already hold every other number`,
      move: phrase`it can only be ${g(n)}`,
    }),

  hiddenSingle: (
    at: Point,
    region: SoloRegion,
    n: number,
    cells: RegionCells,
  ): Sentence =>
    so({
      look: phrase`Every other cell in ${thisRegion(region, cells)} rules out ${g(n)}`,
      move: phrase`${thisCell(at)} must be ${g(n)}`,
    }),

  // The strike arms below are premises, which the walk concludes with the move
  // it makes, in these words (`engine/hint-text.ts`'s `Premise`).
  conclude: candidateConclusions(SOLO_VOCAB),

  /** The `n` just placed at `placed`; `regions` names the kinds of region it
   * lies in. */
  dup: (placed: Point, n: number, regions: string[]): Narration =>
    placedRulesOut({ px: placed.x, py: placed.y }, g(n), joinOr(regions)),

  /** Where the placement's cull strikes from. */
  dupWhere: "from these cells",

  /** Every cell of `confined` that can take `n` also lies in one `target`. */
  intersect: (
    confined: SoloRegion,
    target: SoloRegion,
    n: number,
    cells: RegionCells,
  ): Narration =>
    phrase`In ${thisRegion(confined, cells)}, every cell that can still take ${g(n)} lies in one ${regionName(target)}`,

  /** Where an intersection strikes from: the rest of the target region, the
   * one the premise just named last. */
  intersectWhere: "from the rest of it",

  /** The outlined `set` inside `region` accounts for `ns`. */
  set: (
    region: SoloRegion,
    set: readonly Point[],
    ns: number[],
    cells: RegionCells,
  ): Narration =>
    phrase`${mark.as("outline", CELL, set, "Other cells")} in ${thisRegion(region, cells)} already account for ${all(ns)}`,

  /** The parallel `lines` take `ns` only in the outlined `set`, which lies in
   * as many lines the other way.
   *
   * Every line is striped whole, because the claim is about all of it: the
   * player checks the digit is gone from each cell that is not outlined. The
   * two counts are the argument, so both are said. */
  confined: (
    lines: readonly SoloRegion[],
    set: readonly Point[],
    ns: number[],
    cells: RegionCells,
  ): Narration => {
    const k = lines.length;
    const [along, across] =
      lines[0].kind === "row" ? ["rows", "columns"] : ["columns", "rows"];
    const striped = mark.as(
      "stripes",
      CELL,
      lines.flatMap(cells),
      `These ${k} ${along}`,
    );
    return phrase`${striped} fit ${all(ns)} only in ${mark.the("outline", CELL, set, "cell")}, leaving their ${k} ${across} no other ${all(ns)}`;
  },

  // The shared chain sentence, with Solo's own region vocabulary — its chain
  // hops through blocks and diagonals as well as lines, so both the region that
  // ties the conclusion back to the origin and the one that ties it to the last
  // link are named rather than assumed.
  forcing: (
    reason: { chain: readonly ForcingLink[] },
    struck: Point & { n: number },
    shares: SoloRegion,
    lastShares: SoloRegion,
  ): Narration =>
    forcingChainPremise(
      reason,
      struck,
      SOLO_VOCAB,
      regionName(shares),
      lastTie(lastShares),
    ),

  /** The one open cell `at` of a {@link CageSum} over `open` must make its
   * whole clue `n`. */
  cageSingle: (
    at: Point,
    open: readonly Point[],
    origin: CageOrigin,
    n: number,
    total: number,
    cells: RegionCells,
  ): Sentence => {
    const last = mark.as("ring", CELL, [at], "its last cell");
    switch (origin.kind) {
      case "cage":
        return origin.placed === 0
          ? so({
              look: phrase`${thisCage(open)} has only ${thisCell(at)}`,
              move: phrase`it must be its total, ${g(n)}`,
            })
          : so({
              look: phrase`${thisCage(open)} must total ${origin.total} and its other cells already make ${origin.placed}`,
              move: phrase`${last} must be ${g(n)}`,
            });
      // The one sentence that states the region rule in full, the 45 and all:
      // the residual *is* the digit, so it says the number once, as the thing
      // left over, and has the room.
      case "region":
        return so({
          look: phrase`${thisRegion(origin.region, cells)} must total ${total}; the cages and digits inside it account for all but ${g(n)}`,
          move: phrase`${mark.as("ring", CELL, [at], "its one open cell")} must be ${g(n)}`,
        });
      case "outside":
        return so({
          look: outsideRest(origin, cells),
          move: phrase`${last} must be ${g(n)}`,
        });
    }
  },

  /** Even the extremes the other cells of a {@link CageSum} over `open` can
   * reach leave no room for `ns`. */
  cageMinMax: (
    open: readonly Point[],
    origin: CageOrigin,
    clue: number,
    ns: number[],
    cells: RegionCells,
  ): Narration =>
    origin.kind === "cage" && origin.placed === 0
      ? phrase`${thisCage(open).capitalized()} must total ${clue}, and its other cells leave no room for ${any(ns)}`
      : phrase`${cageSum(open, origin, clue, cells)}; the others leave no room for ${any(ns)}`,

  /** No way to make a {@link CageSum}'s clue over `open` uses `ns` in the struck
   * cell `at`. */
  cageSums: (
    at: Point,
    open: readonly Point[],
    origin: CageOrigin,
    clue: number,
    ns: number[],
    cells: RegionCells,
  ): Narration =>
    origin.kind === "cage" && origin.placed === 0
      ? phrase`No way to make ${thisCage(open)} total ${clue} uses ${any(ns)} in ${thisCell(at)}`
      : phrase`${cageSum(open, origin, clue, cells)}; no way to make that uses ${any(ns)} here`,
};

// The sums below lean on the picture: the region they name is striped, the
// cells they leave a sum to are outlined, and a cage's clue and placed digits
// are on the board, so the sentence gives only the sum those leave. "Whole"
// cages are the ones the region rule takes out, not the one it leaves cells of.
// A strike on a region's sum is still two premises, the sum and the rung, and
// is listed long for it (`hint-quality.test.ts`'s `LONG_NARRATIONS`).

/** The region rule, as far as the cage its leftover cells, `inside`, all lie
 * in; they are outlined. */
function outsideRest(
  origin: CageOrigin & { kind: "outside" },
  cells: RegionCells,
): Narration {
  const r = regionName(origin.region);
  return phrase`${thisRegion(origin.region, cells).capitalized()}'s whole cages and digits leave ${origin.insideSum} for ${mark.as("outline", CELL, origin.inside, `this killer cage's cells in the ${r}`)}`;
}

/** Why the open cells `open` of a {@link CageSum} must make `clue`, as a clause
 * that ends on that sum. */
function cageSum(
  open: readonly Point[],
  origin: CageOrigin,
  clue: number,
  cells: RegionCells,
): Narration {
  switch (origin.kind) {
    case "cage":
      return phrase`${mark.as("stripes", whole(CELL), open, "This killer cage's open cells")} make ${clue}`;
    case "region":
      return phrase`${thisRegion(origin.region, cells).capitalized()}'s whole cages and digits leave ${clue} for ${mark.the("outline", CELL, open, "cell")}`;
    case "outside":
      return phrase`${outsideRest(origin, cells)}, so ${clue} for ${mark.as("outline", CELL, open, "its other cells")}`;
  }
}
