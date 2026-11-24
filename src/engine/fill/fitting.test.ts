/**
 * A partition among the units the deal divides into equal parts, on the
 * `fitting` fixture: jigsaw blocks as large as a row that tile the board, and
 * small cages divided after them, the answer searched under both, each
 * written in the desc as upstream's block structure.
 */

import { describe, expect, it } from "vitest";
import * as fitting from "../../generated/engine/testing/fixtures/fitting/fitting.compiled.ts";
import { DESC_MALFORMED, validateDesc } from "../contract/desc-error.ts";
import type { DrawTextOptions } from "../contract/types.ts";
import { randomNew } from "../random/index.ts";
import { insetOf } from "../render/region-walls.ts";
import { textBox } from "../render/ring.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import type { Partition } from "../solve/describe-runtime.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import { type FillBoard, solveBoard, spaceOf } from "./board.ts";
import { encodeDesc } from "./desc.ts";
import { fillGame } from "./game.ts";

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

describe("the blocks drawn as walls, the cages inset, the diagonals stroked", () => {
  const TS = 64;
  const draw = (b: Board, ts = TS): readonly DrawOp[] => {
    const dr = new RecordingDrawing(game.colors(DEFAULT_BACKGROUND));
    game.redraw(dr, game.newDrawState(b, ts), {
      state: b,
      prev: null,
      dir: 1,
      ui: game.newUi(b),
      animTime: 0,
      flash: NO_FLASH,
    });
    return dr.ops;
  };
  /** The board's top left, where the first cell's tile starts, and a
   * tile's side: the cells' clips. */
  const tilesOf = (ops: readonly DrawOp[]) => {
    const clips = ops.filter(
      (o): o is Extract<DrawOp, { op: "clip" }> => o.op === "clip",
    );
    return {
      x: Math.min(...clips.map((c) => c.x)),
      y: Math.min(...clips.map((c) => c.y)),
      ts: clips[0].w,
    };
  };
  /** The one-pixel dashes of the inset outlines, in the walls' ink. */
  const dashesOf = (ops: readonly DrawOp[], ink: string, ts: number) =>
    ops.filter(
      (o): o is Extract<DrawOp, { op: "rect" }> =>
        o.op === "rect" &&
        o.rgb === ink &&
        (o.w === 1 || o.h === 1) &&
        o.w + o.h < ts / 4,
    );
  /** The ink a cage's clue is written in, which the walls are drawn in. */
  const inkOf = (ops: readonly DrawOp[]): string => {
    const texts = ops.filter(
      (o): o is Extract<DrawOp, { op: "text" }> => o.op === "text",
    );
    const label = texts.find((t) => t.text.endsWith("+"));
    if (label === undefined) throw new Error("no cage clue drawn");
    return label.rgb;
  };

  it("writes each cage's sum once at its first square, with dashes inside every cage's top edge and none touching a sum", () => {
    const b = dealt(5, "draw");
    let sizes = 0;
    for (const size of [20, 32, 48, 64, 96, 128]) {
      const ops = draw(b, size);
      const sums = ops.filter(
        (o): o is Extract<DrawOp, { op: "text" }> =>
          o.op === "text" && o.text.endsWith("+"),
      );
      expect(sums.length).toBe(b.dealt.cage.cells.length);
      const { x: ox, y: oy, ts } = tilesOf(ops);
      const firsts = new Set(b.dealt.cage.cells.map((cs) => cs[0]));
      for (const s of sums) {
        const c = Math.floor((s.y - oy) / ts) * 5 + Math.floor((s.x - ox) / ts);
        expect(firsts.has(c)).toBe(true);
      }
      const dashes = dashesOf(ops, inkOf(ops), ts);
      const t = insetOf(ts);
      for (const c of b.dealt.cage.of.keys()) {
        const [x, y] = [c % 5, Math.floor(c / 5)];
        if (y > 0 && b.dealt.cage.of[c - 5] === b.dealt.cage.of[c]) continue;
        const at = oy + y * ts + t;
        expect(
          dashes.some(
            (d) =>
              d.y === at && d.h === 1 && d.x >= ox + x * ts && d.x < ox + (x + 1) * ts,
          ),
        ).toBe(true);
      }
      for (const s of sums) {
        // The ink, and a pixel round it.
        const ink = textBox(
          { x: s.x, y: s.y },
          s as unknown as DrawTextOptions,
          s.text,
        );
        const box = { x: ink.x - 1, y: ink.y - 1, w: ink.w + 2, h: ink.h + 2 };
        for (const d of dashes)
          expect(
            d.x < box.x + box.w &&
              d.x + d.w > box.x &&
              d.y < box.y + box.h &&
              d.y + d.h > box.y,
          ).toBe(false);
      }
      sizes++;
    }
    expect(sizes).toBe(6);
  });

  it("walls the blocks, not the cages", () => {
    const b = dealt(5, "walls");
    const { walls } = game.newDrawState(b, TS).parts ?? { walls: null };
    if (walls === null) throw new Error("no walls");
    const { box } = b.dealt;
    // A cell's right wall stands where the block changes, and not where
    // only the cage does.
    const pairs = [...Array(25).keys()].filter((c) => c % 5 !== 4);
    for (const c of pairs)
      expect((walls[c] & 8) !== 0).toBe(box.of[c] !== box.of[c + 1]);
    expect(pairs.length).toBe(20);
    const { cage } = b.dealt;
    expect(
      pairs.some((c) => cage.of[c] !== cage.of[c + 1] && box.of[c] === box.of[c + 1]),
    ).toBe(true);
  });

  it("strokes the two diagonals corner to corner on a board with X, and none without", () => {
    const diagonalStrokes = (b: Board) =>
      draw(b).filter(
        (o) =>
          o.op === "line" &&
          Math.abs(o.x2 - o.x1) === TS &&
          Math.abs(o.y2 - o.y1) === TS,
      ).length;
    expect(diagonalStrokes(dealt(5, "x", true))).toBe(10);
    expect(diagonalStrokes(dealt(5, "x"))).toBe(0);
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
