/**
 * Light Up, born from its description: what only this game's statements
 * decide. The engine's own tests read fill games for the board, the input,
 * the deal and the hint (`engine/fill/*.test.ts`), and the cross-game guards
 * reach it as a registered game. What is left here is a position for every
 * kind of step its hint takes, upstream's IDs read as the right walls, the
 * sizes each tier and symmetry refuses, symmetric walls, the wash a bulb
 * casts and what it hides, and two bulbs that see each other drawn wrong.
 */

import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../../engine/color/roles.ts";
import { describeParams } from "../../engine/game-id/param-label.ts";
import { paramsError } from "../../engine/game-id/params.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { game } from "../../generated/games/lightup/lightup.game.ts";

const BULB = 1;
const CROSS = 2;
const WALL = 3;

/** A position for every kind of step. */
describeHintPins({
  game,
  params: [game.decodeParams("7x7b20s4d0"), game.decodeParams("10x10b20s2d1")],
  pins: {
    /** Held on 238 of 385 positions walked. */
    clueFull: "7x7b20s4d0:e0a3c1cBqBc1c3a1e",
    /** Held on 304 of 385 positions walked. */
    clueExact: "10x10b20s2d1:eBgB2b2b3jBiBa3bBBd3Bb1aBi1j1b1bB1gBe",
    /** Held on 380 of 385 positions walked. */
    square: {
      id: "7x7b20s4d0:bBf1g1aB1b1a2bB1aBg0fBb",
      moves: [{ set: [32, 2, 40, 2, 38, 2] }],
    },
    /** Held on 173 of 385 positions walked. */
    darkSet: {
      id: "10x10b20s2d1:eBb1b1Ba0a1fBh1gBb2a3cBBc2a1bBg2hBfBa2aB2b2b2e",
      moves: [{ set: [4, 2, 15, 2, 24, 2, 13, 2] }, { set: [3, 1] }],
    },
    /** Held on 107 of 385 positions walked. */
    clueSet: {
      id: "10x10b20s2d1:eBb1b1Ba0a1fBh1gBb2a3cBBc2a1bBg2hBfBa2aB2b2b2e",
      moves: [{ set: [4, 2, 15, 2, 24, 2, 13, 2] }, { set: [3, 1] }, { set: [17, 2] }],
    },
  },
});

/** A board from its game ID. */
const loaded = (id: string) => {
  const [params, desc] = id.split(":");
  return game.newState(game.decodeParams(params), desc);
};

