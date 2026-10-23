/**
 * The line drawing's rules, on a board of the test's own: the drag's step,
 * cut, erase, stops and loop, the click, and the keys. Pearl and Path play
 * through it in their own tests; this holds the rules where a game's tests
 * would see only the cases its board happens to reach.
 */

import { describe, expect, it } from "vitest";
import { UI_UPDATE } from "./game.ts";
import {
  CROSS,
  type EdgeChange,
  type EdgeMark,
  LINE,
  type LineDrawingUi,
  type LineRules,
  lineDrawing,
  OPEN,
} from "./line-drawing.ts";
import {
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  MOD_CTRL,
  MOD_SHFT,
  newCursor,
} from "./pointer.ts";
import { edgeBetween, squareEdges } from "./square-edges.ts";
import type { Point } from "./types.ts";

interface Board {
  w: number;
  h: number;
  edges: EdgeMark[];
}

const W = 3;
const H = 3;
const TILE = 10;
const g = squareEdges(W, H);
const edge = (i: number, j: number) => edgeBetween(g, i, j);
const center = (i: number): Point => ({
  x: (i % W) * TILE + TILE / 2,
  y: Math.floor(i / W) * TILE + TILE / 2,
});

function board(lines: number[][] = [], crosses: number[][] = []): Board {
  const edges: EdgeMark[] = new Array(g.edgeCount).fill(OPEN);
  for (const [i, j] of lines) edges[edge(i, j)] = LINE;
  for (const [i, j] of crosses) edges[edge(i, j)] = CROSS;
  return { w: W, h: H, edges };
}

function setup(takes: (i: number) => number = () => 2, loops = false) {
  const rules: LineRules<Board> = {
    mark: (s, e) => s.edges[e],
    takes: (_s, i) => takes(i),
    loops,
  };
  return lineDrawing<Board, LineDrawingUi, null, readonly EdgeChange[]>(rules, {
    layout: () => ({ tile: TILE, border: 0 }),
    move: (_s, changes) => changes,
  });
}

const newUi = (): LineDrawingUi => ({ cursor: newCursor(), drag: null });

/** The move a left-button drag through the centers of `cells` makes. */
function drag(
  input: ReturnType<typeof setup>,
  state: Board,
  cells: number[],
): ReturnType<ReturnType<typeof setup>["interpretMove"]> {
  const ui = newUi();
  input.interpretMove(state, ui, null, center(cells[0]), LEFT_BUTTON);
  for (const c of cells.slice(1))
    input.interpretMove(state, ui, null, center(c), LEFT_DRAG);
  return input.interpretMove(state, ui, null, center(cells.at(-1) ?? 0), LEFT_RELEASE);
}

const lineOn = (...pairs: number[][]) =>
  pairs
    .map(([i, j]) => ({ edge: edge(i, j), mark: LINE }))
    .sort((a, b) => a.edge - b.edge);

