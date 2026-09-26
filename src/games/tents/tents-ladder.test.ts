/*
 * Tents' `runDeductionFixpoint` ladder, proved equivalent to upstream's
 * hand-written loop (`tentsSolveLegacy`). The harness and the argument for it
 * are `engine/testing/ladder-equivalence.ts`; this file is the declaration.
 *
 * **What needed proving.** Upstream's loop already restarts after any sweep
 * that fires, which is the runner's walk. What the adoption changes is that
 * each Tricky deduction upstream folds into an Easy sweep behind a difficulty
 * test (the diagonal pair inside the tree sweep, the neighboring lines inside
 * the line count) is a rung of its own, so at Tricky it runs later than it
 * did. Every rung is sound and only decides squares or ties links, so the two
 * reach the same board; the board comparison at every cap is the check.
 *
 * The caps are the tiers the generator asks for: links alone (an Easy board's
 * "not solvable one level down"), Easy and Tricky.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderEquivalence } from "../../engine/testing/ladder-equivalence.ts";
import { newTentsDesc } from "./generator.ts";
import { tentsSolve, tentsSolveLegacy } from "./solver.ts";
import { DIFF_EASY, DIFF_TRICKY, decodeDesc, type TentsParams, TREE } from "./state.ts";

const SHAPES: TentsParams[] = [
  { w: 8, h: 8, diff: DIFF_EASY },
  { w: 8, h: 8, diff: DIFF_TRICKY },
  { w: 10, h: 10, diff: DIFF_EASY },
  { w: 10, h: 10, diff: DIFF_TRICKY },
  { w: 15, h: 15, diff: DIFF_TRICKY },
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
    const { grid, numbers } = decodeDesc(p, desc);
    const puzzle = Int8Array.from(grid, (v) => (v === TREE ? TREE : 0));
    return { label, board: (): Board => ({ p, puzzle, numbers }) };
  }),
);

describeLadderEquivalence<Board>({
  game: "tents",
  rungs: [
    "tent-link",
    "grass-away-from-trees",
    "grass-next-to-tents",
    "tree-single",
    "tree-diagonal-pair",
    "line-count",
    "line-neighbors",
  ],
  unreached: {},
  caps: [DIFF_EASY - 1, DIFF_EASY, DIFF_TRICKY],
  cases,
  viaRunner: ({ p, puzzle, numbers }, cap, firings) => {
    const r = tentsSolve(p.w, p.h, puzzle, numbers, cap, firings);
    return { ret: r.ret, key: `${r.soln.join(",")}|${r.links.join(",")}` };
  },
  viaLegacy: ({ p, puzzle, numbers }, cap) => {
    const r = tentsSolveLegacy(p.w, p.h, puzzle, numbers, cap);
    return { ret: r.ret, key: `${r.soln.join(",")}|${r.links.join(",")}` };
  },
  // The solvers copy the puzzle, so the whole working state (squares and
  // links) travels in the verdict above rather than on the input board.
  key: ({ puzzle }) => puzzle.join(","),
});
