/**
 * Frozen-fixture checks for Crossing, over boards recorded from upstream's
 * `crossing.c` (frozen, see `engine/testing/differential.ts`).
 *
 * **Every recorded board loads and solves.** It passes the validator, decodes to
 * exactly one number per run (what a solvable Nansuke means), and the deductive
 * solver finishes it uniquely — including the boards with an isolated open
 * cell, which the generator no longer makes but a shared game ID can still name.
 *
 * **The boards with no isolated cell are reproduced byte-for-byte.** Rejecting
 * an isolated-cell board is the generator's only departure from upstream's, and
 * it can only turn an accepted attempt into a retry: a recorded board with no
 * isolated cell was reached by attempts none of which that rule rejects, so the
 * same seed reaches it again. One desc comparison then pins the wall growth
 * (including `checkPool`'s mutating test), the digit fill, the run collection
 * order, every deduction and the codec together.
 */

import { describe, expect, it } from "vitest";
import { describeDescDifferential } from "../../engine/testing/differential.ts";
import cReference from "./__fixtures__/crossing-c-reference.json" with { type: "json" };
import { newCrossingDesc } from "./generator.ts";
import { solveCrossing } from "./solver.ts";
import {
  type CrossingParams,
  collectRuns,
  makePuzzle,
  readDesc,
  validateDesc,
} from "./state.ts";

interface Fixture {
  seed: string;
  desc: string;
  w: number;
  h: number;
  sym: boolean;
}

const data = cReference as { fixtures: Fixture[] };

const label = (f: Fixture) => `${f.w}x${f.h}${f.sym ? "S" : ""} seed=${f.seed}`;
const params = (f: Fixture): CrossingParams => ({ w: f.w, h: f.h, sym: f.sym });

/** Does the board have an open cell that lies in no run? */
function hasIsolatedCell(f: Fixture): boolean {
  const p = params(f);
  const { walls } = readDesc(p, f.desc);
  const covered = new Set<number>();
  for (const run of collectRuns(p.w, p.h, walls))
    for (const i of run.cells) covered.add(i);
  for (let i = 0; i < p.w * p.h; i++) if (!walls[i] && !covered.has(i)) return true;
  return false;
}

const reproducible = data.fixtures.filter((f) => !hasIsolatedCell(f));

describe("crossing frozen boards", () => {
  it("include boards to reproduce", () => {
    expect(reproducible.length).toBeGreaterThan(0);
  });

  for (const f of data.fixtures) {
    it(`${label(f)} loads and solves uniquely`, () => {
      const p = params(f);
      expect(validateDesc(p, f.desc)).toBeNull();
      const { walls, numbers } = readDesc(p, f.desc);
      expect(collectRuns(p.w, p.h, walls)).toHaveLength(numbers.length);
      expect(solveCrossing(makePuzzle(p.w, p.h, walls, numbers)).status).toBe("valid");
    });
  }
});

describeDescDifferential<Fixture, CrossingParams>({
  title: "crossing generator reproduces its frozen boards with no isolated cell",
  fixtures: reproducible,
  label,
  params,
  newDesc: (p, rng) => newCrossingDesc(p, rng),
});
