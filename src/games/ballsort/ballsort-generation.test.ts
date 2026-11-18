/**
 * What stands in for an oracle on a game with no tiers: every board dealt
 * loads, holds a tube's worth of every color, starts with no tube sorted, and
 * is one the search sorts within its budget (docs/testing.md § "What a new
 * game ships").
 */

import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import { ballsortGame } from "./index.ts";
import { REACH_BUDGET, Reach } from "./solver.ts";
import { type BallsortParams, encodeParams, isSorted, newState } from "./state.ts";

const G = ballsortGame;

/** Every preset, the smallest board, and the most the dialog allows. */
const SHAPES: BallsortParams[] = [
  ...leafPresets(G).map((l) => l.params),
  { colors: 2, capacity: 2, spare: 1 },
  { colors: 10, capacity: 4, spare: 2 },
  { colors: 6, capacity: 6, spare: 2 },
];

describe("Ball Sort's deals", () => {
  it.each(
    SHAPES.map((p) => [encodeParams(p, true), p] as const),
  )("%s: every deal is unsorted, and sorted by the search", (_, p) => {
    for (const seed of ["a", "b", "c"]) {
      const { desc } = G.newDesc(p, randomNew(`deal ${seed}`));
      const s = newState(p, desc);
      for (let t = 0; t < s.w; t++) expect(isSorted(s, t)).toBe(false);
      const reach = Reach.of(s);
      expect(reach).not.toBeNull();
      expect(reach?.size ?? REACH_BUDGET + 1).toBeLessThanOrEqual(REACH_BUDGET);
      expect(reach?.distance(s)).toBeGreaterThan(0);
    }
  });
});
