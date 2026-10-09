/**
 * Behavioral tests for the Sokoban port.
 *
 * Tier 1 — the codec, move classification, push/pit mechanics, the
 * "cannot become more complete" win rule, and generator determinism.
 * Tier 2.5 — a render-scenario frame with targeted op assertions + a
 * snapshot (a generated board and a completed/flash frame).
 *
 * The byte-match generator differential lives in
 * `sokoban-differential.test.ts`; these cover the interactive paths the
 * differential never touches (execute/win/pits).
 */
import { describe, expect, it } from "vitest";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
  validateDesc,
} from "../../engine/desc-error.ts";
import { Midend, UI_UPDATE } from "../../engine/index.ts";
import { paramsError } from "../../engine/params.ts";
import {
  CURSOR_DOWN,
  CURSOR_RIGHT,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
} from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { driveMidend } from "../../engine/testing/drive-midend.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { newSokobanDesc } from "./generator.ts";
import { executeMove, sokobanGame } from "./index.ts";
import {
  COL_AIM,
  COL_BARREL,
  COL_FLOOR,
  COL_PLAYER,
  COL_WALL,
  type SokobanDrawState,
} from "./render.ts";
import {
  BARREL,
  BARRELTARGET,
  DEEP_PIT,
  decodeParams,
  encodeBoard,
  encodeParams,
  moveType,
  newState,
  type SokobanMove,
  type SokobanParams,
  type SokobanState,
  type SokobanUi,
  SPACE,
  status,
  TARGET,
} from "./state.ts";

type SokobanMidend = Midend<
  SokobanParams,
  SokobanState,
  SokobanMove,
  SokobanUi,
  SokobanDrawState
>;

/** Redraw a midend to a recording and return its ops (a render-equivalence
 * probe — the Midend exposes state only through drawing). */
function renderOps(me: SokobanMidend) {
  const dr = new RecordingDrawing(sokobanGame.colors(DEFAULT_BACKGROUND));
  me.redraw(dr);
  return dr.ops;
}

// A char-code map for building test levels from readable rows.
const CH: Record<string, number> = {
  w: "w".charCodeAt(0),
  s: "s".charCodeAt(0),
  t: "t".charCodeAt(0),
  b: "b".charCodeAt(0),
  f: "f".charCodeAt(0),
  u: "u".charCodeAt(0),
  v: "v".charCodeAt(0),
  p: "p".charCodeAt(0),
  d: "d".charCodeAt(0),
};

/** Build a state directly from readable rows (bypasses the desc codec).
 * The player char ('u'/'v') is recorded as px/py with SPACE/TARGET beneath. */
function stateFromRows(rows: string[]): SokobanState {
  const h = rows.length;
  const w = rows[0].length;
  const grid = new Uint8Array(w * h);
  let px = -1;
  let py = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === "u" || ch === "v") {
        px = x;
        py = y;
        grid[y * w + x] = ch === "v" ? CH["t"] : CH["s"];
      } else {
        grid[y * w + x] = CH[ch];
      }
    }
  }
  return { w, h, grid, px, py };
}

const move = (dx: number, dy: number): SokobanMove => ({ type: "move", dx, dy });

// --- params -----------------------------------------------------------

describe("Sokoban params", () => {
  it("round-trips and decodes leniently", () => {
    const p: SokobanParams = { w: 16, h: 12 };
    expect(encodeParams(p, true)).toBe("16x12");
    expect(decodeParams("16x12")).toEqual(p);
    // A bare width yields a square board.
    expect(decodeParams("8")).toEqual({ w: 8, h: 8 });
  });

  it("rejects boards below 4x4", () => {
    expect(paramsError(sokobanGame, { w: 3, h: 10 }, true)).toBe(
      "Width must be at least 4.",
    );
    expect(paramsError(sokobanGame, { w: 10, h: 3 }, true)).toBe(
      "Height must be at least 4.",
    );
    expect(paramsError(sokobanGame, { w: 4, h: 4 }, true)).toBeNull();
  });

  it("deals no level of more than 1200 squares, and loads one", () => {
    expect(paramsError(sokobanGame, { w: 30, h: 40 }, true)).toBeNull();
    expect(paramsError(sokobanGame, { w: 40, h: 31 }, true)).toBe(
      "Width times height must be at most 1200 to deal a level; a larger one takes too long to find.",
    );
    expect(paramsError(sokobanGame, { w: 40, h: 31 }, false)).toBeNull();
  });
});

