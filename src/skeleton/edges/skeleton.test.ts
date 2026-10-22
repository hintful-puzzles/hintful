/**
 * Skeleton's own behavior: the codecs, drawing a line, the path from a solve
 * to a finished board, the mistake check, a save, and the frame.
 *
 * The board below is small enough to solve by eye. Edges are numbered as
 * `engine/square-edges.ts` numbers them: the twelve across first, in reading
 * order of their left square, then the twelve up and down. The two walls are
 * edges 7 and 8.
 *
 *     + + + +      +-+-+-+
 *                  |     |
 *     + + + +      + +-+ +
 *                  | | | |
 *     + +#+#+      + +#+#+
 *                  | | | |
 *     + + + +      +-+ +-+
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
import type { AnyGame } from "../../engine/testing/input-probe.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { expectDragRepeatsThePress } from "../../engine/testing/sweep-probe.ts";
import type { Point } from "../../engine/types.ts";
import { crossDrag, skeletonGame } from "./index.ts";
import {
  COL_ERROR,
  COL_HINT,
  COL_WALL,
  centerOf,
  layout,
  newDrawState,
} from "./render.ts";
import { answerOf } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  decodeParams,
  encodeDesc,
  encodeParams,
  executeMove,
  newState,
  type SkeletonMove,
  type SkeletonState,
  validateParams,
} from "./state.ts";

const P = { w: 4, h: 4, diff: DIFF_EASY };
const DESC = "g1o";
const ID = `${encodeParams(P, true)}:${DESC}`;
/** The answer's lines, as edges. */
const ANSWER = [0, 1, 2, 4, 9, 11, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23];

const set = (edge: number, mark: 0 | 1 | 2): SkeletonMove => ({
  kind: "edges",
  changes: [{ edge, mark }],
});

describe("skeleton params", () => {
  it("round-trip through their string, tier included only in full", () => {
    const p = { w: 6, h: 4, diff: DIFF_EASY };
    expect(decodeParams(encodeParams(p, true))).toEqual(p);
    // The brief form leaves the tier at the default's.
    expect(decodeParams(encodeParams(p, false))).toEqual({ ...p, diff: DIFF_NORMAL });
  });

  it("refuse a board too small, too large, or of an odd side", () => {
    expect(validateParams({ w: 2, h: 6, diff: DIFF_EASY }, true)).toMatch(/\.$/);
    expect(validateParams({ w: 30, h: 30, diff: DIFF_EASY }, true)).toMatch(/\.$/);
    expect(validateParams({ w: 5, h: 6, diff: DIFF_EASY }, true)).toMatch(/\.$/);
    expect(validateParams(P, true)).toBeNull();
  });

  it("refuse Normal at four by four, where no board needs it, and allow it larger", () => {
    expect(validateParams({ ...P, diff: DIFF_NORMAL }, true)).toMatch(/\.$/);
    expect(validateParams({ w: 6, h: 4, diff: DIFF_NORMAL }, true)).toBeNull();
  });
});

describe("skeleton desc", () => {
  it("reads the walls, a letter for each run of edges without one", () => {
    const s = newState(P, DESC);
    expect(Array.from(s.walls).flatMap((v, e) => (v ? [e] : []))).toEqual([7, 8]);
    expect(Array.from(s.edges)).toEqual(new Array(24).fill(OPEN));
    expect(encodeDesc(s.walls)).toBe(DESC);
  });

  it.each([
    ["too short", "g1"],
    ["too long", "g1p"],
    ["a stray character", "g1o!"],
  ])("refuses a desc %s", (_why, desc) => {
    expect(() => newState(P, desc)).toThrow();
  });

  it("has an answer, which the ladder finds", () => {
    const answer = answerOf(P.w, P.h, newState(P, DESC).walls);
    expect(answer?.flatMap((m, e) => (m === LINE ? [e] : []))).toEqual(ANSWER);
  });
});

