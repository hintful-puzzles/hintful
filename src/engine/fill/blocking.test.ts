/**
 * A board sized by its blocks, on the `blocking` fixture: written as
 * upstream solo.c writes it (`2x3`, `5j`, a bare `3`), offered as the
 * Custom dialog's columns, rows and game mode, and its blocks dealt only on
 * a board of the variation that deals them, where they are one square wide.
 */

import { describe, expect, it } from "vitest";
import * as blocking from "../../generated/engine/testing/fixtures/blocking/blocking.compiled.ts";
import { validateDesc } from "../contract/desc-error.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { type FillBoard, paramSpaceOf, spaceOf } from "./board.ts";
import { fillGame } from "./game.ts";
import type { FillParams } from "./game-id.ts";

const game = fillGame("blocking", blocking);

/** The params of a board `across` blocks by `down`, as the ID reads them. */
const blocks = (across: number, down: number, x = false): FillParams => ({
  ...game.decodeParams(down === 1 ? `${across}j` : `${across}x${down}`),
  ...(x ? { variations: down === 1 ? ["Jigsaw", "X"] : ["X"] } : {}),
});

const dealt = (p: FillParams, seed: string): FillBoard<blocking.Dealt> =>
  game.newState(p, game.newDesc(p, randomNew(seed)).desc);

/** The Custom dialog's field `kw`. */
const field = (kw: string) => {
  const item = game.paramConfig?.find((i) => i.kw === kw);
  if (item === undefined) throw new Error(`blocking: no field ${kw}`);
  return item;
};

describe("a board sized by its blocks, written as upstream solo.c writes it", () => {
  it("reads blocks across and down, and the grid they make", () => {
    expect(game.decodeParams("2x3")).toMatchObject({
      w: 6,
      h: 6,
      sizes: { across: 2, down: 3 },
    });
    expect(game.decodeParams("2x3").variations).toBeUndefined();
    // A bare number is that many both ways.
    expect(game.decodeParams("3").sizes).toEqual({ across: 3, down: 3 });
  });

  it("reads blocks one square wide as dealt, the order before the letter", () => {
    expect(game.decodeParams("5j")).toMatchObject({
      w: 5,
      sizes: { across: 5, down: 1 },
      variations: ["Jigsaw"],
    });
    // Upstream folds a size before the letter into the order.
    expect(game.decodeParams("2x3j").sizes).toEqual({ across: 6, down: 1 });
    expect(game.decodeParams("5x1").variations).toEqual(["Jigsaw"]);
  });

  it("writes each back as it reads it, a modifier's letter after", () => {
    for (const id of ["2x2", "2x3", "3x2", "5j", "6j", "2x3x", "5jx"])
      expect(game.encodeParams(game.decodeParams(id), false)).toBe(id);
    expect(game.decodeParams("5jx").variations).toEqual(["Jigsaw", "X"]);
    expect(game.encodeParams(game.decodeParams("2x3"), true)).toBe("2x3de");
  });

  it("refuses blocks past their sizes and a grid past its bounds", () => {
    const refusal = (id: string, full = false) =>
      game.validateParams?.(game.decodeParams(id), full);
    expect(refusal("2x4")).toMatch(/Rows of sub-blocks/);
    expect(refusal("7j")).toMatch(/Columns of sub-blocks/);
    expect(refusal("3")).toMatch(/at most 6/);
    expect(refusal("2x3", true)).toBeNull();
  });

  it("offers its preset boards as their IDs read", () => {
    expect(game.menu?.boards).toEqual(
      ["2x2", "2x3", "5j"].map((id) => game.decodeParams(id)),
    );
  });
});

