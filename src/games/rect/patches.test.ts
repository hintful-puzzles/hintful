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
import { executeMove, isSolved, newState, outlinedBoxAt } from "./moves.ts";
import {
  COL_EDGE_TINT,
  COL_FILL,
  COL_MISTAKE,
  newDrawState,
  redraw,
} from "./render.ts";
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
  type RectState,
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

  /** The colors the rects of a frame were drawn in. */
  const colorsOf = (s: RectState): Set<number> => {
    const dr = new RecordingDrawing(rectGame.colors(DEFAULT_BACKGROUND));
    redraw(dr, newDrawState(s, 32), null, s, 1, rectGame.newUi(s), 0, NO_FLASH);
    return new Set(opsOfKind(dr.ops, "rect").map((o) => o.color));
  };
  const tinted = (colors: Set<number>) =>
    [...colors].some((c) => c >= COL_EDGE_TINT && c < COL_EDGE_TINT + 4);

  it("outlines a drawn rectangle that may still grow in its clue's color", () => {
    const s = executeMove(newState(patches(3, 2), SMALL), rect(0, 0, 1, 1));
    const colors = colorsOf(s);
    expect(tinted(colors)).toBe(true);
    expect(colors.has(COL_MISTAKE)).toBe(false);
  });

  it("draws one with its clue's number in ink", () => {
    // A 2 drawn as its two squares: the left column of `2a2c`'s 3×2.
    const p = { ...patches(3, 2), mode: MODE_RECT };
    const s = executeMove(newState(p, "2a4c"), rect(0, 0, 1, 2));
    expect(tinted(colorsOf(s))).toBe(false);
  });

  it("fills one from the start, and draws the side two share in color", () => {
    // A square clue drawn as a 1×2, which no square is, and a plain clue
    // beside it drawn as its own square: two rectangles that may still grow.
    const p = patches(3, 3);
    let s = newState(p, "SAg");
    s = executeMove(executeMove(s, rect(0, 0, 1, 2)), rect(1, 0, 1, 1));
    const dr = new RecordingDrawing(rectGame.colors(DEFAULT_BACKGROUND));
    redraw(dr, newDrawState(s, 32), null, s, 1, rectGame.newUi(s), 0, NO_FLASH);
    const rects = opsOfKind(dr.ops, "rect");
    // Its square below the square clue wears the clue's fill, though the
    // 1×2 is no rectangle the clue allows: the two clues' and that one.
    const ground = rects.filter((o) => o.w === 31 && o.h === 31);
    expect(
      ground.filter((o) => o.color >= COL_FILL && o.color < COL_FILL + 4),
    ).toHaveLength(3);
    // The side the two share, at x = 32 to 34, is drawn, and not in ink.
    const shared = rects.filter((o) => o.w === 2 && o.x >= 32 && o.x <= 33 && o.y < 32);
    expect(shared.length).toBeGreaterThan(0);
    expect(
      shared.every((o) => o.color >= COL_EDGE_TINT && o.color < COL_EDGE_TINT + 4),
    ).toBe(true);
  });

  it("reddens one no rectangle its clue allows can contain", () => {
    // A tall clue's rectangle two squares wide on a board two high.
    const s = executeMove(newState(patches(3, 2), SMALL), rect(1, 0, 2, 2));
    const colors = colorsOf(s);
    expect(colors.has(COL_MISTAKE)).toBe(true);
    expect(tinted(colors)).toBe(false);
  });
});

describe("a rectangle drawn round one clue", () => {
  const mistakes = (s: RectState) => rectGame.findMistakes?.(s) ?? [];

  it("is no mistake while it is smaller than its clue's", () => {
    // The square clue's is the left 2×2; a 1×1 and a 1×2 are inside it.
    const start = newState(patches(3, 2), SMALL);
    expect(mistakes(executeMove(start, rect(0, 0, 1, 1)))).toEqual([]);
    expect(mistakes(executeMove(start, rect(0, 0, 1, 2)))).toEqual([]);
  });

  it("is a mistake where it takes a square its clue's does not", () => {
    // The tall clue's is the right column alone.
    const s = executeMove(newState(patches(3, 2), SMALL), rect(1, 0, 2, 1));
    expect(mistakes(s)).toContainEqual({ edge: "v", x: 1, y: 0 });
  });

  it("is a lower bound to the hint, which carries on from it", () => {
    const s = executeMove(newState(patches(3, 2), SMALL), rect(0, 0, 1, 1));
    const hint = rectHint(s);
    if (!hint.ok) throw new Error(`no hint: ${hint.error}`);
    const end = hint.steps.reduce((t, step) => executeMove(t, step.move), s);
    expect(isSolved(end)).toBe(true);
  });

  it("drawn already as its clue's whole, is no step of the hint", () => {
    const p = patches(7, 7);
    const { desc } = rectGame.newDesc(p, randomNew("drawn-whole"));
    const start = newState(p, desc);
    const answer = answerOf(start);
    if (answer.kind !== "one") throw new Error("no answer");
    // A clue with no number, and its rectangle in the answer, drawn.
    const clue = Array.from(start.grid).indexOf(HIDDEN);
    const whole = outlinedBoxAt(
      { w: 7, h: 7, ...answer.solution },
      clue % 7,
      Math.floor(clue / 7),
    );
    if (!whole) throw new Error("no rectangle");
    const s = executeMove(start, { type: "rect", erasing: false, ...whole });
    const hint = rectHint(s);
    if (!hint.ok) throw new Error(`no hint: ${hint.error}`);
    const same = (m: RectMove) =>
      m.type === "rect" &&
      m.x === whole.x &&
      m.y === whole.y &&
      m.w === whole.w &&
      m.h === whole.h;
    expect(hint.steps.some((step) => same(step.move))).toBe(false);
    const end = hint.steps.reduce((t, step) => executeMove(t, step.move), s);
    expect(isSolved(end)).toBe(true);
  });
});