describe("skeleton input", () => {
  const start = newState(P, DESC);
  const TS = 40;
  const ds = newDrawState(start, TS);
  const at = (i: number): Point => centerOf(start, TS, i);

  /** The move the buttons make, pressed in turn at the points given. */
  function play(state: SkeletonState, presses: [number, Point][]): SkeletonMove | null {
    const ui = skeletonGame.newUi(state);
    let made: SkeletonMove | null = null;
    for (const [button, p] of presses) {
      const r = skeletonGame.interpretMove(state, ui, ds, p, button);
      if (r !== null && typeof r === "object") made = r;
    }
    return made;
  }

  it("a drag through squares lays a line along the edges it passes", () => {
    const move = play(start, [
      [LEFT_BUTTON, at(5)],
      [LEFT_DRAG, at(6)],
      [LEFT_DRAG, at(10)],
      [LEFT_RELEASE, at(10)],
    ]);
    expect(move).toEqual({
      kind: "edges",
      changes: [
        { edge: 4, mark: LINE },
        { edge: 18, mark: LINE },
      ],
    });
  });

  it("a drag back over its own way takes the line back", () => {
    const move = play(start, [
      [LEFT_BUTTON, at(0)],
      [LEFT_DRAG, at(1)],
      [LEFT_DRAG, at(2)],
      [LEFT_DRAG, at(1)],
      [LEFT_RELEASE, at(1)],
    ]);
    expect(move).toEqual(set(0, LINE));
  });

  it("a drag round four squares closes a loop", () => {
    const move = play(start, [
      [LEFT_BUTTON, at(0)],
      [LEFT_DRAG, at(1)],
      [LEFT_DRAG, at(5)],
      [LEFT_DRAG, at(4)],
      [LEFT_DRAG, at(0)],
      [LEFT_RELEASE, at(0)],
    ]);
    expect(move?.kind === "edges" && move.changes.map((c) => c.edge)).toEqual([
      0, 3, 12, 13,
    ]);
  });

  it("a drag stops at a wall, at a cross, and where a square has its two lines", () => {
    expect(
      play(start, [
        [LEFT_BUTTON, at(9)],
        [LEFT_DRAG, at(11)],
        [LEFT_RELEASE, at(11)],
      ]),
    ).toBeNull();
    const crossed = executeMove(start, set(1, CROSS));
    expect(
      play(crossed, [
        [LEFT_BUTTON, at(0)],
        [LEFT_DRAG, at(3)],
        [LEFT_RELEASE, at(3)],
      ]),
    ).toEqual(set(0, LINE));
    // Square 5 has a line right and a line down, so one from above stops.
    const full = executeMove(start, {
      kind: "edges",
      changes: [4, 17].map((edge) => ({ edge, mark: LINE })),
    });
    expect(
      play(full, [
        [LEFT_BUTTON, at(1)],
        [LEFT_DRAG, at(5)],
        [LEFT_RELEASE, at(5)],
      ]),
    ).toBeNull();
  });

  it("a click by an edge lays or lifts its line, and a right click crosses it", () => {
    const p = pointAtEdge(squareEdges(start.w, start.h), layout(TS), 12);
    const click = (state: SkeletonState, down: number, up: number) =>
      play(state, [
        [down, p],
        [up, p],
      ]);
    expect(click(start, LEFT_BUTTON, LEFT_RELEASE)).toEqual(set(12, LINE));
    const lined = executeMove(start, set(12, LINE));
    expect(click(lined, LEFT_BUTTON, LEFT_RELEASE)).toEqual(set(12, OPEN));
    expect(click(start, RIGHT_BUTTON, RIGHT_RELEASE)).toEqual(set(12, CROSS));
    // A line takes no cross.
    expect(click(lined, RIGHT_BUTTON, RIGHT_RELEASE)).toBeNull();
  });

  it("a right-button drag crosses each edge it passes, as a right click would", () => {
    expectDragRepeatsThePress(
      skeletonGame as unknown as AnyGame,
      "skeleton",
      crossDrag,
    );
  });

  it("a wall takes no line, and nothing a click asks of it changes the board", () => {
    const p = pointAtEdge(squareEdges(start.w, start.h), layout(TS), 7);
    expect(
      play(start, [
        [LEFT_BUTTON, p],
        [LEFT_RELEASE, p],
      ]),
    ).toBeNull();
    const move = play(start, [
      [RIGHT_BUTTON, p],
      [RIGHT_RELEASE, p],
    ]);
    // The midend keeps a move that leaves the board as it was out of the
    // history.
    if (move) expect(executeMove(start, move).edges).toEqual(start.edges);
  });

  it("the keyboard draws with Enter and the arrows, and crosses with Shift", () => {
    const keys = (buttons: number[]): [number, Point][] =>
      buttons.map((b) => [b, { x: 0, y: 0 }]);
    // Show the cursor in the corner, take it down two squares, and finish.
    expect(
      play(
        start,
        keys([CURSOR_SELECT, CURSOR_SELECT, CURSOR_DOWN, CURSOR_DOWN, CURSOR_SELECT]),
      ),
    ).toEqual({
      kind: "edges",
      changes: [
        { edge: 12, mark: LINE },
        { edge: 16, mark: LINE },
      ],
    });
    expect(play(start, keys([CURSOR_SELECT, CURSOR_RIGHT | MOD_SHFT]))).toEqual(
      set(0, CROSS),
    );
  });
});

