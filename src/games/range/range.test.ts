/**
 * Range, born from its description: what only this game's statements decide.
 * The engine's own tests read fill games for the board, the input, the deal,
 * the hide and the search tier (`engine/fill/*.test.ts`), and the cross-game
 * guards reach it as a registered game. What is left here is a position for
 * every kind of step its hint takes, upstream's IDs read as the right
 * numbers, the size bounds, a symmetric deal, a plain number, and a wrong
 * square outlined.
 */

import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../../engine/color/roles.ts";
import {
  DESC_NOT_UNIQUE,
  loadVerdict,
  validateDesc,
} from "../../engine/contract/desc-error.ts";
import { paramsError } from "../../engine/game-id/params.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import {
  renderPinnedHint,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { game } from "../../generated/games/range/range.game.ts";

const SHADED = 1;
const CLEAR = 2;

/** A position for every kind of step. */
const pinned = describeHintPins({
  game,
  params: [{ w: 9, h: 6, diff: 0 }],
  pins: {
    besideShaded: {
      id: "9x6de:f3a8e2b7b7e8_7e3b5b6e4a7f",
      moves: [{ set: [46, SHADED] }],
    },
    "capped.satisfied": {
      id: "9x6de:9a9g2c7k12_5k3c5g4a6",
      moves: [{ set: [1, CLEAR] }],
    },
    "capped.overrun": "9x6de:f3a8e2b7b7e8_7e3b5b6e4a7f",
    reach: "9x6de:a4d6a4_9e7e7j6e10e4_6a5d8a",
    cut: {
      id: "9x6de:3e11h9a5c10j6c5a8h11e12",
      moves:
        '[{"set":[24,2,5,2,4,2,3,2,9,2,14,2,22,2,29,2,48,2,49,2,50,2,44,2,35,2,26,2,8,1,7,2,16,1,25,2,33,2,2,2,1,1,10,2,18,2,27,1,28,2,42,2,51,2,13,2,12,2,11,1,20,2,37,2,39,2,40,2,41,1,45,1,46,2,52,2]}]',
    },
  },
});

/** A board from its game ID. */
const loaded = (id: string) => {
  const [params, desc] = id.split(":");
  return game.newState(game.decodeParams(params), desc);
};

describe("range", () => {
  it("reads upstream's run code, a `_` between two numbers side by side", () => {
    const board = loaded("9x6:9a9g2c7k12_5k3c5g4a6");
    const { at, v } = board.dealt.number;
    expect(Array.from(at.slice(0, 5))).toEqual([0, 2, 10, 14, 26]);
    expect(Array.from(v.slice(0, 6))).toEqual([9, 9, 2, 7, 12, 5]);
    // A numbered square is dealt clear, and no move changes it.
    expect(board.values[0]).toBe(CLEAR);
    expect(board.fixed[0]).toBe(1);
  });

  it("refuses what upstream never writes", () => {
    const p = game.decodeParams("3x3");
    expect(validateDesc(game, p, "2c5d")).toBeNull();
    expect(validateDesc(game, p, "2_5g")).toBeNull();
    expect(validateDesc(game, p, "2c5d,x")).toMatch(/too long/);
    // A `_` anywhere but between two numbers side by side.
    expect(validateDesc(game, p, "_2c5d")).toMatch(/"_"/);
    expect(validateDesc(game, p, "2_c5d")).toMatch(/"c"/);
    expect(validateDesc(game, p, "2c_5d")).toMatch(/"_"/);
    // A number past what its row and column hold, and a 0.
    expect(validateDesc(game, p, "25g")).toMatch(/out of range/);
    expect(validateDesc(game, p, "0h")).toMatch(/out of range/);
    expect(validateDesc(game, p, "j2")).toMatch(/too long/);
  });

  it("loads only a board with one answer", () => {
    const p = game.decodeParams("4x4");
    expect(validateDesc(game, p, "c6h3_6b")).toBeNull();
    expect(loadVerdict(game, p, "c6h3_6b")).toBe(DESC_NOT_UNIQUE);
  });

  it("refuses the sizes upstream refuses", () => {
    const refused = (s: string) => paramsError(game, game.decodeParams(s), true);
    expect(refused("6x9de")).toBeNull();
    expect(refused("64x65de")).toMatch(/at most 128/);
    expect(refused("2x2de")).toMatch(/at least 3/);
    expect(refused("1x5de")).toBeNull();
    // On a strip the rules settle every board with one answer.
    expect(refused("1x5du")).toMatch(/No 1x5 puzzle is Unreasonable/);
  });

  it("deals numbers symmetric under a half turn", () => {
    for (const diff of [0, 1]) {
      const p = { w: 6, h: 9, diff };
      const { desc } = game.newDesc(p, randomNew(`range-symmetric-${diff}`));
      const board = game.newState(p, desc);
      const at = new Set(board.dealt.number.at);
      const n = p.w * p.h;
      for (const c of at) expect(at.has(n - 1 - c), `${desc} at ${c}`).toBe(true);
    }
  });

  it.each([
    "capped.satisfied",
    "capped.overrun",
    "reach",
    "cut",
  ] as const)("circles no number a %s step outlines, which has no block", (rung) => {
    const { recording } = renderPinnedHint(game, pinned(rung));
    const texts = recording.ops.flatMap((o) =>
      o.op === "text" && /^\d+$/.test(o.text) ? [`${o.x},${o.y}`] : [],
    );
    expect(texts.length).toBeGreaterThan(0);
    const circled = recording.ops.filter(
      (o) => o.op === "circle" && texts.includes(`${o.cx},${o.cy}`),
    );
    expect(circled).toEqual([]);
  });

  it("never fades or counts a number", () => {
    const board = loaded("9x6de:a4d6a4_9e7e7j6e10e4_6a5d8a");
    expect(game.statusbarText).toBeUndefined();
    const solved = game.solve(board, board);
    if (!solved.ok) throw new Error("no answer");
    expect(game.status(game.executeMove(board, solved.move))).toBe("solved");
  });

  it("outlines a square Check & Save finds wrong, which breaks no rule yet", () => {
    const id = "9x6de:a4d6a4_9e7e7j6e10e4_6a5d8a";
    const fresh = loaded(id);
    const solved = game.solve(fresh, fresh);
    if (!solved.ok) throw new Error("no answer");
    const answer = game.executeMove(fresh, solved.move).values;
    const count = (r: ReturnType<typeof renderScenario>) =>
      r.recording.ops.filter((o) => "color" in o && o.color === COL_ERROR).length;
    for (let c = 0; c < answer.length; c++) {
      if (fresh.fixed[c]) continue;
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
