/**
 * Behavioral tests for the Light Up explained hint.
 *
 * The recorder-off byte-match guard is `lightup-differential.test.ts`; these
 * tests cover the recorder-on plan: completeness on Easy/Normal boards, the
 * bleed rule (a step's marks stay inside its narrated evidence), the narration
 * voice guards, refusals, keep-track shrinking, and the honest
 * Unreasonable-tier refusal at the guess point.
 */
import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/contract/game.ts";
import { CELL, stepMarks } from "../../engine/contract/hint-words.ts";
import type { Point } from "../../engine/contract/types.ts";
import { SYMM_ROT4 } from "../../engine/generate/symmetric-blacks.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { type LightupHint, lightupGame } from "./index.ts";
import { answerOf, holdsBulb } from "./solver.ts";
import {
  F_BLACK,
  idx,
  type LightupMove,
  type LightupParams,
  type LightupState,
} from "./state.ts";

type Step = HintStep<LightupMove, LightupHint>;

const EASY: LightupParams = { w: 7, h: 7, blackpc: 20, symm: SYMM_ROT4, difficulty: 0 };
const TRICKY: LightupParams = { ...EASY, difficulty: 1 };
const UNREASONABLE: LightupParams = { ...EASY, difficulty: 2 };

function freshState(p: LightupParams, seed: string): LightupState {
  const { desc } = lightupGame.newDesc(p, randomNew(seed));
  return lightupGame.newState(p, desc);
}

function planSteps(state: LightupState): Step[] {
  const res = lightupGame.hint.plan(state);
  if (!res?.ok) throw new Error(`hint refused: ${res?.error}`);
  // The Game interface erases the highlights type; restore it.
  return res.steps as Step[];
}

describe("plan completeness", () => {
  for (const [name, params] of [
    ["easy", EASY],
    ["tricky", TRICKY],
  ] as const) {
    it(`the plan solves every generated ${name} board when applied in order`, () => {
      for (const seed of ["lh-a", "lh-b", "lh-c"]) {
        let state = freshState(params, `${seed}-${name}`);
        const steps = planSteps(state);
        for (const step of steps) state = lightupGame.executeMove(state, step.move);
        expect(lightupGame.status(state)).toBe("solved");
      }
    });
  }
});

describe("the walk carries on from its last step", () => {
  it("takes the walled-in square's bulb, then the 1 beside it", () => {
    // Fourth row: 2, open, 1, open, 4, open, wall.
    const steps = planSteps(lightupGame.newState(EASY, "c2mBc2a1a4aBc2m1c"));
    // The 4 beside it takes its bulbs first, the walled-in square's among them.
    const at = steps.findIndex((s) =>
      s.move.ops.some((o) => o.kind === "light" && o.x === 3 && o.y === 3),
    );
    expect(at).toBeGreaterThanOrEqual(0);
    expect(steps[at + 1].rung).toBe("clueFull");
    expect(steps[at + 1].highlights?.clue).toEqual({ x: 2, y: 3 });
  });
});

describe("bleed rule: a step's marks stay inside its narrated evidence", () => {
  it("holds on every step of easy+tricky plans", () => {
    const near = (a: Point, b: Point): boolean =>
      Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
    for (const [params, seed] of [
      [EASY, "lh-bleed-e"],
      [TRICKY, "lh-bleed-t"],
    ] as const) {
      const steps = planSteps(freshState(params, seed));
      expect(steps.length).toBeGreaterThan(0);
      for (const step of steps) {
        const hl = step.highlights;
        if (!hl) throw new Error("step without highlights");
        switch (step.rung) {
          case "square": {
            // The forced bulb is one of the dark square's candidates: the
            // square itself, or one in its row or column.
            expect(hl.targets).toHaveLength(1);
            const [t] = hl.targets;
            expect(!hl.dark || t.x === hl.dark.x || t.y === hl.dark.y).toBe(true);
            break;
          }
          case "clueFull":
          case "clueExact": {
            // Every marked cell is a neighbor of the narrated clue.
            const clue = hl.clue;
            if (!clue) throw new Error("a number's step without its clue");
            for (const cell of hl.targets) expect(near(clue, cell)).toBe(true);
            break;
          }
          case "darkSet":
          case "clueSet":
            // One discounted square per step, with evidence to show.
            expect(hl.targets).toHaveLength(1);
            expect(stepMarks(step).of("outline", CELL).length).toBeGreaterThan(0);
            break;
        }
      }
    }
  });
});

