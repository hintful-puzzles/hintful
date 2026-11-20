/**
 * Gated byte-match differential for the Group port.
 *
 * For each frozen C-reference fixture (sizes 4..12, both identity modes, every
 * difficulty each size admits), assert the TS generator reproduces the C desc
 * byte-for-byte over the bit-identical RNG, and that the TS solver grades the
 * board at the same minimal difficulty the C solver recorded. Because the
 * generator is solver-gated, that single byte-match validates the generator,
 * the solver's every deduction, the group data table and the codec together —
 * the strongest available bar (docs/testing.md § "Byte-match: fidelity
 * where there is a right answer").
 *
 * The fixture is **frozen and cannot be regenerated**: it was captured by
 * `puzzles/auxiliary/group-trace.c` against upstream's C, whose build and
 * harness are gone — see `engine/testing/differential.ts`.
 */

import { describe, expect, it } from "vitest";
import { validateDesc } from "../../engine/contract/desc-error.ts";
import { describeDescDifferential } from "../../engine/testing/differential.ts";
import reference from "./__fixtures__/group-c-reference.json" with { type: "json" };
import { newGameDesc } from "./generator.ts";
import { groupGame } from "./index.ts";
import { solveGroup } from "./solver.ts";
import { type GroupParams, newState } from "./state.ts";

interface Fixture {
  w: number;
  diff: number;
  id: boolean;
  seed: string;
  desc: string;
  solverDiff: number;
}

const FIXTURES = reference.fixtures as Fixture[];

/** Two fixtures were recorded at a tier their size lacks (`4d1`, `5d2`), where
 * upstream dealt the tier below, which is `solverDiff`. Every other fixture's
 * `solverDiff` is its `diff`. */
const params = (f: Fixture): GroupParams => ({ w: f.w, diff: f.solverDiff, id: f.id });

const label = (f: Fixture) => `${f.w}d${f.diff}${f.id ? "" : "i"} (seed ${f.seed})`;

describeDescDifferential<Fixture, GroupParams>({
  title: "group differential (byte-match)",
  fixtures: FIXTURES,
  label,
  params,
  newDesc: newGameDesc,
  extra: (f, p) => expect(validateDesc(groupGame, p, f.desc)).toBeNull(),
});

describe("group differential (solver agreement)", () => {
  for (const f of FIXTURES) {
    it(`${label(f)}: TS solver grades at the C difficulty`, () => {
      const givens = newState(params(f), f.desc).grid.slice();
      const ret = solveGroup(givens, f.w, f.solverDiff);
      expect(ret).toBe(f.solverDiff);
    });
  }
});
