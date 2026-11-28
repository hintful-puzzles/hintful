/**
 * A board whose cells are a partition's parts (`space.parts`, `parts.ts`),
 * on the `mapping` fixture: regions of a grid of squares grown from seeds,
 * each a cell the rules color, which border which read off the squares,
 * and the ID as upstream map.c writes it.
 */

import { describe, expect, it } from "vitest";
import * as mapping from "../../generated/engine/testing/fixtures/mapping/mapping.compiled.ts";
import { validateDesc } from "../contract/desc-error.ts";
import { randomNew } from "../random/index.ts";
import { type FillBoard, solveBoard } from "./board.ts";
import { fillGame } from "./game.ts";

const game = fillGame("mapping", mapping);
type Board = FillBoard<mapping.Dealt>;

/** Each region's neighbors across a side, read square by square. */
function bordersOfSquares(b: Board): number[][] {
  const { w, h, of } = b.dealt.map;
  const near = Array.from(
    { length: b.dealt.map.cells.length },
    () => new Set<number>(),
  );
  for (let c = 0; c < w * h; c++)
    for (const d of [c % w < w - 1 ? c + 1 : -1, c + w < w * h ? c + w : -1])
      if (d >= 0 && of[c] !== of[d]) {
        near[of[c]].add(of[d]);
        near[of[d]].add(of[c]);
      }
  return near.map((s) => [...s].sort((a, b) => a - b));
}

describe("a board whose cells are a partition's parts", () => {
  it("deals as many regions as it asks, each a cell, colored apart from its neighbors", () => {
    for (const size of ["4x4n6", "5x5n8", "6x4n9"]) {
      const p = game.decodeParams(size);
      for (const seed of ["a", "b", "c", "d"]) {
        const b = game.newState(p, game.newDesc(p, randomNew(`${size}${seed}`)).desc);
        const n = p.sizes?.["n"] ?? 0;
        expect([b.w, b.h]).toEqual([n, 1]);
        expect(b.dealt.map.cells).toHaveLength(n);
        expect(b.dealt.map.of).toHaveLength(p.w * p.h);
        // The relation is the regions' sides, as the squares say.
        expect(b.dealt.map.sides.map((x) => [...x])).toEqual(bordersOfSquares(b));
        const solved = solveBoard(mapping, b, 0);
        expect(solved.verdict).toBe("solved");
        for (let a = 0; a < n; a++)
          for (const o of b.dealt.map.sides[a])
            expect(solved.values[o]).not.toBe(solved.values[a]);
      }
    }
  });

  it("reads upstream map.c's ID: the edge list, then the colors from 0", () => {
    // Upstream's 5x4 of 6 regions, as the hand-written Map dealt it: the
    // regions, reading the squares, 0 1 2 3 4 / 0 0 0 3 4 / 0 0 0 5 5 /
    // 0 0 0 5 5, and every region colored but the fourth.
    const p = game.decodeParams("5x4n6");
    const desc = "bbebeacacfb,031a12";
    const b = game.newState(p, desc);
    expect(Array.from(b.dealt.map.of)).toEqual([
      0, 1, 2, 3, 4, 0, 0, 0, 3, 4, 0, 0, 0, 5, 5, 0, 0, 0, 5, 5,
    ]);
    expect(b.dealt.map.sides.map((x) => [...x])).toEqual([
      [1, 2, 3, 5],
      [0, 2],
      [0, 1, 3],
      [0, 2, 4, 5],
      [3, 5],
      [0, 3, 4],
    ]);
    expect(Array.from(b.values)).toEqual([1, 4, 2, 0, 2, 3]);
    expect(Array.from(b.fixed)).toEqual([1, 1, 1, 0, 1, 1]);
  });

  it("writes the board it reads", () => {
    for (const size of ["4x4n6", "8x8n9"]) {
      const p = game.decodeParams(size);
      const { desc } = game.newDesc(p, randomNew(size));
      expect(validateDesc(game, p, desc)).toBeNull();
      const b = game.newState(p, desc);
      expect(game.newState(p, desc).dealt.map).toEqual(b.dealt.map);
    }
  });

  it("refuses an edge list cut short, overlong, or making another count of regions", () => {
    const p = game.decodeParams("5x4n6");
    expect(validateDesc(game, p, "bbebeacacfb,031a12")).toBeNull();
    // Cut short: the `,` where a run belongs.
    expect(validateDesc(game, p, "bbebeacac,031a12")).not.toBeNull();
    // A run past the last side.
    expect(validateDesc(game, p, "bbebeacacfz,031a12")).not.toBeNull();
    // Of 6 regions, read as 5.
    expect(
      validateDesc(game, game.decodeParams("5x4n5"), "bbebeacacfb,031a12"),
    ).not.toBeNull();
    // A color past 3.
    expect(validateDesc(game, p, "bbebeacacfb,041a12")).not.toBeNull();
  });
});
