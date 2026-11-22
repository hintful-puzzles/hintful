/**
 * A fill game's deal and game ID, on Tents' compiled module: its `id:` reads
 * and writes upstream's grammar byte for byte, against Tents' own parser,
 * and a dealt board finishes at its tier and not below.
 */

import { describe, expect, it } from "vitest";
import { newState, TREE } from "../../games/tents/state.ts";
import * as tents from "../../generated/games/tents/tents.compiled.ts";
import { descValue } from "../contract/desc-error.ts";
import { randomNew } from "../random/index.ts";
import { clueAt } from "../solve/describe-runtime.ts";
import { newBoard, solveBoard, spaceOf } from "./board.ts";
import { dealFill } from "./deal.ts";
import { decodeDesc, encodeDesc, type FillParams, fillParams } from "./game-id.ts";
import { sampleAnswer } from "./sample.ts";

/** Descs Tents' generator wrote, a run of 25 empty squares (`z`) among them. */
const UPSTREAM = [
  {
    w: 10,
    h: 10,
    desc: "agaa_aidlcldbdbcadcbd,3,1,2,2,2,1,4,1,1,3,1,4,1,3,1,3,1,1,4,1",
  },
  {
    w: 10,
    h: 10,
    desc: "cea_ccbcqgfbd_jg_abac,4,1,1,3,2,2,1,2,1,3,3,1,2,2,1,3,0,3,1,4",
  },
];

const read = (w: number, h: number, desc: string) =>
  descValue(decodeDesc(tents.deal, spaceOf(tents, { w, h }), tents.clueMax, desc));

describe("a fill game's game ID", () => {
  it("reads upstream's Tents descs as Tents' own parser does, and writes them back", () => {
    for (const { w, h, desc } of UPSTREAM) {
      const clues = read(w, h, desc);
      const own = newState({ w, h, diff: 0 }, desc);
      for (let c = 0; c < w * h; c++)
        expect(clueAt(clues.tree, c) >= 0).toBe(own.grid[c] === TREE);
      // Upstream numbers the columns first; the space, the rows.
      for (let x = 0; x < w; x++)
        expect(clueAt(clues.count, h + x)).toBe(own.numbers[x]);
      for (let y = 0; y < h; y++)
        expect(clueAt(clues.count, y)).toBe(own.numbers[w + y]);
      expect(encodeDesc(tents.deal, spaceOf(tents, { w, h }), clues)).toBe(desc);
    }
  });

  it("refuses a number past its line's length", () => {
    const { desc } = UPSTREAM[0];
    const parse = decodeDesc(
      tents.deal,
      spaceOf(tents, { w: 10, h: 10 }),
      tents.clueMax,
      // The last row's 1 made 11, on a row of 10.
      `${desc}1`,
    );
    expect(parse.ok).toBe(false);
  });

  it("writes the params as upstream did, the tier only in a full ID", () => {
    const defaults = (): FillParams => ({ w: 8, h: 8, diff: 0 });
    const { encodeParams, decodeParams } = fillParams(
      tents.deal,
      tents.tiers,
      defaults,
    );
    expect(encodeParams({ w: 10, h: 12, diff: 1 }, true)).toBe("10x12dt");
    expect(encodeParams({ w: 10, h: 12, diff: 1 }, false)).toBe("10x12");
    expect(decodeParams("9x7de")).toEqual({ w: 9, h: 7, diff: 0 });
  });
});

describe("a fill game's deal", () => {
  it("samples tents none touching, each with a tree of its own beside it", () => {
    const sp = spaceOf(tents, { w: 8, h: 8 });
    const g = sampleAnswer(tents.deal.sample, sp, randomNew("sample"));
    expect(g).not.toBeNull();
    const answer = g as Uint8Array;
    const tentCells = sp.cells.filter((c) => answer[c] === 1);
    expect(tentCells).toHaveLength(Math.floor(64 / 5));
    for (const c of tentCells)
      expect(sp.adj8[c].some((o) => answer[o] === 1)).toBe(false);
    expect(sp.cells.filter((c) => answer[c] === 3)).toHaveLength(tentCells.length);
    expect(tents.isAnswer(answer, sp, tents.deriveClues(answer, sp))).toBe(true);
  });

  it("deals a board the ladder finishes at its tier and not below, which Tents reads", () => {
    for (const diff of [0, 1]) {
      const p = { w: 8, h: 8, diff };
      const { desc, aux } = dealFill(tents, tents.deal, p, randomNew(`deal-${diff}`));
      const board = newBoard(tents, 8, 8, read(8, 8, desc));
      const solved = solveBoard(tents, board, diff);
      expect(solved.verdict).toBe("solved");
      expect(Array.from(solved.values, (v) => v.toString(36)).join("")).toBe(aux);
      if (diff > 0)
        expect(solveBoard(tents, board, diff - 1).verdict).not.toBe("solved");
      expect(() => newState(p, desc)).not.toThrow();
    }
  });
});
