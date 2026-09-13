/**
 * Frozen upstream boards for Mathrax (`__fixtures__/mathrax-c-reference.json`,
 * recorded from upstream's `mathrax.c`), checked by solver verdict rather than by
 * reproducing them: the TS solver must reach, on every recorded board, the
 * verdict upstream recorded — including `2`, *ambiguous*, on all three of
 * upstream's Recursive boards, the defect the generator's uniqueness divergence
 * fixes (docs/games/testing.md § "Order-independent verdicts").
 *
 * The generator is no longer asked to reproduce the descriptions: it rejects a
 * board the tier below already solves, which upstream never did. The codec
 * round-trip over these boards and "solves every recorded upstream board
 * uniquely, at no more than its tier" live in `mathrax.test.ts`; generation is
 * carried there by "mathrax generator" and "difficulty tiers bind" (every
 * generated board needs exactly its tier).
 */

import { describe, expect, it } from "vitest";
import cReference from "./__fixtures__/mathrax-c-reference.json" with { type: "json" };
import { mathraxSolve } from "./solver.ts";
import {
  DIFF_RECURSIVE,
  diffFromLevel,
  encodeParams,
  type MathraxParams,
  newState,
  validateDesc,
} from "./state.ts";

interface MathraxFixture {
  o: number;
  diff: number;
  options: number;
  seed: string;
  desc: string;
  /** C's `mathrax_solve(board, DIFF_RECURSIVE)` verdict on the finished board. */
  verdict: number;
}

const fixtures = (cReference as { fixtures: MathraxFixture[] }).fixtures;

const paramsOf = (f: MathraxFixture): MathraxParams => ({
  o: f.o,
  diff: diffFromLevel(f.diff),
  options: f.options,
});

describe("mathrax fixture corpus", () => {
  it("covers every size, difficulty tier and a clue-option sweep", () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(28);
    expect(new Set(fixtures.map((f) => f.o))).toEqual(new Set([3, 4, 5, 6, 7, 8, 9]));
    expect(new Set(fixtures.map((f) => f.diff))).toEqual(new Set([0, 1, 2, 3]));
  });
});

describe("mathrax frozen upstream boards (solver verdicts, every tier)", () => {
  for (const f of fixtures) {
    it(`${encodeParams(paramsOf(f), true)} seed=${f.seed}: TS solver agrees with the recorded verdict`, () => {
      const p = paramsOf(f);
      expect(validateDesc(p, f.desc)).toBeNull();
      const st = newState(p, f.desc);
      expect(
        mathraxSolve(p.o, Uint8Array.from(st.grid), st.clues, DIFF_RECURSIVE),
      ).toBe(f.verdict);
    });
  }

  it("records upstream's Recursive tier as ambiguous — the divergence's premise", () => {
    const recursive = fixtures.filter((f) => f.diff === DIFF_RECURSIVE);
    expect(recursive).not.toHaveLength(0);
    // Every upstream Recursive board has more than one solution (indeed these
    // three are stripped to a completely blank grid).
    expect(recursive.every((f) => f.verdict === 2)).toBe(true);
  });
});
