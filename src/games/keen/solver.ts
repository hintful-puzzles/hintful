/**
 * Keen solver: the ladder `keen.description.yaml` states, compiled, with the
 * reason each technique records for the hint, and the validator
 * (`keen_valid`), on the shared `LatinSolver` (`engine/latin.ts`), whose
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

import { type ClueList, clueList, partition } from "../../engine/describe-runtime.ts";
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
import type { Point } from "../../engine/types.ts";
import * as keen from "./keen.compiled.ts";
import {
  C_ADD,
  C_DIV,
  C_MUL,
  C_SUB,
  clueOp,
  clueVal,
  DIFF_UNREASONABLE,
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

/** The cages in the order of their least cells, each cage's cells in reading
 * order, and its packed clue: what the techniques read, their reasons quote,
 * and the validator checks. */
interface Cages {
  cells: number[][];
  clues: number[];
}

function cagesOf(w: number, kclues: KeenClues): Cages {
  const out: Cages = { cells: [], clues: [] };
  const index = new Map<number, number>();
  for (let i = 0; i < w * w; i++) {
    const m = kclues.minimal[i];
    let r = index.get(m);
    if (r === undefined) {
      r = out.cells.length;
      index.set(m, r);
      out.cells.push([]);
      out.clues.push(kclues.clues[m]);
    }
    out.cells[r].push(i);
  }
  return out;
}

// --- validator -------------------------------------------------------------

/** Does the completed grid satisfy every cage clue? (`keen_valid`.) */
function keenValid(solver: LatinSolver, cages: Cages): boolean {
  return cages.cells.every((cells, r) => {
    const value = clueVal(cages.clues[r]);
    const vs = cells.map((c) => solver.grid[c]);
    switch (clueOp(cages.clues[r])) {
      case C_ADD:
        return vs.reduce((a, b) => a + b, 0) === value;
      case C_MUL:
        return vs.reduce((a, b) => a * b, 1) === value;
      case C_SUB:
        return Math.max(...vs) - Math.min(...vs) === value;
      case C_DIV:
        return Math.max(...vs) === value * Math.min(...vs);
      default:
        return false;
    }
  });
}

// --- the described ladder ----------------------------------------------------

type ClueKind = Exclude<keyof keen.Dealt, "cage">;

const KIND_OF_OP = new Map<number, ClueKind>([
  [C_ADD, "sum"],
  [C_MUL, "product"],
  [C_SUB, "difference"],
  [C_DIV, "quotient"],
]);

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

function describedLadder(w: number, cages: Cages): LatinLadder {
  const n = cages.cells.length;
  // Each cage's clue is of the kind its sign names, at the cage.
  const ofKind = (kind: ClueKind): ClueList => {
    const rs = cages.clues.flatMap((clue, r) =>
      KIND_OF_OP.get(clueOp(clue)) === kind ? [r] : [],
    );
    return clueList(
      rs,
      rs.map((r) => clueVal(cages.clues[r])),
      n,
    );
  };
  const dl: keen.Dealt = {
    cage: partition(cages.cells),
    sum: ofKind("sum"),
    product: ofKind("product"),
    difference: ofKind("difference"),
    quotient: ofKind("quotient"),
  };
  const ladder: Record<keen.LadderId, () => LatinRung> = {
    cageEasy: () =>
      compiledRung(
        keen.cageEasy,
        dl,
        ({ r }): KeenReason => ({ kind: "cage", ...cageReason(cages, r, w) }),
      ),
    "latin.hiddenSingle": () => LATIN_RUNGS["latin.hiddenSingle"],
    "latin.single": () => LATIN_RUNGS["latin.single"],
    cage: () =>
      compiledRung(
        keen.cage,
        dl,
        ({ r }): KeenReason => ({ kind: "cage", ...cageReason(cages, r, w) }),
      ),
    cageLine: () =>
      compiledRung(
        keen.cageLine,
        dl,
        ({ r, L }): KeenReason => ({
          kind: "cageLine",
          ...cageReason(cages, r, w),
          horizontal: L < w,
        }),
      ),
    "latin.set": () => LATIN_RUNGS["latin.set"],
    "latin.fish": () => LATIN_RUNGS["latin.fish"],
    "latin.wing": () => LATIN_RUNGS["latin.wing"],
  };
  return {
    ladder: keen.ladder.map(({ id, tier, until }) => ({
      tier,
      until,
      run: ladder[id](),
    })),
  };
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
  return latinSolver<Cages>(soln, w, {
    maxdiff,
    diffRecursive: DIFF_UNREASONABLE,
    valid: keenValid,
    ctx: cages,
    recorder,
    ...describedLadder(w, cages),
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
