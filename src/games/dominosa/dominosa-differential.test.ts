/**
 * The boards upstream's C dealt, against the compiled ladder.
 *
 * Upstream kept a board only where its solver graded it at the tier asked
 * for, so the ladder grading each at the same tier says it reaches as far as
 * upstream's solver did, and no further below. Its Unreasonable board, dealt
 * for its forcing chains, is one the ladder below Unreasonable stops on and
 * the search finishes. The generator is not upstream's draw for draw, so no
 * seed is asked to deal its board again.
 *
 * The fixture is **frozen and cannot be regenerated**: the C harness that
 * recorded it is gone (see `engine/testing/differential.ts`).
 */
import { describe, expect, it } from "vitest";
import { validateDesc } from "../../engine/desc-error.ts";
import reference from "./__fixtures__/dominosa-c-reference.json" with { type: "json" };
import { dominosaGame } from "./index.ts";
import { solveNumbers } from "./solver.ts";
import { DIFF_EXTREME, newState } from "./state.ts";

interface Fixture {
  name: string;
  n: number;
  diff: number;
  desc: string;
}

describe("dominosa's ladder on upstream's boards (frozen C reference)", () => {
  it.each(
    (reference.fixtures as Fixture[]).map((f) => [`${f.name} (n=${f.n})`, f] as const),
  )("grades %s at upstream's tier", (_label, f) => {
    const p = { n: f.n, diff: f.diff, tall: false };
    expect(validateDesc(dominosaGame, p, f.desc)).toBeNull();
    const state = newState(p, f.desc);
    expect(solveNumbers(p, state.numbers, DIFF_EXTREME).result).toBe(1);
    const graded = solveNumbers(p, state.numbers, f.diff);
    expect(graded.result).toBe(1);
    expect(graded.maxDiffUsed).toBe(f.diff);
    if (f.diff > 0)
      expect(solveNumbers(p, state.numbers, f.diff - 1).result).not.toBe(1);
  });
});
