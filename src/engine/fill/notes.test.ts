/**
 * The candidate notes of a board of numbers (`play.notes`), on the `squaring`
 * fixture: kept beside each open cell's value, set and struck by the
 * note-taking cell's input, struck by a placement under auto-pencil, filled
 * and cleaned by Mark-all, checked against the answer, and drawn. A board
 * that declares no notes keeps none.
 */

import { describe, expect, it } from "vitest";
import * as playing from "../../generated/engine/testing/fixtures/playing/playing.compiled.ts";
import * as squaring from "../../generated/engine/testing/fixtures/squaring/squaring.compiled.ts";
import { UI_UPDATE } from "../contract/game.ts";
import type { CandidateMove } from "../hint/candidate-hint.ts";
import { markAllPress } from "../input/hint-gesture.ts";
import { LEFT_BUTTON, PENCIL_MODE_BUTTON, RIGHT_BUTTON } from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { answerOf } from "./answer.ts";
import type { FillBoard } from "./board.ts";
import { fillGame } from "./game.ts";
import { type FillMove, fillMoveOf } from "./notes.ts";
import { numberInput } from "./numbers.ts";
import type { FillUi } from "./play.ts";
import { fillRender } from "./render.ts";

const game = fillGame("squaring", squaring);
const P = { w: 4, h: 4, diff: 0 };
const TS = 32;
const ds = { tileSize: TS };
const KEY = (n: number) => 48 + n;
const input = numberInput<squaring.Dealt, typeof ds>(squaring, () => 0);
const at = (c: number) => ({
  x: (c % 4) * TS + TS / 2,
  y: Math.floor(c / 4) * TS + TS / 2,
});
const bit = (n: number) => 1 << n;

type Board = FillBoard<squaring.Dealt>;

/** A dealt 4x4 board. */
const dealt = (seed = "squaring"): Board =>
  game.newState(P, game.newDesc(P, randomNew(seed)).desc);

/** The board after each of `moves` in turn. */
const play = (b: Board, ...moves: FillMove[]): Board =>
  moves.reduce((s, m) => game.executeMove(s, m), b);

/** The open cells of `b`, and two of them that share no row or column. */
function openCells(b: Board): { open: number[]; a: number; apart: number } {
  const open = [...b.fixed.keys()].filter((c) => b.fixed[c] === 0);
  const a = open[0];
  const apart = open.find(
    (c) => c % 4 !== a % 4 && Math.floor(c / 4) !== Math.floor(a / 4),
  );
  if (apart === undefined) throw new Error("no two open cells apart");
  return { open, a, apart };
}

const note = (c: number, n: number): CandidateMove => ({
  type: "set",
  x: c % 4,
  y: Math.floor(c / 4),
  n,
  pencil: true,
});
const place = (c: number, n: number, autoElim = false): CandidateMove => ({
  type: "set",
  x: c % 4,
  y: Math.floor(c / 4),
  n,
  pencil: false,
  autoElim,
});

