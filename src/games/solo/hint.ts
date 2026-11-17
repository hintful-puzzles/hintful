/**
 * Every sentence Solo's hint speaks: its own are the steps
 * `solo.description.yaml` declares, spoken through the module's voice; the
 * generic Latin arms are the engine's (`engine/hint-text.ts`), their reasons
 * naming the units they read ("row, column and block", or the block or
 * diagonal a hidden single sits in).
 *
 * A value prints as the board draws it (`render.ts`'s `digitChar`: 1 to 9,
 * then a, b, … past 9), so a 12×12 grid's hint names the "c" the player can
 * see rather than a "12" they cannot.
 *
 * The deduction decides which sentence and with what values (`index.ts`'s
 * `narrate`); this module decides only how it reads.
 */

import {
  candidateConclusions,
  cleanObviousText,
  joinOr,
  type LatinVocab,
  noteText,
  placedRulesOut,
  populateText,
} from "../../engine/hint-text.ts";
import {
  CELL,
  type MarkKind,
  type Narration,
  type Sentence,
  whole,
} from "../../engine/hint-words.ts";
import type { Unit } from "../../engine/step-voice.ts";
import type { Point } from "../../engine/types.ts";
import { voice, WORDS } from "../../generated/games/solo/solo.compiled.ts";
import type { CageOrigin, SoloRegion } from "./hint-reasons.ts";
import { digitChar } from "./render.ts";

/** The reader-facing name of a region: the one statement of what a sentence
 * calls each region, read both by the sentences below and by `regionsOf`, which
 * tags every region it builds with it. */
export function regionName(region: SoloRegion): Unit {
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

/** Sudoku's board position is a cell: its help says so, and a square is also
 * the whole grid ("Latin square"). */
const CELL_WORD = WORDS.cell;

/** Solo's values are numbers, printed as the board prints them, and a wing's
 * ends each share a row, column, diagonal ("a line") or block with the struck
 * cell: what the solver's wing counts, which a cage is not. */
export const SOLO_VOCAB: LatinVocab = {
  noun: "number",
  cell: CELL_WORD,
  value: digitChar,
  beside: WORDS.alongside,
};

/** A region and a cage are striped whole; every other mark is a cell's. */
const speak = voice<Point>({
  kind: CELL,
  kinds: {
    region: whole(CELL) as MarkKind<Point>,
    cage: whole(CELL) as MarkKind<Point>,
  },
  value: digitChar,
  noun: CELL_WORD,
});

/** A sum's origin, as the steps' terms and marks read it. A region's cells
 * are striped where the sum is a region's; `cage` is the sum's open cells,
 * striped where it is a cage's own. */
function sumOf(origin: CageOrigin, open: readonly Point[], cells: RegionCells) {
  const region = origin.kind === "cage" ? null : origin.region;
  return {
    terms: {
      axis: region === null ? ("row" as const) : regionName(region),
      rest: origin.kind === "outside" ? origin.insideSum : 0,
      byCage: origin.kind === "cage",
      byRegion: origin.kind === "region",
      fresh: origin.kind === "cage" && origin.placed === 0,
    },
    marks: {
      stripes: {
        cage: origin.kind === "cage" ? open : [],
        region: region === null ? [] : cells(region),
      },
      outline: {
        inside: origin.kind === "outside" ? origin.inside : [],
        open: origin.kind === "cage" ? [] : open,
      },
    },
  };
}

export const say = {
  populate: populateText("number", CELL_WORD),

  /** `regions` names every kind of region a digit may not repeat in. */
  cleanObvious: (regions: string[]) =>
    cleanObviousText("number", "placed", joinOr(regions), CELL_WORD),

  /** A note step under the implicit reading at `at`; `regions` names the
   * kinds of region the cell lies in. */
  note: (at: Point, ns: number[], every: boolean, regions: string[]): Sentence =>
    noteText(at, ns.map(digitChar), every, {
      noun: "number",
      placedVerb: "placed",
      regions: joinOr(regions),
      cell: CELL_WORD,
    }),

  // The strike arms below are premises, which the walk concludes with the move
  // it makes, in these words (`engine/hint-text.ts`'s `Premise`).
  conclude: candidateConclusions(SOLO_VOCAB),

  /** The `n` just placed at `placed`; `regions` names the kinds of region it
   * lies in. */
  dup: (placed: Point, n: number, regions: string[]): Narration =>
    placedRulesOut({ px: placed.x, py: placed.y, n }, digitChar, joinOr(regions)),

  /** Where the placement's cull strikes from. */
  dupWhere: "from the other cells",

  /** Every cell of `confined` that can take `n` also lies in one `target`. */
  intersect: (
    confined: SoloRegion,
    target: SoloRegion,
    n: number,
    cells: RegionCells,
  ): Narration =>
    speak.premise("intersect", {
      terms: { axis: regionName(confined), target: regionName(target), n },
      marks: { stripes: { region: cells(confined) } },
    }),

  /** Where an intersection strikes from: the rest of the target region, the
   * one the premise just named last. */
  intersectWhere: (target: SoloRegion): string =>
    speak.part("intersect", "move", {
      terms: { axis: "row", target: regionName(target), n: 0 },
      marks: { stripes: { region: [] } },
    }).text,

  /** The outlined `set` inside `region` accounts for `ns`. */
  set: (
    region: SoloRegion,
    set: readonly Point[],
    ns: number[],
    cells: RegionCells,
  ): Narration =>
    speak.premise("set", {
      terms: { axis: regionName(region), vs: ns },
      marks: { stripes: { region: cells(region) }, outline: { set } },
    }),

  /** The one open cell `at` of a sum over `open` must make its whole clue
   * `n`; `total` is a region's. */
  cageSingle: (
    at: Point,
    open: readonly Point[],
    origin: CageOrigin,
    n: number,
    total: number,
    cells: RegionCells,
  ): Sentence => {
    const { terms, marks } = sumOf(origin, open, cells);
    return speak.sentence("cageSingle", {
      ring: [at],
      terms: {
        ...terms,
        n,
        total: origin.kind === "region" ? total : origin.total,
        placed: origin.kind === "region" ? 0 : origin.placed,
      },
      marks: { stripes: marks.stripes, outline: { inside: marks.outline.inside } },
    });
  },

  /** Even the extremes the other cells of a sum over `open` can reach leave
   * no room for `ns`. */
  cageMinMax: (
    open: readonly Point[],
    origin: CageOrigin,
    clue: number,
    ns: number[],
    cells: RegionCells,
  ): Narration => {
    const { terms, marks } = sumOf(origin, open, cells);
    return speak.premise("cageMinMax", { terms: { ...terms, vs: ns, clue }, marks });
  },

  /** No way to make a sum's clue over `open` uses `ns` in the struck cell
   * `at`. */
  cageSums: (
    at: Point,
    open: readonly Point[],
    origin: CageOrigin,
    clue: number,
    ns: number[],
    cells: RegionCells,
  ): Narration => {
    const { terms, marks } = sumOf(origin, open, cells);
    return speak.premise("cageSums", {
      ring: [at],
      terms: { ...terms, vs: ns, clue },
      marks,
    });
  },
};
