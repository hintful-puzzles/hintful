/**
 * Tier-1 tests for solo's state/codec layer (state.ts): param round-trips
 * across all four variants, the grid + block-structure codecs as mutual
 * inverses, and full desc assembly through validateDesc/newState. The solver,
 * generator, render, and move handling are tested separately as they land.
 */
import { describe, expect, it } from "vitest";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
} from "../../engine/desc-error.ts";
import { describeParams, presetMenu } from "../../engine/param-label.ts";
import { paramsError } from "../../engine/params.ts";
import { soloGame } from "./index.ts";
import {
  checkValid,
  DIFF_BLOCK,
  DIFF_KINTERSECT,
  DIFF_KMINMAX,
  DIFF_RECURSIVE,
  DIFF_SET,
  DIFF_SIMPLE,
  decodeParams,
  defaultParams,
  encodeBlockStructureDesc,
  encodeGrid,
  encodeParams,
  makeBlocksFromWhichblock,
  newState,
  rectangularBlocks,
  type SoloParams,
  SYMM_NONE,
  SYMM_REF4D,
  SYMM_ROT2,
  validateDesc,
} from "./state.ts";

function paramsEqual(a: SoloParams, b: SoloParams): boolean {
  return (
    a.c === b.c &&
    a.r === b.r &&
    a.symm === b.symm &&
    a.diff === b.diff &&
    a.xtype === b.xtype &&
    a.killer === b.killer
  );
}

describe("solo params codec", () => {
  it("round-trips every variant through full encode/decode", () => {
    const cases: SoloParams[] = [
      {
        c: 3,
        r: 3,
        symm: SYMM_ROT2,
        diff: DIFF_BLOCK,
        kdiff: DIFF_KMINMAX,
        xtype: false,
        killer: false,
      },
      {
        c: 2,
        r: 3,
        symm: SYMM_ROT2,
        diff: DIFF_SIMPLE,
        kdiff: DIFF_KMINMAX,
        xtype: false,
        killer: false,
      },
      {
        c: 3,
        r: 3,
        symm: SYMM_ROT2,
        diff: DIFF_SIMPLE,
        kdiff: DIFF_KMINMAX,
        xtype: true,
        killer: false,
      },
      {
        c: 9,
        r: 1,
        symm: SYMM_ROT2,
        diff: DIFF_SET,
        kdiff: DIFF_KMINMAX,
        xtype: false,
        killer: false,
      },
      {
        c: 3,
        r: 3,
        symm: SYMM_NONE,
        diff: DIFF_BLOCK,
        kdiff: DIFF_KINTERSECT,
        xtype: false,
        killer: true,
      },
      {
        c: 3,
        r: 3,
        symm: SYMM_REF4D,
        diff: DIFF_RECURSIVE,
        kdiff: DIFF_KMINMAX,
        xtype: false,
        killer: false,
      },
    ];
    for (const p of cases) {
      const decoded = decodeParams(encodeParams(p, true));
      expect(paramsEqual(decoded, p), `round-trip ${encodeParams(p, true)}`).toBe(true);
    }
  });

  it("encodes the documented variant strings", () => {
    const base = defaultParams();
    expect(encodeParams({ ...base, c: 3, r: 3 }, false)).toBe("3x3");
    expect(encodeParams({ ...base, c: 9, r: 1 }, false)).toBe("9j");
    expect(encodeParams({ ...base, c: 3, r: 3, xtype: true }, false)).toBe("3x3x");
    expect(encodeParams({ ...base, c: 3, r: 3, killer: true }, false)).toBe("3x3k");
    // full mode adds symmetry + difficulty (ROT2 / BLOCK are the omitted defaults)
    expect(
      encodeParams({ ...base, c: 3, r: 3, symm: SYMM_NONE, diff: DIFF_SET }, true),
    ).toBe("3x3ada");
  });

  it("decodes the legacy jigsaw-of-a-rectangle form", () => {
    // "3x3j" collapses a former 3x3 rectangle into a jigsaw of edge 9.
    const p = decodeParams("3x3j");
    expect(p.c).toBe(9);
    expect(p.r).toBe(1);
  });

  it("rejects out-of-range params", () => {
    const valid = (p: SoloParams) => paramsError(soloGame, p, true);
    expect(valid({ ...defaultParams(), c: 1 })).toBe(
      "Columns of sub-blocks must be at least 2",
    );
    expect(valid({ ...defaultParams(), c: 6, r: 6 })).not.toBeNull(); // 36 > 31
    expect(valid({ ...defaultParams(), c: 4, r: 3, killer: true })).not.toBeNull(); // killer 12 > 9
    expect(valid(defaultParams())).toBeNull();
  });

  it("titles presets by size, mode and tier", () => {
    const titles = presetMenu(soloGame).submenu?.map((m) => m.title);
    expect(titles).toContain("3x3 X Normal");
    expect(titles).toContain("9 Jigsaw X Normal");
    expect(titles).toContain("3x3 Killer Easy");
  });

  it("names symmetry only when it is not the mode's default", () => {
    const p = defaultParams();
    expect(describeParams(soloGame, { ...p, symm: SYMM_ROT2 })).not.toContain(",");
    expect(describeParams(soloGame, { ...p, symm: SYMM_NONE })).toMatch(
      /, no symmetry$/,
    );
    expect(describeParams(soloGame, { ...p, symm: SYMM_REF4D })).toMatch(
      /, 4-way diagonal mirror$/,
    );
    const killer = { ...p, c: 3, r: 3, killer: true };
    expect(describeParams(soloGame, { ...killer, symm: SYMM_NONE })).not.toContain(",");
    expect(describeParams(soloGame, { ...killer, symm: SYMM_ROT2 })).toMatch(
      /, 2-way rotation$/,
    );
  });
});

