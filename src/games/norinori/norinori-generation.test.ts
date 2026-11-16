/**
 * What stands in for an oracle: every board dealt needs exactly the tier it
 * was asked at, and every rung of the ladder fires on boards the generator
 * deals (docs/testing.md § "What a new game ships").
 */

import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { describeDealtTiers } from "../../engine/testing/absent-tiers.ts";
import { dealOnce } from "../../engine/testing/dealt.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { newNorinoriDesc } from "./generator.ts";
import { norinoriGame } from "./index.ts";
import { answerOf, areasOf, NORINORI_RUNGS, solveNorinori } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_TRICKY,
  encodeParams,
  type NorinoriParams,
  newState,
  SHADED,
} from "./state.ts";

/** The smallest board at each tier, one that is not square, and the largest
 * preset at the harder tiers, where `claimed` and `fullRegion` fire most (a
 * few times in ten boards, 2026-11-16). */
const SHAPES: NorinoriParams[] = [
  { w: 4, h: 4, diff: DIFF_EASY },
  { w: 6, h: 6, diff: DIFF_EASY },
  { w: 6, h: 6, diff: DIFF_NORMAL },
  { w: 6, h: 6, diff: DIFF_TRICKY },
  { w: 7, h: 5, diff: DIFF_NORMAL },
  { w: 10, h: 10, diff: DIFF_NORMAL },
  { w: 10, h: 10, diff: DIFF_TRICKY },
];

describeDealtTiers(
  norinoriGame,
  SHAPES.map((p) => encodeParams(p, true)),
);

// `blocked` fired on none of three seeds a shape (2026-11-16).
const SEEDS = ["a", "b", "c", "d", "e", "f"];

const DEALT = SHAPES.flatMap((p) =>
  SEEDS.map((seed) => {
    const label = `${encodeParams(p, true)} ${seed}`;
    const board = dealOnce(() => ({
      ...p,
      desc: newNorinoriDesc(p, randomNew(`ladder ${label}`)).desc,
    }));
    return { label, board };
  }),
);

describeLadderCensus<NorinoriParams & { desc: string }>({
  game: "norinori",
  rungs: NORINORI_RUNGS,
  unreached: {},
  caps: [DIFF_EASY, DIFF_NORMAL, DIFF_TRICKY],
  cases: DEALT,
  solve: (p, cap, firings) => solveNorinori(newState(p, p.desc), cap, firings),
});

describe("dealt regions", () => {
  it.each(DEALT)("$label: every region of two squares is a domino of the answer", ({
    board,
  }) => {
    const p = board();
    const state = newState(p, p.desc);
    const answer = answerOf(p.w, p.h, state.regions);
    expect(answer).not.toBeNull();
    for (const cells of areasOf(state.regions)) {
      expect(cells.length).toBeGreaterThanOrEqual(2);
      if (cells.length === 2)
        expect(cells.map((i) => (answer as readonly number[])[i])).toEqual([
          SHADED,
          SHADED,
        ]);
    }
  });
});
