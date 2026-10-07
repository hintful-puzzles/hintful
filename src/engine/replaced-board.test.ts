/**
 * The board a new one replaces is kept, one deep: Undo at the new board's first
 * position brings it back as it was left, and Redo returns.
 *
 * Every way a board is replaced is driven here (a deal, an id, a save), since
 * the claim is that they are one path.
 */

import { describe, expect, it } from "vitest";
import { fakeGame } from "./fake-game.ts";
import { LEFT_BUTTON } from "./pointer.ts";
import { RetryLimitExceeded } from "./retry-limit.ts";
import { encodeSave } from "./save.ts";
import { driveMidend } from "./testing/drive-midend.ts";

function driven() {
  const d = driveMidend(fakeGame);
  const m = d.midend;
  return {
    ...d,
    m,
    state: () => d.last("game-state-change"),
    id: () => d.last("game-id-change")?.currentGameId,
    inc: (n = 1) => {
      for (let i = 0; i < n; i++) m.processInput(0, 0, LEFT_BUTTON);
    },
    count: () => m.formatAsText(),
  };
}

/** Board `t9:g9-1` with two moves played, one of them undone. */
function played() {
  const h = driven();
  expect(h.m.newGameFromId("t9:g9-1")).toBeNull();
  h.inc(2);
  h.m.undo();
  return h;
}

const replacements: [string, (h: ReturnType<typeof driven>) => void][] = [
  [
    "a deal",
    (h) => {
      // Another type, so that the deal cannot land on the board left.
      expect(h.m.setParams("t5")).toBeNull();
      expect(h.m.newGame()).toBeNull();
    },
  ],
  ["an id", (h) => expect(h.m.newGameFromId("t5:g5-2")).toBeNull()],
  [
    "a save",
    (h) => {
      const other = driven();
      other.m.newGameFromId("t5:g5-2");
      expect(h.m.loadGame(other.m.saveGame())).toBeNull();
    },
  ],
];

describe.each(replacements)("the board replaced by %s", (_how, replace) => {
  it("is one Undo before the new board's first position", () => {
    const h = played();
    replace(h);
    expect(h.id()).not.toBe("t9:g9-1");
    expect(h.state()).toMatchObject({
      currentMove: 0,
      canUndo: true,
      boardBefore: true,
      boardAfter: false,
    });
    h.m.undo();
    expect(h.id()).toBe("t9:g9-1");
    expect(h.count()).toBe("count=1");
    // As it was left: its cursor, and the move ahead of the cursor.
    expect(h.state()).toMatchObject({
      currentMove: 1,
      totalMoves: 2,
      canRedo: true,
      boardBefore: false,
      boardAfter: true,
    });
  });

  it("comes back with its type as the type chosen", () => {
    const h = played();
    replace(h);
    h.m.undo();
    expect(h.m.getParams()).toBe("t9");
  });

  it("comes back with its time", () => {
    const h = played();
    h.m.timer(41);
    replace(h);
    expect(h.last("timer-change")?.timer?.seconds).toBe(0);
    h.m.undo();
    expect(h.last("timer-change")?.timer?.seconds).toBe(41);
  });

  it("is dropped at the first move on the new board", () => {
    const h = played();
    replace(h);
    h.inc();
    expect(h.state()).toMatchObject({ boardBefore: false });
    h.m.undo();
    expect(h.state()).toMatchObject({ currentMove: 0, canUndo: false });
    h.m.undo();
    expect(h.id()).not.toBe("t9:g9-1");
  });
});

describe("the board an Undo left", () => {
  function undone() {
    const h = played();
    expect(h.m.newGameFromId("t5:g5-2")).toBeNull();
    h.m.undo();
    return h;
  }

  it("is one Redo after the last move of the board brought back", () => {
    const h = undone();
    // The board brought back has a move of its own ahead, which comes first.
    h.m.redo();
    expect(h.id()).toBe("t9:g9-1");
    expect(h.count()).toBe("count=2");
    expect(h.state()).toMatchObject({ canRedo: true, boardAfter: true });
    h.m.redo();
    expect(h.id()).toBe("t5:g5-2");
    expect(h.state()).toMatchObject({ currentMove: 0, totalMoves: 0, canRedo: false });
  });

  it("can be gone back from again, to the board as it was left that time", () => {
    const h = undone();
    h.m.redo();
    h.m.redo();
    h.m.undo();
    expect(h.id()).toBe("t9:g9-1");
    expect(h.state()).toMatchObject({ currentMove: 2, totalMoves: 2 });
  });

  it("is dropped at the first move on the board brought back", () => {
    const h = undone();
    h.inc();
    expect(h.state()).toMatchObject({ canRedo: false, boardAfter: false });
    h.m.redo();
    expect(h.id()).toBe("t9:g9-1");
  });

  it("is dropped by a restart, which is a step made on the board", () => {
    const h = undone();
    h.m.restartGame();
    expect(h.state()).toMatchObject({ boardAfter: false });
  });
});

