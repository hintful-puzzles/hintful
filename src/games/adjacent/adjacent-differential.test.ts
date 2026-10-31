/**
 * Gated byte-match differential for Adjacent, upstream's Adjacent mode of
 * Unequal.
 *
 * For each frozen C-reference fixture, assert the TS generator reproduces the C
 * desc byte-for-byte over the bit-identical RNG, and that the TS solver grades
 * the board at the difficulty the C solver recorded (docs/testing.md §
 * "Byte-match: fidelity where there is a right answer").
 *
 * The fixture is **frozen and cannot be regenerated**: it was captured from
 * upstream's C by a harness that no longer exists — see
 * `engine/testing/differential.ts`. Its seeds are named for the trace of
 * `unequal.c` they came from.
 */

import { describe, expect, it } from "vitest";
import { validateDesc } from "../../engine/desc-error.ts";
import { newEdgeClueDesc } from "../../engine/edge-clue-latin/generator.ts";
import { solveEdgeClues } from "../../engine/edge-clue-latin/solver.ts";
import {
  DIFF_EXTREME,
  diffFromLevel,
  type EdgeClueParams,
  newState,
} from "../../engine/edge-clue-latin/state.ts";
import { randomNew } from "../../engine/random/index.ts";
import reference from "./__fixtures__/adjacent-c-reference.json" with { type: "json" };
import { adjacentGame } from "./index.ts";
import { BARS } from "./state.ts";

interface Fixture {
  order: number;
  diff: number;
  seed: string;
  desc: string;
  solverDiff: number;
}

const FIXTURES = reference.fixtures as Fixture[];

describe("adjacent differential (byte-match + solver agreement)", () => {
  it("has fixtures, all below Hard, where the generators still agree", () => {
    expect(FIXTURES.length).toBeGreaterThan(0);
    expect(FIXTURES.every((f) => f.diff < DIFF_EXTREME)).toBe(true);
  });

  for (const f of FIXTURES) {
    const p: EdgeClueParams = { order: f.order, diff: diffFromLevel(f.diff) };
    it(`${f.order} d${f.diff} (seed ${f.seed}): desc matches C byte-for-byte`, () => {
      const { desc } = newEdgeClueDesc(BARS, p, randomNew(f.seed));
      expect(desc).toBe(f.desc);
      expect(validateDesc(adjacentGame, p, desc)).toBeNull();
    });

    it(`${f.order} d${f.diff} (seed ${f.seed}): TS solver grades at the C difficulty`, () => {
      const state = newState(BARS, p, f.desc);
      expect(
        solveEdgeClues(
          state.order,
          BARS,
          state.clueFlags,
          Uint8Array.from(state.immutable),
          f.solverDiff,
        ),
      ).toBe(f.solverDiff);
    });
  }
});
