/**
 * Wordtrail's own behavior: the codecs, the trails a board's letters spell,
 * drawing a word, the path from a solve to a finished board, the mistake
 * check, a save, and the frame.
 *
 * The board below is small enough to solve by eye: GLAND and POEM, where
 * NAME along the top is a word that does not fit. Edges are numbered as
 * `engine/square-edges.ts` numbers them: the nine across first, in reading
 * order of their left square, then the eight up and down. Squares are
 * numbered in reading order, 0 to 11. A line reads the way it is drawn: G
 * to L to A to N to D, and P up to O up to E and left to M.
 *
 *     N A M E      N<A M<E
 *                  v ^   ^
 *     D L G O      D L<G O
 *                        ^
 *     # # # P      # # # P
 */
import { describe, expect, it } from "vitest";
import { Midend } from "../../engine/index.ts";
import { CROSS, type EdgeChange, LINE, OPEN } from "../../engine/line-drawing.ts";
import { paramsError } from "../../engine/params.ts";
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
import { edgeBetween, pointAtEdge, squareEdges } from "../../engine/square-edges.ts";
import type { AnyGame } from "../../engine/testing/input-probe.ts";
import { ringsOf } from "../../engine/testing/mark-shape.ts";
import { paintsWith } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { expectDragRepeatsThePress } from "../../engine/testing/sweep-probe.ts";
import type { Point } from "../../engine/types.ts";
import { crossDrag, wordtrailGame } from "./index.ts";
import {
  COL_DARK,
  COL_ERROR,
  centerOf,
  layout,
  newDrawState,
  PREFERRED_TILE_SIZE,
} from "./render.ts";
import { answerOf } from "./solver.ts";
import {
  DIFF_EASY,
  DIFF_NORMAL,
  decodeParams,
  encodeDesc,
  encodeParams,
  executeMove,
  LINE_BACK,
  newState,
  type WordtrailMove,
  type WordtrailState,
} from "./state.ts";
import { letterChar, trailsOf } from "./trails.ts";

const P = { w: 4, h: 3, words: 2, diff: DIFF_EASY };
const DESC = "45,namedlgo3p";
const ID = `${encodeParams(P, true)}:${DESC}`;
const G = squareEdges(P.w, P.h);
/** The answer's words, each its squares in reading order: GLAND and POEM. */
const GLAND = [6, 5, 1, 0, 4];
const POEM = [11, 7, 3, 2];

/** The lines along `path`, each running the way the path does. */
const along = (path: readonly number[]): EdgeChange[] =>
  path.slice(1).map((j, k) => ({
    edge: edgeBetween(G, path[k], j),
    mark: LINE,
    from: path[k],
  }));

/** The move drawing each of `paths`. */
const draw = (...paths: (readonly number[])[]): WordtrailMove => ({
  kind: "edges",
  changes: paths.flatMap(along),
});

const set = (edge: number, mark: typeof OPEN | typeof CROSS): WordtrailMove => ({
  kind: "edges",
  changes: [{ edge, mark }],
});

