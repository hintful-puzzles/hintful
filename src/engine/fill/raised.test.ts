/**
 * A board of numbers drawn raised (`play.numbers.raised`), on the `flanking`
 * fixture with its values raised: each a block as tall as it, its numeral on
 * a top up and right of its square, repainted with the squares and margins
 * it reaches into, a press on its top taken as its square's, and flat by the
 * appearance preference.
 */

import { describe, expect, it } from "vitest";
import * as flanking from "../../generated/engine/testing/fixtures/flanking/flanking.compiled.ts";
import { UI_UPDATE } from "../contract/game.ts";
import type { Point, Rect } from "../contract/types.ts";
import { LEFT_BUTTON } from "../input/pointer.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import type { FillBoard } from "./board.ts";
import { fillGame } from "./game.ts";
import type { FillUi } from "./play.ts";

const game = fillGame("flanking", {
  ...flanking,
  play: { ...flanking.play, numbers: { raised: true } },
} as unknown as typeof flanking);
type Board = FillBoard<flanking.Dealt>;

const TS = 48;
const params = { w: 4, h: 4, diff: 0 };
// Two of the answer 1234/3412/4321/2143's squares given, and sums beside it.
const D4 = "4/6//6/6/////7//////7,a2_3m";
const b: Board = game.newState(params, D4);
const o = (game.computeSize(params, TS).w - 4 * TS) / 2;
/** The tile of the square at `(x, y)`, on the board or off it. */
const tile = (x: number, y: number): Rect => ({
  x: o + x * TS,
  y: o + y * TS,
  w: TS,
  h: TS,
});
/** How far a value stands up and right on a board whose largest is 4. */
const rise = (v: number) => ({
  dx: Math.floor((v * TS) / 32),
  dy: Math.floor((v * TS) / 16),
});
const place = (s: Board, c: number, v: number): Board =>
  game.executeMove(s, { set: [c, v] } as never);

const frame = (s: Board, ui: FillUi = game.newUi(s)) => ({
  state: s,
  prev: null,
  dir: 1,
  ui,
  animTime: 0,
  flash: NO_FLASH,
});
const draw = (s: Board, ui?: FillUi): readonly DrawOp[] => {
  const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
  game.redraw(dr, game.newDrawState(s, TS), frame(s, ui));
  return dr.ops;
};
/** The ops of the frame after `after`'s, drawn on the draw state `before`
 * left. */
const nextFrame = (before: Board, after: Board): readonly DrawOp[] => {
  const ds = game.newDrawState(before, TS);
  game.redraw(new RecordingDrawing(game.colors(DEFAULT_BACKGROUND)), ds, frame(before));
  const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
  game.redraw(dr, ds, frame(after));
  return dr.ops;
};
const textAt = (ops: readonly DrawOp[], text: string): Point[] =>
  ops.flatMap((op) =>
    op.op === "text" && op.text === text ? [{ x: op.x, y: op.y }] : [],
  );
const clips = (ops: readonly DrawOp[]): Rect[] =>
  ops.flatMap((op) =>
    op.op === "clip" ? [{ x: op.x, y: op.y, w: op.w, h: op.h }] : [],
  );
const flat = (s: Board): FillUi => ({ ...game.newUi(s), raised: false });

describe("a raised value", () => {
  it("is drawn with its numeral on a top up and right of its square, or flat in 2D", () => {
    const s = place(b, 4, 3);
    const { dx, dy } = rise(3);
    const t = tile(0, 1);
    expect(textAt(draw(s), "3")).toContainEqual({
      x: t.x + TS / 2 + dx,
      y: t.y + TS / 2 - dy,
    });
    expect(textAt(draw(s, flat(s)), "3")).toContainEqual({
      x: t.x + TS / 2,
      y: t.y + TS / 2,
    });
  });

  it("repaints the squares its top reaches into when placed and when taken away", () => {
    const placed = place(b, 9, 4);
    const reached = [tile(1, 2), tile(2, 2), tile(1, 1), tile(2, 1)];
    for (const ops of [nextFrame(b, placed), nextFrame(placed, b)])
      expect(clips(ops)).toEqual(expect.arrayContaining(reached));
    // Flat, it reaches nowhere.
    const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
    const ds = game.newDrawState(b, TS);
    game.redraw(
      new RecordingDrawing(game.colors(DEFAULT_BACKGROUND)),
      ds,
      frame(b, flat(b)),
    );
    game.redraw(dr, ds, frame(placed, flat(placed)));
    expect(clips(dr.ops)).toEqual([tile(1, 2)]);
  });

  it("repaints the clue above it and the corner square, where it stands at the top", () => {
    // Column 0's top square, and the right column's, under sums 4 and 6.
    const ops = nextFrame(b, place(place(b, 0, 1), 3, 4));
    const texts = ops.flatMap((op) => (op.op === "text" ? [op.text] : []));
    expect(texts).toEqual(expect.arrayContaining(["4", "6"]));
    expect(clips(ops)).toContainEqual(tile(4, -1));
  });

  it("takes a press on its top, over the square above, as its own square's", () => {
    const s = place(b, 9, 4);
    const ds = game.newDrawState(s, TS);
    const below = tile(1, 2);
    // Inside the square above, on the top of the value below it.
    const p = { x: below.x + TS / 2, y: below.y - 4 };
    const pressAt = (ui: FillUi) => {
      expect(game.interpretMove(s, ui, ds, p, LEFT_BUTTON)).toBe(UI_UPDATE);
      return { x: ui.cursor.x, y: ui.cursor.y };
    };
    expect(pressAt(game.newUi(s))).toEqual({ x: 1, y: 2 });
    expect(pressAt(flat(s))).toEqual({ x: 1, y: 1 });
  });

  it("is drawn raised by default, the appearance preference drawing it flat", () => {
    const pref = game.prefs?.find((p) => p.kw === "appearance");
    if (pref?.type !== "choices") throw new Error("no appearance preference");
    expect(pref.choices).toEqual(["2D", "3D"]);
    const ui = game.newUi(b);
    expect(pref.get(ui)).toBe(1);
    pref.set(ui, 0);
    expect(ui.raised).toBe(false);
  });
});
