/**
 * Tests for the Latin library and generator (`engine/solve/latin.ts`).
 *
 * The Latin family sits on the library's techniques. Tested only end to end
 * through a game, a defect planted in one of them surfaces, if at all, as a
 * board that misbehaves rather than as the deduction that broke.
 *
 * So the blocks below assert each deduction **directly**, in the vocabulary of
 * the technique it implements: the hidden single places on a last remaining
 * position and reports a contradiction on none, `set` refuses three cells
 * sharing two digits, the wing strikes what no set can. That is the same
 * reasoning a hint narrates, which is why the tests read as sentences about
 * Latin squares rather than as pokes at an array.
 *
 * ## What deliberately goes unasserted
 *
 * The **RNG draw order** through `matching` — the `shuffle(Lorder)` per BFS
 * pass and the in-place adjacency swap during the DFS — decides *which boards
 * exist*, not whether the matching is correct, and which board a seed deals is
 * free to change. A matching's cardinality is order-independent, so every
 * assertion below is blind to it by construction: disabling the DFS adjacency
 * swap (`if (rs && adjsizes[L] - j > 1)` → `false`) leaves every test in this
 * file green. Do not add a test here that pins a particular matching; it would
 * break on any deliberate generator change while proving nothing a player
 * relies on.
 */
import { describe, expect, it } from "vitest";
import { randomNew, randomUpto } from "../random/index.ts";
import { CellMarks } from "./cell-marks.ts";
import type { DeductionRecord } from "./deduction-record.ts";
import { latinSpace } from "./describe-runtime.ts";
import {
  LATIN_LIBRARY,
  LATIN_RUNGS,
  latinGenerate,
  latinGenerateRect,
  matching,
} from "./latin.ts";

function isLatin(grid: Uint8Array, o: number): boolean {
  for (let i = 0; i < o; i++) {
    const rowSeen = new Set<number>();
    const colSeen = new Set<number>();
    for (let j = 0; j < o; j++) {
      rowSeen.add(grid[i * o + j]);
      colSeen.add(grid[j * o + i]);
    }
    if (rowSeen.size !== o || colSeen.size !== o) return false;
    if (rowSeen.has(0) || colSeen.has(0)) return false;
  }
  return true;
}

/** Marks on a blank `o × o` Latin square, the library's `placed` run as each
 * value is placed: every digit possible in every cell. */
function blank(o: number): CellMarks {
  const s = new CellMarks(
    latinSpace(o),
    ((1 << (o + 1)) - 1) & ~1,
    new Uint8Array(o * o),
  );
  s.placing = [LATIN_LIBRARY.placing["latin.placed"]];
  expect(s.seed(s.grid)).toBe(true);
  return s;
}

/** Whether `(x, y)` of an `o`-wide board may still hold `n`. */
const can = (s: CellMarks, x: number, y: number, n: number): boolean =>
  s.has(y * s.sp.w + x, n);

/** Restrict `(x, y)` to exactly `digits`. */
function only(s: CellMarks, x: number, y: number, digits: number[]): void {
  for (let n = 1; n <= s.sp.w; n++) {
    if (!digits.includes(n)) s.strikeAt(y * s.sp.w + x, n);
  }
}

/**
 * The deductions, each against the rule it implements. Fresh marks over an
 * all-blank grid start with every digit possible everywhere, so a test states
 * its situation by ruling candidates *out* — which is what the deductions
 * themselves manipulate.
 */
