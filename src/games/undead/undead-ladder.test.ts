/*
 * The census of Undead's compiled ladder: which rungs the corpus fires, at
 * each cap. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 */

import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { newUndeadDesc } from "./generator.ts";
import { solveDeductive, TIER_RUNG } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_TRICKY,
  MON_NONE,
  newState,
  type UndeadParams,
} from "./state.ts";
import * as undead from "./undead.compiled.ts";

/** One shape a tier, since the tier is what gates the ladder. */
const SHAPES: UndeadParams[] = [
  { w: 4, h: 4, diff: "easy" },
  { w: 5, h: 5, diff: "normal" },
  { w: 5, h: 5, diff: "tricky" },
];

const SEEDS = ["lad-a", "lad-b", "lad-c"];

const cases = SHAPES.flatMap((params) =>
  SEEDS.map((seed) => {
    const label = `${params.w}x${params.h} ${params.diff} ${seed}`;
    const { desc } = newUndeadDesc(params, randomNew(`undead-ladder-${label}`));
    return { label, board: () => newState(params, desc).common };
  }),
);

describeLadderCensus({
  game: "undead",
  rungs: [...undead.ladder.map((e) => e.id)],
  unreached: {},
  caps: [DIFF_EASY, DIFF_NORMAL, DIFF_TRICKY],
  cases,
  solve: (common, cap, firings) =>
    solveDeductive(
      common,
      new Uint8Array(common.numTotal).fill(MON_NONE),
      TIER_RUNG[cap],
      firings,
    ),
});
