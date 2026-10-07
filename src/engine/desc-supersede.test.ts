/**
 * Desc supersession (upstream `midend_supersede_game_desc`), driven by a fake
 * game with exactly the shape Mines has: a board whose layout does not exist
 * until the first click, and a desc for the board that click made, naming the
 * layout *and* the click.
 *
 * The first click carries its layout in the move, as Mines' does, so replaying
 * the move log rebuilds the board with nothing derived again. `textFormat` is
 * the window onto the restored board: it is how each test says *which desc* a
 * restart or a load actually rebuilt from.
 */

import { describe, expect, it } from "vitest";
import type { Game } from "./game.ts";
import { decodeSave, encodeSave } from "./save.ts";
import { driveMidend } from "./testing/drive-midend.ts";

interface MinesishParams {
  size: number;
}
interface MinesishState {
  size: number;
  /** `null` until the first click lays it out — the whole point. */
  layout: string | null;
  /** Where the first click landed (the layout is laid out around it). */
  clickedAt: number | null;
  opened: number[];
}
/** A click, the first of which says what it laid out. A negative one opens
 * nothing, as a flag set before any square is opened. */
type MinesishMove = { click: number; lays?: string };

/** The first click at `at`, with the layout it lays out. */
const first = (at: number): MinesishMove => ({ click: at, lays: `L${at}` });

/** The desc of a board laid out: `"<click>,<layout>"`. Before that it is
 * `"blank"`, no layout at all. */
const minesish: Game<MinesishParams, MinesishState, MinesishMove, null, null> = {
  id: "__minesish__",
  defaultParams: () => ({ size: 9 }),
  presets: () => ({ title: "root", params: { size: 9 } }),
  encodeParams: (p) => `s${p.size}`,
  decodeParams: (s) => ({ size: Number(/^s(\d+)$/.exec(s)?.[1] ?? NaN) }),
  validateParams: (p) => (p.size > 0 ? null : "size must be positive"),
  newDesc: () => ({ desc: "blank" }),
  newState: (p, desc) => {
    if (desc === "blank") {
      return { size: p.size, layout: null, clickedAt: null, opened: [] };
    }
    const [head, tail] = desc.split(",");
    return {
      size: p.size,
      layout: tail,
      clickedAt: Number(head),
      opened: [Number(head)],
    };
  },
  newUi: () => null,
  interpretMove: () => null,
  executeMove: (s, m) => {
    if (m.click < 0) return { ...s, opened: [...s.opened] };
    if (s.layout === null) {
      if (m.lays === undefined) throw new Error("a first click lays the board out");
      return { ...s, layout: m.lays, clickedAt: m.click, opened: [m.click] };
    }
    return { ...s, opened: [...s.opened, m.click] };
  },
  supersededDesc: (s) => (s.layout === null ? null : `${s.clickedAt},${s.layout}`),
  status: () => "ongoing",
  textFormat: (s) =>
    `layout=${s.layout} clicked=${s.clickedAt} opened=[${s.opened.join(",")}]`,
  colors: (bg) => [bg],
  computeSize: () => ({ w: 10, h: 10 }),
  // Required members this double has nothing to say about; see
  // `Game.newDrawState` (`audit-vestigial-contract-surface`).
  newDrawState: () => null,
  redraw: () => {},
};

/** The same game with the hook removed — the guard that a game which says
 * nothing keeps the desc it started with. */
const plain: Game<MinesishParams, MinesishState, MinesishMove, null, null> = {
  ...minesish,
  id: "__plain__",
  supersededDesc: undefined,
};

const BLANK = "layout=null clicked=null opened=[]";

function harness(game = minesish) {
  const d = driveMidend(game);
  const m = d.midend;
  const gameId = () => d.last("game-id-change")?.currentGameId;
  const idChanges = () => d.notes.filter((n) => n.type === "game-id-change").length;
  return { m, gameId, idChanges, board: () => m.formatAsText() };
}

