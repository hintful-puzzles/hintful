/**
 * A clue at the board whose records are read off the sampled answer one a
 * binding (`deal.records`), on the `listing` fixture: every line's digits,
 * dealt sorted, written in the ID whole and read back.
 */

import { describe, expect, it } from "vitest";
import * as listing from "../../generated/engine/testing/fixtures/listing/listing.compiled.ts";
import { COL_ERROR, COL_HINT_OUTLINE } from "../color/roles.ts";
import { validateDesc } from "../contract/desc-error.ts";
import { CELL, mark, phrase, stepMarks } from "../contract/hint-words.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { compareLists } from "../solve/describe-runtime.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { fillGame } from "./game.ts";
import { recordPoint } from "./record-list.ts";

const game = fillGame("listing", listing);
type Board = FillBoard<listing.Dealt>;

const [W, H] = [4, 3];
const p = game.decodeParams(`${W}x${H}`);

const dealt = (seed: string): { board: Board; desc: string } => {
  const { desc } = game.newDesc(p, randomNew(seed));
  return { board: game.newState(p, desc), desc };
};

const upto = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

/** Each line's digits on the board holding `values`: the rows, then the
 * columns. */
const lines = (values: ArrayLike<number>): number[][] => [
  ...upto(H).map((y) => upto(W).map((x) => values[y * W + x])),
  ...upto(W).map((x) => upto(H).map((y) => values[y * W + x])),
];

describe("a clue at the board read off the answer one a binding", () => {
  it("holds every line's digits, sorted, and the board finishes on them", () => {
    for (const seed of ["a", "b", "c", "d"]) {
      const { board } = dealt(seed);
      const solved = solveBoard(listing, board, 0);
      expect(solved.verdict).toBe("solved");
      const { numbers } = board.dealt;
      const read = numbers.digits.map((l) => Array.from(l));
      expect(read).toEqual(lines(solved.values).sort(compareLists));
      expect(numbers.n).toBe(W + H);
    }
  });

  it("is written whole, a digit a member, and read back sorted", () => {
    const { board, desc } = dealt("e");
    expect(desc).toBe(board.dealt.numbers.digits.map((l) => l.join("")).join(","));
    expect(validateDesc(game, p, desc)).toBeNull();
    // Read in any order, the records are held sorted.
    const reversed = desc.split(",").reverse().join(",");
    expect(game.newState(p, reversed).dealt.numbers).toEqual(board.dealt.numbers);
  });

  it("refuses a member past the clue's digits, and a record of none", () => {
    expect(validateDesc(game, p, "1231,1241,4")).not.toBeNull();
    expect(validateDesc(game, p, "1231,,1241")).not.toBeNull();
    expect(validateDesc(game, p, "")).not.toBeNull();
  });
});

