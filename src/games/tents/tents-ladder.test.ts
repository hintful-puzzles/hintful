/*
 * Tents' ladder, its description's techniques, certified by a census of which
 * rungs fire. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 *
 * The caps are the tiers the generator asks for: none (an Easy board's "not
 * solvable one level down"), Easy and Normal.
 */

import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import { newTentsDesc } from "./generator.ts";
import { tentsGame } from "./index.ts";
import { tentsSolve } from "./solver.ts";
import { DIFF_EASY, DIFF_TRICKY, newState, type TentsParams, TREE } from "./state.ts";

/** Every preset, plus a board that is not square. */
const SHAPES: TentsParams[] = [
  ...leafPresets(tentsGame).map((l) => l.params),
  { w: 12, h: 5, diff: DIFF_TRICKY },
];

const SEEDS = ["lad-a", "lad-b", "lad-c", "lad-d"];

interface Board {
  p: TentsParams;
  puzzle: Int8Array;
  numbers: Int32Array;
}

const cases = SHAPES.flatMap((p) =>
  SEEDS.map((seed) => {
    const label = `${p.w}x${p.h} d${p.diff} ${seed}`;
    const { desc } = newTentsDesc(p, randomNew(`tents-ladder-${label}`));
    const { grid, numbers } = newState(p, desc);
    const puzzle = Int8Array.from(grid, (v) => (v === TREE ? TREE : 0));
    return { label, board: (): Board => ({ p, puzzle, numbers }) };
  }),
);

describeLadderCensus<Board>({
  game: "tents",
  rungs: [
    "tentLink",
    "noTree",
    "treesDone",
    "nextToTent",
    "treeSingle",
    "treeLink",
    "treeDiagonal",
    "lineCount",
    "lineNeighbors",
  ],
  unreached: {},
  caps: [DIFF_EASY - 1, DIFF_EASY, DIFF_TRICKY],
  cases,
  solve: ({ p, puzzle, numbers }, cap, firings) =>
    tentsSolve(p.w, p.h, puzzle, numbers, cap, firings),
});
