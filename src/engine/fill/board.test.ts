/**
 * The fill board on a real compiled module, Tents'. Its hand-written solver,
 * generator and text format were the outside reference until Tents was born
 * from its description; git keeps those comparisons, and upstream's own
 * descs (`guards/upstream-descs.test.ts`) and text format, written out below,
 * are what stays outside the engine.
 */

import { describe, expect, it } from "vitest";
import * as tents from "../../generated/games/tents/tents.compiled.ts";
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
  textFormat,
} from "./answer.ts";
import { newBoard, solveBoard, spaceOf } from "./board.ts";
import { dealFill } from "./deal.ts";
import { applyEdit } from "./edit.ts";
import { decodeDesc } from "./game-id.ts";

const TENT_V = 1;
const GRASS = 2;
const TREE = 3;

const reading: AnswerReading<tents.Dealt> = {
  blank: GRASS,
  glyphs: { [TENT_V]: "//\\", [GRASS]: "   ", [TREE]: " T " },
  lineClues: ["count"],
};

/** A board of `w` by `h` from its desc. */
const loaded = (w: number, h: number, desc: string) =>
  newBoard(
    tents,
    w,
    h,
    descValue(decodeDesc(tents.deal, spaceOf(tents, { w, h }), tents.clueMax, desc)),
  );

function dealt(seed: string) {
  const p = { w: 8, h: 8, diff: tents.TIER.normal };
  const { desc, aux } = dealFill(tents, tents.deal, p, randomNew(seed));
  return { aux, board: loaded(p.w, p.h, desc) };
}

