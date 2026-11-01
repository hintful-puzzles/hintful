/**
 * Solo (Sudoku) solver: the ladder `solo.description.yaml` states, compiled,
 * on the engine's marks and runner (`engine/ladder-runtime.ts`), each rung
 * able to run alone; then upstream's forcing chain (`solver_forcing`) and
 * bounded recursion, which no description states.
 *
 * The solver doubles as the generator's grading oracle: the solver-gated
 * minimizer removes givens while this solver still solves at the target
 * difficulty, so the published board depends on its verdict on every
 * intermediate grid.
 *
 * The killer working cages are plain arrays (`Cages`) rather than C's flat
 * `block_structure`; a cage keeps its index as its filled cells leave it.
 */

import type {
  DeductionTechnique,
  FiringTally,
} from "../../engine/deduction-fixpoint.ts";
import { valuesOf } from "../../engine/describe-runtime.ts";
import { auditingPremises, offerReplay } from "../../engine/firing-replay.ts";
import {
  CellMarks,
  compiledRung,
  type Ladder,
  ladderReplay,
  ladderTechniques,
  runLadder,
  TIERS,
  uncluedRung,
} from "../../engine/ladder-runtime.ts";
import { set as latinSet } from "../../engine/latin.compiled.ts";
import {
  type ConfinedLines,
  confinedLines,
  type DeductionRecord,
  type DeductionRecorder,
  type LatinWingReason,
  latinLadder,
} from "../../engine/latin.ts";
import type { Point } from "../../engine/types.ts";
import * as solo from "./solo.compiled.ts";
import type { BlockStructure, SoloState } from "./state.ts";
import {
  DIFF_AMBIGUOUS,
  DIFF_BLOCK,
  DIFF_EXTREME,
  DIFF_IMPOSSIBLE,
  DIFF_KINTERSECT,
  DIFF_KSINGLE,
  DIFF_RECURSIVE,
  dealtOf,
  diag0,
  diag1,
  NO_CAGES,
  onDiag0,
  onDiag1,
  soloSpace,
} from "./state.ts";

// --- hint recording (opt-in; off for generate/solve) ------------------------

/** A region the solver reasons over, for narration + evidence shading. `index`
 * is the row's y, the column's x, or the sub-block's block number; the two
 * diagonals carry no index. */
export type SoloRegion =
  | { kind: "row"; index: number }
  | { kind: "col"; index: number }
  | { kind: "block"; index: number }
  | { kind: "diag0" }
  | { kind: "diag1" };

/** Why a Solo deduction forced a candidate change — the premise a hint narrates
 * and the cells it shades. Combined into {@link HintOp}'s `reason`.
 *
 * The placement reasons (`single` / `hiddenSingle`) are
 * re-derived from the working board at emit time, because the recorded `place`
 * carries a bare `single`: the solver's positional and numeric `elim` conflate
 * naked and hidden singles. The killer placement reason (`cageSingle`) is
 * recorded directly because the working board can't re-derive it. */
export type SoloReason =
  /** A forced single placement — re-derived to naked or hidden at emit. */
  | { kind: "single" }
  /** A single in a cell with no notes, whose regions already hold every other
   * digit: re-derived at emit under the implicit candidate reading. */
  | { kind: "regionsFull" }
  /** A digit placed at `(px, py)`, struck from the rest of a shared group. */
  | { kind: "dup"; n: number; px: number; py: number }
  /** Every cell of `confined` that can still take `n` also lies in `target`, so
   * `n` must sit in their overlap and is ruled out of the rest of `target`. One
   * of the two is a sub-block, the other a row/column/diagonal. */
  | { kind: "intersect"; n: number; confined: SoloRegion; target: SoloRegion }
  /** A naked/hidden subset locks a set of digits to the `cells` of `region`. */
  | { kind: "set"; region: SoloRegion; cells: Point[] }
  /** One digit confined across several lines: every cell of the parallel
   * `lines` that can still take it is in `cells`, which lie in as many lines
   * the other way, so those have no other place for it. The deduction reads
   * every cell of `lines`, the ones the digit is absent from too. */
  | { kind: "set"; region?: undefined; lines: ConfinedLines; cells: Point[] }
  /** A *hidden* single — digit `n` fits only one cell of `region`. */
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

