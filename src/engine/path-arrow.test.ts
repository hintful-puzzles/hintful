/**
 * The path arrow's geometry: it points the way the path runs, fills the gap
 * between the two squares' discs, and its head is as large at a phone's tile
 * as it needs to be read. A game's frame test sees it drawn; this holds where
 * it points, which a frame's snapshot only records.
 */

import { describe, expect, it } from "vitest";
import type { Color } from "./contract/types.ts";
import {
  drawPathArrow,
  drawPathStart,
  pathHeadLength,
  pathHeadWidth,
} from "./path-arrow.ts";
import { opsOfKind, RecordingDrawing } from "./testing/recording-drawing.ts";

const BLACK: Color = [0, 0, 0];
const WHITE: Color = [1, 1, 1];

type At = { x: number; y: number };

/** The arrow drawn for a link from `a` to `b` on a 40-pixel tile with discs
 * of radius `inset`: its shaft, its head's tip and its base's two corners. */
function arrowOf(a: At, b: At, inset = 12) {
  const dr = new RecordingDrawing([WHITE, BLACK]);
  drawPathArrow(dr, 40, a, b, 1, inset);
  const [shaft] = opsOfKind(dr.ops, "line");
  const [head] = opsOfKind(dr.ops, "polygon");
  return { shaft, tip: head.points[0], base: head.points.slice(1) };
}

/** Within the pixel the points are rounded to. */
const near = (got: number, want: number) =>
  expect(Math.abs(got - want)).toBeLessThanOrEqual(1);

describe("the path arrow", () => {
  it.each([
    ["right", { x: 0, y: 0 }, { x: 40, y: 0 }],
    ["left", { x: 40, y: 0 }, { x: 0, y: 0 }],
    ["down", { x: 0, y: 0 }, { x: 0, y: 40 }],
    ["up", { x: 0, y: 40 }, { x: 0, y: 0 }],
  ])("points %s, the way the line runs", (_way, a, b) => {
    const { shaft, tip } = arrowOf(a, b);
    const toB = (x: number, y: number) => Math.hypot(x - b.x, y - b.y);
    expect(toB(...tip)).toBeLessThan(toB(shaft.x1, shaft.y1));
  });

  it("sits across a straight link's shared side, centered on it", () => {
    const { shaft, tip } = arrowOf({ x: 0, y: 0 }, { x: 40, y: 0 });
    // As far past the side at x = 20 as its tail is short of it.
    expect(tip[0] - 20).toBe(20 - shaft.x1);
  });

  it.each([
    ["straight", { x: 0, y: 0 }, { x: 40, y: 0 }],
    ["diagonal", { x: 0, y: 0 }, { x: 40, y: 40 }],
  ])("a %s link's arrow fills the gap between the discs, shaft into head", (_way, a, b) => {
    const inset = 12;
    const { shaft, tip, base } = arrowOf(a, b, inset);
    const from = (x: number, y: number) => Math.hypot(x - a.x, y - a.y);
    const len = from(b.x, b.y);
    // The shaft leaves `a`'s disc, and the head's tip touches `b`'s.
    near(from(shaft.x1, shaft.y1), inset);
    near(from(...tip), len - inset);
    // The shaft runs on to the head's base: no gap between them.
    const [s1, s2] = base;
    near(from(shaft.x2, shaft.y2), from((s1[0] + s2[0]) / 2, (s1[1] + s2[1]) / 2));
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
