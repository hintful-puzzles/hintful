import { describe, expect, it } from "vitest";
import { clueList, describedSpace, latinSpace } from "../engine/describe-runtime.ts";
import * as unequal from "../games/unequal/unequal.compiled.ts";
import * as unruly from "../games/unruly/unruly.compiled.ts";

describe("a compiled answer check", () => {
  it("refuses a value outside the domain, however the rest reads", () => {
    const o = 4;
    const sp = latinSpace(o);
    const none = { greater: clueList([], [], sp.edgeEnds.length / 2) };
    const square = (shift: number) =>
      Uint8Array.from(
        { length: o * o },
        (_, c) => (((c % o) + ((c / o) | 0)) % o) + 1 + shift,
      );
    expect(unequal.isAnswer(square(0), sp, none)).toBe(true);
    // Still no value twice in a line, but 2 to 5 on a board of 1 to 4.
    expect(unequal.isAnswer(square(1), sp, none)).toBe(false);
  });

  it("holds a variation's rule only where the board has it on", () => {
    // Rows alternate between one row and its complement: no three in a row
    // either way, each line balanced, and every row repeated.
    const a = [1, 1, 2, 1, 2, 2];
    const g = Uint8Array.from({ length: 36 }, (_, c) => {
      const v = a[c % 6];
      return ((c / 6) | 0) % 2 === 0 ? v : 3 - v;
    });
    const sp = describedSpace(unruly.units, 6, 6);
    expect(unruly.isAnswer(g, sp, [])).toBe(true);
    expect(unruly.isAnswer(g, sp, ["unique"])).toBe(false);
  });
});
