/**
 * The judge of a player's last move (`Game.judgeMove`), on Light Up's
 * `describedFiringHint`: a move a deduction makes is named in that
 * deduction's own sentence, a move only a deeper chain reaches says so, a
 * right move nothing decided yet is told apart, and a move that makes nothing
 * a deduction makes is not judged.
 */
import { describe, expect, it } from "vitest";
import { lightupGame } from "../games/lightup/index.ts";
import { answerOf, holdsBulb } from "../games/lightup/solver.ts";
import {
  F_BLACK,
  F_LIGHT,
  idx,
  type LightupParams,
  type LightupState,
} from "../games/lightup/state.ts";
import { randomNew } from "./random/index.ts";
import { SYMM_ROT4 } from "./symmetric-blacks.ts";

const EASY: LightupParams = { w: 7, h: 7, blackpc: 20, symm: SYMM_ROT4, difficulty: 0 };
const UNREASONABLE: LightupParams = { ...EASY, difficulty: 2 };

const DIRECT = "Your last move followed from the board: ";
const CHAINED =
  /^Your last move followed from the board(:| in a few steps, the first of them:) /;

function fresh(p: LightupParams, seed: string): LightupState {
  const { desc } = lightupGame.newDesc(p, randomNew(seed));
  return lightupGame.newState(p, desc);
}

const judge = lightupGame.judgeMove;
if (!judge) throw new Error("Light Up wires no judgeMove");

describe("judgeMove", () => {
  it("names a hint's own move by the hint's sentence", () => {
    for (const seed of ["mj-a", "mj-b", "mj-c"]) {
      const state = fresh(EASY, seed);
      const res = lightupGame.hint?.(state);
      if (!res?.ok) throw new Error("no hint");
      const step = res.steps[0];
      const verdict = judge(state, lightupGame.executeMove(state, step.move));
      expect(verdict?.followed).toBe(true);
      const text = verdict?.words.text ?? "";
      expect(text.startsWith(DIRECT)).toBe(true);
      // The sentence, its first letter lowered for the lead; a step on
      // several squares may be narrowed to the player's, so it is matched up
      // to its first mark.
      const sentence = step.explanation ?? "";
      const head = sentence.slice(1, sentence.indexOf(","));
      expect(text).toContain(head);
    }
  });

  it("follows a move a later step makes back to the board, in steps", () => {
    let chained = 0;
    for (const seed of ["mj-a", "mj-b", "mj-c"]) {
      // A few moves in, past the steps the bare clues decide.
      let state = fresh(EASY, seed);
      const plan = lightupGame.hint?.(state);
      if (!plan?.ok) throw new Error("no hint");
      for (const step of plan.steps.slice(0, 6))
        state = lightupGame.executeMove(state, step.move);
      const res = lightupGame.hint?.(state);
      if (!res?.ok) continue;
      for (const step of res.steps.slice(1)) {
        const verdict = judge(state, lightupGame.executeMove(state, step.move));
        expect(verdict?.followed).toBe(true);
        const text = verdict?.words.text ?? "";
        expect(text).toMatch(CHAINED);
        if (!text.startsWith(DIRECT) || text.includes("a few steps on")) chained++;
      }
    }
    // A plan's later steps rest on its earlier ones, so some must be chained.
    expect(chained).toBeGreaterThan(0);
  });

  it("tells a right bulb nothing decided from a deduced one", () => {
    let state = fresh(UNREASONABLE, "lh-unreasonable");
    for (let moves = 0; moves < 200; moves++) {
      const res = lightupGame.hint?.(state);
      if (!res?.ok) break;
      state = lightupGame.executeMove(state, res.steps[0].move);
    }
    expect(lightupGame.status(state)).toBe("ongoing");
    const answer = answerOf(state);
    if (answer.kind !== "one") throw new Error("board not uniquely solvable");
    let judged = 0;
    for (let i = 0; i < state.w * state.h; i++) {
      if (state.flags[i] & (F_BLACK | F_LIGHT)) continue;
      if (!holdsBulb(answer.solution, i)) continue;
      const x = i % state.w;
      const y = Math.floor(i / state.w);
      expect(idx(x, y, state.w)).toBe(i);
      const after = lightupGame.executeMove(state, { ops: [{ kind: "light", x, y }] });
      const verdict = judge(state, after);
      expect(verdict?.followed).toBe(false);
      expect(verdict?.words.text).toBe(
        "Your last move was right, but nothing on the board decided the ringed square yet.",
      );
      judged++;
    }
    expect(judged).toBeGreaterThan(0);
  });

  it("does not judge a move that takes a mark away", () => {
    const state = fresh(EASY, "mj-a");
    const res = lightupGame.hint?.(state);
    if (!res?.ok) throw new Error("no hint");
    const marked = lightupGame.executeMove(state, res.steps[0].move);
    // The same toggles again take the marks off.
    const unmarked = lightupGame.executeMove(marked, res.steps[0].move);
    expect(judge(marked, unmarked)).toBeNull();
  });
});
