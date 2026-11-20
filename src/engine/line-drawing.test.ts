/**
 * The line drawing's rules, on a board of the test's own: the drag's step,
 * cut, erase, stops and loop, the click, and the keys. Pearl and Path play
 * through it in their own tests; this holds the rules where a game's tests
 * would see only the cases its board happens to reach.
 */

import { describe, expect, it } from "vitest";
import { edgeBetween, squareEdges } from "./board/square-edges.ts";
import { UI_UPDATE } from "./game.ts";
import {
  CROSS,
  type EdgeChange,
  type EdgeMark,
  edgeMistakes,
  LINE,
  type LineDrawingUi,
  type LineRules,
  lineDrawing,
  OPEN,
} from "./line-drawing.ts";
import {
  CURSOR_DOWN,
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

  it("takes back a step drawn back over its end, and goes on from there", () => {
    expect(drag(setup(), board(), [0, 1, 2, 1])).toEqual(lineOn([0, 1]));
    expect(drag(setup(), board(), [0, 1, 2, 1, 4])).toEqual(lineOn([0, 1], [1, 4]));
    // Back to where it began, a step at a time or in one straight pull.
    expect(drag(setup(), board(), [0, 1, 2, 1, 0])).toBe(UI_UPDATE);
    expect(drag(setup(), board(), [0, 1, 2, 0])).toBe(UI_UPDATE);
  });

  it("waits at its end after brushing a square it passed off its end, and carries on from there", () => {
    // Round a U, then onto its first square, which is beside the end but not
    // the way it came.
    expect(drag(setup(), board(), [0, 1, 4, 3, 0, 6])).toEqual(
      lineOn([0, 1], [1, 4], [4, 3], [3, 6]),
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

describe("a drag that replaces lines", () => {
  /** Rules whose drag from square 0 replaces the lines along the top row. */
  function replacing() {
    const rules: LineRules<Board> = {
      mark: (s, e) => s.edges[e],
      takes: () => 2,
      loops: false,
      restarts: (_s, i) => (i === 0 ? [edge(0, 1), edge(1, 2)] : []),
    };
    return lineDrawing<Board, LineDrawingUi, null, readonly EdgeChange[]>(rules, {
      layout: () => ({ tile: TILE, border: 0 }),
      move: (_s, changes) => changes,
    });
  }
  const top = board([
    [0, 1],
    [1, 2],
  ]);

  it("takes up the lines it replaces and lays its own", () => {
    expect(drag(replacing(), top, [0, 3, 4])).toEqual([
      { edge: edge(0, 1), mark: OPEN },
      { edge: edge(1, 2), mark: OPEN },
      ...lineOn([0, 3], [3, 4]),
    ]);
  });

  it("changes nothing while it only retraces what it replaces", () => {
    // Along the replaced line, which would otherwise be taken up as a drag
    // along nothing but lines.
    expect(drag(replacing(), top, [0, 1])).toBe(UI_UPDATE);
    expect(drag(replacing(), top, [0, 1, 2])).toBe(UI_UPDATE);
  });

  it("keeps a replaced line it lays again once it leaves the rest", () => {
    expect(drag(replacing(), top, [0, 1, 4])).toEqual([
      { edge: edge(1, 2), mark: OPEN },
      ...lineOn([1, 4]),
    ]);
  });

  it("replaces nothing for a press released where it began", () => {
    const input = replacing();
    const ui = newUi();
    input.interpretMove(top, ui, null, center(0), LEFT_BUTTON);
    const made = input.interpretMove(top, ui, null, center(0), LEFT_RELEASE);
    expect(made).toBe(UI_UPDATE);
  });

  it("is the same from the keyboard", () => {
    const input = replacing();
    const ui = newUi();
    ui.cursor.visible = true;
    const moves = [CURSOR_SELECT, CURSOR_DOWN, CURSOR_SELECT].map((k) =>
      input.interpretMove(top, ui, null, { x: 0, y: 0 }, k),
    );
    expect(moves.at(-1)).toEqual([
      { edge: edge(0, 1), mark: OPEN },
      { edge: edge(1, 2), mark: OPEN },
      ...lineOn([0, 3]),
    ]);
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

describe("directed lines", () => {
  interface Directed extends Board {
    from: number[];
  }

  /** A board whose lines run along each of `runs`, each in its order. */
  function runs(...paths: number[][]): Directed {
    const s = { ...board(), from: new Array<number>(g.edgeCount).fill(-1) };
    for (const p of paths)
      for (let k = 1; k < p.length; k++) {
        s.edges[edge(p[k - 1], p[k])] = LINE;
        s.from[edge(p[k - 1], p[k])] = p[k - 1];
      }
    return s;
  }

  const input = lineDrawing<Directed, LineDrawingUi, null, readonly EdgeChange[]>(
    {
      mark: (s, e) => s.edges[e],
      takes: () => 2,
      loops: false,
      directed: { from: (s, e) => s.from[e] },
    },
    {
      layout: () => ({ tile: TILE, border: 0 }),
      move: (_s, changes) => changes,
    },
  );

  function dragOn(state: Directed, cells: number[]) {
    const ui = newUi();
    input.interpretMove(state, ui, null, center(cells[0]), LEFT_BUTTON);
    for (const c of cells.slice(1))
      input.interpretMove(state, ui, null, center(c), LEFT_DRAG);
    return input.interpretMove(
      state,
      ui,
      null,
      center(cells.at(-1) ?? 0),
      LEFT_RELEASE,
    );
  }

  /** The lines along `path`, each running the way the path does. */
  const laid = (...path: number[]): EdgeChange[] =>
    path
      .slice(1)
      .map((j, k) => ({ edge: edge(path[k], j), mark: LINE, from: path[k] }) as const)
      .sort((a, b) => a.edge - b.edge);

  it("lays each line the way the drag passed it", () => {
    expect(dragOn(runs(), [2, 1, 0])).toEqual(laid(2, 1, 0));
  });

  it("carries a run on from its end", () => {
    expect(dragOn(runs([0, 1]), [0, 1, 2])).toEqual(laid(1, 2));
  });

  it("joins a run at its front: I-G-N, then A-L-I onto the I, reads A-L-I-G-N", () => {
    expect(dragOn(runs([3, 4, 5]), [1, 0, 3])).toEqual(laid(1, 0, 3));
  });

  it("stops a drag setting off from a run's first square by another edge", () => {
    expect(dragOn(runs([3, 4, 5]), [3, 0, 1])).toBe(UI_UPDATE);
  });

  it("stops a drag that would meet a run head to head", () => {
    expect(dragOn(runs([3, 4, 5]), [2, 5])).toBe(UI_UPDATE);
    // It keeps what it drew before the square.
    expect(dragOn(runs([3, 4, 5]), [0, 1, 2, 5])).toEqual(laid(0, 1, 2));
  });

  it("stops a drag that would close a run on itself", () => {
    expect(dragOn(runs([0, 1, 4, 3]), [3, 0])).toBe(UI_UPDATE);
  });

  it("takes up a run's lines dragged back along them, either way", () => {
    const off = [
      { edge: edge(0, 1), mark: OPEN },
      { edge: edge(1, 2), mark: OPEN },
    ];
    expect(dragOn(runs([0, 1, 2]), [0, 1, 2])).toEqual(off);
    expect(dragOn(runs([0, 1, 2]), [2, 1, 0])).toEqual(off);
  });

  it("is the same from the keyboard", () => {
    const ui = newUi();
    ui.cursor.visible = true;
    const moves = [CURSOR_SELECT, CURSOR_DOWN, CURSOR_RIGHT, CURSOR_SELECT].map((k) =>
      input.interpretMove(runs(), ui, null, { x: 0, y: 0 }, k),
    );
    expect(moves.at(-1)).toEqual(laid(0, 3, 4));
  });

  it("Ctrl+arrow lays a line the way the cursor moves", () => {
    const ui = newUi();
    ui.cursor.visible = true;
    input.interpretMove(runs(), ui, null, { x: 0, y: 0 }, CURSOR_RIGHT);
    const move = input.interpretMove(
      runs(),
      ui,
      null,
      { x: 0, y: 0 },
      CURSOR_LEFT | MOD_CTRL,
    );
    expect(move).toEqual(laid(1, 0));
  });

  describe("the click", () => {
    /** A click near the edge between squares `i` and `i + 1`. */
    function clickRight(state: Directed, i: number) {
      const ui = newUi();
      const p = {
        x: (i % W) * TILE + TILE - 1,
        y: Math.floor(i / W) * TILE + TILE / 2,
      };
      input.interpretMove(state, ui, null, p, LEFT_BUTTON);
      return input.interpretMove(state, ui, null, p, LEFT_RELEASE);
    }

    it("points a line right or down beside no run", () => {
      expect(clickRight(runs(), 0)).toEqual(laid(0, 1));
    });

    it("carries a run on from its end, and joins one at its front", () => {
      expect(clickRight(runs([2, 1]), 0)).toEqual(laid(1, 0));
      expect(clickRight(runs([1, 0]), 1)).toEqual(laid(2, 1));
    });

    it("turns a line pointing right round, and takes one pointing left up", () => {
      expect(clickRight(runs([0, 1]), 0)).toEqual(laid(1, 0));
      expect(clickRight(runs([1, 0]), 0)).toEqual([{ edge: edge(0, 1), mark: OPEN }]);
    });

    it("takes a line up where it cannot turn round", () => {
      // The line from 3 into 0 and on to 1: turned round, 0 would have two
      // lines out.
      expect(clickRight(runs([3, 0, 1]), 0)).toEqual([
        { edge: edge(0, 1), mark: OPEN },
      ]);
    });
  });

  it("is laid by a hint as a drag from its square", () => {
    expect(input.hintGesture(runs(), null, laid(1, 0))).toEqual([
      {
        kind: "drag",
        button: "primary",
        from: center(1),
        through: undefined,
        to: center(0),
      },
    ]);
  });

  it("is revealed where it runs the other way round", () => {
    expect(input.revealLine(runs([1, 0]), runs([0, 1]))).toEqual(laid(0, 1));
  });
});

describe("edgeMistakes", () => {
  it("counts a directed game's line the wrong way round as a mistake", () => {
    // A game storing a line from its edge's second square as 3.
    expect(edgeMistakes([LINE, 3, CROSS, OPEN], [3, 3, LINE, LINE])).toEqual([
      { edge: 0 },
      { edge: 2 },
    ]);
  });
});
