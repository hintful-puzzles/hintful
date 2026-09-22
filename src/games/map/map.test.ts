/**
 * Behavioral tests for the Map port (tier 1 + a tier-2 paint-twice render
 * check). Byte-match generation/solver fidelity lives in
 * `map-differential.test.ts`; this file covers the codec, input → move mapping,
 * `executeMove`, completion, `findMistakes`, and `solve`.
 */

import { describe, expect, it } from "vitest";
import { UI_UPDATE } from "../../engine/game.ts";
import { Midend } from "../../engine/index.ts";
import { CLEAR_BUTTON } from "../../engine/key-labels.ts";
import {
  LEFT_BUTTON,
  LEFT_RELEASE,
  RIGHT_BUTTON,
  RIGHT_RELEASE,
} from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import {
  type AnyGame,
  fingerprint,
  probeBoard,
  probePoints,
} from "../../engine/testing/input-probe.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { newMapDesc } from "./generator.ts";
import { mapGame } from "./index.ts";
import { BE, TE, validateDesc } from "./map-data.ts";
import {
  COL_0,
  COL_CURSOR,
  COL_MISTAKE,
  newDrawState,
  origin,
  placeCursorAtCoords,
  redraw,
  regionFromCoords,
  regionFromUiCursor,
} from "./render.ts";
import {
  cloneState,
  DIFF_HARD,
  DIFF_NORMAL,
  decodeParams,
  defaultParams,
  encodeParams,
  type MapOp,
  type MapParams,
  type MapState,
  type MapUi,
  newUi,
} from "./state.ts";

const TS = 20;

function makeGame(p: MapParams, seed: string): { state: MapState; aux: string } {
  const { desc, aux } = newMapDesc(p, randomNew(seed));
  return { state: mapGame.newState(p, desc) as MapState, aux };
}

function solutionFromAux(aux: string, n: number): Int32Array {
  const sol = new Int32Array(n).fill(-1);
  for (const tok of aux.split(";")) {
    if (tok === "S" || tok === "") continue;
    const [c, r] = tok.split(":");
    sol[Number(r)] = Number(c);
  }
  return sol;
}

/** A cell whose four quadrants all belong to `region` — a safe click point. */
function solidCellOf(state: MapState, region: number): { x: number; y: number } | null {
  const { w, h } = state.params;
  const wh = w * h;
  const M = state.map.map;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const c = y * w + x;
      if (
        M[TE * wh + c] === region &&
        M[wh + c] === region &&
        M[2 * wh + c] === region &&
        M[3 * wh + c] === region
      )
        return { x, y };
    }
  return null;
}

/** The pixel center of a cell. Through `origin`, because the board is inset by
 * the room the pencil-mode indicator needs and a hand-written `x * TS` aims at
 * the cell's corner instead. */
function centerOf(cell: { x: number; y: number }): { x: number; y: number } {
  const half = Math.floor(TS / 2);
  return { x: origin(TS) + cell.x * TS + half, y: origin(TS) + cell.y * TS + half };
}

function firstBlank(state: MapState): number {
  for (let i = 0; i < state.params.n; i++) if (!state.map.immutable[i]) return i;
  throw new Error("no blank region");
}

function firstClue(state: MapState): number {
  for (let i = 0; i < state.params.n; i++) if (state.map.immutable[i]) return i;
  throw new Error("no clue");
}

function findClueBlankPair(state: MapState): { clue: number; blank: number } | null {
  const { graph, ngraph, immutable } = state.map;
  const n = state.params.n;
  for (let i = 0; i < ngraph; i++) {
    const a = Math.floor(graph[i] / n);
    const b = graph[i] % n;
    if (immutable[a] && !immutable[b]) return { clue: a, blank: b };
    if (immutable[b] && !immutable[a]) return { clue: b, blank: a };
  }
  return null;
}

// --- params ----------------------------------------------------------

