/**
 * A selection a drag makes (`play.select`), on the `selecting` fixture, a
 * Latin square typed into with notes: a drag from the selected square along
 * a diagonal selects the squares on it, a number typed goes into all of them
 * as one move, which a save holds, and each is highlighted as the selected
 * square is.
 */

import { describe, expect, it } from "vitest";
import * as selecting from "../../generated/engine/testing/fixtures/selecting/selecting.compiled.ts";
import { UI_UPDATE } from "../contract/game.ts";
import {
  BACKSPACE,
  CURSOR_RIGHT,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  PENCIL_MODE_BUTTON,
} from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import type { FillBoard } from "./board.ts";
import { fillGame } from "./game.ts";
import { applyMove, type FillMove, fillMoveOf } from "./notes.ts";
import { numberInput } from "./numbers.ts";
import type { FillUi } from "./play.ts";
import { fillRender } from "./render.ts";

type Board = FillBoard<selecting.Dealt>;

const game = fillGame("selecting", selecting);
const P = { w: 4, h: 4, diff: 0 };
const TS = 32;
const ds = { tileSize: TS };
const KEY = (n: number) => 48 + n;
const input = numberInput<selecting.Dealt, typeof ds>(selecting, () => 0);
const at = (c: number) => ({
  x: (c % 4) * TS + TS / 2,
  y: Math.floor(c / 4) * TS + TS / 2,
});

/** A dealt 4x4 board emptied, but for `given`: cell, value, ... dealt
 * fixed. */
function boardWith(...given: number[]): Board {
  const b = game.newState(P, game.newDesc(P, randomNew("selecting")).desc);
  const values = new Uint8Array(16);
  const fixed = new Uint8Array(16);
  for (let i = 0; i < given.length; i += 2) {
    values[given[i]] = given[i + 1];
    fixed[given[i]] = 1;
  }
  return { ...b, values, fixed, pencil: new Int32Array(16) };
}

/** A press on cell `from` and a drag to cell `to`, released there. */
function dragged(b: Board, from: number, to: number): FillUi {
  const ui = game.newUi(b);
  expect(input.interpretMove(b, ui, ds, at(from), LEFT_BUTTON)).toBe(UI_UPDATE);
  expect(input.interpretMove(b, ui, ds, at(to), LEFT_DRAG)).toBe(UI_UPDATE);
  input.interpretMove(b, ui, ds, at(to), LEFT_RELEASE);
  return ui;
}

