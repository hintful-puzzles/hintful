/**
 * Tier-2 render-ops test: drive Guess's `redraw` against the engine's
 * shared `RecordingDrawing` and assert the draw-call structure — the
 * first-draw background fill, a correct-place feedback marker in
 * COL_CORRECTPLACE, the hold bar in COL_HOLD on a held slot, and the
 * solution reveal appearing only once the game is over.
 */
import { describe, expect, it } from "vitest";
import { randomNew } from "../../engine/random/index.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { guessGame } from "./index.ts";
import {
  COL_1,
  COL_CORRECTPLACE,
  COL_CURSOR,
  COL_HOLD,
  COL_WRONG,
  type GuessDrawState,
  redraw,
} from "./render.ts";
import { defaultParams, type GuessUi, newDesc, newState } from "./state.ts";

const PALETTE = guessGame.colors(DEFAULT_BACKGROUND);

function recordingDrawing(): { dr: RecordingDrawing; ops: RecordingDrawing["ops"] } {
  const dr = new RecordingDrawing(PALETTE);
  return { dr, ops: dr.ops };
}

const TS = 32;
const params = defaultParams();
const ANY_DESC = newDesc(params, randomNew("render-any")).desc;

function freshDs(): GuessDrawState {
  return guessGame.newDrawState(newState(params, ANY_DESC), TS) as GuessDrawState;
}

function freshUi(state = newState(params, ANY_DESC)): GuessUi {
  const ui = guessGame.newUi(state);
  guessGame.changedState?.(ui, null, state);
  return ui;
}

describe("Guess redraw", () => {
  it("draws a correct-place feedback marker after a scored guess", () => {
    const { desc } = newDesc(params, randomNew("render-fb"));
    const s0 = newState(params, desc);
    const wrong = s0.solution.slice();
    wrong[0] = (wrong[0] % params.ncolors) + 1; // 3 exact matches remain
    const s1 = guessGame.executeMove(s0, {
      type: "guess",
      pegs: wrong,
      holds: [false, false, false, false],
    });
    expect(s1.guesses[0].feedback).toContain(1); // FEEDBACK_CORRECTPLACE

    const ds = freshDs();
    const ui = freshUi(s1);
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, s0, s1, 1, ui, 0, 0);
    expect(ops.some((o) => o.op === "circle" && o.fill === COL_CORRECTPLACE)).toBe(
      true,
    );
  });

  it("draws the hold bar on a held active slot", () => {
    const s = newState(params, ANY_DESC);
    const ds = freshDs();
    const ui = freshUi(s);
    ui.holds[0] = true;
    const { dr, ops } = recordingDrawing();
    redraw(dr, ds, null, s, 1, ui, 0, 0);
    expect(ops.some((o) => o.op === "rect" && o.color === COL_HOLD && o.h === 2)).toBe(
      true,
    );
  });

  it("draws a ruled-out color as nothing at all", () => {
    const { desc } = newDesc(params, randomNew("render-ruled-out"));
    const s0 = newState(params, desc);
    const marked = guessGame.executeMove(s0, {
      type: "mark",
      marks: [{ pos: 2, color: 4 }],
      ruledOut: true,
    });
    const count = (s: typeof s0) => {
      const ds = freshDs();
      const { dr, ops } = recordingDrawing();
      redraw(dr, ds, null, s, 1, freshUi(s), 0, 0);
      return opsOfKind(ops, "rect").filter(
        (o) => o.color === COL_1 + 3 && o.y >= ds.solny,
      ).length;
    };
    expect(count(s0)).toBe(params.npegs);
    expect(count(marked)).toBe(params.npegs - 1);
  });

  it("reveals the solution row only once the game is over", () => {
    const { desc } = newDesc(params, randomNew("render-reveal"));
    const s0 = newState(params, desc);

    // Unsolved: no peg circles in the solution row (y >= solny).
    const dsA = freshDs();
    const { dr: drA, ops: opsA } = recordingDrawing();
    redraw(drA, dsA, null, s0, 1, freshUi(s0), 0, 0);
    /** A peg is a circle in one of the ten peg colors, wherever it is drawn. The
     * answer row paints every color there too, as square blocks, and a block
     * must never read as a revealed peg. */
    const pegsBelow = (ops: RecordingDrawing["ops"], y: number) =>
      opsOfKind(ops, "circle").some((o) => o.fill >= 6 && o.fill <= 15 && o.cy >= y);
    expect(pegsBelow(opsA, dsA.solny)).toBe(false);
    const blocks = opsOfKind(opsA, "rect").filter(
      (o) => o.color >= 6 && o.color <= 15 && o.y >= dsA.solny,
    );
    expect(blocks.length).toBe(params.ncolors * params.npegs);
    for (const b of blocks) expect(Math.max(b.w, b.h) * 2).toBeLessThan(dsA.tileSize);

    // Solved: the solution pegs are revealed in the solution row.
    const won = guessGame.executeMove(s0, {
      type: "guess",
      pegs: s0.solution.slice(),
      holds: [false, false, false, false],
    });
    const dsB = freshDs();
    const { dr: drB, ops: opsB } = recordingDrawing();
    redraw(drB, dsB, s0, won, 1, freshUi(won), 0, 0);
    expect(pegsBelow(opsB, dsB.solny)).toBe(true);
  });
});