// --- desc codec -------------------------------------------------------

describe("Sokoban desc codec", () => {
  const p5: SokobanParams = { w: 5, h: 5 };
  // Player(1,1), barrel(2,1), target(3,1).
  const desc = "w6ubtw2s3w2s3w6";

  it("newState decodes the run-length grid and finds the player", () => {
    const s = newState(p5, desc);
    expect(s.px).toBe(1);
    expect(s.py).toBe(1);
    // The player's cell holds the SPACE beneath it.
    expect(s.grid[1 * 5 + 1]).toBe(SPACE);
    expect(s.grid[1 * 5 + 2]).toBe(BARREL);
    expect(s.grid[1 * 5 + 3]).toBe(TARGET);
  });

  it("validateDesc accepts a well-formed level and rejects malformed ones", () => {
    expect(validateDesc(sokobanGame, p5, desc)).toBeNull();
    // Too little / too much data.
    expect(validateDesc(sokobanGame, p5, "w6ubtw2s3w2s3w5")).toBe(DESC_TOO_SHORT);
    expect(validateDesc(sokobanGame, p5, "w6ubtw2s3w2s3w7")).toBe(DESC_TOO_LONG);
    // No player.
    expect(validateDesc(sokobanGame, p5, "w6sbtw2s3w2s3w6")).toMatch(
      /no starting square/,
    );
    // Two players.
    expect(validateDesc(sokobanGame, p5, "w6ubuw2s4w2s2w6")).toMatch(
      /more than one starting/,
    );
    // Invalid character.
    expect(validateDesc(sokobanGame, p5, "w6ubtw2s3w2s3z6")).toBe(
      descBadCharacter("z"),
    );
    // A player run of zero squares is not a player, and is not written.
    expect(validateDesc(sokobanGame, p5, "w6u0sbtw2s3w2s3w6")).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(sokobanGame, p5, "w6ubtw2s3w2s3w1w5")).toBe(DESC_OUT_OF_RANGE);
    // Two players in one run.
    expect(validateDesc(sokobanGame, p5, "w6u2tw2s3w2s3w6")).toMatch(
      /more than one starting/,
    );
    // Text after a full board.
    expect(validateDesc(sokobanGame, p5, `${desc}w`)).toBe(DESC_TOO_LONG);
    // The generator's untouched square and a control character are not ID letters.
    expect(validateDesc(sokobanGame, p5, "w6ubti2s3w2s3w6")).toBe(
      descBadCharacter("i"),
    );
    expect(validateDesc(sokobanGame, p5, "w6u\u0001tw2s3w2s3w6")).toBe(
      descBadCharacter("\u0001"),
    );
  });

  it("validateDesc accepts pits, deep pits and labeled barrels (hand IDs)", () => {
    // A labeled barrel 'A' and a pit 'p' — the random generator never emits
    // these, but hand-authored level IDs use them.
    expect(validateDesc(sokobanGame, p5, "w6uAtw2p3w2s3w6")).toBeNull();
    expect(validateDesc(sokobanGame, p5, "w6ubdw2s3w2s3w6")).toBeNull();
  });
});

// --- move classification ----------------------------------------------

