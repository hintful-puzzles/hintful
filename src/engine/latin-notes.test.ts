import { describe, expect, it } from "vitest";
import type { Firing, RungContext } from "./candidate-plan.ts";
import { LatinSolver, latinLadder } from "./latin.ts";
import {
  type LatinStrikeReason,
  latinNotesLadder,
  latinStrikeRungs,
} from "./latin-notes.ts";

describe("a Latin ladder run on the notes", () => {
  const ladder = latinLadder<string, string, LatinSolver>(
    {
      ladder: [
        { id: "latin.single", tier: 0 },
        { id: "latin.wing", tier: 2 },
      ],
      placing: [{ id: "latin.placed" }],
      striking: [],
    },
    {},
  );
  const context = (
    shown: ArrayLike<number>,
  ): RungContext<never, Firing<never, never, LatinStrikeReason>> => ({
    nothingEarlier: true,
    placements: () => [],
    ops: [],
    populated: true,
    shown,
    continues: () => false,
  });

  it("strikes what a library technique finds in the notes, for the reason it says", () => {
    // (1,0) is 2 or 3; if 2, (0,0) in its row is 1, and if 3, (1,1) in its
    // column is 1. Either way (0,1), in line with both, cannot be 1.
    const grid = new Int8Array(16);
    const shown = new Int32Array(16).fill(0b11110);
    shown[0] = 0b110;
    shown[1] = 0b1100;
    shown[5] = 0b1010;
    const rungs = latinStrikeRungs<never, never, never>(
      latinNotesLadder(ladder, 4, grid, 2),
      4,
    );
    // The single is the walk's, so the wing is the only rung.
    expect(rungs).toHaveLength(1);
    expect(rungs[0](context(shown))).toEqual([
      [
        {
          strike: [{ x: 0, y: 1, n: 1 }],
          reason: {
            kind: "wing",
            n: 1,
            middle: { x: 1, y: 0 },
            ends: [
              { x: 0, y: 0 },
              { x: 1, y: 1 },
            ],
            self: false,
          },
        },
      ],
    ]);
  });

  it("holds the values on the walk's grid as it stands when asked", () => {
    const grid = new Int8Array(16);
    const on = latinNotesLadder(ladder, 4, grid, 2);
    grid[6] = 3;
    const m = on.marks();
    expect(m).toBeInstanceOf(LatinSolver);
    expect([...m.grid]).toEqual([...grid]);
    expect(on.enc.values).toBe(4);
  });
});
