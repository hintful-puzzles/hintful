/**
 * Clues at a dealt partition's parts, on the `caging` fixture: the partition
 * divided at random into small parts, one clue a part of one of the kinds,
 * written in the desc as upstream Keen's block structure and a letter and a
 * number a part, and read back.
 */

import { describe, expect, it } from "vitest";
import * as caging from "../../generated/engine/testing/fixtures/caging/caging.compiled.ts";
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
import type { FillMove } from "./notes.ts";
import { COL_INK } from "./render.ts";

const game = fillGame("caging", caging);
type Board = FillBoard<caging.Dealt>;

const params = (w: number, diff = 0, only = false) => ({ w, h: w, diff, only });
const board = (w: number, desc: string): Board => game.newState(params(w), desc);
/** The tier whose boards need a cage's clue read by the ways to fill it. */
const NORMAL = 1;

// Upstream Keen's 4x4 block structure, its clues each a sum or a product:
// a desc to read and draw, with no answer.
const BLOCKS4 = "aa_a_aa_ba_5a";
const D4 = `${BLOCKS4},m2a3a9m4m2m6a3`;

describe("a block structure and a clue a part", () => {
  it("reads the cages in the order of their first squares, each its one clue", () => {
    const b = board(4, D4);
    const { cage, sum, product } = b.dealt;
    expect(cage.cells.map((cs) => cs[0])).toEqual([0, 2, 4, 5, 6, 10, 13]);
    expect(cage.cells.map((cs) => cs.length)).toEqual([2, 2, 3, 2, 2, 3, 2]);
    expect(Array.from(product.at)).toEqual([0, 3, 4, 5]);
    expect(Array.from(product.v)).toEqual([2, 4, 2, 6]);
    expect(Array.from(sum.at)).toEqual([1, 2, 6]);
    expect(Array.from(sum.v)).toEqual([3, 9, 3]);
  });

  it("writes it back byte for byte, a letter run as upstream compresses it", () => {
    const b = board(4, D4);
    expect(encodeDesc(caging.deal, spaceOf(caging, b), b.dealt)).toBe(D4);
  });

  it("refuses a clue past what its part can make, a part left out and one too many", () => {
    const p = params(4);
    expect(validateDesc(game, p, D4)).toBeNull();
    // Two squares of 1 to 4 multiply to at most 16 and sum to at most 8.
    expect(validateDesc(game, p, D4.replace("m2a3", "m17a3"))).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(game, p, D4.replace("m2a3", "m2a9"))).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(game, p, D4.replace(",m2", ",a0"))).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(game, p, D4.replace("a3a9", "a3"))).toBe(DESC_TOO_SHORT);
    expect(validateDesc(game, p, `${D4}a1`)).toBe(DESC_TOO_LONG);
    expect(validateDesc(game, p, D4.replace(",m2", ",d2"))).toBe(descBadCharacter("d"));
    expect(validateDesc(game, p, `${BLOCKS4.slice(0, 4)},m2`)).toBe(
      descBadCharacter(","),
    );
  });
});

describe("a part's clue drawn", () => {
  const TS = 48;
  const draw = (b: Board, ui = game.newUi(b)): readonly DrawOp[] => {
    const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
    game.redraw(dr, game.newDrawState(b, TS), {
      state: b,
      prev: null,
      dir: 1,
      ui,
      animTime: 0,
      flash: NO_FLASH,
    });
    return dr.ops;
  };
  const texts = (ops: readonly DrawOp[]) =>
    ops.filter((o): o is Extract<DrawOp, { op: "text" }> => o.op === "text");
  const colors = game.colors(DEFAULT_BACKGROUND);
  const same = (a: number, b: number) => colors[a].every((v, i) => v === colors[b][i]);

  it("writes each clue once, its number and its sign, at the top left of its part's first square", () => {
    const b = board(4, D4);
    const labels = texts(draw(b));
    expect(labels.map((t) => t.text)).toEqual([
      "2×",
      "3+",
      "9+",
      "4×",
      "2×",
      "6×",
      "3+",
    ]);
    const o = game.computeSize(params(4), TS).w - 4 * TS;
    // The first part's clue in the top left square, in its upper left.
    expect(labels[0].x).toBeLessThan(o / 2 + TS / 3);
    expect(labels[0].y).toBeLessThan(o / 2 + TS / 2);
    expect(labels.every((t) => same(t.color, COL_INK))).toBe(true);
  });

  it("is red once its part's numbers can no longer make it", () => {
    // 2 and 3 multiply to 6, not 2.
    const broken = game.executeMove(board(4, D4), { set: [0, 2, 1, 3] });
    const red = texts(draw(broken)).filter((t) => same(t.color, COL_ERROR));
    expect(red.map((t) => t.text)).toEqual(["2×"]);
  });

  it("keeps a square's notes below the clue's line, in every square", () => {
    const b = board(4, D4);
    const noted = game.executeMove(b, { type: "pencilAll" } as FillMove);
    const ops = texts(draw(noted));
    // The top left square's clue, on the top row's clue line.
    const labelBottom = ops.filter((t) => t.text.length > 1)[0].y;
    // The notes of the top row's squares lie below that line.
    const topNotes = ops.filter(
      (t) => t.text.length === 1 && t.y < labelBottom + (TS * 2) / 3,
    );
    expect(topNotes.length).toBeGreaterThan(0);
    for (const t of topNotes) expect(t.y).toBeGreaterThan(labelBottom);
  });
});

