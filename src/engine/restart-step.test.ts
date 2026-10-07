/**
 * A restart is one step of the history: Undo crosses it back to the board as it
 * was played, Redo crosses it forward again, and a save holds it.
 *
 * The fake game is a counter, so a position is one number and every claim here
 * is about *which* position the cursor is on and what the midend says of it.
 */

import { describe, expect, it } from "vitest";
import { fakeGame } from "./fake-game.ts";
import { LEFT_BUTTON } from "./pointer.ts";
import { decodeSave, encodeSave } from "./save.ts";
import { driveMidend } from "./testing/drive-midend.ts";

function driven(target = 9) {
  const d = driveMidend(fakeGame);
  const m = d.midend;
  expect(m.newGameFromId(`t${target}:g${target}-1`)).toBeNull();
  return {
    ...d,
    m,
    state: () => d.last("game-state-change"),
    inc: (n = 1) => {
      for (let i = 0; i < n; i++) m.processInput(0, 0, LEFT_BUTTON);
    },
    count: () => m.formatAsText(),
  };
}

describe("a restart is a step of the history", () => {
  it("adds a step to the board as it started, with the moves behind it", () => {
    const h = driven();
    h.inc(2);
    h.m.restartGame();
    expect(h.count()).toBe("count=0");
    expect(h.state()).toMatchObject({
      currentMove: 3,
      totalMoves: 3,
      canUndo: true,
      canRedo: false,
      restarts: [3],
    });
  });

  it("undo returns the board as it was, and redo restarts again", () => {
    const h = driven();
    h.inc(2);
    h.m.restartGame();
    h.m.undo();
    expect(h.count()).toBe("count=2");
    expect(h.state()).toMatchObject({ currentMove: 2, totalMoves: 3, canRedo: true });
    // The moves behind the restart are still moves: undo goes on through them.
    h.m.undo();
    expect(h.count()).toBe("count=1");
    h.m.redo();
    h.m.redo();
    expect(h.count()).toBe("count=0");
    expect(h.state()).toMatchObject({ currentMove: 3, canRedo: false });
  });

  it("a move made after undoing a restart drops the restart", () => {
    const h = driven();
    h.inc(2);
    h.m.restartGame();
    h.m.undo();
    h.inc();
    expect(h.count()).toBe("count=3");
    expect(h.state()).toMatchObject({ totalMoves: 3, canRedo: false, restarts: [] });
  });

  it("does nothing where nothing has been played since the start or a restart", () => {
    const h = driven();
    h.m.restartGame();
    expect(h.state()).toMatchObject({ totalMoves: 0, restarts: [] });
    h.inc();
    h.m.restartGame();
    h.m.restartGame();
    expect(h.state()).toMatchObject({ totalMoves: 2, restarts: [2] });
  });

  it("at the start with moves ahead, keeps the moves ahead", () => {
    const h = driven();
    h.inc(2);
    h.m.undo();
    h.m.undo();
    h.m.restartGame();
    expect(h.state()).toMatchObject({ currentMove: 0, totalMoves: 2, canRedo: true });
  });

  it("crossing a restart plays no move animation", () => {
    const animated = { ...fakeGame, animLength: () => 0.5 };
    const d = driveMidend(animated);
    d.midend.newGame();
    d.midend.processInput(0, 0, LEFT_BUTTON);
    d.midend.timer(1);
    d.midend.restartGame();
    expect(d.midend.currentAnimationMs()).toBe(0);
    d.midend.undo();
    expect(d.midend.currentAnimationMs()).toBe(0);
    d.midend.redo();
    expect(d.midend.currentAnimationMs()).toBe(0);
    // The control: a step between two boards one move apart does animate.
    d.midend.undo();
    d.midend.undo();
    expect(d.midend.currentAnimationMs()).toBe(500);
  });
});

