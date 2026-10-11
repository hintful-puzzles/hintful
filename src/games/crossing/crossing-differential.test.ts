/**
 * Frozen-fixture checks for Crossing, over boards recorded from upstream's
 * `crossing.c` (frozen, see `engine/testing/differential.ts`).
 *
 * **Every recorded board loads and solves.** It passes the validator, decodes to
 * exactly one number per run (what a solvable Nansuke means), and the deductive
 * solver finishes it uniquely — including the boards with an isolated open
 * cell, which the generator no longer makes but a shared game ID can still name.
 *
 * **The boards the generator's two departures leave alone are reproduced
 * byte-for-byte.** Rejecting an isolated-cell board can only turn an accepted
 * attempt into a retry: a recorded board with no isolated cell was reached by
 * attempts none of which that rule rejects. The solver's third deduction can
 * only turn a retry into an accepted attempt: a seed reaches its recorded
 * board unless a draw before it is one the third deduction finishes, and
 * {@link WIDER_EASY} names the seeds where one is. One desc comparison then
 * pins the wall growth (including `checkPool`'s mutating test), the digit
 * fill, the run collection order, upstream's two deductions and the codec
 * together.
 */

import { describe, expect, it } from "vitest";
import { DIFF_EASY } from "../../engine/answer-search.ts";
import { validateDesc } from "../../engine/desc-error.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeDescDifferential } from "../../engine/testing/differential.ts";
import cReference from "./__fixtures__/crossing-c-reference.json" with { type: "json" };
import { newCrossingDesc } from "./generator.ts";
import { crossingGame } from "./index.ts";
import { solveCrossing } from "./solver.ts";
import { type CrossingParams, collectRuns, makePuzzle, newState } from "./state.ts";

interface Fixture {
  seed: string;
  desc: string;
  w: number;
  h: number;
  sym: boolean;
}

const data = cReference as { fixtures: Fixture[] };

const label = (f: Fixture) => `${f.w}x${f.h}${f.sym ? "S" : ""} seed=${f.seed}`;
const params = (f: Fixture): CrossingParams => ({
  w: f.w,
  h: f.h,
  sym: f.sym,
  // Upstream deals only what is Easy here.
  diff: DIFF_EASY,
});

/** Does the board have an open cell that lies in no run? */
function hasIsolatedCell(f: Fixture): boolean {
  const p = params(f);
  const { walls } = newState(p, f.desc).puzzle;
  const covered = new Set<number>();
  for (const run of collectRuns(p.w, p.h, walls))
    for (const i of run.cells) covered.add(i);
  for (let i = 0; i < p.w * p.h; i++) if (!walls[i] && !covered.has(i)) return true;
  return false;
}

/** The seeds that deal an earlier draw than upstream's: a board the solver's
 * third deduction finishes, which upstream's two threw away. */
const WIDER_EASY: ReadonlySet<string> = new Set(["crossing-7x10-1"]);

const reproducible = data.fixtures.filter(
  (f) => !hasIsolatedCell(f) && !WIDER_EASY.has(f.seed),
);

describe("crossing frozen boards", () => {
  it("include boards to reproduce", () => {
    expect(reproducible.length).toBeGreaterThan(0);
  });

  it("a seed set aside deals another board, which is solved and is not upstream's", () => {
    const aside = data.fixtures.filter((f) => WIDER_EASY.has(f.seed));
    expect(aside).toHaveLength(WIDER_EASY.size);
    for (const f of aside) {
      const p = params(f);
      const { desc } = newCrossingDesc(p, randomNew(f.seed));
      expect(desc, label(f)).not.toBe(f.desc);
      expect(solveCrossing(newState(p, desc).puzzle).status, label(f)).toBe("valid");
    }
  });

  for (const f of data.fixtures) {
    it(`${label(f)} loads and solves uniquely`, () => {
      const p = params(f);
      expect(validateDesc(crossingGame, p, f.desc)).toBeNull();
      const { walls, numbers } = newState(p, f.desc).puzzle;
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