describe("Guess's check", () => {
  const { desc } = newDesc(params, randomNew("check"));
  const s0 = newState(params, desc);
  const rule = (s: typeof s0, pos: number, color: number) =>
    guessGame.executeMove(s, { type: "mark", marks: [{ pos, color }], ruledOut: true });
  const other = (pos: number) => (s0.solution[pos] % params.ncolors) + 1;

  it("finds a slot whose marks rule out its own color, and says only which slot", () => {
    expect(guessGame.findMistakes?.(s0)).toEqual([]);
    // A guess that is not the code is a probe, never a mistake.
    const probed = guessGame.executeMove(s0, {
      type: "guess",
      pegs: s0.solution.map((_, pos) => other(pos)),
      holds: s0.solution.map(() => false),
    });
    expect(probed.nextGo).toBe(1);
    expect(guessGame.findMistakes?.(probed)).toEqual([]);
    const right = rule(s0, 1, other(1));
    expect(guessGame.findMistakes?.(right)).toEqual([]);
    const wrong = rule(right, 1, s0.solution[1]);
    expect(guessGame.findMistakes?.(wrong)).toEqual([{ pos: 1 }]);
    // Every color ruled out still reads as wrong.
    let all = s0;
    for (let c = 1; c <= params.ncolors; c++) all = rule(all, 2, c);
    expect(guessGame.findMistakes?.(all)).toEqual([{ pos: 2 }]);
  });

  it("frames the slot on a board already drawn, and clears it (paint twice)", () => {
    const wrong = rule(s0, 0, s0.solution[0]);
    const ds = freshDs();
    const ui = freshUi(wrong);
    const paint = (mistakes?: readonly { pos: number }[]) => {
      const rec = new RecordingDrawing(PALETTE);
      redraw(rec, ds, null, wrong, 1, ui, 0, 0, undefined, mistakes);
      return rec.ops;
    };
    paint();
    const settled = paint().length;
    const framed = paint(guessGame.findMistakes?.(wrong));
    expect(framed.length).toBeGreaterThan(settled);
    expect(framed.some((o) => o.op === "rect" && o.color === COL_WRONG)).toBe(true);
    const cleared = paint();
    expect(cleared.length).toBeGreaterThan(settled);
    expect(cleared.some((o) => "color" in o && o.color === COL_WRONG)).toBe(false);
  });

  it("draws the frame over the notes cursor on the slot just marked", () => {
    const wrong = rule(s0, 0, s0.solution[0]);
    const ui = freshUi(wrong);
    ui.pencilMode = true;
    ui.cursor = { ...ui.cursor, x: 0, visible: true };
    const rec = new RecordingDrawing(PALETTE);
    redraw(rec, freshDs(), null, wrong, 1, ui, 0, 0, undefined, [{ pos: 0 }]);
    const last = (color: number) =>
      rec.ops.findLastIndex((o) => o.op === "rect" && o.color === color);
    expect(last(COL_CURSOR)).toBeGreaterThanOrEqual(0);
    expect(last(COL_WRONG)).toBeGreaterThan(last(COL_CURSOR));
  });
});
