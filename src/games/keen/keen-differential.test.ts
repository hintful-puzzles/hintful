/**
 * Gated byte-match differential for the Keen port.
 *
 * For each frozen C-reference fixture (each difficulty × the multiplication-only
 * flag), assert the TS generator reproduces the C desc byte-for-byte over the
 * bit-identical RNG, and that the TS solver grades the board at the same minimal
 * difficulty the C solver recorded. Faithful generation + a faithful solver
 * verdict — the strongest available bar (docs/testing.md § "Byte-match:
 * fidelity where there is a right answer").
 *
 * The fixture is **frozen and cannot be regenerated**: the C harness that
 * recorded it is gone (see `engine/testing/differential.ts`).
 */

import { describe, expect, it } from "vitest";
import { validateDesc } from "../../engine/contract/desc-error.ts";
import { describeDescDifferential } from "../../engine/testing/differential.ts";
import reference from "./__fixtures__/keen-c-reference.json" with { type: "json" };
import { newKeenDesc } from "./generator.ts";
import { keenGame } from "./index.ts";
import { solveKeen } from "./solver.ts";
import { diffFromLevel, type KeenParams, newState } from "./state.ts";

interface Fixture {
  w: number;
  diff: number;
  mult: boolean;
  seed: string;
  desc: string;
  solverDiff: number;
}

const FIXTURES = reference.fixtures as Fixture[];

function fixtureParams(f: Fixture): KeenParams {
  return { w: f.w, diff: diffFromLevel(f.diff), multiplicationOnly: f.mult };
}

const label = (f: Fixture) => `${f.w}d${f.diff}${f.mult ? "m" : ""} (seed ${f.seed})`;

describeDescDifferential<Fixture, KeenParams>({
  title: "keen differential (byte-match)",
  fixtures: FIXTURES,
  label,
  params: fixtureParams,
  newDesc: newKeenDesc,
  extra: (f, p) => expect(validateDesc(keenGame, p, f.desc)).toBeNull(),
});

describe("keen differential (solver agreement)", () => {
  for (const f of FIXTURES) {
    it(`${label(f)}: TS solver grades at the C difficulty`, () => {
      const state = newState(fixtureParams(f), f.desc);
      const soln = new Uint8Array(f.w * f.w);
      const ret = solveKeen(f.w, state.clues, soln, f.solverDiff);
      expect(ret).toBe(f.solverDiff);
    });
  }
});
