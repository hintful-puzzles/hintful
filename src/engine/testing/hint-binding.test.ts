import { describe, expect, it } from "vitest";
import type { HintMarkLegend, HintStep } from "../game.ts";
import { CELL, type MarkRef, mark, phrase } from "../hint-words.ts";
import { bindingDefects } from "./hint-binding.ts";

interface H {
  ring: { x: number; y: number }[];
  outline: { x: number; y: number }[];
}

const legend: HintMarkLegend<H> = {
  roles: { ring: "the cell decided", outline: "the cells reasoned from" },
  drawn: (h) =>
    [
      { role: "ring", kind: CELL, elements: h.ring },
      { role: "outline", kind: CELL, elements: h.outline },
    ] as MarkRef[],
};

const a = { x: 0, y: 0 };
const b = { x: 1, y: 0 };

function step(words: ReturnType<typeof phrase>, h: H, explanation = words.text) {
  return { move: null, explanation, words, highlights: h } as HintStep<unknown, H>;
}

describe("bindingDefects", () => {
  const words = phrase`${mark.the("outline", CELL, [b], "cell").capitalized()} rules out 2, so ${mark.this("ring", CELL, [a], "cell")} must be 1.`;

  it("passes a step whose words name exactly what it draws", () => {
    expect(bindingDefects(step(words, { ring: [a], outline: [b] }), legend)).toEqual(
      [],
    );
  });

  it("finds a mark the words name and the step does not draw", () => {
    expect(bindingDefects(step(words, { ring: [a], outline: [] }), legend)).toEqual([
      "names outline|cell|1,0, which is not drawn",
    ]);
  });

  it("finds a mark the step draws and no word names", () => {
    expect(bindingDefects(step(words, { ring: [a, b], outline: [b] }), legend)).toEqual(
      ["draws ring|cell|1,0, which no word names"],
    );
  });

  it("finds an explanation that is not its words", () => {
    const s = step(words, { ring: [a], outline: [b] }, "Something else.");
    expect(bindingDefects(s, legend)[0]).toMatch(/is not its words/);
  });

  it("finds a role the legend does not list", () => {
    const narrow: HintMarkLegend<H> = { ...legend, roles: { ring: "the cell" } };
    expect(bindingDefects(step(words, { ring: [a], outline: [b] }), narrow)).toEqual([
      "draws the outline role, which the legend does not list",
    ]);
  });

  it("finds a step with no words", () => {
    const s = { move: null, explanation: "x" } as HintStep<unknown, H>;
    expect(bindingDefects(s, legend)).toEqual(["the step has no words"]);
  });
});
