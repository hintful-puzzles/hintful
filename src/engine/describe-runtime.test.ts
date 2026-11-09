import { expect, it } from "vitest";
import {
  chain,
  chainEnd,
  chainHas,
  chainHolders,
  chainLength,
  compass,
  connected,
  cutEdges,
  cuts,
  describedSpace,
  type EdgeHolds,
  EdgeRelation,
  type GridSpace,
  keptEdgeGroups,
  lastOf,
  linkedOf,
  linkedSum,
  type Marks,
  rangeMask,
  runFits,
  runsOf,
  sameList,
  through,
} from "./describe-runtime.ts";
import { CellMarks } from "./ladder-runtime.ts";
import { randomNew, randomUpto } from "./random/index.ts";

it("relates edges as the relations stated imply, transitively", () => {
  // From scratch: each element's sense relative to `a`, by breadth-first
  // search over every relation stated; absent where it is unrelated.
  const n = 16;
  const stated: [number, number, number][] = [];
  const senses = (a: number): Map<number, number> => {
    const sense = new Map([[a, 0]]);
    const queue = [a];
    for (let u = queue.shift(); u !== undefined; u = queue.shift()) {
      for (const [x, y, s] of stated)
        for (const [from, to] of [
          [x, y],
          [y, x],
        ])
          if (from === u && !sense.has(to)) {
            sense.set(to, (sense.get(u) ?? 0) ^ s);
            queue.push(to);
          }
    }
    return sense;
  };
  const rng = randomNew("edge-relation");
  for (let trial = 0; trial < 5; trial++) {
    const r = new EdgeRelation(n);
    stated.length = 0;
    for (let op = 0; op < 40; op++) {
      const a = randomUpto(rng, n);
      const b = randomUpto(rng, n);
      const s = randomUpto(rng, 2);
      const fresh = !senses(a).has(b);
      expect(r.relate(a, b, s === 1 ? 2 : 1)).toBe(fresh);
      if (fresh) stated.push([a, b, s]);
      for (let x = 0; x < n; x++) {
        const sense = senses(x);
        expect([...r.related(x)].sort((p, q) => p - q)).toEqual(
          [...sense.keys()].sort((p, q) => p - q),
        );
        for (let y = 0; y < n; y++) {
          const v = sense.get(y);
          expect(r.of(x, y)).toBe(v === undefined ? 6 : v === 0 ? 2 : 4);
        }
      }
    }
  }
});

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

/** Each square's group across the edges `holds` keeps, from scratch. */
function edgeGroupsOf(sp: GridSpace, crosses: (e: number) => boolean): number[][] {
  const root = sp.cells.map((c) => c);
  const find = (c: number): number => {
    while (root[c] !== c) c = root[c];
    return c;
  };
  for (const e of sp.edges)
    if (crosses(e)) root[find(sp.edgeEnds[2 * e])] = find(sp.edgeEnds[2 * e + 1]);
  return sp.cells.map((c) => sp.cells.filter((x) => find(x) === find(c)));
}