/** Open cells a killer deduction knows the total of: `cells` must make `clue`,
 * for the reason `origin` gives. `reads` is what that rests on beyond `cells`
 * and the region `origin` names (`DeductionRecord`): the cage's filled cells,
 * and the cells outside the region of any cage counted as inside it. */
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

/** A reason attached to a recorded Solo deduction (the narrowed hint reason). */
export type HintReason = SoloReason;

/** One recorded Solo deduction op (a {@link DeductionRecord} with a Solo reason). */
export interface HintOp extends DeductionRecord {
  reason: HintReason;
}

// --- difficulty struct ------------------------------------------------------

export interface Difficulty {
  /** Maximum levels allowed. */
  maxdiff: number;
  maxkdiff: number;
  /** Levels reached by the solver (output). */
  diff: number;
  kdiff: number;
}

// --- mutable killer cages ---------------------------------------------------
// nr_squares[b] === blocks[b].length; nr_blocks === blocks.length.

interface Cages {
  whichblock: Int32Array;
  blocks: number[][];
}

/** The killer working state: the cages less the cells filled when they were
 * last brought up to date, and what of each cage's total those leave. */
interface KillerWork {
  kblocks: Cages;
  kclues: number[];
}

/** A {@link CageSum} but its cells and clue, which the rung has already. */
type CageNote = Pick<CageSum, "origin" | "reads">;

function dupCages(src: BlockStructure): Cages {
  return {
    whichblock: src.whichblock.slice(),
    blocks: src.blocks.map((b) => b.slice()),
  };
}

/** `remove_from_block`: drop cell `n` from cage `b`, mark it ownerless. */
function removeFromBlock(cages: Cages, b: number, n: number): void {
  cages.whichblock[n] = -1;
  const blk = cages.blocks[b];
  blk.splice(blk.indexOf(n), 1);
}

// --- solver usage -----------------------------------------------------------

class SolverUsage extends CellMarks {
  readonly cr: number;
  readonly blocks: BlockStructure;
  /** The killer cages and their totals as the compiled techniques read them;
   * none on a board without them. */
  private readonly dealt: solo.Dealt;
  /** The killer cages as given. */
  private readonly cages: BlockStructure | null;
  private readonly xtype: boolean;
  private readonly kgrid: ArrayLike<number> | null;
  /** The killer working cages, null on a board without cages. */
  private readonly killer: KillerWork | null;
  /** The ladder over this board's cages. */
  private readonly rungs: Ladder<SolverUsage>;
  /** The grid we write deductions into (the caller's grid, mutated in place). */
  declare grid: Int8Array;

  // The forcing chain's scratch buffers (solver_scratch).
  private readonly sGrid: Uint8Array;
  private readonly sNeighbors: Int32Array;
  private readonly sBfsqueue: Int32Array;

  /** Stashed by {@link recordSoloDeductions}; promoted to `recorder` after the
   * givens are placed, so that seeding them is not mistaken for teachable
   * deductions. */
  pendingRecorder?: DeductionRecorder;
  /** Called once the givens are placed and the recorder is on: where the
   * premise audit starts its replay (`recordSoloDeductions`). */
  onSeeded?: () => void;