describe("the walk", () => {
  it("finishes a dealt board, a cage's step striping its cage and naming its clue", () => {
    for (const seed of ["k", "l"]) {
      const w = 5;
      let b = board(w, game.newDesc(params(w, NORMAL), randomNew(seed)).desc);
      const ui = { ...game.newUi(b), candidateReading: "populate" as const };
      const caged = [];
      for (let n = 0; game.status(b) !== "solved"; n++) {
        if (n > 8 * w * w) throw new Error("the walk runs on");
        const plan = game.hint.plan(b, undefined, ui);
        if (!plan.ok) throw new Error(`no plan: ${JSON.stringify(plan)}`);
        const step = plan.steps[0];
        if (step.rung === "cage") caged.push(step);
        b = game.executeMove(b, step.move);
      }
      expect(caged.length).toBeGreaterThan(0);
      const cages = b.dealt.cage.cells.map((cs) => [...cs].sort((a, c) => a - c));
      for (const step of caged) {
        const striped = stepMarks(step)
          .of("stripes", CELL)
          .map((p) => p.y * w + p.x)
          .sort((a, c) => a - c);
        expect(cages).toContainEqual(striped);
        expect(step.explanation).toMatch(/(sum|multiply) to \d+/);
      }
    }
  });
});

describe("a deal", () => {
  it("divides the board into parts of two to six squares, each with one clue", () => {
    for (const seed of ["a", "b", "c", "d"]) {
      const { desc } = game.newDesc(params(5, NORMAL), randomNew(seed));
      const b = board(5, desc);
      const { cage, sum, product } = b.dealt;
      for (const cs of cage.cells) {
        expect(cs.length).toBeGreaterThanOrEqual(2);
        expect(cs.length).toBeLessThanOrEqual(6);
      }
      for (let r = 0; r < cage.parts.length; r++)
        expect(Number(sum.byAt[r] >= 0) + Number(product.byAt[r] >= 0)).toBe(1);
      expect(encodeDesc(caging.deal, spaceOf(caging, b), b.dealt)).toBe(desc);
      // At the tier, and not below it.
      expect(solveBoard(caging, b, NORMAL).verdict).toBe("solved");
      expect(solveBoard(caging, b, NORMAL - 1).verdict).not.toBe("solved");
    }
  });

  it("deals both kinds about as often, a sum of two that leaves no choice only as a last resort", () => {
    let sums = 0;
    let products = 0;
    let poor = 0;
    for (const seed of ["e", "f", "g", "h", "i", "j"]) {
      const { desc } = game.newDesc(params(5, 0), randomNew(seed));
      const { cage, sum, product } = board(5, desc).dealt;
      sums += sum.at.length;
      products += product.at.length;
      for (const [i, r] of sum.at.entries())
        if (cage.cells[r].length === 2 && (sum.v[i] <= 4 || sum.v[i] >= 8)) poor++;
    }
    expect(Math.abs(sums - products)).toBeLessThanOrEqual(6);
    expect(poor).toBeLessThan(sums / 4);
  });

  it("deals products alone under the flag, and writes the flag after the tier", () => {
    const p = params(4, 0, true);
    expect(game.encodeParams(p, true)).toBe("4dem");
    expect(game.decodeParams("4dem")).toMatchObject({ only: true });
    expect(game.decodeParams("4de")).toMatchObject({ only: false });
    const { desc } = game.newDesc(p, randomNew("only"));
    expect(board(4, desc).dealt.sum.at).toHaveLength(0);
  });
});
