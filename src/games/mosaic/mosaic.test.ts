// Tier-1 logic: params codec, desc codec, move execution (toggle cycle,
// paint semantics, solve bitmap), clue SOLVED/ERROR flagging, completion
// counting, status / status bar, text format, and input mapping.
import { describe, expect, it } from "vitest";
import { DIFF_EASY, DIFF_UNREASONABLE } from "../../engine/answer-search.ts";
import {
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
  validateDesc,
} from "../../engine/desc-error.ts";
import { UI_UPDATE } from "../../engine/game.ts";
import { describeParams, presetMenu } from "../../engine/param-label.ts";
import { paramsError } from "../../engine/params.ts";
import {
  CURSOR_RIGHT,
  CURSOR_SELECT,
  CURSOR_SELECT2,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  newCursor,
  RIGHT_BUTTON,
  RIGHT_DRAG,
} from "../../engine/pointer.ts";
import { mosaicGame } from "./index.ts";
import {
  cluesLeft,
  decodeParams,
  encodeBoard,
  encodeParams,
  executeMove,
  type MosaicState,
  type MosaicUi,
  newState,
  STATE_BLANK,
  STATE_ERROR,
  STATE_MARKED,
  STATE_SOLVED,
  STATE_UNMARKED,
  status,
  statusbarText,
  textFormat,
} from "./state.ts";

// 3×3 all-black image: every clue saturates its clipped neighborhood
// (4 corner / 6 edge / 9 center), so marking everything black solves it.
const ALL_BLACK_DESC = "464696464";
const P3 = { width: 3, height: 3, aggressive: true, diff: DIFF_EASY };

function freshUi(): MosaicUi {
  return { cursor: newCursor() };
}

describe("Mosaic params", () => {
  it("encodes WxH, elides default aggressiveness and writes the tier last", () => {
    expect(
      encodeParams({ width: 10, height: 8, aggressive: true, diff: DIFF_EASY }, true),
    ).toBe("10x8de");
    expect(
      encodeParams({ width: 50, height: 50, aggressive: false, diff: DIFF_EASY }, true),
    ).toBe("50x50h0de");
    expect(
      encodeParams(
        { width: 50, height: 50, aggressive: false, diff: DIFF_UNREASONABLE },
        true,
      ),
    ).toBe("50x50h0du");
    expect(decodeParams("50x50h0du")).toEqual({
      width: 50,
      height: 50,
      aggressive: false,
      diff: DIFF_UNREASONABLE,
    });
    expect(decodeParams("10x8du").aggressive).toBe(true);
    // Short (non-full) encoding never carries the suffix.
    expect(
      encodeParams(
        { width: 50, height: 50, aggressive: false, diff: DIFF_EASY },
        false,
      ),
    ).toBe("50x50");
  });

  it("drives width/height from the shared Width/Height dialog items", () => {
    // Mosaic maps `dimensionParamConfig` onto `width`/`height` rather than
    // `w`/`h`. The engine's get∘set round-trip guard cannot see a *swapped*
    // mapping — both accessors would name the same wrong field, so the round
    // trip stays the identity — so the fields are named here.
    const cfg = mosaicGame.paramConfig ?? [];
    const width = cfg.find((i) => i.kw === "width");
    const height = cfg.find((i) => i.kw === "height");
    if (width?.type !== "string" || height?.type !== "string")
      throw new Error("Mosaic must expose Width and Height as text fields");

    const p = { width: 5, height: 5, aggressive: true, diff: DIFF_EASY };
    width.set(p, "12");
    height.set(p, "9");
    expect(p).toEqual({ width: 12, height: 9, aggressive: true, diff: DIFF_EASY });
    expect(width.get(p)).toBe("12");
    expect(height.get(p)).toBe("9");
    // The mapping is load-bearing all the way to the game id.
    expect(encodeParams(p, true)).toBe("12x9de");
  });

  it("decodes round-trips and square shorthand", () => {
    expect(decodeParams("10x8")).toEqual({
      width: 10,
      height: 8,
      aggressive: true,
      diff: DIFF_EASY,
    });
    expect(decodeParams("50x50h0")).toEqual({
      width: 50,
      height: 50,
      aggressive: false,
      diff: DIFF_EASY,
    });
    expect(decodeParams("7")).toEqual({
      width: 7,
      height: 7,
      aggressive: true,
      diff: DIFF_EASY,
    });
  });

  it("validates size bounds", () => {
    expect(
      paramsError(
        mosaicGame,
        { width: 2, height: 3, aggressive: true, diff: DIFF_EASY },
        true,
      ),
    ).toBe("Width must be at least 3.");
    expect(
      paramsError(
        mosaicGame,
        { width: 3, height: 3, aggressive: true, diff: DIFF_EASY },
        true,
      ),
    ).toBeNull();
    expect(
      paramsError(
        mosaicGame,
        { width: 101, height: 100, aggressive: true, diff: DIFF_EASY },
        true,
      ),
    ).toBeTruthy();
    expect(
      paramsError(
        mosaicGame,
        { width: 100, height: 100, aggressive: true, diff: DIFF_EASY },
        true,
      ),
    ).toBeNull();
  });

  it("names the generation mode only where it is not the size's default", () => {
    const titles = (presetMenu(mosaicGame).submenu ?? []).map((m) => m.title);
    expect(titles).toEqual(
      ["3x3", "5x5", "10x10", "15x15", "25x25", "50x50"].flatMap((size) => [
        `${size} Easy`,
        `${size} Unreasonable`,
      ]),
    );
    expect(
      describeParams(mosaicGame, {
        width: 50,
        height: 50,
        aggressive: true,
        diff: DIFF_EASY,
      }),
    ).toBe("50x50 Easy, slower generation");
    expect(
      describeParams(mosaicGame, {
        width: 5,
        height: 5,
        aggressive: false,
        diff: DIFF_UNREASONABLE,
      }),
    ).toBe("5x5 Unreasonable, faster generation");
  });
});