  constructor(
    cr: number,
    blocks: BlockStructure,
    kblocks: BlockStructure | null,
    xtype: boolean,
    grid: Int8Array,
    kgrid: ArrayLike<number> | null,
  ) {
    const area = cr * cr;
    super(soloSpace(cr, blocks, xtype), (1 << (cr + 1)) - 2, grid);
    this.cr = cr;
    this.blocks = blocks;
    this.cages = kblocks;
    this.xtype = xtype;
    this.kgrid = kgrid;

    // Killer state exists iff we have both the cages and the clue grid (upstream
    // gates every killer deduction on `kclues != NULL`, which is built only when
    // kgrid is present — so coupling the two matches that behavior).
    if (kblocks && kgrid) {
      const nclues = kblocks.nrBlocks;
      const kclues = new Array<number>(area).fill(0);
      for (let i = 0; i < nclues; i++) {
        for (const cell of kblocks.blocks[i]) {
          if (kgrid[cell] !== 0) kclues[i] = kgrid[cell];
        }
      }
      this.killer = { kblocks: dupCages(kblocks), kclues: kclues.slice() };
      this.dealt = dealtOf(kblocks, kgrid, area);
    } else {
      this.killer = null;
      this.dealt = NO_CAGES;
    }
    this.rungs = this.describedLadder();
    this.placing = this.rungs.placing;

    this.sGrid = new Uint8Array(area);
    this.sNeighbors = new Int32Array(5 * cr);
    this.sBfsqueue = new Int32Array(area);
  }

  private cubeAt(x: number, y: number, n: number): boolean {
    return this.has(y * this.cr + x, n);
  }

  /** `solver_forcing`: forcing-chain deduction via per-candidate BFS. +1 / 0.
   * Each link is a conditional no mark records, so a chain is a supposition
   * and runs only at the recursive level, which no hint records at. */
  private forcing(): number {
    const cr = this.cr;
    const bfsqueue = this.sBfsqueue;
    const number = this.sGrid;
    const neighbors = this.sNeighbors;

    for (let y = 0; y < cr; y++) {
      for (let x = 0; x < cr; x++) {
        let count = 0;
        let t = 0;
        for (let nn = 1; nn <= cr; nn++)
          if (this.cubeAt(x, y, nn)) {
            count++;
            t += nn;
          }
        if (count !== 2) continue;

        for (let n = 1; n <= cr; n++) {
          if (!this.cubeAt(x, y, n)) continue;
          const orign = n;
          number.fill(cr + 1, 0, cr * cr);
          let head = 0;
          let tail = 0;
          bfsqueue[tail++] = y * cr + x;
          number[y * cr + x] = t - n;

          while (head < tail) {
            let xx = bfsqueue[head++];
            const yy = (xx / cr) | 0;
            xx %= cr;
            const currn = number[yy * cr + xx];

            let nneighbors = 0;
            for (let yt = 0; yt < cr; yt++) neighbors[nneighbors++] = yt * cr + xx;
            for (let xt = 0; xt < cr; xt++) neighbors[nneighbors++] = yy * cr + xt;
            const blkIdx = this.blocks.whichblock[yy * cr + xx];
            for (let yt = 0; yt < cr; yt++)
              neighbors[nneighbors++] = this.blocks.blocks[blkIdx][yt];
            if (this.xtype) {
              const sqindex = yy * cr + xx;
              if (onDiag0(sqindex, cr))
                for (let i = 0; i < cr; i++) neighbors[nneighbors++] = diag0(i, cr);
              if (onDiag1(sqindex, cr))
                for (let i = 0; i < cr; i++) neighbors[nneighbors++] = diag1(i, cr);
            }

            for (let i = 0; i < nneighbors; i++) {
              const xt = neighbors[i] % cr;
              const yt = (neighbors[i] / cr) | 0;
              if (number[yt * cr + xt] <= cr) continue;
              if (!this.cubeAt(xt, yt, currn)) continue;
              if (xt === xx && yt === yy) continue;

              let cc = 0;
              let tt = 0;
              for (let nn = 1; nn <= cr; nn++)
                if (this.cubeAt(xt, yt, nn)) {
                  cc++;
                  tt += nn;
                }
              if (cc === 2) {
                bfsqueue[tail++] = yt * cr + xt;
                number[yt * cr + xt] = tt - currn;
              }

              if (
                currn === orign &&
                (xt === x ||
                  yt === y ||
                  this.blocks.whichblock[yt * cr + xt] ===
                    this.blocks.whichblock[y * cr + x] ||
                  (this.xtype &&
                    ((onDiag0(yt * cr + xt, cr) && onDiag0(y * cr + x, cr)) ||
                      (onDiag1(yt * cr + xt, cr) && onDiag1(y * cr + x, cr)))))
              ) {
                this.strikeAt(yt * cr + xt, orign);
                return 1;
              }
            }
          }
        }
      }
    }
    return 0;
  }

