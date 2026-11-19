/**
 * Wordtrail's own behavior: the codecs, the trails a board's letters spell,
 * drawing a word, the path from a solve to a finished board, the mistake
 * check, a save, and the frame.
 *
 * The board below is small enough to solve by eye: GLAND and POEM, where
 * NAME along the top is a word that does not fit. Edges are numbered as
 * `engine/square-edges.ts` numbers them: the nine across first, in reading
 * order of their left square, then the eight up and down.
 *
 *     N A M E      N-A M-E
 *                  | |   |
 *     D L G O      D L-G O
 *                        |
 *     # # # P      # # # P
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
import { ringsOf } from "../../engine/testing/mark-shape.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { expectDragRepeatsThePress } from "../../engine/testing/sweep-probe.ts";
import type { Point } from "../../engine/types.ts";
import { crossDrag, wordtrailGame } from "./index.ts";
import { COL_DARK, COL_ERROR, centerOf, layout, newDrawState } from "./render.ts";
import { answerOf } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  decodeParams,
  encodeDesc,
  encodeParams,
  executeMove,
  newState,
  validateParams,
  type WordtrailMove,
  type WordtrailState,
} from "./state.ts";
import { letterChar } from "./trails.ts";

const P = { w: 4, h: 3, words: 2, diff: DIFF_EASY };
const DESC = "45,namedlgo3p";
const ID = `${encodeParams(P, true)}:${DESC}`;
/** The answer's lines, as edges: GLAND and POEM. */
const ANSWER = [0, 2, 4, 9, 10, 12, 16];

const set = (edge: number, mark: 0 | 1 | 2): WordtrailMove => ({
  kind: "edges",
  changes: [{ edge, mark }],
});

describe("wordtrail params", () => {
  it("round-trip through their string, tier included only in full", () => {
    const p = { w: 6, h: 4, words: 4, diff: DIFF_EASY };
    expect(decodeParams(encodeParams(p, true))).toEqual(p);
    // The brief form leaves the tier at the default's.
    expect(decodeParams(encodeParams(p, false))).toEqual({ ...p, diff: DIFF_NORMAL });
    // A bare size takes the default's words too.
    expect(decodeParams("5x5")).toEqual({ w: 5, h: 5, words: 4, diff: DIFF_NORMAL });
  });

  it("refuse a board too small or too large, and words too many or too few", () => {
    expect(validateParams({ ...P, w: 1 }, true)).toMatch(/\.$/);
    expect(validateParams({ ...P, w: 9 }, true)).toMatch(/\.$/);
    expect(validateParams({ w: 4, h: 4, words: 5, diff: DIFF_EASY }, true)).toMatch(
      /many/,
    );
    expect(validateParams({ w: 8, h: 8, words: 4, diff: DIFF_EASY }, true)).toMatch(
      /few/,
    );
    expect(validateParams(P, true)).toBeNull();
  });
});

describe("wordtrail desc", () => {
  it("reads the lengths, the letters and the dark squares, and writes them back", () => {
    const s = newState(P, DESC);
    expect(s.lengths).toEqual([4, 5]);
    expect(Array.from(s.letters, (l) => (l === 0 ? "#" : letterChar(l))).join("")).toBe(
      "namedlgo###p",
    );
    expect(Array.from(s.edges)).toEqual(new Array(17).fill(OPEN));
    expect(encodeDesc(s)).toBe(DESC);
  });

  it.each([
    ["too short", "45,namedlgo3"],
    ["too long", "45,namedlgo3pq"],
    ["a capital", "45,namedlgo3P"],
    ["lengths that are not the letters' count", "46,namedlgo3p"],
    ["a length no word has", "27,namedlgo3p"],
    ["no lengths", ",namedlgo3p"],
  ])("refuses a desc %s", (_why, desc) => {
    expect(() => newState(P, desc)).toThrow();
  });

  it("knows every trail that spells a word of a listed length, each once", () => {
    const s = newState(P, DESC);
    const spelled = s.trails.map((t) =>
      Array.from(t, (i) => letterChar(s.letters[i])).join(""),
    );
    expect(spelled).toEqual(expect.arrayContaining(["name", "gland", "poem"]));
    // Each trail once, whichever way round it was found.
    const keys = s.trails.map((t) => [...t].sort((a, b) => a - b).join());
    expect(new Set(s.trails.map((t) => t.join()))).toHaveLength(s.trails.length);
    expect(keys.length).toBe(s.trails.length);
    expect(spelled.every((w) => w.length === 4 || w.length === 5)).toBe(true);
  });

  it("has an answer, which the ladder finds", () => {
    const answer = answerOf(newState(P, DESC));
    expect(answer?.flatMap((m, e) => (m === LINE ? [e] : []))).toEqual(ANSWER);
  });
});

