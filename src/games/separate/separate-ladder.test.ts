/*
 * Separate's `runDeductionFixpoint` ladder, certified by a census of which
 * rungs fire. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 *
 * Each case is a dealt Easy board solved from nothing, and one filled at
 * random on which the solver stops short.
 */
import { DIFF_EASY } from "../../engine/answer-search.ts";
import { divvyRectangle } from "../../engine/divvy.ts";
import { randomNew } from "../../engine/random/index.ts";
import { shuffle } from "../../engine/shuffle.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { newSeparateDesc } from "./generator.ts";
import { SolverScratch, solverAttempt } from "./solver.ts";
import type { SeparateShape } from "./state.ts";

const SHAPES: SeparateShape[] = [
  { w: 4, h: 4, k: 4 },
  { w: 5, h: 5, k: 5 },
  { w: 6, h: 6, k: 4 },
  { w: 6, h: 6, k: 6 },
  { w: 8, h: 6, k: 4 },
];

const SEEDS = ["lad-a", "lad-b", "lad-c", "lad-d"];

interface Board {
  p: SeparateShape;
  letters: Uint8Array;
}

/** A dealt board, which the solver finishes. */
function dealt(p: SeparateShape, seed: string): Board {
  const { desc } = newSeparateDesc({ ...p, diff: DIFF_EASY }, randomNew(seed));
  return { p, letters: Uint8Array.from(desc, (c) => c.charCodeAt(0) - 65) };
}

/** A division filled at random, which it seldom does. */
function filledAtRandom(p: SeparateShape, seed: string): Board {
  const rng = randomNew(seed);
  const dsf = divvyRectangle(p.w, p.h, p.k, rng);
  const letters = new Uint8Array(p.w * p.h);
  const next = new Map<number, number[]>();
  letters.forEach((_, i) => {
    const root = dsf.canonify(i);
    let left = next.get(root);
    if (left === undefined) {
      left = Array.from({ length: p.k }, (_unused, letter) => letter);
      shuffle(left, rng);
      next.set(root, left);
    }
    letters[i] = left.pop() as number;
  });
  return { p, letters };
}

const cases = SHAPES.flatMap((p) =>
  SEEDS.flatMap((seed) => {
    const label = `${p.w}x${p.h}n${p.k} ${seed}`;
    return [
      { label: `${label} dealt`, board: () => dealt(p, `separate-ladder-${label}`) },
      {
        label: `${label} at random`,
        board: () => filledAtRandom(p, `separate-ladder-${label}`),
      },
    ];
  }),
);

describeLadderCensus<Board>({
  game: "separate",
  rungs: ["shared-letter", "walled-apart", "only-way"],
  unreached: {},
  // Every rung is tier 0: the second tier is a search, not a rung.
  caps: [0],
  cases,
  solve: ({ p, letters }, _cap, firings) => {
    const sc = new SolverScratch(p.w, p.h, p.k);
    sc.init();
    solverAttempt(sc, letters, null, firings);
  },
});
