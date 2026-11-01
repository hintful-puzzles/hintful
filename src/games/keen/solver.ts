/**
 * Keen solver: the ladder `keen.description.yaml` states, compiled, with the
 * reason each technique records for the hint, and the answer check its rules
 * compile to, on the shared `LatinSolver` (`engine/latin.ts`), whose
 * forcing chains and recursion are the search above the ladder. The tiers:
 *
 *   Easy (`DIFF_EASY`)         → each cage's values amalgamated, only at a cap
 *                                of Easy, and the library's singles.
 *   Normal (`DIFF_NORMAL`)     → each cage's values cell by cell.
 *   Hard (`DIFF_HARD`)         → a value every layout of a cage puts in a
 *                                line, then the library's set elimination.
 *   Extreme (`DIFF_EXTREME`)   → the library's fish and wing.
 *   Unreasonable               → the engine's forcing chains and recursion.
 *
 * A cage is its index among the cages in the order of their least cells, its
 * cells in reading order; its clue is of the kind its sign names.
 */

import { latinSpace } from "../../engine/describe-runtime.ts";
import { compiledRung, type Ladder } from "../../engine/ladder-runtime.ts";
import {
  type DeductionRecord,
  DIFF_AMBIGUOUS,
  DIFF_IMPOSSIBLE,
  type LatinReason,
  type LatinSolver,
  latinLadder,
  latinSolver,
} from "../../engine/latin.ts";
import type { SingleReason } from "../../engine/latin-hint.ts";
import type { Point } from "../../engine/types.ts";
import * as keen from "./keen.compiled.ts";
import {
  type Cages,
  cagesOf,
  clueOp,
  clueVal,
  DIFF_UNREASONABLE,
  dealtOf,
  type KeenClues,
} from "./state.ts";

export { DIFF_AMBIGUOUS, DIFF_IMPOSSIBLE };

/** Why a Keen-specific (cage) deduction ruled a candidate out — the premise the
 * hint narrates and highlights. Combined with {@link LatinReason} (the generic
 * positional/set deductions) it covers every technique the recording
 * solver fires; the `kind` fields never collide with the Latin reasons.
 *
 * `cage` is the Easy and Normal per-square pruning: no arrangement of the
 * cage's digits consistent with its clue leaves this candidate possible in
 * this cell. `cageLine` is the Hard cross-line pruning: a digit appears in
 * every consistent layout of the cage somewhere along a row/column, so it is
 * ruled out of the rest of that line outside the cage (`horizontal` = the line
 * is a row). Both carry the cage's packed operation/value and its cells for
 * narration + evidence shading. */
export type KeenReason =
  | { kind: "cage"; op: number; value: number; cells: Point[] }
  | { kind: "cageLine"; op: number; value: number; cells: Point[]; horizontal: boolean }
  /** The singles the hint plan re-derives from the working board at placement
   * time (the solver's generic `elim` records them all as `single`). */
  | SingleReason;

/** A reason attached to a recorded Keen deduction. */
export type HintReason = KeenReason | LatinReason;

/** One recorded Keen deduction op (a {@link DeductionRecord} with a narrowed
 * reason). */
export interface HintOp extends DeductionRecord {
  reason: HintReason;
}

// --- the described ladder ----------------------------------------------------

function cageReason(
  cages: Cages,
  r: number,
  w: number,
): { op: number; value: number; cells: Point[] } {
  const clue = cages.clues[r];
  return {
    op: clueOp(clue),
    value: clueVal(clue),
    cells: cages.cells[r].map((c) => ({ x: c % w, y: (c / w) | 0 })),
  };
}

function describedLadder(w: number, cages: Cages, dl: keen.Dealt): Ladder<LatinSolver> {
  return latinLadder(keen, {
    cageEasy: compiledRung(
      keen.cageEasy,
      dl,
      ({ r }): KeenReason => ({ kind: "cage", ...cageReason(cages, r, w) }),
    ),
    cage: compiledRung(
      keen.cage,
      dl,
      ({ r }): KeenReason => ({ kind: "cage", ...cageReason(cages, r, w) }),
    ),
    cageLine: compiledRung(
      keen.cageLine,
      dl,
      ({ r, L }): KeenReason => ({
        kind: "cageLine",
        ...cageReason(cages, r, w),
        horizontal: L < w,
      }),
    ),
  });
}

// --- driver ----------------------------------------------------------------

/**
 * Solve the `w × w` Keen board (cage partition + clues in `kclues`) into `soln`
 * (0 = blank), up to difficulty `maxdiff`. Returns the difficulty level reached,
 * or a `DIFF_IMPOSSIBLE`/`DIFF_AMBIGUOUS`/`DIFF_UNFINISHED` sentinel, as
 * `keen.c`'s `solver()` does. `recorder` (hint path only) captures every
 * deduction in solver order.
 */
export function solveKeen(
  w: number,
  kclues: KeenClues,
  soln: Uint8Array,
  maxdiff: number,
  recorder?: (rec: DeductionRecord) => void,
): number {
  const cages = cagesOf(w, kclues);
  const dl = dealtOf(cages);
  return latinSolver(soln, w, {
    maxdiff,
    diffRecursive: DIFF_UNREASONABLE,
    isAnswer: (grid) => keen.isAnswer(grid, latinSpace(w), dl),
    recorder,
    ladder: describedLadder(w, cages, dl),
  });
}

/**
 * Run the recording solver on a sound candidate cube seeded from `grid` (the
 * placed entries only — never the player's notes), up to `maxdiff`, and return
 * every candidate elimination and cell placement it makes, in solver order, each
 * tagged with the rule + premise that forced it. This is the raw deduction script
 * a hint narrates. `grid` is treated read-only (a working copy is solved
 * internally).
 */
export function recordKeenDeductions(
  w: number,
  kclues: KeenClues,
  grid: Uint8Array,
  maxdiff: number,
): HintOp[] {
  const ops: HintOp[] = [];
  solveKeen(w, kclues, grid.slice(), maxdiff, (rec) => ops.push(rec as HintOp));
  return ops;
}
