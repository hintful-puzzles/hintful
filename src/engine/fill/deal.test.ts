/**
 * A fill game's deal, on the `linking` fixture: its sample places a partner
 * beside each piece and draws again an answer that leaves a line bare, and a
 * dealt board finishes at its tier and not below. On the `sizing` fixture, an
 * answer is laid a line at a time, as many in each as the params' size says.
 * Upstream's game ID grammar
 * is each game's own cases' (`tents.cases.yaml`'s `ids` and `params`).
 */

import { describe, expect, it } from "vitest";
import * as linking from "../../generated/engine/testing/fixtures/linking/linking.compiled.ts";
import * as sizing from "../../generated/engine/testing/fixtures/sizing/sizing.compiled.ts";
import { descValue } from "../contract/desc-error.ts";
import { randomNew } from "../random/index.ts";
import { newBoard, solveBoard, spaceOf } from "./board.ts";
import { dealFill } from "./deal.ts";
import { decodeDesc } from "./game-id.ts";
import { sampleAnswer, sampleLines } from "./sample.ts";

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
