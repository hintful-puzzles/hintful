import { describe, expect, it } from "vitest";
import {
  exhaustive,
  type FinishSearch,
  type Plan,
  searchFinish,
} from "./finish-search.ts";

/** A small seeded generator, so a failing board can be named. Its high bits:
 * the low ones of this recurrence repeat every few draws. */
function lcg(seed: number): (n: number) => number {
  let x = seed >>> 0;
  return (n) => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    return (x >>> 16) % n;
  };
}

/** A position is a node of a random acyclic graph, each move going to a
 * higher node; a few nodes with no move are finished. */
interface Graph {
  readonly moves: readonly (readonly number[])[];
  readonly finished: readonly boolean[];
}

function randomGraph(seed: number, n: number): Graph {
  const rnd = lcg(seed);
  const moves = Array.from({ length: n }, (_, v) => {
    const out = new Set<number>();
    if (v + 1 < n) for (let d = rnd(4); d > 0; d--) out.add(v + 1 + rnd(n - v - 1));
    return [...out];
  });
  const finished = moves.map((m) => m.length === 0 && rnd(4) === 0);
  return { moves, finished };
}

/** Whether `v` can finish, by trying every line with no memo and no cut. */
const bruteFinishes = (g: Graph, v: number): boolean =>
  g.finished[v] || g.moves[v].some((u) => bruteFinishes(g, u));

/** The salt reverses the order on an odd restart, so that restarts differ. */
const graphSearch = (
  g: Graph,
  cut: (v: number) => boolean,
): FinishSearch<number, number> => ({
  key: (v) => v,
  finished: (v) => g.finished[v],
  lostAtAGlance: cut,
  children: (v, salt) => {
    const order = salt % 2 ? [...g.moves[v]].reverse() : g.moves[v];
    return order.map((u) => [u, u] as const);
  },
});

/** A line is the nodes it moves to: each a move from the last, ending finished. */
function expectFinishingLine(g: Graph, from: number, line: readonly number[]): void {
  let v = from;
  for (const u of line) {
    expect(g.moves[v]).toContain(u);
    v = u;
  }
  expect(g.finished[v]).toBe(true);
}

const UNBOUNDED = exhaustive(Number.POSITIVE_INFINITY);
const RESTARTS: Plan = { budget: Number.POSITIVE_INFINITY, restart: 3, tries: 5 };

describe("searchFinish against brute force", () => {
  it("finds a line wherever one exists, and proves loss everywhere else", () => {
    let lost = 0;
    let found = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const g = randomGraph(seed, 24);
      for (let v = 0; v < 24; v++) {
        const truth = bruteFinishes(g, v);
        // A sound cut: every node with no move that is not finished.
        const cut = (u: number) => g.moves[u].length === 0 && !g.finished[u];
        for (const plan of [UNBOUNDED, RESTARTS]) {
          const r = searchFinish(v, graphSearch(g, cut), plan);
          expect(r.kind, `seed ${seed} node ${v}`).toBe(truth ? "found" : "lost");
          if (r.kind === "found") expectFinishingLine(g, v, r.line);
        }
        if (truth) found++;
        else lost++;
      }
    }
    // Both answers were asked for many times over.
    expect(Math.min(found, lost)).toBeGreaterThan(200);
  });

  it("never proves loss nor finds a false line when the budget cuts it short", () => {
    let cut = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const g = randomGraph(seed, 40);
      for (const budget of [1, 3, 8]) {
        for (const plan of [exhaustive(budget), { budget, restart: 2, tries: 3 }]) {
          const r = searchFinish(
            0,
            graphSearch(g, () => false),
            plan,
          );
          if (r.kind === "lost") expect(bruteFinishes(g, 0)).toBe(false);
          if (r.kind === "found") expectFinishingLine(g, 0, r.line);
          if (r.kind === "out-of-reach") cut++;
        }
      }
    }
    expect(cut).toBeGreaterThan(50);
  });

  it("spends no more of the allowance than it holds, one position an expansion", () => {
    // A chain of twenty with no finish: proving it lost expands every node.
    const chain: Graph = {
      moves: Array.from({ length: 20 }, (_, v) => (v < 19 ? [v + 1] : [])),
      finished: Array.from({ length: 20 }, () => false),
    };
    const expanded: number[] = [];
    const counted: FinishSearch<number, number> = {
      ...graphSearch(chain, () => false),
      lostAtAGlance: (v) => {
        expanded.push(v);
        return false;
      },
    };
    const allowance = { left: 5 };
    expect(searchFinish(0, counted, exhaustive(1000), allowance).kind).toBe(
      "out-of-reach",
    );
    expect(expanded).toEqual([0, 1, 2, 3, 4]);
    expect(allowance.left).toBeLessThanOrEqual(0);
    // What is spent stays spent for the next search of the same request.
    expect(searchFinish(0, counted, exhaustive(1000), allowance).kind).toBe(
      "out-of-reach",
    );
    expect(expanded).toHaveLength(5);
    expect(searchFinish(0, counted, exhaustive(1000)).kind).toBe("lost");
    // A finished start costs nothing.
    const done = { left: 5 };
    const one: Graph = { moves: [[]], finished: [true] };
    expect(
      searchFinish(
        0,
        graphSearch(one, () => false),
        exhaustive(1),
        done,
      ),
    ).toEqual({
      kind: "found",
      line: [],
    });
    expect(done.left).toBe(5);
  });
});

