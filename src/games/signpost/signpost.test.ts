/**
 * Tier-1 behavioral tests for the Signpost port: params/desc codecs,
 * generator solvability, solver, findMistakes, and a render smoke.
 */
import { describe, expect, it } from "vitest";
import { DIFF_EASY, DIFF_UNREASONABLE } from "../../engine/answer-search.ts";
import {
  DESC_OUT_OF_RANGE,
  DESC_REPEATED,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descValue,
  validateDesc,
} from "../../engine/desc-error.ts";
import { describeParams } from "../../engine/param-label.ts";
import { paramsError } from "../../engine/params.ts";
import { randomNew } from "../../engine/random/index.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { newSignpostDesc } from "./generator.ts";
import { signpostGame } from "./index.ts";
import { executeMove } from "./moves.ts";
import { solveState } from "./solver.ts";
import {
  cloneState,
  FLAG_IMMUTABLE,
  generateDesc,
  parseDesc,
  stripNums,
} from "./state.ts";

const PRESETS = [
  { w: 4, h: 4, forceCornerStart: true, diff: DIFF_EASY },
  { w: 4, h: 4, forceCornerStart: false, diff: DIFF_EASY },
  { w: 5, h: 5, forceCornerStart: true, diff: DIFF_EASY },
  { w: 5, h: 5, forceCornerStart: false, diff: DIFF_EASY },
];

describe("signpost params codec", () => {
  it("round-trips full params (corner start)", () => {
    const p = { w: 5, h: 5, forceCornerStart: true, diff: DIFF_EASY };
    const enc = signpostGame.encodeParams(p, true);
    expect(enc).toBe("5x5cde");
    expect(signpostGame.decodeParams(enc)).toEqual(p);
    // A string from before the tiers reads as Easy.
    expect(signpostGame.decodeParams("5x5c")).toEqual(p);
    expect(signpostGame.encodeParams({ ...p, diff: DIFF_UNREASONABLE }, true)).toBe(
      "5x5cdu",
    );
    expect(signpostGame.encodeParams({ ...p, diff: DIFF_UNREASONABLE }, false)).toBe(
      "5x5",
    );
  });

  it("round-trips full params (free ends)", () => {
    const p = { w: 6, h: 4, forceCornerStart: false, diff: DIFF_EASY };
    const enc = signpostGame.encodeParams(p, true);
    expect(enc).toBe("6x4de");
    expect(signpostGame.decodeParams(enc)).toEqual(p);
    expect(signpostGame.decodeParams("6x4")).toEqual(p);
  });

  it("rejects a 1x1 full generation", () => {
    expect(
      paramsError(
        signpostGame,
        { w: 1, h: 1, forceCornerStart: true, diff: DIFF_EASY },
        true,
      ),
    ).not.toBeNull();
    expect(
      paramsError(
        signpostGame,
        { w: 4, h: 4, forceCornerStart: true, diff: DIFF_EASY },
        true,
      ),
    ).toBeNull();
    expect(
      paramsError(
        signpostGame,
        { w: 4, h: 0, forceCornerStart: true, diff: DIFF_EASY },
        true,
      ),
    ).toBe("Height must be at least 1.");
  });

  it("labels free ends, and says nothing of corners", () => {
    expect(
      describeParams(signpostGame, {
        w: 6,
        h: 4,
        forceCornerStart: false,
        diff: DIFF_EASY,
      }),
    ).toBe("6x4 Easy, free ends");
    expect(
      describeParams(signpostGame, {
        w: 6,
        h: 4,
        forceCornerStart: true,
        diff: DIFF_EASY,
      }),
    ).toBe("6x4 Easy");
  });
});

describe("signpost desc codec", () => {
  it("round-trips a generated desc through unpick + generateDesc", () => {
    const p = { w: 4, h: 4, forceCornerStart: true, diff: DIFF_EASY };
    const { desc } = newSignpostDesc(p, randomNew("signpost-desc-1"));
    expect(generateDesc(descValue(parseDesc(p, desc)))).toBe(desc);
  });

  it("validateDesc rejects an unknown direction char", () => {
    const p = { w: 2, h: 2, forceCornerStart: false, diff: DIFF_EASY };
    // 4 cells expected; 'z' is not a-h.
    expect(validateDesc(signpostGame, p, "1azaaa")).not.toBeNull();
  });

  it("validateDesc rejects a too-short desc", () => {
    const p = { w: 3, h: 3, forceCornerStart: false, diff: DIFF_EASY };
    expect(validateDesc(signpostGame, p, "1aae")).not.toBeNull();
  });

  it("validateDesc refuses a number given twice, or a 0 no generated board writes", () => {
    const p = { w: 2, h: 2, forceCornerStart: false, diff: DIFF_EASY };
    expect(validateDesc(signpostGame, p, "1ca2a4a")).toBeNull();
    expect(validateDesc(signpostGame, p, "1ca1a4a")).toBe(DESC_REPEATED);
    expect(validateDesc(signpostGame, p, "1ca0a4a")).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(signpostGame, p, "1ca5a4a")).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(signpostGame, p, "1ca2a4ab")).toBe(DESC_TOO_LONG);
    expect(validateDesc(signpostGame, p, "1ca2a4")).toBe(DESC_TOO_SHORT);
  });
});

