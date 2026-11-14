/**
 * Solo's hint steps from its ladder's techniques, run on the player's notes
 * (docs/hints-candidates.md § "Deduce from the notes when the mistake check
 * vouches for them"): each firing, as the legs a step a leg shows, with the
 * reason its words narrate, built from what the technique says.
 */

import type { Mark } from "../../engine/candidate-hint.ts";
import {
  type CandidateRung,
  type Firing,
  strikesOf,
  techniqueRung,
} from "../../engine/candidate-plan.ts";
import type { DeductionRecord } from "../../engine/deduction-record.ts";
import type { GridSpace } from "../../engine/describe-runtime.ts";
import { PLACE, valuesOf } from "../../engine/describe-runtime.ts";
import type { Firing as LadderFiring, Said } from "../../engine/ladder-runtime.ts";
import type { SetSays } from "../../engine/latin.compiled.ts";
import {
  type ConfinedLines,
  confinedLines,
  type LatinWingReason,
} from "../../engine/latin.ts";
import { byCell } from "../../engine/latin-notes.ts";
import type { Point } from "../../engine/types.ts";
import type * as solo from "./solo.compiled.ts";
import { soloNotesLadder } from "./solver.ts";
import { dealtOf, NO_CAGES, type SoloState, soloSpace } from "./state.ts";

/** A region a step names, and stripes. `index` is the row's y, the column's
 * x, or the block's number; the two diagonals carry no index. */
export type SoloRegion =
  | { kind: "row"; index: number }
  | { kind: "col"; index: number }
  | { kind: "block"; index: number }
  | { kind: "diag0" }
  | { kind: "diag1" };

/** Why a Solo step places or strikes: the premise a hint narrates and the
 * cells it shades. A single's (`single`, `regionsFull`, `hiddenSingle`) is
 * the walk's, read off the board as it places it. */
export type SoloReason =
  /** A naked single. */
  | { kind: "single" }
  /** A single in a cell with no notes, whose regions already hold every other
   * digit, under the implicit candidate reading. */
  | { kind: "regionsFull" }
  /** A digit placed at `(px, py)`, struck from the rest of a shared group. */
  | { kind: "dup"; n: number; px: number; py: number }
  /** Every cell of `confined` that can still take `n` also lies in `target`, so
   * `n` must sit in their overlap and is ruled out of the rest of `target`. One
   * of the two is a block, the other a row, column or diagonal. */
  | { kind: "intersect"; n: number; confined: SoloRegion; target: SoloRegion }
  /** A naked or hidden subset locks a set of digits to the `cells` of `region`. */
  | { kind: "set"; region: SoloRegion; cells: Point[] }
  /** One digit confined across several lines: every cell of the parallel
   * `lines` that can still take it is in `cells`, which lie in as many lines
   * the other way, so those have no other place for it. The deduction reads
   * every cell of `lines`, the ones the digit is absent from too. */
  | { kind: "set"; region?: undefined; lines: ConfinedLines; cells: Point[] }
  /** A hidden single: digit `n` fits only one cell of `region`. */
  | { kind: "hiddenSingle"; n: number; region: SoloRegion }
  | LatinWingReason
  /** Killer: the open cells of a {@link CageSum} come down to one, which must
   * make its whole `clue`. */
  | ({ kind: "cageSingle" } & CageSum)
  /** Killer: even the extreme the other cells of a {@link CageSum} can reach
   * leaves no room for `n` here. */
  | ({ kind: "cageMinMax" } & CageSum)
  /** Killer: no way to make a {@link CageSum}'s `clue` from different digits
   * uses `n` in this cell. */
  | ({ kind: "cageSums" } & CageSum);

/** Open cells a killer step knows the total of: `cells` must make `clue`, for
 * the reason `origin` gives. `reads` is what that rests on beyond `cells` and
 * the region `origin` names: the cage's filled cells, and the cells outside
 * the region of any cage counted as inside it. */
export interface CageSum {
  cells: Point[];
  clue: number;
  origin: CageOrigin;
  reads: Point[];
}

/** Why a {@link CageSum}'s cells must make its clue, each worked out from the
 * board in one step:
 *
 * - `cage`: they are a cage's open cells, whose digits so far make `placed`
 *   of its `total`.
 * - `region`: they are what a row, column or block leaves once its filled
 *   cells and the cages wholly inside it are taken out, so they make the rest
 *   of the region's total. They may span several cages.
 * - `outside`: they are a cage's open cells outside a region whose leftover
 *   cells, `inside`, all lie in that cage. The region says `inside` makes
 *   `insideSum`, so these make the cage's `total` less that and `placed`. */