describe("Sokoban moveType", () => {
  // wwwww / wubtw / wsssw / wsssw / wwwww
  const s = stateFromRows(["wwwww", "wubtw", "wsssw", "wsssw", "wwwww"]);

  it("classifies walks, pushes and illegal moves", () => {
    expect(moveType(s, 1, 0)).toBe("push"); // into the barrel, target beyond
    expect(moveType(s, -1, 0)).toBe("illegal"); // into a wall
    expect(moveType(s, 0, 1)).toBe("walk"); // into a space
    expect(moveType(s, 0, -1)).toBe("illegal"); // into a wall
  });

  it("allows a diagonal walk only when a shared-adjacent square is free", () => {
    // Down-right: shares (1,2)=space and (2,1)=barrel; the space makes it legal.
    expect(moveType(s, 1, 1)).toBe("walk");
    // Down-left: target square (0,2) is a wall — illegal regardless.
    expect(moveType(s, -1, 1)).toBe("illegal");
  });

  it("refuses to push a barrel diagonally, or into a wall", () => {
    // Barrel directly right with a wall two to the right.
    const blocked = stateFromRows(["wwwww", "wubww", "wsssw", "wwwww", "wwwww"]);
    expect(moveType(blocked, 1, 0)).toBe("illegal");
  });
});

// --- execute: pushes, pits, targets -----------------------------------

describe("Sokoban executeMove", () => {
  it("pushes a barrel onto a target and detects completion", () => {
    const s = stateFromRows(["wwwww", "wubtw", "wsssw", "wsssw", "wwwww"]);
    const after = executeMove(s, move(1, 0));
    expect(after.px).toBe(2); // player advanced into the vacated cell
    expect(after.py).toBe(1);
    expect(after.grid[1 * 5 + 2]).toBe(SPACE); // barrel gone from here
    expect(after.grid[1 * 5 + 3]).toBe(BARRELTARGET); // now filled
    expect(status(s)).toBe("ongoing");
    expect(status(after)).toBe("solved");
  });

  it("is solved only while the barrel sits on its target", () => {
    // The barrel starts on its target; pushing it off un-solves the level.
    const s = stateFromRows(["wwwwww", "wufssw", "wssssw", "wwwwww"]);
    expect(status(s)).toBe("solved");
    expect(status(executeMove(s, move(1, 0)))).toBe("ongoing");
  });

  it("fills an ordinary pit — the barrel is consumed and the pit becomes space", () => {
    const s = stateFromRows(["wwwww", "wubpw", "wsssw", "wsssw", "wwwww"]);
    const after = executeMove(s, move(1, 0));
    expect(after.grid[1 * 5 + 3]).toBe(SPACE); // pit filled
    expect(after.grid[1 * 5 + 2]).toBe(SPACE); // barrel left this cell
  });

  it("a deep pit eats the barrel and remains a deep pit", () => {
    const s = stateFromRows(["wwwww", "wubdw", "wsssw", "wsssw", "wwwww"]);
    const after = executeMove(s, move(1, 0));
    expect(after.grid[1 * 5 + 3]).toBe(DEEP_PIT); // still a deep pit
    expect(after.grid[1 * 5 + 2]).toBe(SPACE); // barrel consumed
  });

  it("completes with a spare barrel when no free target remains", () => {
    // Player, barrel, target, space, spare barrel on one row. Pushing the first
    // barrel onto the only target leaves a free barrel but nowhere to put it —
    // 'cannot become more complete', so the level is solved.
    const s = stateFromRows(["wwwwwww", "wubtsbw", "wsssssw", "wsssssw", "wwwwwww"]);
    const after = executeMove(s, move(1, 0));
    expect(after.grid[1 * 7 + 3]).toBe(BARRELTARGET); // filled the target
    expect(after.grid[1 * 7 + 5]).toBe(BARREL); // spare still free
    expect(status(after)).toBe("solved");
  });

  it("throws on an illegal move reaching executeMove", () => {
    const s = stateFromRows(["wwwww", "wubtw", "wsssw", "wsssw", "wwwww"]);
    expect(() => executeMove(s, move(-1, 0))).toThrow();
  });
});

// --- input ------------------------------------------------------------

