/**
 * A clue at the board whose records are read off the sampled answer one a
 * binding (`deal.records`), on the `listing` fixture: every line's digits,
 * dealt sorted, written in the ID whole and read back.
 */

import { describe, expect, it } from "vitest";
import * as listing from "../../generated/engine/testing/fixtures/listing/listing.compiled.ts";
import { validateDesc } from "../contract/desc-error.ts";
import { randomNew } from "../random/index.ts";
import { compareLists } from "../solve/describe-runtime.ts";
import { type FillBoard, solveBoard } from "./board.ts";
import { fillGame } from "./game.ts";

const game = fillGame("listing", listing);
type Board = FillBoard<listing.Dealt>;

const [W, H] = [4, 3];
const p = game.decodeParams(`${W}x${H}`);

const dealt = (seed: string): { board: Board; desc: string } => {
  const { desc } = game.newDesc(p, randomNew(seed));
  return { board: game.newState(p, desc), desc };
};

const upto = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

/** Each line's digits on the board holding `values`: the rows, then the
 * columns. */
const lines = (values: ArrayLike<number>): number[][] => [
  ...upto(H).map((y) => upto(W).map((x) => values[y * W + x])),
  ...upto(W).map((x) => upto(H).map((y) => values[y * W + x])),
];

describe("a clue at the board read off the answer one a binding", () => {
  it("holds every line's digits, sorted, and the board finishes on them", () => {
    for (const seed of ["a", "b", "c", "d"]) {
      const { board } = dealt(seed);
      const solved = solveBoard(listing, board, 0);
      expect(solved.verdict).toBe("solved");
      const { numbers } = board.dealt;
      const read = numbers.digits.map((l) => Array.from(l));
      expect(read).toEqual(lines(solved.values).sort(compareLists));
      expect(numbers.n).toBe(W + H);
    }
  });

  it("is written whole, a digit a member, and read back sorted", () => {
    const { board, desc } = dealt("e");
    expect(desc).toBe(board.dealt.numbers.digits.map((l) => l.join("")).join(","));
    expect(validateDesc(game, p, desc)).toBeNull();
    // Read in any order, the records are held sorted.
    const reversed = desc.split(",").reverse().join(",");
    expect(game.newState(p, reversed).dealt.numbers).toEqual(board.dealt.numbers);
  });

  it("refuses a member past the clue's digits, and a record of none", () => {
    expect(validateDesc(game, p, "1231,1241,4")).not.toBeNull();
    expect(validateDesc(game, p, "1231,,1241")).not.toBeNull();
    expect(validateDesc(game, p, "")).not.toBeNull();
  });
});