describe("map params codec", () => {
  it("round-trips every preset", () => {
    const menu = mapGame.presets();
    for (const entry of menu.submenu ?? []) {
      const p = entry.params as MapParams;
      expect(decodeParams(encodeParams(p, true))).toEqual(p);
    }
  });

  it("encodes with a full difficulty suffix", () => {
    expect(encodeParams({ w: 20, h: 15, n: 30, diff: DIFF_NORMAL }, true)).toBe(
      "20x15n30dn",
    );
    expect(encodeParams({ w: 20, h: 15, n: 30, diff: DIFF_NORMAL }, false)).toBe(
      "20x15n30",
    );
  });

  it("decodes leniently (square, default n, difficulty char, `.` fraction)", () => {
    expect(decodeParams("12")).toEqual({ w: 12, h: 12, n: 18, diff: DIFF_NORMAL });
    expect(decodeParams("20x15n30dh")).toEqual({
      w: 20,
      h: 15,
      n: 30,
      diff: DIFF_HARD,
    });
    expect(decodeParams("10x10n5.5").n).toBe(5);
  });

  it("rejects out-of-range params", () => {
    expect(
      mapGame.validateParams({ w: 20, h: 15, n: 4, diff: 0 }, true),
    ).not.toBeNull();
    expect(mapGame.validateParams({ w: 3, h: 3, n: 30, diff: 0 }, true)).not.toBeNull();
    expect(mapGame.validateParams(defaultParams(), true)).toBeNull();
  });
});

// --- desc validation -------------------------------------------------

describe("map desc validation", () => {
  const p: MapParams = { w: 12, h: 10, n: 12, diff: DIFF_NORMAL };
  const { desc } = newMapDesc(p, randomNew("desc-valid"));

  it("accepts a generated desc", () => {
    expect(validateDesc(p, desc)).toBeNull();
  });

  it("rejects a desc with the wrong clue count", () => {
    expect(validateDesc(p, `${desc}0`)).not.toBeNull();
  });

  it("rejects an unexpected character", () => {
    expect(validateDesc(p, desc.replace(",", ",!"))).not.toBeNull();
  });
});

// --- executeMove -----------------------------------------------------

describe("map executeMove", () => {
  const p: MapParams = { w: 12, h: 10, n: 12, diff: DIFF_NORMAL };

  it("colors a region and clears its pencil", () => {
    const { state } = makeGame(p, "exec-1");
    const blank = firstBlank(state);
    let s = cloneState(state);
    s = mapGame.executeMove(s, { ops: [{ op: "pencil", region: blank, bit: 2 }] });
    expect(s.pencil[blank]).toBe(1 << 2);
    s = mapGame.executeMove(s, { ops: [{ op: "color", region: blank, color: 1 }] });
    expect(s.coloring[blank]).toBe(1);
    expect(s.pencil[blank]).toBe(0);
  });

  it("toggles a pencil bit and rejects penciling a colored region", () => {
    const { state } = makeGame(p, "exec-2");
    const blank = firstBlank(state);
    let s = mapGame.executeMove(state, {
      ops: [{ op: "pencil", region: blank, bit: 1 }],
    });
    expect(s.pencil[blank]).toBe(2);
    s = mapGame.executeMove(s, { ops: [{ op: "pencil", region: blank, bit: 1 }] });
    expect(s.pencil[blank]).toBe(0);

    const colored = mapGame.executeMove(state, {
      ops: [{ op: "color", region: blank, color: 0 }],
    });
    expect(() =>
      mapGame.executeMove(colored, { ops: [{ op: "pencil", region: blank, bit: 0 }] }),
    ).toThrow();
  });

  it("detects completion on the full solution", () => {
    const { state, aux } = makeGame(p, "exec-3");
    const sol = solutionFromAux(aux, p.n);
    const ops: MapOp[] = [];
    for (let i = 0; i < p.n; i++)
      if (!state.map.immutable[i]) ops.push({ op: "color", region: i, color: sol[i] });
    const done = mapGame.executeMove(state, { ops });
    expect(done.completed).toBe(true);
    expect(mapGame.status(done)).toBe("solved");
  });

  it("does not complete a partially-colored board", () => {
    const { state, aux } = makeGame(p, "exec-4");
    const sol = solutionFromAux(aux, p.n);
    const blank = firstBlank(state);
    const s = mapGame.executeMove(state, {
      ops: [{ op: "color", region: blank, color: sol[blank] }],
    });
    expect(s.completed).toBe(false);
  });
});

// --- interpretMove ---------------------------------------------------

