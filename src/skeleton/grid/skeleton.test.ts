/**
 * Skeleton's own behavior: the codecs, a move, the path from a solve to a
 * finished board, the mistake check, a save, and the frame.
 *
 * The board below is small enough to solve by eye:
 *
 *     1 . .      1 # #
 *     1 . 2  ->  1 # 2
 *     . . 0      x x 0
 */
import { describe, expect, it } from "vitest";
import { Midend } from "../../engine/index.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { skeletonGame } from "./index.ts";
import { COL_HINT, COL_SHADED, COL_WRONG } from "./render.ts";
import {
  BLANK,
  CROSSED,
  DIFF_EASY,
  DIFF_NORMAL,
  decodeParams,
  encodeParams,
  executeMove,
  FILLED,
  newState,
  type SkeletonMove,
  validateParams,
} from "./state.ts";

const P = { w: 3, h: 3, diff: DIFF_EASY };
const DESC = "1__1_2__0";
const ID = `${encodeParams(P, true)}:${DESC}`;
/** The answer's shaded squares, as indices. */
const SHADED = [1, 2, 4];

const mark = (index: number, to: 0 | 1 | 2): SkeletonMove => ({
  kind: "mark",
  cells: [{ index, mark: to }],
});

describe("skeleton params", () => {
  it("round-trip through their string, tier included only in full", () => {
    const p = { w: 6, h: 4, diff: DIFF_NORMAL };
    expect(decodeParams(encodeParams(p, true))).toEqual(p);
    expect(decodeParams(encodeParams(p, false))).toEqual({ ...p, diff: DIFF_EASY });
  });

  it("refuse a board too small or too large", () => {
    expect(validateParams({ w: 2, h: 5, diff: DIFF_EASY }, true)).toMatch(/\.$/);
    expect(validateParams({ w: 30, h: 30, diff: DIFF_EASY }, true)).toMatch(/\.$/);
    expect(validateParams(P, true)).toBeNull();
  });
});

describe("skeleton desc", () => {
  it("reads one square a character", () => {
    const s = newState(P, DESC);
    expect(Array.from(s.clues)).toEqual([1, -1, -1, 1, -1, 2, -1, -1, 0]);
    expect(Array.from(s.grid)).toEqual(new Array(9).fill(BLANK));
  });

  it.each([
    ["too short", "1__1_2__"],
    ["too long", "1__1_2__00"],
    ["a number no square can count", "1__1_5__0"],
    ["a stray character", "1__1x2__0"],
  ])("refuses a desc that is %s", (_why, desc) => {
    expect(() => newState(P, desc)).toThrow();
  });
});

describe("skeleton moves", () => {
  const start = newState(P, DESC);
  const ui = skeletonGame.newUi(start);
  const { primary, secondary } = skeletonGame.targetVerbs ?? {};

  it("the left button shades, then crosses out, then clears", () => {
    let s = start;
    for (const want of [FILLED, CROSSED, BLANK]) {
      s = executeMove(s, primary?.apply(s, { x: 1, y: 0 }, ui) as SkeletonMove);
      expect(s.grid[1]).toBe(want);
    }
  });

  it("the right button crosses out first", () => {
    const move = secondary?.apply(start, { x: 1, y: 0 }, ui) as SkeletonMove;
    expect(executeMove(start, move).grid[1]).toBe(CROSSED);
  });

  it("a number takes no mark", () => {
    expect(primary?.apply(start, { x: 0, y: 0 }, ui)).toBeNull();
  });

  it("executeMove leaves the state it was given alone", () => {
    const next = executeMove(start, mark(1, FILLED));
    expect(start.grid[1]).toBe(BLANK);
    expect(next.grid[1]).toBe(FILLED);
    expect(next.clues).toBe(start.clues);
  });
});

describe("skeleton completion", () => {
  const start = newState(P, DESC);

  it("the solve move finishes the board", () => {
    const solved = skeletonGame.solve?.(start, start);
    if (!solved?.ok) throw new Error("expected a solution");
    const end = executeMove(start, solved.move);
    expect(skeletonGame.status(end)).toBe("solved");
    expect(SHADED.every((i) => end.grid[i] === FILLED)).toBe(true);
  });

  it("is reached by shading alone, with nothing crossed out", () => {
    let s = start;
    for (const i of SHADED) {
      expect(skeletonGame.status(s)).toBe("ongoing");
      s = executeMove(s, mark(i, FILLED));
    }
    expect(skeletonGame.status(s)).toBe("solved");
  });

  it("a wrong mark is a mistake, and a right one is not", () => {
    const right = executeMove(start, mark(1, FILLED));
    expect(skeletonGame.findMistakes?.(right)).toEqual([]);
    const wrong = executeMove(right, mark(7, FILLED));
    expect(skeletonGame.findMistakes?.(wrong)).toEqual([{ x: 1, y: 2, kind: "cell" }]);
  });
});

describe("skeleton save", () => {
  it("a saved game loads with its marks", () => {
    const { midend } = renderScenario({
      game: skeletonGame,
      id: ID,
      moves: [mark(1, FILLED), mark(7, CROSSED)],
    });
    const loaded = new Midend(skeletonGame);
    expect(loaded.loadGame(midend.saveGame())).toBeNull();
    expect(loaded.formatAsText()).toBe("1#.\n1.2\n.x0\n");
  });
});

describe("skeleton frame", () => {
  it("draws the board", () => {
    const { recording } = renderScenario({
      game: skeletonGame,
      id: ID,
      moves: [mark(1, FILLED), mark(7, CROSSED)],
    });
    expect(recording.ops).toMatchSnapshot();
  });

  it("shows a piece on a shaded square and none on a blank board", () => {
    const shows = (moves: SkeletonMove[]): boolean =>
      renderScenario({ game: skeletonGame, id: ID, moves }).recording.ops.some((op) =>
        paintsWith(op, COL_SHADED),
      );
    expect(shows([])).toBe(false);
    expect(shows([mark(1, FILLED)])).toBe(true);
  });

  it("washes a mistake and rings a hint's squares", () => {
    const wrong = renderScenario({
      game: skeletonGame,
      id: ID,
      moves: [mark(7, FILLED)],
      showMistakes: true,
    });
    expect(wrong.mistakeCount).toBe(1);
    expect(wrong.recording.ops.some((op) => paintsWith(op, COL_WRONG))).toBe(true);

    const hinted = renderScenario({ game: skeletonGame, id: ID, showHint: true });
    expect(hinted.hint).toBeDefined();
    expect(hinted.recording.ops.some((op) => paintsWith(op, COL_HINT))).toBe(true);
  });
});
