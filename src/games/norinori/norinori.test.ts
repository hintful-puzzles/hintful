/**
 * Norinori, born from its description: what only this game's statements
 * decide. The engine's own tests read fill games for the board, the input,
 * the deal and the hint (`engine/fill/*.test.ts`), and the cross-game guards
 * reach it as a registered game. What is left here is a position for every
 * kind of step its hint takes, the regions read from their walls, a domino
 * drawn as one piece, a region's breach drawn on its squares, and a wrong
 * square outlined.
 */

import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../../engine/color/roles.ts";
import type { Partition } from "../../engine/solve/describe-runtime.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { game } from "../../generated/games/norinori/norinori.game.ts";

const SHADED = 1;
const CLEAR = 2;

/** A position for every kind of step. */
describeHintPins({
  game,
  params: [
    { w: 6, h: 6, diff: 1 },
    { w: 6, h: 6, diff: 2 },
  ],
  seeds: 48,
  pins: {
    domino: "6x6dn:1c2aabeb2b2b2aa1c3daf",
    partner: "6x6dn:eaacb1bbabb1b5a5aah",
    between: "6x6dn:ebab1babaa1c2fa3ac1a1c",
    alone: "6x6dn:eaacb1bbabb1b5a5aah",
    claimed: "6x6dn:1abb2a2adeacaa1d3c3b2a",
    fullRegion: "6x6dt:bca4b2a2fa2abaa1db2bb1",
    exactRegion: "6x6dn:1c2aabeb2b2b2aa1c3daf",
    neededRegion: "6x6dn:a1c4b1a1aaa1ib1b3adb1b1",
    blocked: "6x6dn:2cada2aa1a2fcb1b1ac1aaba",
    crowded: "6x6dt:f2aa3a4a2ada1aaadb1e1a",
  },
});

/** A board from its game ID. */
const loaded = (id: string) => {
  const [params, desc] = id.split(":");
  return game.newState(game.decodeParams(params), desc);
};

describe("norinori", () => {
  it("reads its regions from their walls, numbered in reading order", () => {
    // Two regions of a 4x4, the left two columns and the right two: a wall
    // after one gap, then after two, three times, and thirteen gaps to the
    // end.
    const board = loaded("4x4:abbbm");
    const { of } = board.dealt.region as Partition;
    expect(Array.from(of)).toEqual([0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1]);
  });

  it("refuses a region of one square, which cannot hold two shaded", () => {
    // The top left square walled off alone.
    expect(() => loaded("4x4:1kk")).toThrow();
  });

  it("draws two shaded squares side by side as one domino", () => {
    // Each half of a domino reaches the side it shares with the other, where
    // the other's begins; two squares apart each keep inside their own.
    const id = "6x6dn:1c2aabeb2b2b2aa1c3daf";
    const meet = (moves: { set: number[] }[]) => {
      const xs = renderScenario({ game, id, moves }).recording.ops.flatMap((o) =>
        o.op === "polygon" ? [o.points.map(([x]) => x)] : [],
      );
      return xs.some((a) => xs.some((b) => Math.max(...a) === Math.min(...b)));
    };
    expect(meet([{ set: [0, SHADED, 1, SHADED] }])).toBe(true);
    expect(meet([{ set: [0, SHADED, 2, SHADED] }])).toBe(false);
  });

  it("reddens every shaded square of a region with three, and draws no bar", () => {
    // Three along the bottom row's region: a breach of the region that lies
    // in a line and is no run.
    const { ops } = renderScenario({
      game,
      id: "6x6dn:1c2aabeb2b2b2aa1c3daf",
      moves: [{ set: [30, SHADED, 31, SHADED, 32, SHADED] }],
    }).recording;
    expect(ops.filter((o) => o.op === "polygon" && o.fill === COL_ERROR)).toHaveLength(
      3,
    );
    expect(ops.filter((o) => o.op === "rect" && o.color === COL_ERROR)).toHaveLength(0);
  });

  it("reddens both crosses that leave a region no room, and draws no diamond", () => {
    // The second row's third and fourth squares are a region of their own.
    const { ops } = renderScenario({
      game,
      id: "6x6dn:1c2aabeb2b2b2aa1c3daf",
      moves: [{ set: [8, CLEAR, 9, CLEAR] }],
    }).recording;
    expect(ops.some((o) => o.op === "polygon" && o.fill === COL_ERROR)).toBe(false);
    expect(ops.filter((o) => o.op === "line" && o.color === COL_ERROR).length).toBe(4);
  });

  it("outlines a square Check & Save finds wrong, which breaks no rule yet", () => {
    const id = "6x6dn:1c2aabeb2b2b2aa1c3daf";
    const fresh = loaded(id);
    const solved = game.solve(fresh, fresh);
    if (!solved.ok) throw new Error("no answer");
    const answer = game.executeMove(fresh, solved.move).values;
    const count = (r: ReturnType<typeof renderScenario>) =>
      r.recording.ops.filter((o) => "color" in o && o.color === COL_ERROR).length;
    for (let c = 0; c < answer.length; c++) {
      const moves = [{ set: [c, answer[c] === SHADED ? CLEAR : SHADED] }];
      if (count(renderScenario({ game, id, moves })) > 0) continue;
      const shown = renderScenario({ game, id, moves, showMistakes: true });
      expect(shown.mistakeCount).toBe(1);
      expect(count(shown)).toBeGreaterThan(0);
      return;
    }
    throw new Error("no wrong square that breaks no rule");
  });
});
