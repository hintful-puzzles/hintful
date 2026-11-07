import { expect, it } from "vitest";
import {
  connected,
  cuts,
  describedSpace,
  type GridSpace,
  linkedOf,
  linkedSum,
  type Marks,
} from "./describe-runtime.ts";
import { CellMarks } from "./ladder-runtime.ts";
import { randomNew, randomUpto } from "./random/index.ts";

/** The points each point is joined to by the drawn diagonals, from scratch. */
function groupsOf(sp: GridSpace, grid: ArrayLike<number>): number[] {
  const root = sp.points.map((p) => p);
  const find = (p: number): number => {
    while (root[p] !== p) p = root[p];
    return p;
  };
  for (const c of sp.cells) {
    const v = grid[c];
    if (v !== 1 && v !== 2) continue;
    const ps = sp.cellPoints[c];
    root[find(v === 1 ? ps[0] : ps[1])] = find(v === 1 ? ps[3] : ps[2]);
  }
  return sp.points.map(find);
}

/** A term that reads the marks round its point: its open squares, weighted
 * by the point. */
const openRound = (b: Marks, sp: GridSpace, _cl: null, q: number): number =>
  (1 + (q % 3)) * sp.pointCells[q].filter((c) => b.grid[c] === 0).length;

it("a sum kept over the linked groups is the sum over each group, placement by placement", () => {
  const rs = randomNew("linked-sum");
  let checked = 0;
  for (let round = 0; round < 40; round++) {
    const w = 2 + randomUpto(rs, 5);
    const h = 2 + randomUpto(rs, 5);
    const sp = describedSpace([], w, h);
    const m = new CellMarks(sp, 0b110, new Uint8Array(w * h));
    m.seed(new Uint8Array(w * h));
    let saved: { grid: Uint8Array; cands: Int32Array } | null = null;
    const check = (): void => {
      const roots = groupsOf(sp, m.grid);
      for (const k of sp.points) {
        const members = sp.points.filter((p) => roots[p] === roots[k]);
        expect(linkedOf(sp, m, k)).toEqual(members);
        const want = members.reduce((s, q) => s + openRound(m, sp, null, q), 0);
        expect(linkedSum(sp, m, null, openRound, k)).toBe(want);
        checked++;
      }
    };
    check();
    for (const c of sp.cells.filter(() => randomUpto(rs, 4) > 0)) {
      m.placeAt(c, 1 + randomUpto(rs, 2));
      check();
      if (saved === null && randomUpto(rs, 4) === 0)
        saved = { grid: Uint8Array.from(m.grid), cands: m.cands.slice() };
    }
    // A search going back puts the marks back wholesale, which the kept
    // groups must see, and goes on placing before it reads them again: the
    // log grows back past where they last read it.
    if (saved !== null) {
      linkedSum(sp, m, null, openRound, 0);
      m.restore(saved.grid, saved.cands);
      for (const c of sp.cells.filter((c) => m.grid[c] === 0))
        m.placeAt(c, 1 + randomUpto(rs, 2));
      check();
    }
  }
  // Enough reads across enough joins that a sum moved wrongly would show.
  expect(checked).toBeGreaterThan(5000);
});

/** Whether `S` is one group, by merging every pair side by side. */
function joined(w: number, S: readonly number[]): boolean {
  const root = new Map(S.map((c) => [c, c]));
  const find = (c: number): number => {
    while (root.get(c) !== c) c = root.get(c) as number;
    return c;
  };
  for (const c of S) {
    if ((c + 1) % w !== 0 && root.has(c + 1)) root.set(find(c), find(c + 1));
    if (root.has(c + w)) root.set(find(c), find(c + w));
  }
  return new Set(S.map(find)).size <= 1;
}

it("connected and cuts read their definitions on every shape of set", () => {
  const rs = randomNew("cuts");
  let cut = 0;
  for (let w = 1; w <= 5; w++)
    for (let h = 1; h <= 5; h++) {
      const sp = describedSpace([], w, h);
      for (let k = 0; k < 200; k++) {
        const S = sp.cells.filter(() => randomUpto(rs, 3) > 0);
        expect(connected(sp, S)).toBe(joined(w, S));
        const want = S.filter(
          (c) =>
            !joined(
              w,
              S.filter((x) => x !== c),
            ),
        );
        expect(cuts(sp, S)).toEqual(want);
        cut += want.length;
      }
    }
  // Enough sets with cuts that a search missing them would show.
  expect(cut).toBeGreaterThan(1000);
});
