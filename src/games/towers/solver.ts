/**
 * Towers solver: the ladder `towers.description.yaml` states, compiled, with
 * the reason each technique records for the hint, and the validator
 * (`towers_valid`), on the shared `LatinSolver` (`engine/latin.ts`), whose
 * forcing chains and recursion are the search above the ladder. The tiers:
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

import { clueAt, clueList } from "../../engine/describe-runtime.ts";
import {
  compiledRung,
  type DeductionRecord,
  DIFF_AMBIGUOUS,
  DIFF_IMPOSSIBLE,
  LATIN_RUNGS,
  type LatinLadder,
  type LatinReason,
  type LatinRung,
  type LatinSolver,
  latinSolver,
} from "../../engine/latin.ts";
import type { SingleReason } from "../../engine/latin-hint.ts";
import { DIFF_UNREASONABLE, lineCells } from "./state.ts";
import * as towers from "./towers.compiled.ts";

export { DIFF_AMBIGUOUS, DIFF_IMPOSSIBLE };

/** Why a Towers-specific deduction forced a candidate change — the premise the
 * hint narrates and highlights. Together with {@link LatinReason} it covers
 * every technique the hint narrates; the `kind`s never collide.
 * `fullLine`/`tallestNearest` come from the hint planner's own extreme-clue
 * check, not from the recording solver. */
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
  /** The singles the hint plan re-derives from the working board at placement
   * time (the recording solver records them all as `single`). */
  | SingleReason;

/** A reason attached to a recorded Towers deduction. */
export type HintReason = TowersReason | LatinReason;

/** One recorded Towers deduction op (a {@link DeductionRecord} with a narrowed
 * reason). */
export interface HintOp extends DeductionRecord {
  reason: HintReason;
}

/** What the validator reads: the grid's width and its edge clues. */
interface TowersCtx {
  w: number;
  clues: Int32Array;
}

// --- validator -------------------------------------------------------------

function towersValid(solver: LatinSolver, ctx: TowersCtx): boolean {
  const w = ctx.w;
  const clues = ctx.clues;
  for (let c = 0; c < 4 * w; c++) {
    const clue = clues[c];
    if (!clue) continue;
    const cells = lineCells(c, w);
    let n = 0;
    let best = 0;
    for (let i = 0; i < w; i++) {
      const v = solver.grid[cells[i].y * w + cells[i].x];
      if (v > best) {
        best = v;
        n++;
      }
    }
    if (n !== clue) return false;
  }
  return true;
}

// --- the described ladder ----------------------------------------------------

/** The facing pair whose tower a facing firing placed in `cell`: the first,
 * as the firing's facts are made in the pairs' order. */
function facingReason(
  P: readonly number[],
  cell: number,
  cl: towers.Dealt,
  sp: LatinSolver["sp"],
): TowersReason {
  const s = P.find((s) => sp.sight[s][clueAt(cl.sees, s) - 1] === cell) as number;
  return {
    kind: "facing",
    clue: s,
    clue2: sp.opposite[s],
    clueVal: clueAt(cl.sees, s),
  };
}

const TOWERS_LADDER: Record<towers.LadderId, (cl: towers.Dealt) => LatinRung> = {
  facing: (cl) =>
    compiledRung(towers.facing, cl, ({ P }, cell, _n, solver) =>
      facingReason(P, cell, cl, solver.sp),
    ),
  bounds: (cl) =>
    compiledRung(
      towers.bounds,
      cl,
      ({ s, v, near }, _c, n): TowersReason =>
        near
          ? { kind: "lineFull", clue: s, clueVal: v }
          : { kind: "lowerBound", clue: s, clueVal: v, height: n },
    ),
  "latin.hiddenSingle": () => LATIN_RUNGS["latin.hiddenSingle"],
  "latin.single": () => LATIN_RUNGS["latin.single"],
  arrangement: (cl) =>
    compiledRung(
      towers.arrangement,
      cl,
      ({ s, v }): TowersReason => ({ kind: "arrangement", clue: s, clueVal: v }),
    ),
  "latin.set": () => LATIN_RUNGS["latin.set"],
  "latin.fish": () => LATIN_RUNGS["latin.fish"],
  "latin.wing": () => LATIN_RUNGS["latin.wing"],
};

/** The ladder over the dealt clues: each clue at its slot, which is its index
 * in `clues`, in that order. */
function describedLadder(w: number, clues: Int32Array): LatinLadder {
  const at: number[] = [];
  const v: number[] = [];
  clues.forEach((n, s) => {
    if (n) {
      at.push(s);
      v.push(n);
    }
  });
  const cl: towers.Dealt = { sees: clueList(at, v, 4 * w) };
  return {
    ladder: towers.ladder.map(({ id, tier }) => ({ tier, run: TOWERS_LADDER[id](cl) })),
  };
}

// --- driver ----------------------------------------------------------------

/**
 * Solve the `w × w` Towers board with edge `clues` into `soln` (0 = blank),
 * up to difficulty `maxdiff`. Returns the difficulty level reached, or a
 * `DIFF_IMPOSSIBLE`/`DIFF_AMBIGUOUS`/`DIFF_UNFINISHED` sentinel, as
 * `towers.c`'s `solver()` does. `recorder` (hint path only) captures every
 * deduction in solver order.
 */
export function solveTowers(
  w: number,
  clues: Int32Array,
  soln: Uint8Array,
  maxdiff: number,
  recorder?: (rec: DeductionRecord) => void,
): number {
  return latinSolver<TowersCtx>(soln, w, {
    maxdiff,
    diffRecursive: DIFF_UNREASONABLE,
    valid: towersValid,
    ctx: { w, clues },
    recorder,
    ...describedLadder(w, clues),
  });
}

/**
 * Run the recording solver on a sound candidate cube seeded from `grid` (the
 * placed givens/entries only — never the player's notes), up to `maxdiff`, and
 * return every candidate elimination and cell placement it makes, in solver
 * order, each tagged with the rule + premise that forced it — the raw
 * deduction script a hint narrates. `grid` is read-only (a copy is solved).
 */
export function recordTowersDeductions(
  w: number,
  clues: Int32Array,
  grid: Uint8Array,
  maxdiff: number,
): HintOp[] {
  const ops: HintOp[] = [];
  solveTowers(w, clues, grid.slice(), maxdiff, (rec) => ops.push(rec as HintOp));
  return ops;
}
