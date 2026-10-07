import { describe, expect, it } from "vitest";
import { TWO_NAMES } from "./color/colors.ts";
import { drawPiece, expandPair, TWO_SHAPES } from "./piece.ts";
import { opsOfKind, RecordingDrawing } from "./testing/recording-drawing.ts";

// Even sides, so every coordinate the recorder rounds is already whole.
const CELL = { x: 10, y: 20, w: 32, h: 32 };

function draw(shape: (typeof TWO_SHAPES)[number], grown?: number) {
  const dr = new RecordingDrawing([
    [0, 0, 0],
    [1, 1, 1],
  ]);
  drawPiece(dr, CELL, shape, 1, grown);
  return dr.ops;
}

/** The box a square piece's points span. */
function extent(ops: ReturnType<typeof draw>) {
  const [polygon] = opsOfKind(ops, "polygon");
  const xs = polygon.points.map((p) => p[0]);
  const ys = polygon.points.map((p) => p[1]);
  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    top: Math.min(...ys),
    bottom: Math.max(...ys),
  };
}

describe("a piece", () => {
  it("gives the pair's two members different shapes", () => {
    expect(new Set(TWO_SHAPES).size).toBe(2);
    expect(draw(TWO_SHAPES[0]).map((o) => o.op)).not.toEqual(
      draw(TWO_SHAPES[1]).map((o) => o.op),
    );
  });

  it("stands in from every side of its cell, centered", () => {
    const box = extent(draw("square"));
    expect(box.left).toBeGreaterThan(CELL.x + 1);
    expect(box.right).toBeLessThan(CELL.x + CELL.w - 1);
    expect(box.left - CELL.x).toBeCloseTo(CELL.x + CELL.w - box.right, 5);
    expect(box.top - CELL.y).toBeCloseTo(CELL.y + CELL.h - box.bottom, 5);
    const [disc] = opsOfKind(draw("disc"), "circle");
    expect(disc.cx).toBeCloseTo(CELL.x + CELL.w / 2, 5);
    expect(disc.r).toBeLessThan(CELL.w / 2 - 1);
    // The two shapes are one size, so neither kind looks the larger.
    expect(disc.r * 2).toBeCloseTo(box.right - box.left, 5);
  });

  it("grows from the middle, and draws nothing before it has a size", () => {
    const half = extent(draw("square", 0.5));
    const full = extent(draw("square"));
    expect(half.right - half.left).toBeCloseTo((full.right - full.left) / 2, 5);
    expect((half.left + half.right) / 2).toBeCloseTo((full.left + full.right) / 2, 5);
    expect(draw("square", 0)).toEqual([]);
    expect(draw("disc", 0)).toEqual([]);
  });
});

describe("a help page's pair placeholder", () => {
  it("is replaced by the member's name", () => {
    expect(expandPair("a {{pair:0}} one and a {{pair:1}} one")).toBe(
      `a ${TWO_NAMES[0]} one and a ${TWO_NAMES[1]} one`,
    );
    expect(expandPair("no placeholder")).toBe("no placeholder");
  });

  it("refuses a member the pair does not have", () => {
    expect(() => expandPair("{{pair:2}}")).toThrow("{{pair:2}}");
    expect(() => expandPair("{{pair:}}")).toThrow();
  });
});