describe("latin deductions", () => {
  it("placing a digit rules it out of the rest of its row and column", () => {
    // The whole of `placed`'s job, and the one deduction every other rests on.
    // Row *and* column: a test that checked only one would let the other go.
    const s = blank(4);
    s.place(2 * 4 + 1, 3);

    expect(s.grid[2 * 4 + 1]).toBe(3);
    for (let n = 1; n <= 4; n++) expect(can(s, 1, 2, n)).toBe(n === 3);
    for (let y = 0; y < 4; y++) if (y !== 2) expect(can(s, 1, y, 3)).toBe(false);
    for (let x = 0; x < 4; x++) if (x !== 1) expect(can(s, x, 2, 3)).toBe(false);

    // ...and nothing beyond that cross was touched: a cell sharing neither
    // line keeps every digit, including the one just placed elsewhere.
    for (let n = 1; n <= 4; n++) expect(can(s, 0, 0, n)).toBe(true);
  });

  it("two givens that clash leave no seeding", () => {
    // Digit 2 twice in column 0: the second given's cell has lost it.
    const s = blank(4);
    const clash = new Uint8Array(16);
    clash[0] = 2;
    clash[4] = 2;
    expect(s.seed(clash)).toBe(false);
  });

  it("the hidden single places only on the *last* remaining position", () => {
    // The line between deduction and guessing. Two positions left for digit 1
    // in row 0 means the row is not decided yet, and placing one would be a
    // guess dressed as a deduction.
    const s = blank(4);
    const hiddenSingle = LATIN_RUNGS["latin.hiddenSingle"];

    s.strikeAt(2, 1);
    s.strikeAt(3, 1);
    expect(hiddenSingle(s)).toBe(0); // two positions left for digit 1 — no progress
    expect(s.grid[0]).toBe(0);

    s.strikeAt(1, 1);
    expect(hiddenSingle(s)).toBe(1); // one left — placed
    expect(s.grid[0]).toBe(1);
  });

  it("the hidden single reports a contradiction when a digit has nowhere left to go", () => {
    // The negative half of the same sweep, and the one that decides whether an
    // unsolvable board is *reported* unsolvable or silently graded.
    const s = blank(4);
    for (let x = 0; x < 4; x++) s.strikeAt(x, 1);
    expect(LATIN_RUNGS["latin.hiddenSingle"](s)).toBe(-1);
  });

  it("set elimination rejects three cells that share only two digits", () => {
    // Naked subsets, in the direction that proves impossibility: three cells
    // in a row restricted to {1,2} cannot all be filled, so `set` must report
    // a contradiction rather than eliminate something and carry on.
    const s = blank(4);
    for (const x of [0, 1, 2]) only(s, x, 0, [1, 2]);
    only(s, 3, 0, [3, 4]);
    expect(LATIN_RUNGS["latin.set"](s)).toBe(-1);
  });

  // A value confined across lines is two facts, and the solver's search finds
  // either through the other; the recorded reason names the fewer lines.
  it.each([
    ["col", (a: number, b: number) => ({ x: a, y: b })],
    ["row", (a: number, b: number) => ({ x: b, y: a })],
  ] as const)("a value confined across lines is recorded with the fewer lines: %s", (axis, at) => {
    // 1 fits lines 0 and 1 only where they cross lines 0 and 1 the other way.
    const s = blank(5);
    for (const a of [0, 1])
      for (const b of [2, 3, 4]) {
        const c = at(a, b);
        s.strikeAt(c.y * 5 + c.x, 1);
      }
    const recorded: DeductionRecord[] = [];
    s.recorder = (r) => recorded.push(r);
    expect(LATIN_RUNGS["latin.fish"](s)).toBe(1);
    const reason = recorded[0].reason as {
      cells: { x: number; y: number }[];
      lines: { axis: string; count: number; cells: { x: number; y: number }[] };
    };
    expect(reason.lines.axis).toBe(axis);
    expect(reason.lines.count).toBe(2);
    expect(reason.lines.cells).toHaveLength(10);
    const key = (c: { x: number; y: number }) => `${c.x},${c.y}`;
    expect(reason.cells.map(key).sort()).toEqual(
      [at(0, 0), at(0, 1), at(1, 0), at(1, 1)].map(key).sort(),
    );
    // Struck from the rest of the two lines the cells use up.
    const struck = recorded.map((r) => key(r as unknown as { x: number; y: number }));
    expect(struck.sort()).toEqual(
      [2, 3, 4].flatMap((a) => [key(at(a, 0)), key(at(a, 1))]).sort(),
    );
  });

  it("the wing strikes what no set elimination can", () => {
    // (1,0) is 2 or 3; if 2, (0,0) in its row is 1, and if 3, (1,1) in its
    // column is 1. Either way (0,1), in line with both, cannot be 1, and no
    // line holds a set to say so.
    const s = blank(4);
    only(s, 0, 0, [1, 2]);
    only(s, 1, 0, [2, 3]);
    only(s, 1, 1, [1, 3]);
    while (LATIN_RUNGS["latin.set"](s) > 0);
    expect(can(s, 0, 1, 1)).toBe(true);
    while (can(s, 0, 1, 1) && LATIN_RUNGS["latin.wing"](s) > 0);
    expect(can(s, 0, 1, 1)).toBe(false);
  });
});

