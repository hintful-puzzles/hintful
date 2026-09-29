/**
 * Shared Latin-family hint helpers: classifying a forced single placement as
 * naked / hidden / forced from the working board, so a hint narrates the truth
 * (the generic `latin.ts` solver records all three under one `single` reason).
 */
import { describe, expect, it } from "vitest";
import { candidateConclusions, latinPremise, narrateLatinReason } from "./hint-text.ts";
import { markKeys, type Narration } from "./hint-words.ts";
import {
  classifyPlacement,
  classifyPlacementInRegions,
  hiddenSingleLine,
  singlePlacementReason,
} from "./latin-hint.ts";

// A 4×4 working board: grid (0 = empty), pencil (bit 1<<d = candidate d).
function board(rows: number[][]): { grid: Int8Array; pencil: Int32Array; w: number } {
  const w = rows.length;
  const grid = new Int8Array(w * w);
  const pencil = new Int32Array(w * w);
  // Each cell is either a placed digit (>0) or a list of candidates (array).
  return { grid, pencil, w };
}

describe("classifyPlacement", () => {
  it("naked single: the cell's own candidates are exactly {n}", () => {
    const { grid, pencil, w } = board([[], [], [], []]);
    // Cell (1,1) has only candidate 3; others irrelevant.
    pencil[1 * w + 1] = 1 << 3;
    expect(classifyPlacement(grid, pencil, 1, 1, 3, w)).toEqual({ kind: "naked" });
  });

  it("hidden single in a row: n fits no other empty cell of the row", () => {
    const { grid, pencil, w } = board([[], [], [], []]);
    const y = 2;
    // Target (1,2) has several candidates incl. 3; no other cell in row 2 has 3.
    pencil[y * w + 1] = (1 << 1) | (1 << 3);
    pencil[y * w + 0] = (1 << 1) | (1 << 4);
    pencil[y * w + 2] = (1 << 2) | (1 << 4);
    pencil[y * w + 3] = (1 << 1) | (1 << 2);
    expect(classifyPlacement(grid, pencil, 1, y, 3, w)).toEqual({
      kind: "hidden",
      line: "row",
      index: 2,
    });
  });

  it("hidden single in a column when the row also has the digit", () => {
    const { grid, pencil, w } = board([[], [], [], []]);
    const x = 1;
    // 3 appears elsewhere in row 0 (so not a row-hidden) but nowhere else in col 1.
    pencil[0 * w + x] = (1 << 2) | (1 << 3);
    pencil[0 * w + 0] = 1 << 3; // row competitor
    pencil[1 * w + x] = (1 << 1) | (1 << 2);
    pencil[2 * w + x] = (1 << 1) | (1 << 4);
    pencil[3 * w + x] = (1 << 2) | (1 << 4);
    expect(classifyPlacement(grid, pencil, x, 0, 3, w)).toEqual({
      kind: "hidden",
      line: "col",
      index: 1,
    });
  });

  it("a filled competitor doesn't block a hidden single (only empty cells count)", () => {
    const { grid, pencil, w } = board([[], [], [], []]);
    const y = 1;
    pencil[y * w + 2] = (1 << 1) | (1 << 3);
    // (0,1) is filled with 3 — must not count as a live competitor.
    grid[y * w + 0] = 3;
    pencil[y * w + 1] = 1 << 4;
    pencil[y * w + 3] = 1 << 1;
    expect(classifyPlacement(grid, pencil, 2, y, 3, w)).toEqual({
      kind: "hidden",
      line: "row",
      index: 1,
    });
  });

  it("throws when the notes show neither (the plan skipped a strike)", () => {
    const { grid, pencil, w } = board([[], [], [], []]);
    // 3 is live in another empty cell of both the row and the column.
    pencil[1 * w + 1] = (1 << 2) | (1 << 3);
    pencil[1 * w + 0] = 1 << 3; // row competitor
    pencil[0 * w + 1] = 1 << 3; // column competitor
    expect(() => classifyPlacement(grid, pencil, 1, 1, 3, w)).toThrow(
      /skipped a strike/,
    );
  });
});