describe("lightup", () => {
  it("reads upstream's IDs: a digit a numbered wall, B a bare one, a letter a run", () => {
    const board = loaded("3x4:Ba1f0a0");
    expect(Array.from(board.values)).toEqual([
      WALL,
      0,
      WALL,
      0,
      0,
      0,
      0,
      0,
      0,
      WALL,
      0,
      WALL,
    ]);
    expect(Array.from(board.dealt.number.at)).toEqual([2, 9, 11]);
    expect(Array.from(board.dealt.number.v)).toEqual([1, 0, 0]);
    expect(Array.from(board.dealt.wall.at)).toEqual([0]);
  });

  it("reads its params, and upstream's bare r as Unreasonable", () => {
    for (const id of ["7x7b20s4d0", "10x10b25s0d1", "12x16b20s2d2"])
      expect(game.encodeParams(game.decodeParams(id), true)).toBe(id);
    expect(game.decodeParams("7x7b20s4r").diff).toBe(2);
    expect(game.encodeParams(game.decodeParams("18x10"), true)).toBe("18x10b20s2d0");
  });

  it("labels walls and symmetry only where they are not the board's usual", () => {
    const label = (s: string) => describeParams(game, game.decodeParams(s));
    expect(label("7x7b30s0d0")).toBe("7x7 Easy, 30% walls, no symmetry");
    expect(label("7x7b20s4d0")).toBe("7x7 Easy");
    expect(label("10x10b20s2d1")).toBe("10x10 Normal");
    expect(label("10x10b20s4d1")).toBe("10x10 Normal, 4-way rotational");
  });

  it("refuses the sizes no board of a tier or symmetry is dealt on", () => {
    const refused = (s: string) => paramsError(game, game.decodeParams(s), true);
    expect(refused("2x2b20s0d0")).toBeNull();
    expect(refused("2x2b20s0d1")).toMatch(/No 2x2 puzzle is Normal/);
    expect(refused("2x4b20s0d2")).toMatch(/is Unreasonable/);
    expect(refused("3x3b20s0d2")).toBeNull();
    expect(refused("3x3b20s2d2")).toMatch(/2-way rotational symmetry is Unreasonable/);
    expect(refused("3x3b20s3d1")).toMatch(/4-way mirror symmetry is Normal/);
    expect(refused("4x4b20s4d2")).toBeNull();
    expect(refused("4x5b20s4d0")).toMatch(/must be square/);
    expect(refused("7x7b4s0d0")).toMatch(/at least 5/);
  });

  it("deals walls as symmetric as asked, and every tier at its presets", () => {
    for (const id of ["7x7b20s4d0", "7x7b20s4d1", "7x7b20s4d2", "10x10b20s2d1"]) {
      const p = game.decodeParams(id);
      const { desc } = game.newDesc(p, randomNew(`lightup-${id}`));
      const board = game.newState(p, desc);
      const walls = new Set(
        Array.from(board.values.keys()).filter((c) => board.values[c] === WALL),
      );
      const n = p.w * p.h;
      for (const c of walls) {
        expect(walls.has(n - 1 - c), `${id} ${desc} at ${c}`).toBe(true);
        if (p.options?.["symmetry"] === 4) {
          const [x, y] = [c % p.w, Math.floor(c / p.w)];
          expect(walls.has(x * p.w + (p.w - 1 - y)), `${id} ${desc} at ${c}`).toBe(
            true,
          );
        }
      }
    }
  });

  it("washes the squares a bulb lights, which a cross there is drawn on or not as preferred", () => {
    // A bulb at the right of the second row lights its row and the square
    // under it, which is crossed.
    const id = "3x4:Ba1f0a0";
    const moves = [{ set: [5, BULB] }, { set: [8, CROSS] }];
    const { midend, palette, recording } = renderScenario({ game, id, moves });
    // The color of the bulb's square, 32 pixels a square.
    const washed = recording.ops.find(
      (o) => o.op === "rect" && o.x === 66 && o.y === 34 && o.w === 31,
    );
    if (washed?.op !== "rect") throw new Error("no square under the bulb");
    const crossed = (rec: RecordingDrawing) => rec.ops.some((o) => o.op === "line");
    const lit = (rec: RecordingDrawing) =>
      rec.ops.filter((o) => o.op === "rect" && o.color === washed.color).length;
    // The bulb's square, the two left of it, and the one under it.
    expect(lit(recording)).toBe(4);
    expect(crossed(recording)).toBe(true);
    expect(midend.setPreferences({ "show-lit-blobs": false })).toBeUndefined();
    const off = new RecordingDrawing(palette);
    midend.redraw(off);
    // The board is drawn again, the crossed square washed and without its
    // cross.
    expect(lit(off)).toBe(4);
    expect(crossed(off)).toBe(false);
  });

  it("reads a lit open square as holding no bulb, so the board is solved without crossing it", () => {
    const board = loaded("3x4:Ba1f0a0");
    const solved = game.solve(board, board);
    if (!solved.ok) throw new Error("no answer");
    const after = game.executeMove(board, solved.move);
    expect(game.status(after)).toBe("solved");
    // The squares the bulbs light are left open: the wash says they hold none.
    expect(Array.from(after.values).filter((v) => v === 0).length).toBeGreaterThan(0);
  });

  it("draws a cross on a square nothing can light any more in the error color", () => {
    // The open square of the top row sees only its column, all crossed.
    const id = "3x4:Ba1f0a0";
    const crosses = [1, 4, 7, 10].map((c) => ({ set: [c, CROSS] }));
    const red = renderScenario({ game, id, moves: crosses }).recording.ops.filter(
      (o) => o.op === "line" && o.color === COL_ERROR,
    );
    expect(red.length).toBeGreaterThan(0);
    const fine = renderScenario({ game, id, moves: crosses.slice(1) }).recording.ops;
    expect(fine.some((o) => o.op === "line" && o.color === COL_ERROR)).toBe(false);
  });

  it("loads a board too small for its tier when it comes with its description", () => {
    expect(paramsError(game, game.decodeParams("2x2b20s0d1"), false)).toBeNull();
    expect(game.newState(game.decodeParams("2x2b20s0d1"), "a1b").values[1]).toBe(WALL);
  });

  it("carries the hint on from the 4 to the 1 beside it", () => {
    // The fourth row: 2, open, 1, open, 4, open, wall.
    const board = loaded("7x7:c2mBc2a1a4aBc2m1c");
    const plan = game.hint.plan(board);
    if (!plan?.ok) throw new Error("no hint");
    const [first, second] = plan.steps;
    expect(first.rung).toBe("clueExact");
    expect(first.move.set).toEqual([18, BULB, 26, BULB, 32, BULB, 24, BULB]);
    // The 1's bulb is the 4's left one, so it crosses its other neighbors.
    expect(second.rung).toBe("clueFull");
    expect(second.move.set).toEqual([16, CROSS, 30, CROSS, 22, CROSS]);
  });

  it("draws two bulbs that light each other in the error color", () => {
    const id = "3x4:Ba1f0a0";
    const count = (r: ReturnType<typeof renderScenario>) =>
      r.recording.ops.filter((o) => o.op === "circle" && o.fill === COL_ERROR).length;
    expect(count(renderScenario({ game, id, moves: [{ set: [3, BULB] }] }))).toBe(0);
    expect(
      count(
        renderScenario({ game, id, moves: [{ set: [3, BULB] }, { set: [5, BULB] }] }),
      ),
    ).toBeGreaterThan(0);
  });

  it("outlines a square Check & Save finds wrong, which breaks no rule yet", () => {
    const id = "7x7:c2mBc2a1a4aBc2m1c";
    const fresh = loaded(id);
    const solved = game.solve(fresh, fresh);
    if (!solved.ok) throw new Error("no answer");
    const answer = game.executeMove(fresh, solved.move).values;
    const count = (r: ReturnType<typeof renderScenario>) =>
      r.recording.ops.filter((o) => "color" in o && o.color === COL_ERROR).length;
    for (let c = 0; c < answer.length; c++) {
      if (fresh.fixed[c]) continue;
      const moves = [{ set: [c, answer[c] === BULB ? CROSS : BULB] }];
      if (count(renderScenario({ game, id, moves })) > 0) continue;
      const shown = renderScenario({ game, id, moves, showMistakes: true });
      expect(shown.mistakeCount).toBe(1);
      expect(count(shown)).toBeGreaterThan(0);
      return;
    }
    throw new Error("no wrong square that breaks no rule");
  });
});
