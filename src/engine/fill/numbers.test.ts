/**
 * A board of numbers (`play.numbers`), on the `squaring` fixture, a Latin
 * square with givens: its answer sampled as a Latin square, its givens a
 * clue kind compiled from `given:`, the Latin library on its ladder, the
 * select-then-type input and its keypad, and its numerals drawn.
 */

import { describe, expect, it } from "vitest";
import * as squaring from "../../generated/engine/testing/fixtures/squaring/squaring.compiled.ts";
import { UI_UPDATE } from "../contract/game.ts";
import { BACKSPACE, LEFT_BUTTON } from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { editOf } from "./edit.ts";
import { fillGame } from "./game.ts";
import { encodeDesc } from "./game-id.ts";
import { numberInput } from "./numbers.ts";
import { type FillUi, newFillUi } from "./play.ts";
import { fillRender } from "./render.ts";
import { sampleLatin } from "./sample.ts";

const game = fillGame("squaring", squaring);
const P = { w: 4, h: 4, diff: 0 };
const TS = 32;
const ds = { tileSize: TS };
const KEY = (n: number) => 48 + n;

/** A dealt 4x4 board. */
const dealt = (seed = "squaring"): FillBoard<squaring.Dealt> =>
  game.newState(P, game.newDesc(P, randomNew(seed)).desc);

/** Whether `g` holds each of 1 to `w` once in every row and column. */
const isLatin = (g: ArrayLike<number>, w: number): boolean => {
  for (let i = 0; i < w; i++) {
    const row = new Set<number>();
    const col = new Set<number>();
    for (let j = 0; j < w; j++) {
      row.add(g[i * w + j]);
      col.add(g[j * w + i]);
    }
    for (const s of [row, col])
      if (s.size !== w || [...s].some((v) => v < 1 || v > w)) return false;
  }
  return true;
};

describe("a board of numbers' deal", () => {
  it("samples a Latin square", () => {
    for (const w of [3, 4, 6]) {
      const sp = spaceOf(squaring, { w, h: w });
      for (let i = 0; i < 5; i++)
        expect(isLatin(sampleLatin(sp, randomNew(`latin-${w}-${i}`)), w)).toBe(true);
    }
  });

  it("deals its givens fixed, as `given:` states them, and fewer than every cell", () => {
    for (const seed of ["a", "b", "c"]) {
      const b = dealt(seed);
      const { given } = b.dealt;
      expect(given.at.length).toBeGreaterThan(0);
      expect(given.at.length).toBeLessThan(16);
      for (let c = 0; c < 16; c++) expect(b.fixed[c]).toBe(given.byAt[c] >= 0 ? 1 : 0);
      expect([...given.at].map((c) => b.values[c])).toEqual([...given.v]);
      // The ID writes the givens, and reads back the same board.
      const desc = encodeDesc(squaring.deal, spaceOf(squaring, b), b.dealt);
      expect([...game.newState(P, desc).values]).toEqual([...b.values]);
    }
  });

  it("solves by its ladder to a Latin square, and hints a placement", () => {
    const b = dealt();
    const solved = solveBoard(squaring, b, 0);
    expect(solved.verdict).toBe("solved");
    expect(isLatin(solved.values, 4)).toBe(true);
    const plan = game.hint.plan(b, undefined, game.newUi(b));
    if (!("steps" in plan)) throw new Error(`no plan: ${JSON.stringify(plan)}`);
    const [c, v] = editOf(plan.steps[0].move, "a squaring step").set ?? [];
    expect(v).toBe(solved.values[c]);
  });
});

