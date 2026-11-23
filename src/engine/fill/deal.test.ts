/**
 * A fill game's deal, on the `linking` fixture: its sample places a partner
 * beside each piece and draws again an answer that leaves a line bare, and a
 * dealt board finishes at its tier and not below. On the `sizing` fixture, an
 * answer is laid a line at a time, as many in each as the params' size says.
 * Upstream's game ID grammar
 * is each game's own cases' (`tents.cases.yaml`'s `ids` and `params`).
 */

import { describe, expect, it } from "vitest";
import * as fleet from "../../generated/engine/testing/fixtures/fleet/fleet.compiled.ts";
import * as linking from "../../generated/engine/testing/fixtures/linking/linking.compiled.ts";
import * as sizing from "../../generated/engine/testing/fixtures/sizing/sizing.compiled.ts";
import { descValue } from "../contract/desc-error.ts";
import { randomNew } from "../random/index.ts";
import { newBoard, solveBoard, spaceOf } from "./board.ts";
import { dealFill } from "./deal.ts";
import { decodeDesc, givenOf } from "./game-id.ts";
import { sampleAnswer, sampleLines, samplePieces } from "./sample.ts";

const PIECE = 1;
const SHADED = 1;
const EMPTY = 2;
const ANCHOR = 3;

const read = (w: number, h: number, desc: string) =>
  descValue(
    decodeDesc<linking.Dealt>(
      linking.deal,
      spaceOf(linking, { w, h }),
      linking.clueMax,
      desc,
    ),
  );

describe("a fill game's deal", () => {
  it("samples pieces none touching, each with a partner of its own beside it", () => {
    const sp = spaceOf(linking, { w: 8, h: 8 });
    // A draw may find no room, or leave a line bare: the first that holds.
    const answer = ["sample-a", "sample-b", "sample-c", "sample-d"]
      .map((seed) => sampleAnswer(linking.deal.sample, sp, randomNew(seed)))
      .find((g) => g !== null);
    if (answer === undefined) throw new Error("no draw held");
    const pieces = sp.cells.filter((c) => answer[c] === PIECE);
    expect(pieces).toHaveLength(Math.floor(64 / 5));
    for (const c of pieces)
      expect(sp.adj8[c].some((o) => answer[o] === PIECE)).toBe(false);
    expect(sp.cells.filter((c) => answer[c] === ANCHOR)).toHaveLength(pieces.length);
    expect(linking.isAnswer(answer, sp, linking.deriveClues(answer, sp))).toBe(true);
  });

  it("draws again an answer that leaves a line bare, with `noBareLine`", () => {
    // On 4x4 a fifth is three pieces, and their partners leave a line bare
    // often.
    const sp = spaceOf(linking, { w: 4, h: 4 });
    const bare = (g: Uint8Array) =>
      sp.lines.some((L) => sp.lineCells[L].every((c) => g[c] === EMPTY));
    const { noBareLine: _, ...loose } = linking.deal.sample;
    let looseBare = 0;
    for (let i = 0; i < 200; i++) {
      // The same draws, so the two differ only by the refusal.
      const g = sampleAnswer(linking.deal.sample, sp, randomNew(`bare-${i}`));
      const h = sampleAnswer(loose, sp, randomNew(`bare-${i}`));
      const wasBare = h !== null && bare(h);
      if (wasBare) looseBare++;
      expect(g).toEqual(wasBare ? null : h);
    }
    expect(looseBare).toBeGreaterThan(0);
  });

  it("deals a board the ladder finishes at its tier and not below", () => {
    for (const diff of [linking.TIER.easy, linking.TIER.normal]) {
      const p = { w: 8, h: 8, diff };
      const { desc, aux } = dealFill(
        linking,
        linking.deal,
        p,
        randomNew(`deal-${diff}`),
      );
      const board = newBoard(linking, 8, 8, read(8, 8, desc));
      const solved = solveBoard(linking, board, diff);
      expect(solved.verdict).toBe("solved");
      expect(Array.from(solved.values, (v) => v.toString(36)).join("")).toBe(aux);
      if (diff > 0)
        expect(solveBoard(linking, board, diff - 1).verdict).not.toBe("solved");
    }
  });
});

