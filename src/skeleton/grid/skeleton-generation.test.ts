/**
 * What stands in for an oracle: every board dealt needs exactly the tier it
 * was asked at, and every rung of the ladder fires on boards the generator
 * deals (docs/testing.md § "What a new game ships").
 */

import { randomNew } from "../../engine/random/index.ts";
import { describeDealtTiers } from "../../engine/testing/absent-tiers.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import { newSkeletonDesc } from "./generator.ts";
import { skeletonGame } from "./index.ts";
import { SKELETON_RUNGS, SkeletonBoard, solveSkeleton } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  encodeParams,
  newState,
  type SkeletonParams,
} from "./state.ts";

/** Every preset, the smallest board there is, and one that is not square. */
const SHAPES: SkeletonParams[] = [
  ...leafPresets(skeletonGame).map((l) => l.params),
  { w: 3, h: 3, diff: DIFF_EASY },
  { w: 3, h: 3, diff: DIFF_NORMAL },
  { w: 7, h: 4, diff: DIFF_NORMAL },
];

describeDealtTiers(
  skeletonGame,
  SHAPES.map((p) => encodeParams(p, true)),
);

const SEEDS = ["a", "b", "c"];

describeLadderCensus<SkeletonParams & { desc: string }>({
  game: "skeleton",
  rungs: SKELETON_RUNGS,
  unreached: {},
  caps: [DIFF_EASY, DIFF_NORMAL],
  cases: SHAPES.flatMap((p) =>
    SEEDS.map((seed) => {
      const label = `${encodeParams(p, true)} ${seed}`;
      const { desc } = newSkeletonDesc(p, randomNew(`ladder ${label}`));
      return { label, board: () => ({ ...p, desc }) };
    }),
  ),
  solve: (p, cap, firings) => {
    const { w, h, clues, grid } = newState(p, p.desc);
    return solveSkeleton(new SkeletonBoard(w, h, clues, grid), cap, firings);
  },
});
