/**
 * Solo (Sudoku) solver — a port of `solo.c`'s `solver()` and its techniques
 * (`solver_place`, `solver_elim`, `solver_intersect`, `solver_set`,
 * `solver_forcing`, the killer deductions, and the bounded recursion).
 *
 * The solver doubles as the generator's grading oracle: the solver-gated
 * minimizer removes givens while this solver still solves at the target
 * difficulty, so the published board depends on its verdict on every
 * intermediate grid. It is ported logic-faithfully, including the few upstream
 * quirks called out below, with two deliberate divergences in the killer
 * region rule (`DIFF_KINTERSECT`): it derives its partial cages afresh from the
 * cages on the board, where upstream split its working cages for good, so that
 * every sum a hint cites can be worked out from the board in one sentence
 * (`teach-solo-cage-splits`); and a region with nothing left for its open
 * cells is a contradiction, where upstream reported the grade so far
 * (`solo-ladder-as-declared-techniques`).
 *
 * Upstream's techniques are the rungs of a declared ladder driven by the shared
 * `runDeductionFixpoint` ({@link SolverUsage.ladder}), each able to run alone.
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
import { weighWing } from "../../engine/wing.ts";
import * as solo from "./solo.compiled.ts";
import type { BlockStructure, SoloState } from "./state.ts";
import {
  DIFF_AMBIGUOUS,
  DIFF_BLOCK,
  DIFF_EXTREME,
  DIFF_IMPOSSIBLE,
  DIFF_INTERSECT,
  DIFF_KINTERSECT,
  DIFF_KMINMAX,
  DIFF_KSINGLE,
  DIFF_KSUMS,
  DIFF_RECURSIVE,
  DIFF_SET,
  DIFF_SIMPLE,
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

// --- precomputed killer sum-bit tables (precompute_sum_bits) ----------------
// sum_bitsK[clue][i] is a bitmask whose set bit j means "digit j is one of the
// K distinct 1..9 addends of this way to make `clue`"; the per-clue list is
// terminated by a 0 entry if shorter than the array.

const MAX_2SUMS = 5;
const MAX_3SUMS = 8;
const MAX_4SUMS = 12;

function findSumBits(
  array: number[],
  idx: number,
  valueLeft: number,
  addendsLeft: number,
  minAddend: number,
  bitmaskSoFar: number,
): number {
  for (let i = minAddend; i < valueLeft; i++) {
    const newBitmask = bitmaskSoFar | (1 << i);
    if (addendsLeft === 2) {
      const j = valueLeft - i;
      if (j <= i) break;
      if (j > 9) continue;
      array[idx++] = newBitmask | (1 << j);
    } else {
      idx = findSumBits(array, idx, valueLeft - i, addendsLeft - 1, i + 1, newBitmask);
    }
  }
  return idx;
}

/** One `precompute_sum_bits` table, for cages of `addends` cells, built once at
 * module load: row `clue` is the zero-filled list of ways to make `clue`. */
function sumBitsTable(clues: number, addends: number, maxSums: number): number[][] {
  return Array.from({ length: clues }, (_, clue) => {
    const ways = new Array<number>(maxSums).fill(0);
    if (clue >= 3) findSumBits(ways, 0, clue, addends, 1, 0);
    return ways;
  });
}

const sumBits2 = sumBitsTable(18, 2, MAX_2SUMS);
const sumBits3 = sumBitsTable(25, 3, MAX_3SUMS);
const sumBits4 = sumBitsTable(31, 4, MAX_4SUMS);

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

/** The killer working state: the mutable cages, their running per-cage clue
 *  totals, and the clues as given (length `cr*cr`, indexed by cage). Present
 *  together or not at all. */
interface KillerWork {
  kblocks: Cages;
  kclues: number[];
  totals: readonly number[];
}

/** Open cells whose total the killer region rule has worked out, which the
 * cage-sum rungs treat as a cage for the rest of the pass. `inCage` says they
 * lie in one cage, so they cannot repeat a digit. `note` is what a recorded
 * reason says of them, on the hint path only. */
interface PartialCage {
  cells: number[];
  clue: number;
  inCage: boolean;
  note: CageNote | null;
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

/** Compact a 0/1 list (first `cr` entries) into the leading indices of its 1s;
 *  returns the count of 1s. */
function compactIndices(arr: Uint8Array, cr: number): number {
  let j = 0;
  for (let i = 0; i < cr; i++) if (arr[i]) arr[j++] = i;
  return j;
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
  /** The comparison's: whether the technique now running stops at its first
   * firing on the solve path. */
  private oneAtATime = false;
  readonly domain: number;
  /** The killer cages as given, which the working cages start from. */
  private readonly cages: BlockStructure | null;
  private readonly xtype: boolean;
  private readonly kgrid: ArrayLike<number> | null;
  /** Killer working cages + clue totals (null for non-killer). */
  killer: KillerWork | null;
  /** Cells placed so far, which is all the killer region rule's partial cages
   * depend on: they are worked out from the filled cells and the cages. */
  private filled = 0;
  /** What the killer region rule last worked out, and at how many filled
   * cells ({@link regionPartials}). */
  private partials: { filled: number; parts: PartialCage[] } | null = null;

  /** Candidate cube: cube[(y*cr+x)*cr + n-1] truthy ⇒ digit n possible there. */
  readonly cube: Uint8Array;
  /** The grid we write deductions into (the caller's grid, mutated in place). */
  readonly grid: Int8Array;

  /** row[y*cr+n-1] / col[x*cr+n-1] / blk[b*cr+n-1] ⇒ digit n already placed. */
  readonly row: Uint8Array;
  readonly col: Uint8Array;
  readonly blk: Uint8Array;
  /** diag[n-1] = \-diag, diag[cr+n-1] = /-diag; null for non-X. */
  readonly diag: Uint8Array | null;

  // scratch buffers (solver_scratch)
  private readonly sGrid: Uint8Array;
  private readonly sRowidx: Uint8Array;
  private readonly sColidx: Uint8Array;
  private readonly sSet: Uint8Array;
  private readonly sNeighbors: Int32Array;
  private readonly sBfsqueue: Int32Array;
  private readonly sIndexlist: Int32Array;
  private readonly sIndexlist2: Int32Array;

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
      this.killer = { kblocks: dupCages(kblocks), kclues, totals: kclues.slice() };
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
    this.row = new Uint8Array(area);
    this.col = new Uint8Array(area);
    this.blk = new Uint8Array(area);
    this.diag = xtype ? new Uint8Array(cr * 2) : null;

    this.sGrid = new Uint8Array(area);
    this.sRowidx = new Uint8Array(cr);
    this.sColidx = new Uint8Array(cr);
    this.sSet = new Uint8Array(cr);
    this.sNeighbors = new Int32Array(5 * cr);
    this.sBfsqueue = new Int32Array(area);
    this.sIndexlist = new Int32Array(area);
    this.sIndexlist2 = new Int32Array(cr);
  }