describe("Mosaic desc codec", () => {
  it("parses digits and letter runs", () => {
    const state = newState(
      { width: 3, height: 3, aggressive: true, diff: DIFF_EASY },
      "4b69c4",
    );
    // 4, [2 hidden], 6, 9, [3 hidden], 4 — scan order.
    expect(Array.from(state.board.clues)).toEqual([4, -1, -1, 6, 9, -1, -1, -1, 4]);
    expect(cluesLeft(state)).toBe(4);
  });

  it("round-trips through encodeBoard", () => {
    for (const desc of [ALL_BLACK_DESC, "4b69c4", "a0a0a0a0a"]) {
      const state = newState(P3, desc);
      expect(encodeBoard(state.board)).toBe(desc);
    }
  });

  it("encodes a >26-cell hidden run with a z boundary", () => {
    // 6×5 board, clue at the first cell, 29 hidden cells: z (26) + c (3).
    const p = { width: 6, height: 5, aggressive: true, diff: DIFF_EASY };
    const desc = "5zc";
    expect(validateDesc(mosaicGame, p, desc)).toBeNull();
    const state = newState(p, desc);
    expect(state.board.clues[0]).toBe(5);
    expect(encodeBoard(state.board)).toBe(desc);
  });

  it("rejects malformed descs", () => {
    expect(validateDesc(mosaicGame, P3, "46469646!")).toBe(descBadCharacter("!"));
    expect(validateDesc(mosaicGame, P3, "4646")).toBe(DESC_TOO_SHORT);
    expect(validateDesc(mosaicGame, P3, "4646964640")).toBe(DESC_TOO_LONG);
    expect(validateDesc(mosaicGame, P3, ALL_BLACK_DESC)).toBeNull();
  });
});

