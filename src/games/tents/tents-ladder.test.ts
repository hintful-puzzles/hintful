/*
 * Tents' `runDeductionFixpoint` ladder, certified by a census of which rungs
 * fire. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 *
 * Each Tricky deduction upstream folds into an Easy sweep behind a difficulty
 * test (the diagonal pair inside the tree sweep, the neighboring lines inside
 * the line count) is a rung of its own here, so the census can see each one
 * fire rather than taking the sweep it once hid in as evidence.
 *
 * The caps are the tiers the generator asks for: links alone (an Easy board's
 * "not solvable one level down"), Easy and Tricky.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { newTentsDesc } from "./generator.ts";
import { tentsSolve } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_TRICKY,
  newState,
  presets,
  type TentsParams,
  TREE,
} from "./state.ts";

/** Every preset, plus a board that is not square. */
const SHAPES: TentsParams[] = [
  ...(presets().submenu ?? []).flatMap((leaf) => (leaf.params ? [leaf.params] : [])),
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
    "tent-link",
    "grass-away-from-trees",
    "grass-next-to-tents",
    "tree-single",
    "tree-link",
    "tree-diagonal-pair",
    "line-count",
    "line-neighbors",
  ],
  unreached: {},
  caps: [DIFF_EASY - 1, DIFF_EASY, DIFF_TRICKY],
  cases,
  solve: ({ p, puzzle, numbers }, cap, firings) =>
    tentsSolve(p.w, p.h, puzzle, numbers, cap, firings),
});
