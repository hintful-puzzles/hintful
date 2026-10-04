/**
 * Slant hint — tier-1 behavioral tests: the boards the midend refuses,
 * plan completeness, narration quality (indication-first, necessity voice),
 * visible evidence, and keep-track.
 */
import { describe, expect, test } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { newDesc } from "./generator.ts";
import type { SlantHint } from "./hint.ts";
import { slantGame } from "./index.ts";
import { solveFromClues } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_HARD,
  executeMove,
  newState,
  type SlantMove,
  type SlantState,
} from "./state.ts";

function freshState(w: number, h: number, diff: number, seed: string): SlantState {
  const rs = randomNew(seed);
  const { desc } = newDesc({ w, h, diff }, rs);
  return newState({ w, h, diff }, desc);
}

/** Apply every hint step's move in order; returns the resulting board. */
function applyPlan(state: SlantState): SlantState {
  let s = state;
  const res = slantGame.hint?.(s);
  if (!res?.ok) throw new Error("expected a plan");
  for (const step of res.steps) s = executeMove(s, step.move);
  return s;
}

/** Whether a plan's second step is a square continuing its first square's
 * firing. A firing's first leg continues the marks placed for it, so only a
 * square after a square is a clue's continuation. */
function secondSquareContinues(state: SlantState): boolean {
  const res = slantGame.hint?.(state);
  if (!res?.ok || res.steps.length < 2) return false;
  const [first, second] = res.steps;
  return (
    second.continuesPrevious === true &&
    second.move.type === "set" &&
    first.move.type === "set"
  );
}

const pinned = describeHintPins({
  game: slantGame,
  params: [{ w: 8, h: 8, diff: DIFF_HARD }],
  kinds: {
    clue: /^(This \d clue|A [04] clue)/,
    clueWithSecondSquare: (_step, state) => secondSquareContinues(state),
  },
  pins: {
    /** Held on 779 of 856 positions walked. */
    clue: "8x8dh:1a111111a12c1e11c3112a21c1a13211a1b3b3b11b23a2d13131a1b1d1b",
    /** Held on 270 of 856 positions walked. */
    clueWithSecondSquare: "8x8dh:j33a3a11b3b2b2d21c1b313131b32d1b12313g2a12b0c1c",
  },
});

