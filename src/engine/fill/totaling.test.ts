/**
 * A clue at the board derived from the sampled answer, on the `totaling`
 * fixture: how many blocks and discs the board holds, dealt from the answer,
 * written in the ID and read back.
 */

import { describe, expect, it } from "vitest";
import * as totaling from "../../generated/engine/testing/fixtures/totaling/totaling.compiled.ts";
import { COL_ERROR } from "../color/roles.ts";
import { validateDesc } from "../contract/desc-error.ts";
import { UI_UPDATE } from "../contract/game.ts";
import { LEFT_BUTTON } from "../input/pointer.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { type FillBoard, solveBoard } from "./board.ts";
import { fillGame } from "./game.ts";

const game = fillGame("totaling", totaling);
type Board = FillBoard<totaling.Dealt>;

const dealt = (seed: string): { board: Board; desc: string } => {
  const p = game.decodeParams("4x4");
  const { desc } = game.newDesc(p, randomNew(seed));
  return { board: game.newState(p, desc), desc };
};

describe("a clue at the board derived from the answer", () => {
  it("holds a record a value, its count the answer's", () => {
    for (const seed of ["a", "b", "c", "d"]) {
      const { board } = dealt(seed);
      const solved = solveBoard(totaling, board, 0);
      expect(solved.verdict).toBe("solved");
      const { total } = board.dealt;
      expect(total.item).toEqual([1, 2]);
      expect(total.many).toEqual(
        [1, 2].map((d) => solved.values.filter((v) => v === d).length),
      );
    }
  });

  it("is refused where a desc's count is past the board", () => {
    const p = game.decodeParams("4x4");
    expect(validateDesc(game, p, "17,0,")).not.toBeNull();
    expect(validateDesc(game, p, "3")).not.toBeNull();
  });

  it("is written first in the ID, each count after a comma, and read back", () => {
    const { board, desc } = dealt("e");
    const [blocks, discs] = desc.split(",").map(Number);
    expect([blocks, discs]).toEqual(board.dealt.total.many);
    const p = game.decodeParams("4x4");
    expect(validateDesc(game, p, desc)).toBeNull();
    // A count past the board's squares is refused.
    expect(
      validateDesc(game, p, `17,${desc.slice(desc.indexOf(",") + 1)}`),
    ).not.toBeNull();
  });
});

describe("a row of counts beneath the board", () => {
  const TS = 32;
  const colors = game.colors(DEFAULT_BACKGROUND);
  const draw = (b: Board): readonly DrawOp[] => {
    const dr = new RecordingDrawing(colors);
    game.redraw(dr, game.newDrawState(b, TS), {
      state: b,
      prev: null,
      dir: 1,
      ui: game.newUi(b),
      animTime: 0,
      flash: NO_FLASH,
    } as never);
    return dr.ops;
  };
  const texts = (ops: readonly DrawOp[]) =>
    ops.filter((op): op is Extract<DrawOp, { op: "text" }> => op.op === "text");
  const { board: b } = dealt("f");
  /** The bottom of the board, read off the grid's frame. */
  const frame = draw(b).find((op) => op.op === "rect" && op.w === 4 * TS + 1);
  if (frame?.op !== "rect") throw new Error("no frame");
  const bottom = frame.y + 4 * TS;
  const counts = () => texts(draw(b)).filter((t) => t.y > bottom);
  /** Board `b` with every open square holding value `v`. */
  const allOf = (v: number): Board => {
    const set = Array.from(b.values.keys())
      .filter((c) => b.fixed[c] === 0)
      .flatMap((c) => [c, v]);
    return game.executeMove(b, { set } as never);
  };

  it("draws each record's count beneath the board, on the canvas the params size", () => {
    const drawn = counts();
    expect(drawn.map((t) => t.text)).toEqual(b.dealt.total.many.map(String));
    // The two counts on one row, the disc's to the right of the block's.
    expect(drawn[0].y).toBe(drawn[1].y);
    expect(drawn[1].x).toBeGreaterThan(drawn[0].x);
    const { h } = game.computeSize(game.decodeParams("4x4"), TS);
    expect(h).toBeGreaterThanOrEqual(drawn[0].y + TS / 2);
  });

  it("draws a count the board breaks in the error color", () => {
    const ink = counts()[1].color;
    const broken = texts(draw(allOf(2))).filter((t) => t.y > bottom);
    expect(broken[1].color).not.toBe(ink);
    expect(colors[broken[1].color]).toEqual(colors[COL_ERROR]);
  });

  it("places a record's value at the cursor when pressed", () => {
    const ui = game.newUi(b);
    const ds = game.newDrawState(b, TS);
    const open = Array.from(b.values.keys()).find((c) => b.fixed[c] === 0) as number;
    ui.cursor.x = open % b.w;
    ui.cursor.y = Math.floor(open / b.w);
    ui.cursor.visible = true;
    const disc = counts()[1];
    const move = game.interpretMove(b, ui, ds, { x: disc.x, y: disc.y }, LEFT_BUTTON);
    if (move === null || move === UI_UPDATE) throw new Error("no move");
    expect(game.executeMove(b, move).values[open]).toBe(2);
  });
});
