/**
 * Frozen upstream boards for Magnets: every description recorded from
 * upstream's C must still validate, load, round-trip through the codec, and
 * be solved by the ladder at the tier it was generated for and not below it,
 * to upstream's own answer. That keeps descriptions shared before the port
 * readable, and pins the codec and the ladder's reach against boards this
 * generator did not produce.
 *
 * The fixture is **frozen and cannot be regenerated**: it was captured from
 * upstream's C by a harness that no longer exists (see
 * `engine/testing/differential.ts`).
 *
 * It no longer asks the generator to reproduce them: the ladder is stated in
 * the description, without upstream's un-reset counter in its last Tricky
 * technique, so a stripped board can lose its numbers in another order.
 * Generation is carried by `magnets.test.ts` and the cross-game difficulty
 * contract (every generated board needs exactly its tier).
 */
import { describe, expect, it } from "vitest";
import { validateDesc } from "../../engine/desc-error.ts";
import cReference from "./__fixtures__/magnets-c-reference.json" with { type: "json" };
import { magnetsGame } from "./index.ts";
import { solveMagnets } from "./solver.ts";
import {
  DIFF_COUNT,
  encodeDesc,
  type MagnetsParams,
  NEGATIVE,
  NEUTRAL,
  newState,
  POSITIVE,
} from "./state.ts";

interface Fixture {
  w: number;
  h: number;
  diff: number;
  stripclues: boolean;
  seed: string;
  desc: string;
  aux: string;
}
const data = cReference as { fixtures: Fixture[] };

const CHAR2GRID: Record<string, number> = {
  "+": POSITIVE,
  "-": NEGATIVE,
  ".": NEUTRAL,
};

describe("magnets frozen upstream boards (decode, round-trip, solve at their tier)", () => {
  it("has fixtures to check", () => {
    expect(data.fixtures.length).toBeGreaterThan(0);
  });

  for (const f of data.fixtures) {
    const label = `${f.w}x${f.h} d${f.diff}${f.stripclues ? "S" : ""} seed=${f.seed}`;
    it(label, () => {
      const p: MagnetsParams = {
        w: f.w,
        h: f.h,
        diff: f.diff,
        stripclues: f.stripclues,
      };
      expect(validateDesc(magnetsGame, p, f.desc)).toBeNull();
      const s = newState(p, f.desc);
      const { dominoes, rowcount, colcount } = s.common;
      expect(encodeDesc(f.w, f.h, dominoes, rowcount, colcount)).toBe(f.desc);
      const solved = solveMagnets(f.w, f.h, s.common, DIFF_COUNT);
      expect(solved.verdict).toBe(1);
      expect(Array.from(solved.grid)).toEqual(Array.from(f.aux, (c) => CHAR2GRID[c]));
      const solveAt = (cap: number) =>
        magnetsGame.difficulty?.solveAtCap(p, f.desc, cap);
      expect(solveAt(f.diff)).toBe("solved");
      if (f.diff > 0) expect(solveAt(f.diff - 1)).toBe("unsolved");
    });
  }
});
