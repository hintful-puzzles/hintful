import { describe, expect, it } from "vitest";
import { hatchBands } from "./hatch.ts";
import type { Rect } from "./types.ts";

/** Whether `(x, y)` lies in one of the bands laid over `rect`, read off each
 * band's two edges (the lines `x + y = c`). */
function inBands(rect: Rect, period: number, x: number, y: number): boolean {
  return hatchBands(rect, period).some(([a, b]) => {
    const s = x + y;
    return s >= a.x + a.y && s < b.x + b.y && y >= rect.y && y <= rect.y + rect.h;
  });
}

describe("hatchBands", () => {
  const period = 12;
  const left: Rect = { x: 30, y: 40, w: 24, h: 24 };
  const right: Rect = { x: 54, y: 40, w: 24, h: 24 };

  it("lays the canvas's pattern, so neighbors hatched apart join up", () => {
    // Whether a point is striped depends on x + y alone, never on which rect
    // drew it: that is what makes two tiles hatched separately one pattern.
    const striped = (s: number) => ((s % period) + period) % period < period / 2;
    let sampled = 0;
    for (const rect of [left, right]) {
      for (let y = rect.y; y < rect.y + rect.h; y++) {
        for (let x = rect.x; x < rect.x + rect.w; x++) {
          const [px, py] = [x + 0.5, y + 0.5];
          expect(inBands(rect, period, px, py), `${x},${y}`).toBe(striped(px + py));
          sampled++;
        }
      }
    }
    expect(sampled).toBe(2 * 24 * 24);
  });

  it("covers half the surface", () => {
    let inside = 0;
    for (let y = 0; y < left.h; y++)
      for (let x = 0; x < left.w; x++)
        if (inBands(left, period, left.x + x + 0.5, left.y + y + 0.5)) inside++;
    expect(inside / (left.w * left.h)).toBeCloseTo(0.5, 1);
  });
});
