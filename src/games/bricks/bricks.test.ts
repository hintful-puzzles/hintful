/**
 * Bricks, born from its description: what only this game's statements
 * decide. The engine's own tests read fill games for the board, the input,
 * the deal and the hint (`engine/fill/*.test.ts`), and the cross-game guards
 * reach it as a registered game. What is left here is upstream's IDs read on
 * the hexagon, its retired tier letter, the tiers a board opens at, the
 * shear a press and the cursor undo, and a wrong brick outlined by Check &
 * Save.
 */

import { describe, expect, it } from "vitest";
import { COL_ERROR } from "../../engine/color/roles.ts";
import { DESC_NOT_UNIQUE } from "../../engine/contract/desc-error.ts";
import { UI_UPDATE } from "../../engine/contract/game.ts";
import { spaceOf } from "../../engine/fill/board.ts";
import { encodeDesc } from "../../engine/fill/game-id.ts";
import { paramsError } from "../../engine/game-id/params.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_UP,
  LEFT_BUTTON,
  LEFT_RELEASE,
  MOD_CTRL,
  MOD_NUM_KEYPAD,
} from "../../engine/input/pointer.ts";
import { Midend } from "../../engine/midend/midend.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeHintPins } from "../../engine/testing/hint-positions.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import * as bricks from "../../generated/games/bricks/bricks.compiled.ts";
import { game } from "../../generated/games/bricks/bricks.game.ts";

const SHADED = 1;
const CLEAR = 2;

/** Boards upstream's generator dealt, by their game IDs; `t` its Tricky. */
const UPSTREAM = [
  "7x6de:2c1_3ab0c2_3fb2_2a5a3fb2a2a2",
  "7x6dn:c3c4fd4bb4b2a3fb2_2b1",
  "7x6dt:ga6c3ac3a2af3_0_3b2_4ag",
  "10x8de:a4c1dc2_1b3_0a3d3de3b2ab2c2ca2c2c0_2a2c3b3_2a2b3d",
  "10x8dn:f1b1b5b3_3cj0c3b3bh2aa4b2c1a1b5e2c3a3d",
  "10x8dt:c3b2c2b4b2a2_1ja3a2f1c3a5ce4c0_3a4b3b3aa3f2a",
  "4x4de:2b1c0c2_2b1",
  "5x5dn:2b3ab4a3_3da4ca3b2",
  "8x5dt:2c3cb5d3a6fd2_3b2a3d2",
  "6x7dn:1b1bd3a3a3a1afa6db3_2a2_2e",
  "9x6de:2c2c1b3_2b3b3b2c2ae4_1b2b2c4ac2e",
  "12x8dt:g2_1cb4a2b3c2a1i4_2d1b2cd4a2b2bb3b3f2b3b4d4i2b",
];

/** A board from its game ID. */
const loaded = (id: string) => {
  const [params, desc] = id.split(":");
  return game.newState(game.decodeParams(params), desc);
};

/** The store's cells inside the hexagon, by row. */
const rowsOf = (b: { w: number; h: number; fixed: Uint8Array }, outside: Set<number>) =>
  Array.from({ length: b.h }, (_, y) =>
    Array.from({ length: b.w }, (_, x) => y * b.w + x).filter((c) => !outside.has(c)),
  );

