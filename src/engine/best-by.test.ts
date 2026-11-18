import { describe, expect, it } from "vitest";
import { bestBy } from "./best-by.ts";

describe("bestBy", () => {
  it("takes the greatest score, the first of a tie, and says whether it is alone", () => {
    expect(bestBy([3, 7, 5], (x) => x)).toEqual({ item: 7, score: 7, alone: true });
    expect(bestBy(["a", "bb", "cc"], (x) => x.length)).toEqual({
      item: "bb",
      score: 2,
      alone: false,
    });
    // A later tie of an earlier best still ends its being alone.
    expect(bestBy([1, 4, 2, 4], (x) => x)?.alone).toBe(false);
    expect(bestBy([], (x: number) => x)).toBeNull();
  });
});
