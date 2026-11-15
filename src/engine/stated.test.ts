import { describe, expect, it } from "vitest";
import { CELL, type MarkKind, stepMarks } from "./hint-words.ts";
import { SHADED_NAME, UNSHADED_NAME } from "./piece.ts";
import { type StatedContext, statedParts, statedSentence } from "./stated.ts";
import type { Point } from "./types.ts";

const W = 4;
const at = (c: number): Point => ({ x: c % W, y: (c / W) | 0 });
const cx = (over: Partial<StatedContext<Point>> = {}): StatedContext<Point> => ({
  kind: CELL,
  at,
  ring: [at(5), at(6)],
  marks: { outline: [at(1)], stripes: [at(4), at(5), at(6), at(7)] },
  terms: { n: 3, pair: [9, 10], one: 2 },
  value: (n) => `v${n}`,
  shows: (p) => p.y * W + p.x,
  ...over,
});

describe("a stated clause", () => {
  it("says a number term as the board draws it, and the lexicon's words", () => {
    const s = statedSentence(
      {
        look: "{outline} needs {n} {shaded} {nouns}",
        move: "{ring} must be {unshaded}",
      },
      cx(),
    );
    expect(s.text).toBe(
      `The outlined square needs v3 ${SHADED_NAME} squares, so these squares must be ${UNSHADED_NAME}.`,
    );
  });

  it("takes the one form or the several from the reference's live elements", () => {
    const s = statedSentence(
      {
        look: "{outline} is full",
        move: "{ring: the {each} beside it | the squares beside it ({each})} must go",
      },
      cx(),
    );
    expect(s.text).toBe(
      "The outlined square is full, so the squares beside it (5 and 6) must go.",
    );
    const narrowed = s.narrow((role, _, key) => role !== "ring" || key !== "1,1");
    expect(narrowed.text).toBe(
      "The outlined square is full, so the 6 beside it must go.",
    );
  });

  it("references a term's elements in a role, and draws a strand as an outline", () => {
    const { look } = statedParts(
      {
        look: "{outline pair: the outlined pair} and {strand one: the outlined corner}",
      },
      cx({ terms: { pair: [9, 10], one: 2 }, marks: { strand: [at(2)] } }),
    );
    expect(look?.text).toBe("The outlined pair and the outlined corner");
    const marks = stepMarks({ words: look });
    const outlined = marks.of("outline", CELL).map((p) => p.y * W + p.x);
    expect(outlined.sort((a, b) => a - b)).toEqual([2, 9, 10]);
  });

  it("names stripes by the game's unit, as one thing", () => {
    const { look } = statedParts(
      { look: "{stripes} is full" },
      cx({ unit: (els) => (els.every((p) => p.y === els[0].y) ? "row" : "column") }),
    );
    expect(look?.text).toBe("This row is full");
  });

  it("refuses a slot that names nothing it was given", () => {
    expect(() => statedParts({ look: "{m} is it" }, cx())).toThrow(/\{m\}/);
    expect(() => statedParts({ look: "{outline m} is it" }, cx())).toThrow(
      /names no element term/,
    );
  });

  it("draws a reference on the kind of the sort it names, where a role marks several", () => {
    const FACE: MarkKind<number> = { name: "clue", key: String };
    const DOT: MarkKind<number> = { name: "dot", key: String };
    const { look } = statedParts(
      { look: "{outline face: this {n}} and {outline cell: the outlined dot}" },
      {
        kind: FACE,
        kinds: { face: FACE, cell: DOT },
        at: (i) => i,
        ring: [],
        marks: { outline: { face: [4], cell: [7, 8] } },
        terms: { n: 3 },
        value: (n) => `${n}`,
      },
    );
    expect(look?.text).toBe("This 3 and the outlined dot");
    const marks = stepMarks({ words: look });
    expect(marks.of("outline", FACE)).toEqual([4]);
    expect(marks.of("outline", DOT)).toEqual([7, 8]);
  });

  it("refuses a reference that names no sort of a role of several", () => {
    const FACE: MarkKind<number> = { name: "clue", key: String };
    const several = {
      kind: FACE,
      kinds: { face: FACE },
      at: (i: number) => i,
      ring: [],
      marks: { outline: { face: [4] } },
      terms: {},
      value: (n: number) => `${n}`,
    };
    expect(() => statedParts({ look: "{outline} is it" }, several)).toThrow(
      /names no sort/,
    );
    expect(() => statedParts({ look: "{outline cell} is it" }, several)).toThrow(
      /names no sort/,
    );
  });

  it("refuses literal words that only a reference may say", () => {
    expect(() => statedParts({ look: "this square is full" }, cx())).toThrow();
  });
});
