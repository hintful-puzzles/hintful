/**
 * Star Battle's own behavior: the codecs, a move, the path from a solve to a
 * finished board, the mistake check, a save, and the frame.
 *
 * The board below is one the generator dealt, small enough to solve by eye.
 * Its regions, and the one answer:
 *
 *     A A A A B      . . * . .
 *     C A D D B      . . . . *
 *     C C D D D  ->  . * . . .
 *     E E D D D      . . . * .
 *     E D D D D      * . . . .
 */
import { describe, expect, it } from "vitest";
import { Dsf } from "../../engine/dsf.ts";
import { Midend } from "../../engine/index.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { starbattleGame } from "./index.ts";
import {
  COL_ERROR,
  COL_HINT,
  COL_REGION,
  COL_STAR,
  COL_WRONG,
  newDrawState,
} from "./render.ts";
import {
  BLANK,
  CROSSED,
  DIFF_EASY,
  DIFF_NORMAL,
  decodeParams,
  encodeDesc,
  encodeParams,
  executeMove,
  newState,
  STAR,
  type StarbattleMove,
  validateParams,
} from "./state.ts";

const P = { size: 5, stars: 1, diff: DIFF_EASY };
const DESC = "c2aacbca1bb2dc";
const ID = `${encodeParams(P, true)}:${DESC}`;
/** The answer's stars, as indices. */
const STARS = [2, 9, 11, 18, 20];

const mark = (index: number, to: 0 | 1 | 2): StarbattleMove => ({
  kind: "mark",
  cells: [{ index, mark: to }],
});

/** A grid whose regions are its rows, where a star to each row and column
 * can still have two stars touch. */
function rowsAsRegions(size: number): string {
  const joined = new Dsf(size * size);
  for (let i = 0; i < size * size; i++) if (i % size > 0) joined.merge(i - 1, i);
  return encodeDesc(joined, size);
}

describe("starbattle params", () => {
  it("round-trip through their string, tier included only in full", () => {
    const p = { size: 10, stars: 2, diff: DIFF_NORMAL };
    expect(encodeParams(p, true)).toBe("10s2dn");
    expect(decodeParams(encodeParams(p, true))).toEqual(p);
    expect(decodeParams(encodeParams(p, false))).toEqual({ ...p, diff: DIFF_EASY });
  });

  it("refuse a grid too small for its stars", () => {
    expect(validateParams({ size: 7, stars: 2, diff: DIFF_EASY }, true)).toMatch(/\.$/);
    expect(validateParams({ size: 11, stars: 3, diff: DIFF_EASY }, true)).toMatch(
      /\.$/,
    );
    expect(validateParams({ size: 8, stars: 2, diff: DIFF_EASY }, true)).toBeNull();
    expect(validateParams(P, true)).toBeNull();
  });
});

describe("starbattle desc", () => {
  it("reads the regions, numbered as they are met", () => {
    const s = newState(P, DESC);
    expect(Array.from(s.regions.slice(0, 10))).toEqual([0, 0, 0, 0, 1, 2, 0, 3, 3, 1]);
    expect(Array.from(s.grid)).toEqual(new Array(25).fill(BLANK));
  });

  it.each([
    ["too short", "c2aacbca1bb"],
    ["too long", "c2aacbca1bb2dc9"],
    ["a stray character", "c2aacbca1bb2d!"],
    ["a region to every square", "40"],
  ])("refuses a desc that is %s", (_why, desc) => {
    expect(() => newState(P, desc)).toThrow();
  });
});

describe("starbattle moves", () => {
  const start = newState(P, DESC);
  const ui = starbattleGame.newUi(start);
  const { primary, secondary } = starbattleGame.targetVerbs ?? {};

  it("the left button puts a star, then crosses out, then clears", () => {
    let s = start;
    for (const want of [STAR, CROSSED, BLANK]) {
      s = executeMove(s, primary?.apply(s, { x: 1, y: 0 }, ui) as StarbattleMove);
      expect(s.grid[1]).toBe(want);
    }
  });

  it("the right button crosses out first", () => {
    const move = secondary?.apply(start, { x: 1, y: 0 }, ui) as StarbattleMove;
    expect(executeMove(start, move).grid[1]).toBe(CROSSED);
  });

  it("a star rules out the squares it touches and the rest of what it completes", () => {
    const bring = starbattleGame.rulesOut?.bring;
    if (!bring) throw new Error("Star Battle declares what a star rules out");
    // The answer's star in the top row: the squares touching it, and the
    // rest of its row, its column and its region, each of which it completes.
    const brought = bring(start, executeMove(start, mark(2, STAR)));
    if (brought?.kind !== "mark") throw new Error("a star brings crosses");
    expect(brought.cells.map((c) => c.index)).toEqual([
      0, 1, 3, 4, 6, 7, 8, 12, 17, 22,
    ]);
    expect(brought.cells.every((c) => c.mark === CROSSED)).toBe(true);
    // A square already marked is left as the player has it.
    const marked = executeMove(start, mark(7, STAR));
    const beside = bring(marked, executeMove(marked, mark(2, STAR)));
    if (beside?.kind !== "mark") throw new Error("a star brings crosses");
    expect(beside.cells.map((c) => c.index)).not.toContain(7);
    // A cross, and a star taken away, bring nothing.
    expect(bring(start, executeMove(start, mark(2, CROSSED)))).toBeNull();
    const starred = executeMove(start, mark(2, STAR));
    expect(bring(starred, executeMove(starred, mark(2, BLANK)))).toBeNull();
  });

  it("executeMove leaves the state it was given alone", () => {
    const next = executeMove(start, mark(1, STAR));
    expect(start.grid[1]).toBe(BLANK);
    expect(next.grid[1]).toBe(STAR);
    expect(next.regions).toBe(start.regions);
  });
});