describe("Sokoban interpretMove", () => {
  const s = stateFromRows(["wwwww", "wubtw", "wsssw", "wsssw", "wwwww"]);

  it("maps cursor keys and bare digits to directions", () => {
    expect(
      sokobanGame.interpretMove(
        s,
        sokobanGame.newUi(s),
        preferredDrawState(sokobanGame, s),
        { x: 0, y: 0 },
        CURSOR_RIGHT,
      ),
    ).toEqual(move(1, 0));
    expect(
      sokobanGame.interpretMove(
        s,
        sokobanGame.newUi(s),
        preferredDrawState(sokobanGame, s),
        { x: 0, y: 0 },
        CURSOR_DOWN,
      ),
    ).toEqual(move(0, 1));
    // Bare '3' = down-right diagonal.
    expect(
      sokobanGame.interpretMove(
        s,
        sokobanGame.newUi(s),
        preferredDrawState(sokobanGame, s),
        { x: 0, y: 0 },
        "3".charCodeAt(0),
      ),
    ).toEqual(move(1, 1));
    // '5' is not a direction.
    expect(
      sokobanGame.interpretMove(
        s,
        sokobanGame.newUi(s),
        preferredDrawState(sokobanGame, s),
        { x: 0, y: 0 },
        "5".charCodeAt(0),
      ),
    ).toBeNull();
  });

  /** The square `(x, y)`'s center, at the preferred tile size. */
  const at = (x: number, y: number) => ({ x: x * 32 + 16, y: y * 32 + 16 });

  /** Send `buttons` at `points` through one Ui, as the frontend does. */
  function gesture(board: SokobanState, steps: [number, { x: number; y: number }][]) {
    const ui = sokobanGame.newUi(board);
    const ds = preferredDrawState(sokobanGame, board);
    const out = steps.map(([b, p]) => sokobanGame.interpretMove(board, ui, ds, p, b));
    return { out, ui };
  }

  it("walks a tap to any square the player can reach, as one move", () => {
    // A tap's press is declined, so the release lands where it was pressed.
    const { out } = gesture(s, [
      [LEFT_BUTTON, at(3, 3)],
      [LEFT_RELEASE, at(3, 3)],
    ]);
    expect(out).toEqual([null, { type: "walk", x: 3, y: 3 }]);
    expect(executeMove(s, { type: "walk", x: 3, y: 3 })).toMatchObject({
      px: 3,
      py: 3,
    });
  });

  it("never pushes on a tap, nor walks where it cannot reach", () => {
    // The barrel, a wall, and the player's own square.
    for (const p of [at(2, 1), at(0, 0), at(1, 1)])
      expect(gesture(s, [[LEFT_RELEASE, p]]).out).toEqual([null]);
    const walled = stateFromRows(["wwwww", "wubtw", "wwwww", "wsssw", "wwwww"]);
    expect(gesture(walled, [[LEFT_RELEASE, at(2, 3)]]).out).toEqual([null]);
    expect(() => executeMove(walled, { type: "walk", x: 2, y: 3 })).toThrow();
  });

  it("pushes by a drag from the player, as far as the drag reaches", () => {
    const long = stateFromRows(["wwwwwww", "wubsstw", "wwwwwww"]);
    const { out, ui } = gesture(long, [
      [LEFT_BUTTON, at(1, 1)],
      [LEFT_DRAG, at(2, 1)],
      [LEFT_DRAG, at(4, 1)],
    ]);
    expect(out).toEqual([UI_UPDATE, UI_UPDATE, UI_UPDATE]);
    // The preview is the push the release will make: three squares, onto the
    // target, as far as the barrel can go.
    expect(ui.aim).toEqual({ type: "push", x: 2, y: 1, dx: 1, dy: 0, n: 3 });
    const ds = preferredDrawState(sokobanGame, long);
    const push = sokobanGame.interpretMove(long, ui, ds, at(5, 1), LEFT_RELEASE);
    expect(push).toEqual({ type: "push", x: 2, y: 1, dx: 1, dy: 0, n: 3 });
    expect(status(executeMove(long, push as SokobanMove))).toBe("solved");
    expect(ui.grab).toBeNull();
  });

  it("calls a drag off back on the player, or off the board", () => {
    for (const end of [at(1, 1), { x: -100, y: -100 }]) {
      const { out } = gesture(s, [
        [LEFT_BUTTON, at(1, 1)],
        [LEFT_DRAG, at(2, 1)],
        [LEFT_DRAG, end],
        [LEFT_RELEASE, end],
      ]);
      expect(out[3]).toBe(UI_UPDATE);
    }
  });

  it("pushes by a drag from the barrel, walking round behind it first", () => {
    // Player (1,2) below; barrel (2,1) with floor, floor and a target right.
    const board = stateFromRows(["wwwwwww", "wsbsstw", "wusssww", "wwwwwww"]);
    const { out } = gesture(board, [
      [LEFT_BUTTON, at(2, 1)],
      [LEFT_DRAG, at(4, 1)],
      [LEFT_RELEASE, at(4, 1)],
    ]);
    expect(out[2]).toEqual({ type: "push", x: 2, y: 1, dx: 1, dy: 0, n: 2 });
    const after = executeMove(board, out[2] as SokobanMove);
    expect(after).toMatchObject({ px: 3, py: 1 });
    // Pushed down, the player would have to stand above it, in the wall: no aim.
    const down = gesture(board, [
      [LEFT_BUTTON, at(2, 1)],
      [LEFT_DRAG, at(2, 2)],
      [LEFT_RELEASE, at(2, 2)],
    ]);
    expect(down.out[2]).toBe(UI_UPDATE);
    // A tap on a barrel is a drag that never left it: no move.
    expect(
      gesture(board, [
        [LEFT_BUTTON, at(2, 1)],
        [LEFT_RELEASE, at(2, 1)],
      ]).out[1],
    ).toBe(UI_UPDATE);
  });

  it("returns null for an illegal move (into a wall)", () => {
    // Bare '4' = left, into a wall.
    expect(
      sokobanGame.interpretMove(
        s,
        sokobanGame.newUi(s),
        preferredDrawState(sokobanGame, s),
        { x: 0, y: 0 },
        "4".charCodeAt(0),
      ),
    ).toBeNull();
  });
});

