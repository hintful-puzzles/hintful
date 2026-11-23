/**
 * The fill board on the `linking` fixture: a board its deal wrote, its
 * answer, Solve, live rules, mistakes, and a mark's `while`.
 */

import { describe, expect, it } from "vitest";
import * as linking from "../../generated/engine/testing/fixtures/linking/linking.compiled.ts";
import { descValue } from "../contract/desc-error.ts";
import { randomNew } from "../random/index.ts";
import {
  type AnswerReading,
  answerOf,
  clearMistakes,
  encodeAnswer,
  findMistakes,
  revealOne,
  rulesOf,
  solve,
  status,
} from "./answer.ts";
import { newBoard, solveBoard, spaceOf } from "./board.ts";
import { dealFill } from "./deal.ts";
import { applyEdit } from "./edit.ts";
import { decodeDesc } from "./game-id.ts";

const PIECE = 1;
const EMPTY = 2;
const ANCHOR = 3;

const reading: AnswerReading<linking.Dealt> = {
  blank: EMPTY,
  glyphs: {},
  lineClues: linking.lineClues,
};

/** A board of `w` by `h` from its desc. */
const loaded = (w: number, h: number, desc: string) =>
  newBoard(
    linking,
    w,
    h,
    descValue(
      decodeDesc(linking.deal, spaceOf(linking, { w, h }), linking.clueMax, desc),
    ),
  );

function dealt(seed: string) {
  const p = { w: 8, h: 8, diff: linking.TIER.normal };
  const { desc, aux } = dealFill(linking, linking.deal, p, randomNew(seed));
  return { aux, board: loaded(p.w, p.h, desc) };
}

