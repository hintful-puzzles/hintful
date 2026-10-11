import { describe, expect, it } from "vitest";
import {
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
  validateDesc,
} from "../../engine/desc-error.ts";
import { Midend, UI_UPDATE } from "../../engine/index.ts";
import { SHOW_TIMER_PREF } from "../../engine/midend.ts";
import { paramsError } from "../../engine/params.ts";
import { randomNew } from "../../engine/random/index.ts";
import { NO_SOLUTION } from "../../engine/solve-failure.ts";
import { driveMidend } from "../../engine/testing/drive-midend.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { opsOfKind, RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import { expectWinFlashTravels, winFlashRun } from "../../engine/testing/win-flash.ts";
import { PuzzleButton } from "../../engine/types.ts";
import { NO_FLASH, sweepStep } from "../../engine/win-wave.ts";
import { type FlipParams, type FlipState, flipGame } from "./index.ts";
import { border, COL_FLASH } from "./render.ts";

function recordingDrawing() {
  const dr = new RecordingDrawing(flipGame.colors(DEFAULT_BACKGROUND));
  return { dr, ops: dr.ops };
}

const COL_GRID = 3;

// `solve` is optional on the `Game` interface; Flip always has one.
const solveFlip = flipGame.solve as NonNullable<typeof flipGame.solve>;

const PRESETS: FlipParams[] = [
  { w: 3, h: 3, matrixType: "crosses" },
  { w: 4, h: 4, matrixType: "crosses" },
  { w: 5, h: 5, matrixType: "crosses" },
  { w: 3, h: 3, matrixType: "random" },
  { w: 4, h: 4, matrixType: "random" },
  { w: 5, h: 5, matrixType: "random" },
];

function hasDuplicateRows(m: Uint8Array, wh: number): boolean {
  for (let i = 0; i < wh; i++) {
    for (let j = i + 1; j < wh; j++) {
      let same = true;
      for (let c = 0; c < wh; c++) {
        if (m[i * wh + c] !== m[j * wh + c]) {
          same = false;
          break;
        }
      }
      if (same) return true;
    }
  }
  return false;
}

describe("Flip generation", () => {
  for (const p of PRESETS) {
    it(`${p.w}x${p.h} ${p.matrixType}: solvable, non-trivial, no dup rows`, () => {
      const wh = p.w * p.h;
      const rng = randomNew(`flip-${p.w}${p.h}${p.matrixType}`);
      const { desc } = flipGame.newDesc(p, rng);
      expect(validateDesc(flipGame, p, desc)).toBeNull();
      const state = flipGame.newState(p, desc);

      // Non-trivial start: at least one light is on.
      expect([...state.grid].some((g) => g & 1)).toBe(true);
      // No two identical matrix rows (flip.c's acceptance condition).
      expect(hasDuplicateRows(state.matrix, wh)).toBe(false);

      // The solver finds a flip set that turns every light off.
      const result = solveFlip(state, state);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.move.kind).toBe("solution");
      if (result.move.kind !== "solution") return;

      let s: FlipState = state;
      result.move.mask.forEach((bit, idx) => {
        if (bit) {
          s = flipGame.executeMove(s, {
            kind: "flip",
            x: idx % p.w,
            y: (idx / p.w) | 0,
          });
        }
      });
      expect(flipGame.status(s)).toBe("solved");
    });
  }
});

describe("Flip desc", () => {
  // 1x2: a 4-bit matrix (one digit) and a 2-bit grid (one digit, low two bits
  // padding).
  const p: FlipParams = { w: 1, h: 2, matrixType: "crosses" };

  it("reads what the encoder writes", () => {
    expect(validateDesc(flipGame, p, "9,c")).toBeNull();
    const s = flipGame.newState(p, "9,c");
    expect([...s.matrix]).toEqual([1, 0, 0, 1]);
    expect([...s.grid]).toEqual([1, 1]);
  });

  it("refuses uppercase hex, set padding bits and an overlong bitmap", () => {
    expect(validateDesc(flipGame, p, "9,C")).toBe(descBadCharacter("C"));
    expect(validateDesc(flipGame, p, "9,d")).toBe(descBadCharacter("d"));
    expect(validateDesc(flipGame, p, "99,c")).toBe(descBadCharacter("9"));
    expect(validateDesc(flipGame, p, "9,cc")).toBe(DESC_TOO_LONG);
    expect(validateDesc(flipGame, p, "9")).toBe(DESC_TOO_SHORT);
  });
});