// --- generator --------------------------------------------------------

describe("Sokoban generator", () => {
  it("is deterministic for a given seed", () => {
    const p: SokobanParams = { w: 12, h: 10 };
    const a = newSokobanDesc(p, randomNew("sokoban-det"));
    const b = newSokobanDesc(p, randomNew("sokoban-det"));
    expect(a.desc).toBe(b.desc);
  });

  it("produces a valid, uniquely-playered level with exactly one player", () => {
    const p: SokobanParams = { w: 12, h: 10 };
    const { desc } = newSokobanDesc(p, randomNew("sokoban-valid"));
    expect(validateDesc(sokobanGame, p, desc)).toBeNull();
    const s = newState(p, desc);
    expect(s.px).toBeGreaterThanOrEqual(0);
    expect(s.py).toBeGreaterThanOrEqual(0);
  });
});

// --- midend lifecycle -------------------------------------------------

function harness() {
  const h = driveMidend(sokobanGame);
  const status = () => h.last("game-state-change")?.status;
  return { m: h.midend, status };
}

describe("Sokoban midend lifecycle", () => {
  it("reports 'solved' once the last barrel reaches its target", () => {
    // Player(1,1), barrel(2,1), target(3,1): one push right wins.
    const h = harness();
    expect(h.m.newGameFromId("5x5:w6ubtw2s3w2s3w6")).toBeNull();
    expect(h.status()).toBe("ongoing");
    // A drag from the player onto the barrel pushes it.
    expect(h.m.processInput(1 * 32 + 16, 1 * 32 + 16, LEFT_BUTTON)).toBe(true);
    h.m.processInput(2 * 32 + 16, 1 * 32 + 16, LEFT_DRAG);
    expect(h.status()).toBe("ongoing");
    expect(h.m.processInput(2 * 32 + 16, 1 * 32 + 16, LEFT_RELEASE)).toBe(true);
    expect(h.status()).toBe("solved");
  });

  it("solves a hand-typed level with a labeled barrel, and the save loads", () => {
    // The finished board holds the labeled barrel on its target, which the
    // board stores as a control character no game ID can write.
    const h = harness();
    const me = h.m;
    expect(me.newGameFromId("5x5:w6uAtw2s3w2s3w6")).toBeNull();
    expect(me.solve()).toBeNull();
    expect(h.status()).toBe("solved-with-help");
    const before = renderOps(me);

    const me2 = new Midend(sokobanGame);
    expect(me2.loadGame(me.saveGame())).toBeNull();
    expect(renderOps(me2)).toEqual(before);
  });

  it("save -> load preserves the board (render-equivalent)", () => {
    const me = new Midend(sokobanGame);
    expect(me.newGameFromId("12x10#sokoban-save")).toBeNull();
    // Two legal keyboard moves so the save carries real progress.
    me.processInput(0, 0, CURSOR_RIGHT);
    me.processInput(0, 0, CURSOR_DOWN);
    const before = renderOps(me);

    const saved = me.saveGame();
    const me2 = new Midend(sokobanGame);
    expect(me2.loadGame(saved)).toBeNull();
    expect(renderOps(me2)).toEqual(before);
  });
});

