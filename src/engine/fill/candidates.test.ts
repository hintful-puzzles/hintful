/**
 * The hint of a board that keeps notes, on the `squaring` fixture: the
 * shared candidate walk built from the compiled module (`candidates.ts`),
 * which finishes a board under either reading, runs the Latin library's
 * strikes on the player's notes, follows a step made a note at a time, and
 * has its struck notes drawn struck; and the preferences that steer it.
 */

import { describe, expect, it } from "vitest";
import * as squaring from "../../generated/engine/testing/fixtures/squaring/squaring.compiled.ts";
import type { HintStep } from "../contract/game.ts";
import type { CandidateMove, CandidateReading } from "../hint/candidate-hint.ts";
import { randomNew } from "../random/index.ts";
import { NO_FLASH } from "../render/win-wave.ts";
import { type DrawOp, RecordingDrawing } from "../testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../testing/render-scenario.ts";
import type { FillBoard } from "./board.ts";
import { candidateFill } from "./candidates.ts";
import { fillGame } from "./game.ts";
import type { FillHint } from "./hint.ts";
import { type FillMove, isCandidateMove } from "./notes.ts";
import type { FillUi } from "./play.ts";
import { fillRender } from "./render.ts";

const game = fillGame("squaring", squaring);
type Board = FillBoard<squaring.Dealt>;
type Step = HintStep<FillMove, FillHint>;

const params = (w: number) => ({ w, h: w, diff: 0 });
const dealt = (w: number, seed: string): Board =>
  game.newState(params(w), game.newDesc(params(w), randomNew(seed)).desc);
/** A 7x7 board whose walk needs the library's set twice. */
const NEEDS_A_SET = game.newState(params(7), "3_7j3_4_5a6h1_6_2c2b7_6a1e2_5_3a7a");

const uiOf = (b: Board, reading: CandidateReading): FillUi => ({
  ...game.newUi(b),
  candidateReading: reading,
});

/** The walk's first step on `b` under `reading`. */
function firstStep(b: Board, reading: CandidateReading): Step {
  const plan = game.hint.plan(b, undefined, uiOf(b, reading));
  if (!plan.ok) throw new Error(`no plan: ${JSON.stringify(plan)}`);
  return plan.steps[0];
}

/** Each step the walk takes from `b` to the end, made whole. */
function walk(b: Board, reading: CandidateReading): { steps: Step[]; end: Board } {
  const steps: Step[] = [];
  let board = b;
  while (game.status(board) !== "solved") {
    if (steps.length > 4 * b.w * b.w) throw new Error("the walk runs on");
    const step = firstStep(board, reading);
    steps.push(step);
    board = game.executeMove(board, step.move);
  }
  return { steps, end: board };
}

const strikeOf = (step: Step): CandidateMove & { type: "pencilStrike" } => {
  const m = step.move;
  if (!isCandidateMove(m) || m.type !== "pencilStrike")
    throw new Error(`not a strike: ${JSON.stringify(m)}`);
  return m;
};