  /** Cell indices → reading-order `{x, y}` (for a recorded cage reason). */
  private cellsXY(cells: readonly number[]): Point[] {
    const cr = this.cr;
    return cells.map((c) => ({ x: c % cr, y: (c / cr) | 0 }));
  }

  // --- the ladder ------------------------------------------------------------
  // Each rung runs once from the solver's state and says what it did as
  // `DeductionTechnique.run` does: `> 0` fired, `0` found nothing, `< 0` proved
  // the board inconsistent. A rung reads nothing but that state, so any one of
  // them can run alone: the premise audit's replay does (`soloReplay`).

  /** Take each cage's newly filled cells out of its working cage and its clue,
   * striking their digits from the rest of the cage; -1 if a digit is more
   * than its cage has left. A no-op until another cell is placed. */
  private reduceCages(k: KillerWork): number {
    const { kblocks, kclues } = k;
    // Reverse walk: removal compacts.
    for (let b = 0; b < kblocks.blocks.length; b++) {
      for (let i = kblocks.blocks[b].length - 1; i >= 0; i--) {
        const x = kblocks.blocks[b][i];
        const t = this.grid[x];
        if (t === 0) continue;
        removeFromBlock(kblocks, b, x);
        if (t > kclues[b]) return -1;
        kclues[b] -= t;
        for (let nn = 0; nn < kblocks.blocks[b].length; nn++)
          this.strikeAt(kblocks.blocks[b][nn], t);
      }
    }
    return 0;
  }

