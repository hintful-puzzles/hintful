/**
 * Norinori's own behavior: the codecs, a move, the path from a solve to a
 * finished board, the mistake check, a save, and the frame.
 *
 * The board below is small enough to solve by eye. B and C are two squares
 * each, so both are shaded; A's two are the pair left on its top row that
 * touches neither:
 *
 *     A A A A      . . # #
 *     A B A A      . # . .
 *     A B A C  ->  . # . #
 *     A A A C      . . . #
 */
import { describe, expect, it } from "vitest";
import { Dsf } from "../../engine/board/dsf.ts";
import { COL_ERROR } from "../../engine/color/roles.ts";
import { Midend } from "../../engine/index.ts";
import { ringsOf } from "../../engine/testing/mark-shape.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { norinoriGame } from "./index.ts";
import { COL_SHADED, COL_WRONG } from "./render.ts";
import {
  BLANK,
  CROSSED,
  DIFF_EASY,
  decodeParams,
  encodeDesc,
  encodeParams,
  executeMove,
  type NorinoriMove,
  newState,
  SHADED,
  validateParams,
} from "./state.ts";

const P = { w: 4, h: 4, diff: DIFF_EASY };
const DESC = "c1a2baeab";
const ID = `${encodeParams(P, true)}:${DESC}`;
/** The answer's shaded squares, as indices. */
const ANSWER = [2, 3, 5, 9, 11, 15];

const mark = (index: number, to: 0 | 1 | 2): NorinoriMove => ({
  kind: "mark",
  cells: [{ index, mark: to }],
});

describe("norinori params", () => {
  it("round-trip through their string, tier included only in full", () => {
    const p = { w: 6, h: 4, diff: DIFF_EASY + 2 };
    expect(decodeParams(encodeParams(p, true))).toEqual(p);
    // The brief form leaves the tier at the default's.
    expect(decodeParams(encodeParams(p, false))).toEqual({ ...p, diff: DIFF_EASY });
  });

  it("refuse a board too small or too large", () => {
    expect(validateParams({ w: 3, h: 5, diff: DIFF_EASY }, true)).toMatch(/\.$/);
    expect(validateParams({ w: 30, h: 30, diff: DIFF_EASY }, true)).toMatch(/\.$/);
    expect(validateParams(P, true)).toBeNull();
  });
});

describe("norinori desc", () => {
  it("reads the regions from their walls", () => {
    const s = newState(P, DESC);
    expect(Array.from(s.regions)).toEqual([
      0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 2, 0, 0, 0, 2,
    ]);
    expect(Array.from(s.grid)).toEqual(new Array(16).fill(BLANK));
  });

  it.each([
    ["too short", "c1a2baea"],
    ["too long", "c1a2baeabb"],
    ["a stray character", "c1a2b!eab"],
  ])("refuses a desc that is %s", (_why, desc) => {
    expect(() => newState(P, desc)).toThrow();
  });

  it("refuses a region of one square, which cannot hold two shaded", () => {
    // No square joined to another: sixteen regions of one square each.
    expect(() => newState(P, encodeDesc(new Dsf(16), 4, 4))).toThrow();
  });
});

describe("norinori moves", () => {
  const start = newState(P, DESC);
  const ui = norinoriGame.newUi(start);
  const { primary, secondary } = norinoriGame.targetVerbs ?? {};

  it("the left button shades, then crosses out, then clears", () => {
    let s = start;
    for (const want of [SHADED, CROSSED, BLANK]) {
      s = executeMove(s, primary?.apply(s, { x: 1, y: 0 }, ui) as NorinoriMove);
      expect(s.grid[1]).toBe(want);
    }
  });

  it("the right button crosses out first", () => {
    const move = secondary?.apply(start, { x: 1, y: 0 }, ui) as NorinoriMove;
    expect(executeMove(start, move).grid[1]).toBe(CROSSED);
  });

  it("executeMove leaves the state it was given alone", () => {
    const next = executeMove(start, mark(1, SHADED));
    expect(start.grid[1]).toBe(BLANK);
    expect(next.grid[1]).toBe(SHADED);
    expect(next.regions).toBe(start.regions);
  });
});