describe("map interpretMove", () => {
  const p: MapParams = { w: 12, h: 10, n: 12, diff: DIFF_NORMAL };

  it("press picks up a region's color, release drops it", () => {
    const { state } = makeGame(p, "input-1");
    const ui = newUi(state);
    const ds = newDrawState(state, TS);

    const found = findClueBlankPair(state);
    expect(found).not.toBeNull();
    if (!found) return;
    const clueCell = solidCellOf(state, found.clue);
    const blankCell = solidCellOf(state, found.blank);
    if (!clueCell || !blankCell) return;

    const press = mapGame.interpretMove(state, ui, ds, centerOf(clueCell), LEFT_BUTTON);
    expect(press).toBe(UI_UPDATE);
    expect(ui.dragColor).toBe(state.coloring[found.clue]);

    const rel = mapGame.interpretMove(state, ui, ds, centerOf(blankCell), LEFT_RELEASE);
    expect(rel).not.toBe(UI_UPDATE);
    expect(rel).not.toBeNull();
    const s2 = mapGame.executeMove(state, rel as { ops: MapOp[] });
    expect(s2.coloring[found.blank]).toBe(state.coloring[found.clue]);
  });

  it("dropping on an immutable region is a no-op", () => {
    const { state } = makeGame(p, "input-2");
    const ui = newUi(state);
    const ds = newDrawState(state, TS);

    const clue = firstClue(state);
    const clueCell = solidCellOf(state, clue);
    // Asserted rather than skipped: no clue cell means no drop to check.
    expect(clueCell, "the board has no solid cell in a clued region").toBeDefined();
    if (!clueCell) return;
    mapGame.interpretMove(state, ui, ds, centerOf(clueCell), LEFT_BUTTON);
    const rel = mapGame.interpretMove(state, ui, ds, centerOf(clueCell), LEFT_RELEASE);
    expect(rel).toBe(UI_UPDATE);
  });

  it("right-drag toggles a pencil mark on a blank region", () => {
    const { state } = makeGame(p, "input-3");
    const ui = newUi(state);
    const ds = newDrawState(state, TS);

    const found = findClueBlankPair(state);
    // All three asserted rather than skipped: any one missing would leave the
    // whole drag unexercised and the test green.
    expect(found, "no clue/blank pair on this board").toBeDefined();
    if (!found) return;
    const clueCell = solidCellOf(state, found.clue);
    const blankCell = solidCellOf(state, found.blank);
    expect(clueCell, "the clued region has no solid cell").toBeDefined();
    expect(blankCell, "the blank region has no solid cell").toBeDefined();
    if (!clueCell || !blankCell) return;

    mapGame.interpretMove(state, ui, ds, centerOf(clueCell), RIGHT_BUTTON);
    const rel = mapGame.interpretMove(
      state,
      ui,
      ds,
      centerOf(blankCell),
      RIGHT_RELEASE,
    );
    expect(rel).not.toBe(UI_UPDATE);
    const s2 = mapGame.executeMove(state, rel as { ops: MapOp[] });
    expect(s2.coloring[found.blank]).toBe(-1);
    expect(s2.pencil[found.blank]).toBe(1 << (state.coloring[found.clue] as number));
  });

  it("a right tap is the note-taking cell's, beside the right drag", () => {
    const { state } = makeGame(p, "input-right-tap");
    const ds = newDrawState(state, TS);
    const blank = firstBlank(state);
    const cell = solidCellOf(state, blank);
    expect(cell, "the blank region has no solid cell").toBeDefined();
    if (!cell) return;
    const tap = (ui: MapUi, down: number, up: number) => {
      mapGame.interpretMove(state, ui, ds, centerOf(cell), down);
      return mapGame.interpretMove(state, ui, ds, centerOf(cell), up);
    };

    // Sticky, the family default: a right tap latches notes mode and selects.
    const ui = newUi(state);
    expect(tap(ui, RIGHT_BUTTON, RIGHT_RELEASE)).toBe(UI_UPDATE);
    expect(ui.pencilMode).toBe(true);
    expect(ui.cursor.visible).toBe(true);
    expect(regionFromUiCursor(state.map, ui)).toBe(blank);
    // …and a left tap leaves the latch alone.
    tap(ui, LEFT_BUTTON, LEFT_RELEASE);
    expect(ui.pencilMode).toBe(true);

    // Without it, a right tap selects for notes and a left one for colors.
    const plain = { ...newUi(state), pencilSticky: false };
    tap(plain, RIGHT_BUTTON, RIGHT_RELEASE);
    expect(plain.pencilMode).toBe(true);
    tap(plain, LEFT_BUTTON, LEFT_RELEASE);
    expect(plain.pencilMode).toBe(false);
    expect(plain.cursor.visible).toBe(true);
  });

  it("the 'l' key toggles region numbers", () => {
    const { state } = makeGame(p, "input-4");
    const ui = newUi(state);
    expect(ui.showNumbers).toBe(false);
    const r = mapGame.interpretMove(
      state,
      ui,
      preferredDrawState(mapGame, state),
      { x: 0, y: 0 },
      108,
    );
    expect(r).toBe(UI_UPDATE);
    expect(ui.showNumbers).toBe(true);
  });
});