describe("a selection a drag makes", () => {
  it("selects the squares of a diagonal from the selected one, and nothing off it", () => {
    const b = boardWith();
    expect(dragged(b, 0, 15).selected).toEqual([0, 5, 10, 15]);
    expect(dragged(b, 13, 7).selected).toEqual([13, 10, 7]);
    // Off a diagonal the selection is the pressed square alone.
    expect(dragged(b, 0, 14).selected).toEqual([]);
  });

  it("types a number into every square as one move, passing a given that holds it", () => {
    const b = boardWith(5, 3);
    const ui = dragged(b, 0, 15);
    const move = input.interpretMove(b, ui, ds, at(0), KEY(3));
    expect(move).toEqual({
      type: "setCells",
      cells: [0, 10, 15],
      n: 3,
      autoElim: false,
    });
    const after = applyMove(selecting, b, move as FillMove);
    expect([0, 5, 10, 15].map((c) => after.values[c])).toEqual([3, 3, 3, 3]);
    // A given holding another number refuses it.
    expect(input.interpretMove(b, dragged(b, 0, 15), ds, at(0), KEY(2))).toBeNull();
  });

  it("empties every square with Backspace, notes and all", () => {
    const b = boardWith();
    b.values[0] = 2;
    b.pencil?.set([0, 0, 0, 0, 0, 0b110], 0);
    const move = input.interpretMove(b, dragged(b, 0, 5), ds, at(0), BACKSPACE);
    expect(move).toEqual({ type: "setCells", cells: [0, 5], n: 0 });
    const after = applyMove(selecting, b, move as FillMove);
    expect([after.values[0], after.pencil?.[5]]).toEqual([0, 0]);
  });

  it("strikes the number from the notes each square rules out, under auto-pencil", () => {
    const b = boardWith();
    b.pencil?.fill(0b11110);
    const ui = dragged(b, 0, 5);
    ui.autoPencil = true;
    const after = applyMove(
      selecting,
      b,
      input.interpretMove(b, ui, ds, at(0), KEY(1)) as FillMove,
    );
    // Row 0, column 0, row 1 and column 1 lose the 1; the rest keep it.
    const has1 = (c: number) => ((after.pencil?.[c] ?? 0) & 0b10) !== 0;
    expect([1, 4, 6, 9, 13].map(has1)).toEqual([false, false, false, false, false]);
    expect([10, 11, 14, 15].map(has1)).toEqual([true, true, true, true]);
  });

  it("notes a number on every square in notes mode, and strikes it from all once all hold it", () => {
    const b = boardWith();
    const ui = dragged(b, 0, 10);
    expect(input.interpretMove(b, ui, ds, at(0), PENCIL_MODE_BUTTON)).toBe(UI_UPDATE);
    const marks = (cells: number[]) =>
      cells.map((c) => ({ x: c % 4, y: Math.floor(c / 4), n: 2 }));
    b.pencil?.set([0b100], 5);
    expect(input.interpretMove(b, ui, ds, at(0), KEY(2))).toEqual({
      type: "pencilAdd",
      marks: marks([0, 10]),
    });
    b.pencil?.set([0b100], 0);
    b.pencil?.set([0b100], 10);
    expect(input.interpretMove(b, ui, ds, at(0), KEY(2))).toEqual({
      type: "pencilStrike",
      marks: marks([0, 5, 10]),
    });
  });

  it("is dropped by a press elsewhere or an arrow", () => {
    const b = boardWith();
    const ui = dragged(b, 0, 10);
    input.interpretMove(b, ui, ds, at(2), LEFT_BUTTON);
    expect(ui.selected).toEqual([]);
    const keyed = dragged(b, 0, 10);
    input.interpretMove(b, keyed, ds, at(0), CURSOR_RIGHT);
    expect(keyed.selected).toEqual([]);
  });

  it("is a move a save holds, read back as it was written", () => {
    const move = { type: "setCells", cells: [0, 5], n: 2, autoElim: true };
    expect(fillMoveOf(JSON.parse(JSON.stringify(move)), "test")).toEqual(move);
    expect(() =>
      fillMoveOf({ type: "setCells", cells: ["0"], n: 2 }, "test"),
    ).toThrow();
  });

  it("highlights every square of it as the selected one", () => {
    const render = fillRender(
      selecting,
      { play: selecting.play, lineClues: selecting.lineClues },
      (s) => s,
    );
    const b = boardWith();
    const rects = (ui: FillUi) => {
      const dr = new RecordingDrawing(render.colors(DEFAULT_BACKGROUND));
      render.redraw(dr, render.newDrawState(b, TS), {
        state: b,
        prev: null,
        dir: 1,
        ui,
        animTime: 0,
        flash: NO_FLASH,
      });
      return dr.ops.flatMap((o: DrawOp) => (o.op === "rect" ? [o] : []));
    };
    // The highlight is the fill the selected square adds to a plain board.
    const plain = new Set(rects(game.newUi(b)).map((o) => o.color));
    /** The squares a fill no plain board has lies in. */
    const lit = (ui: FillUi): number[] => [
      ...new Set(
        rects(ui)
          .filter((o) => !plain.has(o.color))
          .map((o) => Math.floor(o.y / TS) * 4 + Math.floor(o.x / TS)),
      ),
    ];
    expect(lit(dragged(b, 0, 0))).toEqual([0]);
    expect(lit(dragged(b, 0, 15)).sort((p, q) => p - q)).toEqual([0, 5, 10, 15]);
  });
});
