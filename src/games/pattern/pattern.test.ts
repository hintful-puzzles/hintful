/**
 * Pattern, born from its description: what only this game's statements
 * decide. The engine's own tests read fill games for the board, the input,
 * the deal and the hint (`engine/fill/*.test.ts`), and the cross-game guards
 * reach it as a registered game. What is left here is upstream's IDs, list
 * clues and given squares included, the tiers a board opens at, the four
 * ways a step is told, and the margins the lists are drawn in.
 */

import { describe, expect, it } from "vitest";
import {
  DESC_CONTRADICTORY,
  DESC_NOT_UNIQUE,
} from "../../engine/contract/desc-error.ts";
import { newBoard, solveBoard, spaceOf } from "../../engine/fill/board.ts";
import { encodeDesc } from "../../engine/fill/game-id.ts";
import { searchBoard } from "../../engine/fill/search.ts";
import { Midend } from "../../engine/midend/midend.ts";
import { randomNew } from "../../engine/random/index.ts";
import {
  describeAbsentTiers,
  describeDealtTiers,
} from "../../engine/testing/absent-tiers.ts";
import * as pattern from "../../generated/games/pattern/pattern.compiled.ts";
import { game } from "../../generated/games/pattern/pattern.game.ts";

const SHADED = 1;
const CLEAR = 2;

/** Boards by their game IDs: a recorded 5x5, one that needs search, and
 * two with given squares, which only upstream's own pictures carry. */
const UPSTREAM = [
  "5x5:4/2.2/2/1/2/2/2/1/3.1/4",
  "5x5:1.1/3/3/3/2/3/3/3/2/1.1",
  "2x2:1/1/1/1,aBb",
  "2x2:1/2//1,Bc",
];

/** A 10x10 board the old spec read its hint on. */
const TEN = "8/6.1/4.1.1.1/4.1/4.3/2/2/2.2/2.1.2/1.2/3.2/3.2/5/5/2.2/5/1.2/3.1/6/8";

/** A board from its game ID. */
const loaded = (id: string) => {
  const [params, desc] = id.split(":");
  return game.newState(game.decodeParams(params), desc);
};

/** What a pasted ID opens as: its params, or the refusal. */
const opened = (id: string) => {
  const me = new Midend(game);
  return me.newGameFromId(id) ?? me.getParams();
};

