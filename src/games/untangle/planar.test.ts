import { describe, expect, it } from "vitest";
import { randomNew, randomUpto } from "../../engine/random/index.ts";
import { newUntangleDesc } from "./generator.ts";
import { planarLayout } from "./planar.ts";
import { decodeGame, type Edge, findCrossings } from "./state.ts";

function crossingFree(n: number, edges: readonly Edge[]): void {
  const pos = planarLayout(n, edges);
  expect(pos).not.toBeNull();
  if (pos === null) return;
  expect(pos).toHaveLength(n);
  const keys = new Set(pos.map((p) => `${p.x},${p.y}`));
  expect(keys.size, "two vertices share a point").toBe(n);
  const pts = pos.map((p) => ({ x: p.x, y: p.y, d: 1 }));
  // `cross` counts an endpoint lying on another segment, so this also rules
  // out a vertex sitting on an edge it is not an end of.
  expect(findCrossings(pts, edges).count).toBe(0);
}

function generatedEdges(n: number, seed: string): Edge[] {
  return decodeGame(newUntangleDesc({ n }, randomNew(seed)).desc, n);
}

describe("planarLayout", () => {
  it("lays every generated board out with no crossings", () => {
    let boards = 0;
    for (const n of [4, 5, 6, 8, 10, 15, 20, 25, 40, 60]) {
      for (let i = 0; i < 12; i++) {
        crossingFree(n, generatedEdges(n, `planar-${n}-${i}`));
        boards++;
      }
    }
    expect(boards).toBe(120);
  });

  it("handles sparse, disconnected and edgeless graphs", () => {
    const rng = randomNew("planar-sparse");
    for (let i = 0; i < 40; i++) {
      const n = 4 + (i % 20);
      const all = generatedEdges(n, `planar-sparse-${i}`);
      // Keep a random subset: forests, isolated vertices, several components.
      const kept = all.filter(() => randomUpto(rng, 3) !== 0);
      crossingFree(n, kept);
    }
    crossingFree(6, []);
    crossingFree(3, [{ a: 0, b: 1 }]);
  });

  it("refuses the two Kuratowski graphs", () => {
    const k5: Edge[] = [];
    for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) k5.push({ a, b });
    expect(planarLayout(5, k5)).toBeNull();
    const k33: Edge[] = [];
    for (let a = 0; a < 3; a++) for (let b = 3; b < 6; b++) k33.push({ a, b });
    expect(planarLayout(6, k33)).toBeNull();
    // ...and K5 minus an edge is planar.
    crossingFree(5, k5.slice(1));
  });
});