describe("what is kept", () => {
  it("is one board deep", () => {
    const h = played();
    h.m.newGameFromId("t5:g5-2");
    h.m.newGameFromId("t4:g4-3");
    h.m.undo();
    expect(h.id()).toBe("t5:g5-2");
    expect(h.state()).toMatchObject({ canUndo: false, boardBefore: false });
  });

  it("includes a board no move was made on", () => {
    const h = driven();
    h.m.newGameFromId("t9:g9-1");
    h.m.newGameFromId("t5:g5-2");
    h.m.undo();
    expect(h.id()).toBe("t9:g9-1");
  });

  it("is not an unplayed copy of the board that replaced it", () => {
    // A page opening a board by id and then its autosave, and a deterministic
    // deal: in both the board left holds nothing the new one lacks.
    const saved = played().m.saveGame();
    const h = driven();
    h.m.newGameFromId("t9:g9-1");
    expect(h.m.loadGame(saved)).toBeNull();
    expect(h.state()).toMatchObject({ currentMove: 1, boardBefore: false });
    h.m.undo();
    h.m.undo();
    expect(h.id()).toBe("t9:g9-1");
    expect(h.state()).toMatchObject({ currentMove: 0, canUndo: false });
  });

  it("is a played copy of the board that replaced it", () => {
    const h = played();
    h.m.newGameFromId("t9:g9-1");
    expect(h.state()).toMatchObject({ totalMoves: 0, boardBefore: true });
    h.m.undo();
    expect(h.state()).toMatchObject({ currentMove: 1, totalMoves: 2 });
  });

  it("is nothing before the first board", () => {
    const h = driven();
    h.m.newGame();
    expect(h.state()).toMatchObject({ canUndo: false, boardBefore: false });
  });

  it("is unchanged where a deal finds no board", () => {
    const barren: typeof fakeGame = {
      ...fakeGame,
      newDesc: () => {
        throw new RetryLimitExceeded("fake: generation", 10);
      },
    };
    const d = driveMidend(barren);
    d.midend.newGameFromId("t4:g4-3");
    d.midend.loadGame(played().m.saveGame());
    expect(d.midend.newGame()).not.toBeNull();
    expect(d.last("game-id-change")?.currentGameId).toBe("t9:g9-1");
    expect(d.last("game-state-change")).toMatchObject({
      currentMove: 1,
      boardBefore: true,
    });
  });

  it("survives a save that fails partway, which leaves the save's first board", () => {
    const h = played();
    const broken = encodeSave({
      v: 3,
      puzzleId: fakeGame.id,
      params: "t5",
      desc: "g5-2",
      moves: ["inc", "no-such-move"],
      pos: 2,
      timerElapsed: 0,
      cheated: false,
    });
    const refusing: typeof fakeGame = {
      ...fakeGame,
      executeMove: (s, m) =>
        (m as string) === "no-such-move"
          ? (undefined as never)
          : fakeGame.executeMove(s, m),
    };
    const d = driveMidend(refusing);
    d.midend.loadGame(h.m.saveGame());
    expect(d.midend.loadGame(broken)).toMatch(/Could not restore/);
    expect(d.last("game-id-change")?.currentGameId).toBe("t5:g5-2");
    d.midend.undo();
    expect(d.last("game-id-change")?.currentGameId).toBe("t9:g9-1");
    expect(d.last("game-state-change")).toMatchObject({
      currentMove: 1,
      totalMoves: 2,
    });
  });
});

describe("the board's number", () => {
  it("changes with the board and returns with a board brought back", () => {
    const h = played();
    const first = h.state()?.board;
    h.m.newGameFromId("t5:g5-2");
    const second = h.state()?.board;
    expect(second).not.toBe(first);
    h.m.undo();
    expect(h.state()?.board).toBe(first);
    h.m.redo();
    h.m.redo();
    expect(h.state()?.board).toBe(second);
    h.m.newGame();
    expect([first, second]).not.toContain(h.state()?.board);
  });

  it("is one number through a load, and a new one", () => {
    const h = played();
    const saved = h.m.saveGame();
    const before = h.state()?.board;
    h.notes.length = 0;
    h.m.loadGame(saved);
    const numbers = new Set(
      h.notes.flatMap((n) => (n.type === "game-state-change" ? [n.board] : [])),
    );
    expect(numbers.size).toBe(1);
    expect(numbers.has(before ?? -1)).toBe(false);
  });

  it("does not change with a move, an undo or a restart", () => {
    const h = played();
    const board = h.state()?.board;
    h.inc();
    h.m.undo();
    h.m.restartGame();
    expect(h.state()?.board).toBe(board);
  });
});
