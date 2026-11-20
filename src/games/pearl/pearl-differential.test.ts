/**
 * Gated byte-match differential for the Pearl generator + solver.
 *
 * For each C-recorded fixture: (1) the TS `newDesc` over the same seed
 * reproduces the C desc **and** the aux solution byte-for-byte (a faithful
 * generator over the bit-identical `random.ts`, reproducing the loopgen RNG
 * order, the `corners`-array quirk and the solver-gated minimization), and
 * (2) the TS solver grades the C board at the recorded difficulty (and one rung
 * easier fails to solve it).
 *
 * The desc byte-match is the strongest bar here because it depends on the
 * grid geometry, every RNG draw in loopgen, the bias score, and every solver
 * verdict during minimization — a single wrong bit anywhere diverges it.
 * (One astronomically rare loopgen tie-break could in theory not byte-match;
 * the fixtures were chosen to byte-match.)
 */
import { describe, expect, it } from "vitest";
import { describeDescDifferential } from "../../engine/testing/differential.ts";
import fixtures from "./__fixtures__/pearl-c-reference.json" with { type: "json" };
import { newDesc } from "./generator.ts";
import { gradePearl, pearlSolve } from "./solver.ts";
import { newState, type PearlParams } from "./state.ts";

interface Fixture {
  w: number;
  h: number;
  difficulty: number;
  seed: string;
  desc: string;
  aux: string;
  grade: number;
}

const paramsOf = (f: Fixture): PearlParams => ({
  w: f.w,
  h: f.h,
  difficulty: f.difficulty,
});

const FIXTURES = fixtures.fixtures as Fixture[];
const tag = (f: Fixture) => `${f.seed} (${f.w}x${f.h} d=${f.difficulty})`;

describeDescDifferential<Fixture, PearlParams>({
  title: "pearl generator differential (byte-match vs C, desc + aux)",
  fixtures: FIXTURES,
  label: tag,
  params: paramsOf,
  newDesc,
});

describe("pearl generator differential (solver vs C)", () => {
  for (const f of FIXTURES) {
    it(`${tag(f)}: TS solver grades the C board at difficulty ${f.grade}`, () => {
      const state = newState(paramsOf(f), f.desc);
      expect(gradePearl(f.w, f.h, state.clues)).toBe(f.grade);
      if (f.grade > 0) {
        const easier = new Uint8Array(f.w * f.h);
        // One rung easier cannot solve it uniquely.
        expect(pearlSolve(f.w, f.h, state.clues, easier, f.grade - 1, false)).not.toBe(
          1,
        );
      }
    });
  }
});
