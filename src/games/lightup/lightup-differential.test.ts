/**
 * Frozen upstream boards for Light Up: every description recorded from
 * upstream's C must still validate, load, round-trip through the codec, and
 * be solved at the tier it was generated for and not below it: by the ladder
 * at Easy and Normal, and at Unreasonable by the search, which finds
 * upstream's recursive boards their one answer. That keeps descriptions
 * shared before the port readable, and pins the codec and the solver's reach
 * against boards this generator did not produce.
 *
 * The fixture is **frozen and cannot be regenerated**: it was captured from
 * upstream's C by a harness that no longer exists (see
 * `engine/testing/differential.ts`).
 *
 * It no longer asks the generator to reproduce them: Unreasonable is the
 * engine's search where upstream recursed five deep, and the ladder's order of
 * firings strips a Normal board's numbers in another order. Generation is
 * carried by `lightup.test.ts` — "lightup generator" and the cross-game
 * difficulty contract (every generated board needs exactly its tier).
 */
import { describe, expect, it } from "vitest";
import { validateDesc } from "../../engine/desc-error.ts";
import cReference from "./__fixtures__/lightup-c-reference.json" with { type: "json" };
import { lightupGame } from "./index.ts";
import { encodeDesc, type LightupParams, newState } from "./state.ts";

interface Fixture {
  seed: string;
  desc: string;
  w: number;
  h: number;
  blackpc: number;
  symm: number;
  difficulty: number;
}
const data = cReference as { fixtures: Fixture[] };

describe("lightup frozen upstream boards (decode, round-trip, solve at their tier)", () => {
  it("has fixtures to check", () => {
    expect(data.fixtures.length).toBeGreaterThan(0);
  });

  for (const f of data.fixtures) {
    it(`${f.w}x${f.h}b${f.blackpc}s${f.symm}d${f.difficulty} seed=${f.seed}`, () => {
      const p: LightupParams = {
        w: f.w,
        h: f.h,
        blackpc: f.blackpc,
        symm: f.symm,
        difficulty: f.difficulty,
      };
      expect(validateDesc(lightupGame, p, f.desc)).toBeNull();
      expect(encodeDesc(newState(p, f.desc))).toBe(f.desc);
      const solveAt = (cap: number) =>
        lightupGame.difficulty?.solveAtCap(p, f.desc, cap);
      expect(solveAt(f.difficulty)).toBe("solved");
      if (f.difficulty > 0) expect(solveAt(f.difficulty - 1)).toBe("unsolved");
    });
  }
});