describe("narration", () => {
  it("every step concludes in the necessity voice and carries visible evidence", () => {
    for (const [params, seed] of [
      [EASY, "lh-narr-e"],
      [TRICKY, "lh-narr-t"],
    ] as const) {
      const steps = planSteps(freshState(params, seed));
      for (const step of steps) {
        expect(step.explanation).toMatch(
          /must (hold a bulb|be a bulb)|can't hold a bulb/,
        );
        const hl = step.highlights;
        if (!hl) throw new Error("step without highlights");
        expect(hl.targets.length).toBeGreaterThan(0);
        // Visible evidence: an area, a ringed dark square, or a
        // recolored clue — except the self-lighting forcedLight corner
        // case, whose evidence is the board geometry itself.
        const evidence = stepMarks(step).of("outline", CELL);
        const selfLit = hl.kind === "light" && evidence.length === 0;
        if (!selfLit) expect(evidence.length).toBeGreaterThan(0);
      }
    }
  });

  it("words and picture agree: the dark square and the clue are named only when drawn", () => {
    let checked = 0;
    for (const [params, seed] of [
      [EASY, "lh-wp-e"],
      [TRICKY, "lh-wp-t"],
    ] as const) {
      const steps = planSteps(freshState(params, seed));
      for (const step of steps) {
        const hl = step.highlights;
        if (!hl) throw new Error("step without highlights");
        expect(step.explanation.includes("outlined dark square")).toBe(
          hl.dark !== undefined,
        );
        // A number is named as the outlined clue, or by its value ("This 3").
        expect(/outlined clue|\b[Tt]his \d\b/.test(step.explanation)).toBe(
          hl.clue !== undefined,
        );
        if (hl.dark !== undefined || hl.clue !== undefined) checked++;
      }
    }
    expect(checked, "no step drew a dark square or a clue").toBeGreaterThan(0);
  });
});

describe("narration — a second mark on the board is named", () => {
  /** Any bare pointer at the acted-on square. With two marks in view it picks
   * out neither. */
  const DEICTIC = /\b(this|that) (square|cell)\b|\bhere\b/;
  /** What each branch ties it with — relational throughout, never a color
   * name (`docs/hints.md` § "Two marks of one kind: tie them, and never by color").
   * Lightup could not tie positionally: the driving clue is never adjacent to
   * or in line with the target, so the tie is the reach relation `discountSet`
   * does guarantee. */
  const TIE =
    /[Oo]nly this square can|nothing else can light this|bulb on this square blocks every outlined square/;

  it("no step points bare at a square while a second mark is displayed", () => {
    const kinds = new Set<string>();
    let checked = 0;
    let withMark = 0;
    for (const [params, seed] of [
      [EASY, "lh-deixis-e"],
      [EASY, "lh-deixis-e2"],
      [TRICKY, "lh-deixis-t"],
      [TRICKY, "lh-deixis-t2"],
    ] as const) {
      const steps = planSteps(freshState(params, seed));
      for (const step of steps) {
        const hl = step.highlights;
        if (!hl) throw new Error("step without highlights");
        kinds.add(step.rung);
        checked++;
        const secondMark = stepMarks(step).of("outline", CELL).length > 0;
        if (!secondMark) continue;
        withMark++;
        if (!DEICTIC.test(step.explanation)) continue;
        expect(
          TIE.test(step.explanation),
          `${step.rung}: ${step.explanation} — a second mark is shown but "this square" is not tied to it`,
        ).toBe(true);
      }
    }
    // Vacuity guards: an empty sweep, or one that never reached the two
    // discount rules, would pass while measuring nothing.
    expect(checked).toBeGreaterThan(50);
    expect(withMark).toBeGreaterThan(50);
    for (const kind of ["square", "clueFull", "clueExact", "darkSet", "clueSet"]) {
      expect([...kinds]).toContain(kind);
    }
  });
});

describe("refusals", () => {
  it("counts a board the plan finishes as solved, so the midend refuses it", () => {
    let state = freshState(EASY, "lh-solved");
    for (const step of planSteps(state)) {
      state = lightupGame.executeMove(state, step.move);
    }
    expect(lightupGame.status(state)).toBe("solved");
  });

  it("flags a wrongly placed bulb, so the midend refuses it", () => {
    const state = freshState(EASY, "lh-wrong");
    const answer = answerOf(state);
    if (answer.kind !== "one") throw new Error("board not uniquely solvable?");
    // Place a bulb on a square the solution keeps empty.
    let placed: LightupState | null = null;
    outer: for (let y = 0; y < state.h; y++) {
      for (let x = 0; x < state.w; x++) {
        const i = idx(x, y, state.w);
        if (state.flags[i] & F_BLACK) continue;
        if (holdsBulb(answer.solution, i)) continue;
        placed = lightupGame.executeMove(state, {
          ops: [{ kind: "light", x, y }],
        });
        break outer;
      }
    }
    if (!placed) throw new Error("no wrong square found");
    expect(lightupGame.findMistakes?.(placed).length ?? 0).toBeGreaterThan(0);
  });

  it("an Unreasonable board gets the deductive prefix, then an honest refusal", () => {
    let state = freshState(UNREASONABLE, "lh-unreasonable");
    // Follow freshly-recomputed hints until the guess point.
    for (let moves = 0; moves < 200; moves++) {
      const res = lightupGame.hint.plan(state);
      if (!res) throw new Error("no hint()");
      if (!res.ok) {
        expect(res.error).toMatch(/trial and error/);
        expect(lightupGame.status(state)).toBe("ongoing");
        return;
      }
      state = lightupGame.executeMove(state, res.steps[0].move);
    }
    throw new Error("never reached the guess point (board solved deductively?)");
  });
});

