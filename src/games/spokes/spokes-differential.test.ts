/**
 * Frozen-fixture checks for Spokes, over boards recorded from upstream's
 * `spokes.c` (frozen, see `engine/testing/differential.ts`).
 *
 * **Every recorded board loads and solves at its recorded tier.** The generator
 * keeps a line removal only while the tiered solver still solves the board from
 * empty at the target tier, so a recorded board that stopped solving there
 * means a deduction rung or the codec changed.
 *
 * **The Easy boards are reproduced byte-for-byte.** The shipped generator's
 * final gate re-solves from a cleared board, where upstream's re-solved a dirty
 * one; that gate decides only the tiers above Easy (an Easy board is accepted
 * unconditionally), so at Easy the draws, the strip loop and the codec are the
 * whole of generation, and one desc comparison pins all three.
 */

import { describe, expect, it } from "vitest";
import { describeDescDifferential } from "../../engine/testing/differential.ts";
import cReference from "./__fixtures__/spokes-c-reference.json" with { type: "json" };
import { newSpokesDesc } from "./generator.ts";
import { spokesSolve } from "./solver.ts";
import {
  clearBoard,
  cloneBoard,
  DIFF_EASY,
  diffFromLevel,
  newState,
  type SpokesParams,
  validateDesc,
} from "./state.ts";

interface Fixture {
  w: number;
  h: number;
  diff: number;
  seed: string;
  desc: string;
}

const data = cReference as { fixtures: Fixture[] };

const label = (f: Fixture) => `${f.w}x${f.h} ${diffFromLevel(f.diff)} seed=${f.seed}`;
const params = (f: Fixture): SpokesParams => ({
  w: f.w,
  h: f.h,
  diff: diffFromLevel(f.diff),
});
const easy = data.fixtures.filter((f) => f.diff === DIFF_EASY);

describe("spokes frozen boards", () => {
  it("include Easy boards to reproduce and harder boards to solve", () => {
    expect(easy.length).toBeGreaterThan(0);
    expect(data.fixtures.length).toBeGreaterThan(easy.length);
  });

  for (const f of data.fixtures) {
    it(`${label(f)} loads and solves at its tier`, () => {
      const p = params(f);
      expect(validateDesc(p, f.desc)).toBeNull();
      const b = cloneBoard(newState(p, f.desc));
      clearBoard(b);
      expect(spokesSolve(b, null, f.diff)).toBe("valid");
    });
  }
});

describeDescDifferential<Fixture, SpokesParams>({
  title: "spokes generator reproduces its frozen Easy boards",
  fixtures: easy,
  label,
  params,
  newDesc: (p, rng) => newSpokesDesc(p, rng),
});