describe("Flip button codes", () => {
  it("shared button consts still match PuzzleButton", () => {
    // The tests below write button codes as literals; pin them here.
    expect(PuzzleButton.LEFT_BUTTON).toBe(0x0200);
    expect(PuzzleButton.CURSOR_UP).toBe(0x0200 + 9);
    expect(PuzzleButton.CURSOR_DOWN).toBe(0x0200 + 10);
    expect(PuzzleButton.CURSOR_LEFT).toBe(0x0200 + 11);
    expect(PuzzleButton.CURSOR_RIGHT).toBe(0x0200 + 12);
    expect(PuzzleButton.CURSOR_SELECT).toBe(0x0200 + 13);
    expect(PuzzleButton.CURSOR_SELECT2).toBe(0x0200 + 14);
  });
});

describe("Flip solver", () => {
  it("reports no solution for an insoluble position", () => {
    const wh = 4;
    // All-zero matrix: clicking does nothing, but a light is on.
    const state: FlipState = {
      w: 2,
      h: 2,
      matrix: new Uint8Array(wh * wh),
      grid: Uint8Array.from([1, 0, 0, 0]),
      moves: 0,
    };
    const result = solveFlip(state, state);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe(NO_SOLUTION);
  });
});

describe("Flip params", () => {
  it("round-trips and accepts upstream's lenient forms", () => {
    expect(flipGame.decodeParams("5")).toEqual({
      w: 5,
      h: 5,
      matrixType: "crosses",
    });
    expect(flipGame.decodeParams("5x4")).toEqual({
      w: 5,
      h: 4,
      matrixType: "crosses",
    });
    expect(flipGame.decodeParams("5x5r")).toEqual({
      w: 5,
      h: 5,
      matrixType: "random",
    });
    const p: FlipParams = { w: 4, h: 6, matrixType: "random" };
    expect(flipGame.decodeParams(flipGame.encodeParams(p, true))).toEqual(p);
    expect(flipGame.encodeParams(p, false)).toBe("4x6");
    expect(paramsError(flipGame, { w: 0, h: 3, matrixType: "crosses" }, true)).toBe(
      "Width must be at least 1.",
    );
  });
});

describe("Flip interpretMove", () => {
  const p: FlipParams = { w: 3, h: 3, matrixType: "crosses" };
  const desc = flipGame.newDesc(p, randomNew("flip-im")).desc;
  const tile = flipGame.preferredTileSize ?? 32;
  const border = tile >> 1;
  const at = (cx: number, cy: number) =>
    ({ x: cx * tile + border + 1, y: cy * tile + border + 1 }) as const;

  it("left-click in a cell yields a flip move at that cell", () => {
    const s = flipGame.newState(p, desc);
    const ui = flipGame.newUi(s);
    const m = flipGame.interpretMove(
      s,
      ui,
      preferredDrawState(flipGame, s),
      at(2, 1),
      0x0200,
    );
    expect(m).toEqual({ kind: "flip", x: 2, y: 1 });
    expect(ui.cursor.visible).toBe(false);
  });

  it("left-click outside the grid does nothing", () => {
    const s = flipGame.newState(p, desc);
    const ui = flipGame.newUi(s);
    expect(
      flipGame.interpretMove(
        s,
        ui,
        preferredDrawState(flipGame, s),
        { x: 9999, y: 9999 },
        0x0200,
      ),
    ).toBeNull();
  });

  it("cursor move is a UI update and advances the cursor; select acts", () => {
    const s = flipGame.newState(p, desc);
    const ui = flipGame.newUi(s);
    expect(
      flipGame.interpretMove(
        s,
        ui,
        preferredDrawState(flipGame, s),
        { x: 0, y: 0 },
        0x0200 + 12,
      ),
    ).toBe(UI_UPDATE); // CURSOR_RIGHT
    expect(ui.cursor.x).toBe(1);
    expect(ui.cursor.visible).toBe(true);
    const m = flipGame.interpretMove(
      s,
      ui,
      preferredDrawState(flipGame, s),
      { x: 0, y: 0 },
      0x0200 + 13,
    );
    expect(m).toEqual({ kind: "flip", x: 1, y: 0 }); // CURSOR_SELECT
  });

  it("a cell whose matrix row is empty makes no move (no-effect)", () => {
    const wh = 4;
    const s: FlipState = {
      w: 2,
      h: 2,
      matrix: new Uint8Array(wh * wh), // all zero ⇒ nothing toggles
      grid: new Uint8Array(wh),
      moves: 0,
    };
    expect(
      flipGame.interpretMove(
        s,
        flipGame.newUi(s),
        preferredDrawState(flipGame, s),
        at(0, 0),
        0x0200,
      ),
    ).toBeNull();
  });

  it("an unhandled button yields null", () => {
    const s = flipGame.newState(p, desc);
    expect(
      flipGame.interpretMove(
        s,
        flipGame.newUi(s),
        preferredDrawState(flipGame, s),
        at(0, 0),
        0x0201,
      ),
    ).toBeNull();
  });
});