describe("the Custom dialog of a board sized by its blocks", () => {
  it("offers columns, rows, and the game mode after them", () => {
    expect(game.paramConfig?.slice(0, 3).map((i) => i.kw)).toEqual([
      "columns-of-sub-blocks",
      "rows-of-sub-blocks",
      "ruleset",
    ]);
  });

  it("folds the blocks into dealt ones and back to the squarest", () => {
    const p = game.decodeParams("2x3x");
    const mode = field("ruleset");
    if (mode.type !== "choices") throw new Error("blocking: game mode is no choice");
    mode.set(p, 1);
    expect(p).toMatchObject({ w: 6, sizes: { across: 6, down: 1 } });
    expect(p.variations).toEqual(["Jigsaw", "X"]);
    mode.set(p, 0);
    expect(p).toMatchObject({ w: 6, sizes: { across: 2, down: 3 } });
    expect(p.variations).toEqual(["X"]);
  });

  it("keeps the dealt blocks when a modifier is switched", () => {
    const p = game.decodeParams("5j");
    const x = field("diagonals");
    if (x.type !== "boolean") throw new Error("blocking: diagonals is no check box");
    x.set(p, true);
    expect(p.variations).toEqual(["Jigsaw", "X"]);
    x.set(p, false);
    expect(p.variations).toEqual(["Jigsaw"]);
  });
});

describe("blocks dealt only on a board of the variation that deals them", () => {
  it("cuts a board's blocks by its sizes, and writes none", () => {
    let boards = 0;
    for (const seed of ["a", "b", "c"]) {
      const p = blocks(2, 3, seed === "c");
      const { desc } = game.newDesc(p, randomNew(seed));
      const b = game.newState(p, desc);
      expect(b.dealt.box).toBeUndefined();
      expect(desc).not.toContain(",");
      const sp = spaceOf(blocking, b);
      // Blocks 3 squares wide and 2 tall.
      for (const c of sp.cells)
        expect(sp.boxOf[c]).toBe(
          sp.boxOf[Math.floor(c / 12) * 12 + Math.floor((c % 6) / 3) * 3],
        );
      boards++;
    }
    expect(boards).toBe(3);
  });

  it("cuts no blocks one square wide before the deal", () => {
    expect(paramSpaceOf(blocking, blocks(5, 1)).boxes).toEqual([]);
    expect(paramSpaceOf(blocking, blocks(2, 2)).boxes).toHaveLength(4);
  });

  it("deals blocks one square wide as connected parts as large as a row", () => {
    let boards = 0;
    for (const seed of ["a", "b", "c"]) {
      const b = dealt(blocks(5, 1, seed === "c"), seed);
      const { box } = b.dealt;
      if (box === undefined) throw new Error("blocking: a jigsaw dealt no blocks");
      expect(box.cells.map((cs) => cs.length)).toEqual([5, 5, 5, 5, 5]);
      const sp = spaceOf(blocking, b);
      for (const c of sp.cells) expect(sp.boxOf[c]).toBe(sp.boxes[box.of[c]]);
      boards++;
    }
    expect(boards).toBe(3);
  });

  it("draws a board of either, and the walls between its blocks differ", () => {
    const draw = (b: FillBoard<blocking.Dealt>): readonly DrawOp[] => {
      const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
      game.redraw(dr, game.newDrawState(b, 32), {
        state: b,
        prev: null,
        dir: 1,
        ui: game.newUi(b),
        animTime: 0,
        flash: NO_FLASH,
      });
      return dr.ops;
    };
    const cut = draw(dealt(blocks(2, 3), "d"));
    const jigsaw = draw(dealt(blocks(6, 1), "d"));
    expect(cut.length).toBeGreaterThan(0);
    expect(jigsaw.length).toBeGreaterThan(0);
    expect(JSON.stringify(cut.filter((o) => o.op === "rect"))).not.toBe(
      JSON.stringify(jigsaw.filter((o) => o.op === "rect")),
    );
  });

  it("writes the dealt blocks before a comma, and reads them back", () => {
    const p = blocks(5, 1);
    const { desc } = game.newDesc(p, randomNew("w"));
    expect(desc).toMatch(/^[^,]+,[^,]+$/);
    expect(game.newState(p, desc).dealt.box?.cells).toEqual(
      dealt(p, "w").dealt.box?.cells,
    );
    // A board with blocks cut reads none from its desc, and a board that
    // deals them refuses a desc without them.
    const plain = game.newDesc(blocks(2, 2), randomNew("v")).desc;
    expect(validateDesc(game, blocks(2, 2), plain)).toBeNull();
    expect(validateDesc(game, blocks(4, 1), plain)).not.toBeNull();
  });
});