  /** The region a sentence names for a unit of {@link sp}. */
  private regionOf(u: number): SoloRegion {
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
  private cageOf(r: number, owed: number): CageNote {
    const cells = this.dealt.cage.cells[r];
    const total = this.dealt.total.v[r];
    return {
      origin: { kind: "cage", total, placed: total - owed },
      reads: this.cellsXY(cells.filter((c) => this.grid[c] !== 0)),
    };
  }

  /** What the cells unit `u` leaves once its filled cells and the cages `W`
   * whose open cells lie in it are taken out rest on: the unit, and those
   * cages' cells outside it. */
  private leftOf(u: number, W: readonly number[]): CageNote {
    const inside = this.sp.lineCells[u];
    const outside = W.flatMap((r) =>
      this.dealt.cage.cells[r].filter((c) => !inside.includes(c)),
    );
    return {
      origin: { kind: "region", region: this.regionOf(u) },
      reads: this.cellsXY([...inside, ...outside]),
    };
  }

  /** What the open cells of `L`'s cage outside unit `u` rest on, `L` being
   * what `u` leaves, making `s`. */
  private outsideOf(
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
        inside: this.cellsXY([...L]),
        insideSum: s,
      },
      reads: [...left.reads, ...this.cellsXY(cells)],
    };
  }

  /** The reason of a reading of the cells `u` leaves, `L`, or of the rest of
   * their cage, `R`: whichever holds `cell`. */
  private partOf(
    kind: "cageMinMax" | "cageSums",
    { u, W, L, s, R, t }: solo.PartMinMaxBinding | solo.PartSumsBinding,
    cell: number,
  ): SoloReason {
    return L.includes(cell)
      ? { kind, cells: this.cellsXY([...L]), clue: s, ...this.leftOf(u, W) }
      : { kind, cells: this.cellsXY([...R]), clue: t, ...this.outsideOf(u, W, L, s) };
  }

  /** A {@link digitSet} firing as the lines its value is confined in: the
   * columns `T` hold it only in the rows `Y0 − Y`, and the rows `Y` only in
   * the other columns, and the one over fewer lines is recorded. */
  private digitSetReason({ d, Y0, X0, T, Y }: solo.DigitSetBinding): SoloReason {
    const cr = this.cr;
    const chosen = valuesOf(T);
    const byColumn = chosen.length <= Y0.length - chosen.length;
    const cells: Point[] = [];
    for (const y of Y0) {
      if (Y.includes(y) === byColumn) continue;
      for (const x of valuesOf(X0))
        if (((T >> x) & 1) === (byColumn ? 1 : 0) && this.has(y * cr + x, d))
          cells.push({ x, y });
    }
    const lines = byColumn
      ? confinedLines("col", chosen, cr)
      : confinedLines("row", [...Y], cr);
    return { kind: "set", lines, cells };
  }

  /**
   * The ladder `solo.description.yaml` states, its own techniques paired
   * here with the reason each records, the library's by the engine but its
   * set, whose reason names the region it reads.
   */
  private describedLadder(): Ladder<SolverUsage> {
    const { dealt } = this;
    const at = (c: number): Point => ({ x: c % this.cr, y: (c / this.cr) | 0 });
    const single = (): SoloReason => ({ kind: "single" });
    return latinLadder(solo, {
      boxSingle: uncluedRung(solo.boxSingle, single),
      cageSingle: compiledRung(
        solo.cageSingle,
        dealt,
        ({ r, c, t }): SoloReason => ({
          kind: "cageSingle",
          cells: [at(c)],
          clue: t,
          ...this.cageOf(r, t),
        }),
      ),
      regionRule: compiledRung(
        solo.regionRule,
        dealt,
        ({ u, W, L, s, t }, cell): SoloReason =>
          cell === L[0] && L.length === 1
            ? { kind: "cageSingle", cells: [at(cell)], clue: s, ...this.leftOf(u, W) }
            : {
                kind: "cageSingle",
                cells: [at(cell)],
                clue: t,
                ...this.outsideOf(u, W, L, s),
              },
      ),
      cageMinMax: compiledRung(
        solo.cageMinMax,
        dealt,
        ({ r, K, t }): SoloReason => ({
          kind: "cageMinMax",
          cells: this.cellsXY([...K]),
          clue: t,
          ...this.cageOf(r, t),
        }),
      ),
      partMinMax: compiledRung(solo.partMinMax, dealt, (b, cell) =>
        this.partOf("cageMinMax", b, cell),
      ),
      cageSums: compiledRung(
        solo.cageSums,
        dealt,
        ({ r, K, t }): SoloReason => ({
          kind: "cageSums",
          cells: this.cellsXY([...K]),
          clue: t,
          ...this.cageOf(r, t),
        }),
      ),
      partSums: compiledRung(solo.partSums, dealt, (b, cell) =>
        this.partOf("cageSums", b, cell),
      ),
      intersect: uncluedRung(solo.intersect, ({ L, b, d, first }): SoloReason => {
        const line = this.regionOf(L);
        const block = this.regionOf(b);
        return first
          ? { kind: "intersect", n: d, confined: line, target: block }
          : { kind: "intersect", n: d, confined: block, target: line };
      }),
      "latin.set": uncluedRung(
        latinSet,
        ({ u, open, S }): SoloReason => ({
          kind: "set",
          region: this.regionOf(u),
          cells: open.filter((c) => !S.includes(c)).map(at),
        }),
      ),
      digitSet: uncluedRung(solo.digitSet, (b) => this.digitSetReason(b)),
    });
  }

  /**
   * The ladder at `dlev`'s caps, easiest first in its order: a technique on
   * the killer scale is capped and graded by `kdiff`, every other by `diff`;
   * the forcing chain, which no description states, comes after them. A
   * killer technique first brings the working cages up to date, striking
   * each filled cell's value from the rest of its cage, as upstream did at
   * the start of each.
   */
  techniques(dlev: Difficulty, grades: Record<string, number>): DeductionTechnique[] {
    const killer = this.killer;
    const caps: Record<string, number> = { [TIERS]: dlev.maxdiff };
    if (killer !== null) caps["killer"] = dlev.maxkdiff;
    const rungs = ladderTechniques(this, this.rungs.entries, caps, grades, (entry) =>
      killer !== null && entry.scale === "killer" ? this.reduceCages(killer) : 0,
    );
    if (dlev.maxdiff >= DIFF_RECURSIVE)
      rungs.push({
        id: "forcing-chain",
        tier: DIFF_RECURSIVE,
        run: () => {
          const ret = this.forcing();
          if (ret > 0 && DIFF_RECURSIVE > grades[TIERS]) grades[TIERS] = DIFF_RECURSIVE;
          return ret;
        },
      });
    return rungs;
  }

  /** Place every given; false if two of them clash. */
  seedGivens(): boolean {
    return this.seed(this.grid);
  }

  /**
   * The solve (`solver`'s body): place the givens, run the ladder to a
   * fixpoint, then search if the caps allow it. Mutates `this.grid` and writes
   * `dlev.diff`/`dlev.kdiff`. Recurses through the module-level `runSolver`.
   * `firings` is the ladder census's channel (`solo-ladder.test.ts`).
   */
  run(dlev: Difficulty, firings?: FiringTally): void {
    const cr = this.cr;
    const grid = this.grid;
    const grades = { [TIERS]: DIFF_BLOCK, killer: DIFF_KSINGLE };
    const finish = (d: number): void => {
      dlev.diff = d;
      dlev.kdiff = grades.killer;
    };

    if (!this.seedGivens()) {
      finish(DIFF_IMPOSSIBLE);
      return;
    }
    // Givens are seeded; from here every deduction is teachable, so enable the
    // recorder (kept off through the given placement above so cube-seeding dups
    // aren't mistaken for deductions — `docs/hints-candidates.md` § "The recorder
    // and the soundness boundary").
    this.recorder = this.pendingRecorder;
    this.onSeeded?.();

    const impossible = runLadder(this, this.techniques(dlev, grades), { firings });
    if (impossible) {
      finish(DIFF_IMPOSSIBLE);
      return;
    }
    let diff = grades[TIERS];

    // Recursion, if permitted and the grid is not yet full.
    if (dlev.maxdiff >= DIFF_RECURSIVE) {
      let best = -1;
      let bestcount = cr + 1;
      for (let y = 0; y < cr; y++)
        for (let x = 0; x < cr; x++)
          if (!grid[y * cr + x]) {
            let count = 0;
            for (let n = 1; n <= cr; n++) if (this.cubeAt(x, y, n)) count++;
            // count > 1 guaranteed (impossibilities found earlier).
            if (count < bestcount) {
              bestcount = count;
              best = y * cr + x;
            }
          }

      if (best !== -1) {
        diff = DIFF_IMPOSSIBLE; // no solution found yet
        const y = (best / cr) | 0;
        const x = best % cr;

        const ingrid = grid.slice();
        const list: number[] = [];
        for (let n = 1; n <= cr; n++) if (this.cubeAt(x, y, n)) list.push(n);

        for (let i = 0; i < list.length; i++) {
          const outgrid = ingrid.slice();
          outgrid[y * cr + x] = list[i];

          runSolver(cr, this.blocks, this.cages, this.xtype, outgrid, this.kgrid, dlev);

          if (diff === DIFF_IMPOSSIBLE && dlev.diff !== DIFF_IMPOSSIBLE)
            grid.set(outgrid);

          // A second solution makes the board ambiguous; an impossible branch
          // leaves the verdict as it was.
          if (dlev.diff === DIFF_AMBIGUOUS) diff = DIFF_AMBIGUOUS;
          else if (dlev.diff !== DIFF_IMPOSSIBLE)
            diff = diff === DIFF_IMPOSSIBLE ? DIFF_RECURSIVE : DIFF_AMBIGUOUS;

          if (diff === DIFF_AMBIGUOUS) break;
        }
      }
    } else if (grid.includes(0)) {
      diff = DIFF_IMPOSSIBLE; // recursion forbidden: success iff the grid is full
    }

    finish(diff);
  }
}

