/**
 * Patches, Rectangles' second ruleset: a clue names a shape and may hide its
 * size. What is Patches' own: the params letter, the desc's shape letters,
 * the rule a rectangle is judged by, the hint's names for a clue, the deal's
 * strip and the clue's frame.
 */

import { describe, expect, it } from "vitest";
import { DIFF_EASY, DIFF_UNREASONABLE } from "../../engine/answer-search.ts";
import { loadVerdict } from "../../engine/desc-error.ts";
import { Midend } from "../../engine/index.ts";
import { randomNew } from "../../engine/random/index.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { NO_FLASH } from "../../engine/win-wave.ts";
import { rectHint } from "./hint.ts";
import { rectGame } from "./index.ts";
import { executeMove, isSolved, newState } from "./moves.ts";
import { newDrawState, redraw } from "./render.ts";
import { answerOf } from "./solver.ts";
import {
  decodeParams,
  encodeNumbers,
  encodeParams,
  HIDDEN,
  MODE_PATCHES,
  MODE_RECT,
  type RectMove,
  type RectParams,
  SHAPE_ANY,
  SHAPE_SQUARE,
  SHAPE_TALL,
} from "./state.ts";

const patches = (w: number, h: number, diff = DIFF_EASY): RectParams => ({
  w,
  h,
  expandfactor: 0,
  diff,
  mode: MODE_PATCHES,
});

/** A square clue and a tall one, neither with a number: the left 2×2 and the
 * right column, and nothing else. */
const SMALL = "SaTc";

const rect = (x: number, y: number, w: number, h: number): RectMove => ({
  type: "rect",
  erasing: false,
  x,
  y,
  w,
  h,
});

describe("Patches' params", () => {
  it("write a p, which a Rectangles string lacks", () => {
    expect(encodeParams(decodeParams("6x6pdu"), true)).toBe("6x6pdu");
    expect(decodeParams("6x6pdu").mode).toBe(MODE_PATCHES);
    expect(decodeParams("6x6du").mode).toBe(MODE_RECT);
  });
});

describe("Patches' description", () => {
  it("reads a shape letter, with a number after it or none", () => {
    const s = newState(patches(3, 2), SMALL);
    expect(Array.from(s.grid)).toEqual([HIDDEN, 0, HIDDEN, 0, 0, 0]);
    expect(Array.from(s.shapes)).toEqual([SHAPE_SQUARE, 0, SHAPE_TALL, 0, 0, 0]);
  });

  it("is refused under Rectangles", () => {
    const p = { ...patches(3, 2), mode: MODE_RECT };
    expect(loadVerdict(rectGame, p, SMALL)).not.toBeNull();
  });

  it("parts a clue from a bare number straight after it", () => {
    const grid = [HIDDEN, 4, HIDDEN, 3, 2, 0];
    const shapes = [SHAPE_SQUARE, SHAPE_ANY, SHAPE_ANY, SHAPE_ANY, SHAPE_TALL, 0];
    const desc = encodeNumbers(grid, 6, shapes);
    expect(desc).toBe("S_4A_3T2a");
    const s = newState(patches(3, 2), desc);
    expect(Array.from(s.grid)).toEqual(grid);
    expect(Array.from(s.shapes)).toEqual(shapes);
  });
});

describe("Patches' rule", () => {
  it("takes a rectangle of the clue's shape, and not another", () => {
    const start = newState(patches(3, 2), SMALL);
    const right = executeMove(executeMove(start, rect(0, 0, 2, 2)), rect(2, 0, 1, 2));
    expect(isSolved(right)).toBe(true);
    // The tall clue's rectangle a 2×2 square, the square clue's a column.
    const wrong = executeMove(executeMove(start, rect(0, 0, 1, 2)), rect(1, 0, 2, 2));
    expect(isSolved(wrong)).toBe(false);
  });
});

describe("Patches' hint", () => {
  it("names a clue by its shape, and finishes the board", () => {
    const hint = rectHint(newState(patches(3, 2), SMALL));
    if (!hint.ok) throw new Error("no hint");
    const words = hint.steps.map((s) => s.explanation).join(" ");
    expect(words).toMatch(/the (square|tall) clue/);
    const end = hint.steps.reduce(
      (s, step) => executeMove(s, step.move),
      newState(patches(3, 2), SMALL),
    );
    expect(isSolved(end)).toBe(true);
  });
});

describe("a dealt Patches board", () => {
  for (const diff of [DIFF_EASY, DIFF_UNREASONABLE])
    for (const side of [6, 7, 8])
      it(`at ${side}x${side} ${diff === DIFF_EASY ? "Easy" : "Unreasonable"} has one answer, its tier, and hidden sizes`, () => {
        const p = patches(side, side, diff);
        const { desc } = rectGame.newDesc(p, randomNew(`patches-${side}-${diff}`));
        const s = newState(p, desc);
        expect(answerOf(s).kind, desc).toBe("one");
        expect(Array.from(s.grid).includes(HIDDEN), desc).toBe(true);
        const me = new Midend(rectGame);
        expect(me.newGameFromId(`${side}x${side}p:${desc}`), desc).toBeNull();
        expect(me.getParams()).toBe(encodeParams(p, true));
        expect(encodeNumbers(s.grid, side * side, s.shapes)).toBe(desc);
      });
});

describe("Patches' look", () => {
  it("frames a shaped clue, round its question mark", () => {
    const st = newState(patches(3, 2), SMALL);
    const ds = newDrawState(st, 32);
    const dr = new RecordingDrawing(rectGame.colors(DEFAULT_BACKGROUND));
    redraw(dr, ds, null, st, 1, rectGame.newUi(st), 0, NO_FLASH);
    const texts = opsOfKind(dr.ops, "text").map((o) => o.text);
    expect(texts.filter((t) => t === "?")).toHaveLength(2);
    // Two frames of four sides each.
    expect(opsOfKind(dr.ops, "line")).toHaveLength(8);
  });
});
