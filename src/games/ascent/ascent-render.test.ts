/**
 * Tier-2.5 render-scenario tests for Ascent (docs/games/rendering.md § "The tile cache and the diff key").
 *
 * Reaches a fresh board for the Rectangle, Hexagon and Edges modes through a
 * real `Midend`, asserts the ops that matter (background fill, square borders,
 * clue text, edge arrows), then snapshots the whole record so an unintended
 * render drift surfaces as a reviewable diff. Every mode rides one renderer
 * with no per-mode board code, so these three cover the geometry differences.
 */
import { describe, expect, it } from "vitest";
import type { HintStep } from "../../engine/game.ts";
import { stepMarks } from "../../engine/hint-words.ts";
import { describeHintKindPins } from "../../engine/testing/hint-positions.ts";
import type { DrawOp } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import type { AscentRung } from "./hint.ts";
import { PATH, SQUARE } from "./hint-text.ts";
import { ascentGame } from "./index.ts";
import {
  COL_ARROW,
  COL_BORDER,
  COL_HINT,
  COL_HINT_CELL,
  COL_LOWLIGHT,
  COL_MIDLIGHT,
} from "./render.ts";
import {
  type AscentMove,
  type AscentParams,
  MODE_EDGES,
  MODE_HEXAGON,
  MODE_RECT,
} from "./state.ts";

function id(p: AscentParams, seed: string): string {
  return `${ascentGame.encodeParams(p, true)}#${seed}`;
}

const RECT: AscentParams = {
  w: 5,
  h: 5,
  diff: 1,
  mode: MODE_RECT,
  removeends: false,
  symmetrical: false,
};
const HEXAGON: AscentParams = {
  w: 5,
  h: 5,
  diff: 1,
  mode: MODE_HEXAGON,
  removeends: false,
  symmetrical: false,
};
const EDGES: AscentParams = {
  w: 5,
  h: 5,
  diff: 1,
  mode: MODE_EDGES,
  removeends: true,
  symmetrical: false,
};

describe("ascent render", () => {
  it("Rectangle: fresh board fills a background, draws tile borders and clues", () => {
    const { recording } = renderScenario({
      game: ascentGame,
      id: id(RECT, "render-rect"),
    });
    const ops = recording.ops;
    expect(ops.some((o) => o.op === "rect" && o.color === COL_MIDLIGHT)).toBe(true);
    expect(ops.some((o) => o.op === "polygon" && o.outline === COL_BORDER)).toBe(true);
    expect(ops.some((o) => o.op === "text")).toBe(true);
    expect(ops).toMatchSnapshot();
  });

  it("Hexagon: renders real hexagonal cells (6-vertex outlines)", () => {
    const { recording } = renderScenario({
      game: ascentGame,
      id: id(HEXAGON, "render-hex"),
    });
    const ops = recording.ops;
    // A hexagon cell outline is a 6-vertex COL_BORDER polygon, not the
    // 4-vertex square an offset-square rendering would emit.
    expect(
      ops.some(
        (o) => o.op === "polygon" && o.outline === COL_BORDER && o.points.length === 6,
      ),
    ).toBe(true);
    expect(ops.some((o) => o.op === "text")).toBe(true);
    expect(ops).toMatchSnapshot();
  });

  it("Edges: draws arrow clues around the border", () => {
    const { recording } = renderScenario({
      game: ascentGame,
      id: id(EDGES, "render-edges"),
    });
    const ops = recording.ops;
    expect(ops.some((o) => o.op === "polygon" && o.fill === COL_ARROW)).toBe(true);
    expect(ops.some((o) => o.op === "text")).toBe(true);
    expect(ops).toMatchSnapshot();
  });
});

/** The squares a step's words name, by role, and a whole run's route. */
const hl = (step: HintStep<AscentMove>) => {
  const marks = stepMarks(step);
  return {
    targets: [...marks.of("ring", SQUARE)],
    area: [...marks.of("outline", SQUARE)],
    hatch: [...marks.of("stripes", SQUARE)],
    route: [...marks.of("ring", PATH)],
  };
};

/** The rungs that say a square is one run's alone. Their step stripes the
 * run's reach, or stripes nothing and counts the steps from the run's ends. */
const ONE_RUNS: readonly AscentRung[] = [
  "onlyBeside",
  "only",
  "routeBeside",
  "routeOnly",
];

/** The steps whose frames are asserted below. Each kind names its mode, since
 * a frame's stroke counts are a mode's. */
