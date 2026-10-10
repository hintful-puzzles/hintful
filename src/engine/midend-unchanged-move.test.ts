/**
 * **A move that leaves the board as it was is no step of the history**, and a
 * `Ui` a game changed without saying so is painted: the two things
 * `Midend.interpret` does with an answer it does not take at its word. The
 * sweep over the real games is `input-answers.test.ts`.
 */

import { beforeAll, describe, expect, it } from "vitest";
import { registerAllGames } from "../games/index.ts";
import {
  type FakeDrawState,
  type FakeMove,
  type FakeState,
  fakeGame,
} from "./fake-game.ts";
import { UI_UPDATE } from "./game.ts";
import { click } from "./hint-gesture.ts";
import { Midend } from "./midend.ts";
import {
  CURSOR_LEFT,
  CURSOR_RIGHT,
  CURSOR_UP,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  newCursor,
} from "./pointer.ts";
import { getTsGame } from "./registry.ts";
import { interpretTargetVerbs, squareGrid, type TargetVerbs } from "./target-verb.ts";
import { driveMidend } from "./testing/drive-midend.ts";
import type { Point } from "./types.ts";

/** The fake's moves, and one that builds a new state holding the same count. */
type Move = FakeMove | "same";
type Ui = { cursor: ReturnType<typeof newCursor>; held: boolean; settled: number };

/** The `Ui` of the board dealt last, which the midend holds and hands out to
 * the game alone. */
let lastUi: Ui | null = null;
function dealt(): Ui {
  if (lastUi === null) throw new Error("no board was dealt");
  return lastUi;
}

/** Squares of a row: an odd square's verb counts one, an even square's makes
 * the move that changes nothing. Up makes that move too, after marking the
 * `Ui`; Left marks the `Ui` and answers that nothing happened; Right answers
 * that with the `Ui` untouched. */
function game() {
  const verbs: TargetVerbs<FakeState, Ui, FakeDrawState, Point, Move> = {
    geometry: squareGrid({ size: () => ({ w: 20, h: 1 }), border: () => 0 }),
    primary: { does: "count it", apply: (_s, t) => (t.x % 2 === 1 ? "inc" : "same") },
    sweep: { holds: () => 0 },
  };
  const g = {
    ...fakeGame,
    newUi: (): Ui => {
      lastUi = { cursor: newCursor(), held: false, settled: 0 };
      return lastUi;
    },
    changedState: (ui: Ui) => {
      ui.held = false;
      ui.settled++;
    },
    interpretMove: (
      s: FakeState,
      ui: Ui,
      ds: FakeDrawState,
      p: Point,
      button: number,
    ) => {
      if (button === CURSOR_UP) {
        ui.held = true;
        return "same";
      }
      if (button === CURSOR_LEFT) {
        ui.held = !ui.held;
        return null;
      }
      if (button === CURSOR_RIGHT) return null;
      return interpretTargetVerbs(verbs, s, ui, ds, p, button);
    },
    executeMove: (s: FakeState, m: Move) =>
      m === "same" ? { ...s } : fakeGame.executeMove(s, m),
    hintKeepTrack: (m: Move) => (m === "inc" ? "completed" : "off"),
    hintGesture: () => [click({ x: 15, y: 5 })],
  };
  return g as unknown as typeof fakeGame;
}

const at = (square: number) => square * 10 + 5;

function play() {
  const d = driveMidend(game());
  d.midend.newGame();
  const state = () => {
    const n = d.last("game-state-change");
    if (n === null) throw new Error("the midend sent no state change");
    return n;
  };
  const tap = (square: number) => {
    d.midend.processInput(at(square), 5, LEFT_BUTTON);
    d.midend.processInput(at(square), 5, LEFT_RELEASE);
  };
  return { ...d, m: d.midend, state, tap };
}