describe("wordtrail input", () => {
  const start = newState(P, DESC);
  const TS = 48;
  const ds = newDrawState(start, TS);
  const at = (i: number): Point => centerOf(start, TS, i);

  /** The move the buttons make, pressed in turn at the points given. */
  function play(
    state: WordtrailState,
    presses: [number, Point][],
  ): WordtrailMove | null {
    const ui = wordtrailGame.newUi(state);
    let made: WordtrailMove | null = null;
    for (const [button, p] of presses) {
      const r = wordtrailGame.interpretMove(state, ui, ds, p, button);
      if (r !== null && typeof r === "object") made = r;
    }
    return made;
  }

  it("a drag through letters lays a line along the edges it passes", () => {
    const move = play(start, [
      [LEFT_BUTTON, at(0)],
      [LEFT_DRAG, at(1)],
      [LEFT_DRAG, at(5)],
      [LEFT_RELEASE, at(5)],
    ]);
    expect(move).toEqual({
      kind: "edges",
      changes: [
        { edge: 0, mark: LINE },
        { edge: 10, mark: LINE },
      ],
    });
  });

  it("a drag drawn back over its end takes back the step", () => {
    const move = play(start, [
      [LEFT_BUTTON, at(0)],
      [LEFT_DRAG, at(1)],
      [LEFT_DRAG, at(2)],
      [LEFT_DRAG, at(1)],
      [LEFT_RELEASE, at(1)],
    ]);
    expect(move).toEqual({ kind: "edges", changes: [{ edge: 0, mark: LINE }] });
  });

  it("a drag stops at a dark square, at a cross, and where a letter has its two lines", () => {
    expect(
      play(start, [
        [LEFT_BUTTON, at(5)],
        [LEFT_DRAG, at(9)],
        [LEFT_RELEASE, at(9)],
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
    // The A has a line left and a line down, so one from the M stops.
    const full = executeMove(start, {
      kind: "edges",
      changes: [0, 10].map((edge) => ({ edge, mark: LINE })),
    });
    expect(
      play(full, [
        [LEFT_BUTTON, at(2)],
        [LEFT_DRAG, at(1)],
        [LEFT_RELEASE, at(1)],
      ]),
    ).toBeNull();
  });

  it("a click by an edge lays or lifts its line, and a right click crosses it", () => {
    const p = pointAtEdge(squareEdges(start.w, start.h), layout(TS), 11);
    const click = (state: WordtrailState, down: number, up: number) =>
      play(state, [
        [down, p],
        [up, p],
      ]);
    expect(click(start, LEFT_BUTTON, LEFT_RELEASE)).toEqual(set(11, LINE));
    const lined = executeMove(start, set(11, LINE));
    expect(click(lined, LEFT_BUTTON, LEFT_RELEASE)).toEqual(set(11, OPEN));
    expect(click(start, RIGHT_BUTTON, RIGHT_RELEASE)).toEqual(set(11, CROSS));
    // A line takes no cross.
    expect(click(lined, RIGHT_BUTTON, RIGHT_RELEASE)).toBeNull();
  });

  it("a right-button drag crosses each edge it passes, as a right click would", () => {
    expectDragRepeatsThePress(
      wordtrailGame as unknown as AnyGame,
      "wordtrail",
      crossDrag,
    );
  });

  it("an edge beside a dark square takes nothing a click asks of it", () => {
    const p = pointAtEdge(squareEdges(start.w, start.h), layout(TS), 14);
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
    // Show the cursor in the corner, take it down a letter and across one,
    // and finish.
    expect(
      play(
        start,
        keys([CURSOR_SELECT, CURSOR_SELECT, CURSOR_DOWN, CURSOR_RIGHT, CURSOR_SELECT]),
      ),
    ).toEqual({
      kind: "edges",
      changes: [
        { edge: 3, mark: LINE },
        { edge: 9, mark: LINE },
      ],
    });
    expect(play(start, keys([CURSOR_SELECT, CURSOR_RIGHT | MOD_SHFT]))).toEqual(
      set(0, CROSS),
    );
  });
});

describe("wordtrail completion", () => {
  const start = newState(P, DESC);
  const lines = (state: WordtrailState, edges: readonly number[]): WordtrailState =>
    executeMove(state, {
      kind: "edges",
      changes: edges.map((edge) => ({ edge, mark: LINE })),
    });

  it("the solve move finishes the board", () => {
    const solved = wordtrailGame.solve?.(start, start);
    if (!solved?.ok) throw new Error("expected a solution");
    expect(wordtrailGame.status(executeMove(start, solved.move))).toBe("solved");
  });

  it("is reached by lines alone, with nothing crossed out", () => {
    expect(wordtrailGame.status(lines(start, ANSWER.slice(1)))).toBe("ongoing");
    expect(wordtrailGame.status(lines(start, ANSWER))).toBe("solved");
  });

  it("is not reached by a division whose trails are not all words", () => {
    // NAME along the top, and DLGOP below it.
    expect(wordtrailGame.status(lines(start, [0, 1, 2, 3, 4, 5, 16]))).toBe("ongoing");
  });

  it("a line the answer lacks and a cross on one it has are mistakes", () => {
    const right = lines(start, [9]);
    expect(wordtrailGame.findMistakes?.(right)).toEqual([]);
    expect(wordtrailGame.findMistakes?.(lines(right, [1]))).toEqual([{ edge: 1 }]);
    expect(wordtrailGame.findMistakes?.(executeMove(right, set(10, CROSS)))).toEqual([
      { edge: 10 },
    ]);
    // A cross the answer agrees with is not one.
    expect(wordtrailGame.findMistakes?.(executeMove(right, set(1, CROSS)))).toEqual([]);
  });
});

describe("wordtrail save", () => {
  it("a saved game loads with its lines and crosses", () => {
    const { midend } = renderScenario({
      game: wordtrailGame,
      id: ID,
      moves: [set(9, LINE), set(1, CROSS)],
    });
    const loaded = new Midend(wordtrailGame);
    expect(loaded.loadGame(midend.saveGame())).toBeNull();
    expect(loaded.formatAsText()).toBe(
      ["N AxM E", "|      ", "D L G O", "       ", "# # # P", "Words: 4, 5", ""].join(
        "\n",
      ),
    );
  });
});

describe("wordtrail frame", () => {
  it("draws the board", () => {
    const { recording } = renderScenario({
      game: wordtrailGame,
      id: ID,
      moves: [set(0, LINE), set(9, LINE), set(1, CROSS)],
    });
    expect(recording.ops).toMatchSnapshot();
  });

  it("draws the dark squares", () => {
    const { recording } = renderScenario({ game: wordtrailGame, id: ID });
    expect(recording.ops.some((op) => paintsWith(op, COL_DARK))).toBe(true);
  });

  it("draws a loop red once it closes, and not before", () => {
    const red = (edges: number[]): boolean =>
      renderScenario({
        game: wordtrailGame,
        id: ID,
        moves: edges.map((e) => set(e, LINE)),
      }).recording.ops.some((op) => paintsWith(op, COL_ERROR));
    expect(red([0, 9, 10])).toBe(false);
    expect(red([0, 9, 10, 3])).toBe(true);
  });

  it("draws a mistake red, and rings a hint's edges", () => {
    const wrong = renderScenario({
      game: wordtrailGame,
      id: ID,
      moves: [set(1, LINE)],
      showMistakes: true,
    });
    expect(wrong.mistakeCount).toBe(1);
    expect(wrong.recording.ops.some((op) => paintsWith(op, COL_ERROR))).toBe(true);

    const hinted = renderScenario({ game: wordtrailGame, id: ID, showHint: true });
    expect(hinted.hint).toBeDefined();
    expect(ringsOf(hinted.recording.ops).length).toBeGreaterThan(0);
  });

  it("writes each word drawn into the list, and only a word", () => {
    const listed = (edges: number[]): string[] =>
      renderScenario({
        game: wordtrailGame,
        id: ID,
        moves: edges.map((e) => set(e, LINE)),
      })
        .recording.ops.flatMap((op) => (op.op === "text" ? [op.text] : []))
        .filter((t) => t.length === 1);
    // The board's twelve letters less its three dark squares, and the list's
    // letters once a word is drawn.
    expect(listed([])).toHaveLength(9);
    expect(listed([2, 12, 16])).toHaveLength(9 + 4);
    // P-O-E, not yet POEM.
    expect(listed([12, 16])).toHaveLength(9);
  });
});
