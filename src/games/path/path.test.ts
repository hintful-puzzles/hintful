/**
 * Path's own behavior: the codecs, drawing a line, the path from a solve to a
 * finished board, the mistake check, a save, and the frame.
 *
 * The board below, a Pairs board, is small enough to solve by eye; the
 * Path ruleset's board is at the end. Edges are numbered as
 * `state.ts`'s `Geometry` numbers them: the nine across first, in reading
 * order of their left square, then the eight up and down.
 *
 *     1 2 1 .      1 2 1-+
 *     . . 2 .      | |   |
 *     . . . .      + +-2 +
 *                  |     |
 *                  +-+-+-+
 */
import { describe, expect, it } from "vitest";
import { Midend } from "../../engine/index.ts";
import { CROSS, LINE, OPEN } from "../../engine/line-drawing.ts";
import {
  CURSOR_DOWN,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  MOD_SHFT,
  RIGHT_BUTTON,
  RIGHT_RELEASE,
} from "../../engine/pointer.ts";
import { pointAtEdge, squareEdges } from "../../engine/square-edges.ts";
import { ringsOf } from "../../engine/testing/mark-shape.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import type { Point } from "../../engine/types.ts";
import { countAnswers } from "./count-answers.ts";
import { pathGame } from "./index.ts";
import { COL_ERROR, COL_WALL, centerOf, layout, newDrawState } from "./render.ts";
import { answerOf, solvePath } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  DIFF_TRICKY,
  DIFF_UNREASONABLE,
  decodeParams,
  encodeDesc,
  encodeParams,
  executeMove,
  MODE_PAIRS,
  MODE_PATH,
  newState,
  type PathMove,
  type PathState,
  validateParams,
} from "./state.ts";

const P = { w: 4, h: 3, diff: DIFF_EASY, mode: MODE_PAIRS };
const DESC = "1_2_1c2e";
const ID = `${encodeParams(P, true)}:${DESC}`;
/** The answer's lines, as edges. */
const ANSWER = [2, 4, 6, 7, 8, 9, 10, 12, 13, 16];

const set = (edge: number, mark: 0 | 1 | 2): PathMove => ({
  kind: "edges",
  changes: [{ edge, mark }],
});

/** The edges of `s`'s answer that take lines, where the ladder finds it and
 * the search proves it the only one. */
function answerLines(s: PathState): number[] | null {
  if (solvePath(s, DIFF_TRICKY, { edges: s.edges }).verdict !== "solved") return null;
  const answer = answerOf(s);
  if (answer.kind !== "one") return null;
  return answer.solution.flatMap((m, e) => (m === LINE ? [e] : []));
}

describe("path boards dealt before the Checks", () => {
  // Each was dealt at Tricky before 2026-10-28, two of them pins of the hint
  // test, and needs a lookahead the ladder no longer has.
  it.each([
    "6x6zdt:b3d5g2e4d1c6e,nzpb",
    "8x8zdt:n3c4a11_1c5g6b9_10a2a8f7c12k,akpzbzoj",
    "7x7dt:e1d2a3_1b4_5d2d3h6a5a6d4c",
  ])("%s opens at Unreasonable and keeps its one answer", (id) => {
    const [params, desc] = id.split(":");
    const p = decodeParams(params);
    const contract = pathGame.difficulty;
    if (!contract) throw new Error("Path is tiered");
    expect(contract.solveAtCap(p, desc, DIFF_TRICKY)).toBe("unsolved");
    expect(contract.solveAtCap(p, desc, DIFF_UNREASONABLE)).toBe("solved");
    expect(pathGame.solve?.(newState(p, desc), newState(p, desc)).ok).toBe(true);
    const m = new Midend(pathGame);
    expect(m.newGameFromId(id)).toBeNull();
    expect(m.getParams()).toBe(`${params.slice(0, -1)}u`);
  });
});

describe("path boards the hand-written ladder dealt", () => {
  // Each was dealt on 2026-11-07, before the ladder was described, and a
  // `pairBreaks` that read its three edges as open after it had drawn one
  // called it inconsistent.
  it.each([
    "5x5dn:1c2a2d3a4b1c4b3a",
    "7x7dt:f1_2d2c3f4_3e1b5c4h6_5_6",
    "8x8zdt:c7b9k8b12_10l11e6a5_2b3a4d1i,zjzazu",
  ])("%s grades at its tier", (id) => {
    const [params, desc] = id.split(":");
    const p = decodeParams(params);
    const contract = pathGame.difficulty;
    if (!contract) throw new Error("Path is tiered");
    expect(contract.solveAtCap(p, desc, p.diff - 1)).toBe("unsolved");
    expect(contract.solveAtCap(p, desc, p.diff)).toBe("solved");
  });
});

