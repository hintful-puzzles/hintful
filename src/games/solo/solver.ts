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

import type { NotesLadder } from "../../engine/candidate-plan.ts";
import type {
  CompiledTechniques,
  FiringTally,
} from "../../engine/deduction-fixpoint.ts";
import {
  type Caps,
  CellMarks,
  compiledRung,
  type Ladder,
  ladderTechniques,
  runLadder,
  TIERS,
  uncluedRung,
  withSearch,
} from "../../engine/ladder-runtime.ts";
import { set as latinSet } from "../../engine/latin.compiled.ts";
import { latinLadder } from "../../engine/latin.ts";
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

/**
 * The ladder `solo.description.yaml` states over the board's cages. The
 * library's set is paired here, where the engine would, so that its firing
 * says its unit: the hint names the region it reads.
 */
function soloLadder(dealt: solo.Dealt): Ladder<SolverUsage> {
  return latinLadder(solo, {
    boxSingle: uncluedRung(solo.boxSingle),
    cageSingle: compiledRung(solo.cageSingle, dealt),
    regionRule: compiledRung(solo.regionRule, dealt),
    cageMinMax: compiledRung(solo.cageMinMax, dealt),
    partMinMax: compiledRung(solo.partMinMax, dealt),
    cageSums: compiledRung(solo.cageSums, dealt),
    partSums: compiledRung(solo.partSums, dealt),
    intersect: uncluedRung(solo.intersect),
    "latin.set": uncluedRung(latinSet),
    digitSet: uncluedRung(solo.digitSet),
  });
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
  readonly rungs: Ladder<SolverUsage>;
  /** The grid we write deductions into (the caller's grid, mutated in place). */
  declare grid: Int8Array;

  // The forcing chain's scratch buffers (solver_scratch).
  private readonly sGrid: Uint8Array;
  private readonly sNeighbors: Int32Array;
  private readonly sBfsqueue: Int32Array;

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
    this.rungs = soloLadder(this.dealt);
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

  // --- the ladder ------------------------------------------------------------
  // Each rung runs once from the solver's state and says what it did as
  // `DeductionTechnique.run` does: `> 0` fired, `0` found nothing, `< 0` proved
  // the board inconsistent. A rung reads nothing but that state, so any one of
  // them can run alone: the hint runs each on the player's notes.

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

  /**
   * The ladder at `dlev`'s caps, easiest first in its order: a technique on
   * the killer scale is capped and graded by `kdiff`, every other by `diff`;
   * the forcing chain, which no description states, comes after them. A
   * killer technique first brings the working cages up to date, striking
   * each filled cell's value from the rest of its cage, as upstream did at
   * the start of each.
   */
  techniques(dlev: Difficulty, grades: Record<string, number>): CompiledTechniques {
    const killer = this.killer;
    const caps: Record<string, number> = { [TIERS]: dlev.maxdiff };
    if (killer !== null) caps["killer"] = dlev.maxkdiff;
    const rungs = ladderTechniques(this, this.rungs.entries, caps, grades, (entry) =>
      killer !== null && entry.scale === "killer" ? this.reduceCages(killer) : 0,
    );
    if (dlev.maxdiff < DIFF_RECURSIVE) return rungs;
    return withSearch(rungs, {
      id: "forcing-chain",
      tier: DIFF_RECURSIVE,
      run: () => {
        const ret = this.forcing();
        if (ret > 0 && DIFF_RECURSIVE > grades[TIERS]) grades[TIERS] = DIFF_RECURSIVE;
        return ret;
      },
    });
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
 * Solo's ladder as a hint that deduces from the notes runs it
 * (`techniqueRung`): fresh marks each time, holding the values on the walk's
 * working `grid` as it stands. The caps are the board's tiers, on each scale,
 * below the search: a hint teaches nothing past what graded the board. A
 * killer technique reads its cages less their filled cells off the grid
 * (`owed`), so the working cages the solve keeps are not needed here; the
 * walk's cull strikes a placed value from the rest of its cage.
 */
export function soloNotesLadder(
  s: SoloState,
  grid: ArrayLike<number>,
): NotesLadder<SolverUsage> {
  const kblocks = s.killerData?.kblocks ?? null;
  const kgrid = s.killerData?.kgrid ?? null;
  const marks = (): SolverUsage =>
    new SolverUsage(s.cr, s.blocks, kblocks, s.xtype, Int8Array.from(grid), kgrid);
  const caps: Caps = {
    [TIERS]: Math.min(s.params.diff, DIFF_EXTREME),
    ...(kblocks && kgrid ? { killer: s.params.kdiff } : {}),
  };
  return { ladder: marks().rungs, marks, enc: { values: s.cr }, caps };
}
