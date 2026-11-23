/**
 * A board that is a hexagon stored sheared (`space.grid.hexagon`), on the
 * `shearing` fixture: its store and ID, its deal, its cursor and its
 * drawing. A hexagon 4 by 4 is stored 5 by 4, its rows starting at store
 * columns 1, 1, 0 and 0, so cells 0, 5, 14 and 19 are its corners.
 */

import { describe, expect, it } from "vitest";
import * as shearing from "../../generated/engine/testing/fixtures/shearing/shearing.compiled.ts";
import { CURSOR_LEFT, CURSOR_RIGHT, MOD_NUM_KEYPAD } from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { inHexagon } from "../solve/describe-runtime.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { type FillBoard, spaceOf } from "./board.ts";
import { applyEdit } from "./edit.ts";
import { fillGame } from "./game.ts";
import { encodeDesc } from "./game-id.ts";
import { fillInput, newFillUi } from "./play.ts";
import { fillRender } from "./render.ts";

const SHADED = 1;
const CLEAR = 2;
const game = fillGame("shearing", shearing);
const P = { w: 4, h: 4, diff: 0 };
const DESC = "2b1c0c2_2b1";
const CORNERS = [0, 5, 14, 19];

const outside = (b: { w: number; h: number }): number[] =>
  Array.from({ length: b.w * b.h }, (_, c) => c).filter(
    (c) => !inHexagon(b.w, b.h, c % b.w, Math.floor(c / b.w)),
  );

describe("a hexagon's store and ID", () => {
  it("stores a hexagon half its height wider, its corners the outside kind, fixed", () => {
    const b = game.newState(P, DESC);
    expect([b.w, b.h]).toEqual([5, 4]);
    expect(outside(b)).toEqual(CORNERS);
    expect([...b.dealt.corner.at]).toEqual(CORNERS);
    for (const c of CORNERS) expect([b.fixed[c], b.values[c]]).toEqual([1, CLEAR]);
    // The ID's numbers sit on the hexagon's cells in reading order.
    expect([...b.dealt.number.at]).toEqual([1, 4, 9, 13, 15, 18]);
  });

  it("writes the hexagon's cells alone", () => {
    const b = game.newState(P, DESC);
    expect(encodeDesc(shearing.deal, spaceOf(shearing, b), b.dealt)).toBe(DESC);
  });
});

describe("a hexagon's deal", () => {
  // What the deal derives, which its ladder reads: an ID writes no corner,
  // so a board read back from one cannot show it.
  it("derives the outside kind on the corners alone, and no other clue there", () => {
    const store = { w: 7, h: 5 };
    const sp = spaceOf(shearing, { ...store, dealt: {}, variations: [] });
    const g = new Uint8Array(store.w * store.h).fill(CLEAR);
    const { corner, number } = shearing.deriveClues(g, sp);
    expect([...corner.at]).toEqual(outside(store));
    // Every cell clear, each of the hexagon's numbers a 0.
    expect([...number.at]).toEqual(sp.cells.filter((c) => !outside(store).includes(c)));
  });

  it("deals on a hexagon of each parity, in a store half its height wider", () => {
    for (const h of [4, 5]) {
      const p = { w: 5, h, diff: 0 };
      const b = game.newState(p, game.newDesc(p, randomNew(`hex-${h}`)).desc);
      expect([b.w, b.h]).toEqual([5 + Math.ceil(h / 2) - 1, h]);
    }
  });
});

describe("a hexagon's cursor", () => {
  const ds = { tileSize: 32 };
  const input = fillInput<shearing.Dealt, typeof ds>(shearing, shearing.play, () => 0);
  const pad = (digit: number) => MOD_NUM_KEYPAD | (48 + digit);
  /** The cursor after `keys`, from `from`. */
  const cursorAfter = (from: readonly [number, number], keys: readonly number[]) => {
    const b = game.newState(P, DESC);
    const ui = game.newUi(b);
    [ui.cursor.x, ui.cursor.y] = from;
    for (const k of keys) input.interpretMove(b, ui, ds, { x: -1, y: -1 }, k);
    return [ui.cursor.x, ui.cursor.y];
  };

  it("starts on the hexagon's first cell", () => {
    const ui = game.newUi(game.newState(P, DESC));
    expect([ui.cursor.x, ui.cursor.y]).toEqual([1, 0]);
  });

  it("steps to each of a cell's six neighbors on the number pad", () => {
    expect(cursorAfter([2, 1], [pad(6)])).toEqual([3, 1]);
    expect(cursorAfter([2, 1], [pad(4)])).toEqual([1, 1]);
    // 7 and 3 straight up and down the store, 9 and 1 across the shear.
    expect(cursorAfter([2, 1], [pad(3)])).toEqual([2, 2]);
    expect(cursorAfter([2, 1], [pad(7)])).toEqual([2, 0]);
    expect(cursorAfter([2, 1], [pad(1)])).toEqual([1, 2]);
    expect(cursorAfter([2, 1], [pad(9)])).toEqual([3, 0]);
  });

  it("keeps to the hexagon, whose rows the shear moves", () => {
    expect(cursorAfter([1, 0], [CURSOR_LEFT])).toEqual([1, 0]);
    expect(cursorAfter([3, 3], [CURSOR_RIGHT])).toEqual([3, 3]);
  });
});

describe("a hexagon drawn", () => {
  const TS = 32;
  const draw = (b: FillBoard<shearing.Dealt>): readonly DrawOp[] => {
    const input = fillInput(shearing, shearing.play, () => 1);
    const render = fillRender(
      shearing,
      { play: shearing.play, lineClues: shearing.lineClues },
      input.previewed,
    );
    const dr = new RecordingDrawing(render.colors(DEFAULT_BACKGROUND));
    render.redraw(dr, render.newDrawState(b, TS), {
      state: b,
      prev: null,
      dir: 1,
      ui: newFillUi(),
      animTime: 0,
      flash: NO_FLASH,
    });
    return dr.ops;
  };
  /** The leftmost point of what shading `c` adds to the drawing. */
  const shadedLeft = (c: number): number => {
    const b = game.newState(P, DESC);
    const before = new Set(draw(b).map((o) => JSON.stringify(o)));
    const added = draw(applyEdit(shearing, b, { set: [c, SHADED] })).filter(
      (o) => !before.has(JSON.stringify(o)),
    );
    const xs = added.flatMap((o) =>
      o.op === "polygon" ? o.points.map(([x]) => x) : [],
    );
    expect(xs.length).toBeGreaterThan(0);
    return Math.min(...xs);
  };

  it("draws each row half a tile right of the row above", () => {
    // Store column 2 in rows 0, 1 and 2.
    expect(shadedLeft(7) - shadedLeft(2)).toBe(TS / 2);
    expect(shadedLeft(12) - shadedLeft(7)).toBe(TS / 2);
  });

  it("draws a tile for each of the hexagon's cells and none for a corner", () => {
    const ops = draw(game.newState(P, DESC));
    // A tile's frame, one a cell.
    const frames = ops.filter((o) => o.op === "rect" && o.w === TS && o.h === TS);
    expect(frames.length).toBe(20 - CORNERS.length);
  });
});