  // --- the marks, as a compiled technique reads them -------------------------

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
    const cr = this.cr;
    if (!this.recorder) {
      if (!this.oneAtATime) return null;
      // The comparison's switch: one firing a call on the solve path too.
      return (_, facts) => {
        for (let i = 0; i < facts.length; i += 3) {
          const c = facts[i + 1];
          if (facts[i] === PLACE) this.placeAt(c, facts[i + 2]);
          else this.strikeAt(c, facts[i + 2]);
        }
        return false;
      };
    }
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
  private cube2At(xy: number, n: number): number {
    return this.cube[xy * this.cr + n - 1];
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
    this.filled++;
    this.row[y * cr + n - 1] = 1;
    this.col[x * cr + n - 1] = 1;
    this.blk[bi * cr + n - 1] = 1;

    if (this.diag) {
      if (onDiag0(sqindex, cr)) {
        for (let i = 0; i < cr; i++)
          if (diag0(i, cr) !== sqindex) this.setCube2(diag0(i, cr), n, 0);
        this.diag[n - 1] = 1;
      }
      if (onDiag1(sqindex, cr)) {
        for (let i = 0; i < cr; i++)
          if (diag1(i, cr) !== sqindex) this.setCube2(diag1(i, cr), n, 0);
        this.diag[cr + n - 1] = 1;
      }
    }
  }

  /** `solver_elim`: a section of `cr` cube positions; place if exactly one set,
   *  +1 progress / 0 nothing / -1 contradiction (no possibility). */
  private elim(indices: Int32Array): number {
    const cr = this.cr;
    let m = 0;
    let fpos = -1;
    for (let i = 0; i < cr; i++) {
      if (this.cube[indices[i]]) {
        fpos = indices[i];
        m++;
      }
    }
    if (m === 1) {
      const n = 1 + (fpos % cr);
      let x = (fpos / cr) | 0;
      const y = (x / cr) | 0;
      x %= cr;
      if (!this.grid[y * cr + x]) {
        this.place(x, y, n);
        return 1;
      }
    } else if (m === 0) {
      return -1;
    }
    return 0;
  }

  /** `solver_intersect`: if every candidate of domain 1 lies in its overlap with
   *  domain 2, rule the number out elsewhere in domain 2. Both `cr`-length and
   *  sorted ascending by cube position. Never returns -1. */
  private intersect(
    indices1: Int32Array,
    indices2: Int32Array,
    reason?: SoloReason,
  ): number {
    const cr = this.cr;
    for (let i = 0, j = 0; i < cr; i++) {
      const p = indices1[i];
      while (j < cr && indices2[j] < p) j++;
      if (this.cube[p]) {
        if (j < cr && indices2[j] === p) continue;
        return 0;
      }
    }
    let ret = 0;
    for (let i = 0, j = 0; i < cr; i++) {
      const p = indices2[i];
      while (j < cr && indices1[j] < p) j++;
      if (this.cube[p] && (j >= cr || indices1[j] !== p)) {
        ret = 1;
        if (this.recorder && reason) this.recElim((p / cr) | 0, 1 + (p % cr), reason);
        this.cube[p] = 0;
      }
    }
    return ret;
  }

  /** `solver_intersect` both ways round between a line (already written into
   * `sIndexlist`) and block `b`, for digit `n`. */
  private intersectWithBlock(n: number, line: SoloRegion, b: number): number {
    const cr = this.cr;
    const idx = this.sIndexlist;
    const idx2 = this.sIndexlist2;
    for (let i = 0; i < cr; i++) idx2[i] = this.blocks.blocks[b][i] * cr + n - 1;
    const rec = this.recorder;
    const block: SoloRegion = { kind: "block", index: b };
    return (
      this.intersect(
        idx,
        idx2,
        rec ? { kind: "intersect", n, confined: line, target: block } : undefined,
      ) ||
      this.intersect(
        idx2,
        idx,
        rec ? { kind: "intersect", n, confined: block, target: line } : undefined,
      )
    );
  }

