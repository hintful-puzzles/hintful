/**
 * Clusters — the frozen C-generated boards (`__fixtures__/clusters-c-reference.json`),
 * decoded rather than regenerated.
 *
 * Each board was one upstream's generator accepted: every one is "solvable with
 * one hypothetical". So each must still validate, round-trip through the
 * run-length codec, and be completed by the TS solver at the lookahead rung — a
 * net under refactoring the codec and the solver that no longer depends on
 * reproducing upstream's generator. What the shipped generator guarantees is
 * asserted in `clusters.test.ts` § "difficulty tiers": an Easy board is finished
 * by the single-cell rule alone, and a Normal board needs the lookahead.
 *
 * The fixture is **frozen and cannot be regenerated**: the harness that captured
 * it is gone — see `engine/testing/differential.ts`.
 */
import { describe, expect, it } from "vitest";
import cReference from "./__fixtures__/clusters-c-reference.json" with { type: "json" };
import { COMPLETE, solveGame } from "./solver.ts";
import {
  type ClustersParams,
  DIFF_TRICKY,
  encodeDesc,
  newState,
  validateDesc,
} from "./state.ts";

interface Fixture {
  w: number;
  h: number;
  seed: string;
  desc: string;
}

const data = cReference as { fixtures: Fixture[] };

describe("Clusters frozen C boards", () => {
  it("covers every recorded board", () => {
    expect(data.fixtures).toHaveLength(12);
  });

  for (const f of data.fixtures) {
    it(`${f.w}x${f.h} seed=${f.seed}: decodes, round-trips and solves`, () => {
      const p: ClustersParams = { w: f.w, h: f.h, diff: DIFF_TRICKY };
      expect(validateDesc(p, f.desc)).toBeNull();
      expect(encodeDesc(newState(p, f.desc).grid, f.w, f.h)).toBe(f.desc);
      expect(solveGame(newState(p, f.desc).grid, f.w, f.h, DIFF_TRICKY)).toBe(COMPLETE);
    });
  }
});