describe("classifyPlacementInRegions", () => {
  // A 4×4 board carved into four 2×2 sub-blocks (the cells of each, by index).
  const block = (bx: number, by: number): number[] => {
    const cells: number[] = [];
    for (let dy = 0; dy < 2; dy++)
      for (let dx = 0; dx < 2; dx++) cells.push((by * 2 + dy) * 4 + (bx * 2 + dx));
    return cells;
  };

  it("identifies a hidden single in a non-row/column region (a sub-block)", () => {
    const { grid, pencil } = board([[], [], [], []]);
    // Target (1,0) is in the top-left block {0,1,4,5}. It notes {2,3}; no OTHER
    // cell of the block still notes 3, but a cell of its row AND its column do
    // (so it is hidden in the block alone, not the row or column).
    pencil[1] = (1 << 2) | (1 << 3); // (1,0)
    pencil[0] = 1 << 2; // (0,0) block-mate, no 3
    pencil[4] = 1 << 2; // (0,1) block-mate, no 3
    pencil[5] = 1 << 4; // (1,1) block-mate, no 3
    pencil[2] = 1 << 3; // (2,0) row competitor — blocks row-hidden
    pencil[9] = 1 << 3; // (1,2) column competitor — blocks col-hidden
    const regions = [
      { cells: [0, 1, 2, 3], holdsEvery: true, tag: "row" },
      { cells: [1, 5, 9, 13], holdsEvery: true, tag: "col" },
      { cells: block(0, 0), holdsEvery: true, tag: "block" },
    ];
    const c = classifyPlacementInRegions(grid, pencil, 1, 3, regions);
    expect(c.kind).toBe("hidden");
    expect(c.kind === "hidden" && c.region.tag).toBe("block");
  });

  it("never calls a placement hidden in a region that need not hold every value", () => {
    // The same board, with the block declared as a Killer-style cage: no other
    // cell of it notes 3, but a cage need not hold a 3, so that proves nothing.
    const { grid, pencil } = board([[], [], [], []]);
    pencil[1] = (1 << 2) | (1 << 3);
    pencil[2] = 1 << 3;
    pencil[9] = 1 << 3;
    const cage = { cells: block(0, 0), holdsEvery: false };
    const row = { cells: [0, 1, 2, 3], holdsEvery: true };
    expect(() => classifyPlacementInRegions(grid, pencil, 1, 3, [row, cage])).toThrow(
      /skipped a strike/,
    );
    // Declared as holding every digit, the same cells would make it hidden.
    expect(
      classifyPlacementInRegions(grid, pencil, 1, 3, [
        row,
        { ...cage, holdsEvery: true },
      ]).kind,
    ).toBe("hidden");
  });

  it("returns naked regardless of the region list, and throws on the residue", () => {
    const { grid, pencil } = board([[], [], [], []]);
    pencil[5] = 1 << 2;
    expect(
      classifyPlacementInRegions(grid, pencil, 5, 2, [
        { cells: block(0, 0), holdsEvery: true },
      ]).kind,
    ).toBe("naked");
    // 3 still live elsewhere in the only region: not hidden there, so the notes
    // cannot explain the placement.
    pencil[5] = (1 << 2) | (1 << 3);
    pencil[0] = 1 << 3;
    expect(() =>
      classifyPlacementInRegions(grid, pencil, 5, 3, [
        { cells: block(0, 0), holdsEvery: true },
      ]),
    ).toThrow(/skipped a strike/);
  });
});

describe("singlePlacementReason", () => {
  it("maps each classification to its narratable reason", () => {
    const { grid, pencil, w } = board([[], [], [], []]);
    pencil[0] = 1 << 2;
    expect(singlePlacementReason(grid, pencil, 0, 0, 2, w)).toEqual({ kind: "single" });

    const p2 = new Int32Array(w * w);
    p2[2 * w + 1] = (1 << 1) | (1 << 3);
    p2[2 * w + 0] = 1 << 1;
    p2[2 * w + 2] = 1 << 4;
    p2[2 * w + 3] = 1 << 2;
    expect(singlePlacementReason(grid, p2, 1, 2, 3, w)).toEqual({
      kind: "hiddenSingle",
      n: 3,
      line: "row",
      index: 2,
    });
  });
});

describe("hiddenSingleLine", () => {
  it("returns the whole row or column", () => {
    expect(hiddenSingleLine("row", 2, 4)).toEqual([
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
    ]);
    expect(hiddenSingleLine("col", 1, 4)).toEqual([
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
    ]);
  });
});