describe("latin generator", () => {
  it("produces a valid Latin square", () => {
    const o = 6;
    const sq = latinGenerate(o, randomNew("latin-gen"));
    expect(
      isLatin(
        Uint8Array.from(sq, (v) => v),
        o,
      ),
    ).toBe(true);
  });

  it.each([
    [6, 3],
    [3, 6],
    [5, 5],
    [7, 2],
  ])("crops a %ix%i rectangle from the max(w,h) square", (w, h) => {
    // The square is `max(w, h)` on a side and the rectangle is a corner of it,
    // so every row holds w distinct values from 1..max and every column h. Get
    // the square's size wrong and the crop reads past its end, which shows up
    // as zeroes rather than as an exception.
    const o = Math.max(w, h);
    const rect = latinGenerateRect(w, h, randomNew(`rect-${w}x${h}`));
    expect(rect.length).toBe(w * h);
    for (const v of rect) expect(v).toBeGreaterThanOrEqual(1);
    for (const v of rect) expect(v).toBeLessThanOrEqual(o);
    for (let y = 0; y < h; y++) {
      const row = new Set<number>();
      for (let x = 0; x < w; x++) row.add(rect[y * w + x]);
      expect(row.size).toBe(w);
    }
    for (let x = 0; x < w; x++) {
      const col = new Set<number>();
      for (let y = 0; y < h; y++) col.add(rect[y * w + x]);
      expect(col.size).toBe(h);
    }
  });
});

/**
 * `matching` is the bipartite matcher `latinGenerate` builds each row with, and
 * it is exported and used directly (Tents' completion check runs it with no
 * `rs`). Its *cardinality* is the guarantee; the particular matching chosen is
 * the RNG's business and is not asserted.
 */
describe("matching", () => {
  /** Maximum matching by brute force over all L→R injections. */
  function bruteForce(nl: number, adj: number[][]): number {
    let best = 0;
    const used = new Set<number>();
    const walk = (L: number, size: number) => {
      if (L === nl) {
        best = Math.max(best, size);
        return;
      }
      walk(L + 1, size); // leave L unmatched
      for (const R of adj[L]) {
        if (used.has(R)) continue;
        used.add(R);
        walk(L + 1, size + 1);
        used.delete(R);
      }
    };
    walk(0, 0);
    return best;
  }

  const cardinality = (m: Int32Array) => [...m].filter((r) => r !== -1).length;

  it("returns a valid assignment: within the adjacency, and injective", () => {
    const adj = [[0, 1], [1, 2], [0, 2], [2]];
    const m = matching(
      4,
      3,
      adj.map((a) => [...a]),
      adj.map((a) => a.length),
    );
    const seen = new Set<number>();
    for (let L = 0; L < 4; L++) {
      if (m[L] === -1) continue;
      expect(adj[L]).toContain(m[L]);
      expect(seen.has(m[L])).toBe(false);
      seen.add(m[L]);
    }
    // A matcher that assigned nothing would satisfy every assertion above.
    expect(seen.size).toBe(3);
  });

  it("finds a maximum matching, checked against brute force", () => {
    // Random bipartite graphs, small enough to enumerate exhaustively. This is
    // the property Tents' completion check depends on: "is there a perfect
    // matching?" is only answerable if the cardinality is genuinely maximum.
    const rng = randomNew("matching-property");
    for (let trial = 0; trial < 40; trial++) {
      const nl = 4;
      const nr = 4;
      const adj: number[][] = [];
      for (let L = 0; L < nl; L++) {
        // Every left vertex keeps at least one edge, so the graphs are not
        // trivially empty; the rest are drawn.
        const edges = [...Array(nr).keys()].filter(
          (R) => randomUpto(rng, 2) === 1 || R === L % nr,
        );
        adj.push(edges);
      }
      const got = matching(
        nl,
        nr,
        adj.map((a) => [...a]),
        adj.map((a) => a.length),
      );
      expect(cardinality(got)).toBe(bruteForce(nl, adj));
    }
  });

  it("is deterministic without an RNG — cardinality does not depend on the draws", () => {
    // The `rs`-less mode is upstream's `rs = NULL` existence check. A matching's
    // *size* is order-independent even though the assignment is not, which is
    // what makes the two modes interchangeable for a yes/no question.
    const adj = [
      [0, 1, 2],
      [0, 1],
      [1, 2],
    ];
    const plain = matching(
      3,
      3,
      adj.map((a) => [...a]),
      adj.map((a) => a.length),
    );
    const again = matching(
      3,
      3,
      adj.map((a) => [...a]),
      adj.map((a) => a.length),
    );
    expect([...plain]).toEqual([...again]);
    expect(cardinality(plain)).toBe(3);

    const seeded = matching(
      3,
      3,
      adj.map((a) => [...a]),
      adj.map((a) => a.length),
      randomNew("matching-rs"),
    );
    expect(cardinality(seeded)).toBe(3);
  });

  it("leaves a left vertex unmatched when the graph cannot cover it", () => {
    // Three lefts competing for two rights: Hall's condition fails, so exactly
    // one must come back -1 rather than the matcher inventing a right vertex.
    const adj = [
      [0, 1],
      [0, 1],
      [0, 1],
    ];
    const m = matching(
      3,
      2,
      adj.map((a) => [...a]),
      adj.map((a) => a.length),
    );
    expect(cardinality(m)).toBe(2);
  });
});
