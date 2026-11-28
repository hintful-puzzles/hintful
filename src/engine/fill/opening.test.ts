/**
 * First cells an opening leaves (`sample.first.opened`), on the `opening`
 * fixture: walls until every two by two block holds an open square and the
 * open squares are joined, none open whole, half-turn symmetric where the
 * flag asks, a layout with a square no run passes through refused by the
 * first cells' keep, and the walls written as runs (`spans`).
 */

import { describe, expect, it } from "vitest";
import * as opening from "../../generated/engine/testing/fixtures/opening/opening.compiled.ts";
import { newDealCensus, takingCensus } from "../contract/deal-census.ts";
import { validateDesc } from "../contract/desc-error.ts";
import { randomNew } from "../random/index.ts";
import { type FillBoard, solveBoard } from "./board.ts";
import { opening as opened } from "./deal/opened.ts";
import { fillGame } from "./game.ts";

const game = fillGame("opening", opening);
type Board = FillBoard<opening.Dealt>;

const WALL = 10;
const SEEDS = Array.from({ length: 12 }, (_, i) => `seed${i}`);

/** The walls of a board as its answer holds them, 1 a wall. */
const wallsOf = (b: Board): Uint8Array => {
  const solved = solveBoard(opening, b, 0);
  expect(solved.verdict).toBe("solved");
  return Uint8Array.from(solved.values, (v) => (v === WALL ? 1 : 0));
};

/** The open squares of `walls` with no open square beside them. */
const alone = (walls: Uint8Array, w: number, h: number): number[] =>
  [...walls.keys()].filter(
    (c) =>
      walls[c] === 0 &&
      [
        c % w > 0 ? c - 1 : -1,
        c % w < w - 1 ? c + 1 : -1,
        c - w,
        c + w < w * h ? c + w : -1,
      ].every((n) => n < 0 || walls[n] === 1),
  );

/** How many walls each two by two block of `walls` holds. */
const blocks = (walls: Uint8Array, w: number, h: number): number[] =>
  Array.from({ length: (w - 1) * (h - 1) }, (_, i) => {
    const c = Math.floor(i / (w - 1)) * w + (i % (w - 1));
    return walls[c] + walls[c + 1] + walls[c + w] + walls[c + w + 1];
  });

/** The longest run of open squares across or down in `walls`, `w` wide. */
function longest(walls: Uint8Array, w: number): number {
  const h = walls.length / w;
  let most = 0;
  const along = (cells: number[]): void => {
    let run = 0;
    for (const c of cells) {
      run = walls[c] === 0 ? run + 1 : 0;
      most = Math.max(most, run);
    }
  };
  for (let y = 0; y < h; y++) along(Array.from({ length: w }, (_, x) => y * w + x));
  for (let x = 0; x < w; x++) along(Array.from({ length: h }, (_, y) => y * w + x));
  return most;
}

/** What every opening keeps: no two by two block open whole. */
function expectOpening(walls: Uint8Array, w: number, h: number): void {
  expect(blocks(walls, w, h)).not.toContain(0);
}

/** Whether an opening stopped where it may: every block holding an open
 * square, and the open squares joined. */
const stopped = (walls: Uint8Array, w: number, h: number): boolean =>
  !blocks(walls, w, h).includes(4) && joined(walls, w, h);

/** Whether the open squares of `walls` are one piece. */
function joined(walls: Uint8Array, w: number, h: number): boolean {
  const open = [...walls.keys()].filter((c) => walls[c] === 0);
  const seen = new Set([open[0]]);
  const stack = [open[0]];
  while (stack.length > 0) {
    const c = stack.pop() as number;
    const near = [c % w > 0 ? c - 1 : -1, c % w < w - 1 ? c + 1 : -1, c - w, c + w];
    for (const n of near)
      if (n >= 0 && n < w * h && walls[n] === 0 && !seen.has(n)) {
        seen.add(n);
        stack.push(n);
      }
  }
  return seen.size === open.length;
}

/** What a dealt board keeps besides: each open square in a run. */
function expectOpened(walls: Uint8Array, w: number, h: number): void {
  expectOpening(walls, w, h);
  expect(alone(walls, w, h)).toEqual([]);
}