describe("slant hint", () => {
  test("counts the board its plan finishes as solved, so the midend refuses it", () => {
    const s = freshState(5, 5, DIFF_EASY, "solved-1");
    expect(slantGame.status(applyPlan(s))).toBe("solved");
  });

  test("flags a wrong slash, so the midend refuses it", () => {
    const s = freshState(8, 8, DIFF_HARD, "mistake-1");
    const sol = solveFromClues(s.w, s.h, s.clues);
    if ("error" in sol) throw new Error("unsolvable");
    // Place a wrong slash: first square, opposite of the solution.
    const wrongV = (sol.soln[0] === 1 ? -1 : 1) as 1 | -1;
    const dirty = executeMove(s, { type: "set", x: 0, y: 0, v: wrongV });
    expect(slantGame.findMistakes?.(dirty)?.length ?? 0).toBeGreaterThan(0);
  });

  test("plan solves every generated board, from empty and mid-solve", () => {
    for (const [w, h, diff] of [
      [5, 5, DIFF_EASY],
      [8, 8, DIFF_HARD],
      [12, 10, DIFF_HARD],
    ] as const) {
      for (let seed = 0; seed < 8; seed++) {
        const s = freshState(w, h, diff, `plan-${w}.${h}.${diff}.${seed}`);
        const solved = applyPlan(s);
        expect(slantGame.status(solved)).toBe("solved");

        // Mid-solve: apply half the plan, re-request, finish.
        const res = slantGame.hint?.(s);
        if (!res?.ok) throw new Error("expected plan");
        let mid = s;
        const half = Math.floor(res.steps.length / 2);
        for (let i = 0; i < half; i++) mid = executeMove(mid, res.steps[i].move);
        const solved2 = applyPlan(mid);
        expect(slantGame.status(solved2)).toBe("solved");
      }
    }
  });

  test("every step is narrated in the necessity voice with visible evidence", () => {
    for (let seed = 0; seed < 12; seed++) {
      const s = freshState(8, 8, DIFF_HARD, `voice-${seed}`);
      const res = slantGame.hint?.(s);
      if (!res?.ok) throw new Error("expected plan");
      for (const step of res.steps) {
        expect(step.explanation.length).toBeGreaterThan(0);
        // Conclusion carries a necessity modal, never a bare "is/stays".
        expect(step.explanation).toMatch(/must (be|slant|stay)/);
        const hl = step.highlights as SlantHint;
        // Visible evidence: an area, a ringed anchor, a clue it reads, a mark
        // it cites, or the firing's still-to-do siblings (never a bare
        // conclusion).
        const hasEvidence =
          (hl.area?.length ?? 0) > 0 ||
          hl.ref !== undefined ||
          (hl.clues?.length ?? 0) > 0 ||
          (hl.marks?.length ?? 0) > 0 ||
          (hl.siblings?.length ?? 0) > 0;
        expect(hasEvidence).toBe(true);
      }
    }
  });

  test("clue firings lead with the indication and group as one journey", () => {
    const clue = pinned("clue").step;
    expect((clue.highlights as SlantHint).clues?.length).toBe(1);

    const journey = pinned("clueWithSecondSquare").steps;
    expect(journey[1].explanation).toMatch(
      /^…and (?:this square|these squares) must slant (?:away|toward it) too, for the same clue(?: and the outlined squares?)?\.$/,
    );
  });

  test("loop / dead-end / equivalence firings each get their narration", () => {
    // Whole plans are read here because the equivalence sentence cannot be
    // pinned: it opened 0 of 2456 hints. It is always a plan's second step,
    // and the recompute after the first explains the square by another rung.
    const seen = new Set<string>();
    const s = newState(
      { w: 12, h: 10, diff: DIFF_HARD },
      "i1d321a11a1b2b1b31b22a2c231a2a21a1113b121a22a1b11b2b3a2a1c2f3211b2a11a33a2c33b22c3b4a2a3a3a33a1i1c",
    );
    const res = slantGame.hint?.(s);
    if (!res?.ok) throw new Error("expected a plan");
    for (const step of res.steps) {
      const e = step.explanation;
      if (/join two corners/.test(e)) seen.add("loop");
      if (/one way out each/.test(e)) seen.add("deadend");
      if (/links? this square to the outlined square/.test(e)) {
        seen.add("equiv");
        const hl = step.highlights as SlantHint;
        expect(hl.ref).toBeDefined();
        expect(hl.marks?.length).toBeGreaterThan(0);
      }
      if (step.move.type === "alike") {
        seen.add(/^This \d clue/.test(e) ? "mark-clue" : "mark-v");
      }
    }
    // This board's plan says all five.
    expect([...seen].sort()).toEqual([
      "deadend",
      "equiv",
      "loop",
      "mark-clue",
      "mark-v",
    ]);
  });

  test("hintKeepTrack: the hinted move completes, a wrong move drops the plan", () => {
    const s = freshState(8, 8, DIFF_HARD, "track-1");
    const res = slantGame.hint?.(s);
    if (!res?.ok) throw new Error("expected plan");
    const step = res.steps[0];
    expect(slantGame.hintKeepTrack?.(step.move, step, s)).toBe("completed");
    // The opposite slash on the same square is off-plan.
    const m = step.move as Extract<SlantMove, { type: "set" }>;
    const wrong: SlantMove = {
      type: "set",
      x: m.x,
      y: m.y,
      v: (m.v === 1 ? -1 : 1) as 1 | -1,
    };
    expect(slantGame.hintKeepTrack?.(wrong, step, s)).toBe("off");
  });
});
