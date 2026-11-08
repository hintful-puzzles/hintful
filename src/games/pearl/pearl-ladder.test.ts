/*
 * The census of Pearl's compiled ladder: which rungs the corpus
 * fires, at both caps. The harness and the argument for it are
 * `engine/testing/ladder-census.ts`; this file is the declaration.
 *
 * The corpus is small boards, and the census below is what says they are
 * enough.
 */
import { randomNew } from "../../engine/random/index.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { newDesc } from "./generator.ts";
import * as pearl from "./pearl.compiled.ts";
import { pearlMarks } from "./solver.ts";
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

/** A board on which `closed` fires, at both caps: its loop closes with a
 * block of empty squares no line reaches still open, which no square's own
 * ways settle. One of 120 boards dealt from 6x6 to 10x12 fired it at Easy,
 * and four at Normal (2026-11-08), so it is pinned rather than dealt. */
const CLOSED: PearlParams = { w: 10, h: 10, difficulty: DIFF_EASY };
const CLOSED_DESC = "cWaBaWaBdBbWgBdWWaWWaBbBgBfBaBdBcBaBeBeWjBbBbBBaB";

const cases = [
  ...SHAPES.flatMap((p) =>
    SEEDS.map((seed) => {
      const label = `${p.w}x${p.h} d${p.difficulty} ${seed}`;
      const { desc } = newDesc(p, randomNew(`pearl-ladder-${label}`));
      const { clues } = newState(p, desc);
      return { label, board: (): Board => ({ p, clues }) };
    }),
  ),
  {
    label: "10x10 d0, closed",
    board: (): Board => ({ p: CLOSED, clues: newState(CLOSED, CLOSED_DESC).clues }),
  },
];

describeLadderCensus<Board>({
  game: "pearl",
  rungs: [...pearl.ladder.map((e) => e.id)],
  unreached: {},
  caps: [DIFF_EASY, DIFF_TRICKY],
  cases,
  solve: ({ p, clues }, cap, firings) => pearlMarks(p.w, p.h, clues, cap, firings),
});