describe("the list beneath the board", () => {
  const TS = 40;
  const colors = game.colors(DEFAULT_BACKGROUND);
  /** Rows 1123, 2331 and 3211; columns 123, 132, 231 and 311. */
  const ROWS = [1, 1, 2, 3, 2, 3, 3, 1, 3, 2, 1, 1];
  const DESC = "123,132,231,311,1123,2331,3211";
  const empty: Board = game.newState(p, DESC);
  /** Board `empty` with its first `n` squares as `ROWS` holds them. */
  const filled = (n: number, values = ROWS): Board =>
    game.executeMove(empty, { set: upto(n).flatMap((c) => [c, values[c]]) } as never);
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
  /** The bottom of the board, read off the grid's frame. */
  const bottom = ((): number => {
    const frame = draw(empty).find((op) => op.op === "rect" && op.w === W * TS + 1);
    if (frame?.op !== "rect") throw new Error("no frame");
    return frame.y + H * TS;
  })();
  const listed = (ops: readonly DrawOp[]) =>
    ops.filter(
      (op): op is Extract<DrawOp, { op: "text" }> => op.op === "text" && op.y > bottom,
    );
  /** The strokes through the list's records. */
  const strokes = (ops: readonly DrawOp[]) =>
    ops.filter((op) => op.op === "line" && op.y1 > bottom && op.y1 === op.y2);

  it("draws each record beneath the board in columns, on the canvas the params size", () => {
    const drawn = listed(draw(empty));
    expect(drawn.map((t) => t.text)).toEqual(DESC.split(","));
    // Four rows a column: the 4-digit numbers start the second, at the top.
    expect(drawn[4].y).toBe(drawn[0].y);
    expect(drawn[4].x).toBeGreaterThan(drawn[3].x);
    expect(drawn[1].y).toBeGreaterThan(drawn[0].y);
    const { w, h } = game.computeSize(p, TS);
    for (const t of drawn) {
      expect(t.y).toBeLessThan(h);
      expect(t.x + t.text.length * t.size * 0.6).toBeLessThanOrEqual(w);
    }
    expect(strokes(draw(empty))).toEqual([]);
  });

  it("strikes a record once a line reads it, and draws one read twice in the error color", () => {
    // The first row reads 1123.
    const one = filled(4);
    const drawn = listed(draw(one));
    const ink = listed(draw(empty))[4].color;
    expect(drawn[4].color).not.toBe(ink);
    expect(strokes(draw(one))).toHaveLength(1);
    expect(listing.recordHolds(one.values, spaceOf(listing, one), one.dealt, 4)).toBe(
      true,
    );
    // The second row reads 1123 too.
    const twice = filled(8, [1, 1, 2, 3, 1, 1, 2, 3]);
    const broken = listed(draw(twice))[4];
    expect(colors[broken.color]).toEqual(colors[COL_ERROR]);
    expect(strokes(draw(twice))).toEqual([]);
  });

  it("rings the record a step reads where the list draws it", () => {
    // With two rows in and the rest noted, the first column fits 123 alone.
    const markAll = game.markAll;
    if (markAll === undefined) throw new Error("no notes");
    const rows = filled(8);
    const noting = markAll(rows);
    if (noting === null) throw new Error("nothing to note");
    const b = game.executeMove(rows, noting);
    const got = game.hint.plan(b);
    if (!got.ok) throw new Error(`no hint: ${got.error}`);
    const step = got.steps[0];
    const ringed = stepMarks(step).of("ring", CELL);
    expect(ringed).toContainEqual(recordPoint(H, 0));
    const rings = draw(b, step).filter((op) => op.op === "ring" && op.y > bottom);
    expect(rings).toHaveLength(1);
    // Round 123, the first record, and no square's ring beneath the grid.
    const first = listed(draw(b))[0];
    const ring = rings[0];
    if (ring.op !== "ring") throw new Error("no ring");
    expect(ring.x).toBeLessThanOrEqual(first.x);
    expect(ring.y).toBeLessThanOrEqual(first.y);
  });

  it("outlines the records a step reasons from", () => {
    const words = phrase`${mark.this("outline", CELL, [recordPoint(H, 1), recordPoint(H, 2)], "number")}`;
    const hint = { words, highlights: { area: [], hatch: [], targets: [], marks: [] } };
    const rects = (ops: readonly DrawOp[]) =>
      ops.filter(
        (op): op is Extract<DrawOp, { op: "rect" }> =>
          op.op === "rect" && op.y > bottom,
      );
    const before = rects(draw(empty));
    const after = rects(draw(empty, hint));
    // Four sides each, in the outline's color.
    expect(after.length - before.length).toBe(8);
    expect(after.filter((op) => op.color === COL_HINT_OUTLINE)).toHaveLength(8);
  });

  it("prints the list beneath the grid in text, a line a length", () => {
    const text = (game.textFormat?.(empty) ?? "").split("\n");
    expect(text.slice(-4)).toEqual([
      "",
      "3: 123,132,231,311,",
      "4: 1123,2331,3211,",
      "",
    ]);
  });
});
