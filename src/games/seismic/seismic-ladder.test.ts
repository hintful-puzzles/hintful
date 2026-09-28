/*
 * The census of Seismic's `runDeductionFixpoint` ladder: which rungs the corpus
 * fires, in both modes at both caps. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { newSeismicDesc } from "./generator.ts";
import { solveGame } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  MODE_SEISMIC,
  MODE_TECTONIC,
  newState,
  type SeismicParams,
} from "./state.ts";

/** Both modes at both tiers: the mode changes the region shapes the rungs reason
 * over, and the tier is what gates the Normal rung. */
const SHAPES: SeismicParams[] = [
  { w: 4, h: 4, diff: DIFF_EASY, mode: MODE_SEISMIC },
  { w: 4, h: 4, diff: DIFF_NORMAL, mode: MODE_TECTONIC },
  { w: 6, h: 6, diff: DIFF_EASY, mode: MODE_TECTONIC },
  { w: 6, h: 6, diff: DIFF_NORMAL, mode: MODE_SEISMIC },
  { w: 7, h: 7, diff: DIFF_NORMAL, mode: MODE_TECTONIC },
];

const SEEDS = ["lad-a", "lad-b", "lad-c"];

const cases = SHAPES.flatMap((params) =>
  SEEDS.map((seed) => {
    const label = `${params.w}x${params.h} mode=${params.mode} diff=${params.diff} ${seed}`;
    const { desc } = newSeismicDesc(params, randomNew(`seismic-ladder-${label}`));
    return { label, board: () => newState(params, desc) };
  }),
);

describeLadderCensus({
  game: "seismic",
  rungs: ["marks", "areas", "attempt"],
  unreached: {},
  caps: [DIFF_EASY, DIFF_NORMAL],
  cases,
  solve: solveGame,
});
