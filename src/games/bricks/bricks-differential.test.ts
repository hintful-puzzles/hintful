/**
 * Frozen upstream boards for Bricks: every description recorded from
 * `puzzles/unreleased/bricks.c` must still validate, load, round-trip through
 * the codec, and be completed by the contradiction solver capped at the tier it
 * was generated for. That keeps descriptions shared before the port readable,
 * and pins the codec and the solver's deductive reach against boards this
 * generator did not produce.
 *
 * It no longer asks the generator to reproduce them: the shipped generator gates
 * on the tier actually below the one requested (upstream always probed Easy) and
 * refuses Tricky outright. Generation is carried by `bricks.test.ts` — "bricks
 * generator" (a uniquely solvable board for each preset) and "difficulty tiers
 * bind" (every generated board needs exactly its tier).
 */
import { describe, expect, it } from "vitest";
import cReference from "./__fixtures__/bricks-c-reference.json" with { type: "json" };
import { solveGame } from "./solver.ts";
import { type BricksParams, encodeDesc, newState, validateDesc } from "./state.ts";

interface Fixture {
  seed: string;
  desc: string;
  w: number;
  h: number;
  diff: number;
}
const data = cReference as { fixtures: Fixture[] };

describe("bricks frozen upstream boards (decode, round-trip, solve at their tier)", () => {
  it("has fixtures to check", () => {
    expect(data.fixtures.length).toBeGreaterThan(0);
  });

  for (const f of data.fixtures) {
    it(`${f.w}x${f.h}d${f.diff} seed=${f.seed}`, () => {
      const p: BricksParams = { w: f.w, h: f.h, diff: f.diff };
      expect(validateDesc(p, f.desc)).toBeNull();
      const state = newState(p, f.desc);
      expect(encodeDesc(state.grid, state.w, state.h)).toBe(f.desc);
      const grid = state.grid.slice();
      expect(solveGame(grid, state.w, state.h, f.diff, true, true)).toBe("complete");
    });
  }
});