describe("a board's notes", () => {
  it("are kept where the description declares them, and nowhere else", () => {
    const b = dealt();
    expect(b.pencil).toEqual(new Int32Array(16));
    expect(game.newUi(b).pencilMode).toBe(false);
    expect(game.markAll).toBeDefined();
    const buttons = fillGame("playing", playing);
    const p = buttons.defaultParams();
    const board = buttons.newState(p, buttons.newDesc(p, randomNew("playing")).desc);
    expect(board.pencil).toBeNull();
    expect("pencilMode" in buttons.newUi(board)).toBe(false);
    expect(buttons.markAll).toBeUndefined();
  });

  it("keep a cell's notes while a value is placed where it rules out neither", () => {
    const b = dealt();
    const { a, apart } = openCells(b);
    const after = play(b, note(a, 1), note(a, 2), place(apart, 1, true));
    expect(after.pencil?.[a]).toBe(bit(1) | bit(2));
    expect(after.values[a]).toBe(0);
  });

  it("strike a placed value from the notes it rules out, under auto-pencil alone", () => {
    const b = dealt();
    const { a, open } = openCells(b);
    const peer = open.find((c) => c !== a && c % 4 === a % 4);
    if (peer === undefined) throw new Error("no open cell in a's column");
    const noted = play(b, note(a, 1), note(a, 2), note(peer, 1), note(peer, 3));
    expect(play(noted, place(peer, 1, false)).pencil?.[a]).toBe(bit(1) | bit(2));
    const struck = play(noted, place(peer, 1, true));
    expect(struck.pencil?.[a]).toBe(bit(2));
    // A placed value takes its cell's notes' place.
    expect(struck.pencil?.[peer]).toBe(0);
  });

  it("toggle a note, and refuse one on a given", () => {
    const b = dealt();
    const { a } = openCells(b);
    expect(play(b, note(a, 3), note(a, 3)).pencil?.[a]).toBe(0);
    const given = [...b.fixed].indexOf(1);
    expect(() => play(b, note(given, 1))).toThrow(/not open/);
  });

  it("are read back from a save, and a move of another shape is refused", () => {
    expect(fillMoveOf(JSON.parse(JSON.stringify(note(5, 2))), "test")).toEqual(
      note(5, 2),
    );
    expect(
      fillMoveOf({ type: "pencilStrike", marks: [{ x: 1, y: 1, n: 2 }] }, "t"),
    ).toEqual({
      type: "pencilStrike",
      marks: [{ x: 1, y: 1, n: 2 }],
    });
    expect(() => fillMoveOf({ type: "set", x: 1, y: 1, n: 2 }, "t")).toThrow();
    expect(() => fillMoveOf({ type: "pencilAdd", marks: [{ x: 1 }] }, "t")).toThrow();
  });
});

describe("a board's notes as the player takes them", () => {
  const board = dealt();
  const { a } = openCells(board);

  it("select a cell for notes with a right press, and type a note into it", () => {
    const ui = game.newUi(board);
    expect(input.interpretMove(board, ui, ds, at(a), RIGHT_BUTTON)).toBe(UI_UPDATE);
    expect([ui.pencilMode, ui.cursor.visible]).toEqual([true, true]);
    expect(input.interpretMove(board, ui, ds, at(a), KEY(2))).toEqual(note(a, 2));
    // A note keeps the highlight, for the next.
    expect(ui.cursor.visible).toBe(true);
  });

  it("switch typing to notes with the Marks key", () => {
    const ui = game.newUi(board);
    input.interpretMove(board, ui, ds, at(a), LEFT_BUTTON);
    expect(input.interpretMove(board, ui, ds, at(a), PENCIL_MODE_BUTTON)).toBe(
      UI_UPDATE,
    );
    expect(ui.pencilMode).toBe(true);
    expect(input.interpretMove(board, ui, ds, at(a), KEY(4))).toEqual(note(a, 4));
  });

  it("take no note on a given or a filled cell", () => {
    const given = [...board.fixed].indexOf(1);
    const ui = game.newUi(board);
    input.interpretMove(board, ui, ds, at(given), RIGHT_BUTTON);
    expect(ui.cursor.visible).toBe(false);
    const filled = play(board, place(a, 1));
    const again = game.newUi(filled);
    input.interpretMove(filled, again, ds, at(a), RIGHT_BUTTON);
    expect(again.cursor.visible).toBe(false);
  });

  it("type a value carrying the auto-pencil preference", () => {
    const ui = game.newUi(board);
    ui.autoPencil = true;
    input.interpretMove(board, ui, ds, at(a), LEFT_BUTTON);
    expect(input.interpretMove(board, ui, ds, at(a), KEY(3))).toEqual(
      place(a, 3, true),
    );
  });
});