describe("the candidate walk of a board that keeps notes", () => {
  it("finishes a board under either reading, from nothing noted", () => {
    for (const seed of ["a", "b", "c"]) {
      const b = dealt(5, seed);
      const implicit = walk(b, "implicit");
      const populate = walk(b, "populate");
      // The implicit reading pencils nothing first; the populate reading
      // fills every cell and cleans the obvious before it places.
      expect(implicit.steps[0].rung).not.toBe("populate");
      expect(populate.steps.slice(0, 2).map((s) => s.rung)).toEqual([
        "populate",
        "clean",
      ]);
      for (const { steps } of [implicit, populate])
        for (const s of steps) expect(s.explanation).not.toBe("");
    }
  });

  it("strikes a note by the Latin library's set, keeping the cell's others", () => {
    const { steps } = walk(NEEDS_A_SET, "populate");
    const at = steps.findIndex((s) => s.rung === "set");
    expect(at).toBeGreaterThan(0);
    let board = NEEDS_A_SET;
    for (const s of steps.slice(0, at)) board = game.executeMove(board, s.move);
    const { marks } = strikeOf(steps[at]);
    const { x, y } = marks[0];
    const c = y * board.w + x;
    const before = board.pencil?.[c] ?? 0;
    const after = game.executeMove(board, steps[at].move).pencil?.[c] ?? 0;
    const struck = marks.reduce((bits, m) => bits | (1 << m.n), 0);
    // One cell a leg, and the cell keeps every note the step does not name.
    expect(marks.every((m) => m.x === x && m.y === y)).toBe(true);
    expect(before & struck).toBe(struck);
    expect(after).toBe(before & ~struck);
    expect(after).not.toBe(0);
  });

  it("follows a strike made a note at a time, and shrinks it to what is left", () => {
    let board = NEEDS_A_SET;
    let step = firstStep(board, "populate");
    const several = (m: FillMove) =>
      isCandidateMove(m) && m.type === "pencilStrike" && m.marks.length > 1;
    while (!several(step.move)) {
      board = game.executeMove(board, step.move);
      step = firstStep(board, "populate");
    }
    const [first, ...rest] = strikeOf(step).marks;
    // A player strikes a note by toggling it.
    const one: FillMove = { type: "set", ...first, pencil: true };
    expect(game.hint.keepTrack(one, step, board)).toBe("onTrack");
    const after = game.executeMove(board, one);
    const left = game.hint.refreshStep?.(step, after);
    expect(left === null || left === undefined ? null : strikeOf(left).marks).toEqual(
      rest,
    );
    // A placement the step does not ask for takes the player off it.
    const open = after.values.indexOf(0);
    const off: FillMove = {
      type: "set",
      x: open % after.w,
      y: Math.floor(open / after.w),
      n: 1,
      pencil: false,
    };
    expect(game.hint.keepTrack(off, step, after)).toBe("off");
  });

  it("judges a move by the walk, naming the deduction a placement made", () => {
    const b = dealt(5, "a");
    const step = firstStep(b, "implicit");
    const verdict = game.hint.judgeMove?.(
      b,
      game.executeMove(b, step.move),
      game.newUi(b),
    );
    expect(verdict?.followed).toBe(true);
  });

  it("walks only the Latin library on rows and columns, and refuses anything else", () => {
    const tier = () => 0;
    const ui = () => game.newUi(NEEDS_A_SET);
    const own = { ...squaring.ladder[0], id: "own" };
    expect(() =>
      candidateFill({ ...squaring, ladder: [...squaring.ladder, own] }, tier, ui),
    ).toThrow(/Latin library alone, not own/);
    expect(() => candidateFill({ ...squaring, units: ["rows"] }, tier, ui)).toThrow(
      /rows and columns, not rows/,
    );
  });
});

describe("the preferences of a board that keeps notes", () => {
  it("are the four every note-taking game offers, the reading as declared", () => {
    expect(game.prefs?.map((p) => p.kw)).toEqual([
      "auto-pencil",
      "sticky-pencil-mode",
      "pencil-keep-highlight",
      "hint-notes",
    ]);
    // The fixture declares `hintNotes: implicit`; a hint asked for with no
    // Ui walks the reading a fresh one starts on.
    const b = dealt(5, "a");
    expect(game.newUi(b).candidateReading).toBe("implicit");
    const plan = game.hint.plan(b);
    expect(plan.ok && plan.steps[0].rung).not.toBe("populate");
    const reading = game.prefs?.find((p) => p.kw === "hint-notes");
    if (reading?.type !== "choices") throw new Error("no reading to choose");
    const ui = game.newUi(b);
    reading.set(ui, 1);
    expect(ui.candidateReading).toBe("populate");
    const chosen = game.hint.plan(b, undefined, ui);
    expect(chosen.ok && chosen.steps[0].rung).toBe("populate");
  });
});

describe("a step's struck notes drawn", () => {
  const draw = (b: Board, ui: FillUi, hint: Step | null): readonly DrawOp[] => {
    const render = fillRender(
      squaring,
      { play: squaring.play, lineClues: squaring.lineClues },
      (s) => s,
    );
    const dr = new RecordingDrawing(render.colors(DEFAULT_BACKGROUND));
    render.redraw(dr, render.newDrawState(b, 32), {
      state: b,
      prev: null,
      dir: 1,
      ui,
      animTime: 0,
      flash: NO_FLASH,
      ...(hint === null ? {} : { hint }),
    });
    return dr.ops;
  };

  it("crosses each struck note through in the notes' own color", () => {
    let board = NEEDS_A_SET;
    let step = firstStep(board, "populate");
    while (!isCandidateMove(step.move) || step.move.type !== "pencilStrike") {
      board = game.executeMove(board, step.move);
      step = firstStep(board, "populate");
    }
    const ui = game.newUi(board);
    const lines = (ops: readonly DrawOp[]) => ops.filter((o) => o.op === "line");
    const plain = draw(board, ui, null);
    const shown = draw(board, ui, step);
    const pencil = plain.find(
      (o) => o.op === "text" && o.size < 32 / 2 && /^[1-9]$/.test(o.text),
    );
    if (pencil?.op !== "text") throw new Error("no note drawn");
    // An X a note: two strokes each, in the color the notes are drawn in.
    const added = lines(shown).filter(
      (o) => o.op === "line" && o.color === pencil.color,
    );
    expect(
      added.length -
        lines(plain).filter((o) => o.op === "line" && o.color === pencil.color).length,
    ).toBe(2 * strikeOf(step).marks.length);
  });
});
