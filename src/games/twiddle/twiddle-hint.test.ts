/**
 * Twiddle's hint (`add-twiddle-hint`): the planner finishes every board it
 * is asked from, a hint recomputed after every turn arrives, and each rung is
 * pinned by a position it speaks on.
 */

import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { expectRing, ringsOf } from "../../engine/testing/mark-shape.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import { renderPinnedHint } from "../../engine/testing/render-scenario.ts";
import { seedBudget } from "../../engine/testing/slow.ts";
import { hint } from "./hint.ts";
import { executeMove, twiddleGame } from "./index.ts";
import { COL_HINT_EVIDENCE, coord, PREFERRED_TILE_SIZE } from "./render.ts";
import {
  encodeDesc,
  newDesc,
  newState,
  status,
  type TwiddleParams,
  type TwiddleState,
} from "./state.ts";

const G = twiddleGame;

const presetParams: TwiddleParams[] = leafPresets(G).map((p) => p.params);

/** Shapes no preset deals: oblong, the block as wide or as tall as the board,
 * orientation on a larger board and with an odd block, rows-only at a size
 * the preset does not have, and a short shuffle. */
const customParams: TwiddleParams[] = [
  "5x3",
  "3x5n3",
  "5x3n3",
  "3n3",
  "4o",
  "4n3o",
  "5n3o",
  "4r",
  "5x4n3",
  "3m5",
].map((s) => G.decodeParams(s));

/** Ask, play the first turn, throw the plan away, ask again: the walk that
 * sees a plan undo its own last turn. Returns the turns it took. */
function walk(state: TwiddleState): number {
  let s = state;
  for (let turns = 0; turns < 2000; turns++) {
    if (status(s) === "solved") return turns;
    const res = hint(s);
    if (!res.ok) throw new Error(`refused after ${turns} turns: ${res.error}`);
    s = executeMove(s, res.steps[0].move);
  }
  throw new Error("did not arrive within 2000 turns");
}

/**
 * Boards walked per shape: one, and three in the slow tier. A refusal comes
 * of the turn library built for the shape, which every board of the shape
 * uses, and a plan that undoes its own last turn is asked about at every
 * position one board's walk passes through, a few hundred of them; the
 * shapes are what vary the library.
 */
const WALKED = ["a", "b", "c"].slice(0, seedBudget(1, 3));

describe("a hint recomputed after every turn arrives", () => {
  for (const p of [...presetParams, ...customParams]) {
    const name = G.encodeParams(p, true);
    it(`${name}: dealt boards, no refusal`, () => {
      for (const seed of WALKED) {
        const s = newState(p, newDesc(p, randomNew(`${name}${seed}`)).desc);
        expect(walk(s)).toBeGreaterThan(0);
      }
    });
  }
});

describe("following one plan whole solves the board", () => {
  for (const p of presetParams) {
    const name = G.encodeParams(p, true);
    it(name, () => {
      const s0 = newState(p, newDesc(p, randomNew(`whole ${name}`)).desc);
      const res = hint(s0);
      if (!res.ok) throw new Error(res.error);
      const end = res.steps.reduce((s, step) => executeMove(s, step.move), s0);
      expect(status(end)).toBe("solved");
    });
  }
});

describe("a run's later turns say they continue it", () => {
  it("every step after a run's first is flagged, and a run ends with its tile in place", () => {
    const p = G.decodeParams("4n3");
    const s0 = newState(p, newDesc(p, randomNew("runs")).desc);
    const res = hint(s0);
    if (!res.ok) throw new Error(res.error);
    let runs = 0;
    res.steps.forEach((step, i) => {
      const next = res.steps[i + 1];
      if (step.rung === "run" && !step.continuesPrevious) runs++;
      if (next?.continuesPrevious) expect(next.rung).toBe(step.rung);
    });
    expect(runs).toBeGreaterThan(0);
  });
});

const pinned = describeHintPins({
  game: G,
  params: [presetParams[0], presetParams[1], presetParams[2], presetParams[4]],
  seeds: 12,
  descOf: (s: TwiddleState) => encodeDesc(s.numbers, s.orient, s.w * s.h, s.orientable),
  pins: {
    /** Held on 187 of 1378 positions walked. */
    home: "3x3n2r:2,1,1,2,3,2,3,1,3",
    /** Held on 144 of 1378 positions walked. */
    carry: "3x3n2r:3,2,1,2,1,3,3,1,2",
    /** Held on 777 of 1378 positions walked. */
    run: "3x3n2o:2r6u8l3l4l7r1u9l5d",
    /** Held on 1221 of 1378 positions walked. */
    fill: "3x3n2r:1,3,1,1,2,3,2,2,3",
  },
});

describe("the frames a hint draws", () => {
  it("rings the block's pivot round the turn's arrow, and outlines the tile it serves", () => {
    const pin = pinned("run");
    const { recording } = renderPinnedHint(G, pin);
    const s = pin.state;
    const bands = (color: number) =>
      recording.ops.filter((o) => o.op === "rect" && o.color === color).length;
    // One ring, on the pivot at the block's middle.
    expectRing(recording.ops);
    const [ring] = ringsOf(recording.ops);
    const move = pin.step.move;
    if (move.type !== "rotate") throw new Error("not a turn");
    const ts = PREFERRED_TILE_SIZE;
    const middle = (k: number) => coord(k, ts) + (s.n * ts) / 2;
    const cx = ring.x + ring.w / 2;
    expect(Math.abs(cx - middle(move.x))).toBeLessThanOrEqual(1);
    expect(Math.abs(ring.y + ring.h / 2 - middle(move.y))).toBeLessThanOrEqual(1);
    expect(ring.w).toBeLessThan(ts);
    // Inside it, in its ink, the arrow's arc and then its head, which comes
    // down the right side into the gap at the bottom for a clockwise turn.
    const arrow = recording.ops.filter(
      (o) => o.op === "polygon" && o.fill === ring.color,
    );
    expect(arrow).toHaveLength(2);
    const head = arrow[1];
    if (head.op !== "polygon") throw new Error("not a polygon");
    const headX = head.points.reduce((t, [x]) => t + x, 0) / head.points.length;
    expect(headX > cx).toBe(move.dir === -1);
    // Four sides round one tile.
    expect(bands(COL_HINT_EVIDENCE)).toBe(4);
    expect(recording.ops).toMatchSnapshot();
  });
});