describe("narrateLatinReason and latinPremise (shared row/column-game narration)", () => {
  const keys = (n: Narration): string[] => [...markKeys(n.refs)].sort();

  it("narrates each generic placement arm with the shared wording, bound to its marks", () => {
    const single = narrateLatinReason({ kind: "single" }, { x: 1, y: 2, n: 3 }, 4);
    expect(single.text).toBe(
      "Every other number has been ruled out in this cell, so it can only be 3.",
    );
    expect(keys(single)).toEqual(["ring|cell|1,2"]);
    const hidden = narrateLatinReason(
      { kind: "hiddenSingle", n: 2, line: "col", index: 1 },
      { x: 1, y: 0, n: 2 },
      3,
    );
    expect(hidden.text).toBe(
      "In this column, 2 can go in only this cell, since every other cell in the column rules it out, so it must be 2.",
    );
    // "this column" stripes the whole column; "this cell" rings the one.
    expect(keys(hidden)).toEqual([
      "ring|cell|1,0",
      "stripes|cell|1,0",
      "stripes|cell|1,1",
      "stripes|cell|1,2",
    ]);
    expect(() =>
      narrateLatinReason({ kind: "dup", n: 1, px: 0, py: 0 }, { x: 0, y: 0, n: 1 }, 3),
    ).toThrow(/latinPremise/);
  });

  it("gives each generic strike arm a premise the walk concludes", () => {
    const struck = (...ns: number[]) => ns.map((n) => ({ x: 2, y: 2, n }));
    const dup = latinPremise({ kind: "dup", n: 1, px: 0, py: 2 }, struck(1));
    expect(dup.premise.text).toBe(
      "The 1 just placed can't repeat in its row and column",
    );
    // The value just placed is outlined: it is what the cull reasons from.
    expect(keys(dup.premise)).toEqual(["outline|cell|0,2"]);
    expect(dup.where).toBe("from the other cells there");
    const set = latinPremise(
      {
        kind: "set",
        cells: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
      },
      struck(3, 2, 3),
    );
    expect(set.premise.text).toBe(
      "The outlined cells already account for 2 and 3 between them",
    );
    // A forcing chain concludes from *both* branches of the origin's two
    // candidates, so both are stated; the links between are numbered on the
    // board rather than recited.
    const forcing = latinPremise(
      {
        kind: "forcing",
        chain: [
          { x: 0, y: 0, n: 2 },
          { x: 3, y: 0, n: 7 },
          { x: 3, y: 4, n: 5 },
        ],
        shares: "row",
      },
      [{ x: 1, y: 4, n: 5 }],
    ).premise;
    expect(forcing.text).toBe(
      "Cell 1 is 5 or 2, and every numbered cell has just two numbers left, so each forces the next. If cell 1 is 5, this cell's row already has it; if 2, cell 3 is driven to 5, in line with this cell. Either way, 5 is ruled out here",
    );
    // Every numbered cell is outlined with its ordinal; "this cell" is the
    // struck one, ringed.
    expect(keys(forcing)).toEqual([
      "outline|cell|0,0",
      "outline|cell|3,0",
      "outline|cell|3,4",
      "ring|cell|1,4",
    ]);
    expect(
      forcing.refs
        .flatMap((r) => r.elements as { order?: number }[])
        .map((c) => c.order),
    ).toContain(3);
    expect(() => latinPremise({ kind: "single" }, struck(3))).toThrow(
      /narrateLatinReason/,
    );
  });

  it("concludes by the move: a strike, a placement, or the values left", () => {
    const say = candidateConclusions({ value: String });
    // A value struck in two cells is named once.
    expect(say.strike([4, 2, 4], {})).toBe("we must cross out 2 and 4");
    expect(say.strike([5], { where: "from these cells" })).toBe(
      "we must cross out the 5 from these cells",
    );
    expect(say.strike([1, 2], { struck: "its identity marks" })).toBe(
      "we must cross out its identity marks",
    );
    // A premise that already named the values is referred back to.
    expect(say.strike([3], { named: true })).toBe("we must cross it out");
    expect(say.strike([2, 3], { named: true })).toBe("we must cross them out");
    expect(say.place(3)).toBe("this cell must be 3");
    expect(say.keep([1, 5])).toBe("pencil in only 1 and 5");
  });
});