describe("bricks", () => {
  it("holds a w by h hexagon in a store ⌈h/2⌉ − 1 wider, its corners holes", () => {
    const board = loaded("4x4de:2b1c0c2_2b1");
    expect([board.w, board.h]).toEqual([5, 4]);
    const holes = new Set(board.dealt.hole.at);
    // Each row holds the hexagon's four cells, the corners sheared off.
    expect(rowsOf(board, holes).map((r) => r.length)).toEqual([4, 4, 4, 4]);
    // The rows start at 1, 1, 0 and 0, each drawn half a tile right of the
    // one above, so the left edge zigzags as a wall's does.
    expect([...holes].sort((a, b) => a - b)).toEqual([0, 5, 14, 19]);
    for (const c of holes)
      expect([board.fixed[c], board.values[c]]).toEqual([1, CLEAR]);
    // The numbers sit on the hexagon's cells, in reading order.
    expect(Array.from(board.dealt.number.at)).toEqual([1, 4, 9, 13, 15, 18]);
    expect(Array.from(board.dealt.number.v)).toEqual([2, 1, 0, 2, 2, 1]);
  });

  it("reads every upstream board, Tricky's as Unreasonable, and writes its desc back", () => {
    for (const id of UPSTREAM) {
      const me = new Midend(game);
      expect(me.newGameFromId(id), id).toBeNull();
      const [params, desc] = id.split(":");
      expect(me.getParams(), id).toMatch(/d[en]$/);
      expect(game.encodeParams(game.decodeParams(params), true)).toBe(
        params.replace(/dt$/, "dn"),
      );
      const board = loaded(id);
      const solved = game.solve(board, board);
      if (!solved.ok) throw new Error(`${id}: ${solved.error}`);
      expect(game.status(game.executeMove(board, solved.move)), id).toBe("solved");
      expect(encodeDesc(bricks.deal, spaceOf(bricks, board), board.dealt)).toBe(desc);
    }
  });

  it("deals each tier, the smallest boards included, and opens each at its tier", () => {
    for (const id of [
      "6x7de",
      "6x7dn",
      "8x10de",
      "2x3dn",
      "3x2dn",
      "2x10de",
      "2x4dn",
    ]) {
      const p = game.decodeParams(id);
      for (const seed of ["a", "b"]) {
        const { desc } = game.newDesc(p, randomNew(`bricks-${id}-${seed}`));
        const board = game.newState(p, desc);
        const solved = game.solve(board, board);
        if (!solved.ok) throw new Error(`${id}:${desc}: ${solved.error}`);
        const done = game.executeMove(board, solved.move);
        expect(game.status(done), `${id}:${desc}`).toBe("solved");
        // At least two squares in five of the hexagon are bricks.
        const bricks = Array.from(done.values).filter((v) => v === SHADED).length;
        expect(bricks, `${id}:${desc}`).toBeGreaterThanOrEqual(0.4 * p.w * p.h);
        const me = new Midend(game);
        expect(me.newGameFromId(`${id.slice(0, -2)}:${desc}`)).toBeNull();
        expect(me.getParams(), desc).toBe(id);
      }
    }
  });

  it("refuses only the 2x2 Unreasonable board, which no deal has, and one with several answers", () => {
    const refused = (s: string) => paramsError(game, game.decodeParams(s), true);
    expect(refused("2x2de")).toBeNull();
    expect(refused("2x2dn")).toMatch(/is Unreasonable/);
    expect(refused("2x3dn")).toBeNull();
    expect(new Midend(game).newGameFromId("4x4:p")).toBe(DESC_NOT_UNIQUE);
  });

  it("undoes the shear: a press lands on the cell drawn under it, and a corner takes none", () => {
    let board = loaded("4x4de:2b1c0c2_2b1");
    const ui = game.newUi(board);
    const ds = preferredDrawState(game, board);
    const press = (x: number, y: number) => {
      const p = game.targetVerbs?.geometry.pointAt(board, ds, { x, y }, ui);
      if (p === undefined) throw new Error("no geometry");
      for (const button of [LEFT_BUTTON, LEFT_RELEASE]) {
        const m = game.interpretMove(board, ui, ds, p, button);
        if (m !== null && m !== UI_UPDATE) board = game.executeMove(board, m);
      }
    };
    // Row 2's first cell is the store's first, row 0's third its fourth;
    // neither holds a number.
    press(0, 2);
    press(3, 0);
    expect(board.values[2 * 5]).toBe(SHADED);
    expect(board.values[3]).toBe(SHADED);
    const ts = ds.tileSize;
    const at = (x: number, y: number) => {
      const p = game.targetVerbs?.geometry.pointAt(board, ds, { x, y }, ui);
      if (p === undefined) throw new Error("no geometry");
      return p;
    };
    // A tile left of row 2's first cell is no cell: the hexagon's edge.
    const edge = at(0, 2);
    expect(
      game.targetVerbs?.geometry.pointerTarget(
        board,
        ds,
        { x: edge.x - ts, y: edge.y },
        ui,
      ),
    ).toBeNull();
    // Each row is drawn half a tile right of the one above.
    expect(at(1, 1).x - at(1, 0).x).toBe(ts >> 1);
  });

  it("steps the cursor round a cell's six neighbors and keeps it on the hexagon", () => {
    const board = loaded("4x4de:2b1c0c2_2b1");
    const ui = game.newUi(board);
    const ds = preferredDrawState(game, board);
    const key = (button: number) => {
      game.interpretMove(board, ui, ds, { x: -1, y: -1 }, button);
      return [ui.cursor.x, ui.cursor.y];
    };
    const pad = (d: number) => key(MOD_NUM_KEYPAD | (48 + d));
    // The first key shows the cursor; park it on (2, 1).
    ui.cursor = { x: 2, y: 1, visible: true };
    expect(pad(6)).toEqual([3, 1]);
    expect(pad(4)).toEqual([2, 1]);
    // 7 and 3 are straight up and down in the store; 9 and 1 the diagonals
    // across the shear.
    expect(pad(3)).toEqual([2, 2]);
    expect(pad(7)).toEqual([2, 1]);
    expect(pad(1)).toEqual([1, 2]);
    expect(pad(9)).toEqual([2, 1]);
    // Up and Down zigzag in the column the cursor is drawn in.
    expect(key(CURSOR_DOWN)).toEqual([1, 2]);
    expect(key(CURSOR_UP)).toEqual([2, 1]);
    // Left stops at the row's first cell, which the shear moves.
    ui.cursor = { x: 1, y: 0, visible: true };
    expect(key(CURSOR_LEFT)).toEqual([1, 0]);
    ui.cursor = { x: 3, y: 3, visible: true };
    expect(key(CURSOR_RIGHT)).toEqual([3, 3]);
  });

  it("strokes along a number pad step, and a digit off the pad still paints", () => {
    let board = loaded("4x4de:2b1c0c2_2b1");
    const ui = game.newUi(board);
    const ds = preferredDrawState(game, board);
    const send = (button: number) => {
      const m = game.interpretMove(board, ui, ds, { x: -1, y: -1 }, button);
      if (m !== null && m !== UI_UPDATE) board = game.executeMove(board, m);
    };
    ui.cursor = { x: 2, y: 3, visible: true };
    // Ctrl with the pad's 7 steps straight up, and clears the cells it
    // leaves and enters.
    send(MOD_NUM_KEYPAD | MOD_CTRL | 55);
    expect([ui.cursor.x, ui.cursor.y]).toEqual([2, 2]);
    expect([board.values[3 * 5 + 2], board.values[2 * 5 + 2]]).toEqual([CLEAR, CLEAR]);
    // The main row's 1 shades, where the pad's 1 would have moved.
    send(49);
    expect(board.values[2 * 5 + 2]).toBe(SHADED);
    expect([ui.cursor.x, ui.cursor.y]).toEqual([2, 2]);
  });

  it("reads a run however it is split, and refuses a number past 7", () => {
    const board = loaded("6x7:a1b2ad2a0a4b3fa3b4ab5a5a1e");
    const top = rowsOf(board, new Set(board.dealt.hole.at))[0];
    expect(top.map((c) => board.dealt.number.valueAt[c])).toEqual([
      -1, 1, -1, -1, 2, -1,
    ]);
    expect(new Midend(game).newGameFromId("6x7:a8b2ad2a0a4b3fa3b4ab5a5a1e")).toMatch(
      /range/,
    );
  });

  it("reads a 7 as a hole inside the hexagon: a clear cell that counts nothing", () => {
    const board = loaded("4x4de:2b1c7c2_2b1");
    expect(Array.from(board.dealt.number.at)).toEqual([1, 4, 13, 15, 18]);
    expect(board.dealt.hole.at).toContain(9);
    expect([board.fixed[9], board.values[9]]).toEqual([1, CLEAR]);
  });

  it("carries the hint on from the 2 it began with", () => {
    const plan = game.hint.plan(loaded("4x4de:2b1c0c2_2b1"));
    if (!plan?.ok) throw new Error("no hint");
    expect(plan.steps.slice(0, 2).map((s) => [s.rung, s.move.set])).toEqual([
      ["undercount", [2, SHADED]],
      ["undercount", [6, SHADED]],
    ]);
    expect(plan.steps[0].explanation).toMatch(/^The outlined 2 beside this cell/);
  });

  it("counts the numbers left", () => {
    const board = loaded(UPSTREAM[0]);
    expect(game.statusbarText?.(board, game.newUi(board))).toBe("Clues left: 13");
    const solved = game.solve(board, board);
    if (!solved.ok) throw new Error("no answer");
    const done = game.executeMove(board, solved.move);
    expect(game.statusbarText?.(done, game.newUi(done))).toBe("");
  });

  it("starts the cursor on the hexagon's first cell", () => {
    const ui = game.newUi(loaded("4x4de:2b1c0c2_2b1"));
    expect([ui.cursor.x, ui.cursor.y]).toEqual([1, 0]);
  });

  it("outlines a brick Check & Save finds wrong, which breaks no rule yet", () => {
    const id = UPSTREAM[0];
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
    throw new Error("no wrong brick that breaks no rule");
  });
});

