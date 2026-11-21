/**
 * The plan walk's own rules, on a counter a plan counts up: the stop rules
 * and the order every visitor is shown things in. A game's walk leans on each
 * of them and would not notice one break: a visitor never called checks
 * nothing.
 */
import { describe, expect, it } from "vitest";
import type { HintResult } from "../contract/game.ts";
import { DEDUCTION_EXHAUSTED } from "../contract/hint-refusal.ts";
import { walkHint, walkPlan } from "./plan-walk.ts";

/** A plan from `n` up to `goal`, `size` steps of one at most. */
const upTo = (goal: number, size: number) => (n: number) =>
  Array.from({ length: Math.min(size, goal - n) }, () => 1);

const counting = (goal: number, size: number) => ({
  plan: upTo(goal, size),
  apply: (n: number, step: number) => n + step,
  done: (n: number) => n >= goal,
});

describe("walkPlan", () => {
  it("asks again when a plan runs out, until done, showing each visitor in order", () => {
    const seen: string[] = [];
    const result = walkPlan(0, {
      ...counting(5, 2),
      asks: 10,
      asked: (n, ask) => seen.push(`ask ${ask} at ${n}`),
      planned: (steps, n) => seen.push(`plan of ${steps.length} at ${n}`),
      step: (_s, before, after, index) =>
        seen.push(`step ${index}: ${before}→${after}`),
    });
    expect(result).toEqual({ state: 5, end: "done", steps: 5, asks: 3, refusal: null });
    expect(seen).toEqual([
      "ask 0 at 0",
      "plan of 2 at 0",
      "step 0: 0→1",
      "step 1: 1→2",
      "ask 1 at 2",
      "plan of 2 at 2",
      "step 2: 2→3",
      "step 3: 3→4",
      "ask 2 at 4",
      "plan of 1 at 4",
      "step 4: 4→5",
    ]);
  });

  it("ends on an empty plan", () => {
    const result = walkPlan(0, { ...counting(5, 2), done: () => false, asks: 10 });
    expect(result.end).toBe("empty");
    expect(result.state).toBe(5);
  });

  it("stops at its limit, or fails there when asked to", () => {
    const walk = { ...counting(9, 1), asks: 3 };
    expect(walkPlan(0, walk)).toMatchObject({ end: "limit", state: 3, asks: 3 });
    expect(() => walkPlan(0, { ...walk, limit: "throw", label: "nine" })).toThrow(
      "nine: the walk asked 3 plans and is not done",
    );
  });

  it("fails on a refusal, or stops and says why", () => {
    const walk = {
      ...counting(9, 2),
      plan: (n: number) => (n < 4 ? [1, 1] : { refused: "stuck" }),
      asks: 10,
    };
    expect(() => walkPlan(0, walk)).toThrow("the plan refused after 4 steps: stuck");
    expect(walkPlan(0, { ...walk, refuse: "stop" })).toMatchObject({
      end: "refused",
      refusal: "stuck",
      state: 4,
    });
  });
});

/** A game whose board is a counter and whose hint counts it to five. */
const game = {
  hint: {
    plan(n: number): HintResult<number> {
      if (n === 3) return { ok: false, error: DEDUCTION_EXHAUSTED };
      const steps = Array.from({ length: 5 - n }, () => ({
        move: 1,
        rung: "count",
        explanation: "one more",
      }));
      return { ok: true, steps };
    },
  },
  executeMove: (n: number, m: number) => n + m,
  status: (n: number) => (n >= 5 ? ("solved" as const) : ("ongoing" as const)),
  findMistakes: (n: number) => (n === 2 ? ["two"] : []),
};

describe("walkHint", () => {
  it("plays each plan whole, to solved", () => {
    const result = walkHint(game, 4, { asks: 5 });
    expect(result).toMatchObject({ solved: true, steps: 1, asks: 1 });
  });

  it("plays only each first step under `first`, and shows `planned` the whole plan", () => {
    const plans: number[] = [];
    const result = walkHint(game, 0, {
      asks: 2,
      first: true,
      planned: (steps) => plans.push(steps.length),
    });
    expect(result).toMatchObject({ state: 2, end: "limit", steps: 2 });
    expect(plans).toEqual([5, 4]);
  });

  it("names the step that made a mistake", () => {
    expect(() =>
      walkHint(game, 0, { asks: 5, first: true, mistakes: true, label: "zero" }),
    ).toThrow('zero: step 1 made a mistake: one more ["two"]');
  });

  it("ends on the test's own `done` before solved", () => {
    expect(
      walkHint(game, 0, { asks: 5, first: true, done: (n) => n === 1 }),
    ).toMatchObject({ state: 1, end: "done", solved: false });
  });

  it("passes on the game's refusal", () => {
    expect(walkHint(game, 3, { asks: 5, refuse: "stop" })).toMatchObject({
      end: "refused",
      refusal: DEDUCTION_EXHAUSTED,
    });
  });
});
