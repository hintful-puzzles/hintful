import { describe, expect, it } from "vitest";
import { findLoops } from "./findloop.ts";

/** Build a neighbor callback from an undirected edge list. */
function graph(n: number, edges: [number, number][]) {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  return (v: number) => adj[v];
}

describe("findLoops", () => {
  it("finds no loop in a path", () => {
    const edges: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 3],
    ];
    const r = findLoops(4, graph(4, edges));
    expect(r.anyLoop).toBe(false);
    for (const [a, b] of edges) {
      expect(r.isLoopEdge(a, b)).toBe(false);
      expect(r.isBridge(a, b)).not.toBeNull();
    }
  });

  it("finds no loop in a multi-component forest and reports bridge splits", () => {
    // Component A: star 0-(1,2,3); component B: edge 4-5; isolated 6.
    const r = findLoops(
      7,
      graph(7, [
        [0, 1],
        [0, 2],
        [0, 3],
        [4, 5],
      ]),
    );
    expect(r.anyLoop).toBe(false);
    const split = r.isBridge(0, 1);
    expect(split).not.toBeNull();
    // One vertex (1) on one side, three (0,2,3) on the other, whichever
    // orientation the DFS picked.
    const counts = [split?.uVertices, split?.vVertices].sort();
    expect(counts).toEqual([1, 3]);
    const ab = r.isBridge(4, 5);
    expect(ab && ab.uVertices + ab.vVertices).toBe(2);
  });

  it("identifies cycle edges as loop edges and the tail as a bridge", () => {
    // Triangle 0-1-2 with a tail 2-3-4.
    const edges: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 0],
      [2, 3],
      [3, 4],
    ];
    const r = findLoops(5, graph(5, edges));
    expect(r.anyLoop).toBe(true);
    expect(r.isLoopEdge(0, 1)).toBe(true);
    expect(r.isLoopEdge(1, 2)).toBe(true);
    expect(r.isLoopEdge(2, 0)).toBe(true);
    expect(r.isLoopEdge(2, 3)).toBe(false);
    expect(r.isLoopEdge(3, 4)).toBe(false);
    const tail = r.isBridge(2, 3);
    expect(tail).not.toBeNull();
    const counts = [tail?.uVertices, tail?.vVertices].sort();
    expect(counts).toEqual([2, 3]);
  });

  it("keys the split to the arguments, not to the direction the DFS happened to run", () => {
    // The tests above `.sort()` the two counts, deliberately ignoring
    // orientation because the DFS's direction is not the caller's business.
    // But the *interface* is: `uVertices` is documented as "vertices on `u`'s
    // side", so the answer must mirror when the arguments swap. Without this,
    // a caller asking "how much hangs off my end of this bridge?" — Bridges'
    // island counting, Dominosa's region split — silently gets the other end,
    // and the sorted assertions cannot see it.
    // Triangle 0-1-2 with a tail 2-3-4: 2's side is {0,1,2}, 3's is {3,4}.
    const r = findLoops(
      5,
      graph(5, [
        [0, 1],
        [1, 2],
        [2, 0],
        [2, 3],
        [3, 4],
      ]),
    );
    expect(r.isBridge(2, 3)).toEqual({ uVertices: 3, vVertices: 2 });
    expect(r.isBridge(3, 2)).toEqual({ uVertices: 2, vVertices: 3 });
  });

  it("handles two independent cycles plus a connecting bridge", () => {
    // Squares 0-1-2-3 and 4-5-6-7, bridged 3-4.
    const cycleEdges: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
    ];
    const r = findLoops(8, graph(8, [...cycleEdges, [3, 4]]));
    expect(r.anyLoop).toBe(true);
    for (const [a, b] of cycleEdges) expect(r.isLoopEdge(a, b)).toBe(true);
    expect(r.isLoopEdge(3, 4)).toBe(false);
    const mid = r.isBridge(3, 4);
    expect(mid && mid.uVertices + mid.vVertices).toBe(8);
  });

  it("handles an empty graph", () => {
    const r = findLoops(0, () => []);
    expect(r.anyLoop).toBe(false);
  });

  it("marks every edge of a theta graph (two vertices, three paths) as a loop edge", () => {
    // 0—1 via three internally-disjoint paths: direct, via 2, via 3-4.
    const edges: [number, number][] = [
      [0, 1],
      [0, 2],
      [2, 1],
      [0, 3],
      [3, 4],
      [4, 1],
    ];
    const r = findLoops(5, graph(5, edges));
    expect(r.anyLoop).toBe(true);
    for (const [a, b] of edges) {
      expect(r.isLoopEdge(a, b)).toBe(true);
      expect(r.isBridge(a, b)).toBeNull();
    }
  });

  // Net's shuffle reads a board two squares wide as a torus, where two tiles
  // side by side can be joined across the middle and round the back. The walk
  // used to link the second into its own work list and never end.
  it.each([
    ["at the start of a path", 0, 1],
    ["in the middle of one", 1, 2],
    ["at the end of one", 2, 3],
  ])("takes two edges between the same pair, %s, as a loop of the two", (_where, a, b) => {
    const path: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 3],
    ];
    const r = findLoops(4, graph(4, [...path, [a, b]]));
    expect(r.anyLoop).toBe(true);
    for (const [u, v] of path) {
      const doubled = u === a && v === b;
      expect(r.isLoopEdge(u, v)).toBe(doubled);
      expect(r.isLoopEdge(v, u)).toBe(doubled);
      expect(r.isBridge(u, v) === null).toBe(doubled);
    }
  });

  it("takes two edges between a pair the walk reaches from elsewhere first", () => {
    // 0-1, 0-2, and 1-2 twice: the walk comes down 0-2 or 0-1 and meets the
    // doubled pair below the root. Every edge is on the triangle.
    const edges: [number, number][] = [
      [0, 2],
      [0, 1],
      [1, 2],
      [1, 2],
    ];
    const r = findLoops(3, graph(3, edges));
    expect(r.anyLoop).toBe(true);
    for (const [u, v] of edges) expect(r.isLoopEdge(u, v)).toBe(true);
  });
});
