/**
 * A display order of a square board's lines (`play.order`), on the
 * `reordering` fixture, a Latin square typed into with notes, its lines
 * labeled and divided: a label dragged along its margin, or Shift and an
 * arrow, moves a row and the same column together, which a save holds and a
 * restart undoes; the board is drawn and played as its view in the order,
 * and what it says of its cells is drawn where the view shows them.
 */

import { describe, expect, it } from "vitest";
import * as reordering from "../../generated/engine/testing/fixtures/reordering/reordering.compiled.ts";
import { COL_ERROR } from "../color/roles.ts";
import { UI_UPDATE } from "../contract/game.ts";
import { CELL, stepMarks } from "../contract/hint-words.ts";
import {
  CURSOR_DOWN,
  CURSOR_RIGHT,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  MOD_SHFT,
} from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { asDealt, type FillBoard } from "./board.ts";
import { fillGame } from "./game.ts";
import { applyMove, type FillMove, fillMoveOf } from "./notes.ts";
import { viewedStep, viewOf } from "./order.ts";
import type { FillUi } from "./play.ts";

type Board = FillBoard<reordering.Dealt>;

const game = fillGame("reordering", reordering);
const P = { w: 4, h: 4, diff: 0 };
const TS = 32;
const ds = game.newDrawState(
  game.newState(P, game.newDesc(P, randomNew("r")).desc),
  TS,
);
/** The labels' margin is a tile deep, so the first cell lies a tile in. */
const O = TS;
const KEY = (n: number) => 48 + n;
const board = (): Board =>
  game.newState(P, game.newDesc(P, randomNew("reordering")).desc);
/** The board in the order `order`, as a run of reorder moves leaves it. */
const ordered = (b: Board, order: number[]): Board =>
  order.reduce(
    (s, line, to) => applyMove(reordering, s, { type: "reorder", line, to }),
    b,
  );
const move = (b: Board, ui: FillUi, p: { x: number; y: number }, button: number) =>
  game.interpretMove(b, ui, ds, p, button);
/** The middle of the column label at place `i`, and of the row label. */
const top = (i: number, dx = 0) => ({ x: O + i * TS + TS / 2 + dx, y: O / 2 });
const side = (i: number) => ({ x: O / 2, y: O + i * TS + TS / 2 });

/** What a frame of `b` under `ui` draws. */
function drawn(b: Board, ui: FillUi): DrawOp[] {
  const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
  game.redraw(dr, game.newDrawState(b, TS), {
    state: b,
    prev: null,
    dir: 1,
    ui,
    animTime: 0,
    flash: NO_FLASH,
  });
  return dr.ops;
}

