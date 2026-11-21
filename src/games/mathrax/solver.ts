/**
 * Mathrax solver: the ladder `mathrax.description.yaml` states, compiled, on
 * the shared `LatinSolver` (`engine/solve/latin.ts`), whose forcing chains and
 * recursion are the search above the ladder. The tiers:
 *
 *   Easy (`DIFF_EASY`)         → a cell that the clues at its corners leave
 *                                one value, an arithmetic clue read only with
 *                                one value open across it, and the library's
 *                                singles.
 *   Normal (`DIFF_NORMAL`)     → the same reading every arithmetic clue, then
 *                                the library's set elimination.
 *   Tricky (`DIFF_TRICKY`)     → whatever a clue rules out, then the library's
 *                                fish and wing.
 *   Unreasonable               → the engine's forcing chains and recursion.
 *
 * A clue is at the corner below and right of cell `(cx, cy)`, numbered
 * `cy·(o − 1) + cx` as `clues` holds it; its kind is its sign, and E and O a
 * parity of 0 and 1.
 */

import type { Point } from "../../engine/contract/types.ts";
import type { SingleReason } from "../../engine/latin-hint.ts";
import { latinSpace } from "../../engine/solve/describe-runtime.ts";
import type { Ladder } from "../../engine/solve/ladder-runtime.ts";
import {
  DIFF_AMBIGUOUS,
  DIFF_IMPOSSIBLE,
  DIFF_UNFINISHED,
  type LatinReason,
  type LatinSolver,
  latinLadder,
  latinSolver,
} from "../../engine/solve/latin.ts";
import type { Clauses } from "../../engine/stated.ts";
import * as mathrax from "../../generated/games/mathrax/mathrax.compiled.ts";
import { DIFF_RECURSIVE, dealtOf } from "./state.ts";

/** Solver verdicts, upstream `mathrax_solve`'s return codes. */
export const SOLVE_IMPOSSIBLE = -1;
export const SOLVE_STUCK = 0;
export const SOLVE_UNIQUE = 1;
export const SOLVE_AMBIGUOUS = 2;

/**
 * Why a Mathrax-specific step struck a candidate, as the hint narrates and
 * highlights it. Combined with {@link LatinReason} (the generic positional and
 * set steps) it covers every technique; the `kind` fields never collide.
 *
 * There is **one** clue arm, not one per clue shape: the clause carries the
 * clue's operation and number, and whether the cell across it shows a digit is
 * a fact about the *working board* the hint re-derives at narration time
 * (docs/hints-candidates.md § "Re-derive a placement's why" applies the same
 * rule to a single).
 */
export type MathraxReason =
  /** The clue at corner `terms.k`, the cells it speaks of (the pair through
   * it, or all four around it) and the clause the description states for it,
   * with the terms the clause reads (`engine/stated.ts`). */
  | { kind: "clue"; cells: Point[]; clause: Clauses; terms: StatedTerms }
  /** The singles the hint plan re-derives from the working board. */
  | SingleReason;

/** A reason a Mathrax hint step gives. */
export type HintReason = MathraxReason | LatinReason;

/** The terms a stated clause reads. */
export type StatedTerms = Readonly<Record<string, unknown>>;

/** The ladder `mathrax.description.yaml` states, over the dealt clues. */
export function mathraxLadder(dl: mathrax.Dealt): Ladder<LatinSolver> {
  return latinLadder(mathrax, dl);
}

/**
 * Solve `grid` (0 = blank, **written back in place** with the first solution
 * found, exactly as upstream) under `clues`, up to difficulty `maxdiff`.
 * Returns one of {@link SOLVE_IMPOSSIBLE} / {@link SOLVE_STUCK} /
 * {@link SOLVE_UNIQUE} / {@link SOLVE_AMBIGUOUS}.
 *
 * The write-back is load-bearing: the generator's two clue-stripping loops keep
 * their own backup of the puzzle and restore it after each trial solve.
 */
export function mathraxSolve(
  o: number,
  grid: Uint8Array,
  clues: Int32Array,
  maxdiff: number,
): number {
  const dl = dealtOf(clues);
  const diff = latinSolver(grid, o, {
    maxdiff,
    diffRecursive: DIFF_RECURSIVE,
    isAnswer: (g) => mathrax.isAnswer(g, latinSpace(o), dl),
    ladder: mathraxLadder(dl),
  });
  if (diff === DIFF_IMPOSSIBLE) return SOLVE_IMPOSSIBLE;
  if (diff === DIFF_UNFINISHED) return SOLVE_STUCK;
  if (diff === DIFF_AMBIGUOUS) return SOLVE_AMBIGUOUS;
  return SOLVE_UNIQUE;
}
