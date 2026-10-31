/**
 * Mathrax solver: the ladder `mathrax.description.yaml` states, compiled, with
 * the reason its clue readings record for the hint, on the shared
 * `LatinSolver` (`engine/latin.ts`), whose forcing chains and recursion are
 * the search above the ladder. The tiers:
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

import type {
  DeductionRecord,
  DeductionRecorder,
} from "../../engine/deduction-record.ts";
import { type ClueList, clueList } from "../../engine/describe-runtime.ts";
import {
  compiledRung,
  DIFF_AMBIGUOUS,
  DIFF_IMPOSSIBLE,
  DIFF_UNFINISHED,
  LATIN_RUNGS,
  type LatinLadder,
  type LatinReason,
  type LatinRung,
  latinSolver,
} from "../../engine/latin.ts";
import type { SingleReason } from "../../engine/latin-hint.ts";
import * as mathrax from "./mathrax.compiled.ts";
import {
  CLUE_ADD,
  CLUE_DIV,
  CLUE_EVN,
  CLUE_MUL,
  CLUE_ODD,
  CLUE_SUB,
  clueNum,
  clueType,
  DIFF_RECURSIVE,
} from "./state.ts";

/** Solver verdicts, upstream `mathrax_solve`'s return codes. */
export const SOLVE_IMPOSSIBLE = -1;
export const SOLVE_STUCK = 0;
export const SOLVE_UNIQUE = 1;
export const SOLVE_AMBIGUOUS = 2;

/**
 * Why a Mathrax-specific deduction ruled a candidate out — the premise the hint
 * narrates and highlights. Combined with {@link LatinReason} (the generic
 * positional/set deductions) it covers every technique the recording
 * solver fires. The `kind` fields never collide with the Latin reasons.
 *
 * There is **one** clue arm, not one per clue shape, because everything else a
 * sentence needs is derivable: the packed `clue` carries its operation and
 * number, the intersection `(cx, cy)` plus the acted-on cell give the cell
 * diagonally across it, and whether that cell shows a digit is a fact about the
 * *working board* the hint re-derives at narration time rather than a fact the
 * solver could record (docs/hints-candidates.md § "Re-derive a placement's why"
 * applies the same rule to a single).
 */
export type MathraxReason =
  /** The clue packed in `clue`, sitting at interior intersection `(cx, cy)`. */
  | { kind: "clue"; clue: number; cx: number; cy: number }
  /** The singles the hint plan re-derives from the working board at placement
   * time (the recording solver records them all as `single`). */
  | SingleReason;

/** A reason attached to a recorded Mathrax deduction. */
export type HintReason = MathraxReason | LatinReason;

/** One recorded Mathrax deduction op (a {@link DeductionRecord} with a narrowed
 * reason). */
export interface HintOp extends DeductionRecord {
  reason: HintReason;
}

const KIND_OF_TYPE = new Map<number, keyof mathrax.Dealt>([
  [CLUE_ADD, "sum"],
  [CLUE_SUB, "difference"],
  [CLUE_MUL, "product"],
  [CLUE_DIV, "quotient"],
  [CLUE_EVN, "parity"],
  [CLUE_ODD, "parity"],
]);

/** The clues as the description reads them, each at its corner: a sign's
 * kind with its number, and E and O a parity of 0 and 1. */
function dealtOf(clues: Int32Array): mathrax.Dealt {
  const ofKind = (kind: keyof mathrax.Dealt): ClueList => {
    const ks: number[] = [];
    const vs: number[] = [];
    clues.forEach((clue, k) => {
      const type = clueType(clue);
      if (KIND_OF_TYPE.get(type) !== kind) return;
      ks.push(k);
      vs.push(type === CLUE_EVN ? 0 : type === CLUE_ODD ? 1 : clueNum(clue));
    });
    return clueList(ks, vs, clues.length);
  };
  return {
    sum: ofKind("sum"),
    difference: ofKind("difference"),
    product: ofKind("product"),
    quotient: ofKind("quotient"),
    parity: ofKind("parity"),
  };
}

function describedLadder(o: number, clues: Int32Array): LatinLadder {
  const dl = dealtOf(clues);
  const co = o - 1;
  const reason = ({ k }: { k: number }): MathraxReason => ({
    kind: "clue",
    clue: clues[k],
    cx: k % co,
    cy: (k / co) | 0,
  });
  const ladder: Record<mathrax.LadderId, () => LatinRung> = {
    clueEasy: () => compiledRung(mathrax.clueEasy, dl, reason),
    "latin.hiddenSingle": () => LATIN_RUNGS["latin.hiddenSingle"],
    "latin.single": () => LATIN_RUNGS["latin.single"],
    clue: () => compiledRung(mathrax.clue, dl, reason),
    "latin.set": () => LATIN_RUNGS["latin.set"],
    clueTricky: () => compiledRung(mathrax.clueTricky, dl, reason),
    "latin.fish": () => LATIN_RUNGS["latin.fish"],
    "latin.wing": () => LATIN_RUNGS["latin.wing"],
  };
  return {
    ladder: mathrax.ladder.map(({ id, tier, until }) => ({
      tier,
      until,
      run: ladder[id](),
    })),
  };
}

/**
 * Solve `grid` (0 = blank, **written back in place** with the first solution
 * found, exactly as upstream) under `clues`, up to difficulty `maxdiff`.
 * Returns one of {@link SOLVE_IMPOSSIBLE} / {@link SOLVE_STUCK} /
 * {@link SOLVE_UNIQUE} / {@link SOLVE_AMBIGUOUS}.
 *
 * The write-back is load-bearing: the generator's two clue-stripping loops keep
 * their own backup of the puzzle and restore it after each trial solve.
 *
 * `recorder` is the hint path's only extra: see {@link recordMathraxDeductions}.
 */
export function mathraxSolve(
  o: number,
  grid: Uint8Array,
  clues: Int32Array,
  maxdiff: number,
  recorder?: DeductionRecorder,
): number {
  const diff = latinSolver<null>(grid, o, {
    maxdiff,
    diffRecursive: DIFF_RECURSIVE,
    // Upstream `mathrax_valid` is a constant `true`: the clue readings check
    // every clue, so the generic post-check is skipped.
    valid: null,
    ctx: null,
    recorder,
    budgetLabel: "mathrax hint",
    ...describedLadder(o, clues),
  });
  if (diff === DIFF_IMPOSSIBLE) return SOLVE_IMPOSSIBLE;
  if (diff === DIFF_UNFINISHED) return SOLVE_STUCK;
  if (diff === DIFF_AMBIGUOUS) return SOLVE_AMBIGUOUS;
  return SOLVE_UNIQUE;
}

/**
 * Run the recording solver on a sound candidate cube seeded from `grid` (the
 * placed givens/entries only — never the player's notes), up to `maxdiff`, and
 * return every candidate elimination and cell placement it makes, in solver
 * order, each tagged with the rule + premise that forced it. This is the raw
 * deduction script a hint narrates. `grid` is treated read-only (a working copy
 * is solved internally).
 */
export function recordMathraxDeductions(
  o: number,
  clues: Int32Array,
  grid: Uint8Array,
  maxdiff: number,
): HintOp[] {
  const ops: HintOp[] = [];
  mathraxSolve(o, grid.slice(), clues, maxdiff, (r) => ops.push(r as HintOp));
  return ops;
}