describe("an answer laid a line at a time", () => {
  it("puts the size's count in every row and column, none side by side", () => {
    const sp = spaceOf(sizing, { w: 6, h: 6 });
    for (const n of [1, 2]) {
      // A draw may find no way on: the first that holds.
      const answer = ["lines-a", "lines-b", "lines-c", "lines-d"]
        .map((seed) => sampleLines(sizing.deal.sample, sp, { n }, randomNew(seed)))
        .find((g) => g !== null);
      if (answer === undefined) throw new Error(`no draw held at ${n} a line`);
      for (const L of sp.lines)
        expect(sp.lineCells[L].filter((c) => answer[c] === SHADED)).toHaveLength(n);
      for (const c of sp.cells.filter((c) => answer[c] === SHADED))
        expect(sp.adj4[c].some((o) => answer[o] === SHADED)).toBe(false);
    }
  });

  it("deals a board of the size the ladder finishes at its tier and not below", () => {
    for (const diff of [sizing.TIER.easy, sizing.TIER.normal]) {
      const p = { w: 5, h: 5, diff, sizes: { n: 2 } };
      const { desc, aux } = dealFill(
        sizing,
        sizing.deal,
        p,
        randomNew(`sized-${diff}`),
      );
      const sp = spaceOf(sizing, { w: 5, h: 5 });
      const clues = descValue(
        decodeDesc<sizing.Dealt>(sizing.deal, sp, sizing.clueMax, desc),
      );
      const board = newBoard(sizing, 5, 5, { ...clues, n: 2 });
      const solved = solveBoard(sizing, board, diff);
      expect(solved.verdict).toBe("solved");
      expect(Array.from(solved.values, (v) => v.toString(36)).join("")).toBe(aux);
      if (diff > 0)
        expect(solveBoard(sizing, board, diff - 1).verdict).not.toBe("solved");
    }
  });
});

describe("an answer laid a piece at a time", () => {
  /** Each piece of `g` on a `w`-wide board by its first cell, and its length. */
  const pieces = (g: Uint8Array, w: number): number[] => {
    const at = (c: number, dx: number, dy: number) => {
      const x = (c % w) + dx;
      const y = Math.floor(c / w) + dy;
      return x >= 0 && y >= 0 && x < w && y * w < g.length ? y * w + x : null;
    };
    const run = (c: number, dx: number, dy: number): number => {
      const n = at(c, dx, dy);
      return n !== null && g[n] === PIECE ? 1 + run(n, dx, dy) : 1;
    };
    const lengths: number[] = [];
    g.forEach((v, c) => {
      const up = at(c, 0, -1);
      const left = at(c, -1, 0);
      if (v !== PIECE || (up !== null && g[up] === PIECE)) return;
      if (left !== null && g[left] === PIECE) return;
      lengths.push(Math.max(run(c, 1, 0), run(c, 0, 1)));
    });
    return lengths.sort();
  };

  it("lays the tally's pieces, straight, none touching even at a corner", () => {
    const sp = spaceOf(fleet, { w: 6, h: 6 });
    for (const seed of ["pieces-a", "pieces-b", "pieces-c"]) {
      const g = samplePieces(fleet.deal.sample, 6, 6, [2, 1, 1], randomNew(seed));
      if (g === null) throw new Error(`no room on ${seed}`);
      expect(pieces(g, 6)).toEqual([1, 1, 2, 3]);
      for (const c of sp.cells.filter((c) => g[c] === PIECE))
        for (const o of sp.adj8[c].filter((o) => !sp.adj4[c].includes(o)))
          expect(g[o]).not.toBe(PIECE);
    }
  });

  it("never deals the value only an ID writes, though it holds on every piece", () => {
    const sp = spaceOf(fleet, { w: 6, h: 6 });
    const g = samplePieces(fleet.deal.sample, 6, 6, [2, 1, 1], null);
    if (g === null) throw new Error("no room");
    const { seg } = fleet.deriveClues(
      g,
      sp,
      {},
      {
        fleet: { n: 3, length: [1, 2, 3], boats: [2, 1, 1] },
      },
    );
    // Each piece square is given its shape, a lone one, an end or a middle.
    expect(seg.at.length).toBe(36);
    expect(new Set(seg.v)).toEqual(new Set([2, 4, 5, 6]));
    // An ID gives it, and the board reads it.
    const read = descValue(
      decodeDesc<fleet.Dealt>(
        fleet.deal,
        spaceOf(fleet, { w: 2, h: 2 }),
        fleet.clueMax,
        "1,0,1,0,Vc",
      ),
    );
    expect(Array.from(read.seg.v)).toEqual([3]);
  });

  it("hides the flag's kind too where the flag is on, and only there", () => {
    const sp = spaceOf(fleet, { w: 5, h: 5 });
    const shown = (hides: boolean, seed: string): number => {
      const p = { w: 5, h: 5, diff: 0, tally: [2, 1], hides };
      const { desc, aux } = dealFill(fleet, fleet.deal, p, randomNew(seed));
      const clues = descValue(
        decodeDesc<fleet.Dealt>(fleet.deal, sp, fleet.clueMax, desc),
      );
      const board = newBoard(fleet, 5, 5, { ...clues, ...givenOf(fleet.deal, p) });
      const solved = solveBoard(fleet, board, 0);
      expect(solved.verdict).toBe("solved");
      expect(Array.from(solved.values, (v) => v.toString(36)).join("")).toBe(aux);
      return clues.n.at.length;
    };
    for (const seed of ["flag-a", "flag-b", "flag-c"]) {
      expect(shown(false, seed)).toBe(sp.lines.length);
      expect(shown(true, seed)).toBeLessThan(sp.lines.length);
    }
  });
});