/** A position for every kind of step. */
describeHintPins({
  game,
  params: [game.decodeParams("6x7de"), game.decodeParams("8x10de")],
  pins: {
    /** Held on 1006 of 1111 positions walked. */
    strandSupport: { id: "6x7de:e3fc2ba2c3c4b4a4b2f", moves: [{ set: [17, 1] }] },
    /** Held on 1071 of 1111 positions walked. */
    undercount: "6x7de:e3fc2ba2c3c4b4a4b2f",
    /** Held on 771 of 1111 positions walked. */
    three: {
      id: "6x7de:1_3b2aff3b3a0e3_3a3c1b2b",
      moves: [{ set: [12, 1] }, { set: [5, 1] }, { set: [13, 1] }, { set: [55, 1] }],
    },
    /** Held on 957 of 1111 positions walked. */
    unsupported: "6x7de:fa2a3bd2a2_3b2ae3a5a5bf",
    /** Held on 986 of 1111 positions walked. */
    overcount: {
      id: "6x7de:1_3b2aff3b3a0e3_3a3c1b2b",
      moves:
        '[{"set":[12,1]},{"set":[5,1]},{"set":[13,1]},{"set":[55,1]},{"set":[14,2]},{"set":[20,2]},{"set":[21,1]},{"set":[30,1]},{"set":[37,2]},{"set":[38,1]},{"set":[47,1]}]',
    },
  },
});
