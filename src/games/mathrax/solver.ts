/**
 * Mathrax solver: the ladder `mathrax.description.yaml` states, compiled, on
 * the shared `LatinSolver` (`engine/latin.ts`), whose forcing chains and
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

import { latinSpace } from "../../engine/describe-runtime.ts";
import { compiledRung, type Ladder } from "../../engine/ladder-runtime.ts";
import {
  DIFF_AMBIGUOUS,
  DIFF_IMPOSSIBLE,
  DIFF_UNFINISHED,
  type LatinReason,
  type LatinSolver,
  latinLadder,
  latinSolver,
} from "../../engine/latin.ts";
import type { SingleReason } from "../../engine/latin-hint.ts";
import * as mathrax from "./mathrax.compiled.ts";
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
 * There is **one** clue arm, not one per clue shape, because everything else a
 * sentence needs is derivable: the packed `clue` carries its operation and
 * number, the intersection `(cx, cy)` plus the acted-on cell give the cell
 * diagonally across it, and whether that cell shows a digit is a fact about the
 * *working board* the hint re-derives at narration time
 * (docs/hints-candidates.md § "Re-derive a placement's why" applies the same
 * rule to a single).
 */
export type MathraxReason =
  /** The clue packed in `clue`, sitting at interior intersection `(cx, cy)`. */
  | { kind: "clue"; clue: number; cx: number; cy: number }
  /** The singles the hint plan re-derives from the working board. */
  | SingleReason;

/** A reason a Mathrax hint step gives. */
export type HintReason = MathraxReason | LatinReason;

/** Clue `k` of an order-`o` board as a {@link MathraxReason}. */
export function clueReason(clues: Int32Array, k: number, o: number): MathraxReason {
  const co = o - 1;
  return { kind: "clue", clue: clues[k], cx: k % co, cy: (k / co) | 0 };
}

/** The ladder `mathrax.description.yaml` states, over the dealt clues. */
export function mathraxLadder(dl: mathrax.Dealt): Ladder<LatinSolver> {
  return latinLadder(mathrax, {
    clueEasy: compiledRung(mathrax.clueEasy, dl),
    clue: compiledRung(mathrax.clue, dl),
    clueTricky: compiledRung(mathrax.clueTricky, dl),
  });
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
