/*
 * The census of Subsets' `runDeductionFixpoint` ladder: which rungs the corpus
 * fires. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 *
 * Subsets' difficulty is a boolean handed to one rung rather than a cap over
 * the ladder, so `maxTier` is unused. The `caps` below are still both tiers,
 * because the boolean changes what `arrows-advanced` does.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { newSubsetsDesc } from "./generator.ts";
import { subsetsSolveGame } from "./solver.ts";
import { DIFF_EASY, DIFF_TRICKY, newState, type SubsetsParams } from "./state.ts";

/** Subsets has one board shape; the tier is its only axis. */
const SHAPES: SubsetsParams[] = [
  { w: 4, h: 4, n: 4, diff: DIFF_EASY },
  { w: 4, h: 4, n: 4, diff: DIFF_TRICKY },
];

const SEEDS = ["lad-a", "lad-b", "lad-c", "lad-d", "lad-e"];

const cases = SHAPES.flatMap((params) =>
  SEEDS.map((seed) => {
    const label = `diff=${params.diff} ${seed}`;
    const { desc } = newSubsetsDesc(params, randomNew(`subsets-ladder-${label}`));
    return { label, board: () => newState(params, desc) };
  }),
);

describeLadderCensus({
  game: "subsets",
  rungs: ["arrows", "disjoint", "bits-from-cube", "single-position", "arrows-advanced"],
  unreached: {},
  caps: [DIFF_EASY, DIFF_TRICKY],
  cases,
  solve: subsetsSolveGame,
});