/** The edges a move makes, sorted, as a test compares them. */
const sorted = (changes: EdgeChange[]): WordtrailMove => ({
  kind: "edges",
  changes: changes.sort((a, b) => a.edge - b.edge),
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
    const refusal = (p: typeof P) => paramsError(wordtrailGame, p, true);
    expect(refusal({ ...P, w: 1 })).toBe("Width must be at least 2.");
    expect(refusal({ ...P, w: 9 })).toBe("Width must be at most 8.");
    expect(refusal({ w: 4, h: 4, words: 5, diff: DIFF_EASY })).toMatch(/many/);
    expect(refusal({ w: 8, h: 8, words: 4, diff: DIFF_EASY })).toMatch(/few/);
    expect(refusal(P)).toBeNull();
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
    expect(new Set(s.trails.map((t) => t.join()))).toHaveLength(s.trails.length);
    expect(spelled.every((w) => w.length === 4 || w.length === 5)).toBe(true);
  });

  it.each([
    "tub",
    "but",
  ])("reads squares that spell a word both ways as two trails, laid as %s", (laid) => {
    const letters = Uint8Array.from(laid, (c) => c.charCodeAt(0) - 96);
    const spelled = trailsOf(3, 1, letters, [3]).map((t) =>
      Array.from(t, (i) => letterChar(letters[i])).join(""),
    );
    expect(spelled.sort()).toEqual(["but", "tub"]);
  });

  it("counts a common word and its plural, and not a rare word", () => {
    const spelled = (laid: string): number => {
      const letters = Uint8Array.from(laid, (c) => c.charCodeAt(0) - 96);
      return trailsOf(laid.length, 1, letters, [laid.length]).length;
    };
    expect([spelled("cat"), spelled("cats"), spelled("ree")]).toEqual([1, 1, 0]);
  });

  it("has an answer, each line the way its word reads, which the ladder finds", () => {
    const answer = answerOf(newState(P, DESC));
    const expected = new Array<number>(G.edgeCount).fill(OPEN);
    for (const { edge, from } of along(GLAND).concat(along(POEM)))
      expected[edge] = from === G.a[edge] ? LINE : LINE_BACK;
    expect(answer).toEqual(expected);
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

  /** A drag through the squares `path`. */
  const dragThrough = (state: WordtrailState, path: number[]) =>
    play(state, [
      [LEFT_BUTTON, at(path[0])],
      ...path.slice(1).map((i): [number, Point] => [LEFT_DRAG, at(i)]),
      [LEFT_RELEASE, at(path[path.length - 1])],
    ]);

  it("a drag through letters lays a line along each edge it passes, the way it passes it", () => {
    expect(dragThrough(start, [0, 1, 5])).toEqual(sorted(along([0, 1, 5])));
    expect(dragThrough(start, [5, 1, 0])).toEqual(sorted(along([5, 1, 0])));
  });

  it("a drag drawn back over its end takes back the step", () => {
    expect(dragThrough(start, [0, 1, 2, 1])).toEqual(draw([0, 1]));
  });

  it("a fragment drawn first is joined at its front: A-N-D, then G-L-A onto it", () => {
    const and = executeMove(start, draw([1, 0, 4]));
    expect(dragThrough(and, [6, 5, 1])).toEqual(sorted(along([6, 5, 1])));
    const gland = executeMove(and, draw([6, 5, 1]));
    expect(wordtrailGame.findMistakes?.(gland)).toEqual([]);
  });

  it("a drag from a word's first letter by another edge, or into its last letter, stops", () => {
    const and = executeMove(start, draw([1, 0, 4]));
    // From the A, the word's first letter, on to the M.
    expect(dragThrough(and, [1, 2])).toBeNull();
    // From the L into the D, which has its line in already.
    expect(dragThrough(and, [5, 4])).toBeNull();
  });

  it("a drag stops at a dark square, at a cross, and where a letter has its two lines", () => {
    expect(dragThrough(start, [5, 9])).toBeNull();
    const crossed = executeMove(start, set(1, CROSS));
    expect(dragThrough(crossed, [0, 3])).toEqual(draw([0, 1]));
    // The A has a line in from the N and one out down, so one from the M stops.
    const full = executeMove(start, draw([0, 1, 5]));
    expect(dragThrough(full, [2, 1])).toBeNull();
  });

  it("a click by an edge lays a line down, turns it round, then lifts it; a right click crosses it", () => {
    const p = pointAtEdge(G, layout(TS), 11);
    const click = (state: WordtrailState, down: number, up: number) =>
      play(state, [
        [down, p],
        [up, p],
      ]);
    expect(click(start, LEFT_BUTTON, LEFT_RELEASE)).toEqual(draw([2, 6]));
    const down = executeMove(start, draw([2, 6]));
    expect(click(down, LEFT_BUTTON, LEFT_RELEASE)).toEqual(draw([6, 2]));
    const up = executeMove(start, draw([6, 2]));
    expect(click(up, LEFT_BUTTON, LEFT_RELEASE)).toEqual(set(11, OPEN));
    expect(click(start, RIGHT_BUTTON, RIGHT_RELEASE)).toEqual(set(11, CROSS));
    // A line takes no cross.
    expect(click(down, RIGHT_BUTTON, RIGHT_RELEASE)).toBeNull();
  });

  it("a click beside a word's last letter carries the word on", () => {
    // P up to O: a click by the edge from the O to the G draws O to G.
    const po = executeMove(start, draw([11, 7]));
    const p = pointAtEdge(G, layout(TS), 5);
    expect(
      play(po, [
        [LEFT_BUTTON, p],
        [LEFT_RELEASE, p],
      ]),
    ).toEqual(draw([7, 6]));
  });

  it("a right-button drag crosses each edge it passes, as a right click would", () => {
    expectDragRepeatsThePress(
      wordtrailGame as unknown as AnyGame,
      "wordtrail",
      crossDrag,
    );
  });

  it("an edge beside a dark square takes nothing a click asks of it", () => {
    const p = pointAtEdge(G, layout(TS), 14);
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
    ).toEqual(sorted(along([0, 4, 5])));
    expect(play(start, keys([CURSOR_SELECT, CURSOR_RIGHT | MOD_SHFT]))).toEqual(
      set(0, CROSS),
    );
  });
});