export type CageOrigin =
  | { kind: "cage"; total: number; placed: number }
  | { kind: "region"; region: SoloRegion }
  | {
      kind: "outside";
      region: SoloRegion;
      total: number;
      placed: number;
      inside: Point[];
      insideSum: number;
    };

/** A {@link CageSum} but its cells and clue. */
type CageNote = Pick<CageSum, "origin" | "reads">;

/** The board a reason is read off: its units and cages, and the walk's
 * working grid as it stands when the firing is offered. */
class SoloBoard {
  readonly cr: number;
  readonly sp: GridSpace;
  readonly dealt: solo.Dealt;

  constructor(
    state: SoloState,
    readonly grid: ArrayLike<number>,
  ) {
    this.cr = state.cr;
    this.sp = soloSpace(state.cr, state.blocks, state.xtype);
    const k = state.killerData;
    this.dealt = k ? dealtOf(k.kblocks, k.kgrid, state.cr * state.cr) : NO_CAGES;
  }

  at(c: number): Point {
    return { x: c % this.cr, y: (c / this.cr) | 0 };
  }

  xy(cells: readonly number[]): Point[] {
    return cells.map((c) => this.at(c));
  }

  /** The region a sentence names for a unit of {@link sp}. */
  regionOf(u: number): SoloRegion {
    const cr = this.cr;
    if (u < cr) return { kind: "row", index: u };
    if (u < 2 * cr) return { kind: "col", index: u - cr };
    const diag = this.sp.diagonals.indexOf(u);
    if (diag === 0) return { kind: "diag0" };
    if (diag === 1) return { kind: "diag1" };
    return { kind: "block", index: u - 2 * cr };
  }

  /** What cage `r`'s open cells rest on, its total less `owed` being what its
   * filled cells make. */
  cageOf(r: number, owed: number): CageNote {
    const cells = this.dealt.cage.cells[r];
    const total = this.dealt.total.v[r];
    return {
      origin: { kind: "cage", total, placed: total - owed },
      reads: this.xy(cells.filter((c) => this.grid[c] !== 0)),
    };
  }

  /** What the cells unit `u` leaves once its filled cells and the cages `W`
   * whose open cells lie in it are taken out rest on: the unit, and those
   * cages' cells outside it. */
  leftOf(u: number, W: readonly number[]): CageNote {
    const inside = this.sp.lineCells[u];
    const outside = W.flatMap((r) =>
      this.dealt.cage.cells[r].filter((c) => !inside.includes(c)),
    );
    return {
      origin: { kind: "region", region: this.regionOf(u) },
      reads: this.xy([...inside, ...outside]),
    };
  }

  /** What the open cells of `L`'s cage outside unit `u` rest on, `L` being
   * what `u` leaves, making `s`. */
  outsideOf(
    u: number,
    W: readonly number[],
    L: readonly number[],
    s: number,
  ): CageNote {
    const left = this.leftOf(u, W);
    const r = this.dealt.cage.of[L[0]];
    const cells = this.dealt.cage.cells[r];
    let placed = 0;
    for (const c of cells) placed += this.grid[c];
    return {
      origin: {
        kind: "outside",
        region: this.regionOf(u),
        total: this.dealt.total.v[r],
        placed,
        inside: this.xy(L),
        insideSum: s,
      },
      reads: [...left.reads, ...this.xy(cells)],
    };
  }

  /** A reading of the cells unit `u` leaves, `L` (`i` = 0), or of the rest of
   * their cage, `R`. */
  part(
    kind: "cageMinMax" | "cageSums",
    { u, W, L, s, R, t, i }: solo.PartMinMaxSays["terms"],
  ): SoloReason {
    return i === 0
      ? { kind, cells: this.xy(L), clue: s, ...this.leftOf(u, W) }
      : { kind, cells: this.xy(R), clue: t, ...this.outsideOf(u, W, L, s) };
  }

  /** A `digitSet` firing as the lines its value is confined in: the columns
   * `T` hold it only in the rows `Y0 − Y`, and the rows `Y` only in the other
   * columns; the step names the view over fewer lines, and the places `d`
   * can still take in it as the notes `shown` show them. */
  digitSet(
    { d, Y0, X0, T, Y }: solo.DigitSetSays["terms"],
    shown: ArrayLike<number>,
  ): SoloReason {
    const cr = this.cr;
    const chosen = valuesOf(T);
    const byColumn = chosen.length <= Y0.length - chosen.length;
    const cells: Point[] = [];
    for (const y of Y0) {
      if (Y.includes(y) === byColumn) continue;
      for (const x of valuesOf(X0)) {
        const c = y * cr + x;
        if (((T >> x) & 1) === (byColumn ? 1 : 0) && this.grid[c] === 0)
          if (shown[c] & (1 << d)) cells.push({ x, y });
      }
    }
    const lines = byColumn
      ? confinedLines("col", chosen, cr)
      : confinedLines("row", [...Y], cr);
    return { kind: "set", lines, cells };
  }
}

