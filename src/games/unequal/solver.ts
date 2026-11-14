/**
 * Unequal's ladder: the techniques `unequal.description.yaml` states,
 * compiled. The shared edge-clue solver (`engine/edge-clue-latin/solver.ts`)
 * runs it on the `LatinSolver`, and the hint runs it on the player's notes.
 */

import { clueList, latinSpace } from "../../engine/describe-runtime.ts";
import { ADJTHAN, type ClueKind } from "../../engine/edge-clue-latin/state.ts";
import { compiledRung } from "../../engine/ladder-runtime.ts";
import { type LatinReason, latinLadder } from "../../engine/latin.ts";
import type { SingleReason } from "../../engine/latin-hint.ts";
import * as unequal from "./unequal.compiled.ts";

/** Why a sign ruled a candidate out — the premise the hint narrates and
 * highlights, built from what `sign` says.
 *
 * Each carries the cell across the `>` sign (`ox`,`oy`) plus that cell's
 * binding value (`bound`, 1-based): for `greater` the smaller cell can be no
 * *less* than `bound`, so this cell must exceed it; for `lesser` the larger cell
 * can be no *more* than `bound`, so this cell must fall short of it. */
export type UnequalReason =
  | { kind: "greater"; ox: number; oy: number; bound: number }
  | { kind: "lesser"; ox: number; oy: number; bound: number }
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

export const signAnswer: ClueKind["isAnswer"] = (grid, o, flags) =>
  unequal.isAnswer(grid, latinSpace(o), dealtOf(o, flags));

export const signLadder: ClueKind["ladder"] = (o, flags) =>
  latinLadder(unequal, { sign: compiledRung(unequal.sign, dealtOf(o, flags)) });
