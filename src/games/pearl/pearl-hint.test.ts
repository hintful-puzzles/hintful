/**
 * Pearl's explained hint: the claims its narration makes, and what only this
 * game can check.
 *
 * The cross-game guards cover narration form, plan purity, resuming from any
 * position and the overlay reaching the render cache; Pearl joined them by
 * declaring `hint()`. What is left here:
 *
 *  - **Following the hint finishes every board it deals, at both tiers.** This
 *    is the guard on the design's one real bet: the hint reasons from edges and
 *    pearls alone, forgetting the shape strikes the solver keeps, and nothing
 *    but the boards can say that loses no board.
 *  - **Every step stands on the board the player can see.** A step recomputed
 *    from the player's own board, after following the plan up to it, is the
 *    same step: no fact the plan used is one the player does not have.
 *  - **Every premise the corpus reaches is reached**, with the census one level
 *    finer than the ladder's (docs/games/hints.md § "Census the reasons, not
 *    only the rungs").
 */

import { describe, expect, it } from "vitest";
import { ALREADY_SOLVED, FIX_MISTAKES_FIRST } from "../../engine/hint-refusal.ts";
import { randomNew } from "../../engine/random/index.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { boardOf, type PearlHint, pearlKeepTrack } from "./hint.ts";
import { say } from "./hint-text.ts";
import { type PearlMistake, pearlGame } from "./index.ts";
import { executeMove } from "./moves.ts";
import { type PearlReason, pearlRecordingPass, pearlSolve } from "./solver.ts";
import {
  DIFF_COUNT,
  DIFF_EASY,
  DIFF_TRICKY,
  DX,
  DY,
  F,
  newState,
  type PearlMove,
  type PearlParams,
  type PearlState,
} from "./state.ts";

const SHAPES: PearlParams[] = [
  { w: 6, h: 6, difficulty: DIFF_EASY, nosolve: false },
  { w: 6, h: 6, difficulty: DIFF_TRICKY, nosolve: false },
  { w: 8, h: 8, difficulty: DIFF_EASY, nosolve: false },
  { w: 8, h: 8, difficulty: DIFF_TRICKY, nosolve: false },
];
const SEEDS = ["ph-a", "ph-b", "ph-c"];

type Step = { move: PearlMove; explanation: string; highlights?: PearlHint };

const label = (p: PearlParams, seed: string) =>
  `${p.w}x${p.h} ${p.difficulty === DIFF_EASY ? "Easy" : "Tricky"} / ${seed}`;

function deal(p: PearlParams, seed: string): PearlState {
  return newState(p, pearlGame.newDesc(p, randomNew(`${label(p, seed)}`)).desc);
}

function hintSteps(state: PearlState): Step[] {
  const res = pearlGame.hint?.(state);
  if (!res?.ok) throw new Error(`refused: ${res?.error}`);
  return res.steps as Step[];
}

/** Walk a board to solved by following the first step of each fresh plan. */
function walk(start: PearlState): {
  seen: { step: Step; before: PearlState }[];
  end: PearlState;
} {
  let state = start;
  const seen: { step: Step; before: PearlState }[] = [];
  for (let i = 0; i < 1000 && !state.completed; i++) {
    const step = hintSteps(state)[0];
    seen.push({ step, before: state });
    state = executeMove(state, step.move);
  }
  return { seen, end: state };
}

const CORPUS = SHAPES.flatMap((p) => SEEDS.map((seed) => ({ p, seed })));

describe("following the hint finishes every board, one sound step at a time", () => {
  for (const { p, seed } of CORPUS) {
    it(label(p, seed), () => {
      const start = deal(p, seed);
      const sol = new Uint8Array(p.w * p.h);
      expect(pearlSolve(p.w, p.h, start.clues, sol, DIFF_COUNT, false)).toBe(1);
      const { seen, end } = walk(start);
      expect(end.completed, "following the hint did not finish the board").toBe(true);
      expect(seen.length).toBeGreaterThan(10);
      for (const { step } of seen) {
        const targets = step.highlights?.targets ?? [];
        expect(targets.length, step.explanation).toBeGreaterThan(0);
        // A line the step asks for is in the solution; a cross is not.
        for (const t of targets)
          expect(
            !!(sol[t.sq] & t.dir),
            `${step.explanation} ${JSON.stringify(t)}`,
          ).toBe(t.line);
      }
    });
  }
});

describe("every step stands on the board the player can see", () => {
  // Recomputing from the player's own board, after following the plan up to a
  // step, gives that same step. A plan resting on something the player has not
  // got (a shape the solver struck, a cross it hid) would diverge here.
  for (const { p, seed } of CORPUS.filter((_, i) => i % 3 === 0)) {
    it(label(p, seed), () => {
      let state = deal(p, seed);
      const plan = hintSteps(state);
      expect(plan.length).toBeGreaterThan(5);
      for (const [i, step] of plan.entries()) {
        const again = hintSteps(state)[0];
        expect(again.explanation, `step ${i}`).toBe(step.explanation);
        expect(again.highlights, `step ${i}`).toEqual(step.highlights);
        state = executeMove(state, step.move);
      }
    });
  }
});