const STANDARD: SoloParams = {
  c: 3,
  r: 3,
  symm: SYMM_ROT2,
  diff: DIFF_SIMPLE,
  kdiff: DIFF_KMINMAX,
  xtype: false,
  killer: false,
};
const KILLER: SoloParams = { ...STANDARD, symm: SYMM_NONE, killer: true };

/** The same partition, whatever the blocks' numbering. */
function expectSamePartition(a: Int32Array, b: Int32Array): void {
  for (let i = 0; i < a.length; i++)
    for (let j = i + 1; j < a.length; j++)
      expect(a[i] === a[j], `${i},${j}`).toBe(b[i] === b[j]);
}

describe("solo grid codec", () => {
  it("round-trips a grid through encodeGrid and newState", () => {
    const area = 81;
    const grid = new Int8Array(area);
    // a scattering of givens, incl. the top-left and bottom-right corners
    grid[0] = 5;
    grid[1] = 9;
    grid[40] = 1;
    grid[80] = 7;
    grid[79] = 3;
    const st = newState(STANDARD, encodeGrid(grid, area));
    expect(Array.from(st.grid)).toEqual(Array.from(grid));
  });

  it("refuses what encodeGrid never writes, by what went wrong", () => {
    const blanks = "z".repeat(3); // 78 blanks
    expect(validateDesc(STANDARD, `${blanks}a1_2`)).toBeNull();
    expect(validateDesc(STANDARD, `${blanks}a1_2_`)).toBe(DESC_TOO_LONG);
    expect(validateDesc(STANDARD, `_${blanks}1_2`)).toBe(descBadCharacter("_"));
    expect(validateDesc(STANDARD, `${blanks}1_a2`)).toBe(descBadCharacter("a"));
    expect(validateDesc(STANDARD, `${blanks}ab`)).toBe(descBadCharacter("b"));
    expect(validateDesc(STANDARD, `${blanks}a1_0`)).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(STANDARD, `${blanks}a1_10`)).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(STANDARD, `${blanks}a1`)).toBe(DESC_TOO_SHORT);
    expect(validateDesc(STANDARD, `${blanks}d`)).toBe(DESC_TOO_LONG);
  });
});

describe("solo block-structure codec", () => {
  it("round-trips a jigsaw's blocks through encodeBlockStructureDesc and newState", () => {
    const p: SoloParams = { ...STANDARD, c: 9, r: 1 };
    const orig = rectangularBlocks(3, 3); // any cr-region partition
    const desc = `${encodeGrid(new Int8Array(81), 81)},${encodeBlockStructureDesc(9, orig)}`;
    expectSamePartition(orig.whichblock, newState(p, desc).blocks.whichblock);
  });

  it("reads 'z' as the 25 non-edges the encoder writes it for", () => {
    // Full-row cages: all 72 horizontal neighbors share a cage, a run long
    // enough to be written with 'z'.
    const whichblock = new Int32Array(81);
    for (let i = 0; i < 81; i++) whichblock[i] = Math.floor(i / 9);
    const rows = makeBlocksFromWhichblock(9, 9, whichblock);
    const blocks = encodeBlockStructureDesc(9, rows);
    expect(blocks).toContain("z");
    const kgrid = new Int32Array(81);
    for (let y = 0; y < 9; y++) kgrid[y * 9] = 45;
    const desc = `${encodeGrid(new Int8Array(81), 81)},${blocks},${encodeGrid(kgrid, 81)}`;
    expect(validateDesc(KILLER, desc)).toBeNull();
    expectSamePartition(
      whichblock,
      newState(KILLER, desc).killerData?.kblocks.whichblock ?? new Int32Array(81),
    );
  });

  it("refuses a section cut short, run on, or of the wrong blocks", () => {
    const p: SoloParams = { ...STANDARD, c: 9, r: 1 };
    const grid = encodeGrid(new Int8Array(81), 81);
    const blocks = encodeBlockStructureDesc(9, rectangularBlocks(3, 3));
    expect(validateDesc(p, `${grid},${blocks}`)).toBeNull();
    expect(validateDesc(p, grid)).toBe(DESC_TOO_SHORT);
    expect(validateDesc(p, `${grid},${blocks.slice(0, -1)}`)).toBe(DESC_TOO_SHORT);
    expect(validateDesc(p, `${grid},${blocks}_`)).toBe(DESC_TOO_LONG);
    expect(validateDesc(p, `${grid},${blocks},`)).toBe(DESC_TOO_LONG);
    const oneBlock = encodeBlockStructureDesc(
      9,
      makeBlocksFromWhichblock(9, 1, new Int32Array(81)),
    );
    expect(validateDesc(p, `${grid},${oneBlock}`)).toMatch(/blocks or cages/);
  });

  it("bounds a cage sum by the most its digits can add to", () => {
    const kblocks = rectangularBlocks(3, 3);
    const kgrid = new Int32Array(81);
    for (const cells of kblocks.blocks) kgrid[cells[0]] = 45;
    const head = `${encodeGrid(new Int8Array(81), 81)},${encodeBlockStructureDesc(9, kblocks)}`;
    expect(validateDesc(KILLER, `${head},${encodeGrid(kgrid, 81)}`)).toBeNull();
    kgrid[0] = 46;
    expect(validateDesc(KILLER, `${head},${encodeGrid(kgrid, 81)}`)).toBe(
      DESC_OUT_OF_RANGE,
    );
  });
});

