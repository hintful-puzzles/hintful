/**
 * Rectangles' hint: each rung pinned on a board where it fires, the gate that
 * deals only boards the rungs finish, keep-track, and the frame a step paints.
 */
import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { newDesc } from "./generator.ts";
import {
  moveOf,
  nextFiring,
  type RectFiring,
  type RectHint,
  rectHint,
  rectKeepTrack,
  rungsFinish,
} from "./hint.ts";
import { rectGame } from "./index.ts";
import { executeMove, isSolved, newState } from "./moves.ts";
import { COL_HINT, COL_HINT_CELL } from "./render.ts";
import type { RectMove, RectParams, RectState } from "./state.ts";

const params = (w: number, h: number, unique = true, expandfactor = 0): RectParams => ({
  w,
  h,
  expandfactor,
  unique,
});
const P7 = params(7, 7);

/** The first firing of `kind` on the plan from the board `desc` sets up. */
function firstOf(p: RectParams, desc: string, kind: RectFiring["kind"]) {
  let s = newState(p, desc);
  for (let k = 0; k < 500 && !isSolved(s); k++) {
    const f = nextFiring(s);
    if (!f) break;
    if (f.kind === kind) return { s, f };
    s = executeMove(s, moveOf(f));
  }
  return null;
}

describe("rect hint rungs", () => {
  // Each desc is the input the rung consumes, found by a seed scan and pinned
  // as a board rather than a seed, so a generator change cannot quietly stop
  // producing it.
  const pins: [RectFiring["kind"], RectParams, string, RegExp][] = [
    [
      "fit",
      P7,
      "2j8_4b2b4a4d3b6j6b6b2b2",
      /^Only this rectangle fits the \d+: any other would/,
    ],
    [
      "reach",
      P7,
      "b2_2a2f4a6b3b2c6c2_2b6_2a3d2c3b2a",
      /^No other clue can reach the outlined square/,
    ],
    [
      "overlap",
      P7,
      "5e2a4b2a2e5a2b4a6a2_2j5_2a3c3a",
      /^Wherever the outlined \d+ goes, it covers the striped square/,
    ],
    [
      "starve",
      P7,
      "b6f4d3_2_2_2d2c4c3d3_3b3e4_2a6",
      /^Anywhere else, the \d+ would leave the outlined/,
    ],
    [
      "line",
      params(7, 7, false),
      "a2c3a2_2b2f5_2_3b3a4b2_3h3b6_4c3b",
      /^No rectangle can cover both the outlined squares, so this edge between them must be a line\.$/,
    ],
  ];
  for (const [kind, p, desc, words] of pins)
    it(`${kind} fires and says why`, () => {
      const hit = firstOf(p, desc, kind);
      expect(hit, `${kind} never fires on ${desc}`).not.toBeNull();
      if (!hit) return;
      const res = rectHint(hit.s);
      if (!res.ok) throw new Error(res.error);
      expect(res.steps[0].explanation).toMatch(words);
    });

  it("a 1 is its own rectangle", () => {
    const p = params(2, 1);
    const res = rectHint(newState(p, "1_1"));
    if (!res.ok) throw new Error(res.error);
    expect(res.steps[0].explanation).toBe(
      "A 1 needs no other square, so this square is its whole rectangle.",
    );
  });
});

describe("rect hint plan", () => {
  it("finishes every board the generator deals", () => {
    let boards = 0;
    for (const n of [7, 11])
      for (let seed = 0; seed < 4; seed++) {
        const p = params(n, n);
        const { desc } = newDesc(p, randomNew(`rect-hint-plan-${n}-${seed}`));
        let s: RectState = newState(p, desc);
        const res = rectHint(s);
        if (!res.ok) throw new Error(`${n}x${n}:${desc}: ${res.error}`);
        for (const step of res.steps) s = executeMove(s, step.move);
        expect(isSolved(s), `${n}x${n}:${desc}`).toBe(true);
        boards++;
      }
    expect(boards).toBe(8);
  });

  it("the gate turns away a board the rungs cannot finish", () => {
    // The retired C fixture at 10x10e0.5 (rect-differential.test.ts): uniquely solvable,
    // but past the rungs, so the generator deals again instead.
    const p = params(10, 10, true, 0.5);
    expect(rungsFinish(newState(p, "a3c4b3g2_3f16_12n4i4c5b3g21m8h4a4e4c"))).toBe(
      false,
    );
    expect(rungsFinish(newState(P7, "2j8_4b2b4a4d3b6j6b6b2b2"))).toBe(true);
  });
});

