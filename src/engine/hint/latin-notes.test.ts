import { describe, expect, it } from "vitest";
import { CellMarks } from "../solve/cell-marks.ts";
import { latinSpace } from "../solve/describe-runtime.ts";
import { describedLadder, TIERS } from "../solve/ladder-runtime.ts";
import { LATIN_LIBRARY } from "../solve/latin.ts";
import type { Firing, NotesLadder, RungContext } from "./candidate-plan.ts";
import {
  byWrittenCell,
  type LatinStrikeReason,
  latinStrikeRungs,
} from "./latin-notes.ts";

describe("a Latin ladder run on the notes", () => {
  const ladder = describedLadder<string, string, CellMarks>(
    {
      ladder: [
        { id: "latin.single", name: "single", tier: 0 },
        { id: "latin.wing", name: "wing", tier: 2 },
      ],
      placing: [{ id: "latin.placed" }],
      striking: [],
      techniques: {},
    },
    null,
    {},
    LATIN_LIBRARY,
  );
  /** The ladder as a 4 × 4 plan runs it: fresh marks over `grid`. */
  const notesLadder = (grid: Int8Array): NotesLadder => ({
    ladder,
    caps: { [TIERS]: 2 },
    marks: () => {
      const m = new CellMarks(latinSpace(4), 0b11110, Uint8Array.from(grid));
      m.placing = ladder.placing;
      return m;
    },
    enc: { values: 4 },
  });
  const context = (
    shown: ArrayLike<number>,
  ): RungContext<Firing<never, never, LatinStrikeReason>> => ({
    nothingEarlier: true,
    populated: true,
    shown,
    written: shown,
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
    const rungs = latinStrikeRungs<never, never, never>(notesLadder(grid), 4);
    // The single is the walk's, so the wing is the only rung.
    expect(rungs).toHaveLength(1);
    expect(rungs[0](context(shown))).toEqual([
      [
        {
          strike: [{ x: 0, y: 1, n: 1 }],
          reason: {
            kind: "wing",
            n: 1,
            said: { t: 4, m: 1, x: 1, E: [0, 5], self: false },
            w: 4,
          },
        },
      ],
    ]);
  });
});

describe("a firing cut by the notes written", () => {
  it("strikes the written cells in one leg and each bare cell in its own", () => {
    // A 3-wide board: cells 0 and 2 have notes written, 1 and 3 none.
    const written = [0b110, 0, 0b1010, 0];
    const marks = [
      { x: 0, y: 0, n: 1 },
      { x: 1, y: 0, n: 1 },
      { x: 2, y: 0, n: 3 },
      { x: 0, y: 1, n: 2 },
      { x: 1, y: 0, n: 2 },
    ];
    expect(byWrittenCell(marks, written, 3)).toEqual([
      [marks[0], marks[2]],
      [marks[1], marks[4]],
      [marks[3]],
    ]);
  });
});
