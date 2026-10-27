/**
 * What stands in for an oracle: every board dealt needs exactly the tier it
 * was asked at, and every rung of the ladder fires on boards the generator
 * deals (docs/testing.md § "What a new game ships").
 */
import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { describeDealtTiers } from "../../engine/testing/absent-tiers.ts";
import { describeLadderCensus } from "../../engine/testing/ladder-census.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import { newStarbattleDesc } from "./generator.ts";
import { starbattleGame } from "./index.ts";
import { STARBATTLE_RUNGS, StarbattleBoard, solveStarbattle } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_TRICKY,
  encodeParams,
  newState,
  type StarbattleParams,
} from "./state.ts";

/** Every preset, the smallest board of one star and of two, and a board of
 * two stars one size up from the smallest, where a region has room to spare. */
const SHAPES: StarbattleParams[] = [
  ...leafPresets(starbattleGame).map((l) => l.params),
  { size: 4, stars: 1, diff: DIFF_EASY },
  { size: 8, stars: 2, diff: DIFF_EASY },
  { size: 8, stars: 2, diff: DIFF_NORMAL },
  { size: 9, stars: 2, diff: DIFF_NORMAL },
];

describeDealtTiers(
  starbattleGame,
  SHAPES.map((p) => encodeParams(p, true)),
);

/** A board of each tier and of each star count, small enough to deal three
 * of in well under a second: what the census and the region check walk. */
const SMALL: StarbattleParams[] = [
  { size: 5, stars: 1, diff: DIFF_EASY },
  { size: 6, stars: 1, diff: DIFF_NORMAL },
  { size: 6, stars: 1, diff: DIFF_TRICKY },
  { size: 8, stars: 2, diff: DIFF_EASY },
  { size: 9, stars: 2, diff: DIFF_NORMAL },
];

const SEEDS = ["a", "b", "c"];

describeLadderCensus<StarbattleParams & { desc: string }>({
  game: "starbattle",
  rungs: STARBATTLE_RUNGS,
  unreached: {},
  caps: [DIFF_EASY, DIFF_NORMAL, DIFF_TRICKY],
  cases: SMALL.flatMap((p) =>
    SEEDS.map((seed) => {
      const label = `${encodeParams(p, true)} ${seed}`;
      const { desc } = newStarbattleDesc(p, randomNew(`ladder ${label}`));
      return { label, board: () => ({ ...p, desc }) };
    }),
  ),
  solve: (p, cap, firings) => {
    const { size, stars, regions, grid } = newState(p, p.desc);
    return solveStarbattle(
      new StarbattleBoard(size, stars, regions, grid),
      cap,
      firings,
    );
  },
});

describe("starbattle regions", () => {
  it.each(
    SMALL,
  )("a $size x $size board of $stars has a region to a row, none too small", (p) => {
    const { desc } = newStarbattleDesc(p, randomNew("regions"));
    const { regions } = newState(p, desc);
    const cells = new Array(p.size).fill(0);
    for (const r of regions) cells[r]++;
    expect(
      cells.every((n) => n >= 2 * p.stars),
      String(cells),
    ).toBe(true);
  });
});
