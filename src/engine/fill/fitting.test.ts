/**
 * A partition among the units the deal divides into equal parts, on the
 * `fitting` fixture: jigsaw blocks as large as a row that tile the board, and
 * small cages divided after them, the answer searched under both, each
 * written in the desc as upstream's block structure.
 */

import { describe, expect, it } from "vitest";
import * as fitting from "../../generated/engine/testing/fixtures/fitting/fitting.compiled.ts";
import { DESC_MALFORMED, validateDesc } from "../contract/desc-error.ts";
import { randomNew } from "../random/index.ts";
import type { Partition } from "../solve/describe-runtime.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { fillGame } from "./game.ts";
import { encodeDesc } from "./game-id.ts";

const game = fillGame("fitting", fitting);
type Board = FillBoard<fitting.Dealt>;

const params = (w: number, x = false) => ({
  w,
  h: w,
  diff: 0,
  ...(x ? { variations: ["X"] } : {}),
});
const dealt = (w: number, seed: string, x = false): Board => {
  const p = params(w, x);
  return game.newState(p, game.newDesc(p, randomNew(seed)).desc);
};

/** Whether every part of `p` is one piece, square to square. */
const connected = (p: Partition, w: number): boolean =>
  p.cells.every((cs) => {
    const seen = new Set([cs[0]]);
    const todo = [cs[0]];
    for (let c = todo.pop(); c !== undefined; c = todo.pop())
      for (const d of [
        c - w,
        c + w,
        c % w > 0 ? c - 1 : -1,
        c % w < w - 1 ? c + 1 : -1,
      ])
        if (cs.includes(d) && !seen.has(d)) {
          seen.add(d);
          todo.push(d);
        }
    return seen.size === cs.length;
  });

describe("a partition among the units divided into equal parts", () => {
  it("tiles the board with connected blocks as large as a row, and cages beside them", () => {
    let boards = 0;
    for (const w of [4, 5, 6])
      for (const seed of ["a", "b", "c"]) {
        const b = dealt(w, `${w}${seed}`);
        const { box, cage } = b.dealt;
        expect(box.cells.length).toBe(w);
        expect(box.cells.every((cs) => cs.length === w)).toBe(true);
        expect(connected(box, w)).toBe(true);
        expect(cage.cells.every((cs) => cs.length >= 2 && cs.length <= 3)).toBe(true);
        boards++;
      }
    expect(boards).toBe(9);
  });

  it("is a unit the board is read on, as a fixed block is", () => {
    const b = dealt(5, "u");
    const sp = spaceOf(fitting, b);
    // The blocks first, in the description's order.
    expect(sp.units.slice(0, 5).map((L) => [...sp.lineCells[L]])).toEqual(
      b.dealt.box.cells,
    );
    for (const c of sp.cells) expect(sp.boxOf[c]).toBe(sp.boxes[b.dealt.box.of[c]]);
  });

  it("deals an answer of every number once a row, column, block and cage, each cage's sum its own", () => {
    for (const x of [false, true])
      for (const seed of ["a", "b", "c"]) {
        const w = 5;
        const b = dealt(w, `${x}${seed}`, x);
        const g = solveBoard(fitting, b, 0).values;
        const lines = [
          ...Array.from({ length: w }, (_, y) =>
            Array.from({ length: w }, (_, i) => y * w + i),
          ),
          ...Array.from({ length: w }, (_, i) =>
            Array.from({ length: w }, (_, y) => y * w + i),
          ),
          ...b.dealt.box.cells,
          ...(x
            ? [
                Array.from({ length: w }, (_, i) => i * w + i),
                Array.from({ length: w }, (_, i) => i * w + w - 1 - i),
              ]
            : []),
        ];
        for (const u of lines)
          expect(u.map((c) => g[c]).sort((p, q) => p - q)).toEqual([1, 2, 3, 4, 5]);
        b.dealt.cage.cells.forEach((cs, r) => {
          expect(new Set(cs.map((c) => g[c])).size).toBe(cs.length);
          const k = b.dealt.sum.byAt[r];
          expect(b.dealt.sum.v[k]).toBe(cs.reduce((s, c) => s + g[c], 0));
        });
      }
  });

  it("writes the blocks and the cages as block structures, read back byte for byte", () => {
    const p = params(6);
    const { desc } = game.newDesc(p, randomNew("id"));
    const b = game.newState(p, desc);
    expect(desc.split(",").length).toBe(4);
    expect(encodeDesc(fitting.deal, spaceOf(fitting, b), b.dealt)).toBe(desc);
  });

  it("refuses blocks that are not all as large as a row", () => {
    const p = params(4);
    const { desc } = game.newDesc(p, randomNew("r"));
    expect(validateDesc(game, p, desc)).toBeNull();
    // The same cages and clues on blocks of eight, four and four.
    const rest = desc.slice(desc.indexOf(","));
    expect(validateDesc(game, p, `${unequal4()}${rest}`)).toBe(DESC_MALFORMED);
  });
});

/** A 4x4 block structure of a block of eight and two of four: the top two
 * rows joined, the bottom two rows each a block. */
function unequal4(): string {
  return encodeBlocks(4, [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2]);
}

/** `of` as upstream's block structure, written by the engine's own writer
 * through a board of those blocks. */
function encodeBlocks(w: number, of: readonly number[]): string {
  const cells = [...new Set(of)].map((r) => of.flatMap((v, c) => (v === r ? [c] : [])));
  const box: Partition = {
    parts: cells.map((_, r) => r),
    cells,
    of: Int32Array.from(of),
  };
  const seg = fitting.deal.id[0];
  return encodeDesc(
    { ...fitting.deal, id: [seg] },
    spaceOf(fitting, { w, h: w, dealt: {}, variations: [] }),
    { box } as unknown as fitting.Dealt,
  );
}
