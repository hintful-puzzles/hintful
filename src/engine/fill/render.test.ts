/**
 * A fill game drawn by layers, on Tents' compiled module and a board dealt
 * from a hand-drawn answer: what each layer puts on the canvas, read from a
 * recording.
 */

import { describe, expect, it } from "vitest";
import * as tents from "../../generated/games/tents/tents.compiled.ts";
import { COL_ERROR } from "../color/roles.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import type { FillMistake } from "./answer.ts";
import { type FillBoard, newBoard, spaceOf } from "./board.ts";
import { applyEdit, type Edit } from "./edit.ts";
import { fillInput, newFillUi } from "./play.ts";
import { type FillLook, fillRender } from "./render.ts";

const TENT = 1;

// Tents (T), trees (R) and grass (.), the trees at 1, 11 and 12.
const ANSWER = ["TR..", "...T", "...R", "RT.."];
const W = 4;
const TS = 32;
const look: FillLook<tents.Dealt> = { play: tents.play, lineClues: tents.lineClues };

function dealt(): FillBoard<tents.Dealt> {
  const g = Uint8Array.from(ANSWER.join(""), (ch) => "_T.R".indexOf(ch));
  return newBoard(tents, W, W, tents.deriveClues(g, spaceOf(tents, { w: W, h: W })));
}

function draw(
  edits: readonly Edit[],
  options: { look?: FillLook<tents.Dealt>; mistakes?: readonly FillMistake[] } = {},
): { ops: readonly DrawOp[]; render: ReturnType<typeof fillRender<tents.Dealt>> } {
  let board = dealt();
  for (const e of edits) board = applyEdit(tents, board, e);
  const input = fillInput<tents.Dealt, { tileSize: number }>(
    tents,
    tents.play,
    () => 1,
  );
  const render = fillRender(tents, options.look ?? look, input.previewed);
  const dr = new RecordingDrawing(render.colors(DEFAULT_BACKGROUND));
  const ds = render.newDrawState(board, TS);
  render.redraw(dr, ds, {
    state: board,
    prev: null,
    dir: 1,
    ui: newFillUi(),
    animTime: 0,
    flash: NO_FLASH,
    mistakes: options.mistakes,
  });
  return { ops: dr.ops, render };
}

const texts = (ops: readonly DrawOp[], color?: number): string[] =>
  ops.flatMap((o) =>
    o.op === "text" && (color === undefined || o.color === color) ? [o.text] : [],
  );

describe("a fill game drawn by layers", () => {
  it("draws each given with its painter and each line's clue past its end", () => {
    const { ops } = draw([]);
    // A tree's five leaves, for each of the three trees.
    expect(ops.filter((o) => o.op === "circle")).toHaveLength(15);
    // The rows' counts, then the columns'.
    expect(texts(ops)).toEqual(["1", "1", "0", "1", "1", "1", "0", "1"]);
  });

  it("puts a diamond on the side two touching tents share, and on the corner, a quarter a tile", () => {
    const side = draw([{ set: [4, TENT, 5, TENT] }]).ops;
    const diamonds = (ops: readonly DrawOp[]) =>
      // A diamond is outlined in ink; a tent in error is red all over.
      ops.filter(
        (o) => o.op === "polygon" && o.fill === COL_ERROR && o.outline !== o.fill,
      );
    // Each tile's half, at the side they share.
    expect(diamonds(side)).toHaveLength(2);
    const corner = draw([{ set: [4, TENT, 9, TENT] }]).ops;
    expect(diamonds(corner)).toHaveLength(4);
  });

  it("draws a link's halves on both its cells, in the error color once found wrong", () => {
    // Tent 0 linked to the tree at 1, the tree clue's index 0.
    const linked = [{ set: [0, TENT], mark: [0, 0] }];
    const render0 = draw([]).render;
    const halves = (ops: readonly DrawOp[], color?: number) =>
      ops.filter(
        (o) =>
          o.op === "rect" &&
          (color === undefined || o.color === color) &&
          o.w === Math.floor(TS / 4) + 1 &&
          o.h === Math.max(2, Math.floor(TS / 14)),
      );
    const [a, b] = halves(draw(linked).ops).flatMap((o) =>
      o.op === "rect" ? [o] : [],
    );
    // One line across the grid line the two cells share.
    expect(a.x + a.w).toBe(b.x);
    expect(b.x).toBe(render0.origin(TS, { w: W, h: W }) + TS);
    const wrong = draw(linked, { mistakes: [{ cell: 0, kind: "mark" }] }).ops;
    expect(halves(wrong, COL_ERROR)).toHaveLength(2);
  });

  it("reddens a line's clue its line breaks", () => {
    // Row 2's count is 0.
    const { ops } = draw([{ set: [8, TENT] }]);
    expect(texts(ops, COL_ERROR)).toEqual(["0"]);
  });

  it("draws fixed labels before each line, in a margin the board makes room for", () => {
    const labels = { start: (i: number) => String(i + 1) };
    const { ops, render } = draw([], { look: { ...look, labels } });
    const plain = draw([]).render;
    expect(render.origin(TS, { w: W, h: W })).toBe(TS);
    expect(render.computeSize({ w: W, h: W }, TS).w).toBe(
      plain.computeSize({ w: W, h: W }, TS).w + TS - 1,
    );
    expect(texts(ops).slice(0, 2 * W)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "1",
      "2",
      "3",
      "4",
    ]);
  });
});
