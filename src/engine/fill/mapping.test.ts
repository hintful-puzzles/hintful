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
import { COL_CURSOR, COL_ERROR, COL_HINT_OUTLINE } from "../color/roles.ts";
import { validateDesc } from "../contract/desc-error.ts";
import { UI_UPDATE } from "../contract/game.ts";
import {
  CELL,
  mark,
  type Narration,
  NOTE,
  phrase,
  stepMarks,
  unshaped,
} from "../contract/hint-words.ts";
import type { Point } from "../contract/types.ts";
import {
  CURSOR_DOWN,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_UP,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  MARK_ALL_BUTTON,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
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
type Hint = NonNullable<Parameters<typeof game.redraw>[2]["hint"]>;

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

  /** One frame of board `b`, with the hint's step `hint` on display, and
   * each square's ops, by the clip it draws in; on draw state `ds` where it
   * is given, else a fresh one. */
  function draw(
    b: Board,
    mistakes: readonly FillMistake[] = [],
    ui = newFillUi(),
    hint: Hint | null = null,
    ds = game.newDrawState(b, TS),
  ) {
    const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
    game.redraw(dr, ds, {
      state: b,
      prev: null,
      dir: 1,
      ui,
      animTime: 0,
      flash: NO_FLASH,
      mistakes,
      ...(hint === null ? {} : { hint }),
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

  /** The first step the hint plans on board `b`. */
  const firstStep = (b: Board): Hint => {
    const plan = game.hint.plan(b);
    if (!plan.ok) throw new Error(`no hint: ${plan.error}`);
    return plan.steps[0];
  };
  /** The first step the hint plans on board `b` that rings a region, after
   * the notes it dots and strikes, and the region. */
  const ringingStep = (b: Board): { step: Hint; r: number } => {
    const plan = game.hint.plan(b);
    if (!plan.ok) throw new Error(`no hint: ${plan.error}`);
    for (const step of plan.steps) {
      const [ringed] = stepMarks(step).of("ring", CELL);
      if (ringed !== undefined) return { step, r: ringed.x };
    }
    throw new Error("no step rings a region");
  };
  /** A step on display whose words are `words`, marking what they name. */
  const shown = (words: Narration): Hint => ({
    ...firstStep(board()),
    words: unshaped(words, "setup"),
  });
  /** Whether square `s` holds any of region `r`. */
  const holds = (b: Board, s: number, r: number) => {
    const g = partsGeometry(b.dealt.map as Squares, DESC);
    return [TOP, BOTTOM, LEFT, RIGHT].some((t) => g.quadrants[t * 25 + s] === r);
  };

  it("rings the region a step decides at its label point", () => {
    const b = board();
    const { step, r } = ringingStep(b);
    expect(stepMarks(step).of("ring", CELL)).toHaveLength(1);
    const { labels } = partsGeometry(b.dealt.map as Squares, DESC);
    const o = (game.computeSize(p, TS).w - 5 * TS - 1) / 2;
    const rings = draw(b, [], newFillUi(), step)
      .flat()
      .flatMap((op) => (op.op === "ring" ? [op] : []));
    expect(rings.length).toBeGreaterThan(0);
    // Centered there, to the half pixel the ring's stroke is laid on.
    for (const ring of rings) {
      const dx = ring.x + ring.w / 2 - (o + Math.floor((TS * labels[r].x) / 2));
      const dy = ring.y + ring.h / 2 - (o + Math.floor((TS * labels[r].y) / 2));
      expect(Math.max(Math.abs(dx), Math.abs(dy))).toBeLessThanOrEqual(0.5);
    }
    expect(
      draw(b)
        .flat()
        .some((op) => op.op === "ring"),
    ).toBe(false);
  });

  it("dashes a line inside the border of a region a step reasons from", () => {
    const b = board();
    const step = shown(
      phrase`${mark.this("outline", CELL, [{ x: 3, y: 0 }], "region")}`,
    );
    const squares = draw(b, [], newFillUi(), step);
    const dashes = (s: number) =>
      squares[s].filter((op) => op.op === "polygon" && op.fill === COL_HINT_OUTLINE)
        .length;
    for (let s = 0; s < 25; s++)
      if (!holds(b, s, 3)) expect(dashes(s), `square ${s}`).toBe(0);
    // Square 12's top runs along region 3's border, broken into dashes.
    expect(dashes(12)).toBeGreaterThan(1);
    expect(
      draw(b)
        .flat()
        .some((op) => op.op === "polygon" && op.fill === COL_HINT_OUTLINE),
    ).toBe(false);
  });

  it("crosses the dots of the notes a step strikes, and no others", () => {
    const b = board();
    const pencil = new Int32Array(6);
    // Region 3, open: pink and teal, the pink struck.
    pencil[3] = (1 << 1) | (1 << 3);
    const noted = { ...b, pencil };
    const step = shown(
      phrase`${mark.as("strike", NOTE, [{ x: 3, y: 0, n: 1 }], "pink")}`,
    );
    const squares = draw(noted, [], newFillUi(), step);
    const pinks = (s: number) =>
      squares[s].filter(
        (op) => op.op === "circle" && op.fillRgb === rgbLabel(FOUR_FILL_MARKS[0]),
      ).length;
    const strikes = (s: number) => squares[s].filter((op) => op.op === "line").length;
    let struck = 0;
    for (let s = 0; s < 25; s++) {
      expect(strikes(s), `square ${s}`).toBe(pinks(s));
      struck += strikes(s);
    }
    expect(struck).toBeGreaterThan(0);
    expect(
      draw(noted)
        .flat()
        .some((op) => op.op === "line"),
    ).toBe(false);
  });

  it("repaints the squares a ring left when the step is gone", () => {
    const b = board();
    // Squares a ring reached that hold none of its region: no word of
    // theirs changes when it goes.
    let beyond = 0;
    for (let r = 0; r < 6; r++) {
      const ds = game.newDrawState(b, TS);
      const step = shown(
        phrase`${mark.this("ring", CELL, [{ x: r, y: 0 }], "region")}`,
      );
      const ringed = draw(b, [], newFillUi(), step, ds).map((ops) =>
        ops.some((op) => op.op === "ring"),
      );
      beyond += ringed.filter((rung, s) => rung && !holds(b, s, r)).length;
      // The squares the ring reached, and those whose part it decided.
      const after = draw(b, [], newFillUi(), null, ds);
      expect(
        after.map((ops) => ops.length > 0),
        `region ${r}`,
      ).toEqual(ringed.map((rung, s) => rung || holds(b, s, r)));
      expect(after.flat().some((op) => op.op === "ring")).toBe(false);
    }
    expect(beyond).toBeGreaterThan(0);
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
  type Ui = ReturnType<typeof game.newUi>;
  type Ds = ReturnType<typeof game.newDrawState>;
  /** A drag from `from` to `to`, by `button` (the left by default), and
   * what its release makes. */
  const drag = (
    b: Board,
    ui: Ui,
    ds: Ds,
    from: Point,
    to: Point,
    button: "left" | "right" = "left",
  ) => {
    const [press, move, release] =
      button === "left"
        ? [LEFT_BUTTON, LEFT_DRAG, LEFT_RELEASE]
        : [RIGHT_BUTTON, RIGHT_DRAG, RIGHT_RELEASE];
    expect(game.interpretMove(b, ui, ds, from, press)).toBe(UI_UPDATE);
    game.interpretMove(b, ui, ds, to, move);
    return game.interpretMove(b, ui, ds, to, release);
  };
  /** A tap at `at`: a press and a release there. */
  const tap = (b: Board, ui: Ui, ds: Ds, at: Point) => drag(b, ui, ds, at, at);

  it("selects the region of the triangle a tap lands in, and types into it", () => {
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
      expect(tap(b, ui, ds, pointIn(s, t))).toBe(UI_UPDATE);
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
    tap(b, ui, ds, pointIn(7, TOP));
    expect(ui.cursor.visible).toBe(false);
  });

  it("walks the cursor over the squares, selecting the triangle on the side it moved toward", () => {
    const b = board();
    const ds = game.newDrawState(b, TS);
    const g = partsGeometry(b.dealt.map as Squares, DESC);
    const ui = game.newUi(b);
    // Tapped on square 6's bottom, region 0.
    tap(b, ui, ds, pointIn(6, BOTTOM));
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
      tap(b, ui, ds, press.at);
      expect(ui.cursor, `region ${region}`).toMatchObject({ x: region, visible: true });
    }
  });

  it("plays each of a hint's steps by its gesture, to the end", () => {
    const { gesture } = game.hint;
    if (gesture === undefined) throw new Error("mapping: no hint gesture");
    // A board of more regions, with notes to dot and strike.
    const q = game.decodeParams("6x6n9");
    let b = game.newState(q, game.newDesc(q, randomNew("hint gesture")).desc);
    const ui = game.newUi(b);
    const ds = game.newDrawState(b, TS);
    const press = (at: Point, button: "primary" | "secondary") => {
      const [down, up] =
        button === "primary"
          ? [LEFT_BUTTON, LEFT_RELEASE]
          : [RIGHT_BUTTON, RIGHT_RELEASE];
      game.interpretMove(b, ui, ds, at, down);
      return game.interpretMove(b, ui, ds, at, up);
    };
    const kinds = new Set<string>();
    let steps = 0;
    while (game.status(b) === "ongoing") {
      const step = firstStep(b);
      const expected = game.executeMove(b, step.move);
      for (const a of gesture(b, ui, ds, step.move, step)) {
        kinds.add(a.kind);
        if (a.kind === "drag") throw new Error("a drag, not a press or a key");
        // The midend answers Mark-all itself, from the game's `markAll`.
        const move =
          a.kind === "click"
            ? press(a.at, a.button)
            : a.code === MARK_ALL_BUTTON
              ? (game.markAll?.(b) ?? null)
              : game.interpretMove(b, ui, ds, { x: 0, y: 0 }, a.code);
        if (move !== null && move !== UI_UPDATE) b = game.executeMove(b, move);
      }
      expect(b.values, `step ${steps}`).toEqual(expected.values);
      expect(b.pencil, `step ${steps}`).toEqual(expected.pencil);
      steps++;
      if (steps > 100) throw new Error("no end to the hint's steps");
    }
    expect(steps).toBeGreaterThan(3);
    expect([...kinds].sort()).toEqual(["click", "key"]);
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

  // Carried by a drag (2.6c2).
  /** A point in a whole square of region `r`. */
  const inRegion = (b: Board, r: number): Point => {
    const s = Array.from({ length: 25 }, (_, i) => i).find(
      (i) => b.dealt.map.of[i] === r && ![6, 7, 8].includes(i),
    );
    if (s === undefined) throw new Error(`no whole square of region ${r}`);
    return pointIn(s, TOP);
  };
  /** Board `b` with region `r` colored `v`. */
  const colored = (b: Board, r: number, v: number): Board => {
    const values = Uint8Array.from(b.values);
    values[r] = v;
    return { ...b, values };
  };
  /** Board `b` with region `r` noted `notes`. */
  const noted = (b: Board, r: number, notes: number): Board => {
    const pencil = Int32Array.from(b.pencil ?? []);
    pencil[r] = notes;
    return { ...b, pencil };
  };

  it("carries a region's color to an open region, from a given as well", () => {
    const b = board();
    const ds = game.newDrawState(b, TS);
    const ui = game.newUi(b);
    const pink = b.values[4];
    expect(b.fixed[4]).toBe(1);
    const made = drag(b, ui, ds, inRegion(b, 4), inRegion(b, 0));
    expect(made).toEqual({
      type: "set",
      x: 0,
      y: 0,
      n: pink,
      pencil: false,
      autoElim: false,
    });
    // The pointer let go of it, and an entry it made shows no selection.
    expect(ui.carry).toBeNull();
    expect(ui.cursor.visible).toBe(false);
    if (made === null || made === UI_UPDATE) throw new Error("no move");
    const after = game.executeMove(b, made);
    expect(drag(after, ui, ds, inRegion(b, 0), inRegion(b, 3))).toMatchObject({
      type: "set",
      x: 3,
      n: pink,
      pencil: false,
    });
  });

  it("taps where the carry changes nothing, and selects", () => {
    const b = board();
    const ds = game.newDrawState(b, TS);
    const ui = game.newUi(b);
    // Onto a given, nothing, and a given is not selected.
    expect(drag(b, ui, ds, inRegion(b, 4), inRegion(b, 1))).toBe(UI_UPDATE);
    expect(ui.cursor.visible).toBe(false);
    // Onto the region it came from: a tap, which selects it, and again
    // puts the selection away.
    expect(drag(b, ui, ds, inRegion(b, 0), pointIn(6, BOTTOM))).toBe(UI_UPDATE);
    expect(ui.cursor).toMatchObject({ x: 0, y: 0, visible: true });
    tap(b, ui, ds, inRegion(b, 0));
    expect(ui.cursor.visible).toBe(false);
    // A drag onto a region holding the color already changes nothing.
    const both = colored(colored(b, 0, 3), 3, 3);
    expect(drag(both, ui, ds, inRegion(b, 0), inRegion(b, 3))).toBe(UI_UPDATE);
    expect(ui.cursor).toMatchObject({ x: 3, visible: true });
  });

  it("toggles the color carried as a note with the right button, or while notes are typed", () => {
    const b = board();
    const ds = game.newDrawState(b, TS);
    const ui = game.newUi(b);
    const v = b.values[5];
    const note = { type: "set", x: 0, y: 0, n: v, pencil: true };
    expect(drag(b, ui, ds, inRegion(b, 5), inRegion(b, 0), "right")).toEqual(note);
    ui.pencilMode = true;
    expect(drag(b, ui, ds, inRegion(b, 5), inRegion(b, 0))).toEqual(note);
    // A colored region takes no note.
    expect(drag(colored(b, 0, 1), ui, ds, inRegion(b, 5), inRegion(b, 0))).toBe(
      UI_UPDATE,
    );
  });

  it("carries an empty region's notes, or its emptiness", () => {
    const b = board();
    const ds = game.newDrawState(b, TS);
    const ui = game.newUi(b);
    const dots = (1 << 1) | (1 << 3);
    const from = noted(b, 0, dots);
    // Onto an empty region, its notes written whole; onto a colored one,
    // emptied first; the same with the right button.
    expect(drag(from, ui, ds, inRegion(b, 0), inRegion(b, 3))).toEqual({
      notes: [3, dots],
    });
    expect(drag(colored(from, 3, 2), ui, ds, inRegion(b, 0), inRegion(b, 3))).toEqual({
      set: [3, 0],
      notes: [3, dots],
    });
    expect(drag(from, ui, ds, inRegion(b, 0), inRegion(b, 3), "right")).toEqual({
      notes: [3, dots],
    });
    // An empty region with no notes empties the region it is let go on.
    expect(drag(colored(b, 3, 2), ui, ds, inRegion(b, 0), inRegion(b, 3))).toEqual({
      type: "set",
      x: 3,
      y: 0,
      n: 0,
      pencil: false,
      autoElim: false,
    });
  });

  it("draws what the pointer carries under it, and puts back what it covered", () => {
    const b = noted(board(), 0, (1 << 2) | (1 << 4));
    const ds = game.newDrawState(b, TS);
    const ui = game.newUi(b);
    const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
    // The double restores no pixels: where they are put back is recorded.
    const loads: Point[] = [];
    dr.blitterLoad = (_bl?: unknown, at?: Point) => {
      if (at !== undefined) loads.push({ ...at });
    };
    const frame = () => {
      dr.ops.length = 0;
      game.redraw(dr, ds, {
        state: b,
        prev: null,
        dir: 1,
        ui,
        animTime: 0,
        flash: NO_FLASH,
        mistakes: [],
      });
      return dr.ops.flatMap((op) => (op.op === "circle" ? [op] : []));
    };
    const at = { x: 40, y: 50 };
    // A given's color, a disc of it at the pointer.
    game.interpretMove(b, ui, ds, inRegion(b, 4), LEFT_BUTTON);
    game.interpretMove(b, ui, ds, at, LEFT_DRAG);
    const disc = frame().find((op) => op.cx === at.x && op.cy === at.y);
    expect(disc?.fillRgb).toBe(rgbLabel(FOUR_FILLS[b.values[4] - 1]));
    expect(disc?.r).toBe(TS / 2);
    // Let go off the board, the next frame puts back what the disc covered.
    game.interpretMove(b, ui, ds, { x: 0, y: 0 }, LEFT_RELEASE);
    expect(frame().some((op) => op.cx === at.x && op.cy === at.y)).toBe(false);
    expect(loads).toEqual([{ x: at.x - TS / 2 - 2, y: at.y - TS / 2 - 2 }]);
    // An empty region's notes, dotted over an empty disc.
    game.interpretMove(b, ui, ds, inRegion(b, 0), LEFT_BUTTON);
    game.interpretMove(b, ui, ds, at, LEFT_DRAG);
    const held = frame().filter(
      (op) => Math.hypot(op.cx - at.x, op.cy - at.y) < TS / 2 && op.r < TS / 4,
    );
    expect(held.map((op) => op.fillRgb)).toEqual([
      rgbLabel(FOUR_FILL_MARKS[1]),
      rgbLabel(FOUR_FILL_MARKS[3]),
    ]);
  });
});
