/**
 * Adjacent's ladder: the techniques `adjacent.description.yaml` states,
 * compiled, with the reason each records for the hint. The shared edge-clue
 * solver (`engine/edge-clue-latin/solver.ts`) runs it on the `LatinSolver`.
 */

import { clueAt, clueList, latinSpace } from "../../engine/describe-runtime.ts";
import { ADJTHAN, type ClueKind } from "../../engine/edge-clue-latin/state.ts";
import {
  compiledRung,
  type DeductionRecord,
  LATIN_RUNGS,
  type LatinLadder,
  type LatinReason,
  type LatinRung,
} from "../../engine/latin.ts";
import type { SingleReason } from "../../engine/latin-hint.ts";
import * as adjacent from "./adjacent.compiled.ts";

/** Why a bar, or its absence, ruled a candidate out — the premise the hint
 * narrates and highlights. Combined with {@link LatinReason} (the generic
 * positional/set deductions) it covers every technique the recording solver
 * fires. Each carries the constraining neighbor (`ox`,`oy`) and whether a bar
 * joins them (`bar`); `adjacent` also the number the neighbor holds. */
export type BarReason =
  | { kind: "adjacent"; ox: number; oy: number; v: number; bar: boolean }
  | { kind: "adjacentSet"; ox: number; oy: number; bar: boolean }
  /** The singles the hint plan re-derives from the working board at placement
   * time (the recording solver records them all as `single`). */
  | SingleReason;

/** A reason attached to a recorded Adjacent deduction. */
export type HintReason = BarReason | LatinReason;

/** One recorded Adjacent deduction op (a {@link DeductionRecord} with a
 * narrowed reason). */
export interface HintOp extends DeductionRecord {
  reason: HintReason;
}

/** The cell across a bar, as a reason names it. */
const across = (c: number, o: number) => ({ ox: c % o, oy: (c / o) | 0 });

const RUNGS: Record<adjacent.LadderId, (cl: adjacent.Dealt) => LatinRung> = {
  "latin.hiddenSingle": () => LATIN_RUNGS["latin.hiddenSingle"],
  "latin.single": () => LATIN_RUNGS["latin.single"],
  adjacent: (cl) =>
    compiledRung(
      adjacent.adjacent,
      cl,
      ({ a, e }, _c, _n, solver): BarReason => ({
        kind: "adjacent",
        ...across(a, solver.o),
        v: solver.value(a),
        bar: clueAt(cl.bar, e) === 1,
      }),
    ),
  adjacentSet: (cl) =>
    compiledRung(
      adjacent.adjacentSet,
      cl,
      ({ a, e }, _c, _n, solver): BarReason => ({
        kind: "adjacentSet",
        ...across(a, solver.o),
        bar: clueAt(cl.bar, e) === 1,
      }),
    ),
  "latin.set": () => LATIN_RUNGS["latin.set"],
  "latin.fish": () => LATIN_RUNGS["latin.fish"],
  "latin.wing": () => LATIN_RUNGS["latin.wing"],
};

/** The board's bars as the description deals them: every edge, a bar or
 * none, read from either end since a bar is flagged at both. */
export const barLadder: ClueKind["ladder"] = (o, flags): LatinLadder => {
  const sp = latinSpace(o);
  const edges = sp.edgeEnds.length / 2;
  const at: number[] = [];
  const v: number[] = [];
  for (let e = 0; e < edges; e++) {
    const a = sp.edgeEnds[2 * e];
    const b = sp.edgeEnds[2 * e + 1];
    const dir = b === a + 1 ? ADJTHAN[1] : ADJTHAN[2];
    at.push(e);
    v.push(flags[a] & dir.f ? 1 : 0);
  }
  const cl: adjacent.Dealt = { bar: clueList(at, v, edges) };
  return {
    ladder: adjacent.ladder.map(({ id, tier }) => ({ tier, run: RUNGS[id](cl) })),
  };
};
