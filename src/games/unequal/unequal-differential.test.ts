/**
 * Gated byte-match differential for the Unequal port.
 *
 * For each frozen C-reference fixture (several difficulties), assert the TS
 * generator reproduces the C desc byte-for-byte over the bit-identical RNG, and
 * that the TS solver grades the board at the same minimal difficulty the C
 * solver recorded. Faithful generation + a faithful solver verdict — the
 * strongest available bar (docs/testing.md § "Byte-match: fidelity where there
 * is a right answer").
 *
 * The fixture is **frozen and cannot be regenerated**: it was captured from
 * upstream's C by a harness that no longer exists — see
 * `engine/testing/differential.ts`. Upstream's Adjacent mode's fixtures are
 * Adjacent's (`../adjacent/__fixtures__/`).
 *
 * **From Hard up the fixtures are re-founded.** Upstream's Hard has forcing
 * chains, which here are a search and sit at Unreasonable, so a board the C
 * graded Hard by a chain grades Unreasonable, and the generator from Hard up
 * keeps different boards. Those fixtures keep the grade, Hard or the
 * Unreasonable the chain moved to, and drop the byte-match.
 */

import { describe, expect, it } from "vitest";
import { validateDesc } from "../../engine/desc-error.ts";
import { newEdgeClueDesc } from "../../engine/edge-clue-latin/generator.ts";
import { solveEdgeClues } from "../../engine/edge-clue-latin/solver.ts";
import {
  DIFF_EXTREME,
  DIFF_RECURSIVE,
  diffFromLevel,
  type EdgeClueParams,
  newState,
} from "../../engine/edge-clue-latin/state.ts";
import { randomNew } from "../../engine/random/index.ts";
import reference from "./__fixtures__/unequal-c-reference.json" with { type: "json" };
import { unequalGame } from "./index.ts";
import { SIGNS } from "./state.ts";

interface Fixture {
  order: number;
  diff: number;
  seed: string;
  desc: string;
  solverDiff: number;
}

const FIXTURES = reference.fixtures as Fixture[];

function fixtureParams(f: Fixture): EdgeClueParams {
  return { order: f.order, diff: diffFromLevel(f.diff) };
}

describe("unequal differential (byte-match + solver agreement)", () => {
  it("re-founds some fixtures and keeps others byte-matched", () => {
    expect(FIXTURES.some((f) => f.diff >= DIFF_EXTREME)).toBe(true);
    expect(FIXTURES.some((f) => f.diff < DIFF_EXTREME)).toBe(true);
  });

  for (const f of FIXTURES) {
    const p = fixtureParams(f);
    if (f.diff < DIFF_EXTREME)
      it(`${f.order} d${f.diff} (seed ${f.seed}): desc matches C byte-for-byte`, () => {
        const { desc } = newEdgeClueDesc(SIGNS, p, randomNew(f.seed));
        expect(desc).toBe(f.desc);
        expect(validateDesc(unequalGame, p, desc)).toBeNull();
      });

    it(`${f.order} d${f.diff} (seed ${f.seed}): TS solver grades at the C difficulty`, () => {
      const state = newState(SIGNS, p, f.desc);
      const grade = (cap: number): number =>
        solveEdgeClues(
          state.order,
          SIGNS,
          state.clueFlags,
          Uint8Array.from(state.immutable),
          cap,
        );
      const ret = grade(f.solverDiff);
      if (f.solverDiff === DIFF_EXTREME && ret !== DIFF_EXTREME)
        expect(grade(DIFF_RECURSIVE)).toBe(DIFF_RECURSIVE);
      else expect(ret).toBe(f.solverDiff);
    });
  }
});
