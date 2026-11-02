/*
 * The firing census of Magnets' compiled ladder: which techniques the
 * generated corpus reaches. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 *
 * The generator also runs the ladder while it lays the tiles, over a board
 * with no counts, where only `single` can fire; that is the same ladder, so
 * this census covers it.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { newMagnetsDesc } from "./generator.ts";
import { solveMagnets } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_TRICKY,
  type MagnetsCommon,
  type MagnetsParams,
  newState,
} from "./state.ts";

/** Both tiers and both clue modes, at the preset sizes: the tier is what gates
 * the last four techniques, and stripped clues are what make the counting
 * techniques work for their living. */
const SHAPES: MagnetsParams[] = [
  { w: 6, h: 5, diff: DIFF_EASY, stripclues: false },
  { w: 6, h: 5, diff: DIFF_TRICKY, stripclues: false },
  { w: 6, h: 5, diff: DIFF_TRICKY, stripclues: true },
  { w: 8, h: 7, diff: DIFF_EASY, stripclues: true },
  { w: 8, h: 7, diff: DIFF_TRICKY, stripclues: false },
  { w: 8, h: 7, diff: DIFF_TRICKY, stripclues: true },
  { w: 10, h: 9, diff: DIFF_TRICKY, stripclues: false },
  { w: 10, h: 9, diff: DIFF_TRICKY, stripclues: true },
];

/** Eight seeds, not three: a mis-tiered Normal technique shows only on a
 * Normal board where it is the first Normal one to fire from the Easy stall,
 * and fifteen boards contained none such. */
const SEEDS = ["lad-a", "lad-b", "lad-c", "lad-d", "lad-e", "lad-f", "lad-g", "lad-h"];

interface Board {
  w: number;
  h: number;
  common: MagnetsCommon;
}

const cases = SHAPES.flatMap((params) =>
  SEEDS.map((seed) => {
    const label = `${params.w}x${params.h} diff=${params.diff}${params.stripclues ? " strip" : ""} ${seed}`;
    const { desc } = newMagnetsDesc(params, randomNew(`magnets-ladder-${label}`));
    const { w, h, common } = newState(params, desc);
    return { label, board: (): Board => ({ w, h, common }) };
  }),
);

describeLadderCensus<Board>({
  game: "magnets",
  rungs: ["single", "count", "oddGap", "marked", "oneNeutral", "everyTile", "onlyEnd"],
  unreached: {},
  caps: [DIFF_EASY, DIFF_TRICKY],
  cases,
  solve: ({ w, h, common }, cap, firings) =>
    solveMagnets(w, h, common, cap, firings).verdict,
});
