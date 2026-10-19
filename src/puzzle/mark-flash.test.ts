import { describe, expect, it } from "vitest";
import { NARRATION_LIMIT } from "../engine/hint-words.ts";
import { LONGEST_HINT } from "../screens/longest-hint.ts";
import { markAlpha, markBox, nearestMarked, tinted } from "./mark-flash.ts";

describe("a reference's marks", () => {
  // A 3x2 canvas: the marks are two ring pixels and a rim pixel.
  const board = [40, 40, 40, 255];
  const ring = [60, 120, 230, 255];
  const rim = [45, 50, 60, 255];
  const shown = new Uint8ClampedArray([
    ...board,
    ...ring,
    ...rim,
    ...board,
    ...ring,
    ...board,
  ]);
  const hidden = new Uint8ClampedArray(Array(6).fill(board).flat());
  const alpha = markAlpha(shown, hidden);

  it("are the pixels that differ without them, as much as they differ", () => {
    expect([...alpha]).toEqual([0, 255, 60, 0, 255, 0]);
  });

  it("lie in the box round every pixel they touch", () => {
    expect(markBox(alpha, 3)).toEqual({ x: 1, y: 0, w: 2, h: 2 });
    expect(markBox(new Uint8ClampedArray(6), 3)).toBeNull();
  });

  it("are reached at their nearest pixel, not their box's", () => {
    // From below the right column: the box's nearest point, (2, 2), is bare.
    expect(nearestMarked(alpha, 3, 2.5, 5)).toEqual({ x: 1.5, y: 1.5 });
  });

  it("can be laid over the board in one color", () => {
    expect([...tinted(alpha, [255, 255, 255]).subarray(4, 12)]).toEqual([
      255, 255, 255, 255, 255, 255, 255, 60,
    ]);
  });
});

describe("the room kept for a hint", () => {
  it("is measured by a sentence longer than any hint may be", () => {
    const length = LONGEST_HINT.reduce((n, s) => n + s.text.length, 0);
    expect(length).toBeGreaterThan(NARRATION_LIMIT);
    expect(LONGEST_HINT.some((s) => s.ref !== null)).toBe(true);
  });
});