/** Peg solitaire on one row, played on one board changed in place: a peg
 * jumps a neighbor into the hole beyond it. */
function rowSearch(): FinishSearch<{ cells: number[]; left: number }, number> {
  return {
    key: (p) => p.cells.join(""),
    finished: (p) => p.left === 1,
    lostAtAGlance: () => false,
    *children(p, salt) {
      const n = p.cells.length;
      const jumps: [number, number][] = [];
      for (let i = 0; i < n; i++) {
        for (const d of [1, -1]) {
          const to = i + 2 * d;
          if (to >= 0 && to < n && p.cells[i] && p.cells[i + d] && !p.cells[to])
            jumps.push([i, d]);
        }
      }
      if (salt % 2) jumps.reverse();
      for (const [i, d] of jumps) {
        p.cells[i] = p.cells[i + d] = 0;
        p.cells[i + 2 * d] = 1;
        p.left--;
        try {
          yield [i * 2 + (d > 0 ? 0 : 1), p] as const;
        } finally {
          p.cells[i] = p.cells[i + d] = 1;
          p.cells[i + 2 * d] = 0;
          p.left++;
        }
      }
    },
  };
}

const rowFinishes = (cells: number[]): boolean => {
  if (cells.filter(Boolean).length === 1) return true;
  for (let i = 0; i < cells.length; i++) {
    for (const d of [1, -1]) {
      const to = i + 2 * d;
      if (to < 0 || to >= cells.length || !cells[i] || !cells[i + d] || cells[to])
        continue;
      const next = [...cells];
      next[i] = next[i + d] = 0;
      next[to] = 1;
      if (rowFinishes(next)) return true;
    }
  }
  return false;
};

describe("a search over one board changed in place", () => {
  it("agrees with brute force and leaves the board as it found it", () => {
    let both = { found: 0, lost: 0, cut: 0 };
    for (let bits = 3; bits < 1 << 9; bits++) {
      const cells = Array.from({ length: 9 }, (_, i) => (bits >> i) & 1);
      const left = cells.filter(Boolean).length;
      if (left < 2) continue;
      for (const plan of [UNBOUNDED, RESTARTS, exhaustive(4)]) {
        const p = { cells: [...cells], left };
        const r = searchFinish(p, rowSearch(), plan);
        expect(p).toEqual({ cells, left });
        if (r.kind === "out-of-reach") both = { ...both, cut: both.cut + 1 };
        else {
          expect(r.kind === "found").toBe(rowFinishes(cells));
          both = { ...both, [r.kind]: both[r.kind] + 1 };
        }
      }
    }
    expect(Math.min(both.found, both.lost, both.cut)).toBeGreaterThan(20);
  });
});
