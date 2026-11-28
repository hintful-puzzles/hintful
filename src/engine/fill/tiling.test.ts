/**
 * A partition dealt as dominoes and written as each cell's partner, on the
 * `tiling` fixture: dominoes each holding a 1 and a 2, a count of 1s a line.
 */

import { describe, expect, it } from "vitest";
import * as tiling from "../../generated/engine/testing/fixtures/tiling/tiling.compiled.ts";
import { validateDesc } from "../contract/desc-error.ts";
import { randomNew } from "../random/index.ts";
import { solveBoard } from "./board.ts";
import { fillGame } from "./game.ts";

const game = fillGame("tiling", tiling);

describe("a partition dealt as dominoes", () => {
  it("tiles the board with pairs of neighbors, one square alone where the area is odd", () => {
    for (const size of ["4x4", "5x3"]) {
      const p = game.decodeParams(size);
      for (const seed of ["a", "b", "c", "d"]) {
        const b = game.newState(p, game.newDesc(p, randomNew(`${size}${seed}`)).desc);
        const { cells } = b.dealt.tile;
        const alone = cells.filter((cs) => cs.length === 1).length;
        expect(alone).toBe((p.w * p.h) % 2);
        for (const cs of cells) {
          expect(cs.length).toBeLessThanOrEqual(2);
          if (cs.length === 2) {
            const [a, c] = cs;
            const apart = Math.abs(c - a);
            expect(
              apart === p.w ||
                (apart === 1 && Math.floor(a / p.w) === Math.floor(c / p.w)),
            ).toBe(true);
          }
        }
        // Every domino holds a 1 and a 2.
        const g = solveBoard(tiling, b, 1).values;
        for (const cs of cells)
          if (cs.length === 2) expect(new Set(cs.map((c) => g[c])).size).toBe(2);
      }
    }
  });

  it("writes each cell's partner as a letter, and reads the same board back", () => {
    const p = game.decodeParams("5x3");
    const { desc } = game.newDesc(p, randomNew("pairs"));
    const b = game.newState(p, desc);
    const letters = desc.slice(0, 15);
    const step = { L: 1, R: -1, T: 5, B: -5, "*": 0 } as const;
    for (const [c, ch] of Array.from(letters).entries()) {
      const partner = c + step[ch as keyof typeof step];
      expect(b.dealt.tile.of[partner]).toBe(b.dealt.tile.of[c]);
    }
    expect(game.newState(p, desc).dealt.tile).toEqual(b.dealt.tile);
  });

  it("refuses a pair whose squares do not point at each other, or one across an edge", () => {
    const p = game.decodeParams("4x4");
    const { desc } = game.newDesc(p, randomNew("refuse"));
    const rest = desc.slice(16);
    expect(validateDesc(game, p, desc)).toBeNull();
    // A pair pointing at each other round the end of the top row.
    expect(validateDesc(game, p, `LR*LRLR*${"LR".repeat(4)}${rest}`)).not.toBeNull();
    // The same pair the right way up is two squares alone.
    expect(validateDesc(game, p, `LR**LR**${"LR".repeat(4)}${rest}`)).toBeNull();
    // Two pairs whose halves cross.
    expect(validateDesc(game, p, `LLRR${"LR".repeat(6)}${rest}`)).not.toBeNull();
    // A square alone beside its would-be partner is fine only once.
    expect(validateDesc(game, p, `${"LR".repeat(8)}${rest}`)).toBeNull();
  });
});
