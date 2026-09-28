/*
 * The firing census of Bridges' `runDeductionFixpoint` ladder: which stages the
 * generated corpus reaches. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; why a rung that sweeps every island before
 * reporting is legal is at `Solver.ladder`.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { newBridgesDesc } from "./generator.ts";
import { solveFromScratch } from "./solver.ts";
import {
  BRIDGES_PRESETS,
  type BridgesParams,
  type BridgesState,
  newStateFromDesc,
} from "./state.ts";

/** One preset per difficulty, plus a larger board so the connectivity stage has
 * something to chew on. */
const SHAPES: BridgesParams[] = [
  BRIDGES_PRESETS[0],
  BRIDGES_PRESETS[1],
  BRIDGES_PRESETS[2],
  BRIDGES_PRESETS[BRIDGES_PRESETS.length - 1],
];

const SEEDS = ["lad-a", "lad-b", "lad-c"];

const cases = SHAPES.flatMap((params) =>
  SEEDS.map((seed) => {
    const label = `${params.w}x${params.h} d${params.difficulty} ${seed}`;
    const { desc } = newBridgesDesc(params, randomNew(`bridges-ladder-${label}`));
    return { label, board: () => newStateFromDesc(params, desc) };
  }),
);

describeLadderCensus<BridgesState>({
  game: "bridges",
  rungs: [
    "stage1-arithmetic",
    "stage2-counting",
    "stage2-sealing",
    "stage3-connectivity",
  ],
  unreached: {},
  // The stages' own tiers, plus one above the top, where `difficulty` caps nothing.
  caps: [0, 1, 2, 3],
  cases,
  solve: (s, cap, firings) => solveFromScratch(s, cap, firings),
});
