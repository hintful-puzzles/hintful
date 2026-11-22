/**
 * The fill board on a real compiled module, Tents', judged against Tents' own
 * code where that is the outside reference: its solver's answer and its text
 * format.
 */

import { describe, expect, it } from "vitest";
import { newTentsDesc } from "../../games/tents/generator.ts";
import { tentsSolve } from "../../games/tents/solver.ts";
import {
  newState,
  TENT,
  type TentsState,
  textFormat as tentsText,
} from "../../games/tents/state.ts";
import * as tents from "../../generated/games/tents/tents.compiled.ts";
import { randomNew } from "../random/index.ts";
import { clueList } from "../solve/describe-runtime.ts";
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
import { type FillBoard, newBoard, solveBoard } from "./board.ts";
import { applyEdit } from "./edit.ts";

const TENT_V = 1;
const GRASS = 2;
const TREE = 3;

const reading: AnswerReading<tents.Dealt> = {
  blank: GRASS,
  glyphs: { [TENT_V]: "//\\", [GRASS]: "   ", [TREE]: " T " },
  lineClues: ["count"],
};

/** Tents' board as the engine lays it out: trees by cell, counts by line,
 * rows before columns. */
function boardOf(s: TentsState): FillBoard<tents.Dealt> {
  const { w, h, grid, numbers } = s;
  const trees = [...grid.keys()].filter((c) => grid[c] === 1);
  const lines = Array.from({ length: w + h }, (_, L) => L);
  const dealt: tents.Dealt = {
    tree: clueList(
      trees,
      trees.map(() => 0),
      w * h,
    ),
    count: clueList(
      lines,
      lines.map((L) => (L < h ? numbers[w + L] : numbers[L - h])),
      w + h,
    ),
  };
  return newBoard(tents, w, h, dealt);
}

function dealt(seed: string) {
  const p = { w: 8, h: 8, diff: tents.TIER.normal };
  const { desc, aux } = newTentsDesc(p, randomNew(seed));
  const s = newState(p, desc);
  return { s, aux, board: boardOf(s) };
}

describe("the fill board", () => {
  it("places each tree as dealt, fixed", () => {
    const { s, board } = dealt("fill-trees");
    for (let c = 0; c < s.grid.length; c++) {
      expect(board.fixed[c]).toBe(s.grid[c] === 1 ? 1 : 0);
      expect(board.values[c]).toBe(s.grid[c] === 1 ? TREE : 0);
    }
  });

  it("reaches Tents' own solver's answer", () => {
    for (const seed of ["fill-a", "fill-b", "fill-c", "fill-d"]) {
      const { s, board } = dealt(seed);
      const ref = tentsSolve(s.w, s.h, s.grid, s.numbers, tents.TIER.normal);
      expect(ref.ret).toBe(1);
      const got = solveBoard(tents, board, tents.TIER.normal);
      expect(got.verdict).toBe("solved");
      expect(Array.from(got.values, (v) => v === TENT_V)).toEqual(
        Array.from(ref.soln, (v) => v === TENT),
      );
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
    // Tents' `aux` is its own; an engine answer is a digit a cell.
    expect(solve(tents, board, board, aux).ok).toBe(true);
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

  it("drops a mark whose `while` an edit breaks", () => {
    const { board } = dealt("fill-while");
    const withWhile = {
      ...tents,
      markWhile: (g: ArrayLike<number>, _sp: unknown, _cl: unknown, c: number) =>
        g[c] === TENT_V,
    };
    const answer = answerOf(tents, board);
    if (answer === null) throw new Error("no answer");
    const tent = answer.indexOf(TENT_V);
    const linked = applyEdit(withWhile, board, {
      set: [tent, TENT_V],
      mark: [tent, 0],
    });
    expect(linked.mark[tent]).toBe(0);
    expect(applyEdit(withWhile, linked, { set: [tent, GRASS] }).mark[tent]).toBe(-1);
    // Without a `while`, a mark stands whatever the cell holds.
    expect(applyEdit(tents, linked, { set: [tent, GRASS] }).mark[tent]).toBe(0);
  });

  it("prints as Tents' own text format does", () => {
    const { s, board } = dealt("fill-text");
    const answer = answerOf(tents, board);
    if (answer === null) throw new Error("no answer");
    const solved = { ...board, values: answer };
    const back = [0, TENT, 3, 1];
    const tentsSolved = { ...s, grid: Int8Array.from(answer, (v) => back[v]) };
    expect(textFormat(reading, solved)).toBe(tentsText(tentsSolved));
    expect(textFormat(reading, board)).toBe(tentsText(s));
  });
});
