/**
 * Unequal's ladder: the techniques `unequal.description.yaml` states,
 * compiled. The shared edge-clue solver (`engine/edge-clue-latin/solver.ts`)
 * runs it on the `LatinSolver`, and the hint runs it on the player's notes.
 */

import type { Narration } from "../../engine/contract/hint-words.ts";
import { ADJTHAN, type ClueKind } from "../../engine/edge-clue-latin/state.ts";
import type { SingleReason } from "../../engine/hint/latin-hint.ts";
import { clueList, latinSpace } from "../../engine/solve/describe-runtime.ts";
import { type LatinReason, latinLadder } from "../../engine/solve/latin.ts";
import * as unequal from "../../generated/games/unequal/unequal.compiled.ts";

/** Why a sign ruled a candidate out: the larger end (`greater`) or the
 * smaller (`lesser`), with the premise `sign` states for that end. */
export type UnequalReason =
  | { kind: "greater" | "lesser"; premise: Narration }
  /** The singles the hint plan reads off the working board. */
  | SingleReason;

/** A reason an Unequal hint step narrates. */
export type HintReason = UnequalReason | LatinReason;

/**
 * The board's signs as the description deals them: flagged at the greater end,
 * taken column by column and each cell's signs up, right, down, left.
 */
function dealtOf(o: number, flags: Int32Array): unequal.Dealt {
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
  return { greater: clueList(at, v, edges) };
}

export const signRules: ClueKind["rules"] = (o, flags) => {
  const sp = latinSpace(o);
  const dl = dealtOf(o, flags);
  return {
    isAnswer: (g) => unequal.isAnswer(g, sp, dl),
    violations: (g) => unequal.violations(g, sp, dl),
    edges: dl.greater.at,
  };
};

export const signLadder: ClueKind["ladder"] = (o, flags) =>
  latinLadder(unequal, dealtOf(o, flags));
