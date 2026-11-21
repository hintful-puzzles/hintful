/**
 * Adjacent's ladder: the techniques `adjacent.description.yaml` states,
 * compiled. The shared edge-clue solver (`engine/edge-clue-latin/solver.ts`)
 * runs it on the `LatinSolver`, and the hint runs it on the player's notes.
 */

import type { Narration } from "../../engine/contract/hint-words.ts";
import { ADJTHAN, type ClueKind } from "../../engine/edge-clue-latin/state.ts";
import type { SingleReason } from "../../engine/hint/latin-hint.ts";
import { clueList, latinSpace } from "../../engine/solve/describe-runtime.ts";
import { type LatinReason, latinLadder } from "../../engine/solve/latin.ts";
import * as adjacent from "../../generated/games/adjacent/adjacent.compiled.ts";

/** Why a bar, or its absence, ruled a candidate out: the premise the
 * description states for the wording that held. */
export type BarReason =
  | { kind: "adjacent" | "adjacentSet"; premise: Narration }
  /** The singles the hint plan reads off the working board. */
  | SingleReason;

/** A reason an Adjacent hint step narrates. */
export type HintReason = BarReason | LatinReason;

/** The board's bars as the description deals them: every edge, a bar or
 * none, read from either end since a bar is flagged at both. */
function dealtOf(o: number, flags: Int32Array): adjacent.Dealt {
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
  return { bar: clueList(at, v, edges) };
}

export const barRules: ClueKind["rules"] = (o, flags) => {
  const sp = latinSpace(o);
  const dl = dealtOf(o, flags);
  return {
    isAnswer: (g) => adjacent.isAnswer(g, sp, dl),
    violations: (g) => adjacent.violations(g, sp, dl),
    edges: dl.bar.at,
  };
};

export const barLadder: ClueKind["ladder"] = (o, flags) => {
  const cl = dealtOf(o, flags);
  return latinLadder(adjacent, cl);
};
