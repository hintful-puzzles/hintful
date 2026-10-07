/**
 * Flip's hint: the shortest answer pressed in reading order, each press either
 * some unlit square's last chance or supplied by the answer.
 *
 * Each sentence is pinned by a position it fires on, through
 * `testing/hint-positions.ts`, which also holds the scan that finds them.
 */

import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { PUZZLE_NOT_REASONABLE } from "../../engine/hint-refusal.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { bindingDefects } from "../../engine/testing/hint-binding.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing, markSides } from "../../engine/testing/mark-shape.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { type FlipRung, hint, hintKeepTrack } from "./hint.ts";
import { flipGame } from "./index.ts";
import { COL_HINT, COL_HINT_CELL } from "./render.ts";
import { shortestAnswer } from "./solver.ts";
import { encodeBitmap, type FlipMove, type FlipState } from "./state.ts";

const G = flipGame;
const PRESETS = leafPresets(G).map((e) => e.params);

type Step = HintStep<FlipMove, unknown, FlipRung>;

const outlined = (step: Step) => stepMarks(step).of("outline", CELL);
const striped = (step: Step) => stepMarks(step).of("stripes", CELL);

/** The cases of a rung that read differently: how many squares a press is the
 * last chance of and whether it flips any other, whether the answer a press
 * comes from is the only one, and a last press that lights only itself. */
const KINDS = {
  lastChanceOfOne: (step: Step) =>
    step.rung === "lastChance" &&
    outlined(step).length === 1 &&
    striped(step).length > 0,
  lastChanceOfTwo: (step: Step) =>
    step.rung === "lastChance" && outlined(step).length > 1 && striped(step).length > 0,
  lastChanceFlippingNoMore: (step: Step) =>
    step.rung === "lastChance" && striped(step).length === 0,
  fromOnlyAnswer: (step: Step, s: FlipState) =>
    step.rung === "fromTheAnswer" && shortestAnswer(s)?.only === true,
  fromShortestAnswer: (step: Step, s: FlipState) =>
    step.rung === "fromTheAnswer" && shortestAnswer(s)?.only === false,
  lastPressOfOthers: (step: Step) =>
    step.rung === "lastPress" && outlined(step).length > 0,
  lastPressOfItself: (step: Step) =>
    step.rung === "lastPress" && outlined(step).length === 0,
};

/** Every rung and case of the hint, each pinned on a position that opens with it. */
const pinned = describeHintPins({
  game: G,
  params: PRESETS,
  descOf: (s: FlipState) =>
    `${encodeBitmap(s.matrix, s.matrix.length)},${encodeBitmap(s.grid, s.grid.length)}`,
  kinds: KINDS,
  pins: {
    /** Held on 211 of 494 positions walked. */
    lastChanceOfOne: "3x3c:d074191345d1644c17058,f68",
    /** Held on 57 of 494 positions walked. */
    lastChanceOfTwo: "3x3c:d074191345d1644c17058,0e0",
    /** Held on 2 of 494 positions walked: only a Random board has a square
     * whose every flip is a unlit square's last. */
    lastChanceFlippingNoMore:
      "4x4r:c800e000710032008cc0c600131033000cc80ce801370031008c004e00070033,33f4",
    /** Held on 43 of 494 positions walked. */
    fromOnlyAnswer: "3x3c:d074191345d1644c17058,1e8",
    /** Held on 109 of 494 positions walked. */
    fromShortestAnswer:
      "4x4c:c800e400720031008c804e402720131008c804e402720131008c004e00270013,f1a1",
    /** Held on 72 of 494 positions walked: once a board. */
    lastPressOfOthers: "3x3c:d074191345d1644c17058,058",
    /** Held on 0 of 494 positions walked: it takes a square that flips only
     * itself, so the board is built by hand, each square flipping itself
     * alone and the first one unlit. */
    lastPressOfItself: "3x3r:802008020080200802008,800",
    lastPress: "3x3c:d074191345d1644c17058,058",
    lastChance: "3x3c:d074191345d1644c17058,f68",
    fromTheAnswer: "3x3c:d074191345d1644c17058,1e8",
  },
});

describe("Flip hint sentences", () => {
  for (const kind of Object.keys(KINDS) as (keyof typeof KINDS)[]) {
    it(`${kind}: draws what it says`, () => {
      const { state, step } = pinned(kind);
      expect(bindingDefects(G, state, G.newUi(state), step)).toEqual([]);
    });
  }
});

/** The squares `i` flips. */
function flippedBy(s: FlipState, i: number): number[] {
  const wh = s.w * s.h;
  const out: number[] = [];
  for (let j = 0; j < wh; j++) if (s.matrix[i * wh + j]) out.push(j);
  return out;
}

/** The last square in reading order that flips `j`. */
function lastToFlip(s: FlipState, j: number): number {
  const wh = s.w * s.h;
  for (let i = wh - 1; i >= 0; i--) if (s.matrix[i * wh + j]) return i;
  return -1;
}

/** The fewest presses that light `s`, by trying every set of squares. */
function fewestByTrying(s: FlipState): number {
  const wh = s.w * s.h;
  let best = wh + 1;
  for (let set = 0; set < 1 << wh; set++) {
    const grid = s.grid.slice();
    let size = 0;
    for (let i = 0; i < wh; i++) {
      if (!(set & (1 << i))) continue;
      size++;
      for (const j of flippedBy(s, i)) grid[j] ^= 1;
    }
    if (size < best && grid.every((v) => v === 0)) best = size;
  }
  return best;
}