  /** `solver_set`: a `cr × cr` matrix of cube positions (`indices[i*cr+j]`);
   *  hidden/naked subset elimination within `region`, or with none over
   *  {@link digitSets}' matrix of one digit's places. +1 / 0 / -1. */
  private set_(indices: Int32Array, region?: SoloRegion): number {
    const cr = this.cr;
    const grid = this.sGrid;
    const rowidx = this.sRowidx;
    const colidx = this.sColidx;
    const set = this.sSet;

    rowidx.fill(1, 0, cr);
    colidx.fill(1, 0, cr);
    for (let i = 0; i < cr; i++) {
      let count = 0;
      let first = -1;
      for (let j = 0; j < cr; j++) {
        if (this.cube[indices[i * cr + j]]) {
          first = j;
          count++;
        }
      }
      if (count === 0) return -1;
      if (count === 1) {
        rowidx[i] = 0;
        colidx[first] = 0;
      }
    }

    // Convert rowidx/colidx from 0/1 lists to lists of the indices of the 1s
    // (both have the same count `n` by construction).
    const n = compactIndices(rowidx, cr);
    compactIndices(colidx, cr);

    // Build the smaller n×n matrix.
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        grid[i * cr + j] = this.cube[indices[rowidx[i] * cr + colidx[j]]];

    set.fill(0, 0, n);
    let count = 0;
    while (true) {
      if (count > 1 && count < n - 1) {
        let rows = 0;
        for (let i = 0; i < n; i++) {
          let ok = true;
          for (let j = 0; j < n; j++)
            if (set[j] && grid[i * cr + j]) {
              ok = false;
              break;
            }
          if (ok) rows++;
        }
        if (rows > n - count) return -1;
        if (rows >= n - count) {
          const reason: SoloReason | null = !this.recorder
            ? null
            : region
              ? {
                  kind: "set",
                  region,
                  cells: this.setCells(indices, n, rowidx, colidx, set),
                }
              : { kind: "set", ...this.confinedLines(n, count, rowidx, colidx, set) };
          let progress = false;
          for (let i = 0; i < n; i++) {
            let ok = true;
            for (let j = 0; j < n; j++)
              if (set[j] && grid[i * cr + j]) {
                ok = false;
                break;
              }
            if (!ok) {
              for (let j = 0; j < n; j++)
                if (!set[j] && grid[i * cr + j]) {
                  const fpos = indices[rowidx[i] * cr + colidx[j]];
                  progress = true;
                  if (this.recorder && reason)
                    this.recElim((fpos / cr) | 0, 1 + (fpos % cr), reason);
                  this.cube[fpos] = 0;
                }
            }
          }
          if (progress) return 1;
        }
      }
      // binary increment of `set`
      let i = n;
      while (i > 0 && set[i - 1]) {
        set[--i] = 0;
        count--;
      }
      if (i > 0) {
        set[--i] = 1;
        count++;
      } else break;
    }
    return 0;
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
            if (this.diag) {
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
                  (this.diag &&
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

  /** Whether cells `a` and `b` share a row, column, block or (X) diagonal. */
  private sees(a: number, b: number): boolean {
    const cr = this.cr;
    if (a === b) return false;
    if (a % cr === b % cr || ((a / cr) | 0) === ((b / cr) | 0)) return true;
    if (this.blocks.whichblock[a] === this.blocks.whichblock[b]) return true;
    return (
      this.diag !== null &&
      ((onDiag0(a, cr) && onDiag0(b, cr)) || (onDiag1(a, cr) && onDiag1(b, cr)))
    );
  }

  /** Every cell's {@link sees} list, worked out on the wing's first run. */
  private seerLists: number[][] | null = null;

  /** The first wing ({@link weighWing}) on the board. It strikes one cell, as
   * `latin.ts`'s does, so its words can call the cell "this cell". */
  private wings(): number {
    const cr = this.cr;
    const area = cr * cr;
    const masks = new Int32Array(area);
    for (let c = 0; c < area; c++)
      for (let n = 1; n <= cr; n++) if (this.cube2At(c, n)) masks[c] |= 1 << (n - 1);
    if (this.seerLists === null) {
      this.seerLists = [];
      for (let c = 0; c < area; c++) {
        const out: number[] = [];
        for (let k = 0; k < area; k++) if (this.sees(c, k)) out.push(k);
        this.seerLists.push(out);
      }
    }
    const seers = this.seerLists;
    const found: {
      middle: number;
      x: number;
      ends: readonly number[];
      target: number;
    }[] = [];
    weighWing(
      {
        size: area,
        values: cr,
        open: (c) => !this.grid[c],
        mask: (c) => masks[c],
        seers: (c) => seers[c],
        sees: (a, b) => this.sees(a, b),
      },
      (middle, x, ends, target) => found.push({ middle, x, ends, target }),
    );
    if (found.length === 0) return 0;
    const { middle, x, ends, target } = found[0];
    if (this.recorder) {
      const [at] = this.cellsXY([middle]);
      this.recElim(target, x + 1, {
        kind: "wing",
        n: x + 1,
        middle: at,
        ends: this.cellsXY([...ends]),
        self: (masks[middle] & (1 << x)) !== 0,
      });
    }
    this.setCube2(target, x + 1, 0);
    return 1;
  }

  /** Cell indices → reading-order `{x, y}` (for a recorded cage reason). */
  private cellsXY(cells: readonly number[]): Point[] {
    const cr = this.cr;
    return cells.map((c) => ({ x: c % cr, y: (c / cr) | 0 }));
  }

  /** Place the one open cell of a {@link CageSum}, which must make its clue
   * `v`; false if it cannot. `note` is what the sum rests on, for the hint. */
  private placeCageSingle(cell: number, v: number, note: CageNote | null): boolean {
    const cr = this.cr;
    const x = cell % cr;
    const y = (cell / cr) | 0;
    if (v < 1 || v > cr || !this.cubeAt(x, y, v)) return false;
    this.place(
      x,
      y,
      v,
      note ? { kind: "cageSingle", cells: [{ x, y }], clue: v, ...note } : undefined,
    );
    return true;
  }

  /** `solver_killer_minmax` for a single cage's cell list + clue. +1 / 0.
   * `note` says why `cells` make `clue`, for the hint. */
  private killerMinmax(cells: number[], clue: number, note: CageNote | null): number {
    const cr = this.cr;
    let ret = 0;
    const nsquares = cells.length;
    if (clue === 0) return 0;
    let cageCells: Point[] | null = null;
    const recCage = (xy: number, n: number): void => {
      if (!this.recorder || !note) return;
      if (!cageCells) cageCells = this.cellsXY(cells);
      this.recElim(xy, n, { kind: "cageMinMax", cells: cageCells, clue, ...note });
    };

    // The comparison's switch: each cell read against the cube as the call
    // found it, as the compiled reading does.
    const seen = COMPARE.readAtStart ? this.cube.slice() : this.cube;
    for (let i = 0; i < nsquares; i++) {
      const x = cells[i];
      for (let n = 1; n <= cr; n++) {
        if (!this.cube2At(x, n)) continue;
        let maxval = 0;
        let minval = 0;
        for (let j = 0; j < nsquares; j++) {
          if (i === j) continue;
          const yy = cells[j];
          for (let m = 1; m <= cr; m++)
            if (seen[yy * cr + m - 1]) {
              minval += m;
              break;
            }
          for (let m = cr; m > 0; m--)
            if (seen[yy * cr + m - 1]) {
              maxval += m;
              break;
            }
        }
        if (maxval + n < clue || minval + n > clue) {
          recCage(x, n);
          this.setCube2(x, n, 0);
          ret = 1;
        }
      }
    }
    return ret;
  }

  /** `solver_killer_sums` for a single cage's cell list + clue. +1 / 0 / -1.
   * `note` says why `cells` make `clue`, for the hint. */
  private killerSums(
    cells: number[],
    clue: number,
    cageIsRegion: boolean,
    note: CageNote | null,
  ): number {
    const cr = this.cr;
    const nsquares = cells.length;

    if (clue === 0) return 0;
    if (nsquares === 0) return -1;
    if (nsquares < 2 || nsquares > 4) return 0;

    if (!cageIsRegion) {
      let knownRow = -1;
      let knownCol = -1;
      let knownBlock = -1;
      for (let i = 0; i < nsquares; i++) {
        const x = cells[i];
        if (i === 0) {
          knownRow = (x / cr) | 0;
          knownCol = x % cr;
          knownBlock = this.blocks.whichblock[x];
        } else {
          if (knownRow !== ((x / cr) | 0)) knownRow = -1;
          if (knownCol !== x % cr) knownCol = -1;
          if (knownBlock !== this.blocks.whichblock[x]) knownBlock = -1;
        }
      }
      if (knownBlock === -1 && knownCol === -1 && knownRow === -1) return 0;
    }

    let sumbits: number[];
    let maxSums: number;
    if (nsquares === 2) {
      if (clue < 3 || clue > 17) return -1;
      sumbits = sumBits2[clue];
      maxSums = MAX_2SUMS;
    } else if (nsquares === 3) {
      if (clue < 6 || clue > 24) return -1;
      sumbits = sumBits3[clue];
      maxSums = MAX_3SUMS;
    } else {
      if (clue < 10 || clue > 30) return -1;
      sumbits = sumBits4[clue];
      maxSums = MAX_4SUMS;
    }

    let possibleAddends = 0;
    for (let i = 0; i < maxSums; i++) {
      const bits = sumbits[i];
      if (bits === 0) break;
      // The comparison's switch: no way with a value above the board's.
      if (COMPARE.domainSums && bits >> (cr + 1) !== 0) continue;
      let j = 0;
      for (; j < nsquares; j++) {
        let squareBits = bits;
        const x = cells[j];
        for (let n = 1; n <= cr; n++) if (!this.cube2At(x, n)) squareBits &= ~(1 << n);
        if (squareBits === 0) break;
      }
      if (j === nsquares) possibleAddends |= bits;
    }
    if (possibleAddends === 0) return -1;

    let ret = 0;
    let cageCells: Point[] | null = null;
    for (let i = 0; i < nsquares; i++) {
      const x = cells[i];
      for (let n = 1; n <= cr; n++) {
        if (!this.cube2At(x, n)) continue;
        if ((possibleAddends & (1 << n)) === 0) {
          if (this.recorder && note) {
            if (!cageCells) cageCells = this.cellsXY(cells);
            this.recElim(x, n, { kind: "cageSums", cells: cageCells, clue, ...note });
          }
          this.setCube2(x, n, 0);
          ret = 1;
        }
      }
    }
    return ret;
  }

  /** `filter_whole_cages`: from `squares`, drop filled cells and whole cages
   *  fully covered by the list; returns the leftover length (the first `len`
   *  entries of `squares` are the residual cage) + the summed-away total. */
  private filterWholeCages(
    squares: number[],
    kblocks: Cages,
    kclues: number[],
    /** Collects each whole cage filtered out, by index, where not `null`. */
    whole: number[] | null,
  ): { len: number; filteredSum: number } {
    let filteredSum = 0;
    let n = squares.length;

    let j = 0;
    for (let i = 0; i < n; i++) {
      if (this.grid[squares[i]]) filteredSum += this.grid[squares[i]];
      else squares[j++] = squares[i];
    }
    n = j;

    let off = 0;
    for (let b = 0; b < kblocks.blocks.length && off < n; b++) {
      const bSquares = kblocks.blocks[b].length;
      let matched = 0;
      if (bSquares === 0) continue;
      for (let i = 0; i < bSquares; i++) {
        for (let jj = off; jj < n; jj++) {
          if (squares[jj] === kblocks.blocks[b][i]) {
            const t = squares[off + matched];
            squares[off + matched] = squares[jj];
            squares[jj] = t;
            matched++;
            break;
          }
        }
      }
      // The comparison's switch: a cage's cells filled since its working cage
      // was last brought up to date count as filled, as the compiled reading
      // reads them.
      let fresh = 0;
      let freshSum = 0;
      if (COMPARE.freshCages)
        for (const c of kblocks.blocks[b])
          if (this.grid[c]) {
            fresh++;
            freshSum += this.grid[c];
          }
      if (matched !== kblocks.blocks[b].length - fresh || matched === 0) {
        off += matched;
        continue;
      }
      for (let k = off; k + matched < n; k++) squares[k] = squares[k + matched];
      n -= matched;
      filteredSum += kclues[b] - freshSum;
      whole?.push(b);
    }
    return { len: off, filteredSum };
  }

  /**
   * The cells a {@link set_} firing over a region rests on: every position the
   * chosen columns of the compacted `n × n` matrix still admit, each cell once.
   * A column there is a *digit*, so these are the subset's cells.
   */
  private setCells(
    indices: Int32Array,
    n: number,
    rowidx: Uint8Array,
    colidx: Uint8Array,
    set: Uint8Array,
  ): Point[] {
    const cr = this.cr;
    const seen = new Set<number>();
    const out: Point[] = [];
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        if (!set[j] || !this.sGrid[i * cr + j]) continue;
        const cell = (indices[rowidx[i] * cr + colidx[j]] / cr) | 0;
        if (seen.has(cell)) continue;
        seen.add(cell);
        out.push({ x: cell % cr, y: (cell / cr) | 0 });
      }
    return out;
  }

  /**
   * What a {@link set_} firing over {@link digitSets}' matrix rests on, whose
   * rows and columns are the board's: the lines one digit is confined in, and
   * the cells of them it can still take.
   *
   * The firing is two facts at once, and either alone gives its strikes: the
   * `count` chosen columns hold the digit only in as many rows, and the other
   * `n - count` rows hold it only in the other columns. The one over fewer
   * lines is recorded, since that is the smaller pattern to check.
   */
  private confinedLines(
    n: number,
    count: number,
    rowidx: Uint8Array,
    colidx: Uint8Array,
    set: Uint8Array,
  ): { lines: ConfinedLines; cells: Point[] } {
    const cr = this.cr;
    const admits = (i: number, chosen: boolean): boolean => {
      for (let j = 0; j < n; j++)
        if (!!set[j] === chosen && this.sGrid[i * cr + j]) return true;
      return false;
    };
    const indices: number[] = [];
    const cells: Point[] = [];
    const byColumn = count <= n - count;
    if (byColumn) {
      for (let j = 0; j < n; j++) if (set[j]) indices.push(colidx[j]);
    } else {
      for (let i = 0; i < n; i++) if (!admits(i, true)) indices.push(rowidx[i]);
    }
    const lines = confinedLines(byColumn ? "col" : "row", indices, cr);
    for (let i = 0; i < n; i++) {
      // The chosen columns' cells are in the rows they reach; the confined
      // rows are the ones they miss.
      if (admits(i, true) !== byColumn) continue;
      for (let j = 0; j < n; j++)
        if (!!set[j] === byColumn && this.sGrid[i * cr + j])
          cells.push({ x: colidx[j], y: rowidx[i] });
    }
    return { lines, cells };
  }

  /** {@link regionCells}' `(i, n)` as the region a sentence can name. */
  private static extraRegion(i: number, n: number): SoloRegion {
    if (i === 0) return { kind: "row", index: n };
    if (i === 1) return { kind: "col", index: n };
    return { kind: "block", index: n };
  }

  /** The cells of region `(i, n)`: i=0 row n, i=1 column n, i=2 (digit) block n. */
  private regionCells(i: number, n: number): number[] {
    const cr = this.cr;
    const out: number[] = [];
    if (i === 0) for (let k = 0; k < cr; k++) out.push(n * cr + k);
    else if (i === 1) for (let k = 0; k < cr; k++) out.push(k * cr + n);
    else for (const cell of this.blocks.blocks[n]) out.push(cell);
    return out;
  }

  // --- the rungs -------------------------------------------------------------
  // Each rung runs once from the solver's state and says what it did as
  // `DeductionTechnique.run` does: `> 0` fired, `0` found nothing, `< 0` proved
  // the board inconsistent. A rung reads nothing but that state, and the killer
  // rungs work their cages out from it each time, so any one of them can run
  // alone: the premise audit's replay does (`soloReplay`).

  /** Blockwise positional elimination: a digit with one place left in a block. */
  private blockSingles(): number {
    const cr = this.cr;
    const idx = this.sIndexlist;
    for (let b = 0; b < cr; b++)
      for (let n = 1; n <= cr; n++)
        if (!this.blk[b * cr + n - 1]) {
          for (let i = 0; i < cr; i++) idx[i] = this.blocks.blocks[b][i] * cr + n - 1;
          const ret = this.elim(idx);
          if (ret !== 0) return ret;
        }
    return 0;
  }

  /** Row-wise, then column-wise, positional elimination. */
  private lineSingles(): number {
    const cr = this.cr;
    const idx = this.sIndexlist;
    for (let y = 0; y < cr; y++)
      for (let n = 1; n <= cr; n++)
        if (!this.row[y * cr + n - 1]) {
          for (let x = 0; x < cr; x++) idx[x] = (y * cr + x) * cr + n - 1;
          const ret = this.elim(idx);
          if (ret !== 0) return ret;
        }
    for (let x = 0; x < cr; x++)
      for (let n = 1; n <= cr; n++)
        if (!this.col[x * cr + n - 1]) {
          for (let y = 0; y < cr; y++) idx[y] = (y * cr + x) * cr + n - 1;
          const ret = this.elim(idx);
          if (ret !== 0) return ret;
        }
    return 0;
  }

  /** Positional elimination along each diagonal of an X board. */
  private diagSingles(diag: Uint8Array): number {
    const cr = this.cr;
    const idx = this.sIndexlist;
    for (let n = 1; n <= cr; n++)
      if (!diag[n - 1]) {
        for (let i = 0; i < cr; i++) idx[i] = diag0(i, cr) * cr + n - 1;
        const ret = this.elim(idx);
        if (ret !== 0) return ret;
      }
    for (let n = 1; n <= cr; n++)
      if (!diag[cr + n - 1]) {
        for (let i = 0; i < cr; i++) idx[i] = diag1(i, cr) * cr + n - 1;
        const ret = this.elim(idx);
        if (ret !== 0) return ret;
      }
    return 0;
  }

  /** Numeric elimination: a cell with one digit left. */
  private nakedSingles(): number {
    const cr = this.cr;
    const idx = this.sIndexlist;
    for (let x = 0; x < cr; x++)
      for (let y = 0; y < cr; y++)
        if (!this.grid[y * cr + x]) {
          for (let n = 1; n <= cr; n++) idx[n - 1] = (y * cr + x) * cr + n - 1;
          const ret = this.elim(idx);
          if (ret !== 0) return ret;
        }
    return 0;
  }

  /** Intersectional analysis between each row, then each column, and each
   * block. */
  private lineIntersections(): number {
    const cr = this.cr;
    const idx = this.sIndexlist;
    for (let y = 0; y < cr; y++)
      for (let b = 0; b < cr; b++)
        for (let n = 1; n <= cr; n++) {
          if (this.row[y * cr + n - 1] || this.blk[b * cr + n - 1]) continue;
          for (let i = 0; i < cr; i++) idx[i] = (y * cr + i) * cr + n - 1;
          if (this.intersectWithBlock(n, { kind: "row", index: y }, b)) return 1;
        }
    for (let x = 0; x < cr; x++)
      for (let b = 0; b < cr; b++)
        for (let n = 1; n <= cr; n++) {
          if (this.col[x * cr + n - 1] || this.blk[b * cr + n - 1]) continue;
          for (let i = 0; i < cr; i++) idx[i] = (i * cr + x) * cr + n - 1;
          if (this.intersectWithBlock(n, { kind: "col", index: x }, b)) return 1;
        }
    return 0;
  }

  /** Intersectional analysis between each diagonal of an X board and each
   * block. */
  private diagIntersections(diag: Uint8Array): number {
    const cr = this.cr;
    const idx = this.sIndexlist;
    for (let b = 0; b < cr; b++)
      for (let n = 1; n <= cr; n++) {
        if (diag[n - 1] || this.blk[b * cr + n - 1]) continue;
        for (let i = 0; i < cr; i++) idx[i] = diag0(i, cr) * cr + n - 1;
        if (this.intersectWithBlock(n, { kind: "diag0" }, b)) return 1;
      }
    for (let b = 0; b < cr; b++)
      for (let n = 1; n <= cr; n++) {
        if (diag[cr + n - 1] || this.blk[b * cr + n - 1]) continue;
        for (let i = 0; i < cr; i++) idx[i] = diag1(i, cr) * cr + n - 1;
        if (this.intersectWithBlock(n, { kind: "diag1" }, b)) return 1;
      }
    return 0;
  }

  /** Set elimination within each block, then each row, then each column. */
  private regionSets(): number {
    const cr = this.cr;
    const idx = this.sIndexlist;
    for (let b = 0; b < cr; b++) {
      for (let i = 0; i < cr; i++)
        for (let n = 1; n <= cr; n++)
          idx[i * cr + n - 1] = this.blocks.blocks[b][i] * cr + n - 1;
      const ret = this.set_(idx, { kind: "block", index: b });
      if (ret !== 0) return ret;
    }
    for (let y = 0; y < cr; y++) {
      for (let x = 0; x < cr; x++)
        for (let n = 1; n <= cr; n++) idx[x * cr + n - 1] = (y * cr + x) * cr + n - 1;
      const ret = this.set_(idx, { kind: "row", index: y });
      if (ret !== 0) return ret;
    }
    for (let x = 0; x < cr; x++) {
      for (let y = 0; y < cr; y++)
        for (let n = 1; n <= cr; n++) idx[y * cr + n - 1] = (y * cr + x) * cr + n - 1;
      const ret = this.set_(idx, { kind: "col", index: x });
      if (ret !== 0) return ret;
    }
    return 0;
  }

  /** Set elimination along each diagonal of an X board. */
  private diagSets(): number {
    const cr = this.cr;
    const idx = this.sIndexlist;
    for (let i = 0; i < cr; i++)
      for (let n = 1; n <= cr; n++) idx[i * cr + n - 1] = diag0(i, cr) * cr + n - 1;
    const ret = this.set_(idx, { kind: "diag0" });
    if (ret !== 0) return ret;
    for (let i = 0; i < cr; i++)
      for (let n = 1; n <= cr; n++) idx[i * cr + n - 1] = diag1(i, cr) * cr + n - 1;
    return this.set_(idx, { kind: "diag1" });
  }

  /** Set elimination on one digit across the rows and columns: the digit's
   * places in some rows lie in as many columns. */
  private digitSets(): number {
    const cr = this.cr;
    const idx = this.sIndexlist;
    for (let n = 1; n <= cr; n++) {
      for (let y = 0; y < cr; y++)
        for (let x = 0; x < cr; x++) idx[y * cr + x] = (y * cr + x) * cr + n - 1;
      const ret = this.set_(idx);
      if (ret !== 0) return ret;
    }
    return 0;
  }

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

  /** What cage `b`'s open cells rest on: its clue, and its filled cells, whose
   * digits make the rest of it. Hint path only (`DeductionRecord`). */
  private cageNote(k: KillerWork, b: number): CageNote | null {
    if (!this.recorder || !this.cages) return null;
    const filled = this.cages.blocks[b].filter((c) => this.grid[c] !== 0);
    const total = k.totals[b];
    return {
      origin: { kind: "cage", total, placed: total - k.kclues[b] },
      reads: this.cellsXY(filled),
    };
  }

  /** Killer singles (`DIFF_KSINGLE`): fill every cage with one open cell. */
  private killerSingles(k: KillerWork): number {
    if (this.reduceCages(k) < 0) return -1;
    const { kblocks, kclues } = k;
    let changed = 0;
    for (let b = 0; b < kblocks.blocks.length; b++) {
      if (kblocks.blocks[b].length !== 1) continue;
      if (!this.placeCageSingle(kblocks.blocks[b][0], kclues[b], this.cageNote(k, b)))
        return -1;
      changed = 1;
      if (this.recorder && COMPARE.onePlacement) return changed;
    }
    return changed;
  }

  /**
   * The killer region rule (`DIFF_KINTERSECT`): what each row, column and
   * block leaves its open cells once its filled cells and whole cages are taken
   * out, and, where those cells lie in one cage, what that leaves the cage's
   * other open cells. A sum left to one cell places it; the rest are the partial
   * cages the cage-sum rungs read ({@link regionPartials}). With `place` false
   * it only works them out.
   */
  private killerRegions(k: KillerWork, place: boolean): number {
    this.partials = null;
    if (this.reduceCages(k) < 0) return -1;
    const cr = this.cr;
    const grid = this.grid;
    const { kblocks, kclues, totals } = k;
    const cages = this.cages;
    const filled = this.filled;
    const parts: PartialCage[] = [];
    let changed = 0;

    for (let i = 0; i < 3; i++) {
      for (let n = 0; n < cr; n++) {
        const extraList = this.regionCells(i, n);
        const inRegion = this.recorder ? new Set(extraList) : null;
        const whole: number[] | null = this.recorder ? [] : null;
        let sum = (cr * (cr + 1)) / 2;
        const { len: nsquares, filteredSum } = this.filterWholeCages(
          extraList,
          kblocks,
          kclues,
          whole,
        );
        sum -= filteredSum;
        if (nsquares === cr || nsquares === 0) continue;
        // Nothing left for open cells. Upstream checks this only while
        // searching and meant it as a contradiction, but its `got_result`
        // label reported the grade so far instead, so a wrong guess counted
        // as a solution.
        if (sum <= 0) return -1;

        const cells = extraList.slice(0, nsquares);
        const region = SolverUsage.extraRegion(i, n);
        // A cage counts as inside the region once its cells outside it are
        // filled, so what the region leaves rests on those too.
        let regionNote: CageNote | null = null;
        if (inRegion && whole && cages) {
          const outside: number[] = [];
          for (const b of whole)
            for (const c of cages.blocks[b]) if (!inRegion.has(c)) outside.push(c);
          regionNote = {
            origin: { kind: "region", region },
            reads: this.cellsXY([...inRegion, ...outside]),
          };
        }
        if (nsquares === 1) {
          if (place) {
            if (!this.placeCageSingle(cells[0], sum, regionNote)) return -1;
            changed = 1;
            if (this.recorder && COMPARE.onePlacement) return changed;
          }
          continue;
        }

        const b0 = kblocks.whichblock[cells[0]];
        const inCage = cells.every((c) => kblocks.whichblock[c] === b0);
        parts.push({ cells, clue: sum, inCage, note: regionNote });
        if (!inCage) continue;

        // The region's leftover cells all lie in one cage, so the rest of
        // that cage makes what the cage's clue leaves beyond them. Cells
        // this pass has filled are still in the working cage.
        const inside = new Set(cells);
        let placed = totals[b0] - kclues[b0];
        const rest: number[] = [];
        for (const c of kblocks.blocks[b0]) {
          if (grid[c]) placed += grid[c];
          else if (!inside.has(c)) rest.push(c);
        }
        const clue = totals[b0] - placed - sum;
        const note: CageNote | null =
          regionNote && cages
            ? {
                origin: {
                  kind: "outside",
                  region,
                  total: totals[b0],
                  placed,
                  inside: this.cellsXY(cells),
                  insideSum: sum,
                },
                reads: [...regionNote.reads, ...this.cellsXY(cages.blocks[b0])],
              }
            : null;
        if (rest.length === 1) {
          if (place) {
            if (!this.placeCageSingle(rest[0], clue, note)) return -1;
            changed = 1;
            if (this.recorder && COMPARE.onePlacement) return changed;
          }
        } else if (rest.length > 1) {
          parts.push({ cells: rest, clue, inCage: true, note });
        }
      }
    }
    // Keyed by the cells filled before this run: a placement above leaves it
    // stale at once.
    this.partials = { filled, parts };
    return changed;
  }

  /** The partial cages the region rule works out from the board as it stands,
   * worked out again only once another cell is placed. */
  private regionPartials(k: KillerWork): PartialCage[] {
    if (this.partials?.filled !== this.filled) this.killerRegions(k, false);
    return this.partials?.parts ?? [];
  }

  /** Killer min/max (`DIFF_KMINMAX`) over every cage, then every partial cage
   * when `regions` (the region rule is in reach). One cage is one firing on the
   * hint path. */
  private killerMinmaxAll(
    k: KillerWork,
    regions: boolean,
    which: "both" | "cages" | "parts" = "both",
  ): number {
    if (this.reduceCages(k) < 0) return -1;
    const { kblocks, kclues } = k;
    const parts = regions && which !== "cages" ? this.regionPartials(k) : [];
    let changed = 0;
    for (let b = 0; b < (which === "parts" ? 0 : kblocks.blocks.length); b++) {
      if (this.killerMinmax(kblocks.blocks[b], kclues[b], this.cageNote(k, b)) > 0) {
        changed = 1;
        if (this.recorder) return changed;
      }
    }
    for (const part of parts) {
      if (this.killerMinmax(part.cells, part.clue, part.note) > 0) {
        changed = 1;
        if (this.recorder) return changed;
      }
    }
    return changed;
  }

  /** Killer sums (`DIFF_KSUMS`) over every cage, then every partial cage when
   * `regions`. One cage is one firing on the hint path. */
  private killerSumsAll(
    k: KillerWork,
    regions: boolean,
    which: "both" | "cages" | "parts" = "both",
  ): number {
    if (this.reduceCages(k) < 0) return -1;
    const { kblocks, kclues } = k;
    const parts = regions && which !== "cages" ? this.regionPartials(k) : [];
    let changed = 0;
    for (let b = 0; b < (which === "parts" ? 0 : kblocks.blocks.length); b++) {
      const ret = this.killerSums(
        kblocks.blocks[b],
        kclues[b],
        true,
        this.cageNote(k, b),
      );
      if (ret < 0) return ret;
      if (ret > 0) {
        changed = 1;
        if (this.recorder) return changed;
      }
    }
    for (const part of parts) {
      const ret = this.killerSums(part.cells, part.clue, part.inCage, part.note);
      if (ret < 0) return ret;
      if (ret > 0) {
        changed = 1;
        if (this.recorder) return changed;
      }
    }
    return changed;
  }

  // --- the ladder ------------------------------------------------------------

  /**
   * The ladder at `dlev`'s caps, easiest first, in upstream's order.
   *
   * Solo grades on two scales, `diff` for the sudoku rungs and `kdiff` for the
   * killer ones, so a rung's `tier` is on its own rung's scale. The shared
   * runner has one grade and one cap, so neither is used: the ladder holds only
   * the rungs both caps admit, and a rung that fires raises its own scale in
   * `grade`. Leaving a rung out is the same as upstream's `break` at the first
   * over-cap sudoku rung because the sudoku rungs are in tier order and every
   * killer rung comes before the first `break`; the killer rungs are not in
   * `kdiff` order, and upstream skips them one by one.
   */
  ladder(
    dlev: Difficulty,
    grade: { diff: number; kdiff: number },
  ): DeductionTechnique[] {
    return COMPARE.handWritten
      ? this.handWrittenLadder(dlev, grade)
      : this.compiledLadder(dlev, grade);
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
   * The ladder `solo.description.yaml` states, compiled, at `dlev`'s caps: a
   * technique on the killer scale is capped and graded by `kdiff`, every
   * other by `diff`, and the forcing chain, which no description states,
   * after them. A killer technique first brings the working cages up to
   * date, striking each filled cell's value from the rest of its cage, as
   * upstream did at the start of each.
   */
  private compiledLadder(
    dlev: Difficulty,
    grade: { diff: number; kdiff: number },
  ): DeductionTechnique[] {
    const { sp, dealt, killer } = this;
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
          this.oneAtATime = COMPARE.oneAtATime && !onKiller;
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

  /** The hand-written ladder the compiled one replaces, for the comparison. */
  private handWrittenLadder(
    dlev: Difficulty,
    grade: { diff: number; kdiff: number },
  ): DeductionTechnique[] {
    const rungs: DeductionTechnique[] = [];
    const rung = (
      scale: "diff" | "kdiff",
      id: string,
      tier: number,
      run: () => number,
    ): void => {
      if (tier > (scale === "diff" ? dlev.maxdiff : dlev.maxkdiff)) return;
      rungs.push({
        id,
        tier,
        run: () => {
          const ret = run();
          if (ret > 0 && tier > grade[scale]) grade[scale] = tier;
          return ret;
        },
      });
    };
    const { diag, killer } = this;
    rung("diff", "block-single", DIFF_BLOCK, () => this.blockSingles());
    if (killer) {
      const regions = dlev.maxkdiff >= DIFF_KINTERSECT;
      rung("kdiff", "killer-single", DIFF_KSINGLE, () => this.killerSingles(killer));
      rung("kdiff", "killer-region", DIFF_KINTERSECT, () =>
        this.killerRegions(killer, true),
      );
      // The comparison's switch: the cages' reading and the partial cages'
      // as rungs of their own, as the compiled ladder has them.
      const split = COMPARE.splitParts;
      rung("kdiff", "killer-minmax", DIFF_KMINMAX, () =>
        this.killerMinmaxAll(killer, regions, split ? "cages" : "both"),
      );
      if (split && regions)
        rung("kdiff", "killer-minmax-parts", DIFF_KMINMAX, () =>
          this.killerMinmaxAll(killer, regions, "parts"),
        );
      rung("kdiff", "killer-sums", DIFF_KSUMS, () =>
        this.killerSumsAll(killer, regions, split ? "cages" : "both"),
      );
      if (split && regions)
        rung("kdiff", "killer-sums-parts", DIFF_KSUMS, () =>
          this.killerSumsAll(killer, regions, "parts"),
        );
    }
    rung("diff", "line-single", DIFF_SIMPLE, () => this.lineSingles());
    if (diag) rung("diff", "diag-single", DIFF_SIMPLE, () => this.diagSingles(diag));
    rung("diff", "naked-single", DIFF_SIMPLE, () => this.nakedSingles());
    rung("diff", "line-intersect", DIFF_INTERSECT, () => this.lineIntersections());
    if (diag)
      rung("diff", "diag-intersect", DIFF_INTERSECT, () =>
        this.diagIntersections(diag),
      );
    rung("diff", "region-set", DIFF_SET, () => this.regionSets());
    if (diag) rung("diff", "diag-set", DIFF_SET, () => this.diagSets());
    rung("diff", "digit-set", DIFF_EXTREME, () => this.digitSets());
    rung("diff", "wing", DIFF_EXTREME, () => this.wings());
    rung("diff", "forcing-chain", DIFF_RECURSIVE, () => this.forcing());
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
    if (!COMPARE.on || COMPARE.depth > 0) {
      COMPARE.depth++;
      try {
        this.solve(dlev, firings);
      } finally {
        COMPARE.depth--;
      }
      return;
    }
    // The hand-written ladder on a copy, then the compiled one, each record
    // of both kept.
    const copy = new SolverUsage(
      this.cr,
      this.blocks,
      this.cages,
      this.xtype,
      this.grid.slice(),
      this.kgrid,
    );
    const theirs: DeductionRecord[] = [];
    const ours: DeductionRecord[] = [];
    const pending = this.pendingRecorder;
    if (pending) {
      copy.pendingRecorder = (r) => theirs.push(r);
      this.pendingRecorder = (r) => {
        ours.push(r);
        pending(r);
      };
    }
    const dcopy = { ...dlev };
    COMPARE.depth++;
    COMPARE.handWritten = true;
    try {
      copy.solve(dcopy);
    } finally {
      COMPARE.handWritten = false;
    }
    try {
      this.solve(dlev, firings);
    } finally {
      COMPARE.depth--;
      this.pendingRecorder = pending;
    }
    compareRuns(
      { dlev: dcopy, grid: copy.grid, cube: copy.cube, records: theirs },
      { dlev, grid: this.grid, cube: this.cube, records: ours },
    );
  }

  /** {@link run}'s solve. */
  private solve(dlev: Difficulty, firings?: FiringTally): void {
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
 * The compiled ladder against the hand-written one it replaces
 * (`research/describe/compare-solo.test.ts`): with `on`, every solve not made
 * inside another runs both, the hand-written one on a copy, and tallies where
 * they differ.
 */
export const COMPARE = {
  on: false,
  /** Whether the solver now running runs the hand-written ladder. */
  handWritten: false,
  /** Whether the hand-written min/max reads a cage against the cube as the
   * call found it, rather than as its own strikes leave it. */
  readAtStart: false,
  /** Whether the hand-written sums count only the board's values, as the
   * compiled reading does, rather than upstream's 1 to 9 at every size. */
  domainSums: false,
  /** Whether the hand-written min/max and sums read the cages and the
   * partial cages as rungs of their own, as the compiled ladder does. */
  splitParts: false,
  /** Whether the hand-written killer singles and region rule stop at their
   * first placement on the hint path, one firing being one binding. */
  onePlacement: false,
  /** Whether the hand-written region rule reads a cage's cells filled in its
   * own pass as filled, rather than as its working cage still holds them. */
  freshCages: false,
  /** Whether the compiled sudoku techniques stop at their first firing on
   * the solve path too, as the hand-written rungs did. */
  oneAtATime: false,
  /** How deep in solves the solver now running is. */
  depth: 0,
  compared: 0,
  mismatches: [] as { what: string[]; theirs: unknown; ours: unknown }[],
  /** The hand-written records compared, by kind. */
  reasons: new Map<string, number>(),
};

interface RunResult {
  dlev: Difficulty;
  grid: Int8Array;
  cube: Uint8Array;
  records: DeductionRecord[];
}

/** A record as compared: its group numbered by first appearance, since the
 * two ladders count their attempts differently, and its reason's keys in
 * order. */
function comparable(records: readonly DeductionRecord[]): string[] {
  const groups = new Map<number, number>();
  const sorted = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(sorted)
      : v !== null && typeof v === "object"
        ? Object.fromEntries(
            Object.entries(v)
              .sort(([a], [b]) => (a < b ? -1 : 1))
              .map(([k, x]) => [k, sorted(x)]),
          )
        : v;
  return records.map((r) => {
    if (!groups.has(r.group)) groups.set(r.group, groups.size);
    return JSON.stringify(sorted({ ...r, group: groups.get(r.group) }));
  });
}

function compareRuns(theirs: RunResult, ours: RunResult): void {
  COMPARE.compared++;
  for (const r of theirs.records) {
    const k = (r.reason as { kind: string }).kind;
    COMPARE.reasons.set(k, (COMPARE.reasons.get(k) ?? 0) + 1);
  }
  const what: string[] = [];
  if (theirs.dlev.diff !== ours.dlev.diff) what.push("diff");
  if (theirs.dlev.kdiff !== ours.dlev.kdiff) what.push("kdiff");
  if (theirs.grid.join() !== ours.grid.join()) what.push("grid");
  if (theirs.cube.join() !== ours.cube.join()) what.push("cube");
  const a = comparable(theirs.records);
  const b = comparable(ours.records);
  if (a.join("\n") !== b.join("\n")) what.push("records");
  if (what.length === 0) return;
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  COMPARE.mismatches.push({
    what,
    theirs: { diff: theirs.dlev.diff, kdiff: theirs.dlev.kdiff, record: a[i], at: i },
    ours: { diff: ours.dlev.diff, kdiff: ours.dlev.kdiff, record: b[i], n: b.length },
  });
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
