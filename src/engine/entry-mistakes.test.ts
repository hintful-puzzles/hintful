import { describe, expect, it } from "vitest";
import {
  type EntryBoard,
  entryMistake,
  entryMistakes,
  gridCell,
} from "./entry-mistakes.ts";

// One row, answer 1 2 3 4 5, each cell a different case.
const board: EntryBoard = {
  answer: [1, 2, 3, 4, 5],
  entry: [1, 3, 0, 0, 0],
  notes: [0, 0, (1 << 1) | (1 << 2), (1 << 4) | (1 << 5), 0],
};

describe("entryMistake", () => {
  it("judges an entry against the answer, and a blank cell by its marks", () => {
    expect([0, 1, 2, 3, 4].map((i) => entryMistake(board, i))).toEqual([
      null, // the right value
      "cell", // a wrong value
      "note", // marks without the answer
      null, // marks with the answer and an extra
      null, // no marks at all
    ]);
  });

  it("reads a note bit through the game's encoding", () => {
    // Bit n−1 for value n: cell 2's bits 1,2 now hold its answer 3, and cell
    // 3's bits 4,5 no longer hold its answer 4.
    const shifted = { ...board, enc: { bit: (n: number) => 1 << (n - 1) } };
    expect(entryMistake(shifted, 2)).toBeNull();
    expect(entryMistake(shifted, 3)).toBe("note");
  });

  it("takes the game's spelling of a blank cell", () => {
    // Map's colors start at 0, so a blank region is -1 and 0 is an entry.
    const colors: EntryBoard = {
      answer: [0, 1],
      entry: [0, -1],
      notes: [0, 1],
      empty: -1,
    };
    expect(entryMistake(colors, 0)).toBeNull();
    expect(entryMistake(colors, 1)).toBe("note");
  });
});

describe("entryMistakes", () => {
  it("lists every mistake the player can change, placed by the game", () => {
    const fixed = { ...board, fixed: (i: number) => i === 1 };
    expect(entryMistakes(board, gridCell(5))).toEqual([
      { x: 1, y: 0, kind: "cell" },
      { x: 2, y: 0, kind: "note" },
    ]);
    expect(entryMistakes(fixed, (index) => ({ index }))).toEqual([
      { index: 2, kind: "note" },
    ]);
  });
});
