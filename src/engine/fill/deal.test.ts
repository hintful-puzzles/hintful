/**
 * A fill game's deal and game ID, on Tents' compiled module: its `id:` reads
 * and writes upstream's grammar byte for byte, and a dealt board finishes at
 * its tier and not below.
 */

import { describe, expect, it } from "vitest";
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
  it("reads upstream's Tents descs and writes them back", () => {
    for (const { w, h, desc } of UPSTREAM) {
      const clues = read(w, h, desc);
      const [runs, ...numbers] = desc.split(",");
      // A run's letter is the open squares before its tree, `a` one and `_`
      // none, `z` 25 with no tree after; a run of open squares ends the code.
      const trees: number[] = [];
      let at = 0;
      for (const ch of runs) {
        if (ch === "z") at += 25;
        else {
          at += ch === "_" ? 0 : ch.charCodeAt(0) - 96;
          if (at < w * h) trees.push(at++);
        }
      }
      expect(Array.from(clues.tree.at)).toEqual(trees);
      // Upstream numbers the columns first; the space, the rows.
      for (let x = 0; x < w; x++)
        expect(clueAt(clues.count, h + x)).toBe(Number(numbers[x]));
      for (let y = 0; y < h; y++)
        expect(clueAt(clues.count, y)).toBe(Number(numbers[w + y]));
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
    // A draw may find no room, or leave a line bare: the first that holds.
    const answer = ["sample-a", "sample-b", "sample-c", "sample-d"]
      .map((seed) => sampleAnswer(tents.deal.sample, sp, randomNew(seed)))
      .find((g) => g !== null);
    if (answer === undefined) throw new Error("no draw held");
    const tentCells = sp.cells.filter((c) => answer[c] === 1);
    expect(tentCells).toHaveLength(Math.floor(64 / 5));
    for (const c of tentCells)
      expect(sp.adj8[c].some((o) => answer[o] === 1)).toBe(false);
    expect(sp.cells.filter((c) => answer[c] === 3)).toHaveLength(tentCells.length);
    expect(tents.isAnswer(answer, sp, tents.deriveClues(answer, sp))).toBe(true);
  });

  it("draws again an answer that leaves a line bare, with `noBareLine`", () => {
    // On 4x4 a fifth is three tents, and their trees leave a line bare often.
    const sp = spaceOf(tents, { w: 4, h: 4 });
    const bare = (g: Uint8Array) =>
      sp.lines.some((L) => sp.lineCells[L].every((c) => g[c] === 2));
    const { noBareLine: _, ...loose } = tents.deal.sample;
    let looseBare = 0;
    for (let i = 0; i < 200; i++) {
      // The same draws, so the two differ only by the refusal.
      const g = sampleAnswer(tents.deal.sample, sp, randomNew(`bare-${i}`));
      const h = sampleAnswer(loose, sp, randomNew(`bare-${i}`));
      const wasBare = h !== null && bare(h);
      if (wasBare) looseBare++;
      expect(g).toEqual(wasBare ? null : h);
    }
    expect(looseBare).toBeGreaterThan(0);
  });

  it("deals a board the ladder finishes at its tier and not below", () => {
    for (const diff of [0, 1]) {
      const p = { w: 8, h: 8, diff };
      const { desc, aux } = dealFill(tents, tents.deal, p, randomNew(`deal-${diff}`));
      const board = newBoard(tents, 8, 8, read(8, 8, desc));
      const solved = solveBoard(tents, board, diff);
      expect(solved.verdict).toBe("solved");
      expect(Array.from(solved.values, (v) => v.toString(36)).join("")).toBe(aux);
      if (diff > 0)
        expect(solveBoard(tents, board, diff - 1).verdict).not.toBe("solved");
    }
  });
});