/**
 * Low-level solver, faithful to `solo.c`'s `solver()`. Mutates `grid` in place
 * (writing deductions / the recursive solution) and sets `dlev.diff`/`.kdiff`.
 */
export function runSolver(
  cr: number,
  blocks: BlockStructure,
  kblocks: BlockStructure | null,
  xtype: boolean,
  grid: Int8Array,
  kgrid: ArrayLike<number> | null,
  dlev: Difficulty,
): void {
  new SolverUsage(cr, blocks, kblocks, xtype, grid, kgrid).run(dlev);
}

/**
 * Convenience wrapper over a `SoloState`: clone the working grid, solve it
 * under the given difficulty caps, and return the verdict + (mutated) grid.
 * `diff` is `DIFF_*` (a real difficulty), `DIFF_AMBIGUOUS`, or `DIFF_IMPOSSIBLE`.
 * `firings` is the ladder census's channel (`solo-ladder.test.ts`).
 */
export function solveSolo(
  s: SoloState,
  maxdiff = DIFF_RECURSIVE,
  maxkdiff = DIFF_KINTERSECT,
  firings?: FiringTally,
): { diff: number; kdiff: number; grid: Int8Array } {
  const grid = s.grid.slice();
  const dlev: Difficulty = {
    maxdiff,
    maxkdiff,
    diff: DIFF_IMPOSSIBLE,
    kdiff: DIFF_KSINGLE,
  };
  const usage = new SolverUsage(
    s.cr,
    s.blocks,
    s.killerData?.kblocks ?? null,
    s.xtype,
    grid,
    s.killerData?.kgrid ?? null,
  );
  usage.run(dlev, firings);
  return { diff: dlev.diff, kdiff: dlev.kdiff, grid };
}