describe("desc supersession", () => {
  it("the first click supersedes the desc and re-announces the game ID", () => {
    const h = harness();
    h.m.newGame();
    expect(h.gameId()).toBe("s9:blank");
    expect(h.board()).toBe(BLANK);

    h.m.playMoves([first(4)]);

    // The shareable ID now names the real board (the layout, and where the
    // click that laid it out landed) — not the placeholder the player started
    // from, which describes no layout at all.
    expect(h.gameId()).toBe("s9:4,L4");
    expect(h.idChanges()).toBe(2); // one for the new game, one for the supersession
  });

  it("later moves do not re-announce the ID: the board is the same one", () => {
    const h = harness();
    h.m.newGame();
    h.m.playMoves([first(4), { click: 7 }, { click: 2 }]);
    expect(h.gameId()).toBe("s9:4,L4");
    expect(h.idChanges()).toBe(2);
  });

  it("the ID follows the position: undoing the first click is back on the starting desc", () => {
    const h = harness();
    h.m.newGame();
    h.m.playMoves([first(4)]);
    h.m.undo();

    // The board is blank again, and so is what the ID names: the laid-out
    // board is one Redo away, and a different first click lays out another.
    expect(h.board()).toBe(BLANK);
    expect(h.gameId()).toBe("s9:blank");
    expect(h.idChanges()).toBe(3);
    h.m.redo();
    expect(h.gameId()).toBe("s9:4,L4");
    h.m.undo();
    h.m.playMoves([first(2)]);
    expect(h.gameId()).toBe("s9:2,L2");
    expect(h.board()).toBe("layout=L2 clicked=2 opened=[2]");
  });

  it("restart rebuilds from the superseded desc, not the pre-click board", () => {
    const h = harness();
    h.m.newGame();
    h.m.playMoves([first(4), { click: 7 }]);
    expect(h.board()).toBe("layout=L4 clicked=4 opened=[4,7]");

    h.m.restartGame();

    // Upstream restarts to *after* the first click, "so you don't have to
    // remember where you clicked": the click is still open and only the second
    // move is gone. Restarting to `history[0]` would have given the blank board.
    expect(h.board()).toBe("layout=L4 clicked=4 opened=[4]");
    expect(h.board()).not.toBe(BLANK);
    // The restart is a step: Undo crosses it back to the board as played.
    h.m.undo();
    expect(h.board()).toBe("layout=L4 clicked=4 opened=[4,7]");
  });

  it("a restart made before the first click goes to the blank board, in play and replayed", () => {
    const h = harness();
    h.m.newGame();
    h.m.playMoves([{ click: -1 }]);
    h.m.restartGame();
    expect(h.board()).toBe(BLANK);
    h.m.playMoves([first(4)]);
    const saved = h.m.saveGame();
    expect(decodeSave(saved)).toMatchObject({
      desc: "4,L4",
      privDesc: "blank",
      restarts: [{ at: 1 }],
    });

    const b = harness();
    expect(b.m.loadGame(saved)).toBeNull();
    expect(b.board()).toBe("layout=L4 clicked=4 opened=[4]");
    b.m.undo();
    expect(b.board()).toBe(BLANK);
    // A restart made now is the superseded kind, in the loaded game as in play.
    b.m.redo();
    b.m.playMoves([{ click: 7 }]);
    b.m.restartGame();
    expect(b.board()).toBe("layout=L4 clicked=4 opened=[4]");
  });

  it("a save taken after supersession carries the board in play and the desc it started from", () => {
    const h = harness();
    h.m.newGame();
    h.m.playMoves([first(4), { click: 7 }]);
    const save = decodeSave(h.m.saveGame());
    expect(save.desc).toBe("4,L4"); // the board in play
    expect(save.privDesc).toBe("blank"); // what the move log replays onto
    expect(save.moves).toEqual([first(4), { click: 7 }]);
  });

  it("a restored save rebuilds state 0 from the starting desc and replays cleanly", () => {
    const h = harness();
    h.m.newGame();
    h.m.playMoves([first(4), { click: 7 }]);
    const data = h.m.saveGame();

    const h2 = harness();
    expect(h2.m.loadGame(data)).toBeNull();

    // The restored position is the saved one, and the ID still names the real board.
    expect(h2.board()).toBe("layout=L4 clicked=4 opened=[4,7]");
    expect(h2.gameId()).toBe("s9:4,L4");

    // Undo to state 0: it was rebuilt from the *starting* desc. Had it come
    // from the public one, square 4 would already be open here, and the
    // replayed first click would have had no board left to lay out.
    h2.m.undo();
    h2.m.undo();
    expect(h2.board()).toBe(BLANK);
    expect(h2.gameId()).toBe("s9:blank");

    // Saved from there, the board in play is the starting one, the laid-out
    // board still ahead in the move log.
    const round = decodeSave(h2.m.saveGame());
    expect(round.desc).toBe("blank");
    expect(round.privDesc).toBeUndefined();
    expect(round.moves).toEqual([first(4), { click: 7 }]);
    expect(round.pos).toBe(0);
    const h3 = harness();
    expect(h3.m.loadGame(h2.m.saveGame())).toBeNull();
    expect(h3.gameId()).toBe("s9:blank");
    h3.m.redo();
    expect(h3.gameId()).toBe("s9:4,L4");
  });

  it("a replay does not derive the board again: the move's layout is the one restored", () => {
    const h = harness();
    h.m.newGame();
    h.m.playMoves([first(4)]);
    const save = decodeSave(h.m.saveGame());
    // As if written by a build whose generator laid square 4 out differently.
    const other = encodeSave({
      ...save,
      desc: "4,older",
      moves: [{ click: 4, lays: "older" }],
    });
    const h2 = harness();
    expect(h2.m.loadGame(other)).toBeNull();
    expect(h2.board()).toBe("layout=older clicked=4 opened=[4]");
    expect(h2.gameId()).toBe("s9:4,older");
  });

  it("a save taken before the first click is an ordinary, un-superseded save", () => {
    const h = harness();
    h.m.newGame();
    const save = decodeSave(h.m.saveGame());
    expect(save.desc).toBe("blank");
    expect(save.privDesc).toBeUndefined();

    const h2 = harness();
    expect(h2.m.loadGame(h.m.saveGame())).toBeNull();
    expect(h2.gameId()).toBe("s9:blank");
    expect(h2.board()).toBe(BLANK);

    // …and it still supersedes when the click finally comes.
    h2.m.playMoves([first(1)]);
    expect(h2.gameId()).toBe("s9:1,L1");
  });

  it("a game without the hook never has its desc replaced", () => {
    const h = harness(plain);
    h.m.newGame();
    h.m.playMoves([first(4), { click: 7 }]);

    expect(h.gameId()).toBe("s9:blank");
    expect(h.idChanges()).toBe(1);
    expect(decodeSave(h.m.saveGame()).privDesc).toBeUndefined();

    // Restart still returns it to `history[0]` — the rebuild-from-desc branch
    // belongs to superseding games alone.
    h.m.restartGame();
    expect(h.board()).toBe(BLANK);
    expect(decodeSave(h.m.saveGame()).desc).toBe("blank");
  });
});
