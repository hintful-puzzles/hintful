import { describe, expect, it } from "vitest";
import { changedCells, trackTargets } from "./hint-track.ts";

/** Squares 1, 2 and 3 should each become 9; `board` is the board after the
 * move, `changes` what the move changed. */
function judge(changes: Map<number, number> | null, board: Record<number, number>) {
  return trackTargets({
    targets: [1, 2, 3],
    changes,
    key: (t) => t,
    want: () => 9,
    holds: (t) => board[t] === 9,
  });
}

describe("trackTargets", () => {
  it("is off for a move that changed nothing, or no move of this kind", () => {
    expect(judge(new Map(), {}).verdict).toBe("off");
    expect(judge(null, {}).verdict).toBe("off");
  });

  it("is off for a change the step does not ask for, or not the way it asks", () => {
    expect(judge(new Map([[4, 9]]), { 4: 9 }).verdict).toBe("off");
    expect(judge(new Map([[1, 8]]), { 1: 8 }).verdict).toBe("off");
    // One stray change spoils a move that also made a wanted one.
    expect(
      judge(
        new Map([
          [1, 9],
          [4, 9],
        ]),
        { 1: 9, 4: 9 },
      ).verdict,
    ).toBe("off");
  });

  it("shrinks to what does not hold yet, and completes when nothing is left", () => {
    expect(judge(new Map([[2, 9]]), { 2: 9 })).toEqual({
      verdict: "onTrack",
      left: [1, 3],
    });
    // A target the board already held counts as done.
    expect(judge(new Map([[2, 9]]), { 1: 9, 2: 9, 3: 9 })).toEqual({
      verdict: "completed",
      left: [],
    });
  });
});

describe("changedCells", () => {
  it("keys every differing cell to its new value, and nothing else", () => {
    const before = [0, 1, 2, 3];
    const after = [0, 5, 2, 0];
    const changes = changedCells(
      4,
      (i) => before[i],
      (i) => after[i],
    );
    expect([...changes]).toEqual([
      [1, 5],
      [3, 0],
    ]);
  });
});
