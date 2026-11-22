/**
 * Sticks, born from its description: what only this game's statements
 * decide. The engine's own tests read fill games for the board, the input,
 * the deal and the hint (`engine/fill/*.test.ts`), and the cross-game guards
 * reach it as a registered game. What is left here is upstream's IDs read as
 * the right blocks and numbers, a number dealt on each line, the tiers a
 * pasted board opens at, the drag and the arrows by direction, the hint's
 * words, and a wrong line outlined by Check & Save.
 */

import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../../engine/color/roles.ts";
import {
  DESC_CONTRADICTORY,
  DESC_NOT_UNIQUE,
} from "../../engine/contract/desc-error.ts";
import { UI_UPDATE } from "../../engine/contract/game.ts";
import { paramsError } from "../../engine/game-id/params.ts";
import {
  CURSOR_LEFT,
  CURSOR_RIGHT,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  MOD_CTRL,
  MOD_SHFT,
} from "../../engine/input/pointer.ts";
import { Midend } from "../../engine/midend/midend.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { game } from "../../generated/games/sticks/sticks.game.ts";

const ACROSS = 1;
const DOWN = 2;
const BLOCK = 3;

/** A board from its game ID. */
const loaded = (id: string) => {
  const [params, desc] = id.split(":");
  return game.newState(game.decodeParams(params), desc);
};

describe("sticks", () => {
  it("reads upstream's IDs: B a block with its number after, _ before a number after a written square", () => {
    const board = loaded("4x1:B2_1_3a");
    expect(Array.from(board.values)).toEqual([BLOCK, 0, 0, 0]);
    expect(Array.from(board.dealt.joins.at)).toEqual([0]);
    expect(Array.from(board.dealt.joins.v)).toEqual([2]);
    expect(Array.from(board.dealt.length.at)).toEqual([1, 2]);
    expect(Array.from(board.dealt.length.v)).toEqual([1, 3]);
  });

  it("deals each tier, the smallest Unreasonable boards included, and opens each at its tier", () => {
    for (const id of [
      "5x5b20s2de",
      "7x7b20s2de",
      "7x7b20s2du",
      "8x10b20s2de",
      "2x3b20s0du",
      "3x3b20s0du",
    ]) {
      const p = game.decodeParams(id);
      for (const seed of ["a", "b"]) {
        const { desc } = game.newDesc(p, randomNew(`sticks-${id}-${seed}`));
        const board = game.newState(p, desc);
        const solved = game.solve(board, board);
        if (!solved.ok) throw new Error(`${id}:${desc}: ${solved.error}`);
        expect(game.status(game.executeMove(board, solved.move)), `${id}:${desc}`).toBe(
          "solved",
        );
        const me = new Midend(game);
        expect(me.newGameFromId(`${id.slice(0, -2)}:${desc}`)).toBeNull();
        expect(me.getParams(), desc).toBe(id);
      }
    }
  });

  it("opens a pasted board at the tier it has, and refuses one with several answers or none", () => {
    const load = (id: string) => {
      const me = new Midend(game);
      return me.newGameFromId(id) ?? me.getParams();
    };
    expect(load("4x4b20s2:3b1aB1b2_1B1c1a")).toBe("4x4b20s2du");
    expect(load("4x4b20s2de:c1_1B0_1cB2c4a")).toBe("4x4b20s2de");
    expect(load("4x4b20s2:p")).toBe(DESC_NOT_UNIQUE);
    expect(load("4x4b20s2:4_1b1k")).toBe(DESC_CONTRADICTORY);
  });

  it("refuses only the sizes and symmetries no board is dealt on", () => {
    const refused = (s: string) => paramsError(game, game.decodeParams(s), true);
    expect(refused("2x2b20s0de")).toBeNull();
    expect(refused("2x2b20s0du")).toMatch(/is Unreasonable/);
    expect(refused("2x3b20s0du")).toBeNull();
    expect(refused("4x5b20s4de")).toMatch(/must be square/);
    expect(refused("7x7b4s0de")).toMatch(/at least 5/);
  });

  it("reads its params, the tier last", () => {
    for (const id of ["7x7b20s2de", "7x7b20s2du", "10x10b30s0de"])
      expect(game.encodeParams(game.decodeParams(id), true)).toBe(id);
    expect(game.encodeParams(game.decodeParams("7x7"), true)).toBe("7x7b20s2de");
  });

  it("rules a line into a 0 block out first", () => {
    // The square right of the 0 block, at (1,4), cannot run across into it.
    const board = loaded("7x7:c5b2a2aB1a6a2_4dBB_3B2aB1aBB0e2cB2d2_3c4");
    const plan = game.hint.plan(board);
    if (!plan?.ok) throw new Error("no hint");
    expect(plan.steps[0].rung).toBe("overConnected");
    expect(plan.steps[0].move.set).toEqual([4 * 7 + 1, DOWN]);
    expect(board.values[4 * 7]).toBe(BLOCK);
  });

  it("carries the hint on from the 3 along its row, then to the 1 block", () => {
    const plan = game.hint.plan(loaded("5x5:3bB1b5c2aB3c2a2_2aB2b1"));
    if (!plan?.ok) throw new Error("no hint");
    expect(plan.steps.slice(0, 4).map((s) => [s.rung, s.move.set])).toEqual([
      ["unreachable", [0, ACROSS]],
      ["unreachable", [1, ACROSS]],
      ["unreachable", [2, ACROSS]],
      ["overConnected", [4, DOWN]],
    ]);
    // A step names a numbered square by its number.
    expect(plan.steps[0].explanation).toMatch(/this 3 must be horizontal/);
  });

  it("draws by direction: a key sets a line, a drag runs along its row, an arrow strokes", () => {
    let board = loaded("4x1:aBb");
    const ui = game.newUi(board);
    const ds = { tileSize: 10 } as Parameters<typeof game.interpretMove>[2];
    const send = (button: number, c = -1) => {
      const at = c < 0 ? { x: -1, y: -1 } : { x: c * 10 + 5, y: 5 };
      const m = game.interpretMove(board, ui, ds, at, button);
      if (m !== null && m !== UI_UPDATE) board = game.executeMove(board, m);
      return m;
    };
    const values = () => Array.from(board.values);
    // A drag from the empty third square across the fourth draws along the row.
    send(LEFT_BUTTON, 2);
    send(LEFT_DRAG, 3);
    send(LEFT_RELEASE, 3);
    expect(values()).toEqual([0, BLOCK, ACROSS, ACROSS]);
    // Started on a line that way, the same drag clears.
    send(LEFT_BUTTON, 2);
    send(LEFT_DRAG, 3);
    send(LEFT_RELEASE, 3);
    expect(values()).toEqual([0, BLOCK, 0, 0]);
    // The cursor shows on the first square; 1 sets a vertical line, outright.
    send(CURSOR_LEFT);
    send(CURSOR_LEFT);
    send("1".charCodeAt(0));
    expect(values()).toEqual([DOWN, BLOCK, 0, 0]);
    expect(send("1".charCodeAt(0))).toBeNull();
    send("2".charCodeAt(0));
    expect(values()).toEqual([ACROSS, BLOCK, 0, 0]);
    // Ctrl and Right leaves the block out; at the edge it draws one square.
    send(CURSOR_RIGHT | MOD_CTRL);
    expect(values()).toEqual([ACROSS, BLOCK, 0, 0]);
    send(CURSOR_RIGHT | MOD_CTRL);
    send(CURSOR_RIGHT);
    expect(values()).toEqual([ACROSS, BLOCK, ACROSS, 0]);
    send(CURSOR_RIGHT | MOD_SHFT);
    expect(values()).toEqual([ACROSS, BLOCK, ACROSS, DOWN]);
    send(CURSOR_RIGHT | MOD_CTRL);
    expect(values()).toEqual([ACROSS, BLOCK, ACROSS, ACROSS]);
  });

  it("counts the block numbers left, never a line's", () => {
    const board = loaded("7x7:c5b2a2aB1a6a2_4dBB_3B2aB1aBB0e2cB2d2_3c4");
    expect(game.statusbarText?.(board, game.newUi(board))).toBe("Clues left: 5");
    const solved = game.solve(board, board);
    if (!solved.ok) throw new Error("no answer");
    const done = game.executeMove(board, solved.move);
    expect(game.statusbarText?.(done, game.newUi(done))).toBe("");
  });

  it("outlines a line Check & Save finds wrong, which breaks no rule yet", () => {
    const id = "7x7:c5b2a2aB1a6a2_4dBB_3B2aB1aBB0e2cB2d2_3c4";
    const fresh = loaded(id);
    const solved = game.solve(fresh, fresh);
    if (!solved.ok) throw new Error("no answer");
    const answer = game.executeMove(fresh, solved.move).values;
    const count = (r: ReturnType<typeof renderScenario>) =>
      r.recording.ops.filter((o) => "color" in o && o.color === COL_ERROR).length;
    for (let c = 0; c < answer.length; c++) {
      if (fresh.fixed[c]) continue;
      const moves = [{ set: [c, answer[c] === ACROSS ? DOWN : ACROSS] }];
      if (count(renderScenario({ game, id, moves })) > 0) continue;
      const shown = renderScenario({ game, id, moves, showMistakes: true });
      expect(shown.mistakeCount).toBe(1);
      expect(count(shown)).toBeGreaterThan(0);
      return;
    }
    throw new Error("no wrong line that breaks no rule");
  });
});

