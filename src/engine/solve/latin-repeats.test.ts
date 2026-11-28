/**
 * The Latin library on a **repeated symbol**: the last symbol may appear
 * `times` times per line, which is what a pseudo-Latin puzzle — Salad's empty
 * square — needs expressed in the marks rather than faked with a full square
 * whose surplus symbols are reinterpreted as holes.
 *
 * With a repeat declared each deduction reasons about the repeated symbol with
 * its multiplicity: placed when exactly `times` cells remain for it, struck
 * from a line only once the line holds all of it, and handled by set
 * elimination with its weight.
 */
import { describe, expect, it } from "vitest";
import { CellMarks } from "./cell-marks.ts";
import { latinSpace } from "./describe-runtime.ts";
import { LATIN_LIBRARY, LATIN_RUNGS } from "./latin.ts";

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

/** Marks on an order-5 board whose hole repeats, seeded from `grid`, the
 * library's `placed` run as each value is placed. */
function marks(grid = new Uint8Array(O * O)): { s: CellMarks; seeded: boolean } {
  const s = new CellMarks(latinSpace(O), 0b11110, grid, { value: HOLE, times: TIMES });
  s.placing = [LATIN_LIBRARY.placing["latin.placed"]];
  return { s, seeded: s.seed(grid) };
}

/** Whether `(x, y)` may still hold `n`. */
const can = (s: CellMarks, x: number, y: number, n: number): boolean =>
  s.has(y * O + x, n);

describe("the marks with a repeated symbol", () => {
  it("placing the repeated symbol once leaves the rest of its line open; the times-th placement strikes it", () => {
    const { s } = marks();
    s.place(0, HOLE);
    // Still possible elsewhere in row 0 and column 0 — the line has room for one more.
    expect(can(s, 1, 0, HOLE)).toBe(true);
    expect(can(s, 0, 1, HOLE)).toBe(true);
    // ...and every other symbol is gone from the placed cell.
    for (let n = 1; n < HOLE; n++) expect(can(s, 0, 0, n)).toBe(false);

    s.place(1, HOLE);
    // Row 0 now holds both of its holes: none of the other three cells can be one.
    for (let x = 2; x < O; x++) expect(can(s, x, 0, HOLE)).toBe(false);
    // Column 1 holds one hole and column 0 one: both still open below.
    expect(can(s, 0, 1, HOLE)).toBe(true);
    expect(can(s, 1, 1, HOLE)).toBe(true);
  });

  it("an ordinary symbol still strikes its line on a single placement", () => {
    const { s } = marks();
    s.place(2 * O + 2, 1);
    let struck = 0;
    for (let i = 0; i < O; i++) {
      if (i !== 2) {
        expect(can(s, i, 2, 1)).toBe(false);
        expect(can(s, 2, i, 1)).toBe(false);
        struck++;
      }
    }
    expect(struck).toBe(O - 1);
  });

  it("the hidden single places the repeated symbol when exactly `times` cells can take it", () => {
    const grid = new Uint8Array(O * O);
    // Row 0: symbols 1, 2, 3 placed in the first three cells; the last two
    // cells must be the holes.
    grid[0] = 1;
    grid[1] = 2;
    grid[2] = 3;
    const { s, seeded } = marks(grid);
    expect(seeded).toBe(true);
    expect(LATIN_RUNGS["latin.hiddenSingle"](s)).toBe(1);
    expect(grid[3]).toBe(HOLE);
    expect(grid[4]).toBe(HOLE);
  });

  it("a line with fewer possible cells than its multiplicity is a contradiction", () => {
    const { s } = marks();
    // Rule the hole out of four of row 0's five cells: only one place for two.
    for (let x = 0; x < 4; x++) s.strikeAt(x, HOLE);
    expect(LATIN_RUNGS["latin.hiddenSingle"](s)).toBe(-1);
  });

  it("set elimination weighs the repeated symbol by its multiplicity", () => {
    // Row 0: cells 0, 1 and 2 can hold only 1 or the hole, three cells for its
    // three copies (one 1, two holes), so neither goes anywhere else in the
    // row; read the other way, 2 and 3 have only cells 3 and 4 left.
    const { s } = marks();
    for (const x of [0, 1, 2]) for (const n of [2, 3]) s.strikeAt(x, n);
    expect(LATIN_RUNGS["latin.set"](s)).toBe(1);
    for (const x of [3, 4]) {
      expect(can(s, x, 0, 1)).toBe(false);
      expect(can(s, x, 0, HOLE)).toBe(false);
    }
    for (const x of [0, 1, 2]) expect(can(s, x, 0, HOLE)).toBe(true);
  });

  it("a naked pair that ignores the hole's second copy is not a set", () => {
    // Cells 0 and 1 can hold only 1 or the hole: two cells, but three copies
    // left between those values, so another cell of the row still holds one.
    const { s } = marks();
    for (const x of [0, 1]) for (const n of [2, 3]) s.strikeAt(x, n);
    const before = s.snapshot();
    expect(LATIN_RUNGS["latin.set"](s)).toBe(0);
    expect([...s.cands]).toEqual([...before]);
  });
});

describe("deducing a pseudo-Latin board", () => {
  it("finishes a well-clued board by the library alone, holes included", () => {
    // Keep every real symbol and no hole: the holes fall out per line.
    const grid = SOLUTION.map((v) => (v === HOLE ? 0 : v));
    const { s, seeded } = marks(grid);
    expect(seeded).toBe(true);
    const rungs = Object.values(LATIN_RUNGS);
    while (rungs.some((run) => run(s) > 0));
    expect([...grid]).toEqual([...SOLUTION]);
  });

  it("a hole given three times in a line is a contradiction, not silently accepted", () => {
    // Seeding takes all three, as `placed` strikes only cells still open; the
    // set elimination counts the row's copies, and finds one too many.
    const grid = new Uint8Array(O * O);
    grid[0] = HOLE;
    grid[1] = HOLE;
    grid[2] = HOLE;
    const { s } = marks(grid);
    expect(LATIN_RUNGS["latin.set"](s)).toBe(-1);
  });
});
