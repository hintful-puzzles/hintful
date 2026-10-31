/**
 * Unequal's ladder: the techniques `unequal.description.yaml` states,
 * compiled, with the reason each records for the hint. The shared edge-clue
 * solver (`engine/edge-clue-latin/solver.ts`) runs it on the `LatinSolver`.
 */

import {
  clueList,
  greatest,
  latinSpace,
  least,
} from "../../engine/describe-runtime.ts";
import { ADJTHAN, type ClueKind } from "../../engine/edge-clue-latin/state.ts";
import {
  compiledRung,
  type DeductionRecord,
  LATIN_RUNGS,
  type LatinLadder,
  type LatinReason,
  type LatinRung,
  type LatinSolver,
} from "../../engine/latin.ts";
import type { SingleReason } from "../../engine/latin-hint.ts";
import * as unequal from "./unequal.compiled.ts";

/** Why a sign ruled a candidate out — the premise the hint narrates and
 * highlights. Combined with {@link LatinReason} (the generic positional/set
 * deductions) it covers every technique the recording solver fires.
 *
 * Each carries the cell across the `>` sign (`ox`,`oy`) plus that cell's
 * binding value (`bound`, 1-based): for `greater` the smaller cell can be no
 * *less* than `bound`, so this cell must exceed it; for `lesser` the larger cell
 * can be no *more* than `bound`, so this cell must fall short of it. */
export type UnequalReason =
  | { kind: "greater"; ox: number; oy: number; bound: number }
  | { kind: "lesser"; ox: number; oy: number; bound: number }
  /** The singles the hint plan re-derives from the working board at placement
   * time (the recording solver records them all as `single`). */
  | SingleReason;

/** A reason attached to a recorded Unequal deduction. */
export type HintReason = UnequalReason | LatinReason;

/** One recorded Unequal deduction op (a {@link DeductionRecord} with a narrowed
 * reason). */
export interface HintOp extends DeductionRecord {
  reason: HintReason;
}

/** The cell across a sign, as a reason names it. */
const across = (c: number, o: number) => ({ ox: c % o, oy: (c / o) | 0 });

/** A struck end's other end can be no less (or, for the smaller end, no more)
 * than this, as the board stood: its least or greatest candidate, past the
 * values altogether when it has none. */
function signReason(
  { big, small }: unequal.SignBinding,
  cell: number,
  solver: LatinSolver,
): UnequalReason {
  const o = solver.o;
  if (cell === big) {
    const m = solver.cand(small);
    return { kind: "greater", ...across(small, o), bound: m === 0 ? o + 1 : least(m) };
  }
  const m = solver.cand(big);
  return { kind: "lesser", ...across(big, o), bound: m === 0 ? 1 : greatest(m) };
}

const RUNGS: Record<unequal.LadderId, (cl: unequal.Dealt) => LatinRung> = {
  "latin.hiddenSingle": () => LATIN_RUNGS["latin.hiddenSingle"],
  "latin.single": () => LATIN_RUNGS["latin.single"],
  sign: (cl) =>
    compiledRung(unequal.sign, cl, (binding, cell, _n, solver) =>
      signReason(binding, cell, solver),
    ),
  "latin.set": () => LATIN_RUNGS["latin.set"],
  "latin.fish": () => LATIN_RUNGS["latin.fish"],
  "latin.wing": () => LATIN_RUNGS["latin.wing"],
};

/**
 * The board's signs as the description deals them: flagged at the greater end,
 * taken column by column and each cell's signs up, right, down, left.
 */
export const signLadder: ClueKind["ladder"] = (o, flags): LatinLadder => {
  const sp = latinSpace(o);
  const edges = sp.edgeEnds.length / 2;
  const at: number[] = [];
  const v: number[] = [];
  for (let x = 0; x < o; x++)
    for (let y = 0; y < o; y++)
      for (const dir of ADJTHAN)
        if (flags[y * o + x] & dir.f) {
          const big = y * o + x;
          at.push(sp.edgeOf(big, (y + dir.dy) * o + x + dir.dx));
          v.push(big);
        }
  const cl: unequal.Dealt = { greater: clueList(at, v, edges) };
  return {
    ladder: unequal.ladder.map(({ id, tier }) => ({ tier, run: RUNGS[id](cl) })),
  };
};