// --- solve + findMistakes --------------------------------------------

describe("map solve + findMistakes", () => {
  const p: MapParams = { w: 12, h: 10, n: 12, diff: DIFF_NORMAL };

  it("solve (re-derived) colors every region correctly", () => {
    const { state, aux } = makeGame(p, "solve-1");
    const sol = solutionFromAux(aux, p.n);
    const res = mapGame.solve?.(state, state, undefined);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    const done = mapGame.executeMove(state, res.move);
    expect(done.cheated).toBe(true);
    for (let i = 0; i < p.n; i++) expect(done.coloring[i]).toBe(sol[i]);
  });

  it("solve via aux matches re-derivation", () => {
    const { state, aux } = makeGame(p, "solve-2");
    const res = mapGame.solve?.(state, state, aux);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    const done = mapGame.executeMove(state, res.move);
    const sol = solutionFromAux(aux, p.n);
    for (let i = 0; i < p.n; i++) expect(done.coloring[i]).toBe(sol[i]);
  });

  it("flags a region colored against the unique solution", () => {
    const { state, aux } = makeGame(p, "mistake-1");
    const sol = solutionFromAux(aux, p.n);
    const blank = firstBlank(state);
    const wrong = (sol[blank] + 1) % 4;
    const s = mapGame.executeMove(state, {
      ops: [{ op: "color", region: blank, color: wrong }],
    });
    const mistakes = mapGame.findMistakes?.(s) ?? [];
    expect(mistakes.some((m) => m.region === blank)).toBe(true);
  });

  it("reports no mistakes on a correctly-colored partial board", () => {
    const { state, aux } = makeGame(p, "mistake-2");
    const sol = solutionFromAux(aux, p.n);
    const blank = firstBlank(state);
    const s = mapGame.executeMove(state, {
      ops: [{ op: "color", region: blank, color: sol[blank] }],
    });
    expect(mapGame.findMistakes?.(s) ?? []).toHaveLength(0);
  });
});

// --- Midend save round-trip ------------------------------------------

describe("map save round-trip", () => {
  it("saveGame -> loadGame -> saveGame is a fixpoint after a move", () => {
    const p: MapParams = { w: 12, h: 10, n: 12, diff: DIFF_NORMAL };
    const id = `${encodeParams(p, true)}#save-rt`;
    // Same seed as the id, so `blank` is a blank region on the Midend's board.
    const { state } = makeGame(p, "save-rt");
    const blank = firstBlank(state);

    const me = new Midend(mapGame);
    expect(me.newGameFromId(id)).toBeNull();
    me.playMoves([{ ops: [{ op: "color", region: blank, color: 2 }] }]);
    const saved = me.saveGame();

    const me2 = new Midend(mapGame);
    expect(me2.loadGame(saved)).toBeNull();
    // A faithful reconstruction re-serializes to the same bytes.
    expect(Array.from(me2.saveGame())).toEqual(Array.from(saved));
  });
});

// --- tier 2: paint-twice mistake overlay -----------------------------

