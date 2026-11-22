/**
 * A fill game's hint, on Kakurasu's compiled module and a board dealt from a
 * hand-drawn answer: its steps are worded by the description, made by edits,
 * followed by the player square by square, and they finish the board.
 */

import { describe, expect, it } from "vitest";
import * as kakurasu from "../../generated/games/kakurasu/kakurasu.compiled.ts";
import { CELL, stepMarks } from "../contract/hint-words.ts";
import { status } from "./answer.ts";
import { type FillBoard, newBoard, spaceOf } from "./board.ts";
import { applyEdit } from "./edit.ts";
import { fillHint } from "./hint.ts";

const SHADED = 1;
const CROSSED = 2;

/** Shaded (#) and crossed (.) squares. Rows 4, 9, 1, 4; columns 4, 2, 3, 6. */
const ANSWER = ["#.#.", ".###", "#...", "...#"];
const W = 4;

function dealt(): FillBoard<kakurasu.Dealt> {
  const g = Uint8Array.from(ANSWER.join(""), (ch) => (ch === "#" ? SHADED : CROSSED));
  return newBoard(
    kakurasu,
    W,
    W,
    kakurasu.deriveClues(g, spaceOf(kakurasu, { w: W, h: W })),
  );
}

const { hint } = fillHint(kakurasu);
const reading = { blank: CROSSED, glyphs: {}, lineClues: kakurasu.lineClues };

function plan(board: FillBoard<kakurasu.Dealt>) {
  const got = hint.plan(board);
  if (!got.ok) throw new Error(`no hint: ${got.error}`);
  return got.steps;
}

describe("a fill game's hint", () => {
  it("words its first step from the description, and rings and stripes what it says", () => {
    const [step] = plan(dealt());
    // The third row's number is 1, so its squares worth 2, 3 and 4 are clear.
    expect(step.rung).toBe("tooMuch");
    expect(step.explanation).toBe(
      "This row still needs only 1, and the ringed squares are each worth more, so they must be clear.",
    );
    const marks = stepMarks(step);
    expect(marks.of("stripes", CELL)).toEqual([0, 1, 2, 3].map((x) => ({ x, y: 2 })));
    expect(marks.of("ring", CELL)).toEqual([1, 2, 3].map((x) => ({ x, y: 2 })));
    expect(step.highlights?.targets.every((t) => t.value === CROSSED)).toBe(true);
  });

  it("finishes the board when each step's move is made", () => {
    let board = dealt();
    let made = 0;
    while (status(kakurasu, reading, board) !== "solved") {
      const [step] = plan(board);
      board = applyEdit(kakurasu, board, step.move);
      made++;
      expect(made).toBeLessThan(40);
    }
    expect(Array.from(board.values, (v) => (v === SHADED ? "#" : ".")).join("")).toBe(
      ANSWER.join(""),
    );
  });

  it("follows a step made one square at a time, shrinking it to what is left", () => {
    const board = dealt();
    const step = plan(board).find((s) => (s.highlights?.targets.length ?? 0) > 1);
    if (step === undefined) throw new Error("no step of several squares");
    const [first, ...rest] = step.highlights?.targets ?? [];
    const one = { set: [first.y * W + first.x, first.value] };
    expect(hint.keepTrack(one, step, board)).toBe("onTrack");
    expect(step.highlights?.targets).toEqual(rest);
    const after = applyEdit(kakurasu, board, one);
    expect(hint.refreshStep(step, after)?.highlights?.targets).toEqual(rest);
    // The wrong value on a square it asks for takes the player off it.
    const wrong = { set: [rest[0].y * W + rest[0].x, 3 - rest[0].value] };
    expect(hint.keepTrack(wrong, step, after)).toBe("off");
  });

  it("clicks the squares its move sets", () => {
    const board = dealt();
    const [step] = plan(board);
    expect(hint.targets(board, step.move, step)).toEqual(
      (step.highlights?.targets ?? []).map(({ x, y }) => ({ x, y })),
    );
  });

  it("names the technique that makes a move Check & save judges", () => {
    const board = dealt();
    const [step] = plan(board);
    const verdict = hint.judgeMove(board, applyEdit(kakurasu, board, step.move));
    expect(verdict).not.toBeNull();
  });
});