describe("a board of numbers' input", () => {
  const input = numberInput<squaring.Dealt, typeof ds>(squaring, () => 0);
  const at = (c: number) => ({
    x: (c % 4) * TS + TS / 2,
    y: Math.floor(c / 4) * TS + TS / 2,
  });
  const board = dealt();
  const open = [...board.fixed].indexOf(0);
  const given = [...board.fixed].indexOf(1);
  const select = (c: number): FillUi => {
    const ui = game.newUi(board);
    expect(input.interpretMove(board, ui, ds, at(c), LEFT_BUTTON)).toBe(UI_UPDATE);
    return ui;
  };
  /** A typed value at cell `c`, as the note-taking cell's move. */
  const typed = (c: number, n: number) => ({
    type: "set",
    x: c % 4,
    y: Math.floor(c / 4),
    n,
    pencil: false,
    autoElim: false,
  });

  it("selects an open cell with a press, and types a number into it", () => {
    const ui = select(open);
    expect([ui.cursor.visible, ui.cursor.x, ui.cursor.y]).toEqual([
      true,
      open % 4,
      Math.floor(open / 4),
    ]);
    expect(input.interpretMove(board, ui, ds, at(open), KEY(3))).toEqual(
      typed(open, 3),
    );
    // A mouse selection is put away by the entry.
    expect(ui.cursor.visible).toBe(false);
  });

  it("empties a cell with Backspace", () => {
    const filled = { ...board, values: board.values.slice() };
    filled.values[open] = 2;
    const ui = game.newUi(filled);
    input.interpretMove(filled, ui, ds, at(open), LEFT_BUTTON);
    expect(input.interpretMove(filled, ui, ds, at(open), BACKSPACE)).toEqual(
      typed(open, 0),
    );
  });

  it("leaves a given unselected, and refuses a number past the board's", () => {
    expect(select(given).cursor.visible).toBe(false);
    const ui = select(open);
    expect(input.interpretMove(board, ui, ds, at(open), KEY(5))).toBeNull();
  });

  it("offers a key a value and the clear key", () => {
    expect(game.requestKeys?.(P).map((k) => k.label)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "Clear",
    ]);
  });

  it("shows a hint's placement as a tap and a key", () => {
    const ui = newFillUi();
    expect(input.gesture(board, ui, ds, { set: [open, 3] })).toEqual([
      { kind: "click", at: at(open), button: "primary" },
      { kind: "key", code: KEY(3) },
    ]);
  });
});

describe("a board of numbers drawn", () => {
  const draw = (b: FillBoard<squaring.Dealt>, ui: FillUi): readonly DrawOp[] => {
    const render = fillRender(
      squaring,
      { play: squaring.play, lineClues: squaring.lineClues },
      (s) => s,
    );
    const dr = new RecordingDrawing(render.colors(DEFAULT_BACKGROUND));
    render.redraw(dr, render.newDrawState(b, TS), {
      state: b,
      prev: null,
      dir: 1,
      ui,
      animTime: 0,
      flash: NO_FLASH,
    });
    return dr.ops;
  };
  const texts = (ops: readonly DrawOp[]) =>
    ops.flatMap((o) => (o.op === "text" ? [o.text] : []));

  it("draws each value as its numeral, and an open cell as none", () => {
    const b = dealt();
    const shown = texts(draw(b, newFillUi()));
    expect(shown.length).toBe(b.dealt.given.at.length);
    expect(shown.sort()).toEqual([...b.dealt.given.v].map(String).sort());
  });

  it("draws the player's number apart from a given, and the selected cell washed", () => {
    const b = dealt();
    const open = [...b.fixed].indexOf(0);
    const typed = { ...b, values: b.values.slice() };
    typed.values[open] = 1;
    const ui = newFillUi();
    const ops = draw(typed, ui);
    const inks = new Set(
      ops.flatMap((o) => (o.op === "text" ? [JSON.stringify(o.color)] : [])),
    );
    expect(inks.size).toBe(2);
    ui.cursor.x = open % 4;
    ui.cursor.y = Math.floor(open / 4);
    ui.cursor.visible = true;
    const fills = (o: readonly DrawOp[]) =>
      new Set(o.flatMap((d) => (d.op === "rect" ? [JSON.stringify(d.color)] : [])));
    const added = [...fills(draw(typed, ui))].filter((c) => !fills(ops).has(c));
    expect(added.length).toBe(1);
  });

  it("writes its values as numerals in the text format", () => {
    const b = dealt();
    const c = b.dealt.given.at[0];
    const row = game.textFormat?.(b)?.split("\n")[2 * Math.floor(c / 4) + 1] ?? "";
    expect(row).toContain(` ${b.dealt.given.v[0]} `);
  });
});