describe("wordtrail completion", () => {
  const start = newState(P, DESC);
  const lines = (state: WordtrailState, ...paths: (readonly number[])[]) =>
    executeMove(state, draw(...paths));

  it("the solve move finishes the board", () => {
    const solved = wordtrailGame.solve?.(start, start);
    if (!solved?.ok) throw new Error("expected a solution");
    expect(wordtrailGame.status(executeMove(start, solved.move))).toBe("solved");
  });

  it("is reached by lines alone, with nothing crossed out", () => {
    expect(wordtrailGame.status(lines(start, GLAND, POEM.slice(1)))).toBe("ongoing");
    expect(wordtrailGame.status(lines(start, GLAND, POEM))).toBe("solved");
  });

  it("is not reached by a word drawn backwards", () => {
    expect(wordtrailGame.status(lines(start, GLAND, POEM.toReversed()))).toBe(
      "ongoing",
    );
  });

  it("is not reached by a division whose trails are not all words", () => {
    // NAME along the top, and DLGOP below it.
    expect(wordtrailGame.status(lines(start, [0, 1, 2, 3], [4, 5, 6, 7, 11]))).toBe(
      "ongoing",
    );
  });

  it("a line the answer lacks, one the wrong way round and a cross on one it has are mistakes", () => {
    const right = lines(start, [0, 4]);
    expect(wordtrailGame.findMistakes?.(right)).toEqual([]);
    expect(wordtrailGame.findMistakes?.(lines(right, [1, 2]))).toEqual([{ edge: 1 }]);
    expect(wordtrailGame.findMistakes?.(lines(start, [4, 0]))).toEqual([{ edge: 9 }]);
    expect(wordtrailGame.findMistakes?.(executeMove(right, set(10, CROSS)))).toEqual([
      { edge: 10 },
    ]);
    // A cross the answer agrees with is not one.
    expect(wordtrailGame.findMistakes?.(executeMove(right, set(1, CROSS)))).toEqual([]);
  });
});

describe("wordtrail save", () => {
  it("a saved game loads with its lines, the way they run, and its crosses", () => {
    const { midend } = renderScenario({
      game: wordtrailGame,
      id: ID,
      moves: [draw([0, 4]), draw([2, 1]), set(2, CROSS)],
    });
    const loaded = new Midend(wordtrailGame);
    expect(loaded.loadGame(midend.saveGame())).toBeNull();
    expect(loaded.formatAsText()).toBe(
      ["N A<MxE", "v      ", "D L G O", "       ", "# # # P", "Words: 4, 5", ""].join(
        "\n",
      ),
    );
  });

  it("refuses a line with no direction, as a save from before lines had one holds", () => {
    expect(() =>
      executeMove(newState(P, DESC), {
        kind: "edges",
        changes: [{ edge: 9, mark: LINE }],
      }),
    ).toThrow(/wordtrail/);
  });
});

