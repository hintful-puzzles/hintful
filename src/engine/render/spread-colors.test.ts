import { describe, expect, it } from "vitest";
import { type PieceBox, spreadColors } from "./spread-colors.ts";

const at = (x: number, y: number): PieceBox => ({ x0: x, y0: y, x1: x, y1: y });

describe("spreadColors", () => {
  it("gives each piece its own color while there are enough", () => {
    expect([...spreadColors([at(0, 0), at(1, 0), at(2, 0)], 4)]).toEqual([0, 1, 2]);
  });

  it("repeats a color on pieces far apart, not on near ones", () => {
    // Two clusters of two, far apart, on two colors: in order, the second
    // cluster's pieces would take 0 and 1 again whatever their place, so
    // moving its first piece next to the first cluster's must move a color.
    const boxes = [at(0, 0), at(9, 9), at(1, 0), at(9, 8)];
    const color = spreadColors(boxes, 2);
    expect(color[0]).not.toBe(color[2]);
    expect(color[1]).not.toBe(color[3]);
  });

  it("counts a box's squares, not only its corner", () => {
    // A long box reaching beside a piece is near it, though its far end is not.
    const color = spreadColors([{ x0: 0, y0: 0, x1: 8, y1: 0 }, at(0, 9), at(8, 1)], 2);
    expect(color[0]).not.toBe(color[2]);
  });
});