describe("starbattle completion", () => {
  const start = newState(P, DESC);

  it("the solve move finishes the board", () => {
    const solved = starbattleGame.solve?.(start, start);
    if (!solved?.ok) throw new Error("expected a solution");
    const end = executeMove(start, solved.move);
    expect(starbattleGame.status(end)).toBe("solved");
    expect(Array.from(end.grid.keys()).filter((i) => end.grid[i] === STAR)).toEqual(
      STARS,
    );
  });

  it("is reached by stars alone, with nothing crossed out", () => {
    let s = start;
    for (const i of STARS) {
      expect(starbattleGame.status(s)).toBe("ongoing");
      s = executeMove(s, mark(i, STAR));
    }
    expect(starbattleGame.status(s)).toBe("solved");
  });

  it("is not reached while two stars touch at a corner", () => {
    const p = { size: 4, stars: 1, diff: DIFF_EASY };
    const rows = newState(p, rowsAsRegions(4));
    const place = (cells: number[]) =>
      cells.reduce((s, i) => executeMove(s, mark(i, STAR)), rows);
    // A star to every row, column and region both times.
    expect(starbattleGame.status(place([0, 5, 10, 15]))).toBe("ongoing");
    expect(starbattleGame.status(place([1, 7, 8, 14]))).toBe("solved");
  });

  it("a wrong mark is a mistake, and a right one is not", () => {
    const right = executeMove(executeMove(start, mark(2, STAR)), mark(0, CROSSED));
    expect(starbattleGame.findMistakes?.(right)).toEqual([]);
    const wrong = executeMove(executeMove(right, mark(7, STAR)), mark(9, CROSSED));
    expect(starbattleGame.findMistakes?.(wrong)).toEqual([
      { x: 2, y: 1, kind: "cell" },
      { x: 4, y: 1, kind: "cell" },
    ]);
  });
});

describe("starbattle save", () => {
  it("a saved game loads with its marks", () => {
    const { midend } = renderScenario({
      game: starbattleGame,
      id: ID,
      moves: [mark(2, STAR), mark(7, CROSSED)],
    });
    const loaded = new Midend(starbattleGame);
    expect(loaded.loadGame(midend.saveGame())).toBeNull();
    expect(loaded.formatAsText()).toBe(
      [
        "A. A. A* A. B.",
        "C. A. Dx D. B.",
        "C. C. D. D. D.",
        "E. E. D. D. D.",
        "E. D. D. D. D.",
        "",
      ].join("\n"),
    );
  });
});

describe("starbattle frame", () => {
  it("draws the board", () => {
    const { recording } = renderScenario({
      game: starbattleGame,
      id: ID,
      moves: [mark(2, STAR), mark(7, CROSSED)],
    });
    expect(recording.ops).toMatchSnapshot();
  });

  it("gives a region one fill, and the regions beside it another", () => {
    const { size, regions } = newState(P, DESC);
    const { surfaces } = newDrawState(newState(P, DESC), 40);
    let walls = 0;
    regions.forEach((r, i) => {
      expect(surfaces[i]).toBeGreaterThanOrEqual(COL_REGION);
      for (const j of [(i + 1) % size === 0 ? i : i + 1, i + size]) {
        if (j === i || j >= regions.length) continue;
        expect(surfaces[j] === surfaces[i], `squares ${i} and ${j}`).toBe(
          regions[j] === r,
        );
        if (regions[j] !== r) walls++;
      }
    });
    expect(walls).toBeGreaterThan(10);
  });

  const paints = (moves: StarbattleMove[], color: number): boolean =>
    renderScenario({ game: starbattleGame, id: ID, moves }).recording.ops.some((op) =>
      paintsWith(op, color),
    );

  it("shows a star where one is placed and none on a blank board", () => {
    expect(paints([], COL_STAR)).toBe(false);
    expect(paints([mark(2, STAR)], COL_STAR)).toBe(true);
  });

  it("turns stars red that touch, or are too many for their row", () => {
    expect(paints([mark(2, STAR), mark(9, STAR)], COL_ERROR)).toBe(false);
    // Touching at a corner.
    expect(paints([mark(2, STAR), mark(8, STAR)], COL_ERROR)).toBe(true);
    // Two in one row, apart.
    expect(paints([mark(0, STAR), mark(3, STAR)], COL_ERROR)).toBe(true);
  });

  it("washes a mistake and rings a hint's squares", () => {
    const wrong = renderScenario({
      game: starbattleGame,
      id: ID,
      moves: [mark(7, STAR)],
      showMistakes: true,
    });
    expect(wrong.mistakeCount).toBe(1);
    expect(wrong.recording.ops.some((op) => paintsWith(op, COL_WRONG))).toBe(true);

    const hinted = renderScenario({ game: starbattleGame, id: ID, showHint: true });
    expect(hinted.hint).toBeDefined();
    expect(hinted.recording.ops.some((op) => paintsWith(op, COL_HINT))).toBe(true);
  });
});