describe("wordtrail frame", () => {
  it("draws the board", () => {
    const { recording } = renderScenario({
      game: wordtrailGame,
      id: ID,
      moves: [draw([1, 0, 4]), set(1, CROSS)],
    });
    expect(recording.ops).toMatchSnapshot();
  });

  it("gives each word drawn a color of its own, on its letters and in the list", () => {
    const start = newState(P, DESC);
    /** Each square's letter disc's fill: the smallest circle at its middle. */
    const discs = (...paths: (readonly number[])[]) => {
      const { recording } = renderScenario({
        game: wordtrailGame,
        id: ID,
        moves: [draw(...paths)],
      });
      const circles = recording.ops.flatMap((op) => (op.op === "circle" ? [op] : []));
      const fillAt = (i: number): number => {
        const c = centerOf(start, PREFERRED_TILE_SIZE, i);
        const here = circles.filter(
          (o) => o.cx === Math.round(c.x) && o.cy === Math.round(c.y),
        );
        return here.reduce((a, b) => (b.r < a.r ? b : a)).fill;
      };
      const rects = new Set(
        recording.ops.flatMap((op) => (op.op === "rect" ? [op.color] : [])),
      );
      return { fillAt, rects };
    };
    const one = (fills: number[]): number => {
      expect(new Set(fills).size).toBe(1);
      return fills[0];
    };
    const plain = one(GLAND.map(discs(POEM).fillAt));
    const both = discs(POEM, GLAND);
    const poem = one(POEM.map(both.fillAt));
    const gland = one(GLAND.map(both.fillAt));
    expect(new Set([plain, poem, gland]).size).toBe(3);
    // The list's slots wear them too.
    expect([both.rects.has(poem), both.rects.has(gland)]).toEqual([true, true]);
  });

  it("draws the dark squares", () => {
    const { recording } = renderScenario({ game: wordtrailGame, id: ID });
    expect(recording.ops.some((op) => paintsWith(op, COL_DARK))).toBe(true);
  });

  it("draws a loop red once it closes, and not before", () => {
    // The engine's drag never closes one; a solve or a save could.
    const red = (path: number[]): boolean =>
      renderScenario({
        game: wordtrailGame,
        id: ID,
        moves: [draw(path)],
      }).recording.ops.some((op) => paintsWith(op, COL_ERROR));
    expect(red([0, 1, 5, 4])).toBe(false);
    expect(red([0, 1, 5, 4, 0])).toBe(true);
  });

  it("draws a mistake red, and rings a hint's edges", () => {
    const wrong = renderScenario({
      game: wordtrailGame,
      id: ID,
      moves: [draw([1, 2])],
      showMistakes: true,
    });
    expect(wrong.mistakeCount).toBe(1);
    expect(wrong.recording.ops.some((op) => paintsWith(op, COL_ERROR))).toBe(true);

    const hinted = renderScenario({ game: wordtrailGame, id: ID, showHint: true });
    expect(hinted.hint).toBeDefined();
    expect(ringsOf(hinted.recording.ops).length).toBeGreaterThan(0);
  });

  it("writes each word drawn into the list as it reads, and only a word", () => {
    const listed = (path: number[]): string[] =>
      renderScenario({
        game: wordtrailGame,
        id: ID,
        moves: [draw(path)],
      })
        .recording.ops.flatMap((op) => (op.op === "text" ? [op.text] : []))
        .filter((t) => t.length === 1);
    // The board's twelve letters less its three dark squares, and the list's
    // letters once a word is drawn.
    expect(listed([0])).toHaveLength(9);
    expect(listed(POEM)).toEqual([..."NAMEDLGOP", ..."POEM"]);
    // P-O-E, not yet POEM; and MEOP, which is POEM backwards.
    expect(listed(POEM.slice(0, 3))).toHaveLength(9);
    expect(listed(POEM.toReversed())).toHaveLength(9);
  });
});