describe("pattern", () => {
  it("reads each line's list, the columns first, and writes the desc back", () => {
    const board = loaded("5x5:4/2.2/2/1/2/2/2/1/3.1/4");
    const lists = (L: number) =>
      Array.from(board.dealt.runs.lists[board.dealt.runs.byAt[L]]);
    // The space numbers the rows first, then the columns.
    expect([0, 1, 2, 3, 4].map(lists)).toEqual([[2], [2], [1], [3, 1], [4]]);
    expect([5, 6, 7, 8, 9].map(lists)).toEqual([[4], [2, 2], [2], [1], [2]]);
    for (const id of UPSTREAM) {
      const b = loaded(id);
      expect(encodeDesc(pattern.deal, spaceOf(pattern, b), b.dealt), id).toBe(
        id.split(":")[1],
      );
    }
  });

  it("writes its text with the columns' lists above and the rows' after", () => {
    const board = loaded("2x2:/1//1");
    expect(game.textFormat?.(board)).toBe(
      [
        "       1",
        "+---+---+",
        "| . | . |",
        "+---+---+",
        "| . | . | 1",
        "+---+---+",
        "",
      ].join("\n"),
    );
  });

  it("reads a params string with no height or no tier as upstream wrote it", () => {
    expect(game.encodeParams(game.decodeParams("20x15"), true)).toBe("20x15de");
    expect(game.encodeParams(game.decodeParams("10"), true)).toBe("10x10de");
  });

  it("deals given squares fixed, shaded by an uppercase letter", () => {
    // `a` places a clear square at once, `B` skips one and places a shaded
    // one, and the last letter lands on the end.
    const board = loaded("2x2:1/1/1/1,aBb");
    expect(Array.from(board.dealt.given.at)).toEqual([0, 2]);
    expect(Array.from(board.dealt.given.v)).toEqual([2, 1]);
    expect(Array.from(board.fixed)).toEqual([1, 0, 1, 0]);
    expect(opened("2x2:1/1/1/1,aBb")).toBe("2x2de");
  });

  it("refuses a desc that is not one", () => {
    const v = (desc: string) => opened(`2x2:${desc}`);
    expect(v("/1//1")).toBe("2x2de");
    expect(v("/1//1x")).toMatch(/\.$/);
    expect(v("/1//1/")).toMatch(/\.$/);
    // A run is at least one square and at most its line.
    expect(v("/0//1")).toMatch(/\.$/);
    expect(v("/3//1")).toMatch(/\.$/);
    // Runs that overfill their line have no answer.
    expect(v("/1.1//1")).toBe(DESC_CONTRADICTORY);
    expect(v("/1//1,bd")).toMatch(/\.$/);
    expect(v("/1//1,b")).toMatch(/\.$/);
    expect(opened("5x5:1/2/3")).toMatch(/\.$/);
  });

  it("opens a pasted board at the tier it needs, and refuses one without one answer", () => {
    expect(opened("5x5:1.1/3/3/3/2/3/3/3/2/1.1")).toBe("5x5du");
    expect(opened("5x5de:1.1/3/3/3/2/3/3/3/2/1.1")).toBe("5x5du");
    expect(opened("5x5:4/2.2/2/1/2/2/2/1/3.1/4")).toBe("5x5de");
    expect(opened("2x2:1/1/1/1")).toBe(DESC_NOT_UNIQUE);
    expect(opened("2x2:2/2//")).toBe(DESC_CONTRADICTORY);
  });

  it("has no Unreasonable board up to 3x3, nor one a square wide", () => {
    // Every picture of each size: where the lines stop short, a second
    // picture fits, so the description's bounds refuse these sizes.
    let stuck = 0;
    for (const [w, h] of [
      [2, 2],
      [2, 3],
      [3, 2],
      [3, 3],
      [1, 7],
      [7, 1],
    ] as const) {
      const sp = spaceOf(pattern, { w, h });
      for (let bits = 0; bits < 1 << (w * h); bits++) {
        const g = Uint8Array.from({ length: w * h }, (_, c) =>
          (bits >> c) & 1 ? 1 : 2,
        );
        const board = newBoard(pattern, w, h, pattern.deriveClues(g, sp));
        if (solveBoard(pattern, board, 0).verdict === "solved") continue;
        stuck++;
        expect(searchBoard(pattern, board).kind).toBe("several");
      }
    }
    // 2 + 12 + 12 + 128 pictures the lines do not decide, none a line wide.
    expect(stuck).toBe(154);
  });

  it("tells each step one of four ways, from the row its overlap first reaches", () => {
    const plan = game.hint.plan(loaded(`10x10:${TEN}`));
    if (!plan?.ok) throw new Error("no hint");
    const step = (n: number) => {
      const s = plan.steps[n - 1];
      return [s.rung, s.move.set, s.explanation];
    };
    // The ninth row first, the first any run's overlap reaches; then the
    // fifth column, through a square that step shaded.
    expect(step(1)).toEqual([
      "line.overlap",
      [84, SHADED, 85, SHADED],
      "This row's run of 6 can slide only 4 squares, so these squares must be shaded.",
    ]);
    expect(step(2)[1]).toEqual([24, SHADED, 34, SHADED]);
    expect(step(7)).toEqual([
      "line.overlap",
      [2, SHADED, 12, SHADED, 22, SHADED, 32, SHADED],
      "This column's run of 4 has nowhere to slide, so these squares must be shaded.",
    ]);
    expect(step(19)).toEqual([
      "line.unreachable",
      [5, CLEAR, 15, CLEAR, 25, CLEAR],
      "No run of this column can reach the ringed squares, so those squares must be clear.",
    ]);
    expect(step(8)[2]).toMatch(/, given the outlined squares, /);
  });

  it("deals each tier and writes a board it reads back", () => {
    for (const id of ["10x10de", "10x10du", "5x5de", "6x6du", "1x5de"]) {
      const p = game.decodeParams(id);
      for (const seed of ["a", "b"]) {
        const { desc } = game.newDesc(p, randomNew(`pattern-${id}-${seed}`));
        expect(opened(`${id}:${desc}`), `${id}:${desc}`).toBe(id);
        const board = game.newState(p, desc);
        const solved = game.solve(board, board);
        if (!solved.ok) throw new Error(`${id}:${desc}: ${solved.error}`);
        const done = game.executeMove(board, solved.move);
        expect(game.status(done), `${id}:${desc}`).toBe("solved");
        expect(Array.from(done.values).some((v) => v === SHADED)).toBe(true);
      }
    }
  });
});

describeAbsentTiers(game, ["3x3du", "2x3du", "1x5du"]);
describeDealtTiers(game, ["2x4du", "3x4du"]);