describe("Mosaic moves", () => {
  it("toggles a cell through marked → blank → unmarked", () => {
    let s = newState(P3, ALL_BLACK_DESC);
    s = executeMove(s, { type: "toggle", x: 1, y: 1, double: false });
    expect(s.cells[4] & 3).toBe(STATE_MARKED);
    s = executeMove(s, { type: "toggle", x: 1, y: 1, double: false });
    expect(s.cells[4] & 3).toBe(STATE_BLANK);
    s = executeMove(s, { type: "toggle", x: 1, y: 1, double: false });
    expect(s.cells[4] & 3).toBe(0);
  });

  it("double-toggle cycles the other way", () => {
    let s = newState(P3, ALL_BLACK_DESC);
    s = executeMove(s, { type: "toggle", x: 1, y: 1, double: true });
    expect(s.cells[4] & 3).toBe(STATE_BLANK);
  });

  it("is pure: the input state is untouched", () => {
    const s = newState(P3, ALL_BLACK_DESC);
    executeMove(s, { type: "toggle", x: 0, y: 0, double: false });
    expect(s.cells[0]).toBe(0);
  });

  it("throws on an out-of-bounds toggle", () => {
    const s = newState(P3, ALL_BLACK_DESC);
    expect(() =>
      executeMove(s, { type: "toggle", x: 3, y: 0, double: false }),
    ).toThrow();
  });

  it("paints only still-unmarked cells along the run", () => {
    let s = newState(P3, ALL_BLACK_DESC);
    // Pre-mark the middle of the top row black.
    s = executeMove(s, { type: "toggle", x: 1, y: 0, double: false });
    // Paint blank from (2,0) back toward the (0,0) anchor.
    s = executeMove(s, {
      type: "paint",
      x: 2,
      y: 0,
      srcX: 0,
      srcY: 0,
      paintState: STATE_BLANK,
    });
    expect(s.cells[2] & 3).toBe(STATE_BLANK); // painted
    expect(s.cells[1] & 3).toBe(STATE_MARKED); // untouched (already marked)
    expect(s.cells[0] & 3).toBe(0); // anchor excluded
  });

  it("flags a satisfied clue SOLVED and counts completion", () => {
    let s = newState(P3, ALL_BLACK_DESC);
    expect(cluesLeft(s)).toBe(9);
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        s = executeMove(s, { type: "toggle", x, y, double: false });
      }
    }
    expect(cluesLeft(s)).toBe(0);
    expect(s.cells[4] & STATE_SOLVED).toBeTruthy();
    expect(status(s)).toBe("solved");
  });

  it("flags an overcommitted clue ERROR", () => {
    // All-white board: every clue is 0; marking a cell black contradicts
    // its neighboring clues (clue < marked).
    let s = newState(P3, "000000000");
    s = executeMove(s, { type: "toggle", x: 1, y: 1, double: false });
    expect(s.cells[0] & STATE_ERROR).toBeTruthy();
    expect(s.cells[4] & STATE_ERROR).toBeTruthy();
  });

  it("clears the ERROR flag when the contradiction is undone", () => {
    let s = newState(P3, "000000000");
    s = executeMove(s, { type: "toggle", x: 1, y: 1, double: false });
    expect(s.cells[0] & STATE_ERROR).toBeTruthy();
    // marked → blank: no contradiction left.
    s = executeMove(s, { type: "toggle", x: 1, y: 1, double: false });
    expect(s.cells[0] & STATE_ERROR).toBeFalsy();
  });

  it("applies a solve bitmap with SOLVED flags and zero clues left", () => {
    const s = newState(P3, ALL_BLACK_DESC);
    // 9 cells all marked: 0xff 0x80.
    const solved = executeMove(s, { type: "solve", solution: "ff80" });
    expect(cluesLeft(solved)).toBe(0);
    expect(status(solved)).toBe("solved");
    for (let i = 0; i < 9; i++) {
      expect(solved.cells[i] & 3).toBe(STATE_MARKED);
      expect(solved.cells[i] & STATE_SOLVED).toBeTruthy();
    }
    // The completion words are the engine's.
    expect(statusbarText(solved, freshUi())).toBe("");
  });

  it("rejects a truncated solve bitmap", () => {
    const s = newState(P3, ALL_BLACK_DESC);
    expect(() => executeMove(s, { type: "solve", solution: "ff" })).toThrow();
  });
});

describe("Mosaic status / text", () => {
  it("reports the live clue count, then nothing of its own", () => {
    let s = newState(P3, ALL_BLACK_DESC);
    expect(statusbarText(s, freshUi())).toBe("Clues left: 9");
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        s = executeMove(s, { type: "toggle", x, y, double: false });
      }
    }
    expect(statusbarText(s, freshUi())).toBe("");
    expect(status(s)).toBe("solved");
  });

  it("formats the clue grid as text", () => {
    const s = newState(P3, "4b69c4");
    expect(textFormat(s)).toBe("|4|| || |\n|6||9|| |\n| || ||4|\n");
  });
});