describe("map mistake overlay repaints on an already-drawn board", () => {
  it("reds a wrong region even when the cell was already drawn", () => {
    const p: MapParams = { w: 12, h: 10, n: 12, diff: DIFF_NORMAL };
    const { desc, aux } = newMapDesc(p, randomNew("paint-twice"));
    const state0 = mapGame.newState(p, desc) as MapState;
    const sol = solutionFromAux(aux, p.n);
    const blank = firstBlank(state0);
    const wrong = (sol[blank] + 1) % 4;
    const state = mapGame.executeMove(state0, {
      ops: [{ op: "color", region: blank, color: wrong }],
    });

    const ui = newUi(state);
    const ds = newDrawState(state, TS);

    // Frame 1: no overlay — warm the cache.
    const dr1 = new RecordingDrawing(mapGame.colors([0.9, 0.9, 0.9]));
    dr1.startDraw();
    redraw(dr1, ds, null, state, 0, ui, 0, 0, undefined, []);
    dr1.endDraw();

    // Frame 2: same drawstate, now with the mistake overlay.
    const mistakes = mapGame.findMistakes?.(state) ?? [];
    expect(mistakes.length).toBeGreaterThan(0);
    const dr2 = new RecordingDrawing(mapGame.colors([0.9, 0.9, 0.9]));
    dr2.startDraw();
    redraw(dr2, ds, state, state, 0, ui, 0, 0, undefined, mistakes);
    dr2.endDraw();

    expect(dr2.ops.some((o) => o.op === "rect" && o.color === COL_MISTAKE)).toBe(true);
  });
});

// --- the keypad, and entry at the cursor -----------------------------

describe("map keypad", () => {
  it("offers one key per color, painted in it, plus Clear", () => {
    // Pinned, so a fifth key or a renumbered swatch fails here rather than
    // showing the player a button in a color the board does not use. The Marks
    // key is absent on purpose: the engine appends it, and
    // `pencil-mode-key.test.ts` is what holds that.
    expect(mapGame.requestKeys?.(defaultParams())).toEqual([
      { button: 0x31, label: "1", swatch: COL_0 },
      { button: 0x32, label: "2", swatch: COL_0 + 1 },
      { button: 0x33, label: "3", swatch: COL_0 + 2 },
      { button: 0x34, label: "4", swatch: COL_0 + 3 },
      { button: CLEAR_BUTTON, label: "Clear" },
    ]);
  });

  it("names a swatch this game's own palette holds", () => {
    // The frontend resolves the index against this palette, so one past its end
    // paints the key in nothing at all.
    const palette = mapGame.colors([0.9, 0.9, 0.9]);
    const swatches = (mapGame.requestKeys?.(defaultParams()) ?? []).flatMap((k) =>
      k.swatch === undefined ? [] : [k.swatch],
    );
    expect(swatches).toHaveLength(4);
    for (const i of swatches) expect(palette[i]).toBeDefined();
  });
});

describe("map key entry", () => {
  const p: MapParams = { w: 12, h: 10, n: 12, diff: DIFF_NORMAL };

  /** A ui whose cursor is on `region`, as a tap there would leave it. */
  function cursorOn(state: MapState, region: number): MapUi {
    const ui = newUi(state);
    const cell = solidCellOf(state, region);
    expect(cell, `region ${region} has no solid cell to tap`).toBeDefined();
    if (!cell) throw new Error("unreachable");
    const { x, y } = centerOf(cell);
    placeCursorAtCoords(ui, TS, x, y);
    ui.cursor.visible = true;
    return ui;
  }

  function press(state: MapState, ui: MapUi, button: number) {
    const ds = newDrawState(state, TS);
    return mapGame.interpretMove(state, ui, ds, { x: 0, y: 0 }, button);
  }

  it("a color key colors the region at the cursor", () => {
    const { state } = makeGame(p, "key-color");
    const blank = firstBlank(state);
    const move = press(state, cursorOn(state, blank), 0x33);
    expect(move).not.toBe(UI_UPDATE);
    expect(move).not.toBeNull();
    expect(mapGame.executeMove(state, move as { ops: MapOp[] }).coloring[blank]).toBe(
      2,
    );
  });

  it("a color key marks the region in notes mode, and toggles", () => {
    const { state } = makeGame(p, "key-mark");
    const blank = firstBlank(state);
    const ui = cursorOn(state, blank);
    ui.pencilMode = true;

    const on = press(state, ui, 0x32);
    expect(on).not.toBe(UI_UPDATE);
    const marked = mapGame.executeMove(state, on as { ops: MapOp[] });
    expect(marked.coloring[blank]).toBe(-1);
    expect(marked.pencil[blank]).toBe(1 << 1);

    const off = press(marked, ui, 0x32);
    expect(off).not.toBe(UI_UPDATE);
    expect(mapGame.executeMove(marked, off as { ops: MapOp[] }).pencil[blank]).toBe(0);
  });

  it("Clear empties the region", () => {
    const { state } = makeGame(p, "key-clear");
    const blank = firstBlank(state);
    const colored = mapGame.executeMove(state, {
      ops: [{ op: "color", region: blank, color: 1 }],
    });
    const move = press(colored, cursorOn(state, blank), CLEAR_BUTTON);
    expect(move).not.toBe(UI_UPDATE);
    expect(mapGame.executeMove(colored, move as { ops: MapOp[] }).coloring[blank]).toBe(
      -1,
    );
  });

  it("a color key refuses a clue", () => {
    const { state } = makeGame(p, "key-clue");
    const clue = firstClue(state);
    const other = (state.coloring[clue] + 1) % 4;
    expect(press(state, cursorOn(state, clue), 0x31 + other)).toBe(UI_UPDATE);
  });

  it("a color key with no cursor shown is declined", () => {
    // Declined rather than entered blind, as the digit games do: `null` is also
    // what lets the app's bare-letter shortcuts through (`puzzle/shortcuts.ts`).
    const { state } = makeGame(p, "key-nocursor");
    const ui = newUi(state);
    expect(ui.cursor.visible).toBe(false);
    expect(press(state, ui, 0x31)).toBeNull();
    expect(press(state, ui, CLEAR_BUTTON)).toBeNull();
  });
});

