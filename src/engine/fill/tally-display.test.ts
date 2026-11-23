import { describe, expect, it } from "vitest";
import { wholePieces } from "./tally-display.ts";

const PIECE = 1;
const REST = 2;

/** A 4x4 board's values with `set`'s cells set, the rest open. */
const board = (set: readonly number[]): number[] => {
  const values = new Array<number>(16).fill(0);
  for (let i = 0; i < set.length; i += 2) values[set[i]] = set[i + 1];
  return values;
};

describe("whole pieces", () => {
  it("counts a piece only once it is shut in, and none past the longest", () => {
    const n = (set: number[]) => wholePieces(board(set), 4, 4, PIECE, 2);
    // A piece of two along the bottom row's left, open above and to the
    // right, then shut in by the edge and rest.
    expect(n([12, PIECE, 13, PIECE])).toEqual([0, 0]);
    expect(n([12, PIECE, 13, PIECE, 8, REST, 9, REST, 14, REST])).toEqual([0, 1]);
    // A run of three, longer than the longest piece, is none.
    expect(
      n([12, PIECE, 13, PIECE, 14, PIECE, 8, REST, 9, REST, 10, REST, 15, REST]),
    ).toEqual([0, 0]);
  });
});
