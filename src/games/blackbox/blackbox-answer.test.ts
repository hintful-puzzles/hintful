/**
 * Black Box plays only boards with one answer: the count of answers agrees
 * with trying every layout, every dealt board has one, a game ID with several
 * does not load, and the check frames the marks no finish could keep.
 */

import { describe, expect, it } from "vitest";
import { DESC_NOT_UNIQUE, loadVerdict, validateDesc } from "../../engine/desc-error.ts";
import { randomNew } from "../../engine/random/index.ts";
import { MULTIPLE_SOLUTIONS } from "../../engine/solve-failure.ts";
import { leafPresets } from "../../engine/testing/presets.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import type { Point } from "../../engine/types.ts";
import { answerCount } from "./answer.ts";
import { blackboxGame as game } from "./index.ts";
import { COL_WRONG } from "./render.ts";
import {
  BALL_CORRECT,
  type BlackboxParams,
  ballLimit,
  encodeBalls,
  gridGet,
  newState,
  scatterDesc,
  traceLaser,
  validateParams,
} from "./state.ts";

/** How many layouts send every laser where `desc`'s balls do, by trying every
 * one: the count with no search in it. */
function everyLayout(p: BlackboxParams, desc: string): number {
  const s = newState(p, desc);
  const real = (x: number, y: number) => (gridGet(s, x, y) & BALL_CORRECT) !== 0;
  const want = Array.from({ length: s.nlasers }, (_, i) =>
    traceLaser(p.w, p.h, i, real),
  );
  let count = 0;
  for (let mask = 0; mask < 1 << (p.w * p.h); mask++) {
    let bits = 0;
    for (let m = mask; m; m &= m - 1) bits++;
    if (bits < p.minballs || bits > p.maxballs) continue;
    const at = (x: number, y: number) =>
      ((mask >> ((y - 1) * p.w + (x - 1))) & 1) === 1;
    let same = true;
    for (let i = 0; i < s.nlasers && same; i++)
      same = traceLaser(p.w, p.h, i, at) === want[i];
    if (same) count++;
  }
  return count;
}

/** Four balls on the corners of a 3×3 box hide its middle from every laser. */
const HIDDEN_MIDDLE: BlackboxParams = { w: 3, h: 3, minballs: 4, maxballs: 5 };
const CORNERS = encodeBalls(HIDDEN_MIDDLE, [
  { x: 0, y: 0 },
  { x: 2, y: 0 },
  { x: 0, y: 2 },
  { x: 2, y: 2 },
]);

describe("Black Box's answer", () => {
  it("is counted as trying every layout counts it", () => {
    let one = 0;
    let several = 0;
    for (const p of [
      { w: 4, h: 4, minballs: 1, maxballs: 6 },
      { w: 4, h: 3, minballs: 3, maxballs: 3 },
    ])
      for (let i = 0; i < 40; i++) {
        const { desc } = scatterDesc(p, randomNew(`answer-${i}`));
        const n = everyLayout(p, desc);
        expect(answerCount(newState(p, desc)), desc).toBe(Math.min(n, 2));
        if (n === 1) one++;
        else several++;
      }
    // Both kinds of board, or the agreement says nothing.
    expect(one).toBeGreaterThan(10);
    expect(several).toBeGreaterThan(10);
  });

  it("is one on every board dealt", () => {
    let dealt = 0;
    for (const { params } of leafPresets(game))
      for (const seed of ["a", "b", "c"]) {
        const { desc } = game.newDesc(params, randomNew(`one-${seed}`));
        expect(answerCount(newState(params, desc)), desc).toBe(1);
        dealt++;
      }
    expect(dealt).toBeGreaterThanOrEqual(15);
  });

  it("limits the balls a deal holds, and never a game ID's", () => {
    const p = { w: 8, h: 8, minballs: 5, maxballs: ballLimit(8, 8) + 1 };
    expect(validateParams(p, true)).toMatch(/at most 20 balls\.$/);
    expect(validateParams(p, false)).toBeNull();
    // Every preset deals within the limit.
    for (const { params } of leafPresets(game))
      expect(params.maxballs).toBeLessThanOrEqual(ballLimit(params.w, params.h));
  });

  it("refuses a game ID with several, and Solve has none to show", () => {
    expect(everyLayout(HIDDEN_MIDDLE, CORNERS)).toBe(2);
    expect(loadVerdict(game, HIDDEN_MIDDLE, CORNERS)).toBe(DESC_NOT_UNIQUE);
    // The board itself is well formed: only its answers keep it from loading.
    expect(validateDesc(game, HIDDEN_MIDDLE, CORNERS)).toBeNull();
    const s = newState(HIDDEN_MIDDLE, CORNERS);
    expect(game.solve?.(s, s)).toEqual({ ok: false, error: MULTIPLE_SOLUTIONS });
    // The same balls with the count fixed have one answer, and load.
    const four = { ...HIDDEN_MIDDLE, maxballs: 4 };
    expect(
      loadVerdict(
        game,
        four,
        encodeBalls(four, [
          { x: 0, y: 0 },
          { x: 2, y: 0 },
          { x: 0, y: 2 },
          { x: 2, y: 2 },
        ]),
      ),
    ).toBeNull();
  });
});

describe("Black Box's check", () => {
  const p: BlackboxParams = { w: 5, h: 5, minballs: 3, maxballs: 3 };
  const s0 = () => newState(p, game.newDesc(p, randomNew("check")).desc);
  const square = (s: ReturnType<typeof s0>, ball: boolean): Point => {
    for (let y = 1; y <= p.h; y++)
      for (let x = 1; x <= p.w; x++)
        if (((gridGet(s, x, y) & BALL_CORRECT) !== 0) === ball) return { x, y };
    throw new Error("no such square");
  };

  it("finds a guess on an empty square and a known mark on a ball, and nothing else", () => {
    let s = s0();
    const ball = square(s, true);
    const empty = square(s, false);
    s = game.executeMove(s, { type: "toggleBall", ...ball });
    s = game.executeMove(s, { type: "toggleLock", ...empty });
    expect(game.findMistakes?.(s)).toEqual([]);
    s = game.executeMove(s, { type: "toggleLock", ...ball });
    s = game.executeMove(s, { type: "toggleLock", ...empty });
    s = game.executeMove(s, { type: "toggleBall", ...empty });
    const wrong = game.findMistakes?.(s) ?? [];
    expect(new Set(wrong.map((q) => `${q.x},${q.y}`))).toEqual(
      new Set([`${ball.x},${ball.y}`, `${empty.x},${empty.y}`]),
    );
  });

  it("frames a wrong guess on a board already drawn, and clears it (paint twice)", () => {
    const s = game.executeMove(s0(), { type: "toggleBall", ...square(s0(), false) });
    const palette = game.colors([0.9, 0.9, 0.9]);
    const ui = game.newUi(s);
    const ds = game.newDrawState(s, 32);
    const paint = (mistakes?: readonly Point[]) => {
      const rec = new RecordingDrawing(palette);
      game.redraw(rec, ds, null, s, 0, ui, 0, 0, undefined, mistakes);
      return rec.ops;
    };
    // The corner button repaints every frame; the box's squares only on change.
    paint();
    const settled = paint().length;
    expect(paint().length).toBe(settled);
    const framed = paint(game.findMistakes?.(s));
    expect(framed.some((o) => o.op === "rect" && o.color === COL_WRONG)).toBe(true);
    const cleared = paint();
    expect(cleared.length).toBeGreaterThan(settled);
    expect(cleared.some((o) => "color" in o && o.color === COL_WRONG)).toBe(false);
  });
});