describe("path params", () => {
  it("round-trip through their string, tier included only in full", () => {
    const p = { w: 6, h: 4, diff: DIFF_EASY, mode: MODE_PAIRS };
    expect(decodeParams(encodeParams(p, true))).toEqual(p);
    // The brief form leaves the tier at the default's.
    expect(decodeParams(encodeParams(p, false))).toEqual({ ...p, diff: DIFF_NORMAL });
  });

  it("write Path as a z after the size, and Pairs as nothing", () => {
    const onePath = { w: 6, h: 6, diff: DIFF_TRICKY, mode: MODE_PATH };
    expect(encodeParams(onePath, true)).toBe("6x6zdt");
    expect(decodeParams("6x6zdt")).toEqual(onePath);
    expect(decodeParams("6x6dt").mode).toBe(MODE_PAIRS);
  });

  it("refuse a board too small or too large", () => {
    expect(validateParams({ ...P, w: 2, h: 5 }, true)).toMatch(/\.$/);
    expect(validateParams({ ...P, w: 30, h: 30 }, true)).toMatch(/\.$/);
    expect(validateParams(P, true)).toBeNull();
  });
});

describe("path desc", () => {
  it("reads the numbers, a letter for each run of squares without one", () => {
    const s = newState(P, DESC);
    expect(Array.from(s.ends)).toEqual([1, 2, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0]);
    expect(Array.from(s.edges)).toEqual(new Array(17).fill(OPEN));
    expect(encodeDesc(s.ends)).toBe(DESC);
  });

  it("writes a separator between two numbers side by side, and reads two digits", () => {
    const ends = new Uint8Array(12);
    for (let v = 1; v <= 6; v++) ends[2 * v - 2] = ends[2 * v - 1] = v;
    const desc = encodeDesc(ends);
    expect(desc).toBe("1_1_2_2_3_3_4_4_5_5_6_6");
    expect(Array.from(newState(P, desc).ends)).toEqual(Array.from(ends));
  });

  it.each([
    ["too short", "1_2_1c2d"],
    ["too long", "1_2_1c2f"],
    ["a number on one square", "1_2_1c3e"],
    ["a gap in the numbering", "1_3_1c3e"],
    ["two numbers with no separator", "12_1c2e"],
    ["no number at all", "l"],
    ["a stray character", "1_2x1c2e"],
  ])("refuses a desc with %s", (_why, desc) => {
    expect(() => newState(P, desc)).toThrow();
  });

  it("has one answer, which the ladder finds", () => {
    const s = newState(P, DESC);
    expect(countAnswers(s)).toBe(1);
    expect(answerLines(s)).toEqual(ANSWER);
  });
});