describe("Flip executeMove is pure and toggles the matrix row", () => {
  const p: FlipParams = { w: 3, h: 3, matrixType: "crosses" };
  const desc = flipGame.newDesc(p, randomNew("flip-em")).desc;

  it("returns a new state, shares the matrix, never mutates input", () => {
    const from = flipGame.newState(p, desc);
    const gridBefore = from.grid.slice();
    const next = flipGame.executeMove(from, { kind: "flip", x: 1, y: 1 });
    expect(next).not.toBe(from);
    expect(next.matrix).toBe(from.matrix); // shared by reference
    expect(next.grid).not.toBe(from.grid);
    expect([...from.grid]).toEqual([...gridBefore]); // input untouched
    // Clicking (1,1) XORs the matrix row for cell 4 into the grid.
    const wh = 9;
    for (let j = 0; j < wh; j++) {
      const expected = (gridBefore[j] ^ from.matrix[4 * wh + j]) & 1;
      expect(next.grid[j] & 1).toBe(expected);
    }
    expect(next.moves).toBe(from.moves + 1);
  });

  it("a solve move presses every square of its mask", () => {
    const from = flipGame.newState(p, desc);
    const mask = [1, 0, 1, 0, 0, 0, 0, 0, 1];
    const next = flipGame.executeMove(from, { kind: "solution", mask });
    let pressed = from;
    mask.forEach((bit, i) => {
      if (bit)
        pressed = flipGame.executeMove(pressed, {
          kind: "flip",
          x: i % 3,
          y: (i / 3) | 0,
        });
    });
    expect(Array.from(next.grid)).toEqual(Array.from(pressed.grid));
    expect(next.moves).toBe(from.moves + 3);
  });
});

describe("Flip redraw", () => {
  const p: FlipParams = { w: 3, h: 3, matrixType: "crosses" };
  const desc = flipGame.newDesc(p, randomNew("flip-rd")).desc;

  it("draws the grid once, then the per-tile cache suppresses redundant redraws", () => {
    const s = flipGame.newState(p, desc);
    const ui = flipGame.newUi(s);
    const ds = flipGame.newDrawState(s, flipGame.preferredTileSize ?? 32);

    const a = recordingDrawing();
    flipGame.redraw(a.dr, ds, null, s, 1, ui, 0, NO_FLASH);
    // (w+1)+(h+1) = 8 grid lines, all COL_GRID, drawn once.
    const gridLines = a.ops.filter((o) => o.op === "line" && o.color === COL_GRID);
    expect(gridLines.length).toBe(8);
    expect(a.ops.some((o) => o.op === "rect")).toBe(true);

    // Re-drawing the identical state: grid already started, every tile
    // unchanged ⇒ no new tile/grid ops (the cache that keeps animation
    // from repainting the whole board every frame).
    const b = recordingDrawing();
    flipGame.redraw(b.dr, ds, null, s, 1, ui, 0, NO_FLASH);
    expect(b.ops.filter((o) => o.op === "line").length).toBe(0);
    expect(b.ops.filter((o) => o.op === "rect").length).toBe(0);
  });
});