/**
 * Run the recording solver on a sound candidate cube seeded from `s.grid` (the
 * placed entries only — never the player's notes), capped **below** recursion,
 * and return every candidate elimination and cell placement it makes, in solver
 * order, each tagged with the rule + premise that forced it. This is the raw
 * deduction script a hint narrates; the recorder-off path (`solveSolo`) makes
 * the same deductions. `s.grid` is treated read-only (a working copy is solved
 * internally).
 */
export function recordSoloDeductions(
  s: SoloState,
  maxdiff: number = DIFF_EXTREME,
  maxkdiff: number = DIFF_KINTERSECT,
): HintOp[] {
  const ops: HintOp[] = [];
  const grid = s.grid.slice();
  const kblocks = s.killerData?.kblocks ?? null;
  const kgrid = s.killerData?.kgrid ?? null;
  const dlev: Difficulty = {
    maxdiff: Math.min(maxdiff, DIFF_EXTREME),
    maxkdiff,
    diff: DIFF_IMPOSSIBLE,
    kdiff: DIFF_KSINGLE,
  };
  const usage = new SolverUsage(s.cr, s.blocks, kblocks, s.xtype, grid, kgrid);
  usage.pendingRecorder = (rec) => ops.push(rec as HintOp);
  if (auditingPremises()) {
    const caps = { ...dlev };
    usage.onSeeded = () => soloReplay(usage, s, caps);
  }
  usage.run(dlev);
  if (usage.replay) offerReplay(usage.replay);
  return ops;
}

/**
 * The premise audit's replay of a recording run (`ladderReplay`), with the
 * recording's caps.
 */
function soloReplay(usage: SolverUsage, s: SoloState, dlev: Difficulty): void {
  const { cr, blocks, xtype } = s;
  const kblocks = s.killerData?.kblocks ?? null;
  const kgrid = s.killerData?.kgrid ?? null;
  ladderReplay(
    usage,
    (values) => {
      const fresh = new SolverUsage(
        cr,
        blocks,
        kblocks,
        xtype,
        Int8Array.from(values),
        kgrid,
      );
      if (!fresh.seedGivens())
        throw new Error("solo replay: the edited board's digits clash");
      return fresh;
    },
    (fresh) => fresh.techniques(dlev, { [TIERS]: DIFF_BLOCK, killer: DIFF_KSINGLE }),
  );
}
