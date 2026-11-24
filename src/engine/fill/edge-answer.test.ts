/**
 * A fill board whose answer sits on the edges, on the `lacing` fixture:
 * the board holds a value an edge, and the ladder reads and solves it.
 */

import { describe, expect, it } from "vitest";
import * as lacing from "../../generated/engine/testing/fixtures/lacing/lacing.compiled.ts";
import { descValue } from "../contract/desc-error.ts";
import { randomNew } from "../random/index.ts";
import { type AnswerReading, edgeTextOf, encodeAnswer, textFormat } from "./answer.ts";
import { elementsOf, marksOf, newBoard, paramSpaceOf, solveBoard } from "./board.ts";
import { dealFill } from "./deal.ts";
import { decodeDesc } from "./desc.ts";
import { sampleAnswer } from "./sample.ts";

const LINE = 1;
const NONE = 2;

/** A 3 by 3 board whose numbers are those `answer` deals. */
function dealtOn(answer: (sp: ReturnType<typeof paramSpaceOf>) => Uint8Array) {
  const sp = paramSpaceOf(lacing, { w: 3, h: 3 });
  const g = answer(sp);
  return { g, board: newBoard(lacing, 3, 3, lacing.deriveClues(g, sp)) };
}

/** The lines round the rim of the board, and none inside. */
const ring = (sp: ReturnType<typeof paramSpaceOf>): Uint8Array =>
  Uint8Array.from(sp.edges, (e) => {
    const [a, b] = [sp.edgeEnds[2 * e], sp.edgeEnds[2 * e + 1]];
    return a === 4 || b === 4 ? NONE : LINE;
  });

describe("an answer on the edges", () => {
  it("holds a value an edge, and a mark a cell", () => {
    const { board } = dealtOn(ring);
    const sp = paramSpaceOf(lacing, { w: 3, h: 3 });
    expect(elementsOf(lacing, sp)).toBe(sp.edges);
    expect(board.values.length).toBe(12);
    expect(board.fixed.length).toBe(12);
    expect(board.values.every((v) => v === 0)).toBe(true);
    expect(board.mark.length).toBe(9);
    // The ladder's marks hold candidates an edge, each edge's both values.
    const { marks } = marksOf(lacing, board);
    expect(marks.cands.length).toBe(12);
    const both = (1 << LINE) | (1 << NONE);
    expect(Array.from(marks.cands).every((m) => m === both)).toBe(true);
  });

  it("is solved by the ladder on the edges, to the answer dealt", () => {
    const { g, board } = dealtOn(ring);
    // The center's 0 crosses its four edges, and each side's 2 then has
    // its two lines left.
    expect(Array.from(board.dealt.number.v)).toEqual([2, 2, 2, 2, 0, 2, 2, 2, 2]);
    const got = solveBoard(lacing, board, lacing.TIER.easy);
    expect(got.verdict).toBe("solved");
    expect(Array.from(got.values)).toEqual(Array.from(g));
  });

  it("prints each edge's value where the wall between its squares is", () => {
    const { g, board } = dealtOn(ring);
    const reading: AnswerReading<lacing.Dealt> = {
      blank: NONE,
      glyphs: {},
      lineClues: [],
      numbers: lacing.numbers,
      edges: {
        text: edgeTextOf(lacing.play),
        space: (b) => paramSpaceOf(lacing, b),
      },
    };
    const text = (values: Uint8Array) =>
      textFormat(reading, { ...board, values }).split("\n");
    expect(text(g)).toEqual([
      "+---+---+---+",
      "| 2 - 2 - 2 |",
      "+ | + x + | +",
      "| 2 x 0 x 2 |",
      "+ | + x + | +",
      "| 2 - 2 - 2 |",
      "+---+---+---+",
      "",
    ]);
    // An open edge is blank.
    expect(text(board.values)[1]).toBe("| 2   2   2 |");
  });

  it("is dealt with a line at even odds on each edge, and finishes on it", () => {
    let lines = 0;
    let edges = 0;
    for (const seed of ["lace-a", "lace-b", "lace-c", "lace-d"]) {
      const p = { w: 4, h: 4, diff: lacing.TIER.easy };
      const { desc, aux } = dealFill(lacing, lacing.deal, p, randomNew(seed));
      const sp = paramSpaceOf(lacing, p);
      const board = newBoard(
        lacing,
        4,
        4,
        descValue(decodeDesc(lacing.deal, sp, lacing.clueMax, desc)),
      );
      expect(aux.length).toBe(sp.edges.length);
      const got = solveBoard(lacing, board, lacing.TIER.easy);
      expect(got.verdict).toBe("solved");
      expect(encodeAnswer(got.values)).toBe(aux);
      lines += got.values.filter((v) => v === LINE).length;
      edges += got.values.length;
    }
    // 96 edges at even odds hold a line on between a third and two thirds.
    expect(lines / edges).toBeGreaterThan(1 / 3);
    expect(lines / edges).toBeLessThan(2 / 3);
  });

  it("scatters over the edges, which keep no distance, partner or line", () => {
    const sp = paramSpaceOf(lacing, { w: 3, h: 3 });
    const scatter = { value: LINE, share: 0.5 };
    const g = sampleAnswer({ scatter, rest: NONE }, sp, randomNew("e"), null, sp.edges);
    expect(g?.length).toBe(12);
    expect(g?.every((v) => v === LINE || v === NONE)).toBe(true);
    for (const sample of [
      { scatter: { ...scatter, apart: "adj4" as const }, rest: NONE },
      { scatter, rest: NONE, noBareLine: true },
    ])
      expect(() => sampleAnswer(sample, sp, randomNew("e"), null, sp.edges)).toThrow(
        /only a cell keeps a distance/,
      );
  });

  it("finds a board whose values break a number impossible", () => {
    const { board } = dealtOn(ring);
    const wrong = { ...board, values: board.values.slice() };
    // A line on an edge of the center, whose number is 0.
    const sp = paramSpaceOf(lacing, { w: 3, h: 3 });
    wrong.values[sp.edgeOf(1, 4)] = LINE;
    expect(solveBoard(lacing, wrong, lacing.TIER.easy).verdict).toBe("impossible");
  });
});