// --- render -----------------------------------------------------------

/** The middle of a polygon's bounding box: where a barrel's square stands. */
function middle(points: ReadonlyArray<readonly [number, number]>): [number, number] {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return [
    (Math.min(...xs) + Math.max(...xs)) / 2,
    (Math.min(...ys) + Math.max(...ys)) / 2,
  ];
}

describe("Sokoban render", () => {
  it("draws grid lines, walls and the player on a generated board", () => {
    const { recording } = renderScenario({
      game: sokobanGame,
      id: "12x10#sokoban-render",
    });
    const ops = recording.ops;
    // Grid lines (drawn once in the first-draw branch).
    expect(ops.some((o) => o.op === "line")).toBe(true);
    // A wall is a flat block, and nothing on the board is a bevel.
    expect(ops.some((o) => o.op === "rect" && o.color === COL_WALL)).toBe(true);
    // The only polygons are the barrels' squares.
    expect(ops.some((o) => o.op === "polygon" && o.fill === COL_BARREL)).toBe(true);
    expect(ops.some((o) => o.op === "polygon" && o.fill !== COL_BARREL)).toBe(false);
    // The player is a disc — a circle with a fill color.
    expect(ops.some((o) => o.op === "circle")).toBe(true);
    expect(recording.ops).toMatchSnapshot();
  });

  it("previews an aimed push across its squares, and clears it once let go", () => {
    // Through a real midend, so the warm frame is the app's: press on the
    // player, drag two squares out, then let go back on the player.
    const me = new Midend(sokobanGame);
    // Player (1,1), barrel (2,1), then floor, floor and a target.
    expect(me.newGameFromId("7x4:w8ubs2tw15")).toBeNull();
    renderOps(me);
    me.processInput(48, 48, LEFT_BUTTON);
    me.processInput(48 + 64, 48, LEFT_DRAG);
    const heads = (ops: ReturnType<typeof renderOps>) =>
      ops.filter((o) => o.op === "polygon" && o.fill === COL_AIM).length;
    // The ghost: square outlines in the aim color, all on the square the
    // barrel stops on.
    const ghost = (ops: ReturnType<typeof renderOps>) =>
      ops.flatMap((o) =>
        o.op === "polygon" && o.fill === -1 && o.outline === COL_AIM
          ? [middle(o.points)[0]]
          : [],
      );
    const aiming = renderOps(me);
    // The barrel's square, the one it passes and the one it stops on.
    expect(heads(aiming)).toBe(3);
    expect(ghost(aiming).length).toBeGreaterThan(0);
    expect(new Set(ghost(aiming))).toEqual(new Set([4 * 32 + 16]));
    me.processInput(48, 48, LEFT_DRAG);
    me.processInput(48, 48, LEFT_RELEASE);
    const after = renderOps(me);
    expect(heads(after)).toBe(0);
    expect(ghost(after)).toEqual([]);
    // Each of those squares repainted, so no stale piece of arrow is left.
    const repainted = after.filter((o) => o.op === "clip").length;
    expect(repainted).toBeGreaterThanOrEqual(3);
  });

  it("animates a push along the walk to it, and leaves no trail", () => {
    // Player (1,2) below; barrel (2,1), floor, floor, target. Dragging the
    // barrel two squares walks the player up-left round behind it, then
    // pushes: three squares of motion.
    const id = "7x4:w8sbs2tw2us3w9";
    const me = new Midend(sokobanGame);
    expect(me.newGameFromId(id)).toBeNull();
    const pushed = executeMove(newState({ w: 7, h: 4 }, id.slice(4)), {
      type: "push",
      x: 2,
      y: 1,
      dx: 1,
      dy: 0,
      n: 2,
    });
    renderOps(me);
    me.processInput(2 * 32 + 16, 48, LEFT_BUTTON);
    me.processInput(4 * 32 + 16, 48, LEFT_DRAG);
    me.processInput(4 * 32 + 16, 48, LEFT_RELEASE);
    // The player is a disc and a barrel a square.
    const at = (ops: ReturnType<typeof renderOps>, fill: number) =>
      ops.flatMap((o) =>
        o.op === "circle" && o.fill === fill
          ? [o.cx]
          : o.op === "polygon" && o.fill === fill
            ? [middle(o.points)[0]]
            : [],
      );
    // A third of the way: the player has reached the square behind the barrel,
    // and the barrel has not moved.
    me.timer(0.06);
    const third = renderOps(me);
    expect(at(third, COL_BARREL)).toContain(2 * 32 + 16);
    // Halfway: both are between squares.
    me.timer(0.03);
    const two = renderOps(me);
    expect(at(two, COL_PLAYER).some((x) => (x - 16) % 32 !== 0)).toBe(true);
    expect(at(two, COL_BARREL).some((x) => (x - 16) % 32 !== 0)).toBe(true);
    // Settled, the warm frame is the fresh one: nothing in motion left behind.
    me.timer(1);
    const warm = new RecordingDrawing(sokobanGame.colors(DEFAULT_BACKGROUND));
    me.redraw(warm);
    const fresh = new Midend(sokobanGame);
    expect(fresh.newGameFromId(`7x4:${encodeBoard(pushed)}`)).toBeNull();
    const ref = renderOps(fresh);
    const circles = (ops: ReturnType<typeof renderOps>) =>
      ops.flatMap((o) =>
        o.op === "circle"
          ? [`${o.cx},${o.cy},${o.fill}`]
          : o.op === "polygon"
            ? [`${middle(o.points).join(",")},${o.fill}`]
            : [],
      );
    expect(circles(warm.ops).length).toBeGreaterThan(0);
    for (const c of circles(warm.ops)) expect(circles(ref)).toContain(c);
  });

  it("plays an undo's motion backward, and moves several barrels at once", () => {
    const a = newState({ w: 7, h: 4 }, "w8sbs2tw2us3w9");
    const b = executeMove(a, { type: "push", x: 2, y: 1, dx: 1, dy: 0, n: 2 });
    const ui = sokobanGame.newUi(a);
    const forward = sokobanGame.animLength?.(a, b, 1, ui) ?? 0;
    expect(forward).toBeGreaterThan(0);
    expect(sokobanGame.animLength?.(b, a, -1, ui)).toBe(forward);
    // Two barrels changed at once is Solve's kind of change: no motion.
    const two = stateFromRows(["wwwwwww", "wubstbw", "wsssstw", "wwwwwww"]);
    const both = stateFromRows(["wwwwwww", "wusbfsw", "wssssfw", "wwwwwww"]);
    expect(sokobanGame.animLength?.(two, both, 1, ui)).toBe(0);
  });

  it("renders the frame after a winning push", () => {
    const { recording, size } = renderScenario({
      game: sokobanGame,
      id: "5x5:w6ubtw2s3w2s3w6",
      moves: [move(1, 0)],
      settle: true,
    });
    // The barrel now on the target cell (3,1) draws as the target's ring (a
    // disc in palette index 1, then the floor inside it) with the
    // barrel's square over it.
    const ts = (size.w - 1) / 5;
    const here = (x: number, y: number) => x === 3.5 * ts && y === 1.5 * ts;
    const fills = recording.ops.flatMap((o) =>
      o.op === "circle" && here(o.cx, o.cy)
        ? [o.fill]
        : o.op === "polygon" && here(...middle(o.points))
          ? [o.fill]
          : [],
    );
    expect(fills).toEqual([1, COL_FLOOR, COL_BARREL]);
  });
});