describe("first cells an opening leaves", () => {
  it("leaves no block open whole, nor a square no run passes through", () => {
    for (const [w, h] of [
      [5, 4],
      [7, 7],
      [9, 6],
    ] as const) {
      const p = game.decodeParams(`${w}x${h}`);
      for (const seed of SEEDS) {
        const { desc } = game.newDesc(p, randomNew(seed));
        expectOpened(wallsOf(game.newState(p, desc)), w, h);
      }
    }
  });

  it("opens each square with its partner half a turn round where the flag asks", () => {
    const p = game.decodeParams("7x6S");
    let asymmetric = 0;
    for (const seed of SEEDS) {
      const walls = wallsOf(game.newState(p, game.newDesc(p, randomNew(seed)).desc));
      expectOpened(walls, 7, 6);
      expect([...walls].reverse()).toEqual([...walls]);
      const plain = game.decodeParams("7x6");
      const other = wallsOf(
        game.newState(plain, game.newDesc(plain, randomNew(seed)).desc),
      );
      if ([...other].reverse().join() !== [...other].join()) asymmetric++;
    }
    // Without the flag the walls are not turned, so the check above can fail.
    expect(asymmetric).toBeGreaterThan(0);
  });

  it("stops once every block holds an open square and they are joined", () => {
    // Upstream crossing.c's crossing_gen_walls lays squares it never opens,
    // so on a fifth of 7x7 layouts the open squares never join and every
    // square is tried (2026-11-28): those are opened again.
    for (const seed of [...SEEDS, ...SEEDS.map((s) => `${s}-again`)]) {
      const walls = opened(7, 7, "none", randomNew(seed));
      expectOpening(walls, 7, 7);
      expect(stopped(walls, 7, 7), seed).toBe(true);
    }
  });

  it("refuses a layout its keep refuses, before an answer is drawn on it", () => {
    // The fixture keeps no run longer than four squares, which some 7x7
    // openings hold.
    let long = 0;
    for (const seed of SEEDS)
      if (longest(opened(7, 7, "none", randomNew(seed)), 7) > 4) long++;
    expect(long).toBeGreaterThan(0);
    const census = newDealCensus();
    const p = game.decodeParams("7x7");
    takingCensus(census, () => {
      for (const seed of SEEDS) {
        const walls = wallsOf(game.newState(p, game.newDesc(p, randomNew(seed)).desc));
        expect(longest(walls, 7)).toBeLessThanOrEqual(4);
      }
    });
    expect(
      census.rejected.get("fill: the first cells' keep refuses them"),
    ).toBeGreaterThan(0);
  });
});

describe("the walls as runs", () => {
  const p = game.decodeParams("5x4");

  it("writes a run of walls a letter and a run of open squares a number, then the list", () => {
    const { desc } = game.newDesc(p, randomNew("spans"));
    const b = game.newState(p, desc);
    const walls = wallsOf(b);
    const runs: string[] = [];
    for (let c = 0, run = 0; c < walls.length; c++) {
      run++;
      if (c === walls.length - 1 || walls[c + 1] !== walls[c]) {
        runs.push(walls[c] === 1 ? String.fromCharCode(96 + run) : String(run));
        run = 0;
      }
    }
    const listed = b.dealt.numbers.digits.map((l) => Array.from(l).join(""));
    expect(desc).toBe(`${runs.join("")},${listed.join(",")}`);
  });

  it("splits a run of walls past 26 into letters that add", () => {
    // A 9x4 board walled but for its last row: 27 walls, then 9 open
    // squares, written `za` and read the same however the 27 is split.
    const wide = game.decodeParams("9x4");
    expect(validateDesc(game, wide, "za9,111111111")).toBeNull();
    const b = game.newState(wide, "za9,111111111");
    expect(b.dealt.wall.at).toHaveLength(27);
    expect(game.newState(wide, "yb9,111111111").dealt.wall).toEqual(b.dealt.wall);
    expect(validateDesc(game, wide, "zb9,111111111")).not.toBeNull();
  });

  it("refuses runs past the board, short of it, or a letter after the last run", () => {
    expect(validateDesc(game, p, "t1,11")).not.toBeNull();
    expect(validateDesc(game, p, "s,11")).not.toBeNull();
    expect(validateDesc(game, p, "20a,11")).not.toBeNull();
  });
});