describe("the solver record across a restart", () => {
  it("is cleared by the restart and comes back with the moves it belongs to", () => {
    const h = driven(3);
    h.m.solve();
    expect(h.state()?.status).toBe("solved-with-help");
    h.m.restartGame();
    h.inc(3);
    // Solved by hand since the restart.
    expect(h.state()?.status).toBe("solved");
    for (let i = 0; i < 4; i++) h.m.undo();
    expect(h.count()).toBe("count=3");
    expect(h.state()?.status).toBe("solved-with-help");
    for (let i = 0; i < 4; i++) h.m.redo();
    expect(h.state()?.status).toBe("solved");
  });

  it("is kept for a solve made after the restart, across undo and redo of both", () => {
    const h = driven(3);
    h.inc();
    h.m.restartGame();
    h.m.solve();
    h.m.undo();
    h.m.undo();
    h.m.redo();
    h.m.redo();
    expect(h.state()?.status).toBe("solved-with-help");
    h.m.undo();
    h.m.undo();
    // Before the restart nothing was solved for the player.
    h.inc(2);
    expect(h.state()?.status).toBe("solved");
  });

  it("holds one record for each stretch between restarts", () => {
    const h = driven(3);
    h.m.solve(); // stretch 0: solved with help
    h.m.restartGame();
    h.inc(3); // stretch 1: by hand
    h.m.restartGame();
    h.m.solve(); // stretch 2: with help
    const read = () => h.state()?.status;
    expect(read()).toBe("solved-with-help");
    h.m.undo();
    h.m.undo();
    expect(read()).toBe("solved");
    for (let i = 0; i < 4; i++) h.m.undo();
    expect(read()).toBe("solved-with-help");
    for (let i = 0; i < 4; i++) h.m.redo();
    expect(read()).toBe("solved");
    h.m.redo();
    h.m.redo();
    expect(read()).toBe("solved-with-help");
  });
});

describe("a save holding a restart", () => {
  /** Stretch 0 solved with help, a restart, then one move by hand. */
  function played() {
    const h = driven(3);
    h.m.solve();
    h.m.restartGame();
    h.inc();
    return h;
  }

  it("writes the restart as an entry of the log, apart from the moves", () => {
    const env = decodeSave(played().m.saveGame());
    expect(env).toMatchObject({
      v: 3,
      moves: ["solve", null, "inc"],
      restarts: [{ at: 1, cheated: true }],
      pos: 3,
      cheated: false,
    });
  });

  it("writes no restarts where there are none", () => {
    const h = driven();
    h.inc();
    expect(Object.hasOwn(decodeSave(h.m.saveGame()), "restarts")).toBe(false);
  });

  it("round-trips with the cursor after the restart", () => {
    const a = played();
    const b = driven();
    expect(b.m.loadGame(a.m.saveGame())).toBeNull();
    expect(b.count()).toBe("count=1");
    expect(b.state()).toMatchObject({ currentMove: 3, totalMoves: 3, restarts: [2] });
    b.m.undo();
    b.m.undo();
    expect(b.count()).toBe("count=3");
    expect(b.state()?.status).toBe("solved-with-help");
  });

  it("writes again what it opened", () => {
    const a = played();
    const b = driven();
    expect(b.m.loadGame(a.m.saveGame())).toBeNull();
    expect(decodeSave(b.m.saveGame())).toEqual(decodeSave(a.m.saveGame()));
  });

  it("round-trips with the cursor before the restart", () => {
    const a = played();
    a.m.undo();
    a.m.undo();
    const saved = a.m.saveGame();
    expect(decodeSave(saved)).toMatchObject({
      pos: 1,
      cheated: true,
      restarts: [{ at: 1, cheated: false }],
    });

    const b = driven();
    expect(b.m.loadGame(saved)).toBeNull();
    expect(b.count()).toBe("count=3");
    expect(b.state()).toMatchObject({
      currentMove: 1,
      totalMoves: 3,
      canRedo: true,
      status: "solved-with-help",
    });
    b.m.redo();
    expect(b.count()).toBe("count=0");
    b.m.redo();
    b.inc(2);
    expect(b.state()?.status).toBe("solved");
    expect(decodeSave(b.m.saveGame())).toMatchObject({ pos: 5, cheated: false });
  });

  it("opens a save written before a restart was a step", () => {
    const v2 = {
      v: 2,
      puzzleId: fakeGame.id,
      params: "t9",
      desc: "g9-1",
      moves: ["inc", "inc"],
      pos: 1,
      timerElapsed: 7,
      cheated: false,
    };
    const b = driven();
    expect(b.m.loadGame(encodeSave(v2 as never))).toBeNull();
    expect(b.count()).toBe("count=1");
    expect(b.state()).toMatchObject({ currentMove: 1, totalMoves: 2, restarts: [] });
  });
});

describe("a load reports the board once", () => {
  it("says nothing of the steps it replays", () => {
    const a = driven();
    a.inc(4);
    a.m.undo();
    const b = driven();
    b.notes.length = 0;
    expect(b.m.loadGame(a.m.saveGame())).toBeNull();
    const states = b.notes.filter((n) => n.type === "game-state-change");
    expect(states).toHaveLength(1);
    expect(states[0]).toMatchObject({ currentMove: 3, totalMoves: 4 });
    expect(b.notes.filter((n) => n.type === "game-id-change")).toHaveLength(1);
    expect(b.notes.filter((n) => n.type === "params-change")).toHaveLength(1);
  });
});
