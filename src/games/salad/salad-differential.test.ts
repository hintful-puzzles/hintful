/**
 * Salad — the frozen C-generated boards (`__fixtures__/salad-c-reference.json`),
 * decoded rather than regenerated.
 *
 * Each fixture records the lowest difficulty at which upstream's solver finished
 * its board. The TS solver must reach the same verdict: it solves at that tier
 * and, above the easiest, not one tier below. That exercises the codec, the ABC
 * End View border rule and the generic cube's reasoning about the empty square
 * over boards the TS generator never produced — a net under refactoring the
 * solver that no longer depends on reproducing upstream's generator. The
 * fixtures span both game modes, both difficulties, every upstream preset, and a
 * size sweep either side of the `order < 8` "empty grid" rule.
 *
 * What the shipped generator guarantees is asserted in `salad.test.ts`
 * § "salad generator": every preset generates a solvable board at its difficulty,
 * and a Normal board that Easy cannot solve.
 *
 * The fixture is **frozen and cannot be regenerated**: the harness that captured
 * it is gone — see `engine/testing/differential.ts`.
 */
import { describe, expect, it } from "vitest";
import cReference from "./__fixtures__/salad-c-reference.json" with { type: "json" };
import { saladSolve } from "./solver.ts";
import {
  GAMEMODE_LETTERS,
  newState,
  type SaladParams,
  scratchBoard,
  validateDesc,
} from "./state.ts";

interface Fixture {
  order: number;
  nums: number;
  mode: number;
  diff: number;
  seed: string;
  desc: string;
  /** Lowest difficulty at which the C solver finishes the board. */
  solverDiff: number;
  /** The C's own generation wall-clock, carried for reference (never asserted
   * — a wall-clock assertion measures the box, not the code; docs/games/testing.md § "Seed-deterministic, never clock-gated"). */
  genMs: number;
}

const data = cReference as { fixtures: Fixture[] };

describe("salad frozen C boards", () => {
  it("covers every recorded board", () => {
    expect(data.fixtures).toHaveLength(28);
  });

  for (const f of data.fixtures) {
    const label = `${f.mode === GAMEMODE_LETTERS ? "letters" : "numbers"} ${f.order}x${f.order} n${f.nums} d${f.diff}`;
    it(`${label}: decodes and grades at the recorded difficulty`, () => {
      const p: SaladParams = {
        order: f.order,
        nums: f.nums,
        mode: f.mode,
        diff: f.diff,
      };
      expect(validateDesc(p, f.desc)).toBeNull();
      const s = newState(p, f.desc);
      expect(saladSolve(scratchBoard(s), f.solverDiff)).toBe(true);
      if (f.solverDiff > 0) {
        expect(saladSolve(scratchBoard(s), f.solverDiff - 1)).toBe(false);
      }
    });
  }
});