/** What a firing of a technique that says anything says. */
function said<T>(f: LadderFiring): T {
  return (f.reasons[0] as Said<unknown, { terms: T }>).says.terms;
}

/**
 * A rung for each technique of Solo's ladder the hint takes a step from, in
 * the ladder's order, over the walk's working `grid`. `boxSingle` has none:
 * it is the walk's hidden single in a block. A killer placement is a step
 * of its own; a strike is a leg a cell, as its words are about "this cell",
 * but for a digit confined to an overlap, which strikes it from several
 * cells in one sentence.
 */
export function soloRungs<M, H>(
  state: SoloState,
  grid: ArrayLike<number>,
): CandidateRung<M, H, DeductionRecord, SoloReason>[] {
  const on = soloNotesLadder(state, grid);
  const b = new SoloBoard(state, grid);
  const cr = state.cr;
  type Legs = Firing<M, H, SoloReason>;
  const rung = (
    id: string,
    legs: (f: LadderFiring, shown: ArrayLike<number>) => Legs | null,
  ): CandidateRung<M, H, DeductionRecord, SoloReason> => techniqueRung(on, id, legs);
  const byCellLegs = (f: LadderFiring, reason: SoloReason): Legs =>
    byCell(strikesOf(f, cr)).map((strike) => ({ strike, reason }));
  const placed = (f: LadderFiring): Mark => {
    if (f.facts.length !== 3 || f.facts[0] !== PLACE)
      throw new Error("a killer placement that is not one placement");
    return { ...b.at(f.facts[1]), n: f.facts[2] };
  };
  return [
    rung("cageSingle", (f) => {
      const { r, c, t } = said<solo.CageSingleSays["terms"]>(f);
      const reason: SoloReason = {
        kind: "cageSingle",
        cells: [b.at(c)],
        clue: t,
        ...b.cageOf(r, t),
      };
      return [{ place: placed(f), reason }];
    }),
    // The unit's leftover is one cell, which makes the unit's sum, or the
    // rest of its cage is, which makes what the cage's total leaves.
    rung("regionRule", (f) => {
      const { u, W, L, s, t } = said<solo.RegionRuleSays["terms"]>(f);
      const m = placed(f);
      const own = L.length === 1 && m.y * cr + m.x === L[0];
      const reason: SoloReason = {
        kind: "cageSingle",
        cells: [m],
        clue: own ? s : t,
        ...(own ? b.leftOf(u, W) : b.outsideOf(u, W, L, s)),
      };
      return [{ place: m, reason }];
    }),
    rung("cageMinMax", (f) => {
      const { r, K, t } = said<solo.CageMinMaxSays["terms"]>(f);
      return byCellLegs(f, {
        kind: "cageMinMax",
        cells: b.xy(K),
        clue: t,
        ...b.cageOf(r, t),
      });
    }),
    rung("partMinMax", (f) =>
      byCellLegs(f, b.part("cageMinMax", said<solo.PartMinMaxSays["terms"]>(f))),
    ),
    rung("cageSums", (f) => {
      const { r, K, t } = said<solo.CageSumsSays["terms"]>(f);
      return byCellLegs(f, {
        kind: "cageSums",
        cells: b.xy(K),
        clue: t,
        ...b.cageOf(r, t),
      });
    }),
    rung("partSums", (f) =>
      byCellLegs(f, b.part("cageSums", said<solo.PartSumsSays["terms"]>(f))),
    ),
    rung("intersect", (f) => {
      const { L, b: box, d, first } = said<solo.IntersectSays["terms"]>(f);
      const line = b.regionOf(L);
      const block = b.regionOf(box);
      const reason: SoloReason = first
        ? { kind: "intersect", n: d, confined: line, target: block }
        : { kind: "intersect", n: d, confined: block, target: line };
      return [{ strike: strikesOf(f, cr), reason }];
    }),
    // The cells that hold the struck values between them, which the
    // sentence names as the other cells accounting for them.
    rung("latin.set", (f) => {
      const { u, S } = said<SetSays["terms"]>(f);
      return byCellLegs(f, { kind: "set", region: b.regionOf(u), cells: b.xy(S) });
    }),
    rung("digitSet", (f, shown) =>
      byCellLegs(f, b.digitSet(said<solo.DigitSetSays["terms"]>(f), shown)),
    ),
    rung("latin.wing", (f) => byCellLegs(f, f.reasons[0] as LatinWingReason)),
  ];
}
