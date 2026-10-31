/**
 * The Latin cube's **repeated symbol**: the last
 * symbol may appear `times` times per line, which is what a pseudo-Latin puzzle
 * — Salad's empty square — needs expressed *in the cube* rather than faked with
 * a full square whose surplus symbols are reinterpreted as holes.
 *
 * Two families of guarantee: that the extension is **inert** when not declared
 * (the shape every Latin-square game relies on, and which their byte-match
 * differentials pin from the outside), and that with a repeat declared each
 * deduction reasons about the repeated symbol with its multiplicity — placed
 * when exactly `times` cells remain for it, struck from a line only once the
 * line holds all of it, handled by set elimination with its weight, and never
 * used as a forcing-chain link.
 */
import { describe, expect, it } from "vitest";
import {
  DIFF_AMBIGUOUS,
  DIFF_IMPOSSIBLE,
  DIFF_UNFINISHED,
  LATIN_RUNGS,
  LatinSolver,
  type LatinSolverConfig,
  latinSolver,
} from "./latin.ts";

/** Order 5, symbols 1..3 once per line and the hole (4) twice — Salad's 5×5 n3. */
const O = 5;
const TIMES = 2;
const HOLE = O - TIMES + 1; // 4

/** A solution: rows of the cyclic square on 1..5 with 4 and 5 both read as the hole. */
const SOLUTION = Uint8Array.from(
  [
    [1, 2, 3, 5, 4],
    [2, 3, 4, 1, 5],
    [3, 5, 1, 4, 2],
    [4, 1, 5, 2, 3],
    [5, 4, 2, 3, 1],
  ]
    .flat()
    .map((v) => (v > 3 ? HOLE : v)),
);

/** The library's singles at 1, its set at 2, its fish and wing at 3, and the
 * search at 4. */
function cfg(maxdiff: number, repeats = true): LatinSolverConfig<null> {
  return {
    repeats: repeats ? { times: TIMES } : undefined,
    maxdiff,
    ladder: [
      { tier: 1, run: LATIN_RUNGS["latin.hiddenSingle"] },
      { tier: 1, run: LATIN_RUNGS["latin.single"] },
      { tier: 2, run: LATIN_RUNGS["latin.set"] },
      { tier: 3, run: LATIN_RUNGS["latin.fish"] },
      { tier: 3, run: LATIN_RUNGS["latin.wing"] },
    ],
    diffRecursive: 4,
    valid: null,
    ctx: null,
  };
}

describe("a repeated symbol is inert when not declared", () => {
  it("keeps the C's shape: o symbols, no repeat, stride o", () => {
    const s = new LatinSolver(4);
    expect(s.symbols).toBe(4);
    expect(s.repeat).toBe(0);
    expect(s.times).toBe(1);
    expect(s.cube.length).toBe(64);
    for (let x = 0; x < 4; x++)
      for (let y = 0; y < 4; y++)
        for (let n = 1; n <= 4; n++)
          expect(s.cubepos(x, y, n)).toBe((x * 4 + y) * 4 + n - 1);
  });

  it("refuses a multiplicity outside 2..o", () => {
    expect(() => new LatinSolver(4, { times: 1 })).toThrow(/2\.\.4/);
    expect(() => new LatinSolver(4, { times: 5 })).toThrow(/2\.\.4/);
  });
});