/** Every rule, and a step that decides several squares at once, each with the
 * board it is asked from. The two discount rules are Tricky's. */
const pinned = describeHintPins({
  game: lightupGame,
  params: [EASY, TRICKY],
  kinds: {
    multiCell: (step) => (step.highlights?.targets.length ?? 0) > 1,
  },
  pins: {
    /** Held on 86 of 271 positions walked. */
    multiCell: "7x7b20s4d0:bBe2c3c3aBaBgBaBaBcBc2e3b",
    /** Held on 139 of 271 positions walked. */
    clueFull: "7x7b20s4d0:i21hBbBaBa1b0h13i",
    /** Held on 166 of 271 positions walked. */
    clueExact: "7x7b20s4d0:bBe2c3c3aBaBgBaBaBcBc2e3b",
    /** Held on 271 of 271 positions walked. */
    square: "7x7b20s4d0:c1a1a1cBc1eBe2e4c2cBaBaBc",
    /** Held on 101 of 271 positions walked. */
    darkSet: {
      id: "7x7b20s4d1:b1h3cBd1g0d3c2hBb",
      moves:
        '[{"ops":[{"kind":"impossible","x":1,"y":4},{"kind":"impossible","x":0,"y":3},{"kind":"impossible","x":0,"y":5}]}]',
    },
    /** Held on 28 of 271 positions walked. */
    clueSet: "7x7b20s4d1:c1lBaBbBb2b2b3aBl2c",
  },
});

describe("hintKeepTrack", () => {
  it("a single mark on one target shrinks the step in place (onTrack)", () => {
    const { state, step } = pinned("multiCell");
    const hl = step.highlights;
    if (!hl) throw new Error("no highlights");
    const before = hl.targets.length;
    const first = hl.targets[0];
    const verdict = lightupGame.hint.keepTrack(
      { ops: [{ kind: hl.kind, x: first.x, y: first.y }] },
      step,
      state,
    );
    expect(verdict).toBe("onTrack");
    expect(step.highlights?.targets.length).toBe(before - 1);
    expect(step.move.ops.length).toBe(before - 1);
  });

  it("covering the last remaining target completes; a stray move is off", () => {
    const { state, step } = pinned("multiCell");
    const hl = step.highlights;
    if (!hl) throw new Error("no highlights");
    // Whole step in one grouped move → completed.
    expect(lightupGame.hint.keepTrack(step.move, step, state)).toBe("completed");
    // A move of the wrong kind on a target → off.
    const t = hl.targets[0];
    const wrongKind = hl.kind === "light" ? "impossible" : "light";
    expect(
      lightupGame.hint.keepTrack(
        { ops: [{ kind: wrongKind, x: t.x, y: t.y }] },
        step,
        state,
      ),
    ).toBe("off");
    // A move elsewhere → off.
    let elsewhere: { x: number; y: number } | null = null;
    for (let y = 0; y < state.h && !elsewhere; y++) {
      for (let x = 0; x < state.w && !elsewhere; x++) {
        const i = idx(x, y, state.w);
        if (state.flags[i] & F_BLACK) continue;
        if (hl.targets.some((c) => c.x === x && c.y === y)) continue;
        elsewhere = { x, y };
      }
    }
    if (!elsewhere) throw new Error("no non-target square");
    expect(
      lightupGame.hint.keepTrack(
        { ops: [{ kind: hl.kind, x: elsewhere.x, y: elsewhere.y }] },
        step,
        state,
      ),
    ).toBe("off");
  });
});

describe("refreshHintStep", () => {
  it("drops already-done targets and resolves to null when all are done", () => {
    let state = freshState(EASY, "lh-refresh");
    const step = planSteps(state)[0];
    const hl = step.highlights;
    if (!hl) throw new Error("no highlights");
    const first = hl.targets[0];
    // The player performs the first target's mark themselves.
    state = lightupGame.executeMove(state, {
      ops: [{ kind: hl.kind, x: first.x, y: first.y }],
    });
    const refreshed = lightupGame.hint.refreshStep?.(step, state) as Step | null;
    if (hl.targets.length === 1) {
      expect(refreshed).toBeNull();
    } else {
      expect(refreshed?.highlights?.targets.length).toBe(hl.targets.length - 1);
      expect(refreshed?.move.ops.length).toBe(hl.targets.length - 1);
      // Fully applied → resolved.
      let done = state;
      if (refreshed) done = lightupGame.executeMove(done, refreshed.move);
      expect(lightupGame.hint.refreshStep?.(step, done)).toBeNull();
    }
  });
});
