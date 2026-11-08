/*
 * The census of Tracks' compiled ladder: which rungs the corpus fires, at
 * each cap. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 */

import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { newDesc } from "./generator.ts";
import { tracksSolve } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_HARD,
  DIFF_TRICKY,
  newState,
  stateToBoard,
  type TracksParams,
} from "./state.ts";
import * as tracks from "./tracks.compiled.ts";

/** Board shapes wide enough to need the harder rungs, small enough to generate
 * quickly. One params set per tier, since the tier is what gates the ladder. */
const SHAPES: TracksParams[] = [
  { w: 8, h: 8, diff: DIFF_EASY, singleOnes: true },
  { w: 8, h: 8, diff: DIFF_TRICKY, singleOnes: true },
  { w: 10, h: 8, diff: DIFF_TRICKY, singleOnes: true },
  { w: 10, h: 10, diff: DIFF_HARD, singleOnes: true },
];

const SEEDS = ["lad-a", "lad-b", "lad-c", "lad-d", "lad-e"];

/** A board on which `finishEarly` fires: joining A's run to B's would strand
 * no track and leave a clue short, which takes a board with no given piece
 * between the runs. None of the boards above has one; this is one of 450
 * boards of 4x4 to 7x7 (2026-10-07), and `tracks-hint.test.ts` pins it too. */
const FINISHES_EARLY: TracksParams = {
  w: 5,
  h: 4,
  diff: DIFF_TRICKY,
  singleOnes: true,
};
const FINISHES_EARLY_DESC = "j5d9d,S2,3,3,3,3,3,3,S4,4";

const dealt = SHAPES.flatMap((params) =>
  SEEDS.map((seed) => {
    const label = `${params.w}x${params.h} diff=${params.diff} ${seed}`;
    // Generated once per case, decoded fresh per solve.
    const { desc } = newDesc(params, randomNew(`tracks-ladder-${label}`));
    return { label, board: () => stateToBoard(newState(params, desc)) };
  }),
);

const cases = [
  ...dealt,
  {
    label: "5x4, finishes early",
    board: () => stateToBoard(newState(FINISHES_EARLY, FINISHES_EARLY_DESC)),
  },
];

describeLadderCensus({
  game: "tracks",
  rungs: [...tracks.ladder.map((e) => e.id)],
  unreached: {},
  caps: [DIFF_EASY, DIFF_TRICKY, DIFF_HARD],
  cases,
  solve: tracksSolve,
});
