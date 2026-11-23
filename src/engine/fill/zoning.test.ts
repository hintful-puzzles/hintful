/**
 * A partition dealt to drawn sizes before the answer, and the answer
 * searched under it, on the `zoning` fixture: areas each holding 1 to their
 * size, equal numbers never side by side, the givens written after the
 * walls as digits between letter runs.
 */

import { describe, expect, it } from "vitest";
import * as zoning from "../../generated/engine/testing/fixtures/zoning/zoning.compiled.ts";
import { DESC_OUT_OF_RANGE, validateDesc } from "../contract/desc-error.ts";
import { randomNew } from "../random/index.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { fillGame } from "./game.ts";
import { encodeDesc } from "./game-id.ts";

const game = fillGame("zoning", zoning);
type Board = FillBoard<zoning.Dealt>;

const params = (w: number, h = w) => ({ w, h, diff: 0 });
const board = (w: number, h: number, desc: string): Board =>
  game.newState(params(w, h), desc);

// A 3x3 board in three rows of three, each holding 1 to 3, with no two equal
// side by side: six gaps inside the rows and six walls between them, then a
// 2 given at the middle.
const ROWS3 = "f5,d2d";

describe("an answer searched under a partition dealt first", () => {
  it("deals areas of the sizes drawn, each holding 1 to its size, one answer", () => {
    for (const [w, h] of [
      [4, 4],
      [5, 5],
      [6, 7],
    ])
      for (const seed of ["a", "b", "c"]) {
        const { desc, aux } = game.newDesc(params(w, h), randomNew(`${w}${h}${seed}`));
        const b = board(w, h, desc);
        const { area } = b.dealt;
        for (const cs of area.cells) expect(cs.length).toBeLessThanOrEqual(4);
        // Some areas reach a size the list draws; a pocket may end short.
        expect(Math.max(...area.cells.map((cs) => cs.length))).toBeGreaterThan(1);
        const got = solveBoard(zoning, b, 0);
        expect(got.verdict).toBe("solved");
        const g = got.values;
        for (const cs of area.cells)
          expect(cs.map((c) => g[c]).sort((a, c) => a - c)).toEqual(
            cs.map((_, i) => i + 1),
          );
        expect(aux).toBeTruthy();
        expect(encodeDesc(zoning.deal, spaceOf(zoning, b), b.dealt)).toBe(desc);
      }
  });

  it("tries a square's numbers in a random order, not 1 first", () => {
    // The search assumes in the area with the fewest open squares, at its
    // first: tried in order, that square would hold 1 wherever it could.
    let firsts = 0;
    let ones = 0;
    for (const seed of ["a", "b", "c", "d", "e", "f"]) {
      const b = board(5, 5, game.newDesc(params(5), randomNew(seed)).desc);
      const g = solveBoard(zoning, b, 0).values;
      for (const cs of b.dealt.area.cells)
        if (cs.length > 1) {
          firsts++;
          if (g[Math.min(...cs)] === 1) ones++;
        }
    }
    // Measured 2026-11-23: 0.31, and 0.67 with the values in order.
    expect(ones / firsts).toBeLessThan(0.5);
  });

  it("draws other areas, and another answer, from another seed", () => {
    const descs = new Set(
      ["p", "q", "r", "s"].map((s) => game.newDesc(params(5), randomNew(s)).desc),
    );
    expect(descs.size).toBe(4);
  });
});

describe("the ID", () => {
  it("reads the walls, then the givens after a comma, and writes them back", () => {
    const b = board(3, 3, ROWS3);
    expect(b.dealt.area.cells.map((cs) => cs.length)).toEqual([3, 3, 3]);
    expect(Array.from(b.dealt.given.at)).toEqual([4]);
    expect(b.values[4]).toBe(2);
    expect(encodeDesc(zoning.deal, spaceOf(zoning, b), b.dealt)).toBe(ROWS3);
  });

  it("refuses a given larger than its area", () => {
    expect(validateDesc(game, params(3), "f5,d4d")).toBe(DESC_OUT_OF_RANGE);
  });
});

describe("typing", () => {
  it("offers keys to the largest area drawn, and refuses a number past the cell's area", () => {
    const keys = game.requestKeys?.(params(5)) ?? [];
    expect(keys.filter((k) => /^[0-9]$/.test(k.label)).map((k) => k.label)).toEqual([
      "1",
      "2",
      "3",
      "4",
    ]);
    // Three rows of three, nothing given: the top left square holds 1 to 3.
    const b = board(3, 3, "f5,i");
    const ui = game.newUi(b);
    const ds = game.newDrawState(b, 32);
    ui.cursor = { x: 0, y: 0, visible: true };
    const nowhere = { x: -1, y: -1 };
    expect(game.interpretMove(b, ui, ds, nowhere, "4".charCodeAt(0))).toBeNull();
    expect(game.interpretMove(b, ui, ds, nowhere, "3".charCodeAt(0))).toMatchObject({
      type: "set",
      n: 3,
    });
  });
});
