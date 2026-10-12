/**
 * Skeleton's generator: fill squares at random, number every square left
 * empty, take numbers away while the ladder still finishes the board, and
 * keep the board only if it needs exactly the tier asked for.
 */

import { type CappedSolve, solvableAtExactlyTier } from "../../engine/difficulty.ts";
import { type RandomState, randomUpto } from "../../engine/random/index.ts";
import { retryLimit } from "../../engine/retry-limit.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { SkeletonBoard, solveSkeleton } from "./solver.ts";
import { encodeDesc, NO_CLUE, neighbors, type SkeletonParams } from "./state.ts";

/** One square in this many is filled in the answer. */
const FILL_ONE_IN = 3;

/** Whether the ladder, capped at `cap`, finishes the board `clues` give. */
function solves(p: SkeletonParams, clues: Int8Array, cap: number): boolean {
  const board = new SkeletonBoard(p.w, p.h, clues, new Uint8Array(p.w * p.h));
  return solveSkeleton(board, cap) === "solved";
}

/** A random answer with a number on every empty square. */
function fullyClued(p: SkeletonParams, rng: RandomState): Int8Array {
  const { w, h } = p;
  const filled = Uint8Array.from({ length: w * h }, () =>
    randomUpto(rng, FILL_ONE_IN) === 0 ? 1 : 0,
  );
  return Int8Array.from(filled, (f, i) =>
    f ? NO_CLUE : neighbors(w, h, i).filter((j) => filled[j]).length,
  );
}

export function newSkeletonDesc(p: SkeletonParams, rng: RandomState): { desc: string } {
  const attempt = retryLimit("skeleton: generation");
  for (;;) {
    attempt();
    const clues = fullyClued(p, rng);
    if (!solves(p, clues, p.diff)) continue;

    // Take numbers away in a random order, keeping each one the ladder cannot
    // do without at this tier.
    const order = Array.from(clues.keys()).filter((i) => clues[i] !== NO_CLUE);
    shuffle(order, rng);
    for (const i of order) {
      const was = clues[i];
      clues[i] = NO_CLUE;
      if (!solves(p, clues, p.diff)) clues[i] = was;
    }

    // Removing numbers can only have made the board harder, never easier,
    // but it need not have reached the tier.
    const capped: CappedSolve = (cap) =>
      solves(p, clues, cap) ? "solved" : "unsolved";
    if (solvableAtExactlyTier(capped, p.diff)) return { desc: encodeDesc(clues) };
  }
}