describe("a move that leaves the board as it was", () => {
  it("is claimed and painted, and is no step of the history", () => {
    const h = play();
    const painted = h.redraws();
    expect(h.m.processInput(0, 0, CURSOR_UP)).toBe(true);
    expect(h.state()).toMatchObject({ currentMove: 0, totalMoves: 0, canUndo: false });
    expect(h.redraws()).toBeGreaterThan(painted);
    expect(h.timerActive()).toBe(false);
  });

  it("settles the Ui as a move does", () => {
    const h = play();
    const ui = dealt();
    const settled = ui.settled;
    // `changedState` runs once, and puts down what the input picked up.
    h.m.processInput(0, 0, CURSOR_UP);
    expect(ui).toMatchObject({ held: false, settled: settled + 1 });
  });

  it("keeps the moves ahead of it for Redo", () => {
    const h = play();
    h.tap(1);
    h.m.undo();
    h.m.processInput(0, 0, CURSOR_UP);
    expect(h.state()).toMatchObject({ currentMove: 0, totalMoves: 1, canRedo: true });
    h.m.redo();
    expect(h.m.formatAsText()).toBe("count=1");
  });

  it("leaves a drag's other marks one step of Undo", () => {
    const h = play();
    h.tap(1);
    // Squares 3 and 5 count; 4, between them, makes the move that is dropped.
    h.m.processInput(at(3), 5, LEFT_BUTTON);
    h.m.processInput(at(5), 5, LEFT_DRAG);
    h.m.processInput(at(5), 5, LEFT_RELEASE);
    expect(h.m.formatAsText()).toBe("count=3");
    expect(h.state()).toMatchObject({ currentMove: 3 });
    h.m.undo();
    expect(h.m.formatAsText()).toBe("count=1");
    h.m.redo();
    expect(h.m.formatAsText()).toBe("count=3");
  });

  it("does not join a drag whose first mark was dropped to the move before it", () => {
    const h = play();
    h.tap(1);
    // The press on 2 is dropped, so 3 is the drag's first step and 5 joins it.
    h.m.processInput(at(2), 5, LEFT_BUTTON);
    h.m.processInput(at(5), 5, LEFT_DRAG);
    h.m.processInput(at(5), 5, LEFT_RELEASE);
    expect(h.m.formatAsText()).toBe("count=3");
    h.m.undo();
    expect(h.m.formatAsText()).toBe("count=1");
    h.m.undo();
    expect(h.m.formatAsText()).toBe("count=0");
  });

  it("leaves a hint on display, where a move off its step puts it away", () => {
    const h = play();
    expect(h.m.hint()).toBeNull();
    const shown = h.last("status-bar-change");
    h.m.processInput(0, 0, CURSOR_UP);
    expect(h.last("status-bar-change")).toEqual(shown);
  });

  it("never completes a hint's step, so a hint that asks for one is thrown", () => {
    const g = { ...game(), hintGesture: () => [click({ x: 5, y: 5 })] };
    const m = new Midend(g as unknown as typeof fakeGame);
    m.newGame();
    expect(() => m.executeHint()).toThrow(/does not complete its step/);
  });

  it("is recorded as written when a harness replays it", () => {
    const h = play();
    h.m.playMoves(["same" as FakeMove, "inc"]);
    expect(h.state()).toMatchObject({ currentMove: 2, totalMoves: 2 });
  });
});

describe("an input answered as nothing happened", () => {
  it("is painted when the game changed the Ui, and is still not claimed", () => {
    const h = play();
    const painted = h.redraws();
    const notes = h.notes.length;
    expect(h.m.processInput(0, 0, CURSOR_LEFT)).toBe(false);
    expect(h.redraws()).toBe(painted + 1);
    // A repaint and nothing more: no transition is announced.
    expect(h.notes.length).toBe(notes);
  });

  it("asks for no repaint when the Ui is as it was", () => {
    const h = play();
    const painted = h.redraws();
    expect(h.m.processInput(0, 0, CURSOR_RIGHT)).toBe(false);
    expect(h.redraws()).toBe(painted);
  });

  it("is told from an input the game answered as a change of Ui", () => {
    const g = { ...game(), interpretMove: () => UI_UPDATE };
    const d = driveMidend(g as unknown as typeof fakeGame);
    d.midend.newGame();
    expect(d.midend.processInput(0, 0, CURSOR_UP)).toBe(true);
  });
});

describe("a save that holds a move that changed nothing", () => {
  beforeAll(registerAllGames);

  /** Written by the build before the midend kept such a move out
   * (2026-10-10): Loopy, Right, Backspace, Enter. The first move sets an
   * undecided edge to undecided. */
  const SAVE =
    '{"v":3,"puzzleId":"loopy","params":"10x10t0de","desc":"3c1b21b312b11e2a3a32a3b212d22d3a222a32b02a230a2b0a3b2b10b1h31123a22e","moves":[{"kind":"set","ops":[{"edge":0,"state":1}]},{"kind":"set","ops":[{"edge":0,"state":0}]}],"pos":2,"timerElapsed":0,"cheated":false}';

  it("loads to the same board, with each move where the save has it", () => {
    const loopy = getTsGame("loopy");
    if (!loopy) throw new Error("Loopy is not registered");
    const d = driveMidend(loopy);
    expect(d.midend.loadGame(new TextEncoder().encode(SAVE))).toBeNull();
    expect(d.last("game-state-change")).toMatchObject({
      currentMove: 2,
      totalMoves: 2,
    });
    expect(JSON.parse(new TextDecoder().decode(d.midend.saveGame()))).toEqual(
      JSON.parse(SAVE),
    );
    const played = d.midend.formatAsText();
    d.midend.undo();
    expect(d.midend.formatAsText()).not.toBe(played);
    expect(d.last("game-state-change")).toMatchObject({ currentMove: 1 });
  });
});
