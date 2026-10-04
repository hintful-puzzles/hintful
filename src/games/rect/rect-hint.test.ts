/**
 * Rectangles' hint: each rung pinned on a board where it fires, the gate that
 * deals only boards the rungs finish, keep-track, and the frame a step paints.
 */
import { describe, expect, it } from "vitest";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { newDesc } from "./generator.ts";
import {
  moveOf,
  nextFiring,
  type RectFiring,
  rectHint,
  rectKeepTrack,
  rungsFinish,
} from "./hint.ts";
import { rectGame } from "./index.ts";
import { executeMove, isSolved, newState } from "./moves.ts";
import { COL_HINT, COL_HINT_CELL } from "./render.ts";
import type { RectMove, RectParams, RectState } from "./state.ts";

const params = (w: number, h: number, expandfactor = 0): RectParams => ({
  w,
  h,
  expandfactor,
});
const P7 = params(7, 7);

/** The sentence each rung says, and the rung the solver fires where it is
 * said. A line has two: the fit across the edge is out for one of two
 * reasons. */
const RUNGS = {
  fit: [/^Elsewhere the \d+ would .*, so only this rectangle fits\.$/, "fit"],
  reach: [/^No other clue can reach the outlined square/, "reach"],
  overlap: [/^Wherever the outlined \d+ goes, it covers the striped square/, "overlap"],
  starve: [/^Anywhere else, the \d+ would leave the outlined/, "starve"],
  lineTakes: [
    /^Only the outlined \d+ could cross this edge, and it would take the striped square, which the outlined \d+ covers wherever it goes, so the edge must be a line\.$/,
    "line",
  ],
  lineMisses: [
    /^Only the outlined \d+ could cross this edge, and it would miss the outlined square, which no other clue reaches, so the edge must be a line\.$/,
    "line",
  ],
} satisfies Record<string, [RegExp, RectFiring["kind"]]>;
type Rung = keyof typeof RUNGS;

/** Each rung's sentence and the shapes of step the keep-track and frame tests
 * read, each pinned on a position whose hint opens with one. */
const pinned = describeHintPins({
  game: rectGame,
  params: [P7, params(9, 9), params(10, 10, 0.5)],
  seeds: 400,
  kinds: {
    fit: RUNGS.fit[0],
    reach: RUNGS.reach[0],
    overlap: RUNGS.overlap[0],
    starve: RUNGS.starve[0],
    lineTakes: RUNGS.lineTakes[0],
    lineMisses: RUNGS.lineMisses[0],
    rectangle: (step) => step.move.type === "rect" && step.move.w * step.move.h > 1,
    blockedByClue: (step) =>
      step.move.type === "rect" && /take in the outlined clue/.test(step.explanation),
  },
  pins: {
    /** Held on 10916 of 14936 positions walked. */
    fit: "7x7:c4b3a2a3c6e4k4a4_3_4a4a3e5b",
    /** Held on 3814 of 14936 positions walked. */
    reach: "7x7:e4a4a3g3_3_2a3b8d3d4d4c6c2a",
    /** Held on 117 of 14936 positions walked. */
    overlap: "10x10e0.5:h6b12e3f6f18h8m18b15za7h7e",
    /** Held on 78 of 14936 positions walked. */
    starve: "7x7:b8b2f3c4d4a2a2a5_3b3d2a2_4d3c2",
    /** Held on 2 of 14936 positions walked. */
    lineTakes: {
      id: "9x9:e8c6b4d2b2c5d2e4b2c6c8l8a2_3_3a8b8l",
      moves:
        '[{"type":"rect","erasing":false,"x":0,"y":6,"w":1,"h":3},{"type":"edge","edge":"h","x":4,"y":2}]',
    },
    /** Held on 2 of 14936 positions walked. */
    lineMisses: {
      id: "10x10e0.5:o4c2a6_10k5c24j6c9u6h6f14d8c",
      moves:
        '[{"type":"rect","erasing":false,"x":0,"y":0,"w":2,"h":3},{"type":"rect","erasing":false,"x":6,"y":0,"w":3,"h":8},{"type":"rect","erasing":false,"x":9,"y":0,"w":1,"h":2},{"type":"rect","erasing":false,"x":9,"y":2,"w":1,"h":6},{"type":"rect","erasing":false,"x":0,"y":3,"w":2,"h":7},{"type":"edge","edge":"v","x":4,"y":1}]',
    },
    /** Held on 14925 of 14936 positions walked. */
    rectangle: "7x7:c4b3a2a3c6e4k4a4_3_4a4a3e5b",
    /** Held on 9533 of 14936 positions walked. */
    blockedByClue: "7x7:c4b3a2a3c6e4k4a4_3_4a4a3e5b",
  },
});