it("groups kept across a set of edges are the set's groups, placement by placement", () => {
  // Two values, on the squares or on the edges. The pairs of equal squares
  // only grow; the edges not yet 1 shrink, and the pairs each of whose
  // squares is open or holds `a` shrink too, by the number read from outside.
  const alike: EdgeHolds<null> = (b, sp, _cl, e) =>
    b.grid[sp.edgeEnds[2 * e]] !== 0 &&
    b.grid[sp.edgeEnds[2 * e]] === b.grid[sp.edgeEnds[2 * e + 1]];
  const room: EdgeHolds<null> = (b, sp, _cl, e, a) =>
    [sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1]].every(
      (c) => b.grid[c] === 0 || b.grid[c] === a,
    );
  const open: EdgeHolds<null> = (b, _sp, _cl, e) => b.grid[e] !== 1;
  const cases = [
    { holds: alike, byEdge: false, a: 0 },
    { holds: room, byEdge: false, a: 2 },
    { holds: open, byEdge: true, a: 0 },
  ];
  const rs = randomNew("kept-edge-groups");
  let checked = 0;
  for (let round = 0; round < 30; round++) {
    const w = 1 + randomUpto(rs, 6);
    const h = 1 + randomUpto(rs, 6);
    const sp = describedSpace([], w, h);
    for (const { holds, byEdge, a } of cases) {
      const n = byEdge ? sp.edges.length : sp.cells.length;
      const m = new CellMarks(
        sp,
        0b110,
        new Uint8Array(n),
        null,
        byEdge ? "edge" : "cell",
      );
      m.seed(new Uint8Array(n));
      const check = (): void => {
        const want = edgeGroupsOf(sp, (e) => holds(m, sp, null, e, a));
        const got = keptEdgeGroups(sp, m, null, holds, a, byEdge);
        for (const c of sp.cells) {
          expect(got.of(c)).toEqual(want[c]);
          // A group is one list, which each of its squares reads.
          expect(got.of(want[c][0])).toBe(got.of(c));
        }
        checked++;
      };
      // A handle reads the groups as they were when it was taken.
      const first = keptEdgeGroups(sp, m, null, holds, a, byEdge);
      const before = sp.cells.map((c) => [...first.of(c)]);
      let saved: { grid: Uint8Array; cands: Int32Array } | null = null;
      for (let x = 0; x < n; x++) {
        if (randomUpto(rs, 4) === 0) continue;
        m.placeAt(x, 1 + randomUpto(rs, 2));
        if (randomUpto(rs, 2) === 0) check();
        if (saved === null && randomUpto(rs, 4) === 0)
          saved = { grid: Uint8Array.from(m.grid), cands: m.cands.slice() };
      }
      check();
      expect(sp.cells.map((c) => [...first.of(c)])).toEqual(before);
      if (saved !== null) {
        m.restore(saved.grid, saved.cands);
        for (let x = 0; x < n; x++)
          if (m.grid[x] === 0) m.placeAt(x, 1 + randomUpto(rs, 2));
        check();
      }
    }
  }
  // Enough boards and placements that a join missed or a split unseen would
  // show.
  expect(checked).toBeGreaterThan(500);
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

it("cut_edges reads its definition on every shape of set", () => {
  // Its definition: the members whose second cell `through` does not reach
  // from the first across the other members.
  const rs = randomNew("cut-edges");
  let cut = 0;
  let kept = 0;
  for (let w = 1; w <= 5; w++)
    for (let h = 1; h <= 5; h++) {
      const sp = describedSpace([], w, h);
      for (let k = 0; k < 100; k++) {
        const E = sp.edges.filter(() => randomUpto(rs, 4) > 0);
        const want = E.filter(
          (e) =>
            !through(
              sp,
              sp.edgeEnds[2 * e],
              E.filter((x) => x !== e),
            ).includes(sp.edgeEnds[2 * e + 1]),
        );
        expect(cutEdges(sp, E)).toEqual(want);
        cut += want.length;
        kept += E.length - want.length;
      }
    }
  // Enough of each that a search calling every member one, or none, would
  // show.
  expect(cut).toBeGreaterThan(1000);
  expect(kept).toBeGreaterThan(1000);
});

it("runFits answers as listing every filling would, and its projection too", () => {
  // From scratch: every filling of the squares from their masks, the runs of
  // value 1 in each, and the values each square takes in those that fit.
  const rs = randomNew("run-fits");
  let fitting = 0;
  let failing = 0;
  for (let n = 0; n <= 8; n++)
    for (let k = 0; k < 300; k++) {
      // Mostly both values open, sometimes one, now and then none.
      const masks = Int32Array.from(
        { length: n },
        () => [6, 6, 6, 2, 4, 0][randomUpto(rs, randomUpto(rs, 8) === 0 ? 6 : 5)],
      );
      const line = Array.from({ length: n }, (_, i) => i);
      const R = runsOf(
        line,
        line.filter(() => randomUpto(rs, 2) === 0),
      );
      const want = new Int32Array(n);
      let fits = false;
      for (let p = 0; p < 1 << n; p++) {
        const vals = line.map((i) => ((p >> i) & 1 ? 1 : 2));
        if (vals.some((d, i) => (masks[i] & (1 << d)) === 0)) continue;
        if (
          !sameList(
            runsOf(
              line,
              line.filter((i) => vals[i] === 1),
            ),
            R,
          )
        )
          continue;
        fits = true;
        vals.forEach((d, i) => {
          want[i] |= 1 << d;
        });
      }
      const out = new Int32Array(n).fill(-1);
      expect(runFits(masks, n, 1, R, out)).toBe(fits);
      expect(out).toEqual(want);
      // Asked again, from the cache, and with no projection wanted.
      expect(runFits(masks, n, 1, R, null)).toBe(fits);
      if (fits) fitting++;
      else failing++;
    }
  // Enough of each that a program answering one way throughout would show.
  expect(fitting).toBeGreaterThan(500);
  expect(failing).toBeGreaterThan(500);
});

it("the chains kept over the marks read as walking each chain, placement by placement", () => {
  const rs = randomNew("kept-chains");
  let checked = 0;
  let loops = 0;
  for (let round = 0; round < 60; round++) {
    const w = 1 + randomUpto(rs, 5);
    const h = 1 + randomUpto(rs, 5);
    const n = w * h;
    const sp = describedSpace([], w, h);
    // A cell's value names the cell one below it, any cell, itself included,
    // so the marks may hold loops and several cells naming one.
    const m = new CellMarks(sp, rangeMask(1, n), new Uint8Array(n));
    m.seed(new Uint8Array(n));
    const next = (c: number): number => (m.grid[c] > 0 ? m.grid[c] - 1 : -1);
    const check = (): void => {
      const walks = sp.cells.map((c) => chain(sp, next, c));
      for (const c of sp.cells) {
        const walked = walks[c];
        expect(chainLength(sp, m, next, c)).toBe(walked.length);
        for (const x of sp.cells)
          expect(chainHas(sp, m, next, x, c)).toBe(walked.includes(x));
        // The end is the member naming none, and a loop has none.
        const end = walked.find((x) => next(x) < 0) ?? -1;
        expect(chainEnd(sp, m, next, c)).toBe(end);
        expect(lastOf(next, c)).toBe(end);
        expect(chainHolders(sp, m, next, c)).toEqual(
          sp.cells.filter((x) => walks[x].includes(c)),
        );
        checked++;
      }
    };
    check();
    for (const c of sp.cells.filter(() => randomUpto(rs, 3) > 0)) {
      m.placeAt(c, 1 + randomUpto(rs, n));
      check();
    }
    if (
      sp.cells.some(
        (c) =>
          chain(sp, next, c).length > 0 &&
          next(c) >= 0 &&
          chain(sp, next, next(c)).includes(c),
      )
    )
      loops++;
    // Marks put back wholesale, as a search going back does.
    m.restore(
      Uint8Array.from(sp.cells, () => randomUpto(rs, n + 1)),
      m.cands.slice(),
    );
    check();
  }
  // Enough cells read, on enough boards holding a loop, that a chain read
  // wrongly round a loop or across a placement would show.
  expect(checked).toBeGreaterThan(3000);
  expect(loops).toBeGreaterThan(20);
});

it("compass walks a straight line in each of the eight directions", () => {
  const sp = describedSpace([], 4, 3);
  // From the middle of the second row, one square each way, clockwise from up.
  expect([1, 2, 3, 4, 5, 6, 7, 8].map((a) => compass(sp, 5, a, 1))).toEqual([
    1, 2, 6, 10, 9, 8, 4, 0,
  ]);
  expect(compass(sp, 4, 3, 3)).toBe(7);
  expect(compass(sp, 4, 3, 4)).toBe(-1);
  expect(compass(sp, 5, 1, 2)).toBe(-1);
  expect(compass(sp, 5, 3, 0)).toBe(-1);
  expect(compass(sp, 5, 9, 1)).toBe(-1);
});

it("run_lengths reads a line's runs in order", () => {
  expect([...runsOf([3, 4, 5, 6, 7, 8], [3, 5, 6, 8])]).toEqual([1, 2, 1]);
  expect([...runsOf([0, 1, 2], [])]).toEqual([]);
  expect([...runsOf([0, 1, 2], [0, 1, 2])]).toEqual([3]);
});