describe("the fill board", () => {
  it("places each tree as dealt, fixed", () => {
    const { board } = dealt("fill-trees");
    const trees = board.dealt.tree.at;
    expect(trees.length).toBeGreaterThan(0);
    for (let c = 0; c < board.values.length; c++) {
      expect(board.fixed[c]).toBe(trees.includes(c) ? 1 : 0);
      expect(board.values[c]).toBe(trees.includes(c) ? TREE : 0);
    }
  });

  it("finishes at the top tier on the answer the deal wrote", () => {
    for (const seed of ["fill-a", "fill-b", "fill-c"]) {
      const { board, aux } = dealt(seed);
      const got = solveBoard(tents, board, tents.TIER.normal);
      expect(got.verdict).toBe("solved");
      expect(encodeAnswer(got.values)).toBe(aux);
    }
  });

  it("is solved by its Solve, from the deal's answer or its own", () => {
    const { board, aux } = dealt("fill-solve");
    expect(status(tents, reading, board)).toBe("ongoing");
    const ownAnswer = solve(tents, board, board);
    expect(ownAnswer.ok).toBe(true);
    if (!ownAnswer.ok) return;
    const solved = applyEdit(tents, board, ownAnswer.move);
    expect(status(tents, reading, solved)).toBe("solved");
    const fromAux = solve(tents, board, board, aux);
    expect(fromAux.ok && applyEdit(tents, board, fromAux.move).values).toEqual(
      solved.values,
    );
  });

  it("is solved with its grass left open, which Tents reads as grass", () => {
    const { board } = dealt("fill-open-grass");
    const answer = answerOf(tents, board);
    expect(answer).not.toBeNull();
    if (answer === null) return;
    const set = [...answer.keys()]
      .filter((c) => answer[c] === TENT_V)
      .flatMap((c) => [c, TENT_V]);
    expect(status(tents, reading, applyEdit(tents, board, { set }))).toBe("solved");
  });

  it("solves from an answer the engine wrote into `aux`", () => {
    const { board } = dealt("fill-aux");
    const answer = answerOf(tents, board);
    if (answer === null) throw new Error("no answer");
    const got = solve(tents, board, board, encodeAnswer(answer));
    expect(got.ok).toBe(true);
    if (!got.ok) return;
    expect(Array.from(applyEdit(tents, board, got.move).values)).toEqual(
      Array.from(answer),
    );
  });

  it("breaks the rules live where two tents touch, and nowhere on the answer", () => {
    const { board } = dealt("fill-rules");
    const answer = answerOf(tents, board);
    if (answer === null) throw new Error("no answer");
    const rules = rulesOf(tents);
    const solved = { ...board, values: answer };
    expect(rules.violations(solved, rules.grid(solved))).toEqual([]);
    const open = [...board.values.keys()].filter((c) => board.values[c] === 0);
    const a = open.find((c) => c % board.w < board.w - 1 && open.includes(c + 1));
    if (a === undefined) throw new Error("no two open squares side by side");
    const touching = applyEdit(tents, board, { set: [a, TENT_V, a + 1, TENT_V] });
    const broken = rules.violations(touching, rules.grid(touching));
    expect(broken.some((v) => v.rule === "shape.0" && v.at.includes(a))).toBe(true);
  });

  it("refuses an edit to a fixed cell", () => {
    const { board } = dealt("fill-fixed");
    const tree = board.fixed.indexOf(1);
    expect(() => applyEdit(tents, board, { set: [tree, GRASS] })).toThrow(/fixed/);
  });

  it("finds a wrong value, clears it, and reveals the next", () => {
    const { board } = dealt("fill-mistake");
    const answer = answerOf(tents, board);
    if (answer === null) throw new Error("no answer");
    const wrong = answer.indexOf(GRASS);
    const right = answer.indexOf(TENT_V);
    const played = applyEdit(tents, board, { set: [wrong, TENT_V, right, TENT_V] });
    expect(findMistakes(tents, played)).toEqual([{ cell: wrong, kind: "value" }]);
    const [clear] = clearMistakes(played, findMistakes(tents, played));
    const cleared = applyEdit(tents, played, clear);
    expect(cleared.values[wrong]).toBe(0);
    expect(findMistakes(tents, cleared)).toEqual([]);
    // Revealing a cell at a time reaches the answer, each a cell made right.
    const solvedBoard = { ...board, values: answer };
    let at = cleared;
    for (let reveal = revealOne(at, solvedBoard); reveal !== null; ) {
      expect(reveal.set?.length).toBe(2);
      at = applyEdit(tents, at, reveal);
      reveal = revealOne(at, solvedBoard);
    }
    expect(Array.from(at.values)).toEqual(Array.from(answer));
  });

  it("drops a link whose square an edit stops being a tent, by the link's `while`", () => {
    const { board } = dealt("fill-while");
    const answer = answerOf(tents, board);
    if (answer === null) throw new Error("no answer");
    const tent = answer.indexOf(TENT_V);
    const linked = applyEdit(tents, board, { set: [tent, TENT_V], mark: [tent, 0] });
    expect(linked.mark[tent]).toBe(0);
    expect(applyEdit(tents, linked, { set: [tent, TENT_V] }).mark[tent]).toBe(0);
    expect(applyEdit(tents, linked, { set: [tent, GRASS] }).mark[tent]).toBe(-1);
    expect(applyEdit(tents, linked, { set: [tent, 0] }).mark[tent]).toBe(-1);
    // A link put on a square the same edit leaves no tent never stands.
    expect(applyEdit(tents, board, { mark: [tent, 0] }).mark[tent]).toBe(-1);
  });

  it("derives from the answer the very clues its desc reads back", () => {
    for (const seed of ["fill-derive-a", "fill-derive-b", "fill-derive-c"]) {
      const { board } = dealt(seed);
      const answer = answerOf(tents, board);
      if (answer === null) throw new Error("no answer");
      const got = tents.deriveClues(answer, spaceOf(tents, board));
      for (const kind of ["tree", "count"] as const) {
        expect(Array.from(got[kind].at)).toEqual(Array.from(board.dealt[kind].at));
        expect(Array.from(got[kind].v)).toEqual(Array.from(board.dealt[kind].v));
      }
    }
  });

  it("prints as upstream's Tents does", () => {
    // Upstream's 4x4 desc: a run of three open squares before each tree (`c`),
    // then four (`d`); columns 1, 1, 1, 0 and rows 1, 1, 0, 1. The last line's
    // trailing spaces are upstream's `game_text_format`'s.
    const board = loaded(4, 4, "cdcc,1,1,1,0,1,1,0,1");
    expect(textFormat(reading, board)).toBe(
      [
        "+---+---+---+---+---+",
        "| . | . | . | T | 1 |",
        "+---+---+---+---+---+",
        "| . | . | . | . | 1 |",
        "+---+---+---+---+---+",
        "| T | . | . | . | 0 |",
        "+---+---+---+---+---+",
        "| T | . | . | . | 1 |",
        "+---+---+---+---+---+",
        "| 1 | 1 | 1 | 0 |    ",
        "+---+---+---+---+   ",
        "",
      ].join("\n"),
    );
  });
});
