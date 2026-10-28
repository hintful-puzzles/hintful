import { describe, expect, it } from "vitest";
import { randomNew, randomUpto } from "./random/index.ts";
import { type WingBoard, weighWing } from "./wing.ts";

/** A board of `masks.length` open units over `values` values, seeing along
 * `edges`. */
function board(values: number, masks: number[], edges: [number, number][]): WingBoard {
  const seen = masks.map(() => new Set<number>());
  for (const [a, b] of edges) {
    seen[a].add(b);
    seen[b].add(a);
  }
  return {
    size: masks.length,
    values,
    open: () => true,
    mask: (u) => masks[u],
    seers: (u) => seen[u],
    sees: (a, b) => seen[a].has(b),
  };
}

function wings(b: WingBoard): [number, number, readonly number[], number][] {
  const out: [number, number, readonly number[], number][] = [];
  weighWing(b, (m, x, ends, t) => out.push([m, x, ends, t]));
  return out;
}

const bits = (...vs: number[]) => vs.reduce((m, v) => m | (1 << v), 0);

describe("weighWing", () => {
  // Units: 0 middle, 1 and 2 the ends, 3 the target.
  it("finds an XY-wing: a two-value middle, each value leaving an end x", () => {
    const b = board(
      4,
      [bits(0, 1), bits(0, 2), bits(1, 2), bits(2, 3)],
      [
        [0, 1],
        [0, 2],
        [1, 3],
        [2, 3],
      ],
    );
    expect(wings(b)).toEqual([[0, 2, [1, 2], 3]]);
  });

  it("finds an XYZ-wing only where the target sees the middle too", () => {
    const masks = [bits(0, 1, 2), bits(0, 2), bits(1, 2), bits(2, 3)];
    const ends: [number, number][] = [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
    ];
    expect(wings(board(4, masks, ends))).toEqual([]);
    expect(wings(board(4, masks, [...ends, [0, 3]]))).toEqual([[0, 2, [1, 2], 3]]);
  });

  it("never weighs a middle that could take a value outside the weighed ones", () => {
    const b = board(
      3,
      [bits(0, 1, 3), bits(0, 2), bits(1, 2), bits(2, 3)],
      [
        [0, 1],
        [0, 2],
        [1, 3],
        [2, 3],
      ],
    );
    expect(wings(b)).toEqual([]);
  });

  it("never strikes a unit's answer", () => {
    const rs = randomNew("wing-sound");
    let fired = 0;
    for (let trial = 0; trial < 3000; trial++) {
      const n = 9;
      const values = 4;
      const answer = Array.from({ length: n }, () => randomUpto(rs, values));
      const edges: [number, number][] = [];
      for (let a = 0; a < n; a++)
        for (let b = a + 1; b < n; b++)
          if (answer[a] !== answer[b] && randomUpto(rs, 2)) edges.push([a, b]);
      const masks = answer.map((v) => {
        let m = 1 << v;
        for (let c = 0; c < values; c++) if (randomUpto(rs, 3) === 0) m |= 1 << c;
        return m;
      });
      for (const [, x, , t] of wings(board(values, masks, edges))) {
        expect(answer[t]).not.toBe(x);
        fired++;
      }
    }
    // A sweep that never fires proves nothing: it saw many wings.
    expect(fired).toBeGreaterThan(100);
  });
});