const pinned = describeHintKindPins({
  game: ascentGame,
  params: [
    RECT,
    { ...RECT, diff: 2 },
    { ...RECT, w: 6, h: 7, diff: 2 },
    { ...HEXAGON, w: 7, h: 7, diff: 2 },
    EDGES,
    { ...EDGES, diff: 3 },
  ],
  kinds: {
    rectBetween: (s, state) =>
      state.mode === MODE_RECT && s.move.kind === "place" && hl(s).area.length === 2,
    rectRun: (s, state) =>
      state.mode === MODE_RECT && ONE_RUNS.includes(s.rung) && hl(s).hatch.length > 0,
    hexagonRun: (s, state) =>
      state.mode === MODE_HEXAGON &&
      ONE_RUNS.includes(s.rung) &&
      hl(s).hatch.length > 0,
    fill: (s, state) =>
      state.mode === MODE_RECT && ONE_RUNS.includes(s.rung) && hl(s).hatch.length === 0,
    wholeRun: (s, state) => state.mode === MODE_RECT && s.rung === "wholeRun",
    // A number read off its neighbors and its arrow's line, which is striped.
    edgesLine: (s, state) =>
      state.mode === MODE_EDGES &&
      (s.rung === "touch" || s.rung === "reach") &&
      hl(s).hatch.length > 0,
    edgesLines: (s, state) => state.mode === MODE_EDGES && s.rung === "lines",
    edgesPointers: (s, state) => state.mode === MODE_EDGES && s.rung === "pointers",
  },
  pins: {
    /** Held on 173 of 796 positions walked. */
    rectBetween: "5x5mRdn:c10a21_22_25_12b19_15_13_7c4b1c",
    /** Held on 7 of 796 positions walked. */
    rectRun: {
      id: "5x5mRdt:25_1a4b24_2_8_6_22d12a15a17c19a",
      moves:
        '[{"kind":"place","cell":2,"n":2},{"kind":"place","cell":4,"n":4},{"kind":"places","cells":[{"cell":22,"n":19},{"cell":16,"n":20}]}]',
    },
    /** Held on 1 of 796 positions walked. */
    hexagonRun: {
      id: "7x7mHdt:C24_26_29aBeA21d37a18_16_14_12hAc1aB7a4aC",
      moves:
        '[{"kind":"place","cell":10,"n":24},{"kind":"places","cells":[{"cell":16,"n":21},{"cell":9,"n":22}]},{"kind":"place","cell":29,"n":16},{"kind":"places","cells":[{"cell":28,"n":18},{"cell":21,"n":19}]},{"kind":"places","cells":[{"cell":11,"n":26},{"cell":12,"n":27}]},{"kind":"places","cells":[{"cell":6,"n":29},{"cell":13,"n":30},{"cell":19,"n":31},{"cell":26,"n":32},{"cell":32,"n":33},{"cell":33,"n":34},{"cell":27,"n":35}]}]',
    },
    /** Held on 14 of 796 positions walked. */
    fill: {
      id: "5x5mRdt:22a25_4_1a24a3b15d17a9_8a13c",
      moves: [
        { kind: "place", cell: 9, n: 1 },
        { kind: "place", cell: 7, n: 4 },
      ],
    },
    /** Held on 166 of 796 positions walked. */
    wholeRun: "5x5mRdn:25c6a1_3_8_7_22_16a11e12b18_14a",
    /** Held on 69 of 796 positions walked. */
    edgesLine:
      "5x5mEEdn:1_10_23_3_17_15_19_25d18_21_24e20_5e4_14e8_12e9_11_7_6_22_2_16_13",
    /** Held on 66 of 796 positions walked. */
    edgesLines:
      "5x5mEEdn:13_4_3_10_1_14_18_5e2_9e16_15e7_20_25d23_22e12_24_6_8_21_19_17_11",
    /** Held on 32 of 796 positions walked. */
    edgesPointers: {
      id: "5x5mEEdh:5_13_9_23_19_4_21_24e22_20e15_12e17_1_10d3_7e6_8_25_11_16_2_18_14",
      moves:
        '[{"kind":"place","cell":25,"n":16},{"kind":"place","cell":9,"n":23},{"kind":"place","cell":24,"n":15}]',
    },
  },
});

/** The frame a pinned position's hint draws, through a real `Midend`. */
function hintFrame(kind: Parameters<typeof pinned>[0]) {
  const { id, moves, step } = pinned(kind);
  const result = renderScenario({ game: ascentGame, id, moves, showHint: true });
  expect(result.hint?.explanation).toBe(step.explanation);
  return { recording: result.recording, hint: step, marks: hl(step) };
}