describe("Mark-all on a board's notes", () => {
  it("fills every open cell, keeps a narrowed one, and then strikes what a value rules out", () => {
    const b = dealt();
    const { open, a } = openCells(b);
    const narrowed = play(b, note(a, 1));
    const fill = game.markAll?.(narrowed);
    expect(fill).toEqual({ type: "pencilAll" });
    const filled = play(narrowed, fill as FillMove);
    for (const c of open) expect(filled.pencil?.[c]).toBe(c === a ? bit(1) : 0b11110);
    const clean = game.markAll?.(filled);
    if (clean === null || clean === undefined || !("type" in clean))
      throw new Error("no clean-up");
    expect(clean.type).toBe("pencilStrike");
    const cleaned = play(filled, clean);
    // No note left is a value a given in its row or column holds, and every
    // note a given does not rule out stays.
    const givens = [...b.fixed.keys()].filter((g) => b.fixed[g] === 1);
    let struck = 0;
    for (const c of open.filter((c) => c !== a)) {
      let ruled = 0;
      for (const g of givens)
        if (g % 4 === c % 4 || Math.floor(g / 4) === Math.floor(c / 4))
          ruled |= bit(b.values[g]);
      expect(cleaned.pencil?.[c]).toBe(0b11110 & ~ruled);
      if (ruled !== 0) struck++;
    }
    expect(struck).toBeGreaterThan(0);
  });

  it("is pressed as the hint's gesture for a fill-all", () => {
    const b = dealt();
    expect(
      game.hint.gesture?.(
        b,
        game.newUi(b),
        ds as never,
        { type: "pencilAll" },
        {} as never,
      ),
    ).toEqual([markAllPress]);
  });
});

describe("the mistake check on a board's notes", () => {
  it("flags a cell whose notes leave out its answer, and Clear takes them away", () => {
    const b = dealt();
    const { a, apart } = openCells(b);
    const answer = answerOf(squaring, b);
    if (answer === null) throw new Error("no answer");
    const wrong = [1, 2, 3, 4].find((n) => n !== answer[a]) as number;
    const noted = play(
      b,
      note(a, wrong),
      note(apart, answer[apart]),
      note(apart, wrong),
    );
    const mistakes = game.findMistakes?.(noted);
    expect(mistakes).toEqual([{ cell: a, kind: "note" }]);
    const cleared = play(noted, ...(game.clearMistakes?.(noted, mistakes ?? []) ?? []));
    expect(cleared.pencil?.[a]).toBe(0);
    expect(cleared.pencil?.[apart]).toBe(bit(answer[apart]) | bit(wrong));
  });
});

describe("a board's notes drawn", () => {
  const draw = (b: Board, ui: FillUi): readonly DrawOp[] => {
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
    ops.flatMap((o) => (o.op === "text" ? [o] : []));

  it("draws an open cell's notes, smaller than a value and in a color of their own", () => {
    const b = dealt();
    const { a } = openCells(b);
    const plain = texts(draw(b, game.newUi(b)));
    const noted = texts(draw(play(b, note(a, 2), note(a, 4)), game.newUi(b)));
    const inks = new Set(plain.map((t) => t.color));
    const added = noted.filter((t) => !inks.has(t.color));
    expect(added.map((t) => t.text)).toEqual(["2", "4"]);
    expect(noted.length).toBe(plain.length + 2);
    for (const t of added) {
      expect(t.size).toBeLessThan(plain[0].size);
      expect(t.color).not.toBe(plain[0].color);
    }
  });

  it("marks a cell selected for notes with the corner, and shows the pencil mode", () => {
    const b = dealt();
    const { a } = openCells(b);
    const ui = game.newUi(b);
    const plain = draw(b, ui);
    input.interpretMove(b, ui, ds, at(a), LEFT_BUTTON);
    const entry = draw(b, ui);
    input.interpretMove(b, ui, ds, at(a), PENCIL_MODE_BUTTON);
    const notes = draw(b, ui);
    const rects = (ops: readonly DrawOp[]) =>
      new Set(ops.flatMap((o) => (o.op === "rect" ? [o.rgb] : [])));
    const polygons = (ops: readonly DrawOp[]) =>
      ops.flatMap((o) => (o.op === "polygon" ? [o.fillRgb] : []));
    // The selection's wash: the one fill a selected cell adds.
    const [wash] = [...rects(entry)].filter((c) => !rects(plain).has(c));
    expect(wash).toBeDefined();
    // Selected for notes, the wash is the corner alone, and the pencil mode
    // shows beside the board.
    expect(rects(notes).has(wash)).toBe(false);
    expect(polygons(notes).filter((f) => f === wash)).toHaveLength(1);
    expect(polygons(entry)).toEqual([]);
    expect(polygons(notes).filter((f) => f !== wash).length).toBeGreaterThan(0);
  });
});
