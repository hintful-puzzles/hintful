/**
 * A fill game's input, built from its `play:`, on Tents' compiled module and
 * a board dealt from a hand-drawn answer.
 */

import { describe, expect, it } from "vitest";
import * as tents from "../../generated/games/tents/tents.compiled.ts";
import { UI_UPDATE } from "../contract/game.ts";
import {
  CURSOR_DOWN,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  MOD_CTRL,
  MOD_SHFT,
  RIGHT_BUTTON,
  RIGHT_DRAG,
  RIGHT_RELEASE,
} from "../input/pointer.ts";
import { type FillBoard, newBoard, spaceOf } from "./board.ts";
import { applyEdit, type Edit } from "./edit.ts";
import { type FillPlay, type FillUi, fillInput, newFillUi } from "./play.ts";

const TENT = 1;
const GRASS = 2;

const play: FillPlay = tents.play;

// Tents (T), trees (R) and grass (.), the trees at 1, 11 and 12.
const ANSWER = ["TR..", "...T", "...R", "RT.."];
const W = 4;
const TS = 10;
const ds = { tileSize: TS };
const input = fillInput<tents.Dealt, typeof ds>(tents, play, () => 0);

function dealt(): FillBoard<tents.Dealt> {
  const g = Uint8Array.from(ANSWER.join(""), (ch) => "_T.R".indexOf(ch));
  const sp = spaceOf(tents, { w: W, h: W });
  return newBoard(tents, W, W, tents.deriveClues(g, sp));
}

const at = (c: number) => ({
  x: (c % W) * TS + TS / 2,
  y: Math.floor(c / W) * TS + TS / 2,
});
const NOWHERE = { x: -1, y: -1 };

/** The board after each of `steps`, a button at a cell, and the edits made. */
function play_(
  board: FillBoard<tents.Dealt>,
  ui: FillUi,
  steps: readonly (readonly [number, number])[],
): { board: FillBoard<tents.Dealt>; edits: Edit[] } {
  const edits: Edit[] = [];
  for (const [button, c] of steps) {
    const got = input.interpretMove(board, ui, ds, c < 0 ? NOWHERE : at(c), button);
    if (got !== null && got !== UI_UPDATE) {
      edits.push(got);
      board = applyEdit(tents, board, got);
    }
  }
  return { board, edits };
}

const click = (button: number, release: number, c: number) =>
  [
    [button, c],
    [release, c],
  ] as const;