describe("ascent hint frames", () => {
  const strokes = (ops: DrawOp[], color: number) =>
    ops.filter((o) => o.op === "line" && o.color === color);

  it("Rectangle: rings the square to fill and outlines the numbers it sits between", () => {
    const { recording, hint, marks } = hintFrame("rectBetween");
    expect(marks.area).toHaveLength(2);
    const ops = recording.ops;
    // A ring is one stroke per side of the cell, and no fill: four for a square.
    expect(strokes(ops, COL_HINT)).toHaveLength(4);
    expect(strokes(ops, COL_HINT_CELL)).toHaveLength(4 * 2);
    // Highlight, never perform: the number the step places is not drawn as a
    // placed number.
    const n = hint.move.kind === "place" ? hint.move.n : -1;
    expect(
      ops.some(
        (o) => o.op === "text" && o.text === String(n + 1) && o.color !== COL_LOWLIGHT,
      ),
    ).toBe(false);
    expect(ops).toMatchSnapshot();
  });

  it("Hexagon: the ring follows the hexagon", () => {
    const { recording } = renderScenario({
      game: ascentGame,
      id: "5x5mHdn:B6bAb10d11_19dA1_15_17B",
      showHint: true,
    });
    expect(strokes(recording.ops, COL_HINT)).toHaveLength(6);
    expect(recording.ops).toMatchSnapshot();
  });

  it("stripes the reach of the one run that can fill a square, square or hexagon", () => {
    for (const [kind, perCell] of [
      ["rectRun", 1],
      ["hexagonRun", 7],
    ] as const) {
      const { recording, marks } = hintFrame(kind);
      for (const t of marks.targets) expect(marks.hatch).toContain(t);
      // Every striped cell is hatched, a hexagon on rects that stay inside it.
      const hatches = recording.ops.filter(
        (o) => o.op === "hatch" && o.color === COL_HINT,
      );
      expect(marks.hatch.length).toBeGreaterThan(0);
      expect(hatches).toHaveLength(marks.hatch.length * perCell);
      expect(recording.ops).toMatchSnapshot();
    }
  });

  it("outlines the rival and the ends a fill step counts from, and stripes nothing", () => {
    const { recording, marks } = hintFrame("fill");
    expect(marks.hatch).toEqual([]);
    expect(recording.ops.some((o) => o.op === "hatch")).toBe(false);
    expect(marks.area.length).toBeGreaterThan(0);
    expect(strokes(recording.ops, COL_HINT_CELL)).toHaveLength(4 * marks.area.length);
    expect(recording.ops).toMatchSnapshot();
  });

  it("draws a whole run's route as a path line in the hint's color, ringing its squares", () => {
    const { recording, hint, marks } = hintFrame("wholeRun");
    const route = marks.route;
    expect(hint.move.kind).toBe("places");
    expect(route.length).toBeGreaterThan(2);
    // One half-segment from each end of every link, and a four-sided ring on
    // every square the step fills.
    const rings = 4 * (hint.move.kind === "places" ? hint.move.cells.length : 0);
    expect(strokes(recording.ops, COL_HINT)).toHaveLength(
      2 * (route.length - 1) + rings,
    );
    expect(recording.ops).toMatchSnapshot();
  });

  it("Edges: stripes the line an arrow points along when the sentence names it", () => {
    const { recording, marks } = hintFrame("edgesLine");
    expect(marks.hatch.length).toBeGreaterThan(0);
    const hatches = recording.ops.filter(
      (o) => o.op === "hatch" && o.color === COL_HINT,
    );
    expect(hatches).toHaveLength(marks.hatch.length);
    expect(recording.ops).toMatchSnapshot();
  });

  it("Edges: a lines step stripes the lines it must be near and outlines their arrows", () => {
    const { recording, hint, marks } = hintFrame("edgesLines");
    expect(hint.explanation).toMatch(/'s (row|column|diagonal)\b/);
    expect(marks.hatch.length).toBeGreaterThan(0);
    // Its own arrow and each arrow named: outlined, never striped.
    expect(marks.area.length).toBeGreaterThanOrEqual(2);
    for (const a of marks.area) expect(marks.hatch).not.toContain(a);
    const hatches = recording.ops.filter(
      (o) => o.op === "hatch" && o.color === COL_HINT,
    );
    expect(hatches).toHaveLength(marks.hatch.length);
    expect(recording.ops).toMatchSnapshot();
  });

  it("Edges: a pointers step outlines every missing number's arrow pointing at the square", () => {
    const { recording, marks } = hintFrame("edgesPointers");
    // Two or more arrows point here: the rival's and the one placed.
    expect(marks.area.length).toBeGreaterThanOrEqual(2);
    expect(marks.hatch.length).toBeGreaterThan(0);
    expect(recording.ops).toMatchSnapshot();
  });
});