describe("skeleton completion", () => {
  const start = newState(P, DESC);
  const lines = (state: SkeletonState, edges: readonly number[]): SkeletonState =>
    executeMove(state, {
      kind: "edges",
      changes: edges.map((edge) => ({ edge, mark: LINE })),
    });

  it("the solve move finishes the board", () => {
    const solved = skeletonGame.solve?.(start, start);
    if (!solved?.ok) throw new Error("expected a solution");
    expect(skeletonGame.status(executeMove(start, solved.move))).toBe("solved");
  });

  it("is reached by lines alone, with nothing crossed out", () => {
    expect(skeletonGame.status(lines(start, ANSWER.slice(1)))).toBe("ongoing");
    expect(skeletonGame.status(lines(start, ANSWER))).toBe("solved");
  });

  it("is not reached by two loops that between them pass every square", () => {
    // Each half of the board, two columns wide, as a loop of its own.
    const halves = [0, 2, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    expect(skeletonGame.status(lines(start, halves))).toBe("ongoing");
  });

  it("a line the answer lacks and a cross on one it has are mistakes", () => {
    const right = lines(start, [12]);
    expect(skeletonGame.findMistakes?.(right)).toEqual([]);
    expect(skeletonGame.findMistakes?.(lines(right, [3]))).toEqual([{ edge: 3 }]);
    expect(skeletonGame.findMistakes?.(executeMove(right, set(16, CROSS)))).toEqual([
      { edge: 16 },
    ]);
    // A cross the answer agrees with is not one.
    expect(skeletonGame.findMistakes?.(executeMove(right, set(3, CROSS)))).toEqual([]);
  });
});

describe("skeleton save", () => {
  it("a saved game loads with its lines and crosses", () => {
    const { midend } = renderScenario({
      game: skeletonGame,
      id: ID,
      moves: [set(12, LINE), set(3, CROSS)],
    });
    const loaded = new Midend(skeletonGame);
    expect(loaded.loadGame(midend.saveGame())).toBeNull();
    expect(loaded.formatAsText()).toBe(
      [
        "+ + + +",
        "|      ",
        "+x+ + +",
        "       ",
        "+ +#+#+",
        "       ",
        "+ + + +",
        "",
      ].join("\n"),
    );
  });
});

describe("skeleton frame", () => {
  it("draws the board", () => {
    const { recording } = renderScenario({
      game: skeletonGame,
      id: ID,
      moves: [set(12, LINE), set(16, LINE), set(3, CROSS)],
    });
    expect(recording.ops).toMatchSnapshot();
  });

  it("draws the walls", () => {
    const { recording } = renderScenario({ game: skeletonGame, id: ID });
    expect(recording.ops.some((op) => paintsWith(op, COL_WALL))).toBe(true);
  });

  it("draws a loop red once it closes short of every square, and not before", () => {
    const red = (edges: number[]): boolean =>
      renderScenario({
        game: skeletonGame,
        id: ID,
        moves: edges.map((e) => set(e, LINE)),
      }).recording.ops.some((op) => paintsWith(op, COL_ERROR));
    expect(red([0, 3, 12])).toBe(false);
    expect(red([0, 3, 12, 13])).toBe(true);
  });

  it("draws a mistake red, and rings a hint's edges", () => {
    const wrong = renderScenario({
      game: skeletonGame,
      id: ID,
      moves: [set(3, LINE)],
      showMistakes: true,
    });
    expect(wrong.mistakeCount).toBe(1);
    expect(wrong.recording.ops.some((op) => paintsWith(op, COL_ERROR))).toBe(true);

    const hinted = renderScenario({ game: skeletonGame, id: ID, showHint: true });
    expect(hinted.hint).toBeDefined();
    expect(hinted.recording.ops.some((op) => paintsWith(op, COL_HINT))).toBe(true);
  });
});