/** A position for every kind of step. */
describeHintPins({
  game,
  params: [game.decodeParams("7x7b20s2de"), game.decodeParams("8x10b20s2du")],
  pins: {
    /** Held on 802 of 1129 positions walked. */
    overConnected: "7x7b20s2de:a2a2c2_1a2aBB0a1aBb2cBa1b1aB1a1aBB0_3a2_2_3b3c1",
    /** Held on 691 of 1129 positions walked. */
    twoClues: {
      id: "7x7b20s2de:1aB1a4cB2aB1aB2c3f1_3d1a1b3aB_1B2_2B2a3a2aB2a2",
      moves: [{ set: [16, 1] }, { set: [24, 1] }],
    },
    /** Held on 1052 of 1129 positions walked. */
    tooLong: {
      id: "8x10b20s2du:B1c3bB1aB2_1aB1_1d1aB1_1a2_1_1b4bBc4B2aB1bBaB2b1aB2c4a1_1_1bB2b2c1B_1aB2aB2e4B",
      moves: [{ set: [64, 2] }],
    },
    /** Held on 877 of 1129 positions walked. */
    starved:
      "8x10b20s2du:a1_2Ba1_2a1cB2bB1a1aB4a2aBaBc1B2_1_2_1_1Bd1cB3_2_2bB4_2b1B2aBcB3_1_1_2B_1_1Bb1c2aB2_3b",
    /** Held on 1111 of 1129 positions walked. */
    unreachable: "7x7b20s2de:1aB1a4cB2aB1aB2c3f1_3d1a1b3aB_1B2_2B2a3a2aB2a2",
  },
});
