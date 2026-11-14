/**
 * Adjacent's ladder: the techniques `adjacent.description.yaml` states,
 * compiled. The shared edge-clue solver (`engine/edge-clue-latin/solver.ts`)
 * runs it on the `LatinSolver`, and the hint runs it on the player's notes.
 */

import { clueList, latinSpace } from "../../engine/describe-runtime.ts";
import { ADJTHAN, type ClueKind } from "../../engine/edge-clue-latin/state.ts";
import { compiledRung } from "../../engine/ladder-runtime.ts";
import { type LatinReason, latinLadder } from "../../engine/latin.ts";
import type { SingleReason } from "../../engine/latin-hint.ts";
import * as adjacent from "./adjacent.compiled.ts";

/** Why a bar, or its absence, ruled a candidate out — the premise the hint
 * narrates and highlights, built from what the technique says. Each carries
 * the constraining neighbor (`ox`,`oy`) and whether a bar joins them (`bar`);
 * `adjacent` also the number the neighbor holds. */
export type BarReason =
  | { kind: "adjacent"; ox: number; oy: number; v: number; bar: boolean }
  | { kind: "adjacentSet"; ox: number; oy: number; bar: boolean }
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

export const barAnswer: ClueKind["isAnswer"] = (grid, o, flags) =>
  adjacent.isAnswer(grid, latinSpace(o), dealtOf(o, flags));

export const barLadder: ClueKind["ladder"] = (o, flags) => {
  const cl = dealtOf(o, flags);
  return latinLadder(adjacent, {
    adjacent: compiledRung(adjacent.adjacent, cl),
    adjacentSet: compiledRung(adjacent.adjacentSet, cl),
  });
};
