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
import type { DrawOp } from "../../engine/testing/recording-drawing.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
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

describe("ascent hint frames", () => {
  /** The squares a step's words name, by role, and a whole run's route. */
  const hl = (step?: HintStep<AscentMove>) => {
    if (!step) return null;
    const marks = stepMarks(step);
    return {
      targets: [...marks.of("ring", SQUARE)],
      area: [...marks.of("outline", SQUARE)],
      hatch: [...marks.of("stripes", SQUARE)],
      route: [...marks.of("ring", PATH)],
    };
  };
  const strokes = (ops: DrawOp[], color: number) =>
    ops.filter((o) => o.op === "line" && o.color === color);

  it("Rectangle: rings the square to fill and outlines the numbers it sits between", () => {
    const { recording, hint } = renderScenario({
      game: ascentGame,
      id: id(RECT, "render-hint-rect"),
      showHint: true,
      hintUntil: (s) => s.move.kind === "place" && (hl(s)?.area.length ?? 0) === 2,
    });
    const marks = hl(hint);
    expect(marks?.area).toHaveLength(2);
    const ops = recording.ops;
    // A ring is one stroke per side of the cell, and no fill: four for a square.
    expect(strokes(ops, COL_HINT)).toHaveLength(4);
    expect(strokes(ops, COL_HINT_CELL)).toHaveLength(4 * 2);
    // Highlight, never perform: the number the step places is not drawn as a
    // placed number. The previous step was played by its taps, so the square
    // may show the selection's gray offer of it, as it would to the player.
    const n = hint?.move.kind === "place" ? hint.move.n : -1;
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
      id: id(HEXAGON, "render-hint-hex"),
      showHint: true,
    });
    expect(strokes(recording.ops, COL_HINT)).toHaveLength(6);
    expect(recording.ops).toMatchSnapshot();
  });

  it("stripes the reach of the one run that can fill a square, square or hexagon", () => {
    for (const [p, perCell] of [
      [{ ...RECT, diff: 2 }, 1],
      [{ ...HEXAGON, w: 7, h: 7, diff: 2 }, 7],
    ] as const) {
      // The striped sentences: "Only the run between …" and "Only 12, between …".
      const striped = /^Only (the run|\d+, between)/;
      let found = false;
      for (let seed = 0; seed < 80 && !found; seed++) {
        const { recording, hint } = renderScenario({
          game: ascentGame,
          id: id(p, `render-run-${seed}`),
          showHint: true,
          hintUntil: (s) => striped.test(s.explanation),
        });
        if (!hint || !striped.test(hint.explanation)) continue;
        found = true;
        const marks = hl(hint);
        for (const t of marks?.targets ?? []) expect(marks?.hatch).toContain(t);
        // Every striped cell is hatched, a hexagon on rects that stay inside it.
        const hatches = recording.ops.filter(
          (o) => o.op === "hatch" && o.color === COL_HINT,
        );
        expect(hatches).toHaveLength((marks?.hatch.length ?? -1) * perCell);
        expect(recording.ops).toMatchSnapshot();
      }
      expect(found, `no run step on ${ascentGame.encodeParams(p, true)}`).toBe(true);
    }
  });

  it("outlines the rival and the ends a fill step counts from, and stripes nothing", () => {
    const isFill = (s: HintStep<AscentMove>) =>
      /^(?:No other run (?:comes close to|can reach)|The run [^,]* (?:is too far from|can't fill)) this square/.test(
        s.explanation,
      );
    for (let seed = 0; seed < 80; seed++) {
      const { recording, hint } = renderScenario({
        game: ascentGame,
        id: id({ ...RECT, diff: 2 }, `render-fill-${seed}`),
        showHint: true,
        hintUntil: isFill,
      });
      if (!hint || !isFill(hint)) continue;
      const marks = hl(hint);
      expect(marks?.hatch).toEqual([]);
      expect(recording.ops.some((o) => o.op === "hatch")).toBe(false);
      expect(strokes(recording.ops, COL_HINT_CELL)).toHaveLength(
        4 * (marks?.area.length ?? -1),
      );
      expect(recording.ops).toMatchSnapshot();
      return;
    }
    throw new Error("no fill step in 80 seeds");
  });

  it("draws a whole run's route as a path line in the hint's color, ringing its squares", () => {
    const whole = (s: HintStep<AscentMove>) =>
      / only one route| the one route that does/.test(s.explanation);
    for (let seed = 0; seed < 40; seed++) {
      const { recording, hint } = renderScenario({
        game: ascentGame,
        id: `${ascentGame.encodeParams({ ...RECT, w: 6, h: 7, diff: 2 }, true)}#whole-${seed}`,
        showHint: true,
        hintUntil: whole,
      });
      if (!hint || !whole(hint)) continue;
      const marks = hl(hint);
      const route = marks?.route ?? [];
      expect(hint.move.kind).toBe("places");
      expect(route.length).toBeGreaterThan(2);
      // One half-segment from each end of every link, and a four-sided ring on
      // every square the step fills.
      const rings = 4 * (hint.move.kind === "places" ? hint.move.cells.length : 0);
      expect(strokes(recording.ops, COL_HINT)).toHaveLength(
        2 * (route.length - 1) + rings,
      );
      expect(recording.ops).toMatchSnapshot();
      return;
    }
    throw new Error("no whole-run step in 40 seeds");
  });

  it("Edges: stripes the line an arrow points along when the sentence names it", () => {
    const { recording, hint } = renderScenario({
      game: ascentGame,
      id: id(EDGES, "render-hint-edges"),
      showHint: true,
      hintUntil: (s) => (hl(s)?.hatch.length ?? 0) > 0,
    });
    const marks = hl(hint);
    expect(marks?.hatch.length).toBeGreaterThan(0);
    expect(hint?.explanation).toMatch(/, on its (row|column|diagonal)\./);
    const hatches = recording.ops.filter(
      (o) => o.op === "hatch" && o.color === COL_HINT,
    );
    expect(hatches).toHaveLength(marks?.hatch.length ?? -1);
    expect(recording.ops).toMatchSnapshot();
  });

  it("Edges: a lines step stripes the lines it must be near and outlines their arrows", () => {
    const { recording, hint } = renderScenario({
      game: ascentGame,
      id: id(EDGES, "render-hint-edges"),
      showHint: true,
      hintUntil: (s) =>
        / must be on its (row|column|diagonal), within /.test(s.explanation),
    });
    const marks = hl(hint);
    expect(hint?.explanation).toMatch(/'s (row|column|diagonal)\b/);
    expect(marks?.hatch.length).toBeGreaterThan(0);
    // Its own arrow and each arrow named: outlined, never striped.
    expect(marks?.area.length).toBeGreaterThanOrEqual(2);
    for (const a of marks?.area ?? []) expect(marks?.hatch).not.toContain(a);
    const hatches = recording.ops.filter(
      (o) => o.op === "hatch" && o.color === COL_HINT,
    );
    expect(hatches).toHaveLength(marks?.hatch.length ?? -1);
    expect(recording.ops).toMatchSnapshot();
  });

  it("Edges: a pointers step outlines every missing number's arrow pointing at the square", () => {
    const pointers = (s: HintStep<AscentMove>) =>
      /^Of the missing numbers, only \d+(, \d+)* and \d+ point here\. /.test(
        s.explanation,
      );
    for (let seed = 0; seed < 40; seed++) {
      const { recording, hint } = renderScenario({
        game: ascentGame,
        id: id({ ...EDGES, diff: 3 }, `render-pointers-${seed}`),
        showHint: true,
        hintUntil: pointers,
      });
      if (!hint || !pointers(hint)) continue;
      const marks = hl(hint);
      // Two or more arrows point here: the rival's and the one placed.
      expect(marks?.area.length).toBeGreaterThanOrEqual(2);
      expect(marks?.hatch.length).toBeGreaterThan(0);
      expect(recording.ops).toMatchSnapshot();
      return;
    }
    throw new Error("no pointers step in 40 seeds");
  });
});