describe("map tap selection", () => {
  const p: MapParams = { w: 12, h: 10, n: 12, diff: DIFF_NORMAL };

  it("selects the region the finger was on, quadrant and all", () => {
    // The cursor is a cell *plus a direction*, which is how upstream names one
    // of the regions a diagonally-split cell holds. What has to hold is that
    // the translation from a pixel is lossless: the region the tap hit is the
    // region the cursor then names.
    const { state } = makeGame(p, "tap-select");
    const ui = newUi(state);
    const { w, h } = p;
    const half = Math.floor(TS / 2);

    let sampled = 0;
    let offCenter = 0;
    for (let cy = 0; cy < h; cy++)
      for (let cx = 0; cx < w; cx++) {
        const mid = { x: origin(TS) + cx * TS + half, y: origin(TS) + cy * TS + half };
        // The center, and a point well inside each quadrant, so a split cell is
        // sampled on both sides of its diagonal.
        for (const [dx, dy] of [
          [0, 0],
          [0, -6],
          [0, 6],
          [-6, 0],
          [6, 0],
        ]) {
          const x = mid.x + dx;
          const y = mid.y + dy;
          const hit = regionFromCoords(state.map, TS, x, y);
          if (hit < 0) continue;
          sampled++;
          placeCursorAtCoords(ui, TS, x, y);
          expect(
            regionFromUiCursor(state.map, ui),
            `a tap at (${x}, ${y}) selected the wrong region`,
          ).toBe(hit);
          if (hit !== regionFromCoords(state.map, TS, mid.x, mid.y)) offCenter++;
        }
      }

    // Vacuity guards. The first says the sweep saw the board at all; the second
    // says it reached the case the quadrant exists for — a point naming a
    // different region from its own cell's center, which only a split cell has.
    expect(sampled).toBeGreaterThan(w * h * 4);
    expect(offCenter).toBeGreaterThan(0);
  });

  it("a tap commits nothing and leaves the cursor on that region", () => {
    const { state } = makeGame(p, "tap-noop");
    const ui = newUi(state);
    const ds = newDrawState(state, TS);
    const blank = firstBlank(state);
    const cell = solidCellOf(state, blank);
    expect(cell, "the blank region has no solid cell").toBeDefined();
    if (!cell) return;

    expect(mapGame.interpretMove(state, ui, ds, centerOf(cell), LEFT_BUTTON)).toBe(
      UI_UPDATE,
    );
    expect(mapGame.interpretMove(state, ui, ds, centerOf(cell), LEFT_RELEASE)).toBe(
      UI_UPDATE,
    );
    expect(ui.cursor.visible).toBe(true);
    expect(regionFromUiCursor(state.map, ui)).toBe(blank);
  });

  it("a key reaches a region after a tap alone, with no drag anywhere", () => {
    // The question `input-parity.test.ts` cannot ask: it walks the cursor with
    // arrow keys first, so it would pass over a panel that no gesture a touch
    // player has can reach.
    const { m, size, reset } = probeBoard(mapGame as unknown as AnyGame, "map-tap-key");
    let reached = 0;
    for (const pt of probePoints(size)) {
      reset();
      const before = fingerprint(m);
      m.processInput(pt.x, pt.y, LEFT_BUTTON);
      // No LEFT_DRAG between them, deliberately: a tap is the whole gesture.
      m.processInput(pt.x, pt.y, LEFT_RELEASE);
      m.processInput(0, 0, 0x31);
      if (fingerprint(m) !== before) reached++;
    }
    expect(reached).toBeGreaterThan(0);
  });

  it("carries a keyboard-held color inside the triangle the drop will land in", () => {
    // Tier 2. On a divided cell upstream's one-pixel nudge parks the blob on
    // the diagonal, saying nothing about which half the drop means. It goes to
    // the triangle's centroid instead — a third of a tile, for a quadrant of a
    // square.
    const { state } = makeGame(p, "cursor-offset");
    const { w, h } = p;
    const wh = w * h;
    const M = state.map.map;
    const half = Math.floor(TS / 2);

    /** Where `redraw` puts the carried blob, relative to the cell center. */
    function ringOffset(cell: { x: number; y: number }): { dx: number; dy: number } {
      const ui = newUi(state);
      placeCursorAtCoords(
        ui,
        TS,
        origin(TS) + cell.x * TS + half,
        origin(TS) + cell.y * TS + half + 6,
      );
      ui.cursor.visible = true;
      ui.dragColor = 0;
      const dr = new RecordingDrawing(mapGame.colors([0.9, 0.9, 0.9]));
      dr.startDraw();
      redraw(dr, newDrawState(state, TS), null, state, 0, ui, 0, 0, undefined, []);
      dr.endDraw();
      const ring = dr.ops.find((o) => o.op === "circle" && o.r === Math.floor(TS / 2));
      expect(ring, "the carried blob was not drawn").toBeDefined();
      const c = ring as { cx: number; cy: number };
      return {
        dx: c.cx - (origin(TS) + cell.x * TS + half),
        dy: c.cy - (origin(TS) + cell.y * TS + half),
      };
    }

    let divided: { x: number; y: number } | null = null;
    let whole: { x: number; y: number } | null = null;
    for (let y = 0; y < h && !(divided && whole); y++)
      for (let x = 0; x < w && !(divided && whole); x++) {
        const c = y * w + x;
        const cell = { x, y };
        if (M[TE * wh + c] !== M[BE * wh + c]) divided ??= cell;
        else whole ??= cell;
      }
    // Asserted, not skipped: without both the comparison below is vacuous.
    expect(divided, "no divided cell on this board").not.toBeNull();
    expect(whole, "no whole cell on this board").not.toBeNull();
    if (!divided || !whole) return;

    // The tap was below each cell's center, so the blob goes down.
    expect(ringOffset(divided)).toEqual({ dx: 0, dy: Math.floor(TS / 3) });
    expect(ringOffset(whole)).toEqual({ dx: 0, dy: 1 });
  });
});

