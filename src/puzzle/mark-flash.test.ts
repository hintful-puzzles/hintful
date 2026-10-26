import { describe, expect, it } from "vitest";
import { darkValue } from "../engine/color/color-token.ts";
import { HINT_REFERENCE_COLORS } from "../engine/color/colors.ts";
import { NARRATION_LIMIT } from "../engine/hint-words.ts";
import { LONGEST_HINT } from "../screens/longest-hint.ts";
import {
  edged,
  edgeFor,
  markAlpha,
  markBox,
  nearestMarked,
  type ReferenceMarks,
  tinted,
  withoutSpecks,
} from "./mark-flash.ts";

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

  it("keep a core's rim and drop a speck's run, which has no core", () => {
    // A 12x5 canvas: a 2x2 mark at (1, 1) with a faint rim pixel beside it,
    // and a speck's run, a pixel wide and most-of-a-pixel strong, along a
    // diagonal well clear of it (Chrome's GPU canvas, 2026-10-26).
    const width = 12;
    const a = new Uint8ClampedArray(width * 5);
    for (const [x, y] of [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2],
    ])
      a[y * width + x] = 200;
    a[1 * width + 3] = 40;
    for (const [x, y] of [
      [7, 0],
      [8, 1],
      [9, 2],
      [10, 3],
    ])
      a[y * width + x] = 147;
    const kept = withoutSpecks(a, width);
    expect(
      [...kept].flatMap((v, p) => (v ? [[p % width, Math.floor(p / width), v]] : [])),
    ).toEqual([
      [1, 1, 200],
      [2, 1, 200],
      [3, 1, 40],
      [1, 2, 200],
      [2, 2, 200],
    ]);
    expect(nearestMarked(kept, width, 11, 4)).toEqual({ x: 2.5, y: 2.5 });
  });

  it("keep a hairline whole, a mark all of whose pixels are speck-thin", () => {
    const width = 5;
    const a = new Uint8ClampedArray(width * 5);
    for (let i = 0; i < 5; i++) a[i * width + i] = 160;
    expect(withoutSpecks(a, width)).toBe(a);
  });

  it("can be laid over the board in one color", () => {
    expect([...tinted(alpha, [255, 255, 255]).subarray(4, 12)]).toEqual([
      255, 255, 255, 255, 255, 255, 255, 60,
    ]);
  });
});

describe("a repainted mark's edge", () => {
  // A 5x5 canvas with one opaque mark pixel in the middle, and a 2x1 mark
  // whose right pixel is a half-covered rim.
  const dot = (): ReferenceMarks => {
    const alpha = new Uint8ClampedArray(25);
    alpha[12] = 255;
    return { alpha, box: markBox(alpha, 5) };
  };
  const at = (rgba: Uint8ClampedArray, p: number) => [
    ...rgba.subarray(p * 4, p * 4 + 4),
  ];
  const red = [255, 0, 0] as const;
  const black = [0, 0, 0] as const;

  it("lies round a mark outside it, and nowhere past its reach", () => {
    const out = edged(dot(), 5, red, black, 1, "outside");
    expect(at(out, 12)).toEqual([255, 0, 0, 255]);
    for (const p of [6, 7, 8, 11, 13, 16, 17, 18])
      expect(at(out, p)).toEqual([0, 0, 0, 255]);
    for (const p of [0, 2, 10, 14, 24]) expect(at(out, p)[3]).toBe(0);
  });

  it("eats into a mark inside it, and leaves the pixels beside it alone", () => {
    const alpha = new Uint8ClampedArray(25);
    for (let y = 1; y < 4; y++) for (let x = 1; x < 4; x++) alpha[y * 5 + x] = 255;
    const out = edged({ alpha, box: markBox(alpha, 5) }, 5, red, black, 1, "inside");
    expect(at(out, 12)).toEqual([255, 0, 0, 255]);
    for (const p of [6, 7, 8, 11, 13, 16, 17, 18])
      expect(at(out, p)).toEqual([0, 0, 0, 255]);
    for (const p of [0, 1, 5, 10, 24]) expect(at(out, p)[3]).toBe(0);
  });

  it("keeps a rim's antialiasing on either side", () => {
    const alpha = new Uint8ClampedArray(5);
    alpha[1] = 255;
    alpha[2] = 128;
    const marks = { alpha, box: markBox(alpha, 5) };
    // Outside, the rim is part mark, part edge, and fully covered.
    expect(at(edged(marks, 5, red, black, 1, "outside"), 2)).toEqual([128, 0, 0, 255]);
    // Inside, the rim is all edge, as covered as it was.
    expect(at(edged(marks, 5, red, black, 1, "inside"), 2)).toEqual([0, 0, 0, 128]);
  });

  it("draws nothing for a reference with no marks", () => {
    const none = { alpha: new Uint8ClampedArray(25), box: null };
    expect(edged(none, 5, red, black, 2, "outside").some((v) => v > 0)).toBe(false);
  });

  it("lets every reference color read on any color the game draws, in both schemes", () => {
    // A game may draw anything under a mark, so the floor is taken over every
    // luminance: the mark reads where the content is far from it, its edge
    // where the content is near it. The worst is content halfway between
    // the two, the square root of their own contrast, which the hint's own
    // blue in the light scheme puts at 2.14:1: its luminance is where black
    // and white stand equally far.
    const lin = (v: number) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    const lum = (c: readonly number[]) =>
      0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const contrast = (a: number, b: number) =>
      (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    let measured = 0;
    for (const [role, pool] of Object.entries(HINT_REFERENCE_COLORS))
      pool.forEach((c, i) => {
        for (const [scheme, v] of [
          ["light", c],
          ["dark", darkValue(c) ?? c],
        ] as const) {
          const rgb = v.map((x) => Math.round(x * 255)) as [number, number, number];
          const mark = lum(rgb);
          const edge = lum(edgeFor(rgb));
          let floor = Number.POSITIVE_INFINITY;
          for (let y = 0; y <= 1; y += 0.001)
            floor = Math.min(floor, Math.max(contrast(mark, y), contrast(edge, y)));
          expect(floor, `${role} ${i} in ${scheme}`).toBeGreaterThan(2.1);
          measured++;
        }
      });
    expect(measured).toBeGreaterThanOrEqual(18);
  });
});

describe("the room kept for a hint", () => {
  it("is measured by a sentence longer than any hint may be", () => {
    const length = LONGEST_HINT.reduce((n, s) => n + s.text.length, 0);
    expect(length).toBeGreaterThan(NARRATION_LIMIT);
    expect(LONGEST_HINT.some((s) => s.ref !== null)).toBe(true);
  });
});
