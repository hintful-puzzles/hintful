/**
 * Solo (Sudoku) solver: the ladder `solo.description.yaml` states, compiled,
 * run by the shared `runDeductionFixpoint` ({@link SolverUsage.ladder}), each
 * rung able to run alone; then upstream's forcing chain (`solver_forcing`)
 * and bounded recursion.
 *
 * The solver doubles as the generator's grading oracle: the solver-gated
 * minimizer removes givens while this solver still solves at the target
 * difficulty, so the published board depends on its verdict on every
 * intermediate grid.
 *
 * The killer working cages are plain arrays (`Cages`) rather than C's flat
 * `block_structure`; a cage keeps its index as its filled cells leave it.
 */

import {
  type DeductionTechnique,
  type FiringTally,
  runDeductionFixpoint,
} from "../../engine/deduction-fixpoint.ts";
import {
  clueList,
  type Fire,
  type GridSpace,
  type Marks,
  PLACE,
  partition,
  sudokuSpace,
  valuesOf,
} from "../../engine/describe-runtime.ts";
import {
  auditingPremises,
  type CellBoard,
  FiringReplay,
  offerReplay,
} from "../../engine/firing-replay.ts";
import * as latinTechniques from "../../engine/latin.compiled.ts";
import {
  type ConfinedLines,
  confinedLines,
  type DeductionRecord,
  type DeductionRecorder,
  type LatinWingReason,
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
  diag0,
  diag1,
  onDiag0,
  onDiag1,
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

const NO_CAGES: solo.Dealt = { cage: partition([], 0), total: clueList([], [], 0) };

class SolverUsage implements Marks {
  readonly cr: number;
  readonly blocks: BlockStructure;
  /** The grid as the compiled techniques read it. */
  readonly sp: GridSpace;
  /** The killer cages and their totals as the compiled techniques read them;
   * none on a board without them. */
  private readonly dealt: solo.Dealt;
  readonly domain: number;
  /** The killer cages as given. */
  private readonly cages: BlockStructure | null;
  private readonly xtype: boolean;
  private readonly kgrid: ArrayLike<number> | null;
  /** The killer working cages, null on a board without cages. */
  private readonly killer: KillerWork | null;

  /** Candidate cube: cube[(y*cr+x)*cr + n-1] truthy ⇒ digit n possible there. */
  readonly cube: Uint8Array;
  /** The grid we write deductions into (the caller's grid, mutated in place). */
  readonly grid: Int8Array;

  // The forcing chain's scratch buffers (solver_scratch).
  private readonly sGrid: Uint8Array;
  private readonly sNeighbors: Int32Array;
  private readonly sBfsqueue: Int32Array;

  /** Hint-only deduction recorder; enabled by `run` only *after* the given
   * clues are placed (so cube-seeding dups aren't mistaken for teachable
   * deductions), left unset on the generator/solve path so that path is
   * byte-for-byte unchanged. */
  recorder?: DeductionRecorder;
  /** Stashed by {@link recordSoloDeductions}; promoted to `recorder` after the
   * givens are placed. */
  pendingRecorder?: DeductionRecorder;
  /** Current firing id — bumped before each technique attempt so every record
   * of one firing shares a `group`. */
  group = 0;
  /** Called once the givens are placed and the recorder is on: where the
   * premise audit starts its replay (`recordSoloDeductions`). */
  onSeeded?: () => void;
  /** The premise audit's replay of this run, only while it runs. */
  replay: FiringReplay<string> | null = null;

  constructor(
    cr: number,
    blocks: BlockStructure,
    kblocks: BlockStructure | null,
    xtype: boolean,
    grid: Int8Array,
    kgrid: ArrayLike<number> | null,
  ) {
    const area = cr * cr;
    this.cr = cr;
    this.blocks = blocks;
    this.cages = kblocks;
    this.xtype = xtype;
    this.kgrid = kgrid;
    this.grid = grid;

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
      // Built each solve: the generator merges cages in place between them.
      const cage = partition(kblocks.blocks, area);
      this.dealt = {
        cage,
        total: clueList(cage.parts, kclues.slice(0, nclues), nclues),
      };
    } else {
      this.killer = null;
      this.dealt = NO_CAGES;
    }
    this.sp = sudokuSpace(blocks.blocks, xtype);
    this.domain = (1 << (cr + 1)) - 2;

    this.cube = new Uint8Array(area * cr).fill(1);
    this.sGrid = new Uint8Array(area);
    this.sNeighbors = new Int32Array(5 * cr);
    this.sBfsqueue = new Int32Array(area);
  }

  // --- the marks, as a compiled technique reads them -------------------------

  multiplicity(): number {
    return 1;
  }
  known(c: number): boolean {
    return this.grid[c] !== 0;
  }
  value(c: number): number {
    return this.grid[c] || -1;
  }
  cand(c: number): number {
    const cr = this.cr;
    let m = 0;
    for (let n = 1, p = c * cr; n <= cr; n++, p++) if (this.cube[p]) m |= 1 << n;
    return m;
  }
  has(c: number, d: number): boolean {
    return this.cube[c * this.cr + d - 1] !== 0;
  }
  strikeAt(c: number, d: number): void {
    this.cube[c * this.cr + d - 1] = 0;
  }
  placeAt(c: number, d: number): void {
    this.place(c % this.cr, (c / this.cr) | 0, d);
  }

  /**
   * What a compiled technique is given to tell its firings to: on the hint
   * path, each fact made and recorded with the reason `reason` builds from
   * the binding, on the marks before any of the firing's facts is made, and
   * one firing a call; on the solve path nothing, so the technique makes its
   * facts itself and goes on.
   */
  private fire<B>(
    reason: (binding: B, cell: number, n: number) => SoloReason,
  ): Fire<B> | null {
    if (!this.recorder) return null;
    const cr = this.cr;
    return (binding, facts) => {
      const why: SoloReason[] = [];
      for (let i = 0; i < facts.length; i += 3)
        why.push(reason(binding, facts[i + 1], facts[i + 2]));
      for (let i = 0; i < facts.length; i += 3) {
        const c = facts[i + 1];
        const n = facts[i + 2];
        if (facts[i] === PLACE) this.place(c % cr, (c / cr) | 0, n, why[i / 3]);
        else {
          this.recElim(c, n, why[i / 3]);
          this.strikeAt(c, n);
        }
      }
      return false;
    };
  }

  // cube accessors (cubepos / cubepos2 macros)
  private cubeAt(x: number, y: number, n: number): number {
    return this.cube[(y * this.cr + x) * this.cr + n - 1];
  }
  private setCube(x: number, y: number, n: number, v: number): void {
    this.cube[(y * this.cr + x) * this.cr + n - 1] = v;
  }
  private setCube2(xy: number, n: number, v: number): void {
    this.cube[xy * this.cr + n - 1] = v;
  }

  /** Record an `elim` op at cube cell index `xy` for digit `n`. */
  private recElim(xy: number, n: number, reason: SoloReason): void {
    this.recorder?.({
      kind: "elim",
      x: xy % this.cr,
      y: (xy / this.cr) | 0,
      n,
      reason,
      group: this.group,
    });
  }

  /** `solver_place`: commit digit `n` at (x, y) and propagate the eliminations.
   * On the recording path the placement op is recorded with `reason` (default a
   * generic `single`, re-derived at emit time); the propagated row/col/block/
   * diagonal dup strikes are NOT recorded, because the hint plan culls them
   * from the working notes itself when it places (`runCandidatePlan`). */
  place(x: number, y: number, n: number, reason?: SoloReason): void {
    const cr = this.cr;
    const sqindex = y * cr + x;

    this.recorder?.({
      kind: "place",
      x,
      y,
      n,
      reason: reason ?? { kind: "single" },
      group: this.group,
    });

    for (let i = 1; i <= cr; i++) if (i !== n) this.setCube(x, y, i, 0);
    for (let i = 0; i < cr; i++) if (i !== y) this.setCube(x, i, n, 0);
    for (let i = 0; i < cr; i++) if (i !== x) this.setCube(i, y, n, 0);

    const bi = this.blocks.whichblock[sqindex];
    for (let i = 0; i < cr; i++) {
      const bp = this.blocks.blocks[bi][i];
      if (bp !== sqindex) this.setCube2(bp, n, 0);
    }

    this.grid[sqindex] = n;

    if (this.xtype) {
      if (onDiag0(sqindex, cr))
        for (let i = 0; i < cr; i++)
          if (diag0(i, cr) !== sqindex) this.setCube2(diag0(i, cr), n, 0);
      if (onDiag1(sqindex, cr))
        for (let i = 0; i < cr; i++)
          if (diag1(i, cr) !== sqindex) this.setCube2(diag1(i, cr), n, 0);
    }
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
                this.setCube(xt, yt, orign, 0);
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
          this.setCube2(kblocks.blocks[b][nn], t, 0);
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
   * The ladder `solo.description.yaml` states, compiled, at `dlev`'s caps,
   * easiest first in its order: a technique on the killer scale is capped
   * and graded by `kdiff`, every other by `diff`, and a rung that fires
   * raises its own scale's grade; the forcing chain, which no description
   * states, comes after them. A killer technique first brings the working
   * cages up to date, striking each filled cell's value from the rest of its
   * cage, as upstream did at the start of each.
   */
  ladder(
    dlev: Difficulty,
    grade: { diff: number; kdiff: number },
  ): DeductionTechnique[] {
    const { sp, dealt } = this;
    const killer = this.killer;
    const at = (c: number): Point => ({ x: c % this.cr, y: (c / this.cr) | 0 });
    const single = (): SoloReason => ({ kind: "single" });
    const runs: Record<solo.LadderId, () => number> = {
      boxSingle: () => solo.boxSingle(this, sp, this.fire(single)),
      cageSingle: () =>
        solo.cageSingle(
          this,
          sp,
          dealt,
          this.fire(({ r, c, t }) => ({
            kind: "cageSingle",
            cells: [at(c)],
            clue: t,
            ...this.cageOf(r, t),
          })),
        ),
      regionRule: () =>
        solo.regionRule(
          this,
          sp,
          dealt,
          this.fire(({ u, W, L, s, t }, cell) =>
            cell === L[0] && L.length === 1
              ? { kind: "cageSingle", cells: [at(cell)], clue: s, ...this.leftOf(u, W) }
              : {
                  kind: "cageSingle",
                  cells: [at(cell)],
                  clue: t,
                  ...this.outsideOf(u, W, L, s),
                },
          ),
        ),
      cageMinMax: () =>
        solo.cageMinMax(
          this,
          sp,
          dealt,
          this.fire(({ r, K, t }) => ({
            kind: "cageMinMax",
            cells: this.cellsXY([...K]),
            clue: t,
            ...this.cageOf(r, t),
          })),
        ),
      partMinMax: () =>
        solo.partMinMax(
          this,
          sp,
          dealt,
          this.fire((b, cell) => this.partOf("cageMinMax", b, cell)),
        ),
      cageSums: () =>
        solo.cageSums(
          this,
          sp,
          dealt,
          this.fire(({ r, K, t }) => ({
            kind: "cageSums",
            cells: this.cellsXY([...K]),
            clue: t,
            ...this.cageOf(r, t),
          })),
        ),
      partSums: () =>
        solo.partSums(
          this,
          sp,
          dealt,
          this.fire((b, cell) => this.partOf("cageSums", b, cell)),
        ),
      "latin.hiddenSingle": () =>
        latinTechniques.hiddenSingle(this, sp, this.fire(single)),
      "latin.single": () => latinTechniques.single(this, sp, this.fire(single)),
      intersect: () =>
        solo.intersect(
          this,
          sp,
          this.fire(({ L, b, d, first }) => {
            const line = this.regionOf(L);
            const block = this.regionOf(b);
            return first
              ? { kind: "intersect", n: d, confined: line, target: block }
              : { kind: "intersect", n: d, confined: block, target: line };
          }),
        ),
      "latin.set": () =>
        latinTechniques.set(
          this,
          sp,
          this.fire(({ u, open, S }) => ({
            kind: "set",
            region: this.regionOf(u),
            cells: open.filter((c) => !S.includes(c)).map(at),
          })),
        ),
      digitSet: () =>
        solo.digitSet(
          this,
          sp,
          this.fire((b) => this.digitSetReason(b)),
        ),
      "latin.wing": () =>
        latinTechniques.wing(
          this,
          sp,
          this.fire(({ m, x, E }) => ({
            kind: "wing",
            n: x,
            middle: at(m),
            ends: E.map(at),
            self: this.has(m, x),
          })),
        ),
    };
    const rungs: DeductionTechnique[] = [];
    for (const { id, tier, scale, from, until } of solo.ladder) {
      const onKiller = scale === "killer";
      if (onKiller && killer === null) continue;
      const cap = onKiller ? dlev.maxkdiff : dlev.maxdiff;
      if (tier > cap || (from !== undefined && cap < from)) continue;
      if (until !== undefined && cap >= until) continue;
      const run = runs[id];
      const graded = onKiller ? "kdiff" : "diff";
      rungs.push({
        id,
        tier,
        run: () => {
          if (killer !== null && onKiller && this.reduceCages(killer) < 0) return -1;
          const ret = run();
          if (ret > 0 && tier > grade[graded]) grade[graded] = tier;
          return ret;
        },
      });
    }
    if (dlev.maxdiff >= DIFF_RECURSIVE)
      rungs.push({
        id: "forcing-chain",
        tier: DIFF_RECURSIVE,
        run: () => {
          const ret = this.forcing();
          if (ret > 0 && DIFF_RECURSIVE > grade.diff) grade.diff = DIFF_RECURSIVE;
          return ret;
        },
      });
    return rungs;
  }

  /** Place every given; false if two of them clash. */
  seed(): boolean {
    const cr = this.cr;
    for (let x = 0; x < cr; x++)
      for (let y = 0; y < cr; y++) {
        const n = this.grid[y * cr + x];
        if (!n) continue;
        if (!this.cubeAt(x, y, n)) return false;
        this.place(x, y, n);
      }
    return true;
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
    const grade = { diff: DIFF_BLOCK, kdiff: DIFF_KSINGLE };
    const finish = (d: number): void => {
      dlev.diff = d;
      dlev.kdiff = grade.kdiff;
    };

    if (!this.seed()) {
      finish(DIFF_IMPOSSIBLE);
      return;
    }
    // Givens are seeded; from here every deduction is teachable, so enable the
    // recorder (kept off through the given placement above so cube-seeding dups
    // aren't mistaken for deductions — `docs/hints-candidates.md` § "The recorder
    // and the soundness boundary").
    this.recorder = this.pendingRecorder;
    this.onSeeded?.();

    const { impossible } = runDeductionFixpoint({
      techniques: this.ladder(dlev, grade),
      firings,
      beforeTechnique: (t) => {
        this.group++;
        this.replay?.before(t.id);
        this.replay?.open(this.group);
      },
    });
    if (impossible) {
      finish(DIFF_IMPOSSIBLE);
      return;
    }
    let diff = grade.diff;

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
    usage.onSeeded = () => {
      usage.replay = soloReplay(usage, s, caps);
    };
  }
  usage.run(dlev);
  if (usage.replay) offerReplay(usage.replay);
  return ops;
}

/**
 * The premise audit's replay of a recording run (`firing-replay.ts`): a
 * firing's technique is its rung, run alone on a fresh solver holding the
 * edited state, with the recording's caps.
 */
function soloReplay(
  usage: SolverUsage,
  s: SoloState,
  dlev: Difficulty,
): FiringReplay<string> {
  const { cr, blocks, xtype } = s;
  const kblocks = s.killerData?.kblocks ?? null;
  const kgrid = s.killerData?.kgrid ?? null;
  const capture = (from: SolverUsage): CellBoard => {
    const values = Int32Array.from(from.grid);
    const cands = new Int32Array(cr * cr);
    for (let c = 0; c < cr * cr; c++)
      for (let n = 1; n <= cr; n++) if (from.cube[c * cr + n - 1]) cands[c] |= 1 << n;
    return { values, cands };
  };
  return new FiringReplay<string>({
    w: cr,
    h: cr,
    capture: () => capture(usage),
    name: (id) => id,
    run: (board, id) => {
      const fresh = new SolverUsage(
        cr,
        blocks,
        kblocks,
        xtype,
        Int8Array.from(board.values),
        kgrid,
      );
      if (!fresh.seed())
        throw new Error("solo replay: the edited board's digits clash");
      for (let c = 0; c < cr * cr; c++)
        for (let n = 1; n <= cr; n++)
          if (!(board.cands[c] & (1 << n))) fresh.cube[c * cr + n - 1] = 0;
      // The recording path's techniques behave as recorded only with a recorder.
      fresh.recorder = () => {};
      const grade = { diff: DIFF_BLOCK, kdiff: DIFF_KSINGLE };
      const technique = fresh.ladder(dlev, grade).find((t) => t.id === id);
      if (!technique) throw new Error(`solo replay: no technique ${id}`);
      return () => {
        const ret = technique.run();
        return { after: capture(fresh), ret };
      };
    },
  });
}
