/**
 * A fill game's hint, on Kakurasu's compiled module and a board dealt from a
 * hand-drawn answer: its steps are worded by the description, made by edits,
 * followed by the player square by square, and they finish the board.
 */

import { describe, expect, it } from "vitest";
import * as kakurasu from "../../generated/games/kakurasu/kakurasu.compiled.ts";
import * as tents from "../../generated/games/tents/tents.compiled.ts";
import type { HintStep } from "../contract/game.ts";
import { CELL, stepMarks } from "../contract/hint-words.ts";
import type { Point } from "../contract/types.ts";
import { click, drag } from "../input/hint-gesture.ts";
import { status } from "./answer.ts";
import { type FillBoard, newBoard, spaceOf } from "./board.ts";
import { applyEdit, type Edit } from "./edit.ts";
import { fillGame } from "./game.ts";
import { type FillHint, fillHint } from "./hint.ts";
import { LINK } from "./marks.ts";

const TS = 32;

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

  it("clicks the squares its move sets, each with the button that makes it", () => {
    const game = fillGame("kakurasu", kakurasu);
    const board = dealt();
    const [step] = plan(board);
    const ds = game.newDrawState(board, TS);
    const ui = game.newUi(board);
    const at = (t: Point) =>
      game.targetVerbs?.geometry.pointAt(board, ds, { x: t.x, y: t.y }, ui);
    expect(game.hint?.gesture?.(board, ui, ds, step.move, step)).toEqual(
      (step.highlights?.targets ?? []).map((t) => click(at(t) as Point, "secondary")),
    );
  });

  it("names the technique that makes a move Check & save judges", () => {
    const board = dealt();
    const [step] = plan(board);
    const verdict = hint.judgeMove(board, applyEdit(kakurasu, board, step.move));
    expect(verdict).not.toBeNull();
  });
});

describe("a fill game's hint that asks for a link", () => {
  // Tents (T), trees (R) and grass (.): each tent's tree is beside it, the
  // trees at 1, 11 and 12.
  const TENTS = ["TR..", "...T", "...R", "RT.."];
  const tentsGame = fillGame("tents", {
    ...tents,
    boards: [{ w: W, h: W }],
    hintMarks: {},
  });
  const TENT = 1;
  type Step = HintStep<Edit, FillHint>;

  function tentsBoard(): FillBoard<tents.Dealt> {
    const g = Uint8Array.from(TENTS.join(""), (ch) => "_T.R".indexOf(ch));
    return newBoard(tents, W, W, tents.deriveClues(g, spaceOf(tents, { w: W, h: W })));
  }

  /** The first step that sets a mark, on the board the plan was asked on,
   * every step before it made. */
  function firstLink(): { board: FillBoard<tents.Dealt>; step: Step } {
    let board = tentsBoard();
    for (let asked = 0; asked < 40; asked++) {
      const got = tentsGame.hint?.plan(board);
      if (!got?.ok) throw new Error("no hint");
      const [step] = got.steps;
      if (step.move.mark !== undefined) return { board, step };
      board = applyEdit(tents, board, step.move);
    }
    throw new Error("no step asked for a link");
  }

  it("places a tree's tent and rings the link it asks for, in the words", () => {
    const { board, step } = firstLink();
    const mark = step.move.mark ?? [];
    expect(mark).toHaveLength(2);
    const [cell, q] = mark;
    const tree = board.dealt.tree.at[q];
    expect(stepMarks(step).of("ring", LINK)).toEqual([{ cell, to: tree }]);
    expect(step.explanation).toMatch(/the link\.$/);
    // Its move sets the tent where the square is open, and the gesture is the
    // link's drag, which places it.
    if (board.values[cell] === 0) expect(step.move.set).toEqual([cell, TENT]);
    const ds = tentsGame.newDrawState(board, TS);
    const ui = tentsGame.newUi(board);
    const at = (c: number) =>
      tentsGame.targetVerbs?.geometry.pointAt(
        board,
        ds,
        { x: c % W, y: Math.floor(c / W) },
        ui,
      );
    expect(tentsGame.hint?.gesture?.(board, ui, ds, step.move, step)).toEqual([
      drag(at(cell) as Point, at(tree) as Point),
    ]);
  });

  it("follows the tent placed alone, then completes on the link", () => {
    const { board, step } = firstLink();
    const [cell, q] = step.move.mark ?? [];
    if (board.values[cell] !== 0) throw new Error("the first link's tent is placed");
    const hint = tentsGame.hint;
    if (hint === undefined) throw new Error("no hint");
    const tent = { set: [cell, TENT] };
    expect(hint.keepTrack(tent, step, board)).toBe("onTrack");
    expect(step.move).toEqual({ mark: [cell, q] });
    const after = applyEdit(tents, board, tent);
    expect(hint.keepTrack({ mark: [cell, q] }, step, after)).toBe("completed");
    // A link to another tree, or none, is off the step.
    expect(hint.keepTrack({ set: [cell, 2] }, step, after)).toBe("off");
  });

  /** The rungs of every step the hint walks from `board` to the end, each
   * step's move made. */
  function walkRungs(board: FillBoard<tents.Dealt>): {
    rungs: string[];
    board: FillBoard<tents.Dealt>;
  } {
    const rungs: string[] = [];
    for (let asked = 0; asked < 80; asked++) {
      const got = tentsGame.hint?.plan(board);
      if (!got?.ok) break;
      rungs.push(got.steps[0].rung);
      board = applyEdit(tents, board, got.steps[0].move);
    }
    return { rungs, board };
  }
  const linkRungs = (rungs: string[]) =>
    rungs.filter((r) => r === "tentLink" || r === "treeLink");

  it("asks for no link the board shows at a glance, and stops at the answer", () => {
    const { rungs, board } = walkRungs(tentsBoard());
    expect(tentsGame.status(board)).toBe("solved");
    expect(linkRungs(rungs)).toEqual([]);
  });

  it("asks for a link one reading deeper only where a step rests on it", () => {
    // A dealt board on which one tent's tree takes two readings to see.
    const params = tentsGame.decodeParams("8x8de");
    const desc = "afcak_ahbiaha,2,1,2,1,2,2,0,2,3,1,2,1,1,1,2,1";
    const { rungs, board } = walkRungs(tentsGame.newState(params, desc));
    expect(tentsGame.status(board)).toBe("solved");
    expect(linkRungs(rungs)).toEqual(["tentLink"]);
  });
});
