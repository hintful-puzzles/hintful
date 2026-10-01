/**
 * Tier-1 logic tests for Guess: params codec + validation, desc
 * round-trip, the Knuth feedback formula, and markability under the
 * blank/duplicate rules.
 */
import { describe, expect, it } from "vitest";
import {
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
} from "../../engine/desc-error.ts";
import { describeParams } from "../../engine/param-label.ts";
import { paramsError } from "../../engine/params.ts";
import { randomNew } from "../../engine/random/index.ts";
import { guessGame } from "./index.ts";
import {
  decodeParams,
  defaultParams,
  encodeParams,
  FEEDBACK_CORRECTCOLOR,
  FEEDBACK_CORRECTPLACE,
  type GuessParams,
  isMarkable,
  markPegs,
  newDesc,
  newState,
  status,
  validateDesc,
} from "./state.ts";

describe("params", () => {
  it("round-trips encode/decode", () => {
    const p = {
      ncolors: 8,
      npegs: 5,
      nguesses: 12,
      allowBlank: false,
      allowMultiple: true,
    };
    expect(encodeParams(p, true)).toBe("c8p5g12Bm");
    expect(decodeParams("c8p5g12Bm")).toEqual(p);
  });

  it("decodes blank/duplicate flags and ignores junk", () => {
    expect(decodeParams("c6p4g10bM")).toEqual({
      ncolors: 6,
      npegs: 4,
      nguesses: 10,
      allowBlank: true,
      allowMultiple: false,
    });
    // unknown letters are ignored, defaults fill the rest
    expect(decodeParams("p3")).toEqual({ ...defaultParams(), npegs: 3 });
  });

  it("validates", () => {
    const error = (p: GuessParams) => paramsError(guessGame, p, true);
    expect(error(defaultParams())).toBeNull();
    expect(error({ ...defaultParams(), ncolors: 1 })).toBe("Colors must be at least 2");
    expect(error({ ...defaultParams(), npegs: 1 })).toBe(
      "Pegs per guess must be at least 2",
    );
    expect(error({ ...defaultParams(), ncolors: 11 })).toBe(
      "Colors must be at most 10",
    );
    expect(error({ ...defaultParams(), nguesses: 0 })).toBe(
      "Guesses must be at least 1",
    );
    // no duplicates but fewer colors than pegs
    expect(
      error({
        ncolors: 3,
        npegs: 4,
        nguesses: 10,
        allowBlank: false,
        allowMultiple: false,
      }),
    ).toMatch(/as many colors as pegs/);
  });

  it("labels a custom game by its rows, colors, blanks and duplicates", () => {
    const p = {
      ncolors: 7,
      npegs: 5,
      nguesses: 9,
      allowBlank: true,
      allowMultiple: false,
    };
    expect(describeParams(guessGame, p)).toBe("5x9, 7 colors + blank, no duplicates");
    expect(describeParams(guessGame, defaultParams())).toBe("4x10, 6 colors");
  });
});

describe("desc", () => {
  it("generates a valid, recoverable solution", () => {
    const p = defaultParams();
    const { desc } = newDesc(p, randomNew("seed-1"));
    expect(desc.length).toBe(p.npegs * 2);
    expect(validateDesc(p, desc)).toBeNull();
    const s = newState(p, desc);
    expect(s.solution).toHaveLength(p.npegs);
    for (const c of s.solution) {
      expect(c).toBeGreaterThanOrEqual(1);
      expect(c).toBeLessThanOrEqual(p.ncolors);
    }
    expect(s.nextGo).toBe(0);
    expect(s.revealed).toBe(false);
    expect(status(s)).toBe("ongoing");
  });

  it("honors allowMultiple=false (no repeated color in the solution)", () => {
    const p = {
      ncolors: 6,
      npegs: 4,
      nguesses: 10,
      allowBlank: false,
      allowMultiple: false,
    };
    for (const seed of ["a", "b", "c", "d", "e"]) {
      const { desc } = newDesc(p, randomNew(seed));
      const s = newState(p, desc);
      expect(new Set(s.solution).size).toBe(p.npegs);
    }
  });

  it("rejects malformed descs", () => {
    const p = defaultParams();
    const len = p.npegs * 2;
    expect(validateDesc(p, "ab")).toBe(DESC_TOO_SHORT);
    expect(validateDesc(p, "a".repeat(len + 1))).toBe(DESC_TOO_LONG);
    expect(validateDesc(p, `${"a".repeat(len - 1)}g`)).toBe(descBadCharacter("g"));
  });
});

describe("markPegs (Knuth feedback)", () => {
  const ncolors = 6;

  it("scores an all-correct guess as all correct-place", () => {
    const sol = [1, 2, 3, 4];
    const { feedback, ncPlace } = markPegs([1, 2, 3, 4], sol, ncolors);
    expect(ncPlace).toBe(4);
    expect(feedback).toEqual([
      FEEDBACK_CORRECTPLACE,
      FEEDBACK_CORRECTPLACE,
      FEEDBACK_CORRECTPLACE,
      FEEDBACK_CORRECTPLACE,
    ]);
  });

  it("packs black markers before white markers", () => {
    // solution 1 2 3 4; guess 1 2 4 3:
    //   two correct place (1,2), 4 and 3 present but misplaced → 2 white.
    const { feedback, ncPlace } = markPegs([1, 2, 4, 3], [1, 2, 3, 4], ncolors);
    expect(ncPlace).toBe(2);
    expect(feedback).toEqual([
      FEEDBACK_CORRECTPLACE,
      FEEDBACK_CORRECTPLACE,
      FEEDBACK_CORRECTCOLOR,
      FEEDBACK_CORRECTCOLOR,
    ]);
  });

  it("counts duplicates via min(#guess, #solution)", () => {
    // solution 1 1 2 3; guess 1 1 1 1: two exact (the first two), the
    // other two 1s have no solution peg left → 0 white.
    const { feedback, ncPlace } = markPegs([1, 1, 1, 1], [1, 1, 2, 3], ncolors);
    expect(ncPlace).toBe(2);
    expect(feedback.filter((f) => f === FEEDBACK_CORRECTCOLOR)).toHaveLength(0);
  });

  it("scores a color present but wholly misplaced as white only", () => {
    // solution 1 2 3 4; guess 2 1 4 3 → 0 place, 4 color.
    const { feedback, ncPlace } = markPegs([2, 1, 4, 3], [1, 2, 3, 4], ncolors);
    expect(ncPlace).toBe(0);
    expect(feedback.filter((f) => f === FEEDBACK_CORRECTCOLOR)).toHaveLength(4);
  });
});

describe("isMarkable", () => {
  const base = {
    ncolors: 6,
    npegs: 4,
    nguesses: 10,
    allowBlank: false,
    allowMultiple: true,
  };

  it("requires all pegs filled by default", () => {
    expect(isMarkable(base, [1, 2, 3, 0])).toBe(false);
    expect(isMarkable(base, [1, 2, 3, 4])).toBe(true);
  });

  it("allowBlank lets a single peg suffice", () => {
    const p = { ...base, allowBlank: true };
    expect(isMarkable(p, [0, 0, 0, 0])).toBe(false);
    expect(isMarkable(p, [1, 0, 0, 0])).toBe(true);
  });

  it("allowMultiple=false rejects repeated colors", () => {
    const p = { ...base, allowMultiple: false };
    expect(isMarkable(p, [1, 2, 2, 3])).toBe(false);
    expect(isMarkable(p, [1, 2, 3, 4])).toBe(true);
  });
});
