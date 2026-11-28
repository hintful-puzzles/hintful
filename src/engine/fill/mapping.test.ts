/**
 * A board whose cells are a partition's parts (`space.parts`, `parts.ts`),
 * on the `mapping` fixture: regions of a grid of squares grown from seeds,
 * each a cell the rules color, which border which read off the squares,
 * and the ID as upstream map.c writes it.
 */

import { describe, expect, it } from "vitest";
import * as mapping from "../../generated/engine/testing/fixtures/mapping/mapping.compiled.ts";
import { FOUR_FILL_MARKS, FOUR_FILLS } from "../color/colors.ts";
import { cellSurface } from "../color/palette.ts";
import { COL_CURSOR, COL_ERROR } from "../color/roles.ts";
import { validateDesc } from "../contract/desc-error.ts";
import { UI_UPDATE } from "../contract/game.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_UP,
  LEFT_BUTTON,
} from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import type { Squares } from "../solve/describe-runtime.ts";
import {
  type DrawOp,
  RecordingDrawing,
  rgbLabel,
} from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import type { FillMistake } from "./answer.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { encodeDesc } from "./desc.ts";
import { fillGame } from "./game.ts";
import { newFillUi } from "./play.ts";
import { BOTTOM, LEFT, partsGeometry, RIGHT, TOP } from "./render/parts-geometry.ts";

const game = fillGame("mapping", mapping);
type Board = FillBoard<mapping.Dealt>;

/** Each region's neighbors across a side, read square by square. */
function bordersOfSquares(b: Board): number[][] {
  const { w, h, of } = b.dealt.map;
  const near = Array.from(
    { length: b.dealt.map.cells.length },
    () => new Set<number>(),
  );
  for (let c = 0; c < w * h; c++)
    for (const d of [c % w < w - 1 ? c + 1 : -1, c + w < w * h ? c + w : -1])
      if (d >= 0 && of[c] !== of[d]) {
        near[of[c]].add(of[d]);
        near[of[d]].add(of[c]);
      }
  return near.map((s) => [...s].sort((a, b) => a - b));
}

describe("a board whose cells are a partition's parts", () => {
  it("deals as many regions as it asks, each a cell, colored apart from its neighbors", () => {
    for (const size of ["4x4n6", "5x5n8", "6x4n9"]) {
      const p = game.decodeParams(size);
      for (const seed of ["a", "b", "c", "d"]) {
        const b = game.newState(p, game.newDesc(p, randomNew(`${size}${seed}`)).desc);
        const n = p.sizes?.["n"] ?? 0;
        expect([b.w, b.h]).toEqual([n, 1]);
        expect(b.dealt.map.cells).toHaveLength(n);
        expect(b.dealt.map.of).toHaveLength(p.w * p.h);
        // The relation is the regions' sides, as the squares say.
        expect(b.dealt.map.sides.map((x) => [...x])).toEqual(bordersOfSquares(b));
        const solved = solveBoard(mapping, b, 0);
        expect(solved.verdict).toBe("solved");
        for (let a = 0; a < n; a++)
          for (const o of b.dealt.map.sides[a])
            expect(solved.values[o]).not.toBe(solved.values[a]);
      }
    }
  });

  it("reads upstream map.c's ID: the edge list, then the colors from 0", () => {
    // Upstream's 5x4 of 6 regions, as the hand-written Map dealt it: the
    // regions, reading the squares, 0 1 2 3 4 / 0 0 0 3 4 / 0 0 0 5 5 /
    // 0 0 0 5 5, and every region colored but the fourth.
    const p = game.decodeParams("5x4n6");
    const desc = "bbebeacacfb,031a12";
    const b = game.newState(p, desc);
    expect(Array.from(b.dealt.map.of)).toEqual([
      0, 1, 2, 3, 4, 0, 0, 0, 3, 4, 0, 0, 0, 5, 5, 0, 0, 0, 5, 5,
    ]);
    expect(b.dealt.map.sides.map((x) => [...x])).toEqual([
      [1, 2, 3, 5],
      [0, 2],
      [0, 1, 3],
      [0, 2, 4, 5],
      [3, 5],
      [0, 3, 4],
    ]);
    expect(Array.from(b.values)).toEqual([1, 4, 2, 0, 2, 3]);
    expect(Array.from(b.fixed)).toEqual([1, 1, 1, 0, 1, 1]);
  });

  it("writes the board it reads", () => {
    for (const size of ["4x4n6", "8x8n9"]) {
      const p = game.decodeParams(size);
      const { desc } = game.newDesc(p, randomNew(size));
      expect(validateDesc(game, p, desc)).toBeNull();
      const b = game.newState(p, desc);
      expect(game.newState(p, desc).dealt.map).toEqual(b.dealt.map);
    }
  });

  it("refuses an edge list cut short, overlong, or making another count of regions", () => {
    const p = game.decodeParams("5x4n6");
    expect(validateDesc(game, p, "bbebeacacfb,031a12")).toBeNull();
    // Cut short: the `,` where a run belongs.
    expect(validateDesc(game, p, "bbebeacac,031a12")).not.toBeNull();
    // A run past the last side.
    expect(validateDesc(game, p, "bbebeacacfz,031a12")).not.toBeNull();
    // Of 6 regions, read as 5.
    expect(
      validateDesc(game, game.decodeParams("5x4n5"), "bbebeacacfb,031a12"),
    ).not.toBeNull();
    // A color past 3.
    expect(validateDesc(game, p, "bbebeacacfb,041a12")).not.toBeNull();
  });
});