describe("path input", () => {
  const start = newState(P, DESC);
  const TS = 40;
  const ds = newDrawState(start, TS);
  const at = (i: number): Point => centerOf(start, TS, i);

  /** The move the buttons make, pressed in turn at the points given. */
  function play(state: PathState, presses: [number, Point][]): PathMove | null {
    const ui = pathGame.newUi(state);
    let made: PathMove | null = null;
    for (const [button, p] of presses) {
      const r = pathGame.interpretMove(state, ui, ds, p, button);
      if (r !== null && typeof r === "object") made = r;
    }
    return made;
  }

  it("a drag through squares lays a line along the edges it passes", () => {
    const move = play(start, [
      [LEFT_BUTTON, at(1)],
      [LEFT_DRAG, at(5)],
      [LEFT_DRAG, at(6)],
      [LEFT_RELEASE, at(6)],
    ]);
    expect(move).toEqual({
      kind: "edges",
      changes: [
        { edge: 4, mark: LINE },
        { edge: 10, mark: LINE },
      ],
    });
  });

  it("a quick drag along a row lays every edge on the way", () => {
    const move = play(start, [
      [LEFT_BUTTON, at(8)],
      [LEFT_DRAG, at(11)],
      [LEFT_RELEASE, at(11)],
    ]);
    expect(move?.kind === "edges" && move.changes.map((c) => c.edge)).toEqual([
      6, 7, 8,
    ]);
  });

  it("a drag drawn back over its end takes back the step", () => {
    const move = play(start, [
      [LEFT_BUTTON, at(8)],
      [LEFT_DRAG, at(9)],
      [LEFT_DRAG, at(10)],
      [LEFT_DRAG, at(9)],
      [LEFT_RELEASE, at(9)],
    ]);
    expect(move).toEqual({ kind: "edges", changes: [{ edge: 6, mark: LINE }] });
  });

  it("a drag that starts along a line takes lines up", () => {
    const drawn = executeMove(start, {
      kind: "edges",
      changes: [6, 7].map((edge) => ({ edge, mark: LINE })),
    });
    const move = play(drawn, [
      [LEFT_BUTTON, at(8)],
      [LEFT_DRAG, at(10)],
      [LEFT_RELEASE, at(10)],
    ]);
    expect(move).toEqual({
      kind: "edges",
      changes: [
        { edge: 6, mark: OPEN },
        { edge: 7, mark: OPEN },
      ],
    });
  });

  it("a drag along a line and on past its end carries the line on", () => {
    const drawn = executeMove(start, set(6, LINE));
    const move = play(drawn, [
      [LEFT_BUTTON, at(8)],
      [LEFT_DRAG, at(10)],
      [LEFT_RELEASE, at(10)],
    ]);
    expect(move).toEqual(set(7, LINE));
  });

  it("a stroke from a number replaces the line it had once it leaves it", () => {
    // The corner 1's line runs down two squares. A stroke down one only
    // retraces it and changes nothing; one that turns off it keeps what it
    // retraced and takes up the rest.
    const lined = executeMove(start, {
      kind: "edges",
      changes: [9, 13].map((edge) => ({ edge, mark: LINE })),
    });
    expect(
      play(lined, [
        [LEFT_BUTTON, at(0)],
        [LEFT_DRAG, at(4)],
        [LEFT_RELEASE, at(4)],
      ]),
    ).toBeNull();
    expect(
      play(lined, [
        [LEFT_BUTTON, at(0)],
        [LEFT_DRAG, at(4)],
        [LEFT_DRAG, at(5)],
        [LEFT_RELEASE, at(5)],
      ]),
    ).toEqual({
      kind: "edges",
      changes: [
        { edge: 3, mark: LINE },
        { edge: 13, mark: OPEN },
      ],
    });
  });

  it("a drag stops where a square already has its lines, and at a cross", () => {
    // The 1 in the corner has its line already, so a line from the 2 beside
    // it stops short of it.
    const lined = executeMove(start, set(9, LINE));
    expect(
      play(lined, [
        [LEFT_BUTTON, at(1)],
        [LEFT_DRAG, at(0)],
        [LEFT_RELEASE, at(0)],
      ]),
    ).toBeNull();
    const crossed = executeMove(start, set(7, CROSS));
    const move = play(crossed, [
      [LEFT_BUTTON, at(8)],
      [LEFT_DRAG, at(11)],
      [LEFT_RELEASE, at(11)],
    ]);
    expect(move).toEqual(set(6, LINE));
  });

  it("a click by an edge lays or lifts its line, and a right click crosses it", () => {
    const p = pointAtEdge(squareEdges(start.w, start.h), layout(TS), 9);
    expect(
      play(start, [
        [LEFT_BUTTON, p],
        [LEFT_RELEASE, p],
      ]),
    ).toEqual(set(9, LINE));
    const lined = executeMove(start, set(9, LINE));
    expect(
      play(lined, [
        [LEFT_BUTTON, p],
        [LEFT_RELEASE, p],
      ]),
    ).toEqual(set(9, OPEN));
    expect(
      play(start, [
        [RIGHT_BUTTON, p],
        [RIGHT_RELEASE, p],
      ]),
    ).toEqual(set(9, CROSS));
    // A line takes no cross.
    expect(
      play(lined, [
        [RIGHT_BUTTON, p],
        [RIGHT_RELEASE, p],
      ]),
    ).toBeNull();
  });

  it("the keyboard draws with Enter and the arrows, and crosses with Shift", () => {
    const keys = (buttons: number[]): [number, Point][] =>
      buttons.map((b) => [b, { x: 0, y: 0 }]);
    // Show the cursor on the corner 1, take it down two squares, and finish.
    expect(
      play(
        start,
        keys([CURSOR_SELECT, CURSOR_SELECT, CURSOR_DOWN, CURSOR_DOWN, CURSOR_SELECT]),
      ),
    ).toEqual({
      kind: "edges",
      changes: [
        { edge: 9, mark: LINE },
        { edge: 13, mark: LINE },
      ],
    });
    expect(play(start, keys([CURSOR_SELECT, CURSOR_RIGHT | MOD_SHFT]))).toEqual(
      set(0, CROSS),
    );
  });
});

