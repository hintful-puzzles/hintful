/**
 * Rectangles' hint: each rung pinned on a board where it fires, the gate that
 * deals only boards the rungs finish, keep-track, and the frame a step paints.
 */
import { describe, expect, it } from "vitest";
import { DIFF_EASY, DIFF_UNREASONABLE } from "../../engine/answer-search.ts";
import { CELL, stepMarks } from "../../engine/hint-words.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { newDesc } from "./generator.ts";
import {
  type Crossing,
  moveOf,
  nextFiring,
  RECT_RUNGS,
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
  diff: DIFF_EASY,
});
const P7 = params(7, 7);

/** The one clue with fits across the edge a line step opens with, when there
 * is just one. */
function soleCrossing(state: RectState): Crossing | null {
  const f = nextFiring(state);
  return f?.kind === "line" && f.across.length === 1 ? f.across[0] : null;
}

/** Each rung, the two reasons a line has (the fit across the edge takes a
 * square another clue is sure of, or misses one no other clue reaches) and the
 * shapes of step the keep-track and frame tests read. */
const pinned = describeHintPins({
  game: rectGame,
  params: [P7, params(9, 9), params(10, 10, 0.5)],
  seeds: 400,
  kinds: {
    lineTakes: (step, state) => {
      const c = soleCrossing(state);
      return (
        step.rung === "line" &&
        c !== null &&
        c.misses.length === 0 &&
        c.owners.length === 1
      );
    },
    lineMisses: (step, state) => {
      const c = soleCrossing(state);
      return step.rung === "line" && c !== null && c.takes.length === 0;
    },
    rectangle: (step) => step.move.type === "rect" && step.move.w * step.move.h > 1,
    // A fit outlines only the clues its other rectangles would take in.
    blockedByClue: (step) =>
      step.rung === "fit" && stepMarks(step).of("outline", CELL).length > 0,
  },
  pins: {
    /** Held on 5 of 14936 positions walked. */
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
    /** Held on 14612 of 14936 positions walked. */
    fit: "7x7:c4b3a2a3c6e4k4a4_3_4a4a3e5b",
    /** Held on 8702 of 14936 positions walked. */
    reach: "7x7:e4a4a3g3_3_2a3b8d3d4d4c6c2a",
    /** Held on 669 of 14936 positions walked. */
    overlap: "10x10e0.5:h6b12e3f6f18h8m18b15za7h7e",
    /** Held on 339 of 14936 positions walked. */
    starve: "7x7:b8b2f3c4d4a2a2a5_3b3d2a2_4d3c2",
    /** Held on 35 of 14936 positions walked. */
    line: {
      id: "9x9:e8c6b4d2b2c5d2e4b2c6c8l8a2_3_3a8b8l",
      moves: [{ type: "rect", erasing: false, x: 0, y: 6, w: 1, h: 3 }],
    },
  },
});

describe("rect hint rungs", () => {
  for (const rung of RECT_RUNGS)
    it(`a ${rung} step is the solver's ${rung} firing`, () => {
      // The firing the step was built from, on the board as its turn comes.
      const { state, steps, index } = pinned(rung);
      let s = state;
      for (const earlier of steps.slice(0, index)) s = executeMove(s, earlier.move);
      const f = nextFiring(s);
      expect(f?.kind).toBe(rung);
      if (f) expect(moveOf(f)).toEqual(steps[index].move);
    });

  it("a plan's every step is the firing its board gives when read afresh", () => {
    // A plan reads each clue's fits once and takes away the ones each step's
    // lines cross. `nextFiring` on a board alone reads them all again.
    const rungs = new Set<string>();
    for (const diff of [DIFF_EASY, DIFF_UNREASONABLE])
      for (let seed = 0; seed < 6; seed++) {
        const p = { ...params(9, 9, seed % 2), diff };
        let s = newState(p, newDesc(p, randomNew(`afresh-${seed}`)).desc);
        const plan = rectHint(s);
        // An Unreasonable board can be one the rungs have nothing to say of.
        for (const step of plan.ok ? plan.steps : []) {
          const f = nextFiring(s);
          expect(f && moveOf(f)).toEqual(step.move);
          if (step.rung) rungs.add(step.rung);
          s = executeMove(s, step.move);
        }
        expect(isSolved(s) || nextFiring(s) === null).toBe(true);
      }
    expect([...rungs].sort()).toEqual([...RECT_RUNGS].sort());
  });

  it("a line says which of its two reasons rules the crossing out", () => {
    expect(pinned("lineTakes").step.explanation).toMatch(
      /^Only the outlined \d+ could cross this edge, and it would take the striped square, which the outlined \d+ covers wherever it goes, so the edge must be a line\.$/,
    );
    expect(pinned("lineMisses").step.explanation).toMatch(
      /^Only the outlined \d+ could cross this edge, and it would miss the outlined square, which no other clue reaches, so the edge must be a line\.$/,
    );
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
    // A board the solver settles (`rect.test.ts` pins that it opens as
    // Unreasonable) by ruling fits out over several rounds, none of which
    // leaves an edge no fit crosses, so no line can record them and the
    // generator, dealing an Easy board, deals again.
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
    const result = renderPinnedHint(rectGame, pinned("blockedByClue"));
    const { step } = result;
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
    const result = renderPinnedHint(rectGame, pinned("overlap"));
    const { step } = result;
    const striped = stepMarks(step).of("stripes", CELL);
    expect(striped.length).toBeGreaterThan(0);
    const hatches = result.recording.ops.filter((o) => o.op === "hatch");
    expect(hatches.length).toBe(striped.length);
  });
});