describe("norinori completion", () => {
  const start = newState(P, DESC);

  it("the solve move finishes the board", () => {
    const solved = norinoriGame.solve(start, start);
    if (!solved?.ok) throw new Error("expected a solution");
    const end = executeMove(start, solved.move);
    expect(norinoriGame.status(end)).toBe("solved");
    expect(ANSWER.every((i) => end.grid[i] === SHADED)).toBe(true);
  });

  it("is reached by shading alone, with nothing crossed out", () => {
    let s = start;
    for (const i of ANSWER) {
      expect(norinoriGame.status(s)).toBe("ongoing");
      s = executeMove(s, mark(i, SHADED));
    }
    expect(norinoriGame.status(s)).toBe("solved");
  });

  it("is not reached by two dominoes that touch along a side", () => {
    // A's two in its top left corner: every region holds two, but the one
    // above B touches B's domino.
    let s = start;
    for (const i of [0, 1, 5, 9, 11, 15]) s = executeMove(s, mark(i, SHADED));
    expect(norinoriGame.status(s)).toBe("ongoing");
  });

  it("a wrong mark is a mistake, and a right one is not", () => {
    const right = executeMove(start, mark(2, SHADED));
    expect(norinoriGame.findMistakes?.(right)).toEqual([]);
    const wrong = executeMove(right, mark(0, SHADED));
    expect(norinoriGame.findMistakes?.(wrong)).toEqual([{ x: 0, y: 0, kind: "cell" }]);
  });
});

describe("norinori save", () => {
  it("a saved game loads with its marks", () => {
    const { midend } = renderScenario({
      game: norinoriGame,
      id: ID,
      moves: [mark(2, SHADED), mark(0, CROSSED)],
    });
    const loaded = new Midend(norinoriGame);
    expect(loaded.loadGame(midend.saveGame())).toBeNull();
    expect(loaded.formatAsText()).toBe(
      "Ax A. A# A.\nA. B. A. A.\nA. B. A. C.\nA. A. A. C.\n",
    );
  });
});

describe("norinori frame", () => {
  it("draws the board", () => {
    const { recording } = renderScenario({
      game: norinoriGame,
      id: ID,
      moves: [mark(2, SHADED), mark(0, CROSSED)],
    });
    expect(recording.ops).toMatchSnapshot();
  });

  it("shows a piece on a shaded square and none on a blank board", () => {
    const shows = (moves: NorinoriMove[]): boolean =>
      renderScenario({ game: norinoriGame, id: ID, moves }).recording.ops.some((op) =>
        paintsWith(op, COL_SHADED),
      );
    expect(shows([])).toBe(false);
    expect(shows([mark(2, SHADED)])).toBe(true);
  });

  it("reddens a shaded square beside two others, and no other", () => {
    const reds = (moves: NorinoriMove[]): boolean =>
      renderScenario({ game: norinoriGame, id: ID, moves }).recording.ops.some((op) =>
        paintsWith(op, COL_ERROR),
      );
    expect(reds([mark(1, SHADED), mark(2, SHADED)])).toBe(false);
    expect(reds([mark(1, SHADED), mark(2, SHADED), mark(3, SHADED)])).toBe(true);
  });

  it("washes a mistake and rings a hint's squares", () => {
    const wrong = renderScenario({
      game: norinoriGame,
      id: ID,
      moves: [mark(0, SHADED)],
      showMistakes: true,
    });
    expect(wrong.mistakeCount).toBe(1);
    expect(wrong.recording.ops.some((op) => paintsWith(op, COL_WRONG))).toBe(true);

    const hinted = renderScenario({ game: norinoriGame, id: ID, showHint: true });
    expect(hinted.hint).toBeDefined();
    expect(ringsOf(hinted.recording.ops).length).toBeGreaterThan(0);
  });
});
