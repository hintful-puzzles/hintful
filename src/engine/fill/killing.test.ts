/**
 * A partition and its clues a modifier adds, on the `killing` fixture
 * (Solo's Killer): its cages divided, written and read only on a board with
 * Killer on, each cage's sum written as a number at its first square and
 * drawn as the number alone, the givens hidden whole under it, and the size
 * it bounds; the cages written as upstream solo.c writes them.
 */

import { describe, expect, it } from "vitest";
import * as killing from "../../generated/engine/testing/fixtures/killing/killing.compiled.ts";
import { DESC_MALFORMED, validateDesc } from "../contract/desc-error.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { encodeDesc } from "./desc.ts";
import { fillGame } from "./game.ts";
import type { FillParams } from "./game-id.ts";

const game = fillGame("killing", killing);
type Board = FillBoard<killing.Dealt>;

const params = (w: number, killer: boolean): FillParams => ({
  w,
  h: w,
  diff: 0,
  ...(killer ? { variations: ["Killer"] } : {}),
});
const deal = (w: number, killer: boolean, seed: string) => {
  const p = params(w, killer);
  const { desc } = game.newDesc(p, randomNew(seed));
  return { p, desc, b: game.newState(p, desc) as Board };
};

describe("a partition a modifier adds", () => {
  it("is not dealt, written or read on a board without the modifier", () => {
    for (const seed of ["a", "b", "c"]) {
      const { desc, b } = deal(5, false, seed);
      expect(b.dealt.cage).toBeUndefined();
      expect(b.dealt.total.at.length).toBe(0);
      expect(b.dealt.given.at.length).toBeGreaterThan(0);
      // The givens alone.
      expect(desc).not.toContain(",");
      expect(encodeDesc(killing.deal, spaceOf(killing, b), b.dealt)).toBe(desc);
    }
  });

  it("is dealt under it, each cage's sum its answer's, and no given shown", () => {
    let cages = 0;
    for (const w of [4, 5])
      for (const seed of ["a", "b", "c"]) {
        const { b } = deal(w, true, `${w}${seed}`);
        expect(b.dealt.given.at.length).toBe(0);
        const g = solveBoard(killing, b, 0).values;
        b.dealt.cage.cells.forEach((cs, r) => {
          expect(cs.length).toBeGreaterThanOrEqual(2);
          expect(cs.length).toBeLessThanOrEqual(3);
          expect(new Set(cs.map((c) => g[c])).size).toBe(cs.length);
          expect(b.dealt.total.v[b.dealt.total.byAt[r]]).toBe(
            cs.reduce((s, c) => s + g[c], 0),
          );
          cages++;
        });
      }
    expect(cages).toBeGreaterThan(30);
  });

  it("writes the cages written out and each sum at its cage's first square, read back byte for byte", () => {
    const { desc, b } = deal(5, true, "id");
    const [givens, cages, sums] = desc.split(",");
    // No given: the whole board is one run of blanks.
    expect(givens).toBe("y");
    // A letter repeated is written out, never counted, as upstream Solo's.
    expect(cages).toMatch(/^[a-z_]+$/);
    // A number a cage, at its first square in reading order.
    const numbers = sums.match(/\d+/g) ?? [];
    expect(numbers.length).toBe(b.dealt.cage.cells.length);
    expect(encodeDesc(killing.deal, spaceOf(killing, b), b.dealt)).toBe(desc);
  });

  it("reads a sum anywhere in its cage, as upstream does, and refuses a cage with none or two", () => {
    const p = params(4, true);
    const { desc } = game.newDesc(p, randomNew("sums"));
    const [givens, cages, sums] = desc.split(",");
    const b = game.newState(p, desc) as Board;
    const { cells } = b.dealt.cage;
    const values = new Array<number>(16).fill(0);
    cells.forEach((cs, r) => {
      values[cs[0]] = b.dealt.total.v[b.dealt.total.byAt[r]];
    });
    /** The sums segment with each cage's sum at square `at(r)`. */
    const written = (at: (r: number) => number, extra = -1): string => {
      const grid = new Array<number>(16).fill(0);
      cells.forEach((_, r) => {
        grid[at(r)] = values[cells[r][0]];
      });
      if (extra >= 0) grid[extra] = 1;
      let out = "";
      let run = 0;
      grid.forEach((v, c) => {
        if (v === 0) run++;
        else {
          if (run > 0) out += String.fromCharCode(96 + run);
          else if (c > 0 && out !== "") out += "_";
          out += String(v);
          run = 0;
        }
      });
      if (run > 0) out += String.fromCharCode(96 + run);
      return out;
    };
    expect(written((r) => cells[r][0])).toBe(sums);
    const last = written((r) => cells[r].at(-1) as number);
    expect(validateDesc(game, p, `${givens},${cages},${last}`)).toBeNull();
    const read = game.newState(p, `${givens},${cages},${last}`) as Board;
    expect([...read.dealt.total.v]).toEqual([...b.dealt.total.v]);
    // A second sum in the first cage.
    const two = written((r) => cells[r][0], cells[0][1]);
    expect(validateDesc(game, p, `${givens},${cages},${two}`)).toBe(DESC_MALFORMED);
    // The first cage's sum left out.
    const none = written((r) => (r === 0 ? -1 : cells[r][0]));
    expect(validateDesc(game, p, `${givens},${cages},${none}`)).toBe(DESC_MALFORMED);
  });

  it("bounds the board where it is on", () => {
    expect(game.validateParams?.(params(6, false), true)).toBeNull();
    expect(game.validateParams?.(params(5, true), true)).toBeNull();
    expect(game.validateParams?.(params(6, true), true)).toBe(
      "Killer: width and height must both be at most 5.",
    );
  });

  it("draws each cage's sum as its number alone, at its first square", () => {
    const { b } = deal(5, true, "draw");
    const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
    game.redraw(dr, game.newDrawState(b, 64), {
      state: b,
      prev: null,
      dir: 1,
      ui: game.newUi(b),
      animTime: 0,
      flash: NO_FLASH,
    });
    const texts = dr.ops
      .filter((o): o is Extract<DrawOp, { op: "text" }> => o.op === "text")
      .map((o) => o.text)
      .sort();
    const sums = Array.from(b.dealt.total.v, String).sort();
    expect(texts).toEqual(sums);
  });
});
