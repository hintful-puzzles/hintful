import { describe, expect, it } from "vitest";
import { boxedGridText, gridText } from "./grid-text.ts";

/** A cell that names its place, so a test sees which place went where. */
const place = (x: number, y: number): string => `${x}${y}`;

describe("gridText", () => {
  it("writes the cells row by row, each line ended by a newline", () => {
    expect(gridText(3, 2, place)).toBe("001020\n011121\n");
  });

  it("writes `across` between two cells of a row, never after the last", () => {
    expect(gridText(3, 2, place, { across: " " })).toBe("00 10 20\n01 11 21\n");
    expect(gridText(3, 1, place, { across: (x, y) => `<${x}${y}>` })).toBe(
      "00<00>10<10>20\n",
    );
  });

  it("writes a `between` line under every row but the last", () => {
    const text = gridText(2, 3, place, {
      across: "-",
      between: { down: (x, y) => `d${x}${y}`, middle: (x, y) => `m${x}${y}` },
    });
    expect(text).toBe("00-10\nd00m00d10\n01-11\nd01m01d11\n02-12\n");
  });

  it("starts and ends each line with `ends`, told which line it is", () => {
    const text = gridText(2, 2, place, {
      between: { down: "|", middle: "+" },
      ends: (y, between) => (between ? ["(", `)${y}`] : ["[", `]${y}`]),
    });
    expect(text).toBe("[0010]0\n(|+|)0\n[0111]1\n");
  });

  it("leaves the last newline off when asked", () => {
    expect(gridText(2, 2, place, { finalNewline: false })).toBe("0010\n0111");
  });

  it("writes nothing but newlines for a row of empty cells", () => {
    expect(gridText(3, 2, () => "")).toBe("\n\n");
  });
});

describe("boxedGridText", () => {
  it("rims every cell, the bottom and right rims included", () => {
    expect(boxedGridText(2, 1, { corner: "+", top: "-", left: "|", cell: "c" })).toBe(
      "+-+-+\n|c|c|\n+-+-+\n",
    );
  });

  it("asks each place for its text, rim places by their own coordinates", () => {
    const text = boxedGridText(1, 1, {
      corner: (x, y) => `${x}${y}`,
      top: (x, y) => `t${x}${y}`,
      left: (x, y) => `l${x}${y}`,
      cell: (x, y) => `c${x}${y}`,
    });
    expect(text).toBe("00t0010\nl00c00l10\n01t0111\n");
  });
});
