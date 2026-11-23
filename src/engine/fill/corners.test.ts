/**
 * Clues at corners, where four squares meet, on the `cornering` fixture:
 * written a code a corner between runs of corners without one, the longest
 * code read first; dealt from the answer; drawn on a disc at the corner, red
 * where it breaks; printed in the text after the wall line it lies on; and
 * read by the walk's own step, which outlines the two squares it joins.
 */

import { describe, expect, it } from "vitest";
import * as cornering from "../../generated/engine/testing/fixtures/cornering/cornering.compiled.ts";
import { COL_ERROR } from "../color/roles.ts";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
  validateDesc,
} from "../contract/desc-error.ts";
import { CELL, stepMarks } from "../contract/hint-words.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { fillGame } from "./game.ts";
import { encodeDesc } from "./game-id.ts";

const game = fillGame("cornering", cornering);
type Board = FillBoard<cornering.Dealt>;

const params = (w: number, diff = 0) => ({ w, h: w, diff });
const board = (w: number, desc: string): Board => game.newState(params(w), desc);
const NORMAL = 1;

// The answer 1234/3412/4321/2143 makes a sum of 5 at corner 0, a difference
// of 2 at corner 4 and the same pairs at corner 5; one square, 2, is given.
const D4 = "a2n,A5cS2S0c";

describe("a clue at a corner in the desc", () => {
  it("reads a code a corner between runs, the longest code first", () => {
    const { sum, difference, same, given } = board(4, D4).dealt;
    expect([Array.from(sum.at), Array.from(sum.v)]).toEqual([[0], [5]]);
    expect([Array.from(difference.at), Array.from(difference.v)]).toEqual([[4], [2]]);
    expect([Array.from(same.at), Array.from(same.v)]).toEqual([[5], [0]]);
    expect([Array.from(given.at), Array.from(given.v)]).toEqual([[1], [2]]);
  });

  it("writes it back byte for byte, a run at the end too", () => {
    const b = board(4, D4);
    expect(encodeDesc(cornering.deal, spaceOf(cornering, b), b.dealt)).toBe(D4);
    const bare = board(4, "p,i");
    expect(encodeDesc(cornering.deal, spaceOf(cornering, bare), bare.dealt)).toBe(
      "p,i",
    );
  });

  it("refuses a run past the corners, too few, a number out of range and a stray code", () => {
    const p = params(4);
    expect(validateDesc(game, p, D4)).toBeNull();
    expect(validateDesc(game, p, "a2n,A5cS2S0d")).toBe(DESC_TOO_LONG);
    expect(validateDesc(game, p, "a2n,A5cS2S0")).toBe(DESC_TOO_SHORT);
    // Two numbers of 1 to 4 add to 8 at most, and differ by 3.
    expect(validateDesc(game, p, "a2n,A9cS2S0c")).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(game, p, "a2n,A5cS4S0c")).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(game, p, "a2n,A5cX2S0c")).toBe(descBadCharacter("X"));
  });

  it("deals each corner the clue its answer makes there, and writes it back", () => {
    for (const seed of ["a", "b", "c"]) {
      const p = params(5, NORMAL);
      const { desc } = game.newDesc(p, randomNew(seed));
      const b = game.newState(p, desc);
      const solved = solveBoard(cornering, b, NORMAL);
      expect(solved.verdict).toBe("solved");
      const g = solved.values;
      const sp = spaceOf(cornering, b);
      const pairs = (k: number) => {
        const [tl, tr, bl, br] = sp.cornerCells[k];
        return [
          [g[tl], g[br]],
          [g[tr], g[bl]],
        ];
      };
      const { sum, difference, same } = b.dealt;
      sum.at.forEach((k, i) => {
        for (const [a, z] of pairs(k)) expect(a + z).toBe(sum.v[i]);
      });
      difference.at.forEach((k, i) => {
        for (const [a, z] of pairs(k)) expect(Math.abs(a - z)).toBe(difference.v[i]);
      });
      for (const k of same.at) for (const [a, z] of pairs(k)) expect(a).toBe(z);
      expect(sum.at.length + difference.at.length + same.at.length).toBeGreaterThan(0);
      expect(encodeDesc(cornering.deal, sp, b.dealt)).toBe(desc);
    }
  });
});