describe("path completion", () => {
  const start = newState(P, DESC);
  const lines = (state: PathState, edges: readonly number[]): PathState =>
    executeMove(state, {
      kind: "edges",
      changes: edges.map((edge) => ({ edge, mark: LINE })),
    });

  it("the solve move finishes the board", () => {
    const solved = pathGame.solve?.(start, start);
    if (!solved?.ok) throw new Error("expected a solution");
    expect(pathGame.status(executeMove(start, solved.move))).toBe("solved");
  });

  it("is reached by lines alone, with nothing crossed out", () => {
    expect(pathGame.status(lines(start, ANSWER.slice(1)))).toBe("ongoing");
    expect(pathGame.status(lines(start, ANSWER))).toBe("solved");
  });

  it("a line the answer lacks and a cross on one it has are mistakes", () => {
    const right = lines(start, [9]);
    expect(pathGame.findMistakes?.(right)).toEqual([]);
    expect(pathGame.findMistakes?.(lines(right, [5]))).toEqual([{ edge: 5 }]);
    expect(pathGame.findMistakes?.(executeMove(right, set(13, CROSS)))).toEqual([
      { edge: 13 },
    ]);
    // A cross the answer agrees with is not one.
    expect(pathGame.findMistakes?.(executeMove(right, set(0, CROSS)))).toEqual([]);
  });
});

describe("path save", () => {
  it("a saved game loads with its lines and crosses", () => {
    const { midend } = renderScenario({
      game: pathGame,
      id: ID,
      moves: [set(9, LINE), set(0, CROSS)],
    });
    const loaded = new Midend(pathGame);
    expect(loaded.loadGame(midend.saveGame())).toBeNull();
    expect(loaded.formatAsText()).toBe("1x2 1 +\n|      \n+ + 2 +\n       \n+ + + +\n");
  });
});

describe("path frame", () => {
  it("draws the board", () => {
    const { recording } = renderScenario({
      game: pathGame,
      id: ID,
      moves: [set(9, LINE), set(4, LINE), set(0, CROSS)],
    });
    expect(recording.ops).toMatchSnapshot();
  });

  it("draws a line in its pair's color once it reaches a number, and in ink before", () => {
    // Edge 9 runs down from the 1 in the corner, and edge 13 below it.
    const ops = (moves: PathMove[]) =>
      renderScenario({ game: pathGame, id: ID, moves }).recording.ops;
    const lines = (moves: PathMove[]): Set<string> =>
      new Set(ops(moves).flatMap((op) => (op.op === "line" ? [op.rgb] : [])));
    // The corner's 1 is the first square drawn, and its disc its first
    // circle that is not the black edge under it. A pair's line is drawn on
    // a black edge too, and ink is black in the light scheme.
    const black = "rgb(0, 0, 0)";
    const disc = ops([]).find((op) => op.op === "circle" && op.fillRgb !== black);
    if (disc?.op !== "circle") throw new Error("no disc drawn");
    expect(lines([set(13, LINE)])).toEqual(new Set([black]));
    expect(lines([set(9, LINE)])).toEqual(new Set([black, disc.fillRgb]));
    expect(lines([set(13, LINE), set(9, LINE)])).toEqual(
      new Set([black, disc.fillRgb]),
    );
  });

  it("draws a line red where it joins two different numbers, and not before", () => {
    const red = (moves: PathMove[]): boolean =>
      renderScenario({ game: pathGame, id: ID, moves }).recording.ops.some((op) =>
        paintsWith(op, COL_ERROR),
      );
    expect(red([set(9, LINE)])).toBe(false);
    expect(red([set(0, LINE)])).toBe(true);
  });

  it("draws a mistake red, and rings a hint's edges", () => {
    const wrong = renderScenario({
      game: pathGame,
      id: ID,
      moves: [set(5, LINE)],
      showMistakes: true,
    });
    expect(wrong.mistakeCount).toBe(1);
    expect(wrong.recording.ops.some((op) => paintsWith(op, COL_ERROR))).toBe(true);

    const hinted = renderScenario({ game: pathGame, id: ID, showHint: true });
    expect(hinted.hint).toBeDefined();
    expect(ringsOf(hinted.recording.ops).length).toBeGreaterThan(0);
  });
});