describe("the cube with a repeated symbol", () => {
  it("has o − times + 1 symbols, the last of them repeating", () => {
    const s = new LatinSolver(O, { times: TIMES });
    expect(s.symbols).toBe(4);
    expect(s.repeat).toBe(HOLE);
    expect(s.times).toBe(TIMES);
    expect(s.cube.length).toBe(O * O * 4);
    expect(s.multiplicity(1)).toBe(1);
    expect(s.multiplicity(HOLE)).toBe(TIMES);
  });

  it("placing the repeated symbol once leaves the rest of its line open; the times-th placement strikes it", () => {
    const s = new LatinSolver(O, { times: TIMES });
    s.alloc(new Uint8Array(O * O));
    s.place(0, 0, HOLE);
    // Still possible elsewhere in row 0 and column 0 — the line has room for one more.
    expect(s.cubeGet(1, 0, HOLE)).toBe(true);
    expect(s.cubeGet(0, 1, HOLE)).toBe(true);
    // ...and every other symbol is gone from the placed cell.
    for (let n = 1; n < HOLE; n++) expect(s.cubeGet(0, 0, n)).toBe(false);

    s.place(1, 0, HOLE);
    // Row 0 now holds both of its holes: none of the other three cells can be one.
    for (let x = 2; x < O; x++) expect(s.cubeGet(x, 0, HOLE)).toBe(false);
    // Column 1 holds one hole and column 0 one: both still open below.
    expect(s.cubeGet(0, 1, HOLE)).toBe(true);
    expect(s.cubeGet(1, 1, HOLE)).toBe(true);
  });

  it("an ordinary symbol still strikes its line on a single placement", () => {
    const s = new LatinSolver(O, { times: TIMES });
    s.alloc(new Uint8Array(O * O));
    s.place(2, 2, 1);
    let struck = 0;
    for (let i = 0; i < O; i++) {
      if (i !== 2) {
        expect(s.cubeGet(i, 2, 1)).toBe(false);
        expect(s.cubeGet(2, i, 1)).toBe(false);
        struck++;
      }
    }
    expect(struck).toBe(O - 1);
  });

  it("the hidden single places the repeated symbol when exactly `times` cells can take it", () => {
    const s = new LatinSolver(O, { times: TIMES });
    const grid = new Uint8Array(O * O);
    // Row 0: symbols 1, 2, 3 placed in the first three cells; the last two
    // cells must be the holes.
    grid[0] = 1;
    grid[1] = 2;
    grid[2] = 3;
    expect(s.alloc(grid)).toBe(true);
    expect(LATIN_RUNGS["latin.hiddenSingle"](s)).toBe(1);
    expect(grid[3]).toBe(HOLE);
    expect(grid[4]).toBe(HOLE);
  });

  it("a line with fewer possible cells than its multiplicity is a contradiction", () => {
    const s = new LatinSolver(O, { times: TIMES });
    s.alloc(new Uint8Array(O * O));
    // Rule the hole out of four of row 0's five cells: only one place for two.
    for (let x = 0; x < 4; x++) s.cube[s.cubepos(x, 0, HOLE)] = 0;
    expect(LATIN_RUNGS["latin.hiddenSingle"](s)).toBe(-1);
  });

  it("set elimination weighs the repeated symbol by its multiplicity", () => {
    // Row 0: cells 0, 1 and 2 can hold only 1 or the hole, three cells for its
    // three copies (one 1, two holes), so neither goes anywhere else in the
    // row; read the other way, 2 and 3 have only cells 3 and 4 left.
    const s = new LatinSolver(O, { times: TIMES });
    s.alloc(new Uint8Array(O * O));
    for (const x of [0, 1, 2]) for (const n of [2, 3]) s.cube[s.cubepos(x, 0, n)] = 0;
    expect(LATIN_RUNGS["latin.set"](s)).toBe(1);
    for (const x of [3, 4]) {
      expect(s.cubeGet(x, 0, 1)).toBe(false);
      expect(s.cubeGet(x, 0, HOLE)).toBe(false);
    }
    for (const x of [0, 1, 2]) expect(s.cubeGet(x, 0, HOLE)).toBe(true);
  });

  it("a naked pair that ignores the hole's second copy is not a set", () => {
    // Cells 0 and 1 can hold only 1 or the hole: two cells, but three copies
    // left between those values, so another cell of the row still holds one.
    const s = new LatinSolver(O, { times: TIMES });
    s.alloc(new Uint8Array(O * O));
    for (const x of [0, 1]) for (const n of [2, 3]) s.cube[s.cubepos(x, 0, n)] = 0;
    const before = s.cube.slice();
    expect(LATIN_RUNGS["latin.set"](s)).toBe(0);
    expect([...s.cube]).toEqual([...before]);
  });

  it("a forcing chain never starts from or runs through the repeated symbol", () => {
    // Two cells with candidates {1, HOLE} in the same row: a chain from one
    // through the other would conclude 1 is impossible somewhere — but the
    // link "this cell is the hole, so its neighbor cannot be" is false.
    const s = new LatinSolver(O, { times: TIMES });
    s.alloc(new Uint8Array(O * O));
    for (const x of [0, 1]) for (const n of [2, 3]) s.cube[s.cubepos(x, 0, n)] = 0;
    // Give the chain somewhere to go if it (wrongly) linked through the hole.
    for (const n of [2, 3]) s.cube[s.cubepos(0, 1, n)] = 0;
    const before = s.cube.slice();
    expect(s.forcing()).toBe(0);
    expect([...s.cube]).toEqual([...before]);
  });
});

describe("solving a pseudo-Latin puzzle in the cube", () => {
  /** The solution with every cell not in `keep` blanked. */
  function puzzle(keep: (i: number) => boolean): Uint8Array {
    return SOLUTION.map((v, i) => (keep(i) ? v : 0));
  }

  it("finishes a well-clued board by deduction alone, holes included", () => {
    // Keep every real symbol and no hole: the holes fall out per line.
    const grid = puzzle((i) => SOLUTION[i] !== HOLE);
    const ret = latinSolver(grid, O, cfg(3));
    expect(ret).not.toBe(DIFF_IMPOSSIBLE);
    expect(ret).not.toBe(DIFF_UNFINISHED);
    expect([...grid]).toEqual([...SOLUTION]);
  });

  it("reports a board with several completions as ambiguous under recursion", () => {
    const grid = new Uint8Array(O * O);
    expect(latinSolver(grid, O, cfg(4))).toBe(DIFF_AMBIGUOUS);
  });

  it("reports contradictory givens as impossible", () => {
    const grid = new Uint8Array(O * O);
    grid[0] = 1;
    grid[1] = 1;
    expect(latinSolver(grid, O, cfg(3))).toBe(DIFF_IMPOSSIBLE);
  });

  it("a hole given three times in a line is impossible, not silently accepted", () => {
    const grid = new Uint8Array(O * O);
    grid[0] = HOLE;
    grid[1] = HOLE;
    grid[2] = HOLE;
    expect(latinSolver(grid, O, cfg(3))).toBe(DIFF_IMPOSSIBLE);
  });

  it("recursion completes what deduction cannot, and the result is a valid pseudo-Latin square", () => {
    // Keep a scatter of clues; whatever deduction leaves, the recursive tier
    // must either finish with each line holding 1..3 once and two holes, or
    // report that more than one completion exists — never a broken grid.
    const grid = puzzle((i) => i % 3 === 0);
    const ret = latinSolver(grid, O, cfg(4));
    expect(ret).not.toBe(DIFF_IMPOSSIBLE);
    expect(ret).not.toBe(DIFF_UNFINISHED);
    if (ret === DIFF_AMBIGUOUS) return;
    for (let y = 0; y < O; y++) {
      const row = [...grid.slice(y * O, y * O + O)].sort();
      const col = [];
      for (let x = 0; x < O; x++) col.push(grid[x * O + y]);
      col.sort();
      expect(row).toEqual([1, 2, 3, HOLE, HOLE]);
      expect(col).toEqual([1, 2, 3, HOLE, HOLE]);
    }
  });
});