describe("a board of parts drawn over its squares", () => {
  // A 5x5 of 6 regions the hand-written Map split three squares of, its
  // geometry read off map-data.ts's for this ID: square 6 between regions 1
  // (top, right) and 0, square 7 between 1 (top, left) and 3, square 8
  // between 2 (top, right) and 3.
  const p = game.decodeParams("5x5n6");
  const DESC = "dabbaaaacadbabbedac,a23a01";
  const board = (): Board => game.newState(p, DESC);
  const TS = 30;

  it("splits and labels the squares as upstream map.c, seeded by the ID the board writes", () => {
    const b = board();
    // The seed is the board's own ID, written again from its clues.
    expect(encodeDesc(mapping, mapping.deal, spaceOf(mapping, b), b.dealt)).toBe(DESC);
    const g = partsGeometry(b.dealt.map as Squares, DESC);
    const quadrants = (s: number) =>
      [TOP, BOTTOM, LEFT, RIGHT].map((t) => g.quadrants[t * 25 + s]).join("");
    const split = Array.from({ length: 25 }, (_, s) => s).filter(
      (s) => g.quadrants[s] !== g.quadrants[25 + s],
    );
    expect(split.map((s) => `${s}:${quadrants(s)}`)).toEqual([
      "6:1001",
      "7:1313",
      "8:2332",
    ]);
    expect(g.labels.map(({ x, y }) => `${x},${y}`)).toEqual([
      "2,4",
      "4,2",
      "8,2",
      "7,7",
      "3,8",
      "1,9",
    ]);
    // The border points of regions 0 and 3, and 0 and 5, both ways round.
    expect([g.borders.get(3), g.borders.get(18)]).toEqual([
      { x: 4, y: 5 },
      { x: 4, y: 5 },
    ]);
    expect(g.borders.get(5)).toEqual({ x: 1, y: 8 });
  });

  /** One frame of board `b`, and each square's ops, by the clip it draws in. */
  function draw(b: Board, mistakes: readonly FillMistake[] = [], ui = newFillUi()) {
    const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
    const ds = game.newDrawState(b, TS);
    game.redraw(dr, ds, {
      state: b,
      prev: null,
      dir: 1,
      ui,
      animTime: 0,
      flash: NO_FLASH,
      mistakes,
    });
    const o = game.computeSize(p, TS).w - 5 * TS - 1;
    const squares: DrawOp[][] = Array.from({ length: 25 }, () => []);
    let at = -1;
    for (const op of dr.ops) {
      if (op.op === "clip") at = ((op.y - o / 2) / TS) * 5 + (op.x - o / 2) / TS;
      else if (op.op === "unclip") at = -1;
      else if (at >= 0) squares[at].push(op);
    }
    return squares;
  }

  it("paints each square its region's color, and the bottom of a split square its own", () => {
    const b = board();
    const { of } = b.dealt.map;
    const values = Uint8Array.from(b.values);
    // Region 0 yellow and region 3 open.
    values[0] = 2;
    const squares = draw({ ...b, values });
    const surface = (v: number) =>
      v === 0 ? rgbLabel(cellSurface(DEFAULT_BACKGROUND)) : rgbLabel(FOUR_FILLS[v - 1]);
    // A split square's top is the region the split gave it.
    const top = (s: number) => (s === 6 || s === 7 ? 1 : s === 8 ? 2 : of[s]);
    for (let s = 0; s < 25; s++) {
      const fill = squares[s].find((op) => op.op === "rect");
      expect(fill?.op === "rect" && fill.rgb, `square ${s}`).toBe(
        surface(values[top(s)]),
      );
    }
    // Square 6's bottom is region 0's, square 7's region 3's.
    const bottom = (s: number) =>
      squares[s].find((op) => op.op === "polygon" && op.points.length === 3);
    expect(bottom(6)?.op === "polygon" && bottom(6)).toMatchObject({
      fillRgb: surface(2),
    });
    expect(bottom(7)?.op === "polygon" && bottom(7)).toMatchObject({
      fillRgb: surface(0),
    });
    expect(bottom(12)).toBeUndefined();
  });

  it("dots an open region's notes on its squares, a color a row", () => {
    const b = board();
    const { of } = b.dealt.map;
    const pencil = new Int32Array(6);
    // Region 3, open: pink and teal.
    pencil[3] = (1 << 1) | (1 << 3);
    const squares = draw({ ...b, pencil });
    const dots = (s: number) =>
      squares[s].flatMap((op) => (op.op === "circle" ? [op.fillRgb] : []));
    for (let s = 0; s < 25; s++) {
      // A split square's dots on region 3's triangles only: square 8's
      // left takes the teal's row, and square 7's pink and teal rows lie
      // in its top and left, region 1's.
      const expected =
        s === 7
          ? []
          : s === 8
            ? [rgbLabel(FOUR_FILL_MARKS[2])]
            : of[s] === 3
              ? [rgbLabel(FOUR_FILL_MARKS[0]), rgbLabel(FOUR_FILL_MARKS[2])]
              : [];
      expect(dots(s), `square ${s}`).toEqual(expected);
    }
  });

  it("rings a wrong region red on every square, and diamonds each clashing border", () => {
    const b = board();
    const { of } = b.dealt.map;
    const values = Uint8Array.from(b.values);
    // Regions 0 and 3 yellow beside region 5, yellow too: two clashes.
    values[0] = 2;
    values[3] = 2;
    const squares = draw({ ...b, values }, [{ cell: 4, kind: "value" }]);
    const reds = (s: number) =>
      squares[s].filter((op) => op.op === "rect" && op.color === COL_ERROR).length;
    for (let s = 0; s < 25; s++)
      expect(reds(s), `square ${s}`).toBe(of[s] === 4 ? 4 : 0);
    // The border of 0 and 3 at half point (4, 5), between squares 11 and
    // 12; of 0 and 5 at (1, 8), between squares 15 and 20.
    const diamonds = Array.from({ length: 25 }, (_, s) => s).filter((s) =>
      squares[s].some((op) => op.op === "polygon" && op.fill === COL_ERROR),
    );
    expect(diamonds).toEqual([11, 12, 15, 20]);
  });

  // Played on its squares (2.6c): regions 1, 2, 4 and 5 are given, 0 and 3
  // open.
  const origin = (game.computeSize(p, TS).w - 5 * TS - 1) / 2;
  /** A point in square `s`, a quarter tile from its middle toward triangle
   * `t`. */
  const pointIn = (s: number, t: number) => {
    const d = TS / 4;
    const [dx, dy] =
      t === TOP ? [0, -d] : t === BOTTOM ? [0, d] : t === LEFT ? [-d, 0] : [d, 0];
    return {
      x: origin + (s % 5) * TS + TS / 2 + dx,
      y: origin + Math.floor(s / 5) * TS + TS / 2 + dy,
    };
  };
  const KEY = (k: string) => k.charCodeAt(0);

  it("selects the region of the triangle a press lands in, and types into it", () => {
    const b = board();
    const ds = game.newDrawState(b, TS);
    // Square 6's bottom and left are region 0's; square 7's bottom and
    // right region 3's, its top and left region 1's, a given.
    for (const [s, t, region] of [
      [6, BOTTOM, 0],
      [6, LEFT, 0],
      [7, BOTTOM, 3],
      [7, RIGHT, 3],
      [12, TOP, 3],
    ] as const) {
      const ui = game.newUi(b);
      expect(game.interpretMove(b, ui, ds, pointIn(s, t), LEFT_BUTTON)).toBe(UI_UPDATE);
      expect(ui.cursor, `square ${s}`).toMatchObject({
        x: region,
        y: 0,
        visible: true,
      });
      expect(game.interpretMove(b, ui, ds, pointIn(s, t), KEY("3"))).toMatchObject({
        type: "set",
        x: region,
        y: 0,
        n: 3,
      });
    }
    // A given is not selected.
    const ui = game.newUi(b);
    game.interpretMove(b, ui, ds, pointIn(7, TOP), LEFT_BUTTON);
    expect(ui.cursor.visible).toBe(false);
  });

  it("walks the cursor over the squares, selecting the triangle on the side it moved toward", () => {
    const b = board();
    const ds = game.newDrawState(b, TS);
    const g = partsGeometry(b.dealt.map as Squares, DESC);
    const ui = game.newUi(b);
    // Pressed on square 6's bottom, region 0.
    game.interpretMove(b, ui, ds, pointIn(6, BOTTOM), LEFT_BUTTON);
    const walk = (button: number, s: number, t: number) => {
      game.interpretMove(b, ui, ds, { x: 0, y: 0 }, button);
      expect(ui.cursor, `to square ${s}`).toMatchObject({
        x: g.quadrants[t * 25 + s],
        y: 0,
        visible: true,
      });
    };
    // Right into square 7, its right triangle region 3's; up to square 2;
    // left to square 1; down to square 6's bottom, region 0's; down to
    // square 11, and up again to square 6's top, region 1's.
    walk(CURSOR_RIGHT, 7, RIGHT);
    expect(ui.cursor.x).toBe(3);
    walk(CURSOR_UP, 2, TOP);
    walk(CURSOR_LEFT, 1, LEFT);
    walk(CURSOR_DOWN, 6, BOTTOM);
    expect(ui.cursor.x).toBe(0);
    walk(CURSOR_DOWN, 11, BOTTOM);
    walk(CURSOR_UP, 6, TOP);
    expect(ui.cursor.x).toBe(1);
    // The selection moved by a hint's press keeps no square: the next arrow
    // walks from the region's label.
    ui.cursor.x = 4;
    const label = g.labels[4];
    const from = Math.floor(label.y / 2) * 5 + Math.floor(label.x / 2);
    walk(CURSOR_RIGHT, from + 1, RIGHT);
  });

  it("aims a hint's press at a point the press reads as the region", () => {
    const b = board();
    const ds = game.newDrawState(b, TS);
    const open = [0, 1, 2, 3, 4, 5].filter((r) => b.fixed[r] === 0);
    expect(open).toEqual([0, 3]);
    for (const region of open) {
      const ui = game.newUi(b);
      const gesture = game.hint.gesture;
      if (gesture === undefined) throw new Error("mapping: no hint gesture");
      const [press] = gesture(
        b,
        ui,
        ds,
        { type: "set", x: region, y: 0, n: 1, pencil: false, autoElim: false },
        null as never,
      );
      if (press === undefined || !("at" in press)) throw new Error("no press");
      game.interpretMove(b, ui, ds, press.at, LEFT_BUTTON);
      expect(ui.cursor, `region ${region}`).toMatchObject({ x: region, visible: true });
    }
  });

  it("paints the keypad's keys in the colors, each labeled by the key it sends", () => {
    const colors = game.colors(DEFAULT_BACKGROUND);
    const keys = game.requestKeys?.(p) ?? [];
    expect(
      keys.slice(0, 4).map((k) => [k.label, rgbLabel(colors[k.swatch ?? -1])]),
    ).toEqual(FOUR_FILLS.map((c, k) => [String(k + 1), rgbLabel(c)]));
  });

  it("bands the selected region inside its border, and corners its first square for notes", () => {
    const b = board();
    const { of } = b.dealt.map;
    const ui = game.newUi(b);
    ui.cursor = { x: 3, y: 0, visible: true };
    const cursor = rgbLabel(game.colors(DEFAULT_BACKGROUND)[COL_CURSOR]);
    const banded = (squares: DrawOp[][]) =>
      Array.from({ length: 25 }, (_, s) => s).filter((s) =>
        squares[s].some((op) => op.op === "polygon" && op.fillRgb === cursor),
      );
    // Region 3's squares, square 7 by its bottom and square 8 by its
    // bottom and left; not square 18, whose eight neighbors are all region
    // 3's, so no border reaches it.
    const region = Array.from({ length: 25 }, (_, s) => s).filter(
      (s) => of[s] === 3 || s === 7 || s === 8,
    );
    expect(banded(draw(b, [], ui))).toEqual(region.filter((s) => s !== 18));
    // A hidden cursor bands nothing.
    expect(
      banded(draw(b, [], { ...ui, cursor: { ...ui.cursor, visible: false } })),
    ).toEqual([]);
    // Typing notes, a corner triangle at the top left of the region's first
    // square whose corner is the region's: square 12, since square 7's top
    // left is region 1's.
    const first = 12;
    const x0 = origin + (first % 5) * TS;
    const y0 = origin + Math.floor(first / 5) * TS;
    const corner = draw(b, [], { ...ui, pencilMode: true })[first].filter(
      (op) =>
        op.op === "polygon" &&
        op.fillRgb === cursor &&
        op.points.every(([x, y]) => x <= x0 + TS / 2 && y <= y0 + TS / 2),
    );
    expect(corner.length).toBeGreaterThan(0);
  });
});
