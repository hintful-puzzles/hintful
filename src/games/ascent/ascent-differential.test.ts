/**
 * Frozen upstream boards for Ascent: every description recorded from upstream's
 * `ascent.c` must still validate, load, round-trip through the codec, and be
 * finished by the graded solver capped at the tier it was generated for. That
 * keeps descriptions shared before the port readable, and pins the per-mode
 * grid padding, the run-length codec and the solver's deductive reach against
 * boards this generator did not produce.
 *
 * It no longer asks the generator to reproduce them: the shipped generator
 * rejects a board the tier below already finishes, which upstream never did.
 * Generation is carried by `ascent.test.ts` — "ascent generation + solving" and
 * "ascent difficulty tiers bind" (every generated board needs exactly its tier).
 *
 * The fixture is **frozen and cannot be regenerated**: the C build and trace
 * harness that recorded it are gone (see `engine/testing/differential.ts`).
 */
import { describe, expect, it } from "vitest";
import cReference from "./__fixtures__/ascent-c-reference.json" with { type: "json" };
import { ascentSolve, SolverScratch } from "./solver.ts";
import {
  type AscentParams,
  checkCompletion,
  encodeGridDesc,
  newAscentState,
  validateAscentDesc,
} from "./state.ts";

interface Fixture {
  seed: string;
  desc: string;
  w: number;
  h: number;
  diff: number;
  mode: number;
  removeends: boolean;
  symmetrical: boolean;
}
const data = cReference as { fixtures: Fixture[] };

const MODE_CHARS = "ORHCE";
const DIFF_CHARS = "ENTH";

describe("ascent frozen upstream boards (decode, round-trip, solve at their tier)", () => {
  it("has fixtures to check", () => {
    expect(data.fixtures.length).toBeGreaterThan(0);
  });

  for (const f of data.fixtures) {
    const label = `${f.w}x${f.h} ${MODE_CHARS[f.mode]}${DIFF_CHARS[f.diff]}${f.removeends ? "re" : ""}${f.symmetrical ? "sym" : ""} seed=${f.seed}`;
    it(label, () => {
      const p: AscentParams = {
        w: f.w,
        h: f.h,
        diff: f.diff,
        mode: f.mode,
        removeends: f.removeends,
        symmetrical: f.symmetrical,
      };
      expect(validateAscentDesc(p, f.desc)).toBeNull();
      const state = newAscentState(p, f.desc);
      expect(encodeGridDesc(state.grid, state.w * state.h)).toBe(f.desc);
      const sc = new SolverScratch(state.w, state.h, state.mode, state.last);
      ascentSolve(state.grid, f.diff, sc);
      expect(checkCompletion(sc.grid, state.w, state.h, state.mode)).toBe(true);
    });
  }
});