describe("a corner's clue drawn", () => {
  const TS = 48;
  const o = (game.computeSize(params(4), TS).w - 4 * TS) / 2;
  const colors = game.colors(DEFAULT_BACKGROUND);
  const draw = (b: Board, hint?: unknown): readonly DrawOp[] => {
    const dr = new RecordingDrawing(colors);
    game.redraw(dr, game.newDrawState(b, TS), {
      state: b,
      prev: null,
      dir: 1,
      ui: game.newUi(b),
      animTime: 0,
      flash: NO_FLASH,
      ...(hint === undefined ? {} : { hint }),
    } as never);
    return dr.ops;
  };
  const circles = (ops: readonly DrawOp[]) =>
    ops.filter((op): op is Extract<DrawOp, { op: "circle" }> => op.op === "circle");
  const texts = (ops: readonly DrawOp[]) =>
    ops.filter((op): op is Extract<DrawOp, { op: "text" }> => op.op === "text");
  /** The point where the squares round corner `(x, y)` meet. */
  const point = (x: number, y: number) => ({
    x: o + (x + 1) * TS,
    y: o + (y + 1) * TS,
  });
  const b = board(4, D4);

  it("draws each on a disc a third of a tile across, its sign after its number", () => {
    const ops = draw(b);
    expect(circles(ops).map((c) => ({ x: c.cx, y: c.cy, r: c.r }))).toEqual([
      { ...point(0, 0), r: TS / 3 },
      { ...point(1, 1), r: TS / 3 },
      { ...point(2, 1), r: TS / 3 },
    ]);
    const at = new Map(texts(ops).map((t) => [`${t.x},${t.y}`, t.text]));
    expect(
      [point(0, 0), point(1, 1), point(2, 1)].map((p) => at.get(`${p.x},${p.y}`)),
    ).toEqual(["5+", "2−", "="]);
  });

  it("draws one red where the pairs across it break it", () => {
    // 1 at the top left and 1 below right of it add to 2, not 5.
    const broken = game.executeMove(game.executeMove(b, { set: [0, 1] } as never), {
      set: [5, 1],
    } as never);
    const red = circles(draw(broken)).filter((c) => c.outline === COL_ERROR);
    expect(red.map((c) => ({ x: c.cx, y: c.cy }))).toEqual([point(0, 0)]);
    expect(circles(draw(b)).filter((c) => c.outline === COL_ERROR)).toEqual([]);
  });

  it("draws a disc again over a hint's mark on a square under it", () => {
    const ds = game.newDrawState(b, TS);
    const frame = (hint?: unknown) => {
      const dr = new RecordingDrawing(colors);
      game.redraw(dr, ds, {
        state: b,
        prev: null,
        dir: 1,
        ui: game.newUi(b),
        animTime: 0,
        flash: NO_FLASH,
        ...(hint === undefined ? {} : { hint }),
      } as never);
      return circles(dr.ops);
    };
    frame();
    expect(frame()).toEqual([]);
    const got = game.hint.plan(b);
    if (!got.ok) throw new Error(`no hint: ${got.error}`);
    const marks = stepMarks(got.steps[0]);
    const marked = ["ring", "outline", "stripes"].flatMap((role) =>
      marks.of(role as "ring", CELL),
    );
    expect(marked.length).toBeGreaterThan(0);
    const cells = new Set(marked.map((c) => c.y * 4 + c.x));
    const sp = spaceOf(cornering, b);
    const touched = [0, 4, 5].filter((k) =>
      sp.cornerCells[k].some((c) => cells.has(c)),
    );
    expect(touched.length).toBeGreaterThan(0);
    // Each frame the step shows, the marks are painted, and the discs on them.
    for (let i = 0; i < 2; i++)
      expect(frame(got.steps[0]).map((c) => ({ x: c.cx, y: c.cy }))).toEqual(
        touched.map((k) => point(k % 3, Math.floor(k / 3))),
      );
  });
});

describe("a corner's clue in the text", () => {
  it("prints the corners on each wall line inside the grid after it", () => {
    expect((game.textFormat?.(board(4, D4)) ?? "").split("\n")).toEqual([
      "+---+---+---+---+",
      "| . | 2 | . | . |",
      "+---+---+---+---+ 5+ . .",
      "| . | . | . | . |",
      "+---+---+---+---+ . 2− =",
      "| . | . | . | . |",
      "+---+---+---+---+ . . .",
      "| . | . | . | . |",
      "+---+---+---+---+",
      "",
    ]);
  });
});

describe("the hint of a board of corners", () => {
  it("finishes a dealt board, its own step outlining the two squares a clue joins", () => {
    let said = 0;
    for (const seed of ["a", "b", "c", "d"]) {
      const p = params(5, NORMAL);
      let b = game.newState(p, game.newDesc(p, randomNew(seed)).desc);
      for (let made = 0; game.status(b) !== "solved"; made++) {
        expect(made).toBeLessThan(120);
        const got = game.hint.plan(b);
        if (!got.ok) throw new Error(`no hint: ${got.error}`);
        const [step] = got.steps;
        if (step.rung === "pair") {
          const text = step.explanation;
          expect(text).toMatch(/^Nothing open across the (\d+\+|\d+−|=) clue /);
          const outlined = stepMarks(step).of("outline", CELL);
          expect(outlined, text).toHaveLength(2);
          const [a, z] = outlined;
          // Diagonally across one corner.
          expect(Math.abs(a.x - z.x), text).toBe(1);
          expect(Math.abs(a.y - z.y), text).toBe(1);
          said++;
        }
        b = game.executeMove(b, step.move);
      }
    }
    expect(said).toBeGreaterThan(0);
  });
});
