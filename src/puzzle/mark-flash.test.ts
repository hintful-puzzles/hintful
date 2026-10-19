import { describe, expect, it } from "vitest";
import { NARRATION_LIMIT } from "../engine/hint-words.ts";
import { LONGEST_HINT } from "../screens/longest-hint.ts";
import { markPixels } from "./mark-flash.ts";

describe("a pressed reference's marks", () => {
  it("are the pixels that differ without them, white, as opaque as they differ", () => {
    const board = [40, 40, 40, 255];
    const ring = [60, 120, 230, 255];
    const rim = [45, 50, 60, 255];
    const shown = new Uint8ClampedArray([...board, ...ring, ...rim]);
    const hidden = new Uint8ClampedArray([...board, ...board, ...board]);
    expect([...markPixels(shown, hidden)]).toEqual([
      ...[0, 0, 0, 0],
      ...[255, 255, 255, 255],
      ...[255, 255, 255, 60],
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