describe("the selected region's picture", () => {
  // Tier 2. The note-taking cell's picture for a selection that is a region: a
  // band just inside its boundary, and for notes the corner triangle in its
  // first cell. The region's own fill never changes — it is the answer here.
  const p: MapParams = { w: 12, h: 10, n: 12, diff: DIFF_NORMAL };
  const { state } = makeGame(p, "selection-band");
  const { w, h } = p;
  const wh = w * h;
  const M = state.map.map;
  const palette = mapGame.colors([0.9, 0.9, 0.9]);

  // A region that owns half of a divided cell, so the diagonal is in play.
  let divided = -1;
  for (let c = 0; c < wh && divided < 0; c++)
    if (M[TE * wh + c] !== M[BE * wh + c]) divided = c;
  const selected = M[BE * wh + divided];
  const at = {
    x: origin(TS) + (divided % w) * TS + Math.floor(TS / 2),
    y: origin(TS) + Math.floor(divided / w) * TS + Math.floor(TS / 2) + 6,
  };

  function frame(over: Partial<MapUi>): ReturnType<typeof bandOps> {
    const ui = { ...newUi(state), ...over };
    placeCursorAtCoords(ui, TS, at.x, at.y);
    const dr = new RecordingDrawing(palette);
    redraw(dr, newDrawState(state, TS), null, state, 0, ui, 0, 0, undefined, []);
    return bandOps(dr);
  }
  function bandOps(dr: RecordingDrawing) {
    return dr.ops.filter(
      (o): o is Extract<typeof o, { op: "polygon" }> =>
        o.op === "polygon" && o.fill === COL_CURSOR,
    );
  }
  const centroid = (pts: ReadonlyArray<readonly [number, number]>) => ({
    x: pts.reduce((s, q) => s + q[0], 0) / pts.length,
    y: pts.reduce((s, q) => s + q[1], 0) / pts.length,
  });
  const cellOf = (pt: { x: number; y: number }) =>
    Math.floor((pt.y - origin(TS)) / TS) * w + Math.floor((pt.x - origin(TS)) / TS);

  it("picked a divided cell and named its bottom region (vacuity)", () => {
    expect(divided).toBeGreaterThanOrEqual(0);
    expect(regionFromCoords(state.map, TS, at.x, at.y)).toBe(selected);
  });

  it("bands every cell on the region's boundary, and nothing outside it", () => {
    const band = frame({ cursor: { x: 0, y: 0, visible: true } });
    expect(band.length).toBeGreaterThan(0);
    for (const o of band) {
      const c = centroid(o.points);
      expect(regionFromCoords(state.map, TS, c.x, c.y), "band outside the region").toBe(
        selected,
      );
    }
    // A cell holding part of the region is on its boundary when it is split,
    // on the board's edge, or beside a cell of another region.
    const banded = new Set(band.map((o) => cellOf(centroid(o.points))));
    let boundary = 0;
    for (let c = 0; c < wh; c++) {
      const x = c % w;
      const y = Math.floor(c / w);
      const inIt = M[TE * wh + c] === selected || M[BE * wh + c] === selected;
      if (!inIt) continue;
      const whole = M[TE * wh + c] === M[BE * wh + c];
      const beside = [
        [x, y - 1],
        [x + 1, y],
        [x, y + 1],
        [x - 1, y],
      ].some(
        ([nx, ny]) =>
          nx < 0 ||
          ny < 0 ||
          nx >= w ||
          ny >= h ||
          M[TE * wh + ny * w + nx] !== selected ||
          M[BE * wh + ny * w + nx] !== selected,
      );
      if (!whole || beside) {
        boundary++;
        expect(banded.has(c), `boundary cell ${c} has no band`).toBe(true);
      }
    }
    expect(boundary).toBeGreaterThan(0);

    // A band, not a wash: it covers a small part of the region, whose fill is
    // what the player reads. Quadrants are a quarter of a tile each.
    const area = (pts: ReadonlyArray<readonly [number, number]>) =>
      Math.abs(
        pts.reduce(
          (s, [x0, y0], i) =>
            s + x0 * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * y0,
          0,
        ) / 2,
      );
    let quadrants = 0;
    for (let e = 0; e < 4; e++)
      for (let c = 0; c < wh; c++) if (M[e * wh + c] === selected) quadrants++;
    const covered = band.reduce((s, o) => s + area(o.points), 0);
    expect(covered).toBeLessThan((quadrants * TS * TS) / 4 / 2);
  });

  it("adds the corner triangle for notes, in the region's first cell only", () => {
    const entry = frame({ cursor: { x: 0, y: 0, visible: true } });
    const notes = frame({ cursor: { x: 0, y: 0, visible: true }, pencilMode: true });
    const seen = new Set(entry.map((o) => JSON.stringify(o.points)));
    const added = notes.filter((o) => !seen.has(JSON.stringify(o.points)));
    expect(added.length).toBeGreaterThan(0);
    let first = -1;
    for (let c = 0; c < wh && first < 0; c++)
      if (M[TE * wh + c] === selected || M[BE * wh + c] === selected) first = c;
    for (const o of added) expect(cellOf(centroid(o.points))).toBe(first);
  });

  it("draws no band once the highlight is put away", () => {
    expect(frame({ cursor: { x: 0, y: 0, visible: false } })).toEqual([]);
  });
});