describe("signpost generator + solver", () => {
  it("generates uniquely solvable boards across presets", () => {
    for (const p of PRESETS) {
      for (let seed = 0; seed < 4; seed++) {
        const { desc } = newSignpostDesc(p, randomNew(`sp-${p.w}x${p.h}-${seed}`));
        // The bare clued board must solve uniquely (solver reaches 1).
        const solved = cloneState(descValue(parseDesc(p, desc)));
        stripNums(solved);
        expect(solveState(solved)).toBe(1);
      }
    }
  });

  it("solve() recovers the full chain from a dirty mid-game state", () => {
    const p = { w: 5, h: 5, forceCornerStart: true, diff: DIFF_EASY };
    const { desc } = newSignpostDesc(p, randomNew("sp-solve-1"));
    const s0 = signpostGame.newState(p, desc);
    const res = signpostGame.solve?.(s0, s0);
    expect(res?.ok).toBe(true);
    if (res?.ok) {
      const solved = signpostGame.executeMove(s0, res.move);
      expect(signpostGame.status(solved)).toBe("solved");
    }
  });
});

describe("signpost findMistakes", () => {
  it("flags a link that contradicts the unique solution", () => {
    const p = { w: 5, h: 5, forceCornerStart: true, diff: DIFF_EASY };
    const { desc } = newSignpostDesc(p, randomNew("sp-mistake-1"));
    const s0 = signpostGame.newState(p, desc);

    // Get the unique solution's next[] via solve.
    const res = signpostGame.solve?.(s0, s0);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    const solvedNext = (res.move as { type: "solve"; next: number[] }).next;

    // Link the '1' cell to any legal target that is not its solution
    // successor, and expect that link reported as a mistake.
    const one = s0.nums.indexOf(1);
    let found = false;
    for (let target = 0; target < s0.n && !found; target++) {
      if (target === solvedNext[one]) continue;
      try {
        const wrong = executeMove(s0, {
          type: "link",
          fromX: one % s0.w,
          fromY: Math.floor(one / s0.w),
          toX: target % s0.w,
          toY: Math.floor(target / s0.w),
        });
        const mistakes = signpostGame.findMistakes?.(wrong) ?? [];
        expect(mistakes.length).toBeGreaterThan(0);
        found = true;
      } catch {
        // illegal link — try the next target
      }
    }
    expect(found).toBe(true);
  });

  it("reports no mistakes for the freshly-generated (unlinked) board", () => {
    const p = { w: 5, h: 5, forceCornerStart: true, diff: DIFF_EASY };
    const { desc } = newSignpostDesc(p, randomNew("sp-clean-1"));
    const s0 = signpostGame.newState(p, desc);
    expect(signpostGame.findMistakes?.(s0)).toEqual([]);
  });

  it("marks an immutable-number cell that stays immutable", () => {
    const p = { w: 4, h: 4, forceCornerStart: true, diff: DIFF_EASY };
    const { desc } = newSignpostDesc(p, randomNew("sp-imm-1"));
    const s0 = signpostGame.newState(p, desc);
    // The '1' anchor is always immutable.
    const one = s0.nums.indexOf(1);
    expect(s0.flags[one] & FLAG_IMMUTABLE).toBeTruthy();
  });
});

describe("signpost render smoke", () => {
  it("redraws the initial frame without throwing", () => {
    const p = { w: 5, h: 5, forceCornerStart: true, diff: DIFF_EASY };
    const { desc } = newSignpostDesc(p, randomNew("sp-render-1"));
    const { recording } = renderScenario({ game: signpostGame, id: `5x5c:${desc}` });
    expect(recording.ops.length).toBeGreaterThan(0);
    // A per-tile background rect must appear.
    expect(recording.ops.some((o) => o.op === "rect")).toBe(true);
  });
});