describe("a display order of the lines", () => {
  it("moves a line by dragging its label, and toggles a divider on a release that never moved", () => {
    const b = ordered(board(), [1, 2, 0, 3]);
    const ui = game.newUi(b);
    // The press is the drag's start, and makes no move.
    expect(move(b, ui, top(0), LEFT_BUTTON)).toBe(UI_UPDATE);
    expect(move(b, ui, top(2), LEFT_DRAG)).toBe(UI_UPDATE);
    // The board's line at the first place, carried to the third.
    expect(move(b, ui, top(2), LEFT_RELEASE)).toEqual({
      type: "reorder",
      line: 1,
      to: 2,
    });
    // A row's label drags along the rows; let go where it began, nothing.
    expect(move(b, ui, side(3), LEFT_BUTTON)).toBe(UI_UPDATE);
    expect(move(b, ui, side(1), LEFT_DRAG)).toBe(UI_UPDATE);
    expect(move(b, ui, side(3), LEFT_DRAG)).toBe(UI_UPDATE);
    expect(move(b, ui, side(3), LEFT_RELEASE)).toBe(UI_UPDATE);
    // A press near the gap after the first place, released unmoved, rules
    // the divider between the lines drawn either side of it.
    expect(move(b, ui, top(0, 12), LEFT_BUTTON)).toBe(UI_UPDATE);
    expect(move(b, ui, top(0, 13), LEFT_DRAG)).toBe(UI_UPDATE);
    expect(move(b, ui, top(0, 13), LEFT_RELEASE)).toEqual({
      type: "divider",
      a: 1,
      b: 2,
    });
  });

  it("moves the cursor's column or row a place with Shift and an arrow, the cursor going along", () => {
    const b = ordered(board(), [3, 2, 1, 0]);
    const ui = game.newUi(b);
    // A hidden cursor is shown first.
    expect(move(b, ui, { x: 0, y: 0 }, CURSOR_RIGHT | MOD_SHFT)).toBe(UI_UPDATE);
    ui.cursor.x = 1;
    ui.cursor.y = 3;
    const right = move(b, ui, { x: 0, y: 0 }, CURSOR_RIGHT | MOD_SHFT) as FillMove;
    expect(right).toEqual({ type: "reorder", line: 2, to: 2 });
    const after = applyMove(reordering, b, right);
    game.changedState?.(ui, b, after);
    expect({ x: ui.cursor.x, y: ui.cursor.y }).toEqual({ x: 2, y: 3 });
    expect(move(after, ui, { x: 0, y: 0 }, CURSOR_DOWN | MOD_SHFT)).toBeNull();
  });

  it("types into the board's square the view shows at the cursor", () => {
    const b = ordered(board(), [2, 0, 3, 1]);
    const open = b.values.findIndex((v, c) => v === 0 && b.fixed[c] === 0);
    const [x, y] = [open % 4, Math.floor(open / 4)];
    const ui = game.newUi(b);
    ui.cursor.visible = true;
    ui.cursor.x = b.order?.indexOf(x) ?? -1;
    ui.cursor.y = b.order?.indexOf(y) ?? -1;
    expect(move(b, ui, { x: 0, y: 0 }, KEY(1))).toMatchObject({ type: "set", x, y });
  });

  it("is a move: held by a save, parting a divider's lines takes it away, and a restart undoes it", () => {
    const b = board();
    expect(Array.from(b.order ?? [])).toEqual([0, 1, 2, 3]);
    const divided = applyMove(reordering, b, { type: "divider", a: 0, b: 1 });
    const kept = applyMove(reordering, divided, { type: "reorder", line: 3, to: 0 });
    expect(Array.from(kept.order ?? [])).toEqual([3, 0, 1, 2]);
    expect(kept.dividers?.[0]).toBe(1);
    const parted = applyMove(reordering, kept, { type: "reorder", line: 0, to: 3 });
    expect(Array.from(parted.order ?? [])).toEqual([3, 1, 2, 0]);
    expect(parted.dividers?.[0]).toBe(-1);
    expect(Array.from(asDealt(parted).order ?? [])).toEqual([0, 1, 2, 3]);
    const m = { type: "reorder", line: 3, to: 0 };
    expect(fillMoveOf(JSON.parse(JSON.stringify(m)), "test")).toEqual(m);
    expect(() => fillMoveOf({ type: "reorder", line: "3", to: 0 }, "test")).toThrow();
    expect(() => applyMove(reordering, b, { type: "reorder", line: 4, to: 0 })).toThrow(
      /no line 4/,
    );
  });

  it("draws each line's label, value and given at its place", () => {
    const b = ordered(board(), [2, 0, 3, 1]);
    const ops = drawn(b, game.newUi(b));
    const texts = ops.flatMap((o) => (o.op === "text" ? [o] : []));
    const labelsAlong = texts
      .filter((o) => o.y === O / 2 && o.x > O)
      .sort((p, q) => p.x - q.x)
      .map((o) => o.text);
    expect(labelsAlong).toEqual(["3", "1", "4", "2"]);
    // Each given's numeral lies in the square of the view showing its cell.
    const given = b.values.findIndex((v, c) => v !== 0 && b.fixed[c] === 1);
    const [x, y] = [given % 4, Math.floor(given / 4)];
    const px = O + (b.order?.indexOf(x) ?? 0) * TS + TS / 2;
    const py = O + (b.order?.indexOf(y) ?? 0) * TS + TS / 2;
    expect(
      texts.some(
        (o) =>
          Math.abs(o.x - px) <= 2 &&
          Math.abs(o.y - py) <= 2 &&
          o.text === String(b.values[given]),
      ),
    ).toBe(true);
  });

  it("draws a broken rule where the view shows its squares", () => {
    // Two open squares of a row, not neighbors, so no diamond goes between
    // them: the same number typed into both turns both numerals red.
    const order = [3, 2, 1, 0];
    let b: Board | null = null;
    let pair: number[] = [];
    for (let seed = 0; b === null; seed++) {
      const dealt = game.newState(P, game.newDesc(P, randomNew(`pair${seed}`)).desc);
      for (let y = 0; y < 4 && b === null; y++) {
        const open = [0, 1, 2, 3].filter((x) => dealt.fixed[y * 4 + x] === 0);
        const [x0, x1] = [open[0], open[open.length - 1]];
        if (open.length < 2 || x1 - x0 < 2) continue;
        // A number neither the row nor either column holds, so the two
        // squares alone break the rule.
        const held = [0, 1, 2, 3].flatMap((i) => [
          dealt.values[y * 4 + i],
          dealt.values[i * 4 + x0],
          dealt.values[i * 4 + x1],
        ]);
        const v = [1, 2, 3, 4].find((n) => !held.includes(n));
        if (v === undefined) continue;
        pair = [y * 4 + x0, y * 4 + x1];
        const values = dealt.values.slice();
        for (const c of pair) values[c] = v;
        b = ordered({ ...dealt, values }, order);
      }
    }
    // Every numeral on the board, by the view's square it is drawn in.
    const numerals = drawn(b, game.newUi(b)).flatMap((o) =>
      o.op === "text" && o.x > O && o.y > O
        ? [{ at: Math.floor((o.y - O) / TS) * 4 + Math.floor((o.x - O) / TS), o }]
        : [],
    );
    const seen = pair.map(
      (c) => order.indexOf(Math.floor(c / 4)) * 4 + order.indexOf(c % 4),
    );
    const colors = new Set(seen.map((c) => numerals.find((t) => t.at === c)?.o.color));
    // The two are drawn red where the view shows them, and nothing else is.
    expect([...colors]).toEqual([COL_ERROR]);
    const others = numerals.filter((t) => !seen.includes(t.at)).map((t) => t.o.color);
    expect(others.length).toBeGreaterThan(0);
    expect(others).not.toContain(COL_ERROR);
  });

  it("draws a dragged line as the selected square is, at the place it is over", () => {
    const b = board();
    const rects = (ui: FillUi) =>
      drawn(b, ui).flatMap((o) => (o.op === "rect" ? [o] : []));
    const plain = new Set(rects(game.newUi(b)).map((o) => o.color));
    const ui = game.newUi(b);
    move(b, ui, side(0), LEFT_BUTTON);
    move(b, ui, side(2), LEFT_DRAG);
    const lit = new Set(
      rects(ui)
        .filter((o) => !plain.has(o.color) && o.x >= O && o.y >= O)
        .map((o) => Math.floor((o.y - O) / TS) * 4 + Math.floor((o.x - O) / TS)),
    );
    expect([...lit].sort((p, q) => p - q)).toEqual([8, 9, 10, 11]);
  });

  it("marks a hint's cells where the view shows them, its words as they were", () => {
    const b = ordered(asDealt(board()), [1, 3, 0, 2]);
    const got = game.hint.plan(b, undefined, game.newUi(b));
    if (!got.ok) throw new Error("no hint on a dealt board");
    // The first step that rings a square: one before it may set notes up.
    const step = got.steps.find((s) => stepMarks(s).of("ring", CELL).length > 0);
    if (step === undefined)
      throw new Error(`no step rings a square: ${got.steps.map((s) => s.words?.text)}`);
    const lines = b.order as Int32Array;
    const seen = viewedStep(4, lines, step);
    expect(seen.words?.text).toBe(step.words?.text);
    const rings = stepMarks(step).of("ring", CELL);
    expect(stepMarks(seen).of("ring", CELL)).toEqual(
      rings.map((p) => ({ ...p, x: lines.indexOf(p.x), y: lines.indexOf(p.y) })),
    );
    // The view holds the board's value where it shows the ringed square.
    const view = viewOf(b, lines);
    const [r] = rings;
    expect(view.values[lines.indexOf(r.y) * 4 + lines.indexOf(r.x)]).toBe(
      b.values[r.y * 4 + r.x],
    );
  });
});