describe("the line drag", () => {
  it("draws a line along each edge it passes", () => {
    expect(drag(setup(), board(), [0, 1, 4])).toEqual(lineOn([0, 1], [1, 4]));
  });

  it("walks a straight run a square at a time, so a quick drag loses nothing", () => {
    expect(drag(setup(), board(), [0, 2])).toEqual(lineOn([0, 1], [1, 2]));
  });

  it("keeps all it drew where it returns to a square it passed", () => {
    expect(drag(setup(), board(), [0, 1, 2, 1])).toEqual(lineOn([0, 1], [1, 2]));
  });

  it("waits at its end after brushing a square it passed, and carries on from there", () => {
    expect(drag(setup(), board(), [0, 1, 2, 1, 2, 5])).toEqual(
      lineOn([0, 1], [1, 2], [2, 5]),
    );
  });

  it("carries a line on past its end, keeping the lines it ran along", () => {
    expect(drag(setup(), board([[0, 1]]), [0, 1, 2])).toEqual(lineOn([1, 2]));
  });

  it("takes up the lines when it runs along nothing else", () => {
    expect(
      drag(
        setup(),
        board([
          [0, 1],
          [1, 2],
        ]),
        [0, 2],
      ),
    ).toEqual([
      { edge: edge(0, 1), mark: OPEN },
      { edge: edge(1, 2), mark: OPEN },
    ]);
  });

  it("stops at a crossed edge", () => {
    expect(drag(setup(), board([], [[1, 2]]), [0, 2])).toEqual(lineOn([0, 1]));
  });

  it("stops before giving a square more lines than it takes", () => {
    expect(
      drag(
        setup((i) => (i === 1 ? 1 : 2)),
        board(),
        [0, 2],
      ),
    ).toEqual(lineOn([0, 1]));
  });

  it("closes a loop on its first square where loops are declared", () => {
    expect(
      drag(
        setup(() => 2, true),
        board(),
        [0, 1, 4, 3, 0],
      ),
    ).toEqual(lineOn([0, 1], [1, 4], [3, 4], [0, 3]));
  });

  it("keeps all it drew, open, where a loop is not declared", () => {
    expect(drag(setup(), board(), [0, 1, 4, 3, 0])).toEqual(
      lineOn([0, 1], [1, 4], [3, 4]),
    );
  });

  it("keeps all it drew, open, where the loop would over-fill its first square", () => {
    // The middle square has a line down besides the loop's first edge, so a
    // loop closing there would give it three.
    const state = board([[4, 7]]);
    expect(
      drag(
        setup(() => 2, true),
        state,
        [4, 1, 0, 3, 4],
      ),
    ).toEqual(lineOn([1, 4], [0, 1], [0, 3]));
  });
});

describe("the click", () => {
  const nearRight = { x: TILE - 1, y: TILE / 2 };

  function click(input: ReturnType<typeof setup>, state: Board, p: Point) {
    const ui = newUi();
    input.interpretMove(state, ui, null, p, LEFT_BUTTON);
    return input.interpretMove(state, ui, null, p, LEFT_RELEASE);
  }

  it("draws or takes up the line on the edge it is aimed at", () => {
    expect(click(setup(), board(), nearRight)).toEqual(lineOn([0, 1]));
    expect(click(setup(), board([[0, 1]]), nearRight)).toEqual([
      { edge: edge(0, 1), mark: OPEN },
    ]);
  });

  it("draws nothing that would over-fill a square", () => {
    expect(
      click(
        setup((i) => (i === 1 ? 0 : 2)),
        board(),
        nearRight,
      ),
    ).toBe(UI_UPDATE);
  });
});

describe("the keys", () => {
  /** The moves `keys` make, from a cursor already showing on square 0. */
  function press(state: Board, keys: number[]) {
    const input = setup();
    const ui = newUi();
    ui.cursor.visible = true;
    const moves = keys.map((k) =>
      input.interpretMove(state, ui, null, { x: 0, y: 0 }, k),
    );
    return { moves, cursor: ui.cursor };
  }

  it("Enter, the arrows and Enter draw a line", () => {
    const { moves } = press(board(), [
      CURSOR_SELECT,
      CURSOR_RIGHT,
      CURSOR_RIGHT,
      CURSOR_SELECT,
    ]);
    expect(moves.at(-1)).toEqual(lineOn([0, 1], [1, 2]));
  });

  it("an arrow back over the line takes back the step, as a drag's does not", () => {
    const { moves } = press(board(), [
      CURSOR_SELECT,
      CURSOR_RIGHT,
      CURSOR_RIGHT,
      CURSOR_LEFT,
      CURSOR_SELECT,
    ]);
    expect(moves.at(-1)).toEqual(lineOn([0, 1]));
  });

  it("Ctrl+arrow draws a line and moves along it", () => {
    const { moves, cursor } = press(board(), [CURSOR_RIGHT | MOD_CTRL]);
    expect(moves[0]).toEqual(lineOn([0, 1]));
    expect(cursor.x).toBe(1);
  });

  it("Ctrl+Shift+arrow draws a line without moving", () => {
    const { moves, cursor } = press(board(), [CURSOR_RIGHT | MOD_CTRL | MOD_SHFT]);
    expect(moves[0]).toEqual(lineOn([0, 1]));
    expect(cursor.x).toBe(0);
  });

  it("Shift+arrow crosses the edge", () => {
    const { moves } = press(board(), [CURSOR_RIGHT | MOD_SHFT]);
    expect(moves[0]).toEqual([{ edge: edge(0, 1), mark: CROSS }]);
  });
});
