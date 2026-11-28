/**
 * What a carry holds drawn on a board of glyphs, as a square board taking
 * `play.carry` draws it: the `mapping` fixture draws pictures alone.
 */

import { describe, expect, it } from "vitest";
import { RecordingDrawing } from "../../testing/recording-drawing.ts";
import { carriedLook, drawCarried, newCarriedSprite } from "./carried.ts";
import { COL_CELL } from "./palette.ts";

const COL_ENTRY = 20;
const COL_PENCIL = 21;
const look = carriedLook({ byValue: new Map(), COL_ENTRY, COL_PENCIL }, String);
const TS = 40;
const at = { x: 100, y: 100 };

function drawn(value: number, notes: number) {
  const dr = new RecordingDrawing(
    Array.from({ length: 22 }, () => [0.5, 0.5, 0.5] as [number, number, number]),
  );
  drawCarried(dr, newCarriedSprite(), TS, { value, notes, at }, look);
  return dr.ops;
}

describe("what a carry holds, on a board of glyphs", () => {
  it("draws a value as its glyph on a disc of an open cell's surface", () => {
    const ops = drawn(5, 0);
    expect(ops.find((op) => op.op === "circle")).toMatchObject({
      cx: at.x,
      cy: at.y,
      fill: COL_CELL,
    });
    const texts = ops.flatMap((op) => (op.op === "text" ? [op] : []));
    expect(texts.map((t) => [t.text, t.color])).toEqual([["5", COL_ENTRY]]);
  });

  it("lays an empty cell's notes beyond four values in a grid inside the disc", () => {
    const texts = drawn(0, (1 << 1) | (1 << 5) | (1 << 9)).flatMap((op) =>
      op.op === "text" ? [op] : [],
    );
    expect(texts.map((t) => [t.text, t.color])).toEqual([
      ["1", COL_PENCIL],
      ["5", COL_PENCIL],
      ["9", COL_PENCIL],
    ]);
    // Corner, middle and opposite corner of a three by three grid.
    const [one, five, nine] = texts;
    expect(five.x).toBe(at.x);
    expect(five.y).toBe(at.y);
    expect(one.x).toBeLessThan(at.x);
    expect(one.y).toBeLessThan(at.y);
    expect(nine.x - at.x).toBe(at.x - one.x);
    for (const t of texts)
      expect(Math.hypot(t.x - at.x, t.y - at.y)).toBeLessThan(TS / 2);
  });
});