/**
 * The Path ruleset on a board of the same size, its edges numbered as above:
 *
 *     1 . . .      1-+-+-+
 *     . . . 2            |
 *     3 . . 4      +-+-+-2
 *                  |
 *                  3-+-+-4
 */
describe("path, the one-line ruleset", () => {
  const Z = { ...P, mode: MODE_PATH };
  const ONE_PATH = "1f2_3b4";
  const ONE_PATH_ANSWER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 12, 13];
  /** The same numbers with a wall between the second squares of the first
   * two rows, edge 10, which the answer does not take. */
  const WALLED = "1f2_3b4,jf";
  const start = newState(Z, ONE_PATH);
  const lines = (state: PathState, edges: readonly number[]): PathState =>
    executeMove(state, {
      kind: "edges",
      changes: edges.map((edge) => ({ edge, mark: LINE })),
    });
  /** The edges a left-button stroke through `cells` on `drawn` changes, as
   * `<edge>+` for a line laid and `<edge>-` for one taken up, or `null` for
   * no move. */
  const stroke = (drawn: PathState, cells: number[]): string[] | null => {
    const ds = newDrawState(drawn, 40);
    const ui = pathGame.newUi(drawn);
    let made: PathMove | null = null;
    const presses: [number, number][] = [
      [LEFT_BUTTON, cells[0]],
      ...cells.slice(1).map((c): [number, number] => [LEFT_DRAG, c]),
      [LEFT_RELEASE, cells[cells.length - 1]],
    ];
    for (const [button, c] of presses) {
      const r = pathGame.interpretMove(drawn, ui, ds, centerOf(drawn, 40, c), button);
      if (r !== null && typeof r === "object") made = r;
    }
    return made?.kind === "edges"
      ? made.changes.map(({ edge, mark }) => `${edge}${mark === LINE ? "+" : "-"}`)
      : null;
  };

  it("reads each number on one square, and refuses one twice or a gap", () => {
    expect(Array.from(start.ends)).toEqual([1, 0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 4]);
    expect(encodeDesc(start.ends)).toBe(ONE_PATH);
    // The 1 and the 4 end the line, and every other square takes two.
    expect(Array.from(start.takes)).toEqual([1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1]);
    for (const desc of ["1f2_3b3", "1f2_3b5", "1k"])
      expect(() => newState(Z, desc), desc).toThrow();
    // A Pairs board's numbers are not a Path board, nor the other way round.
    expect(() => newState(Z, DESC)).toThrow();
    expect(() => newState(P, ONE_PATH)).toThrow();
  });

  it("reads its walls, which start crossed and round-trip", () => {
    const walled = newState(Z, WALLED);
    expect(Array.from(walled.walls).flatMap((w, e) => (w ? [e] : []))).toEqual([10]);
    expect(walled.edges[10]).toBe(CROSS);
    expect(encodeDesc(walled.ends, walled.walls)).toBe(WALLED);
  });

  it("has one answer, which the ladder finds", () => {
    expect(countAnswers(start)).toBe(1);
    expect(answerLines(start)).toEqual(ONE_PATH_ANSWER);
  });

  it("is solved by one line through the numbers in order, and not out of order", () => {
    expect(pathGame.status(lines(start, ONE_PATH_ANSWER))).toBe("solved");
    expect(pathGame.status(lines(start, ONE_PATH_ANSWER.slice(1)))).toBe("ongoing");
    // Every square has its lines, but the line passes the 3 before the 2.
    const outOfOrder = [9, 13, 6, 14, 10, 1, 2, 12, 5, 15, 8];
    expect(pathGame.status(lines(start, outOfOrder))).toBe("ongoing");
  });

  it("keeps a wall: no click, cross or drag changes it, and Solve leaves it", () => {
    const walled = newState(Z, WALLED);
    const ds = newDrawState(walled, 40);
    const p = pointAtEdge(squareEdges(walled.w, walled.h), layout(40), 10);
    const ui = pathGame.newUi(walled);
    for (const [press, release] of [
      [LEFT_BUTTON, LEFT_RELEASE],
      [RIGHT_BUTTON, RIGHT_RELEASE],
    ]) {
      pathGame.interpretMove(walled, ui, ds, p, press);
      const made = pathGame.interpretMove(walled, ui, ds, p, release);
      expect(made === null || typeof made !== "object").toBe(true);
    }
    // A move that names the wall, as a crafted save might, leaves it.
    expect(executeMove(walled, set(10, OPEN)).edges[10]).toBe(CROSS);
    const solved = pathGame.solve?.(walled, walled);
    if (!solved?.ok) throw new Error("expected a solution");
    expect(executeMove(walled, solved.move).edges[10]).toBe(CROSS);
  });

  it("a stroke from a number draws the line ahead of it again, and keeps the line behind", () => {
    // The whole answer is drawn. A stroke from the 2 replaces the line on
    // from it, through the 3 to the 4, and keeps the 1's line into it.
    const drawn = lines(start, ONE_PATH_ANSWER);
    // Over the same squares again, as a finger slipping off the 2 along its
    // line, or back onto the 2: nothing changes.
    expect(stroke(drawn, [7, 6, 5, 4])).toBeNull();
    expect(stroke(drawn, [7, 6, 7])).toBeNull();
    // Along it and off it, down from the second square of the middle row:
    // what it retraced is kept, and the rest of the old line ahead goes.
    expect(stroke(drawn, [7, 6, 5, 9])).toEqual(["3-", "6-", "7-", "8-", "13-", "14+"]);
    // Down to the 4 instead: all of the old line ahead goes.
    expect(stroke(drawn, [7, 11])).toEqual([
      "3-",
      "4-",
      "5-",
      "6-",
      "7-",
      "8-",
      "13-",
      "16+",
    ]);
  });

  it("a line from a number that reaches no number runs opposite to its other side", () => {
    // Alone on a middle number it may run either way, so it stays: the 3's
    // line up toward the 2, and the 2's left toward the 3.
    expect(stroke(lines(start, [13]), [8, 9, 10, 11])).toEqual(["6+", "7+", "8+"]);
    expect(stroke(lines(start, [5]), [7, 3])).toEqual(["12+"]);
    // Beside the line behind it, it is ahead, and goes.
    expect(stroke(lines(start, [0, 1, 2, 12, 5]), [7, 11])).toEqual(["5-", "16+"]);
    // The 1's is ahead.
    expect(stroke(lines(start, [9]), [0, 1])).toEqual(["0+", "9-"]);
  });

  it("draws its walls, and its line in a color that runs from the 1 to the 4", () => {
    const id = (desc: string) => `${encodeParams(Z, true)}:${desc}`;
    const walled = renderScenario({ game: pathGame, id: id(WALLED) }).recording.ops;
    expect(walled.some((op) => paintsWith(op, COL_WALL))).toBe(true);
    const unwalled = renderScenario({ game: pathGame, id: id(ONE_PATH) }).recording.ops;
    expect(unwalled.some((op) => paintsWith(op, COL_WALL))).toBe(false);
    const solved = renderScenario({
      game: pathGame,
      id: id(ONE_PATH),
      moves: ONE_PATH_ANSWER.map((edge) => set(edge, LINE)),
    }).recording.ops;
    // Black is the edge drawn under a colored line; the line from the 1 to
    // the 2, the 2 to the 3 and the 3 to the 4 each take a color of their own.
    const colors = new Set(solved.flatMap((op) => (op.op === "line" ? [op.rgb] : [])));
    colors.delete("rgb(0, 0, 0)");
    expect(colors.size).toBe(3);
  });

  it("draws a line red where it passes two numbers out of order", () => {
    const red = (moves: PathMove[]): boolean =>
      renderScenario({
        game: pathGame,
        id: `${encodeParams(Z, true)}:${ONE_PATH}`,
        moves,
      }).recording.ops.some((op) => paintsWith(op, COL_ERROR));
    expect(red([set(9, LINE)])).toBe(false);
    // Down from the 1 to the 3, which skips the 2.
    expect(red([set(9, LINE), set(13, LINE)])).toBe(true);
  });
});