describe("Mosaic input mapping", () => {
  const ds = {
    tileSize: 32,
    cache: new Int32Array(0),
  };
  const at = (cx: number, cy: number) => ({
    x: 16 + 32 * cx + 16,
    y: 16 + 32 * cy + 16,
  });

  function fresh(): { s: MosaicState; ui: MosaicUi } {
    return { s: newState(P3, ALL_BLACK_DESC), ui: freshUi() };
  }

  it("maps a left click to a single toggle", () => {
    const { s, ui } = fresh();
    const move = mosaicGame.interpretMove(s, ui, ds, at(1, 1), LEFT_BUTTON);
    expect(move).toEqual({ type: "toggle", x: 1, y: 1, double: false });
  });

  it("maps a right click to a double toggle", () => {
    const { s, ui } = fresh();
    const move = mosaicGame.interpretMove(s, ui, ds, at(0, 0), RIGHT_BUTTON);
    expect(move).toEqual({ type: "toggle", x: 0, y: 0, double: true });
  });

  it("ignores clicks in the margin", () => {
    const { s, ui } = fresh();
    expect(
      mosaicGame.interpretMove(s, ui, ds, { x: 4, y: 40 }, LEFT_BUTTON),
    ).toBeNull();
  });

  /** A board played through `interpretMove`, as a drag is: each move it
   * makes changes what the next event finds. */
  function played() {
    let { s } = fresh();
    const ui = freshUi();
    const send = (cx: number, cy: number, button: number) => {
      const move = mosaicGame.interpretMove(s, ui, ds, at(cx, cy), button);
      if (move !== null && move !== UI_UPDATE) s = executeMove(s, move);
      return move;
    };
    return { send, mark: (cx: number, cy: number) => s.cells[cy * 3 + cx] & 3 };
  }

  it("a drag gives the press's mark to each empty square it passes", () => {
    const b = played();
    b.send(1, 1, LEFT_BUTTON);
    b.send(1, 1, LEFT_RELEASE);
    b.send(0, 0, LEFT_BUTTON);
    // Down the first column, then along the bottom row: no need to stay in
    // one line.
    b.send(0, 1, LEFT_DRAG);
    b.send(0, 2, LEFT_DRAG);
    b.send(1, 2, LEFT_DRAG);
    b.send(1, 2, LEFT_RELEASE);
    for (const [x, y] of [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 2],
    ])
      expect(b.mark(x, y)).toBe(STATE_MARKED);
    // Back over the square marked before the drag: it is left as it was.
    b.send(2, 1, RIGHT_BUTTON);
    b.send(1, 1, RIGHT_DRAG);
    expect(b.mark(2, 1)).toBe(STATE_BLANK);
    expect(b.mark(1, 1)).toBe(STATE_MARKED);
  });

  it("a drag from a marked square clears the marked squares it passes", () => {
    const b = played();
    for (const x of [0, 1, 2]) {
      b.send(x, 0, LEFT_BUTTON);
      b.send(x, 0, LEFT_RELEASE);
    }
    // A second left click makes the middle one blank.
    b.send(1, 0, LEFT_BUTTON);
    b.send(1, 0, LEFT_RELEASE);
    // The right button takes a marked square straight to empty, and the drag
    // takes the next marked one with it, passing over the blank between.
    b.send(0, 0, RIGHT_BUTTON);
    expect(b.mark(0, 0)).toBe(STATE_UNMARKED);
    b.send(1, 0, RIGHT_DRAG);
    b.send(2, 0, RIGHT_DRAG);
    expect(b.mark(1, 0)).toBe(STATE_BLANK);
    expect(b.mark(2, 0)).toBe(STATE_UNMARKED);
  });

  it("moves the cursor with clamping and toggles via select", () => {
    const { s, ui } = fresh();
    expect(mosaicGame.interpretMove(s, ui, ds, { x: 0, y: 0 }, CURSOR_RIGHT)).toBe(
      UI_UPDATE,
    );
    expect(ui.cursor.x).toBe(1);
    expect(ui.cursor.visible).toBe(true);
    expect(mosaicGame.interpretMove(s, ui, ds, { x: 0, y: 0 }, CURSOR_SELECT)).toEqual({
      type: "toggle",
      x: 1,
      y: 0,
      double: false,
    });
    expect(mosaicGame.interpretMove(s, ui, ds, { x: 0, y: 0 }, CURSOR_SELECT2)).toEqual(
      {
        type: "toggle",
        x: 1,
        y: 0,
        double: true,
      },
    );
  });

  it("the first select only reveals the cursor", () => {
    const { s, ui } = fresh();
    expect(mosaicGame.interpretMove(s, ui, ds, { x: 0, y: 0 }, CURSOR_SELECT)).toBe(
      UI_UPDATE,
    );
    expect(ui.cursor.visible).toBe(true);
  });

  it("freezes everything but cursor movement after completion", () => {
    let { s } = fresh();
    const ui = freshUi();
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        s = executeMove(s, { type: "toggle", x, y, double: false });
      }
    }
    expect(cluesLeft(s)).toBe(0);
    expect(mosaicGame.interpretMove(s, ui, ds, at(0, 0), LEFT_BUTTON)).toBeNull();
    expect(mosaicGame.interpretMove(s, ui, ds, { x: 0, y: 0 }, CURSOR_RIGHT)).toBe(
      UI_UPDATE,
    );
  });
});
