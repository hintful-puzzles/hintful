/*
 * Subsets' ladder, its description's techniques, certified by a census of
 * which rungs fire. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 *
 * The caps are the tiers the generator asks for, Easy and Normal.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { newSubsetsDesc } from "./generator.ts";
import { subsetsSolveGame } from "./solver.ts";
import { DIFF_EASY, DIFF_NORMAL, newState, type SubsetsParams } from "./state.ts";

/** Subsets has one board shape; the tier is its only axis. */
const SHAPES: SubsetsParams[] = [
  { w: 4, h: 4, n: 4, diff: DIFF_EASY },
  { w: 4, h: 4, n: 4, diff: DIFF_NORMAL },
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
  rungs: [
    "carryIn",
    "carryOut",
    "noShoe",
    "noShoeBeside",
    "lone",
    "onlyCell",
    "smaller",
    "bigger",
  ],
  unreached: {},
  caps: [DIFF_EASY, DIFF_NORMAL],
  cases,
  solve: subsetsSolveGame,
});