describe("rect hint rungs", () => {
  for (const rung of Object.keys(RUNGS) as Rung[])
    it(`${rung} is said where the solver fires ${RUNGS[rung][1]}`, () => {
      expect(nextFiring(pinned(rung).state)?.kind).toBe(RUNGS[rung][1]);
    });

  it("several clues across one edge share a clause", () => {
    const p = params(15, 15, 1);
    let s = newState(p, "h12e8d15zc6a12k40d24e10zk24ze24k20zl10t20h");
    let f = nextFiring(s);
    while (f && !(f.kind === "line" && f.across.length > 1)) {
      s = executeMove(s, moveOf(f));
      f = nextFiring(s);
    }
    expect(f?.kind).toBe("line");
    const res = rectHint(s);
    if (!res.ok) throw new Error(res.error);
    expect(res.steps[0].explanation).toBe(
      "Only the outlined 12, 24 and 24 could cross this edge, and each would take a striped square, which another outlined clue covers wherever it goes, so the edge must be a line.",
    );
  });

  it("a line cuts a fit: every fit across the edge it draws is gone after it", () => {
    // A line no fit crosses would change nothing a later step reads, so the
    // rung leaves such an edge alone.
    const { state } = pinned("lineTakes");
    const f = nextFiring(state);
    if (f?.kind !== "line") throw new Error("no line");
    expect(f.across.length).toBeGreaterThan(0);
    const before = rectHint(state);
    const after = rectHint(executeMove(state, moveOf(f)));
    if (!before.ok || !after.ok) throw new Error("no plan");
    expect(after.steps.length).toBe(before.steps.length - 1);
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
    // A board the solver settles (`rect.test.ts` pins that loading refuses
    // it) by ruling
    // fits out over several rounds, none of which leaves an edge no fit
    // crosses, so no line can record them and the generator deals again.
    const p = params(9, 9);
    expect(rungsFinish(newState(p, "c4c5b9c12b2h2k12e2f2_3c12a8l3d5d"))).toBe(false);
    expect(rungsFinish(newState(P7, "2j8_4b2b4a4d3b6j6b6b2b2"))).toBe(true);
  });

  it("finishes upstream's 10x10 board, which needs a line", () => {
    const p = params(10, 10, 0.5);
    expect(rungsFinish(newState(p, "a3c4b3g2_3f16_12n4i4c5b3g21m8h4a4e4c"))).toBe(true);
  });
});

describe("rect hint keep-track", () => {
  /** The pinned rectangle step, its board and its move. */
  const rectangle = () => {
    const { state: s, step } = pinned("rectangle");
    if (step.move.type !== "rect") throw new Error("unreachable");
    return { s, step, r: step.move };
  };

  it("drawing the rectangle completes the step", () => {
    const { s, step, r } = rectangle();
    expect(rectKeepTrack({ ...r }, step, s)).toBe("completed");
  });

  it("drawing one of its sides is on track", () => {
    const { s, step, r } = rectangle();
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
    const { s, step } = rectangle();
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
    const { s, step, r } = rectangle();
    const inside: RectMove =
      r.w > 1
        ? { type: "edge", edge: "v", x: r.x + 1, y: r.y }
        : { type: "edge", edge: "h", x: r.x, y: r.y + 1 };
    expect(rectKeepTrack(inside, step, s)).toBe("off");
  });
});

describe("rect hint frame", () => {
  it("rings the rectangle as one contour and outlines the clue that blocks it", () => {
    const { id, moves, step } = pinned("blockedByClue");
    const result = renderScenario({ game: rectGame, id, moves, showHint: true });
    expect(result.hint?.explanation).toBe(step.explanation);
    if (step.move.type !== "rect") throw new Error("unreachable");
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
    const { id, moves, step } = pinned("overlap");
    const result = renderScenario({ game: rectGame, id, moves, showHint: true });
    expect(result.hint?.explanation).toBe(step.explanation);
    const striped = stepMarks(step).of("stripes", CELL);
    expect(striped.length).toBeGreaterThan(0);
    const hatches = result.recording.ops.filter((o) => o.op === "hatch");
    expect(hatches.length).toBe(striped.length);
  });
});
