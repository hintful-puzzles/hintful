/*
 * The firing census of Bridges' compiled ladder: which techniques the
 * generated corpus reaches. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import * as bridges from "./bridges.compiled.ts";
import { newBridgesDesc } from "./generator.ts";
import { bridgesGame } from "./index.ts";
import { solveFromScratch } from "./solver.ts";
import { type BridgesParams, type BridgesState, newStateFromDesc } from "./state.ts";

/** Every line of the menu, in order. */
const BRIDGES_PRESETS = leafPresets(bridgesGame).map((l) => l.params);

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
  rungs: [...bridges.ladder.map((e) => e.id)],
  unreached: {},
  // The stages' own tiers, plus one above the top, where `difficulty` caps nothing.
  caps: [0, 1, 2, 3],
  cases,
  solve: (s, cap, firings) => solveFromScratch(s, cap, firings),
});