describe("Flip reshape (regression: black canvas when shapes share a tile size)", () => {
  // `Drawing.resize` clears the canvas to opaque black, and a reshape that
  // keeps the tile size gets no fresh drawstate from `size()`. So the
  // engine treats `canvasCleared` as the one canvas-invalidation signal, and
  // Flip's `!ds.started` branch repaints the background and grid lines on it.
  it("canvasCleared after a same-tile reshape repaints bg + grid lines", () => {
    const p3: FlipParams = { w: 3, h: 3, matrixType: "crosses" };
    const p5: FlipParams = { w: 5, h: 5, matrixType: "crosses" };
    const TILE = flipGame.preferredTileSize ?? 32;
    const { desc: desc3 } = flipGame.newDesc(p3, randomNew("flip-reshape-3"));
    const { desc: desc5 } = flipGame.newDesc(p5, randomNew("flip-reshape-5"));

    const me = new Midend(flipGame);
    // First game (3x3): size + first redraw paints bg + grid + tiles.
    //
    // The slot is the board's own size at tile 48, so `size()` resolves to
    // exactly 48 — and the same is done for the 5x5 below, which is what makes
    // this a *same-tile* reshape. One shared viewport would give the two boards
    // different tiles, and `size()` would then rebuild the drawstate itself.
    expect(me.newGameFromId(`3x3c:${desc3}`)).toBeNull();
    me.size(flipGame.computeSize(p3, TILE));
    const first = recordingDrawing();
    me.redraw(first.dr);
    const firstGridLines = first.ops.filter(
      (o) => o.op === "line" && o.color === COL_GRID,
    ).length;
    expect(firstGridLines).toBeGreaterThan(0); // grid drawn once

    // Switch to 5x5 at the *same* tile size, so `size()` has nothing to
    // rebuild. `newGameFromId` builds a fresh
    // drawstate for the new game; the app's reshape would then call
    // `resizeDrawing` → engine.canvasCleared (we invoke it directly here since
    // this is a midend-level test).
    expect(me.newGameFromId(`5x5c:${desc5}`)).toBeNull();
    const reshaped = me.size(flipGame.computeSize(p5, TILE));
    // The claim the test's name makes, asserted rather than assumed: both
    // boards were laid out at the same tile size.
    expect(reshaped).toEqual(flipGame.computeSize(p5, TILE));

    // Before `canvasCleared`, the drawstate must be a *live cache* — otherwise
    // the assertion after it is vacuous. This paint is the one that arms it:
    // `newGameFromId` builds a fresh drawstate, so this first paint of the 5x5
    // board draws the grid whatever `canvasCleared` does. Without it the test
    // passes with `canvasCleared` gutted to a bare `return`.
    const armed = recordingDrawing();
    me.redraw(armed.dr);
    const idle = recordingDrawing();
    me.redraw(idle.dr);
    expect(idle.ops.filter((o) => o.op === "line" && o.color === COL_GRID).length).toBe(
      0,
    );

    me.canvasCleared(); // app calls this from `resizeDrawing`
    const second = recordingDrawing();
    me.redraw(second.dr);

    // Flip's `!ds.started` branch fired: full-window bg fill +
    // grid lines.
    expect(second.ops.some((o) => o.op === "rect" && o.color === 0)).toBe(true);
    const secondGridLines = second.ops.filter(
      (o) => o.op === "line" && o.color === COL_GRID,
    ).length;
    expect(secondGridLines).toBeGreaterThan(0);
  });
});

