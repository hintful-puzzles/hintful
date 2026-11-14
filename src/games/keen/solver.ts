/**
 * Keen solver: the ladder `keen.description.yaml` states, compiled, and the
 * answer check its rules compile to, on the shared `LatinSolver`
 * (`engine/latin.ts`), whose forcing chains and recursion are the search above
 * the ladder. The tiers:
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

/** Why a cage step strikes, as the hint narrates and highlights it. `cage` is
 * the Easy and Normal per-cell pruning: no filling of the cage consistent with
 * its clue leaves this value in this cell. `cageLine` is the Tricky line
 * pruning: every such filling puts a value in the cage's part of a line, so it
 * goes from the rest of the line (`horizontal`: the line is a row). Both carry
 * the cage's sign, value and cells, for the words and the shading. */
export type KeenReason =
  | { kind: "cage"; op: number; value: number; cells: Point[] }
  | { kind: "cageLine"; op: number; value: number; cells: Point[]; horizontal: boolean }
  | SingleReason;

/** A reason a Keen hint step gives. */
export type HintReason = KeenReason | LatinReason;

/** Cage `r`'s sign, value and cells, as a {@link KeenReason} carries them. */
export function cageReason(
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

/** The ladder `keen.description.yaml` states, over the board's cages. */
export function keenLadder(cages: Cages): Ladder<LatinSolver> {
  const dl = dealtOf(cages);
  return latinLadder(keen, {
    cageEasy: compiledRung(keen.cageEasy, dl),
    cage: compiledRung(keen.cage, dl),
    cageLine: compiledRung(keen.cageLine, dl),
  });
}

// --- driver ----------------------------------------------------------------

/**
 * Solve the `w × w` Keen board (cage partition + clues in `kclues`) into `soln`
 * (0 = blank), up to difficulty `maxdiff`. Returns the difficulty level reached,
 * or a `DIFF_IMPOSSIBLE`/`DIFF_AMBIGUOUS`/`DIFF_UNFINISHED` sentinel, as
 * `keen.c`'s `solver()` does.
 */
export function solveKeen(
  w: number,
  kclues: KeenClues,
  soln: Uint8Array,
  maxdiff: number,
): number {
  const cages = cagesOf(w, kclues);
  const dl = dealtOf(cages);
  return latinSolver(soln, w, {
    maxdiff,
    diffRecursive: DIFF_UNREASONABLE,
    isAnswer: (grid) => keen.isAnswer(grid, latinSpace(w), dl),
    ladder: keenLadder(cages),
  });
}
