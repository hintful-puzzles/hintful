/**
 * The staged planner, against puzzles no game owns: a torus whose rows and
 * columns cycle one cell, and a board of 2×2 blocks that turn their pieces as
 * they turn them. That keeps every case about the planner rather than about a
 * game's moves.
 */

import { describe, expect, it } from "vitest";
import { type Effect, effectOf, planByStage } from "./permutation-planner.ts";
import { randomNew, randomUpto } from "./random/index.ts";

interface Fixture {
  readonly generators: readonly Effect[];
  readonly spins: number;
  readonly goal: Int32Array;
}

/** Each row and each column of a `w × h` torus, cycled one cell along. */
function torus(w: number, h: number, goal: Int32Array): Fixture {
  const size = w * h;
  const generators: Effect[] = [];
  for (let y = 0; y < h; y++)
    generators.push(
      effectOf(size, (src) => {
        const row = Array.from({ length: w }, (_, x) => src[y * w + x]);
        for (let x = 0; x < w; x++) src[y * w + ((x + 1) % w)] = row[x];
      }),
    );
  for (let x = 0; x < w; x++)
    generators.push(
      effectOf(size, (src) => {
        const col = Array.from({ length: h }, (_, y) => src[y * w + x]);
        for (let y = 0; y < h; y++) src[((y + 1) % h) * w + x] = col[y];
      }),
    );
  return { generators, spins: 1, goal };
}

/** Each 2×2 block of a `w × h` board turned a quarter, its pieces turning with
 * it. */
function blocks(w: number, h: number): Fixture {
  const size = w * h;
  const generators: Effect[] = [];
  for (let y = 0; y + 1 < h; y++)
    for (let x = 0; x + 1 < w; x++)
      generators.push(
        effectOf(size, (src, spin) => {
          const ring = [y * w + x, y * w + x + 1, (y + 1) * w + x + 1, (y + 1) * w + x];
          const was = ring.map((c) => [src[c], spin[c]]);
          ring.forEach((c, i) => {
            const [s, o] = was[(i + 3) % 4];
            src[c] = s;
            spin[c] = (o + 1) % 4;
          });
        }),
      );
  return { generators, spins: 4, goal: Int32Array.from({ length: size }, (_, i) => i) };
}

const distinct = (size: number) => Int32Array.from({ length: size }, (_, i) => i);

/** The finished board scrambled by random moves, so it is reachable. */
function scrambled(
  f: Fixture,
  seed: string,
): { values: Int32Array; turned: Uint8Array } {
  const rng = randomNew(seed);
  let values = Int32Array.from(f.goal);
  let turned = new Uint8Array(values.length);
  for (let k = 0; k < 200; k++) {
    const g = f.generators[randomUpto(rng, f.generators.length)];
    values = values.map((_, c) => values[g.src[c]]);
    turned = turned.map((_, c) => (turned[g.src[c]] + g.spin[c]) % f.spins);
  }
  return { values, turned };
}

/** A move's effect on the board: generator `m >> 1`, undone when `m` is odd. */
function play(f: Fixture, b: { values: Int32Array; turned: Uint8Array }, m: number) {
  const g = f.generators[m >> 1];
  const values = new Int32Array(b.values.length);
  const turned = new Uint8Array(b.values.length);
  for (let c = 0; c < values.length; c++) {
    if (m & 1) {
      values[g.src[c]] = b.values[c];
      turned[g.src[c]] = (b.turned[c] + f.spins - g.spin[c]) % f.spins;
    } else {
      values[c] = b.values[g.src[c]];
      turned[c] = (b.turned[g.src[c]] + g.spin[c]) % f.spins;
    }
  }
  return { values, turned };
}

const solvedBy = (f: Fixture, b: { values: Int32Array; turned: Uint8Array }) =>
  b.values.every((v, c) => v === f.goal[c]) && b.turned.every((o) => o === 0);

const plan = (f: Fixture, b: { values: Int32Array; turned: Uint8Array }) =>
  planByStage({ ...f, values: b.values, turned: f.spins > 1 ? b.turned : null });

const FIXTURES: [string, () => Fixture][] = [
  ["3×3 torus, every line an even cycle", () => torus(3, 3, distinct(9))],
  ["4×3 torus, its rows odd", () => torus(4, 3, distinct(12))],
  [
    "4×3 torus, a value to a row",
    () =>
      torus(
        4,
        3,
        Int32Array.from({ length: 12 }, (_, i) => Math.floor(i / 4)),
      ),
  ],
  ["3×3 of turning 2×2 blocks", () => blocks(3, 3)],
];

describe("following one plan whole finishes the board", () => {
  for (const [name, make] of FIXTURES)
    it(name, () => {
      const f = make();
      for (const seed of ["a", "b", "c"]) {
        const start = scrambled(f, `${name} ${seed}`);
        const p = plan(f, start);
        expect(p.solves).toBe(true);
        const end = p.segments
          .flatMap((s) => s.moves)
          .reduce((b, m) => play(f, b, m), start);
        expect(solvedBy(f, end)).toBe(true);
      }
    });
});

/**
 * The rank falls on every hinted move, and the only thing a player sees of
 * that is that a hint asked again after every move arrives: ask, play the first
 * move, throw the plan away, ask again. A rank that rose anywhere would let the
 * walk come back to a board it left.
 */
describe("a plan recomputed after every move arrives", () => {
  for (const [name, make] of FIXTURES)
    it(name, () => {
      const f = make();
      for (const seed of ["a", "b", "c"]) {
        let b = scrambled(f, `${name} walk ${seed}`);
        const seen = new Set<string>();
        while (!solvedBy(f, b)) {
          const key = `${b.values}/${b.turned}`;
          expect(seen.has(key), `board revisited after ${seen.size} moves`).toBe(false);
          seen.add(key);
          const p = plan(f, b);
          expect(p.segments.length).toBeGreaterThan(0);
          b = play(f, b, p.segments[0].moves[0]);
        }
      }
    });
});

describe("a segment's roles", () => {
  it("are one for one with its moves, and a remainder's start is cut", () => {
    const f = torus(4, 3, distinct(12));
    const p = plan(f, scrambled(f, "roles"));
    for (const s of p.segments) expect(s.roles).toHaveLength(s.moves.length);
    expect(p.segments.some((s) => s.roles.includes("first"))).toBe(true);
  });
});