describe("Flip win flash", () => {
  const params: FlipParams = { w: 4, h: 3, matrixType: "crosses" };
  const TILE = flipGame.preferredTileSize ?? 32;
  /** The squares a frame's ops put on the lifted surface, by cell. */
  const lifted = (ops: RecordingDrawing["ops"]): number[] =>
    opsOfKind(ops, "rect")
      .filter((o) => o.color === COL_FLASH)
      .map(
        (o) =>
          Math.floor((o.y - border(TILE)) / TILE) * params.w +
          Math.floor((o.x - border(TILE)) / TILE),
      );

  it("sweeps the squares from the bottom left to the top right", () => {
    const start = flipGame.newState(
      params,
      flipGame.newDesc(params, randomNew("f")).desc,
    );
    const answer = solveFlip(start, start);
    if (!answer.ok) throw new Error("the fixture does not solve");
    const s = flipGame.executeMove(start, answer.move);
    expect(flipGame.status(s)).toBe("solved");
    const ui = flipGame.newUi(s);
    const run = winFlashRun(
      (flash) => {
        const { dr, ops } = recordingDrawing();
        flipGame.redraw(dr, preferredDrawState(flipGame, s), null, s, 1, ui, 0, flash);
        return ops;
      },
      lifted,
      40,
    );
    expectWinFlashTravels(run, params.w * params.h, (i) =>
      sweepStep(i % params.w, Math.floor(i / params.w)),
    );
    expect(run.frames[0]).toEqual([(params.h - 1) * params.w]);
  });

  /** A midend on a dealt board, the squares the solution presses, and a
   * press of one of them. */
  function dealtBoard(seed: string) {
    const { desc } = flipGame.newDesc(params, randomNew(seed));
    const me = new Midend(flipGame);
    expect(
      me.newGameFromId(`${flipGame.encodeParams(params, false)}:${desc}`),
    ).toBeNull();
    const initial = flipGame.newState(params, desc);
    const result = solveFlip(initial, initial);
    if (!result.ok || result.move.kind !== "solution")
      throw new Error("the fixture does not solve");
    const cells: number[] = [];
    result.move.mask.forEach((bit, idx) => {
      if (bit) cells.push(idx);
    });
    const press = (cell: number) =>
      me.processInput(
        (cell % params.w) * TILE + border(TILE) + 1,
        Math.floor(cell / params.w) * TILE + border(TILE) + 1,
        PuzzleButton.LEFT_BUTTON,
      );
    /** Run the clock for `seconds`, and say which squares were lifted in
     * any frame of it. */
    const play = (seconds: number): number[] => {
      const seen: number[] = [];
      for (let t = 0; t < seconds; t += 0.02) {
        me.timer(0.02);
        const { dr, ops } = recordingDrawing();
        me.redraw(dr);
        seen.push(...lifted(ops));
      }
      return seen;
    };
    return { me, cells, press, play };
  }

  // A flash drawn on any animated move would sweep the board on every press.
  it("is not drawn through a move that does not solve the board", () => {
    const { cells, press, play } = dealtBoard("flip-flash-iso");
    expect(cells.length).toBeGreaterThan(1);
    expect(press(cells[0])).toBe(true);
    expect(play(1)).toEqual([]);
  });

  it("is drawn after the move that solves it, from the bottom-left square", () => {
    const { cells, press, play } = dealtBoard("flip-flash-solve");
    for (const cell of cells.slice(0, -1)) {
      press(cell);
      expect(play(0.5)).toEqual([]);
    }
    press(cells[cells.length - 1]);
    const seen = play(3);
    expect(seen[0]).toBe((params.h - 1) * params.w);
    expect(new Set(seen).size).toBe(params.w * params.h);
    // Over, and the board is back on its own surface.
    expect(play(0.5)).toEqual([]);
  });
});

describe("Flip animation/redraw lifecycle (regression: clicks not rendered)", () => {
  it("a click repaints, runs the anim timer, then settles", () => {
    const params: FlipParams = { w: 3, h: 3, matrixType: "crosses" };
    const { desc } = flipGame.newDesc(params, randomNew("flip-anim-seed"));
    const { midend: me, timerActive, redraws } = driveMidend(flipGame);
    // The solve timer shares the tick; switched off, the tick is the
    // animation's alone.
    me.setPreferences({ [SHOW_TIMER_PREF]: false });
    expect(me.newGameFromId(`3x3c:${desc}`)).toBeNull();
    expect(timerActive()).toBe(false); // settled, no animation yet
    const afterLoad = redraws();

    const tile = flipGame.preferredTileSize ?? 32;
    const border = tile >> 1;
    // Click cell (0,0): a crosses cell always toggles ⇒ a real move.
    expect(me.processInput(border + 1, border + 1, 0x0200)).toBe(true);
    // An animated move does NOT paint synchronously (a frame-0 paint
    // flickers); it arms the rAF timer instead.
    expect(redraws()).toBe(afterLoad);
    expect(timerActive()).toBe(true); // ANIM_TIME>0 ⇒ rAF loop requested

    me.timer(0.1); // first timer tick paints the first animation frame
    expect(redraws()).toBeGreaterThan(afterLoad);
    expect(timerActive()).toBe(true);

    const midAnim = redraws();
    me.timer(0.3); // past ANIM_TIME ⇒ final settle paint, timer released
    expect(redraws()).toBeGreaterThan(midAnim);
    expect(timerActive()).toBe(false);
  });
});

describe("Flip through the midend", () => {
  it("plays to solved-with-help and round-trips a save", () => {
    const params: FlipParams = { w: 3, h: 3, matrixType: "crosses" };
    const { desc } = flipGame.newDesc(params, randomNew("flip-midend-seed"));
    const h = driveMidend(flipGame);
    const me = h.midend;
    expect(
      me.newGameFromId(`${flipGame.encodeParams(params, false)}:${desc}`),
    ).toBeNull();

    // Solve presses the solution's squares itself.
    expect(me.solve()).toBeNull();
    expect(h.last("game-state-change")?.status).toBe("solved-with-help");

    const saved = me.saveGame();
    const me2 = new Midend(flipGame);
    expect(me2.loadGame(saved)).toBeNull();
    expect(me2.formatAsText()).toContain("+");
  });
});
