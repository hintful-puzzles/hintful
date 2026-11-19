/**
 * The path arrow's geometry: its head points the way the path runs, sits
 * across the two squares' shared side, and is as large at a phone's tile as
 * it needs to be read. A game's frame test sees it drawn; this holds where
 * it points, which a frame's snapshot only records.
 */

import { describe, expect, it } from "vitest";
import {
  drawDirectedLine,
  drawPathStart,
  pathHeadLength,
  pathHeadWidth,
} from "./path-arrow.ts";
import { opsOfKind, RecordingDrawing } from "./testing/recording-drawing.ts";
import type { Color } from "./types.ts";

const BLACK: Color = [0, 0, 0];
const WHITE: Color = [1, 1, 1];

/** The head drawn for a line from `a` to `b` on tile `ts`: its tip and its
 * base's two corners. */
function headOf(ts: number, a: { x: number; y: number }, b: { x: number; y: number }) {
  const dr = new RecordingDrawing([WHITE, BLACK]);
  drawDirectedLine(dr, ts, a, b, 1, 4);
  const [line] = opsOfKind(dr.ops, "line");
  const [head] = opsOfKind(dr.ops, "polygon");
  return { line, tip: head.points[0], base: head.points.slice(1) };
}

describe("the path arrow", () => {
  it.each([
    ["right", { x: 0, y: 0 }, { x: 40, y: 0 }],
    ["left", { x: 40, y: 0 }, { x: 0, y: 0 }],
    ["down", { x: 0, y: 0 }, { x: 0, y: 40 }],
    ["up", { x: 0, y: 40 }, { x: 0, y: 0 }],
  ])("points %s, the way the line runs", (_way, a, b) => {
    const { line, tip, base } = headOf(40, a, b);
    expect([line.x1, line.y1, line.x2, line.y2]).toEqual([a.x, a.y, b.x, b.y]);
    // How far a point is from the line's middle toward `b`: the tip is past
    // the middle, and the base's corners behind it.
    const along = ([x, y]: readonly [number, number]) =>
      ((x - (a.x + b.x) / 2) * (b.x - a.x) + (y - (a.y + b.y) / 2) * (b.y - a.y)) / 40;
    expect(along(tip)).toBeGreaterThan(0);
    for (const corner of base) expect(along(corner)).toBeLessThan(0);
  });

  it("sits across the squares' shared side, centered on it", () => {
    const { tip, base } = headOf(40, { x: 0, y: 0 }, { x: 40, y: 0 });
    // Half the head each side of the side at x = 20.
    expect(tip[0] - 20).toBe(20 - base[0][0]);
    expect(base[0][1]).toBe(-base[1][1]);
  });

  it("is a head wider than a line a phone's tile draws, and longer than a stroke", () => {
    // A phone draws a seven-by-seven board at about 44 pixels a square.
    expect(pathHeadWidth(44)).toBeGreaterThanOrEqual(12);
    expect(pathHeadLength(44)).toBeGreaterThanOrEqual(8);
    // The floor keeps a tiny tile's head a head.
    expect(pathHeadWidth(10)).toBeGreaterThanOrEqual(7);
  });

  it("rings a path's first square: the ring's ink, then the square's surface inside it", () => {
    const dr = new RecordingDrawing([WHITE, BLACK]);
    drawPathStart(dr, 40, { x: 20, y: 20 }, 12, 1, 0);
    const [ring, inside] = opsOfKind(dr.ops, "circle");
    expect([ring.fill, ring.r > 12]).toEqual([1, true]);
    expect([inside.fill, inside.r]).toEqual([0, 12]);
  });
});
