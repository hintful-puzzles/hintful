import { describe, expect, it } from "vitest";
import type { HintMarkLegend } from "../game.ts";
import { CELL, mark, type Narration, phrase, whole } from "../hint-words.ts";
import { referenceDefects } from "./hint-reference.ts";

const a = { x: 0, y: 0 };
const b = { x: 1, y: 0 };
const legend: HintMarkLegend = {
  roles: {
    ring: "the square the step decides, dotted (“the dotted square”)",
    outline: "what the step reasons from",
    stripes: "the line the sentence names",
  },
};
const defects = (words: Narration): string[] => referenceDefects(words, legend);

describe("a reference names a thing and its mark", () => {
  it("fails the shapes the owner could not read without a press", () => {
    // Tracks' sharedFate, as it stood (2026-10-19).
    const tracks = phrase`Track ${mark.as("ring", CELL, [a], "here")} ${mark.as("outline", CELL, [b], "would carry on upward")}, but ${mark.this("stripes", whole(CELL), [a, b], "column")} ${mark.as("outline", CELL, [b], "has room for one more track square")}, so ${mark.as("ring", CELL, [a], "this")} must be empty.`;
    const found = defects(tracks);
    expect(found.filter((d) => d.includes("clause"))).toHaveLength(2);
    expect(found.filter((d) => d.includes("bare"))).toHaveLength(2);
    // Magnets' lineFull.
    expect(
      defects(
        phrase`${mark.this("stripes", whole(CELL), [a, b], "row")}'s ${mark.as("outline", CELL, [b], "clues need")} a + or −.`,
      ),
    ).toHaveLength(1);
  });

  it("fails a phrase that is no noun phrase, and a noun no mark word picks out", () => {
    expect(defects(mark.as("outline", CELL, [a], "different dots"))[0]).toMatch(
      /not a noun phrase/,
    );
    expect(defects(mark.as("ring", CELL, [a], "a wall"))[0]).toMatch(/not which mark/);
  });

  it("fails one deictic noun said in two roles of a kind, and passes it in one", () => {
    const two = phrase`${mark.this("outline", CELL, [b], "square")} beside ${mark.this("ring", CELL, [a], "square")}`;
    expect(defects(two)).toHaveLength(2);
    const told = phrase`${mark.the("outline", CELL, [b], "square")} beside ${mark.this("ring", CELL, [a], "square")}`;
    expect(defects(told)).toEqual([]);
    const nouns = phrase`${mark.this("stripes", whole(CELL), [a, b], "cage")} and ${mark.this("ring", CELL, [a], "cell")}`;
    expect(defects(nouns)).toEqual([]);
  });

  it("passes a role's word, a value, a taught phrase, a relation and the move", () => {
    for (const words of [
      mark.the("ring", CELL, [a], "one"),
      mark.as("outline", CELL, [a], "the 6"),
      mark.as("outline", CELL, [a], "clue 3"),
      mark.as("ring", CELL, [a], "the Cs"),
      mark.as("ring", CELL, [a], "the dotted square"),
      mark.as("ring", CELL, [a], "its partner"),
      mark.as("stripes", CELL, [a], "the same row"),
      mark.move("go back for it"),
    ])
      expect(defects(words), words.text).toEqual([]);
  });
});
