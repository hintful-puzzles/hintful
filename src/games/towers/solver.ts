/**
 * Towers solver: the ladder `towers.description.yaml` states, compiled, and
 * the answer check its rules compile to, on the shared `LatinSolver`
 * (`engine/latin.ts`), whose forcing chains and recursion are the search above
 * the ladder. The tiers:
 *
 *   Easy (`DIFF_EASY`)         → the facing pairs, each clue's bounds, and
 *                                the library's singles.
 *   Hard (`DIFF_HARD`)         → each clue's arrangements, then the library's
 *                                set elimination.
 *   Extreme (`DIFF_EXTREME`)   → the library's fish and wing.
 *   Unreasonable               → the engine's forcing chains and recursion.
 *
 * A clue sits at its slot, its index in `clues`: above each column, below
 * each, left of each row, right of each, and sees its line nearest it first.
 */

import { clueAt, type GridSpace, latinSpace } from "../../engine/describe-runtime.ts";
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
import { DIFF_UNREASONABLE, dealtOf } from "./state.ts";
import * as towers from "./towers.compiled.ts";

export { DIFF_AMBIGUOUS, DIFF_IMPOSSIBLE };

/** Why a Towers-specific step is forced, as the hint narrates and highlights
 * it. Together with {@link LatinReason} it covers every technique the hint
 * narrates; the `kind`s never collide. `fullLine`/`tallestNearest` come from
 * the hint planner's own extreme-clue check, not from the ladder. */
export type TowersReason =
  /** A clue equal to the grid width — the whole line must climb `1..w`. */
  | { kind: "fullLine"; clue: number; clueVal: number }
  /** A clue of `1` — the tallest tower must stand next to the clue. */
  | { kind: "tallestNearest"; clue: number; clueVal: number }
  /** A pair of facing clues summing to `w+1` fixes the tallest tower's spot. */
  | { kind: "facing"; clue: number; clue2: number; clueVal: number }
  /** The clue already sees an increasing run one short of its count, so the
   * cell next to the clue must hold the tallest remaining tower. */
  | { kind: "lineFull"; clue: number; clueVal: number }
  /** A height too tall to hide this close to the clue (the lower-bound rule). */
  | { kind: "lowerBound"; clue: number; clueVal: number; height: number }
  /** No valid height arrangement giving exactly `clueVal` visible towers puts
   * this height here (the hard exhaustive-arrangement rule). */
  | { kind: "arrangement"; clue: number; clueVal: number }
  /** The singles the hint plan re-derives from the working board. */
  | SingleReason;

/** A reason a Towers hint step gives. */
export type HintReason = TowersReason | LatinReason;

/** The facing pair of `P` whose tallest tower stands in `cell`. */
export function facingReason(
  P: readonly number[],
  cell: number,
  cl: towers.Dealt,
  sp: GridSpace,
): TowersReason {
  const s = P.find((s) => sp.sight[s][clueAt(cl.sees, s) - 1] === cell);
  if (s === undefined) throw new Error(`no facing pair places in cell ${cell}`);
  return {
    kind: "facing",
    clue: s,
    clue2: sp.opposite[s],
    clueVal: clueAt(cl.sees, s),
  };
}

/** The ladder `towers.description.yaml` states, over the dealt clues. */
export function towersLadder(cl: towers.Dealt): Ladder<LatinSolver> {
  return latinLadder(towers, {
    facing: compiledRung(towers.facing, cl),
    bounds: compiledRung(towers.bounds, cl),
    arrangement: compiledRung(towers.arrangement, cl),
  });
}

// --- driver ----------------------------------------------------------------

/**
 * Solve the `w × w` Towers board with edge `clues` into `soln` (0 = blank),
 * up to difficulty `maxdiff`. Returns the difficulty level reached, or a
 * `DIFF_IMPOSSIBLE`/`DIFF_AMBIGUOUS`/`DIFF_UNFINISHED` sentinel, as
 * `towers.c`'s `solver()` does.
 */
export function solveTowers(
  w: number,
  clues: Int32Array,
  soln: Uint8Array,
  maxdiff: number,
): number {
  const cl = dealtOf(w, clues);
  return latinSolver(soln, w, {
    maxdiff,
    diffRecursive: DIFF_UNREASONABLE,
    isAnswer: (grid) => towers.isAnswer(grid, latinSpace(w), cl),
    ladder: towersLadder(cl),
  });
}