describe("every narratable premise the corpus reaches is reached", () => {
  const ALL: Record<PearlReason["kind"], true> = {
    square: true,
    blackRunsOn: true,
    blackCannotRunOn: true,
    whiteCannotTurn: true,
    whiteTurnsOpposite: true,
    closesEarly: true,
    closesEarlyThrough: true,
  };

  it("reaches every kind of premise, and every one nails an edge", () => {
    const reached = new Map<string, number>();
    let firings = 0;
    for (const { p, seed } of CORPUS) {
      const start = deal(p, seed);
      const b = boardOf(start);
      const pass = pearlRecordingPass(b, stepBudget("pearl census"));
      for (let f = pass.next(); f; f = pass.next()) {
        firings++;
        // The board each firing reasons from holds nothing the edges do not:
        // every square exactly what its pearl and its four edges leave it. A
        // shape struck by an earlier firing and kept would show up here, since
        // the player has no mark for it.
        const read = boardOf(start);
        for (let i = 0; i < read.ws.length; i++)
          if ((i % read.W) % 2 === 0 || Math.floor(i / read.W) % 2 === 0)
            read.ws[i] = f.before[i];
        expect(read.readSquaresFromEdges()).toBe(0);
        expect(Array.from(f.before), `${label(p, seed)} firing ${firings}`).toEqual(
          Array.from(read.ws),
        );
        if (!f.reason) continue;
        expect(f.ops.length, f.reason.kind).toBeGreaterThan(0);
        reached.set(f.reason.kind, (reached.get(f.reason.kind) ?? 0) + 1);
      }
      expect(pass.impossible()).toBe(false);
      expect(b.closed).toBe(true);
    }
    expect(firings, "the census looked at almost nothing").toBeGreaterThan(500);
    expect([...reached.keys()].sort()).toEqual(Object.keys(ALL).sort());
  });

  it("the arms no corpus board reaches still read as English, in the necessity voice", () => {
    for (const text of [
      say.closesEarly("lines"),
      say.closesEarlyThrough("lines"),
      say.closesEarlyWhite("across", "upDown", "lines"),
      say.closesEarlyWhite("upDown", "across", "lines"),
      say.squareFull(1),
      say.squareFull(2),
    ]) {
      expect(text.length, text).toBeLessThanOrEqual(120);
      expect(text).toMatch(/must|can't/);
    }
  });
});

describe("following one step at a time", () => {
  /** A fresh board's first step that decides two lines (a white pearl's). */
  function twoLineStep(): { state: PearlState; step: Step } {
    for (const { p, seed } of CORPUS) {
      const state = deal(p, seed);
      for (const step of hintSteps(state).slice(0, 1))
        if (step.highlights?.targets.filter((t) => t.line).length === 2)
          return { state, step };
    }
    throw new Error("no opener decides two lines");
  }

  /** The click that draws line `t`: a reciprocal flip, as the game makes it. */
  function click(state: PearlState, t: { sq: number; dir: number }): PearlMove {
    const x = t.sq % state.w;
    const y = Math.floor(t.sq / state.w);
    return {
      ops: [
        { kind: "flip", l: t.dir, x, y },
        { kind: "flip", l: F(t.dir), x: x + DX(t.dir), y: y + DY(t.dir) },
      ],
    };
  }

  it("a partial follow holds the step and shrinks it; the last line completes it", () => {
    const { state, step } = twoLineStep();
    const [first, second] = step.highlights?.targets ?? [];
    const live = { ...step };
    expect(pearlKeepTrack(click(state, first), live, state)).toBe("onTrack");
    expect(live.highlights?.targets).toEqual([second]);
    const next = executeMove(state, click(state, first));
    expect(pearlKeepTrack(click(next, second), live, next)).toBe("completed");
  });

  it("a line the step never asked for is off-plan", () => {
    const { state, step } = twoLineStep();
    const wanted = step.highlights?.targets ?? [];
    // An edge to the right of some square, not on the board's edge, that the
    // step does not decide.
    const sq = Array.from({ length: state.w * state.h }, (_, i) => i).find(
      (i) =>
        i % state.w !== state.w - 1 && !wanted.some((t) => t.sq === i && t.dir === 1),
    );
    expect(sq).toBeDefined();
    expect(
      pearlKeepTrack(click(state, { sq: sq ?? 0, dir: 1 }), { ...step }, state),
    ).toBe("off");
  });
});

describe("the two refusals every deductive hint owes", () => {
  it("declines on a solved board", () => {
    const { seen, end } = walk(deal(SHAPES[0], "refuse"));
    expect(seen.length).toBeGreaterThan(0);
    expect(pearlGame.hint?.(end)).toEqual({ ok: false, error: ALREADY_SOLVED });
  });

  it("declines while a cross rules out an edge the loop uses", () => {
    const state = deal(SHAPES[0], "refuse");
    const sol = new Uint8Array(state.w * state.h);
    expect(pearlSolve(state.w, state.h, state.clues, sol, DIFF_COUNT, false)).toBe(1);
    const sq = sol.findIndex((v) => (v & 1) !== 0);
    const x = sq % state.w;
    const y = Math.floor(sq / state.w);
    const wrong = executeMove(state, {
      ops: [
        { kind: "mark", l: 1, x, y },
        { kind: "mark", l: F(1), x: x + 1, y },
      ],
    });
    const mistakes = pearlGame.findMistakes?.(wrong) as readonly PearlMistake[];
    expect(mistakes).toContainEqual({ x, y, dir: 1, cross: true });
    expect(pearlGame.hint?.(wrong)).toEqual({ ok: false, error: FIX_MISTAKES_FIRST });
  });
});