describe("rect hint keep-track", () => {
  const s = newState(P7, "2j8_4b2b4a4d3b6j6b6b2b2");
  const res = rectHint(s);
  if (!res.ok) throw new Error(res.error);
  const step = res.steps.find((t) => t.move.type === "rect" && t.move.w * t.move.h > 1);
  if (!step || step.move.type !== "rect") throw new Error("no rectangle step");
  const r = step.move;

  it("drawing the rectangle completes the step", () => {
    expect(rectKeepTrack({ ...r }, step, s)).toBe("completed");
  });

  it("drawing one of its sides is on track", () => {
    const side: RectMove =
      r.x > 0
        ? { type: "edge", edge: "v", x: r.x, y: r.y }
        : r.x + r.w < s.w
          ? { type: "edge", edge: "v", x: r.x + r.w, y: r.y }
          : r.y > 0
            ? { type: "edge", edge: "h", x: r.x, y: r.y }
            : { type: "edge", edge: "h", x: r.x, y: r.y + r.h };
    expect(rectKeepTrack(side, step, s)).toBe("onTrack");
  });

  it("drawn a side at a time, the last side completes it", () => {
    const planned = executeMove(s, step.move);
    const sides: RectMove[] = [];
    for (let y = 0; y < s.h; y++)
      for (let x = 0; x < s.w; x++) {
        const i = y * s.w + x;
        if (planned.hedge[i] !== s.hedge[i])
          sides.push({ type: "edge", edge: "h", x, y });
        if (planned.vedge[i] !== s.vedge[i])
          sides.push({ type: "edge", edge: "v", x, y });
      }
    expect(sides.length).toBeGreaterThan(1);
    let t = s;
    const verdicts = sides.map((m) => {
      const v = rectKeepTrack(m, step, t);
      t = executeMove(t, m);
      return v;
    });
    expect(verdicts).toEqual([...sides.slice(1).map(() => "onTrack"), "completed"]);
  });

  it("a line inside it goes off the plan", () => {
    const inside: RectMove =
      r.w > 1
        ? { type: "edge", edge: "v", x: r.x + 1, y: r.y }
        : { type: "edge", edge: "h", x: r.x, y: r.y + 1 };
    expect(rectKeepTrack(inside, step, s)).toBe("off");
  });
});

describe("rect hint frame", () => {
  it("rings the rectangle as one contour and outlines the clue that blocks it", () => {
    const hintUntil = (t: HintStep<RectMove>) =>
      /take in the outlined clue/.test(t.explanation);
    const result = renderScenario({
      game: rectGame,
      id: `7x7:2j8_4b2b4a4d3b6j6b6b2b2`,
      showHint: true,
      hintUntil,
    });
    const step = result.hint as HintStep<RectMove, RectHint> | undefined;
    expect(step && hintUntil(step)).toBe(true);
    if (!step || step.move.type !== "rect") throw new Error("not a rectangle step");
    const { w, h } = step.move;
    const ops = result.recording.ops;
    // One side per square on the rectangle's edge: 2(w + h), not a ring per
    // square (4wh).
    const ring = ops.filter((o) => o.op === "rect" && o.color === COL_HINT);
    expect(ring.length).toBe(2 * (w + h));
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HINT_CELL)).toBe(true);
    expect(ops).toMatchSnapshot();
  });

  it("stripes the squares another clue is sure to cover, one hatch per square", () => {
    const hintUntil = (t: HintStep<RectMove>) => /^Wherever/.test(t.explanation);
    const result = renderScenario({
      game: rectGame,
      id: "7x7:5e2a4b2a2e5a2b4a6a2_2j5_2a3c3a",
      showHint: true,
      hintUntil,
    });
    const step = result.hint;
    expect(step && hintUntil(step)).toBe(true);
    const striped = step ? stepMarks(step).of("stripes", CELL) : [];
    expect(striped.length).toBeGreaterThan(0);
    const hatches = result.recording.ops.filter((o) => o.op === "hatch");
    expect(hatches.length).toBe(striped.length);
  });
});
