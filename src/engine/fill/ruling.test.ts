/**
 * A player's divider (`play.dividers`), on the `ruling` fixture, a Latin
 * square typed into with notes, its lines labeled: a press between two
 * labels, or `|` or `-`, toggles a divider, which a save holds and a restart
 * takes away, drawn as a wall between two rows and the same two columns.
 */

import { describe, expect, it } from "vitest";
import * as ruling from "../../generated/engine/testing/fixtures/ruling/ruling.compiled.ts";
import { UI_UPDATE } from "../contract/game.ts";
import { LEFT_BUTTON, RIGHT_BUTTON } from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { asDealt, type FillBoard } from "./board.ts";
import { KEY_BAR, KEY_MINUS } from "./dividers.ts";
import { fillGame } from "./game.ts";
import { applyMove, type FillMove, fillMoveOf } from "./notes.ts";
import { numberInput } from "./numbers.ts";
import type { FillUi } from "./play.ts";
import { fillRender } from "./render.ts";

type Board = FillBoard<ruling.Dealt>;

const game = fillGame("ruling", ruling);
const render = fillRender(
  ruling,
  { play: ruling.play, lineClues: ruling.lineClues, labels: ruling.labels },
  (s) => s,
);
const P = { w: 4, h: 4, diff: 0 };
const TS = 32;
const ds = { tileSize: TS };
/** The labels' margin is a tile deep, so the first cell lies a tile in. */
const O = render.origin(
  TS,
  game.newState(P, game.newDesc(P, randomNew("ruling")).desc),
);
const input = numberInput<ruling.Dealt, typeof ds>(ruling, render.origin);
const board = (): Board => game.newState(P, game.newDesc(P, randomNew("ruling")).desc);
const divider = (a: number) => ({ type: "divider", a, b: a + 1 });

describe("a player's divider", () => {
  it("is toggled by a press in the labels' margin, at the gap nearest it", () => {
    const b = board();
    const ui = game.newUi(b);
    expect(O).toBe(TS);
    const top = (x: number) =>
      input.interpretMove(b, ui, ds, { x, y: O / 2 }, LEFT_BUTTON);
    // The right half of the first column's label is nearest the gap after
    // it; its left half, the board's edge.
    expect(top(O + TS - 4)).toEqual(divider(0));
    expect(top(O + TS + 4)).toEqual(divider(0));
    expect(top(O + 2 * TS + 20)).toEqual(divider(2));
    expect(top(O + 4)).toBeNull();
    expect(top(O + 4 * TS - 4)).toBeNull();
    const left = input.interpretMove(
      b,
      ui,
      ds,
      { x: O / 2, y: O + 2 * TS },
      RIGHT_BUTTON,
    );
    expect(left).toEqual(divider(1));
    // The corner the two margins share is neither's.
    expect(input.interpretMove(b, ui, ds, { x: 4, y: 4 }, LEFT_BUTTON)).not.toEqual(
      expect.objectContaining({ type: "divider" }),
    );
  });

  it("is toggled by | after the cursor's column and - after its row, the cursor shown first", () => {
    const b = board();
    const ui = game.newUi(b);
    expect(input.interpretMove(b, ui, ds, { x: 0, y: 0 }, KEY_BAR)).toBe(UI_UPDATE);
    ui.cursor.x = 1;
    ui.cursor.y = 2;
    expect(input.interpretMove(b, ui, ds, { x: 0, y: 0 }, KEY_BAR)).toEqual(divider(1));
    expect(input.interpretMove(b, ui, ds, { x: 0, y: 0 }, KEY_MINUS)).toEqual(
      divider(2),
    );
    ui.cursor.x = 3;
    expect(input.interpretMove(b, ui, ds, { x: 0, y: 0 }, KEY_BAR)).toBeNull();
  });

  it("is a move: on, off again, held by a save, and taken away by a restart", () => {
    const b = board();
    expect(Array.from(b.dividers ?? [])).toEqual([-1, -1, -1, -1]);
    const on = applyMove(ruling, b, divider(1) as FillMove);
    expect(Array.from(on.dividers ?? [])).toEqual([-1, 2, -1, -1]);
    expect(b.dividers?.[1]).toBe(-1);
    const off = applyMove(ruling, on, divider(1) as FillMove);
    expect(off.dividers?.[1]).toBe(-1);
    expect(asDealt(on).dividers?.[1]).toBe(-1);
    expect(fillMoveOf(JSON.parse(JSON.stringify(divider(1))), "test")).toEqual(
      divider(1),
    );
    expect(() => fillMoveOf({ type: "divider", a: "1", b: 2 }, "test")).toThrow();
    expect(() => applyMove(ruling, b, { type: "divider", a: 3, b: 4 })).toThrow(
      /no lines 3 and 4/,
    );
  });

  it("is drawn as a wall between the two rows and the same two columns", () => {
    const b = board();
    const rects = (s: Board) => {
      const dr = new RecordingDrawing(render.colors(DEFAULT_BACKGROUND));
      render.redraw(dr, render.newDrawState(s, TS), {
        state: s,
        prev: null,
        dir: 1,
        ui: game.newUi(s) as FillUi,
        animTime: 0,
        flash: NO_FLASH,
      });
      return dr.ops.flatMap((o: DrawOp) => (o.op === "rect" ? [o] : []));
    };
    const plain = new Set(rects(b).map((o) => o.color));
    const walled = rects(applyMove(ruling, b, divider(1) as FillMove)).filter(
      (o) => !plain.has(o.color),
    );
    const cells = new Set(
      walled.map((o) => Math.floor((o.y - O) / TS) * 4 + Math.floor((o.x - O) / TS)),
    );
    // Rows 1 and 2 whole, and columns 1 and 2 of the rows beyond them.
    expect([...cells].sort((p, q) => p - q)).toEqual([
      1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14,
    ]);
    // A wall a cell's side long, across each of those sides.
    expect(walled.every((o) => o.w === TS || o.h === TS)).toBe(true);
  });
});