describe("solo desc assembly (validateDesc + newState)", () => {
  it("validates and rebuilds a standard board (givens only)", () => {
    const p: SoloParams = {
      c: 3,
      r: 3,
      symm: SYMM_ROT2,
      diff: DIFF_SIMPLE,
      kdiff: DIFF_KMINMAX,
      xtype: false,
      killer: false,
    };
    const area = 81;
    const grid = new Int8Array(area);
    grid[0] = 5;
    grid[10] = 8;
    grid[80] = 2;
    const desc = encodeGrid(grid, area);
    expect(validateDesc(p, desc)).toBeNull();
    const st = newState(p, desc);
    expect(Array.from(st.grid)).toEqual(Array.from(grid));
    expect(st.immutable[0]).toBe(1);
    expect(st.immutable[1]).toBe(0);
    expect(st.blocks.nrBlocks).toBe(9);
  });

  it("validates and rebuilds a jigsaw board (grid + block structure)", () => {
    const p: SoloParams = {
      c: 9,
      r: 1,
      symm: SYMM_ROT2,
      diff: DIFF_SET,
      kdiff: DIFF_KMINMAX,
      xtype: false,
      killer: false,
    };
    const cr = 9;
    const area = cr * cr;
    const grid = new Int8Array(area);
    grid[0] = 4;
    const blocks = rectangularBlocks(3, 3); // a valid 9×9-of-9 partition
    const desc = `${encodeGrid(grid, area)},${encodeBlockStructureDesc(cr, blocks)}`;
    expect(validateDesc(p, desc)).toBeNull();
    const st = newState(p, desc);
    expect(st.blocks.nrBlocks).toBe(9);
    // partition preserved
    for (let i = 0; i < area; i++)
      for (let j = i + 1; j < area; j++)
        expect(blocks.whichblock[i] === blocks.whichblock[j]).toBe(
          st.blocks.whichblock[i] === st.blocks.whichblock[j],
        );
  });

  it("validates and rebuilds a killer board (grid + cages + sums)", () => {
    const p: SoloParams = {
      c: 3,
      r: 3,
      symm: SYMM_NONE,
      diff: DIFF_BLOCK,
      kdiff: DIFF_KINTERSECT,
      xtype: false,
      killer: true,
    };
    const cr = 9;
    const area = cr * cr;
    const grid = new Int8Array(area); // killer puzzles ship no givens
    // Cages: compact 3×3 blocks (size 9 = cr, the max).
    const kblocks = rectangularBlocks(3, 3);
    const kgrid = new Int32Array(area);
    for (let b = 0; b < kblocks.nrBlocks; b++) kgrid[kblocks.blocks[b][0]] = 45; // sum 1..9
    const desc = `${encodeGrid(grid, area)},${encodeBlockStructureDesc(cr, kblocks)},${encodeGrid(kgrid, area)}`;
    expect(validateDesc(p, desc)).toBeNull();
    const st = newState(p, desc);
    expect(st.killerData).not.toBeNull();
    expect(st.killerData?.kblocks.nrBlocks).toBe(9);
    // every cage carries its recorded sum at exactly one cell
    let clued = 0;
    for (let i = 0; i < area; i++) if (st.killerData?.kgrid[i] === 45) clued++;
    expect(clued).toBe(9);
  });
});

describe("solo completion check", () => {
  it("accepts a full valid standard grid and rejects a broken one", () => {
    const cr = 9;
    const area = cr * cr;
    const blocks = rectangularBlocks(3, 3);
    // a known-valid 9×9 sudoku solution (base pattern)
    const grid = new Int8Array(area);
    for (let y = 0; y < cr; y++)
      for (let x = 0; x < cr; x++)
        grid[y * cr + x] = (((y % 3) * 3 + ((y / 3) | 0) + x) % 9) + 1;
    expect(checkValid(cr, blocks, null, false, grid)).toBe(true);
    // swap two cells in a row to break it
    const broken = grid.slice();
    broken[0] = broken[1];
    expect(checkValid(cr, blocks, null, false, broken)).toBe(false);
  });
});