describe("Flip hint plan", () => {
  it("is as short as any set of presses, on boards small enough to try them all", () => {
    const small = PRESETS.filter((p) => p.w * p.h <= 9);
    expect(small.length).toBe(2);
    for (const params of small) {
      for (let n = 0; n < 8; n++) {
        const { desc } = G.newDesc(params, randomNew(`flip-short-${n}`));
        const s = G.newState(params, desc);
        const plan = hint(s);
        if (!plan.ok) throw new Error(plan.error);
        expect(plan.steps.length).toBe(fewestByTrying(s));
      }
    }
  });

  it("every step's claim holds, and the plan is the same plan after each press", () => {
    let forced = 0;
    let supplied = 0;
    let finishing = 0;
    let striping = 0;
    for (const params of PRESETS) {
      for (let n = 0; n < 6; n++) {
        const { desc } = G.newDesc(params, randomNew(`flip-plan-${n}`));
        let s = G.newState(params, desc);
        // Read off the matrix here, not taken from the hint.
        const last = Array.from({ length: s.w * s.h }, (_, j) => lastToFlip(s, j));
        const first = hint(s);
        if (!first.ok) throw new Error(first.error);
        let plan = first.steps;
        while (plan.length > 0) {
          const [step, ...rest] = plan;
          if (step.move.kind !== "flip") throw new Error("a hint only presses");
          const at = step.move.y * s.w + step.move.x;
          const width = s.w;
          const cells = (ps: readonly { x: number; y: number }[]): number[] =>
            ps.map((p) => p.y * width + p.x).sort((a, b) => a - b);
          const owed = cells(outlined(step));
          const also = cells(striped(step));
          const others = flippedBy(s, at).filter((j) => j !== at);
          if (rest.length === 0) {
            finishing++;
            // The last press: the outline is every unlit square but its own,
            // and it flips them all.
            expect(step.explanation).toMatch(/finishes the board\.$/);
            const unlit = [...s.grid.keys()].filter((j) => s.grid[j] && j !== at);
            expect(owed).toEqual(unlit);
            for (const j of owed) expect(others).toContain(j);
            expect(also).toEqual([]);
          } else if (owed.length > 0) {
            forced++;
            // Unlit, and nothing after this square flips them.
            for (const j of owed) {
              expect(s.grid[j]).toBe(1);
              expect(last[j]).toBe(at);
            }
            // Every square the press flips is marked: outlined, striped, or
            // the ringed square itself.
            if (also.length > 0) striping++;
            expect(also).toEqual(others.filter((j) => !owed.includes(j)));
          } else {
            supplied++;
            expect(step.explanation).toMatch(/One of them: press/);
            // Every square it flips has a later square that flips it too.
            for (const j of flippedBy(s, at)) expect(last[j]).toBeGreaterThan(at);
            // The count it says is the presses left, which the walk's end
            // holds to solving the board.
            expect(step.explanation).toContain(` ${plan.length} presses`);
            expect(also).toEqual([]);
          }
          s = G.executeMove(s, step.move);
          if (rest.length === 0) break;
          const again = hint(s);
          if (!again.ok) throw new Error(again.error);
          expect(again.steps.map((t) => [t.move, t.explanation])).toEqual(
            rest.map((t) => [t.move, t.explanation]),
          );
          plan = again.steps;
        }
        expect(G.status(s)).toBe("solved");
      }
    }
    // Vacuity: every kind of step was walked.
    expect(forced).toBeGreaterThan(50);
    expect(striping).toBeGreaterThan(50);
    expect(supplied).toBeGreaterThan(20);
    expect(finishing).toBe(PRESETS.length * 6);
  });

  it("keeps a plan only through the press it asks for", () => {
    const { state, step } = pinned("lastChance");
    if (step.move.kind !== "flip") throw new Error("a hint only presses");
    expect(hintKeepTrack(step.move, step, state)).toBe("completed");
    const other: FlipMove = { ...step.move, x: (step.move.x + 1) % state.w };
    expect(hintKeepTrack(other, step, state)).toBe("off");
  });

  it("says a board no presses light cannot be worked out", () => {
    const state: FlipState = {
      w: 2,
      h: 2,
      matrix: new Uint8Array(16),
      grid: Uint8Array.from([1, 0, 0, 0]),
      moves: 0,
    };
    expect(hint(state)).toEqual({ ok: false, error: PUZZLE_NOT_REASONABLE });
  });
});

describe("Flip hint frame", () => {
  it("rings the square to press, outlines the unlit squares it is for and stripes the rest it flips", () => {
    const { id, step } = pinned("lastChanceOfTwo");
    const result = renderScenario({ game: G, id, showHint: true });
    expect(result.hint?.explanation).toBe(step.explanation);
    const ops = result.recording.ops;
    expectRing(ops, COL_HINT);
    // Two outlined squares, as one contour or two rings: six to eight sides.
    const sides = markSides(ops, COL_HINT_CELL).length;
    expect(sides).toBeGreaterThanOrEqual(6);
    expect(sides).toBeLessThanOrEqual(8);
    // One hatch a striped square, in the press's color.
    const hatched = ops.filter((o) => o.op === "hatch");
    expect(striped(step).length).toBeGreaterThan(0);
    expect(hatched.length).toBe(striped(step).length);
    expect(hatched.every((o) => o.color === COL_HINT)).toBe(true);
    expect(ops).toMatchSnapshot();
  });

  it("draws no mark without a hint", () => {
    const result = renderScenario({ game: G, id: pinned("lastChance").id });
    const ops = result.recording.ops;
    expect(markSides(ops, COL_HINT)).toEqual([]);
    expect(markSides(ops, COL_HINT_CELL)).toEqual([]);
  });
});
