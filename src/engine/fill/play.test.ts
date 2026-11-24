/**
 * A fill game's input, built from its `play:`, on the `playing` fixture, and
 * a link's on the `linking` one, each on a board built by hand.
 */

import { describe, expect, it } from "vitest";
import * as linking from "../../generated/engine/testing/fixtures/linking/linking.compiled.ts";
import * as playing from "../../generated/engine/testing/fixtures/playing/playing.compiled.ts";
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
import { clueList } from "../solve/describe-runtime.ts";
import {
  type Clues,
  type FillBoard,
  type FillModule,
  newBoard,
  paramSpaceOf,
} from "./board.ts";
import { applyEdit, type Edit } from "./edit.ts";
import { type FillPlay, type FillUi, fillInput, newFillUi } from "./play.ts";

const SHADED = 1;
const CROSSED = 2;

const W = 4;
const TS = 10;
const ds = { tileSize: TS };

const at = (c: number) => ({
  x: (c % W) * TS + TS / 2,
  y: Math.floor(c / W) * TS + TS / 2,
});
const NOWHERE = { x: -1, y: -1 };

/** The board after each of `steps`, a button at a cell, and the edits made. */
function drive<C extends Clues<C>>(
  module: FillModule<C>,
  play: FillPlay,
  board: FillBoard<C>,
  ui: FillUi,
  steps: readonly (readonly [number, number])[],
): { board: FillBoard<C>; edits: Edit[] } {
  const input = fillInput<C, typeof ds>(module, play, () => 0);
  const edits: Edit[] = [];
  for (const [button, c] of steps) {
    const got = input.interpretMove(board, ui, ds, c < 0 ? NOWHERE : at(c), button);
    if (got !== null && got !== UI_UPDATE) {
      edits.push(got);
      board = applyEdit(module, board, got);
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
  // Squares dealt holding their value at 1 (shaded) and 11 (crossed); the
  // line counts play no part.
  const GIVEN = { 1: SHADED, 11: CROSSED };
  function dealt(): FillBoard<playing.Dealt> {
    const sp = paramSpaceOf(playing, { w: W, h: W });
    const { count } = playing.deriveClues(new Uint8Array(W * W).fill(CROSSED), sp);
    const given = clueList(
      Object.keys(GIVEN).map(Number),
      Object.values(GIVEN),
      sp.cells.length,
    );
    return newBoard(playing, W, W, { given, count });
  }
  // Both buttons' drags sweep where the description names no `sweepWith`.
  const { sweepWith: _sweepWith, ...both } = playing.play as FillPlay;
  const play_ = (
    board: FillBoard<playing.Dealt>,
    ui: FillUi,
    steps: readonly (readonly [number, number])[],
    play: FillPlay = both,
  ) => drive(playing, play, board, ui, steps);
  const previewed = (b: FillBoard<playing.Dealt>, ui: FillUi, play: FillPlay = both) =>
    fillInput<playing.Dealt, typeof ds>(playing, play, () => 0).previewed(b, ui);

  it("holds each square dealt its value, fixed", () => {
    const board = dealt();
    for (const [c, v] of Object.entries(GIVEN)) {
      expect(board.values[Number(c)]).toBe(v);
      expect(board.fixed[Number(c)]).toBe(1);
    }
    expect(board.fixed.reduce((a, b) => a + b, 0)).toBe(2);
  });

  it("toggles a cell with its button's value, and leaves a fixed one", () => {
    const ui = newFillUi();
    let { board } = play_(dealt(), ui, click(LEFT_BUTTON, LEFT_RELEASE, 0));
    expect(board.values[0]).toBe(SHADED);
    ({ board } = play_(board, ui, click(LEFT_BUTTON, LEFT_RELEASE, 0)));
    expect(board.values[0]).toBe(0);
    ({ board } = play_(board, ui, click(RIGHT_BUTTON, RIGHT_RELEASE, 2)));
    expect(board.values[2]).toBe(CROSSED);
    const { edits } = play_(board, ui, click(LEFT_BUTTON, LEFT_RELEASE, 1));
    expect(edits).toEqual([]);
  });

  it("paints the open cells of one row with a right drag, as it previews", () => {
    const ui = newFillUi();
    const start = applyEdit(playing, dealt(), { set: [6, SHADED] });
    // Down a little and along: the drag keeps to row 1.
    play_(start, ui, [
      [RIGHT_BUTTON, 4],
      [RIGHT_DRAG, 9],
      [RIGHT_DRAG, 7],
    ]);
    const shown = previewed(start, ui);
    expect(Array.from(shown.values.slice(4, 8))).toEqual([
      CROSSED,
      CROSSED,
      SHADED,
      CROSSED,
    ]);
    const { board } = play_(start, ui, [[RIGHT_RELEASE, 7]]);
    expect(Array.from(board.values)).toEqual(Array.from(shown.values));
    expect(ui.drag?.live).toBe(false);
  });

  it("fills a row with a straight left drag, keeping the square ruled out", () => {
    const ui = newFillUi();
    const start = applyEdit(playing, dealt(), { set: [6, CROSSED] });
    const { board, edits } = play_(start, ui, [
      [LEFT_BUTTON, 4],
      [LEFT_DRAG, 5],
      [LEFT_DRAG, 7],
      [LEFT_RELEASE, 7],
    ]);
    expect(Array.from(board.values.slice(4, 8))).toEqual([
      SHADED,
      SHADED,
      CROSSED,
      SHADED,
    ]);
    expect(edits).toHaveLength(1);
  });

  it("keeps a straight drag to its row when the pointer wanders off it", () => {
    const ui = newFillUi();
    play_(dealt(), ui, [
      [LEFT_BUTTON, 4],
      [LEFT_DRAG, 5],
      [LEFT_DRAG, 10],
    ]);
    const shown = previewed(dealt(), ui);
    expect(Array.from(shown.values.slice(4, 12))).toEqual([
      SHADED,
      SHADED,
      SHADED,
      0,
      0,
      0,
      0,
      CROSSED,
    ]);
  });

  it("empties what the first square held along a drag that starts on it", () => {
    const ui = newFillUi();
    const start = applyEdit(playing, dealt(), {
      set: [4, SHADED, 5, SHADED, 6, CROSSED],
    });
    const { board } = play_(start, ui, [
      [LEFT_BUTTON, 4],
      [LEFT_DRAG, 6],
      [LEFT_RELEASE, 6],
    ]);
    expect(Array.from(board.values.slice(4, 7))).toEqual([0, 0, CROSSED]);
  });

  describe("where the drag follows the pointer", () => {
    const { straight: _straight, ...free } = both;

    it("fills the squares it passes, round a corner, as one edit", () => {
      const ui = newFillUi();
      const { board } = play_(
        dealt(),
        ui,
        [
          [RIGHT_BUTTON, 4],
          [RIGHT_DRAG, 5],
          [RIGHT_DRAG, 9],
          [RIGHT_DRAG, 10],
        ],
        free,
      );
      const shown = previewed(board, ui, free);
      expect(Array.from(shown.values.slice(4, 11))).toEqual([
        CROSSED,
        CROSSED,
        0,
        0,
        0,
        CROSSED,
        CROSSED,
      ]);
      const done = play_(board, ui, [[RIGHT_RELEASE, 10]], free).board;
      expect(Array.from(done.values)).toEqual(Array.from(shown.values));
    });

    it("takes the squares between two far-apart pointer events", () => {
      const ui = newFillUi();
      const { board } = play_(
        dealt(),
        ui,
        [
          [RIGHT_BUTTON, 4],
          [RIGHT_DRAG, 7],
          [RIGHT_RELEASE, 7],
        ],
        free,
      );
      expect(Array.from(board.values.slice(4, 8))).toEqual([
        CROSSED,
        CROSSED,
        CROSSED,
        CROSSED,
      ]);
    });
  });

  it("drags with one button alone where `sweepWith` names it", () => {
    const left = play_(
      dealt(),
      newFillUi(),
      [
        [LEFT_BUTTON, 4],
        [LEFT_DRAG, 5],
        [LEFT_RELEASE, 5],
      ],
      playing.play,
    ).board;
    expect(Array.from(left.values.slice(4, 6))).toEqual([SHADED, 0]);
    const right = play_(
      dealt(),
      newFillUi(),
      [
        [RIGHT_BUTTON, 4],
        [RIGHT_DRAG, 5],
        [RIGHT_RELEASE, 5],
      ],
      playing.play,
    ).board;
    expect(Array.from(right.values.slice(4, 6))).toEqual([CROSSED, CROSSED]);
  });

  it("flips the hidden numbers with a press off the grid, a drag game's too", () => {
    const ui = newFillUi();
    const input = fillInput<playing.Dealt, typeof ds>(playing, playing.play, () => 0);
    expect(input.interpretMove(dealt(), ui, ds, { x: 100, y: 5 }, LEFT_BUTTON)).toBe(
      UI_UPDATE,
    );
    expect(ui.hiddenShown).toBe(true);
    const { covers: _covers, ...plain } = both;
    const off = fillInput<playing.Dealt, typeof ds>(playing, plain, () => 0);
    expect(
      off.interpretMove(dealt(), newFillUi(), ds, { x: 100, y: 5 }, LEFT_BUTTON),
    ).not.toBe(UI_UPDATE);
  });

  it("carries the cursor past the grid's edge to the other edge, where it wraps", () => {
    const ui = newFillUi();
    ui.cursor.visible = true;
    ui.cursor.x = W - 1;
    play_(dealt(), ui, [[CURSOR_RIGHT, -1]]);
    expect(ui.cursor.x).toBe(0);
    const { wrap: _wrap, ...edged } = both;
    const stays = newFillUi();
    stays.cursor.visible = true;
    stays.cursor.x = W - 1;
    play_(dealt(), stays, [[CURSOR_RIGHT, -1]], edged);
    expect(stays.cursor.x).toBe(W - 1);
  });

  it("paints the secondary value from the keyboard with Shift, and over the primary with Ctrl", () => {
    const ui = newFillUi();
    ui.cursor.visible = true;
    let board = applyEdit(playing, dealt(), { set: [4, SHADED] });
    ({ board } = play_(board, ui, [[CURSOR_DOWN | MOD_SHFT, -1]]));
    expect(board.values[0]).toBe(CROSSED);
    expect(board.values[4]).toBe(SHADED);
    ({ board } = play_(board, ui, [[CURSOR_DOWN | MOD_CTRL, -1]]));
    expect(board.values[4]).toBe(CROSSED);
    expect(board.values[8]).toBe(CROSSED);
  });

  it("places each value by its key, and empties a cell by the erase keys", () => {
    const ui = newFillUi();
    ui.cursor.visible = true;
    let { board } = play_(dealt(), ui, [["s".charCodeAt(0), -1]]);
    expect(board.values[0]).toBe(SHADED);
    ({ board } = play_(board, ui, [["X".charCodeAt(0), -1]]));
    expect(board.values[0]).toBe(CROSSED);
    ({ board } = play_(board, ui, [["b".charCodeAt(0), -1]]));
    expect(board.values[0]).toBe(0);
    ({ board } = play_(board, ui, [[CURSOR_SELECT, -1]]));
    expect(board.values[0]).toBe(SHADED);
    ({ board } = play_(board, ui, [[8, -1]]));
    expect(board.values[0]).toBe(0);
  });
});

describe("a fill game's link", () => {
  const PIECE = 1;
  // Pieces (P), anchors (A) and empty squares (.), the anchors at 1, 11 and
  // 12.
  const ANSWER = ["PA..", "...P", "...A", "AP.."];
  function dealt(): FillBoard<linking.Dealt> {
    const g = Uint8Array.from(ANSWER.join(""), (ch) => "_P.A".indexOf(ch));
    return newBoard(
      linking,
      W,
      W,
      linking.deriveClues(g, paramSpaceOf(linking, { w: W, h: W })),
    );
  }
  const play_ = (
    board: FillBoard<linking.Dealt>,
    ui: FillUi,
    steps: readonly (readonly [number, number])[],
  ) => drive(linking, linking.play, board, ui, steps);

  it("joins an anchor and the open square beside it with a left drag, placing the piece, and parts them", () => {
    const ui = newFillUi();
    const joined = play_(dealt(), ui, [
      [LEFT_BUTTON, 1],
      [LEFT_DRAG, 0],
      [LEFT_RELEASE, 0],
    ]).board;
    expect(joined.values[0]).toBe(PIECE);
    expect(joined.mark[0]).toBe(0);
    const parted = play_(joined, ui, [
      [LEFT_BUTTON, 0],
      [LEFT_DRAG, 1],
      [LEFT_RELEASE, 1],
    ]).board;
    expect(parted.values[0]).toBe(PIECE);
    expect(parted.mark[0]).toBe(-1);
  });

  it("joins an anchor to its piece with L and an arrow, and lets go of the anchor's other piece", () => {
    const ui = newFillUi();
    // The third anchor, at 12, joined to a piece above it, then by key from
    // the anchor to the piece on its right.
    let board = applyEdit(linking, dealt(), {
      set: [8, PIECE, 13, PIECE],
      mark: [8, 2],
    });
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
});
