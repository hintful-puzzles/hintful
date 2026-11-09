/*
 * Ascent's ladder, its description's techniques, certified by a census of
 * which rungs fire. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 *
 * `onlyNumberNear` runs at Tricky and not at Hard (`until`), and `overlap`
 * only at Hard but for an Edges board's own `overlapEdges` from Normal, so
 * this walks all four caps and every mode.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { newAscentDesc } from "./generator.ts";
import { ascentSolve } from "./solver.ts";
import {
  type AscentParams,
  type AscentState,
  DIFF_EASY,
  DIFF_HARD,
  DIFF_NORMAL,
  DIFF_TRICKY,
  MODE_EDGES,
  MODE_HEXAGON,
  MODE_ORTHOGONAL,
  MODE_RECT,
  newAscentState,
} from "./state.ts";

const mk = (
  w: number,
  h: number,
  diff: number,
  mode: number,
  removeends = false,
): AscentParams => ({ w, h, diff, mode, removeends, symmetrical: false });

const SHAPES: [string, AscentParams][] = [
  ["5x5 rect normal", mk(5, 5, DIFF_NORMAL, MODE_RECT)],
  ["5x5 rect hard", mk(5, 5, DIFF_HARD, MODE_RECT)],
  ["6x5 orthogonal tricky", mk(6, 5, DIFF_TRICKY, MODE_ORTHOGONAL)],
  ["7x7 hexagon normal", mk(7, 7, DIFF_NORMAL, MODE_HEXAGON)],
  ["5x5 edges tricky", mk(5, 5, DIFF_TRICKY, MODE_EDGES, true)],
];

const SEEDS = ["lad-a", "lad-b", "lad-c"];

const cases = SHAPES.flatMap(([name, params]) =>
  SEEDS.map((seed) => {
    const label = `${name} ${seed}`;
    const { desc } = newAscentDesc(params, randomNew(`ascent-ladder-${label}`));
    return { label, board: (): AscentState => newAscentState(params, desc) };
  }),
);

describeLadderCensus<AscentState>({
  game: "ascent",
  rungs: [
    "onlySquare",
    "nextTo",
    "onLine",
    "reach",
    "overlap",
    "overlapEdges",
    "onlyNumberNear",
    "onlyNumber",
  ],
  unreached: {},
  caps: [DIFF_EASY, DIFF_NORMAL, DIFF_TRICKY, DIFF_HARD],
  cases,
  solve: (s, cap, firings) => {
    ascentSolve(s.grid, s.w, s.h, s.mode, cap, firings);
  },
});
