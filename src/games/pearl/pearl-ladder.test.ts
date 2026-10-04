/*
 * The census of Pearl's `runDeductionFixpoint` ladder: which rungs the corpus
 * fires, at both caps. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 *
 * Pearl generation is costly (a 10x10 fixture alone takes tens of seconds in
 * the differential), so the corpus is small boards: the census below is what
 * says they are enough.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { newDesc } from "./generator.ts";
import { pearlWorkspace } from "./solver.ts";
import { DIFF_EASY, DIFF_TRICKY, newState, type PearlParams } from "./state.ts";

const SHAPES: PearlParams[] = [
  { w: 6, h: 6, difficulty: DIFF_EASY },
  { w: 6, h: 6, difficulty: DIFF_TRICKY },
  { w: 7, h: 7, difficulty: DIFF_TRICKY },
  { w: 8, h: 6, difficulty: DIFF_TRICKY },
];

const SEEDS = ["lad-a", "lad-b", "lad-c"];

interface Board {
  p: PearlParams;
  clues: Uint8Array;
}

const cases = SHAPES.flatMap((p) =>
  SEEDS.map((seed) => {
    const label = `${p.w}x${p.h} d${p.difficulty} ${seed}`;
    const { desc } = newDesc(p, randomNew(`pearl-ladder-${label}`));
    const { clues } = newState(p, desc);
    return { label, board: (): Board => ({ p, clues }) };
  }),
);

describeLadderCensus<Board>({
  game: "pearl",
  rungs: [
    "shapes-from-edges",
    "edges-from-shapes",
    "pearl-clues",
    "closed-loop",
    "shortcut-loop",
  ],
  unreached: {},
  caps: [DIFF_EASY, DIFF_TRICKY],
  cases,
  solve: ({ p, clues }, cap, firings) => pearlWorkspace(p.w, p.h, clues, cap, firings),
});
