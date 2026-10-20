/**
 * Twiddle's moves, as the engine's staged planner takes them
 * (`engine/permutation-planner.ts`): each block's anticlockwise turn is a
 * generator, and its clockwise turn the generator undone.
 */

import {
  effectOf,
  type Move,
  type PermutationPlan,
  planByStage,
} from "../../engine/permutation-planner.ts";
import type { TwiddleMove, TwiddleState } from "./state.ts";
import { doRotate } from "./state.ts";

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

/** The plan from this board. A tile is in place upright, where orientation
 * counts, and in reading order of its number. */
export function planTwiddle(state: TwiddleState): PermutationPlan {
  const { w, h, n, orientable } = state;
  const size = w * h;
  const generators = [];
  for (let y = 0; y <= h - n; y++)
    for (let x = 0; x <= w - n; x++)
      generators.push(
        effectOf(size, (src, spin) => doRotate(src, spin, w, n, orientable, x, y, 1)),
      );
  return planByStage({
    generators,
    spins: orientable ? 4 : 1,
    values: state.numbers,
    turned: orientable ? state.orient : null,
    goal: Int32Array.from(state.numbers).sort(),
  });
}
