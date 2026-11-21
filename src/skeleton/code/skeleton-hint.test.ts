/**
 * Skeleton's hint: a pinned position and its sentence for every rung, the
 * walk over every code that shows a followed plan never runs out of rows,
 * and the test that the plan reads the scores and never the code.
 *
 * `npm run hint-scan -- <this file>` writes the pins
 * (docs/testing.md § "Pinning a hint's positions").
 */
import { describe, expect, it } from "vitest";
import { stepMarks } from "../../engine/contract/hint-words.ts";
import type { AnyGame } from "../../engine/testing/enrollment.ts";
import { bindingDefects } from "../../engine/testing/hint-binding.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing } from "../../engine/testing/mark-shape.ts";
import { walkHint } from "../../engine/testing/plan-walk.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { codesFitting } from "./hint.ts";
import { DIGIT, SQUARE } from "./hint-marks.ts";
import { skeletonGame } from "./index.ts";
import {
  encodeDesc,
  menu,
  newState,
  type SkeletonParams,
  type SkeletonState,
} from "./state.ts";

const pinned = describeHintPins({
  game: skeletonGame,
  params: [...menu.boards],
  pins: {
    /** Held on 74 of 183 positions walked. */
    absent: { id: "3s6g7:7e2529", moves: [{ type: "guess", digits: [1, 2, 3] }] },
    /** Held on 32 of 183 positions walked. */
    onlyAnswer: { id: "3s6g7:d64024", moves: [{ type: "guess", digits: [1, 2, 3] }] },
    /** Held on 36 of 183 positions walked. */
    opening: "3s6g7:7e2529",
    /** Held on 115 of 183 positions walked. */
    probe: { id: "4s6g7:7ee4710e", moves: [{ type: "guess", digits: [1, 2, 3, 4] }] },
  },
});

/** Every code of a board: its digits all different. */
function* codes(p: SkeletonParams, cur: number[] = []): Generator<number[]> {
  if (cur.length === p.len) {
    yield cur.slice();
    return;
  }
  for (let d = 1; d <= p.nsymbols; d++)
    if (!cur.includes(d)) yield* codes(p, [...cur, d]);
}

/** Play every step of every plan from `state` until the game ends, calling
 * `at` on each position asked. */
function follow(state: SkeletonState, at: (s: SkeletonState) => void = () => {}) {
  return walkHint(skeletonGame, state, {
    // Far more plans than any code takes; reaching it is a plan that stalls.
    asks: 100,
    limit: "throw",
    done: (s) => skeletonGame.status(s) !== "ongoing",
    asked: at,
  }).state;
}

describe("skeleton hint plans", () => {
  it.each(
    menu.boards,
  )("find every code of $len digits from $nsymbols within $nguesses rows", (p) => {
    let walked = 0;
    for (const code of codes(p)) {
      const end = follow(newState(p, encodeDesc(code)));
      expect(skeletonGame.status(end), code.join("")).toBe("solved");
      walked++;
    }
    expect(walked).toBeGreaterThan(100);
  });

  it("read the scores and never the code", () => {
    // At every position of every walk on the smallest preset, each code that
    // fits the scores so far is given the same plan.
    const p = menu.boards[0];
    const plan = (s: SkeletonState) =>
      JSON.stringify(skeletonGame.hint.plan(s), (k, v) =>
        k === "words" ? undefined : v,
      );
    let compared = 0;
    for (const code of codes(p)) {
      follow(newState(p, encodeDesc(code)), (s) => {
        const want = plan(s);
        for (const other of codesFitting(s)) {
          if (other.join("") === code.join("")) continue;
          expect(plan({ ...s, code: other })).toBe(want);
          compared++;
        }
      });
    }
    expect(compared).toBeGreaterThan(1000);
  });

  it("name exactly the marks they draw, at every step of every walk", () => {
    // What hint-quality.test.ts asks of a registered game, asked here of the
    // skeleton, which is not one: every digit gets ringed somewhere, and a
    // narrow one leaves a ring least room.
    const p = menu.boards[0];
    const defects = new Set<string>();
    let steps = 0;
    for (const code of codes(p)) {
      follow(newState(p, encodeDesc(code)), (s) => {
        const result = skeletonGame.hint.plan(s);
        if (!result?.ok) return;
        for (const step of result.steps) {
          steps++;
          const ui = skeletonGame.newUi(s);
          for (const d of bindingDefects(skeletonGame as AnyGame, s, ui, step))
            defects.add(`${step.rung}: ${d}`);
        }
      });
    }
    expect([...defects]).toEqual([]);
    expect(steps).toBeGreaterThan(300);
  });

  it("a mark step frames exactly the digits its move rules out", () => {
    const { step } = pinned("absent");
    if (step.move.type !== "mark") throw new Error("an absent step marks");
    expect(stepMarks(step).of("ring", DIGIT)).toEqual(step.move.marks);
  });

  it("a move that makes part of a mark step keeps it, and another drops it", () => {
    const { state, step } = pinned("absent");
    if (step.move.type !== "mark") throw new Error("an absent step marks");
    const [first, ...rest] = step.move.marks;
    const part = skeletonGame.hint.keepTrack(
      { type: "mark", marks: [first], ruledOut: true },
      step,
      state,
    );
    expect(part).toBe(rest.length === 0 ? "completed" : "onTrack");
    // A digit of the same slot the step does not rule out.
    const asked = (v: number) =>
      step.move.type === "mark" &&
      step.move.marks.some((m) => m.pos === first.pos && m.value === v);
    const value = [1, 2, 3, 4, 5, 6].find((v) => !asked(v)) ?? 0;
    const other = { pos: first.pos, value };
    expect(
      skeletonGame.hint.keepTrack(
        { type: "mark", marks: [other], ruledOut: true },
        step,
        state,
      ),
    ).toBe("off");
  });
});

describe("skeleton hint frame", () => {
  it("rings each digit an absent step rules out, and the working row's squares of a probe", () => {
    for (const kind of ["absent", "probe"] as const) {
      const { recording, step } = renderPinnedHint(skeletonGame, pinned(kind));
      const rings =
        stepMarks(step).of("ring", DIGIT).length +
        stepMarks(step).of("ring", SQUARE).length;
      expectRing(recording.ops, { rings });
    }
  });
});