describe("the fill board", () => {
  it("places each anchor as dealt, fixed", () => {
    const { board } = dealt("fill-anchors");
    const anchors = board.dealt.anchor.at;
    expect(anchors.length).toBeGreaterThan(0);
    for (let c = 0; c < board.values.length; c++) {
      expect(board.fixed[c]).toBe(anchors.includes(c) ? 1 : 0);
      expect(board.values[c]).toBe(anchors.includes(c) ? ANCHOR : 0);
    }
  });

  it("finishes at the top tier on the answer the deal wrote", () => {
    for (const seed of ["fill-a", "fill-b", "fill-c"]) {
      const { board, aux } = dealt(seed);
      const got = solveBoard(linking, board, linking.TIER.normal);
      expect(got.verdict).toBe("solved");
      expect(encodeAnswer(got.values)).toBe(aux);
    }
  });

  it("is solved by its Solve, from the deal's answer or its own", () => {
    const { board, aux } = dealt("fill-solve");
    expect(status(linking, reading, board)).toBe("ongoing");
    const ownAnswer = solve(linking, board, board);
    expect(ownAnswer.ok).toBe(true);
    if (!ownAnswer.ok) return;
    const solved = applyEdit(linking, board, ownAnswer.move);
    expect(status(linking, reading, solved)).toBe("solved");
    const fromAux = solve(linking, board, board, aux);
    expect(fromAux.ok && applyEdit(linking, board, fromAux.move).values).toEqual(
      solved.values,
    );
  });

  it("is solved with its blank squares left open, which `blank` reads as their value", () => {
    const { board } = dealt("fill-open-blank");
    const answer = answerOf(linking, board);
    expect(answer).not.toBeNull();
    if (answer === null) return;
    const set = [...answer.keys()]
      .filter((c) => answer[c] === PIECE)
      .flatMap((c) => [c, PIECE]);
    expect(status(linking, reading, applyEdit(linking, board, { set }))).toBe("solved");
  });

  it("solves from an answer the engine wrote into `aux`", () => {
    const { board } = dealt("fill-aux");
    const answer = answerOf(linking, board);
    if (answer === null) throw new Error("no answer");
    const got = solve(linking, board, board, encodeAnswer(answer));
    expect(got.ok).toBe(true);
    if (!got.ok) return;
    expect(Array.from(applyEdit(linking, board, got.move).values)).toEqual(
      Array.from(answer),
    );
  });

  it("breaks the rules live where two pieces touch, and nowhere on the answer", () => {
    const { board } = dealt("fill-rules");
    const answer = answerOf(linking, board);
    if (answer === null) throw new Error("no answer");
    const rules = rulesOf(linking);
    const solved = { ...board, values: answer };
    expect(rules.violations(solved, rules.grid(solved))).toEqual([]);
    const open = [...board.values.keys()].filter((c) => board.values[c] === 0);
    const a = open.find((c) => c % board.w < board.w - 1 && open.includes(c + 1));
    if (a === undefined) throw new Error("no two open squares side by side");
    const touching = applyEdit(linking, board, { set: [a, PIECE, a + 1, PIECE] });
    const broken = rules.violations(touching, rules.grid(touching));
    expect(broken.some((v) => v.rule === "shape.0" && v.at.includes(a))).toBe(true);
  });

  it("refuses an edit to a fixed cell", () => {
    const { board } = dealt("fill-fixed");
    const anchor = board.fixed.indexOf(1);
    expect(() => applyEdit(linking, board, { set: [anchor, EMPTY] })).toThrow(/fixed/);
  });

  it("finds a wrong value, clears it, and reveals the next", () => {
    const { board } = dealt("fill-mistake");
    const answer = answerOf(linking, board);
    if (answer === null) throw new Error("no answer");
    const wrong = answer.indexOf(EMPTY);
    const right = answer.indexOf(PIECE);
    const played = applyEdit(linking, board, { set: [wrong, PIECE, right, PIECE] });
    expect(findMistakes(linking, played)).toEqual([{ cell: wrong, kind: "value" }]);
    const [clear] = clearMistakes(played, findMistakes(linking, played));
    const cleared = applyEdit(linking, played, clear);
    expect(cleared.values[wrong]).toBe(0);
    expect(findMistakes(linking, cleared)).toEqual([]);
    // Revealing a cell at a time reaches the answer, each a cell made right.
    const solvedBoard = { ...board, values: answer };
    let at = cleared;
    for (let reveal = revealOne(at, solvedBoard); reveal !== null; ) {
      expect(reveal.set?.length).toBe(2);
      at = applyEdit(linking, at, reveal);
      reveal = revealOne(at, solvedBoard);
    }
    expect(Array.from(at.values)).toEqual(Array.from(answer));
  });

  it("drops a link whose square an edit stops being a piece, by the link's `while`", () => {
    const { board } = dealt("fill-while");
    const answer = answerOf(linking, board);
    if (answer === null) throw new Error("no answer");
    const piece = answer.indexOf(PIECE);
    const linked = applyEdit(linking, board, { set: [piece, PIECE], mark: [piece, 0] });
    expect(linked.mark[piece]).toBe(0);
    expect(applyEdit(linking, linked, { set: [piece, PIECE] }).mark[piece]).toBe(0);
    expect(applyEdit(linking, linked, { set: [piece, EMPTY] }).mark[piece]).toBe(-1);
    expect(applyEdit(linking, linked, { set: [piece, 0] }).mark[piece]).toBe(-1);
    // A link put on a square the same edit leaves no piece never stands.
    expect(applyEdit(linking, board, { mark: [piece, 0] }).mark[piece]).toBe(-1);
  });

  it("derives from the answer the very clues its desc reads back", () => {
    for (const seed of ["fill-derive-a", "fill-derive-b", "fill-derive-c"]) {
      const { board } = dealt(seed);
      const answer = answerOf(linking, board);
      if (answer === null) throw new Error("no answer");
      const got = linking.deriveClues(answer, spaceOf(linking, board));
      for (const kind of ["anchor", "count"] as const) {
        expect(Array.from(got[kind].at)).toEqual(Array.from(board.dealt[kind].at));
        expect(Array.from(got[kind].v)).toEqual(Array.from(board.dealt[kind].v));
      }
    }
  });
});
