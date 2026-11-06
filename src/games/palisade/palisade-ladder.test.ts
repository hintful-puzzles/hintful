/*
 * Palisade's compiled ladder, certified by a census of which
 * rungs fire. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 *
 * Each case is a dealt Easy board solved from nothing, and one dealt
 * Unreasonable, on which the ladder stops short.
 */
import { DIFF_EASY, DIFF_UNREASONABLE } from "../../engine/answer-search.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { newDesc } from "./generator.ts";
import { deduce, deduction, palisadeLadderIds } from "./solver.ts";
import { newState, type PalisadeShape } from "./state.ts";

const SHAPES: PalisadeShape[] = [
  { w: 5, h: 5, k: 5 },
  { w: 6, h: 6, k: 4 },
  { w: 6, h: 8, k: 6 },
  // Regions of 3 are what let two numbers side by side allow too few squares
  // (`cluesVersusRegionSize`).
  { w: 6, h: 6, k: 3 },
];

const SEEDS = ["lad-a", "lad-b", "lad-c"];

interface Board {
  p: PalisadeShape;
  clues: Int8Array;
}

function dealt(p: PalisadeShape, diff: number, seed: string): Board {
  const params = { ...p, diff };
  return { p, clues: newState(params, newDesc(params, randomNew(seed)).desc).clues };
}

const cases = SHAPES.flatMap((p) =>
  SEEDS.flatMap((seed) => {
    const label = `${p.w}x${p.h}n${p.k} ${seed}`;
    return [
      {
        label: `${label} Easy`,
        board: () => dealt(p, DIFF_EASY, `palisade-ladder-${label}`),
      },
      {
        label: `${label} Unreasonable`,
        board: () => dealt(p, DIFF_UNREASONABLE, `palisade-ladder-${label}`),
      },
    ];
  }),
);

describeLadderCensus<Board>({
  game: "palisade",
  rungs: palisadeLadderIds,
  unreached: {},
  // Every rung is tier 0: the second tier is a search, not a rung.
  caps: [0],
  cases,
  solve: ({ p, clues }, _cap, firings) => {
    deduce(deduction(p, clues), firings);
  },
});
