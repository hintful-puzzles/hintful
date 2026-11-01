/**
 * Twiddle's moves, as the engine's staged planner takes them
 * (`engine/permutation-planner.ts`): each of the description's anticlockwise
 * turns is a generator, and its clockwise turn the generator undone.
 */

import {
  type Move,
  type PermutationPlan,
  planByStage,
} from "../../engine/permutation-planner.ts";
import { moveEffect } from "../../engine/position-runtime.ts";
import type { TwiddleMove, TwiddleState } from "./state.ts";
import { positionOf, rulesOf, turnOf } from "./state.ts";
import * as twiddle from "./twiddle.compiled.ts";

/** A turn by its index: block `t >> 1` in row-major order of top-left
 * corners, anticlockwise when `t` is even and clockwise when odd. */
export type Turn = Move;

/** The turn's move. */
export function turnMove(
  w: number,
  n: number,
  t: Turn,
): Extract<TwiddleMove, { type: "rotate" }> {
  const across = w - n + 1;
  const b = t >> 1;
  return {
    type: "rotate",
    x: b % across,
    y: Math.floor(b / across),
    dir: t & 1 ? -1 : 1,
  };
}

/** The description's turn `t` played on `p`. */
export function playTurn(
  state: TwiddleState,
  p: twiddle.Position,
  t: Turn,
): twiddle.Position {
  const m = turnMove(state.w, state.n, t);
  return rulesOf(state).play(p, turnOf(state.w, m.x, m.y, m.dir));
}

/** The plan from this board. A tile is in place upright, where orientation
 * counts, and in reading order of its number. */
export function planTwiddle(state: TwiddleState): PermutationPlan {
  const { w, h, orientable } = state;
  const rules = rulesOf(state);
  // The description lists the anticlockwise turns first, block by block in
  // reading order, as the planner numbers its generators.
  const generators = rules
    .moves(positionOf(state))
    .filter((m) => m.move === "anticlockwise")
    .map((m) => moveEffect(rules, twiddle.layers, w * h, m, "value", "turn", 4));
  return planByStage({
    generators,
    spins: orientable ? 4 : 1,
    values: state.numbers,
    turned: orientable ? Uint8Array.from(state.orient) : null,
    goal: Int32Array.from(state.numbers).sort(),
  });
}