describe("a fill game's input", () => {
  it("toggles a cell with its button's value, and leaves a fixed one", () => {
    const ui = newFillUi();
    let { board } = play_(dealt(), ui, click(LEFT_BUTTON, LEFT_RELEASE, 0));
    expect(board.values[0]).toBe(TENT);
    ({ board } = play_(board, ui, click(LEFT_BUTTON, LEFT_RELEASE, 0)));
    expect(board.values[0]).toBe(0);
    ({ board } = play_(board, ui, click(RIGHT_BUTTON, RIGHT_RELEASE, 2)));
    expect(board.values[2]).toBe(GRASS);
    const { edits } = play_(board, ui, click(LEFT_BUTTON, LEFT_RELEASE, 1));
    expect(edits).toEqual([]);
  });

  it("paints the open cells of one row with a right drag, as it previews", () => {
    const ui = newFillUi();
    const start = applyEdit(tents, dealt(), { set: [6, TENT] });
    // Down a little and along: the drag keeps to row 1.
    play_(start, ui, [
      [RIGHT_BUTTON, 4],
      [RIGHT_DRAG, 9],
      [RIGHT_DRAG, 7],
    ]);
    const shown = input.previewed(start, ui);
    expect(Array.from(shown.values.slice(4, 8))).toEqual([GRASS, GRASS, TENT, GRASS]);
    const { board } = play_(start, ui, [[RIGHT_RELEASE, 7]]);
    expect(Array.from(board.values)).toEqual(Array.from(shown.values));
    expect(ui.drag.live).toBe(false);
  });

  it("fills a row with a straight left drag, keeping the square ruled out", () => {
    const ui = newFillUi();
    const start = applyEdit(tents, dealt(), { set: [6, GRASS] });
    const { board, edits } = play_(start, ui, [
      [LEFT_BUTTON, 4],
      [LEFT_DRAG, 5],
      [LEFT_DRAG, 7],
      [LEFT_RELEASE, 7],
    ]);
    expect(Array.from(board.values.slice(4, 8))).toEqual([TENT, TENT, GRASS, TENT]);
    expect(edits).toHaveLength(1);
  });

  it("keeps a straight drag to its row when the pointer wanders off it", () => {
    const ui = newFillUi();
    play_(dealt(), ui, [
      [LEFT_BUTTON, 4],
      [LEFT_DRAG, 5],
      [LEFT_DRAG, 10],
    ]);
    const shown = input.previewed(dealt(), ui);
    expect(Array.from(shown.values.slice(4, 12))).toEqual([
      TENT,
      TENT,
      TENT,
      0,
      0,
      0,
      0,
      3,
    ]);
  });

  it("empties what the first square held along a drag that starts on it", () => {
    const ui = newFillUi();
    const start = applyEdit(tents, dealt(), { set: [4, TENT, 5, TENT, 6, GRASS] });
    const { board } = play_(start, ui, [
      [LEFT_BUTTON, 4],
      [LEFT_DRAG, 6],
      [LEFT_RELEASE, 6],
    ]);
    expect(Array.from(board.values.slice(4, 7))).toEqual([0, 0, GRASS]);
  });

  describe("where the drag follows the pointer", () => {
    const { straight: _straight, ...free } = play;
    const freeInput = fillInput<tents.Dealt, typeof ds>(tents, free, () => 0);
    const drive = (
      inp: typeof freeInput,
      board: FillBoard<tents.Dealt>,
      ui: FillUi,
      steps: readonly (readonly [number, number])[],
    ) => {
      for (const [button, c] of steps) {
        const got = inp.interpretMove(board, ui, ds, c < 0 ? NOWHERE : at(c), button);
        if (got !== null && got !== UI_UPDATE) board = applyEdit(tents, board, got);
      }
      return board;
    };

    it("fills the squares it passes, round a corner, as one edit", () => {
      const ui = newFillUi();
      const board = drive(freeInput, dealt(), ui, [
        [RIGHT_BUTTON, 4],
        [RIGHT_DRAG, 5],
        [RIGHT_DRAG, 9],
        [RIGHT_DRAG, 10],
      ]);
      const shown = freeInput.previewed(board, ui);
      expect(Array.from(shown.values.slice(4, 11))).toEqual([
        GRASS,
        GRASS,
        0,
        0,
        0,
        GRASS,
        GRASS,
      ]);
      const done = drive(freeInput, board, ui, [[RIGHT_RELEASE, 10]]);
      expect(Array.from(done.values)).toEqual(Array.from(shown.values));
    });

    it("takes the squares between two far-apart pointer events", () => {
      const ui = newFillUi();
      const board = drive(freeInput, dealt(), ui, [
        [RIGHT_BUTTON, 4],
        [RIGHT_DRAG, 7],
        [RIGHT_RELEASE, 7],
      ]);
      expect(Array.from(board.values.slice(4, 8))).toEqual([
        GRASS,
        GRASS,
        GRASS,
        GRASS,
      ]);
    });

    it("drags with one button alone where `sweepWith` names it", () => {
      const one = fillInput<tents.Dealt, typeof ds>(
        tents,
        { ...free, sweepWith: "secondary" },
        () => 0,
      );
      const left = drive(one, dealt(), newFillUi(), [
        [LEFT_BUTTON, 4],
        [LEFT_DRAG, 5],
        [LEFT_RELEASE, 5],
      ]);
      expect(Array.from(left.values.slice(4, 6))).toEqual([TENT, 0]);
      const right = drive(one, dealt(), newFillUi(), [
        [RIGHT_BUTTON, 4],
        [RIGHT_DRAG, 5],
        [RIGHT_RELEASE, 5],
      ]);
      expect(Array.from(right.values.slice(4, 6))).toEqual([GRASS, GRASS]);
    });
  });

  it("flips the hidden numbers with a press off the grid, a drag game's too", () => {
    const hiding = fillInput<tents.Dealt, typeof ds>(
      tents,
      { ...play, hides: { value: TENT, pref: { kw: "k", name: "n" } } },
      () => 0,
    );
    const ui = newFillUi();
    expect(hiding.interpretMove(dealt(), ui, ds, { x: 100, y: 5 }, LEFT_BUTTON)).toBe(
      UI_UPDATE,
    );
    expect(ui.hiddenShown).toBe(true);
  });

  it("joins a tree and the open square beside it with a left drag, placing the tent, and parts them", () => {
    const ui = newFillUi();
    const joined = play_(dealt(), ui, [
      [LEFT_BUTTON, 1],
      [LEFT_DRAG, 0],
      [LEFT_RELEASE, 0],
    ]).board;
    expect(joined.values[0]).toBe(TENT);
    expect(joined.mark[0]).toBe(0);
    const parted = play_(joined, ui, [
      [LEFT_BUTTON, 0],
      [LEFT_DRAG, 1],
      [LEFT_RELEASE, 1],
    ]).board;
    expect(parted.values[0]).toBe(TENT);
    expect(parted.mark[0]).toBe(-1);
  });

  it("joins a tree to its tent with L and an arrow, and lets go of the tree's other tent", () => {
    const ui = newFillUi();
    // The third tree, at 12, joined to a tent above it, then by key from the
    // tree to the tent on its right.
    let board = applyEdit(tents, dealt(), { set: [8, TENT, 13, TENT], mark: [8, 2] });
    ui.cursor.x = 0;
    ui.cursor.y = 3;
    ui.cursor.visible = true;
    ({ board } = play_(board, ui, [
      ["L".charCodeAt(0), -1],
      [CURSOR_RIGHT, -1],
    ]));
    expect(board.mark[13]).toBe(2);
    expect(board.mark[8]).toBe(-1);
    expect(ui.cursor.x).toBe(1);
  });

  it("paints grass from the keyboard with Shift, and over tents with Ctrl", () => {
    const ui = newFillUi();
    ui.cursor.visible = true;
    let board = applyEdit(tents, dealt(), { set: [4, TENT] });
    ({ board } = play_(board, ui, [[CURSOR_DOWN | MOD_SHFT, -1]]));
    expect(board.values[0]).toBe(GRASS);
    expect(board.values[4]).toBe(TENT);
    ({ board } = play_(board, ui, [[CURSOR_DOWN | MOD_CTRL, -1]]));
    expect(board.values[4]).toBe(GRASS);
    expect(board.values[8]).toBe(GRASS);
  });

  it("places each value by its key, and empties a cell by the erase keys", () => {
    const ui = newFillUi();
    ui.cursor.visible = true;
    let { board } = play_(dealt(), ui, [["t".charCodeAt(0), -1]]);
    expect(board.values[0]).toBe(TENT);
    ({ board } = play_(board, ui, [["N".charCodeAt(0), -1]]));
    expect(board.values[0]).toBe(GRASS);
    ({ board } = play_(board, ui, [["b".charCodeAt(0), -1]]));
    expect(board.values[0]).toBe(0);
    ({ board } = play_(board, ui, [[CURSOR_SELECT, -1]]));
    expect(board.values[0]).toBe(TENT);
    ({ board } = play_(board, ui, [[8, -1]]));
    expect(board.values[0]).toBe(0);
  });
});
