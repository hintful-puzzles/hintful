/**
 * A fill game's hint, on Kakurasu's compiled module and a board dealt from a
 * hand-drawn answer: its steps are worded by the description, made by edits,
 * followed by the player square by square, and they finish the board. A hint
 * that asks for a link, on the `linking` fixture.
 */

import { describe, expect, it } from "vitest";
import * as linking from "../../generated/engine/testing/fixtures/linking/linking.compiled.ts";
import * as kakurasu from "../../generated/games/kakurasu/kakurasu.compiled.ts";
import type { HintStep } from "../contract/game.ts";
import { CELL, stepMarks } from "../contract/hint-words.ts";
import type { Point } from "../contract/types.ts";
import { click, drag } from "../input/hint-gesture.ts";
import { techniqueTries } from "../solve/deduction-fixpoint.ts";
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

  it("counts the techniques its walk tries, the figure a cost comparison reports", () => {
    let board = dealt();
    const before = techniqueTries.count;
    let made = 0;
    for (; status(kakurasu, reading, board) !== "solved" && made < 40; made++)
      board = applyEdit(kakurasu, board, plan(board)[0].move);
    expect({ made, tried: techniqueTries.count - before }).toEqual({
      made: 10,
      tried: 113,
    });
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
  // Pieces (P), anchors (A) and empty squares (.): each piece's anchor is
  // beside it, the anchors at 1, 11 and 12.
  const PIECES = ["PA..", "...P", "...A", "AP.."];
  const linkingGame = fillGame("linking", linking);
  const PIECE = 1;
  type Step = HintStep<Edit, FillHint>;

  function linkingBoard(): FillBoard<linking.Dealt> {
    const g = Uint8Array.from(PIECES.join(""), (ch) => "_P.A".indexOf(ch));
    return newBoard(
      linking,
      W,
      W,
      linking.deriveClues(g, spaceOf(linking, { w: W, h: W })),
    );
  }

  /** The first step that sets a mark, on the board the plan was asked on,
   * every step before it made. */
  function firstLink(): { board: FillBoard<linking.Dealt>; step: Step } {
    let board = linkingBoard();
    for (let asked = 0; asked < 40; asked++) {
      const got = linkingGame.hint?.plan(board);
      if (!got?.ok) throw new Error("no hint");
      const [step] = got.steps;
      if (step.move.mark !== undefined) return { board, step };
      board = applyEdit(linking, board, step.move);
    }
    throw new Error("no step asked for a link");
  }

  it("places an anchor's piece and rings the link it asks for, in the words", () => {
    const { board, step } = firstLink();
    const mark = step.move.mark ?? [];
    expect(mark).toHaveLength(2);
    const [cell, q] = mark;
    const anchor = board.dealt.anchor.at[q];
    expect(stepMarks(step).of("ring", LINK)).toEqual([{ cell, to: anchor }]);
    expect(step.explanation).toMatch(/the link\.$/);
    // Its move sets the piece where the square is open, and the gesture is
    // the link's drag, which places it.
    if (board.values[cell] === 0) expect(step.move.set).toEqual([cell, PIECE]);
    const ds = linkingGame.newDrawState(board, TS);
    const ui = linkingGame.newUi(board);
    const at = (c: number) =>
      linkingGame.targetVerbs?.geometry.pointAt(
        board,
        ds,
        { x: c % W, y: Math.floor(c / W) },
        ui,
      );
    expect(linkingGame.hint?.gesture?.(board, ui, ds, step.move, step)).toEqual([
      drag(at(cell) as Point, at(anchor) as Point),
    ]);
  });

  it("follows the piece placed alone, then completes on the link", () => {
    const { board, step } = firstLink();
    const [cell, q] = step.move.mark ?? [];
    if (board.values[cell] !== 0) throw new Error("the first link's piece is placed");
    const hint = linkingGame.hint;
    if (hint === undefined) throw new Error("no hint");
    const piece = { set: [cell, PIECE] };
    expect(hint.keepTrack(piece, step, board)).toBe("onTrack");
    expect(step.move).toEqual({ mark: [cell, q] });
    const after = applyEdit(linking, board, piece);
    expect(hint.keepTrack({ mark: [cell, q] }, step, after)).toBe("completed");
    // A link to another anchor, or none, is off the step.
    expect(hint.keepTrack({ set: [cell, 2] }, step, after)).toBe("off");
  });

  /** The rungs of every step the hint walks from `board` to the end, each
   * step's move made. */
  function walkRungs(board: FillBoard<linking.Dealt>): {
    rungs: string[];
    board: FillBoard<linking.Dealt>;
  } {
    const rungs: string[] = [];
    for (let asked = 0; asked < 80; asked++) {
      const got = linkingGame.hint?.plan(board);
      if (!got?.ok) break;
      rungs.push(got.steps[0].rung);
      board = applyEdit(linking, board, got.steps[0].move);
    }
    return { rungs, board };
  }
  // The techniques `play.glance` reads a link with.
  const linkRungs = (rungs: string[]) =>
    rungs.filter((r) => (linking.play.links.glance as readonly string[]).includes(r));

  const params = linkingGame.decodeParams("6x6de");

  it("asks for no link the board shows at a glance, and stops at the answer", () => {
    // A dealt board whose walk asks for links were either of the glance's
    // techniques not read at a glance.
    const desc = ",,,,,0,,0,,,,,,,0,,,,0,,0,,,,,,,0,,,,,,,0,,1,1,1,1,1,2,1,2,0,2,0,2";
    const { rungs, board } = walkRungs(linkingGame.newState(params, desc));
    expect(linkingGame.status(board)).toBe("solved");
    expect(linkRungs(rungs)).toEqual([]);
  });

  it("asks for a link one reading deeper only where a step rests on it", () => {
    // A dealt board on which one piece's anchor takes two readings to see.
    const desc = ",,,,,,0,,0,,,,,,,,,0,0,,,,0,,,0,,,,,,,,0,,,2,1,1,1,1,1,3,0,2,1,0,1";
    const { rungs, board } = walkRungs(linkingGame.newState(params, desc));
    expect(linkingGame.status(board)).toBe("solved");
    expect(linkRungs(rungs)).toEqual(["pieceLink"]);
  });
});
