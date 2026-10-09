/**
 * Behavioral tests for the Unequal port (tier 1 + tier 2.5).
 */

import { describe, expect, it } from "vitest";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
  validateDesc,
} from "../../engine/desc-error.ts";
import { cappedSolveFor, lowestSolvingCap } from "../../engine/difficulty.ts";
import { Midend } from "../../engine/index.ts";
import { paramsError } from "../../engine/params.ts";
import { LEFT_BUTTON } from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { describeAbsentTiers } from "../../engine/testing/absent-tiers.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import {
  DEFAULT_BACKGROUND,
  renderScenario,
} from "../../engine/testing/render-scenario.ts";
import { BoxRaster } from "../../engine/testing/repaint-differential.ts";
import { newUnequalDesc } from "./generator.ts";
import { unequalGame } from "./index.ts";
import { computeSize, coord, PREFERRED_TILE_SIZE } from "./render.ts";
import { DIFF_IMPOSSIBLE, solveUnequal } from "./solver.ts";
import {
  checkComplete,
  cloneState,
  decodeParams,
  diffToLevel,
  encodeParams,
  type Mode,
  newState,
  newUi,
  type UnequalParams,
  type UnequalState,
} from "./state.ts";

function gen(
  order: number,
  mode: Mode,
  diff: UnequalParams["diff"],
  seed: string,
): { p: UnequalParams; desc: string; aux: string; st: UnequalState } {
  const p: UnequalParams = { order, mode, diff };
  const { desc, aux } = newUnequalDesc(p, randomNew(seed));
  return { p, desc, aux, st: newState(p, desc) };
}

/** The lowest tier whose deductions solve a board, by the game's own contract. */
function lowestCap(p: UnequalParams, desc: string): number | null {
  const { difficulty } = unequalGame;
  if (!difficulty) throw new Error("unequal: expected a difficulty contract");
  return lowestSolvingCap(cappedSolveFor(difficulty, p, desc), 5);
}

/** The unique solution of a board, derived from its givens only. */
function solveBoard(st: UnequalState): Uint8Array {
  const soln = Uint8Array.from(st.immutable);
  const ret = solveUnequal(st.order, st.mode, st.clueFlags, soln, 4);
  expect(ret).not.toBe(DIFF_IMPOSSIBLE);
  return soln;
}

// --- params + codec --------------------------------------------------------

describe("unequal params", () => {
  it("round-trips both modes", () => {
    const u: UnequalParams = { order: 6, mode: "unequal", diff: "extreme" };
    expect(encodeParams(u, true)).toBe("6dx");
    expect(encodeParams(u, false)).toBe("6");
    expect(decodeParams("6dx")).toEqual(u);

    const a: UnequalParams = { order: 5, mode: "adjacent", diff: "tricky" };
    expect(encodeParams(a, true)).toBe("5adk");
    expect(encodeParams(a, false)).toBe("5a");
    expect(decodeParams("5adk")).toEqual(a);
  });

  it("reads a difficulty letter it does not know as the default tier", () => {
    const p = decodeParams("5dz");
    expect(p).toEqual({
      order: 5,
      mode: "unequal",
      diff: unequalGame.defaultParams().diff,
    });
    expect(paramsError(unequalGame, p, true)).toBeNull();
  });

  it("rejects invalid params, naming the dialog's Size field", () => {
    expect(
      paramsError(unequalGame, { order: 2, mode: "unequal", diff: "easy" }, true),
    ).toBe("Size must be at least 3.");
    expect(
      paramsError(unequalGame, { order: 33, mode: "unequal", diff: "easy" }, true),
    ).toBe("Size must be at most 31.");
    // Adjacent below order 5 at Tricky+ is invalid.
    expect(
      paramsError(unequalGame, { order: 4, mode: "adjacent", diff: "tricky" }, true),
    ).toBe("Size must be at least 5 for Adjacent puzzles of this difficulty.");
    expect(
      paramsError(unequalGame, { order: 5, mode: "adjacent", diff: "tricky" }, true),
    ).toBeNull();
  });
});

describe("unequal desc codec", () => {
  it("round-trips through generate and decode", () => {
    const { p, desc, st } = gen(5, "unequal", "tricky", "codec-1");
    expect(validateDesc(unequalGame, p, desc)).toBeNull();
    // Every given appears in both immutable and grid; non-givens empty.
    for (let i = 0; i < st.order * st.order; i++) {
      if (st.immutable[i]) expect(st.grid[i]).toBe(st.immutable[i]);
      else {
        expect(st.grid[i]).toBe(0);
        expect(st.pencil[i]).toBe(0);
      }
    }
  });

  it("rejects malformed descriptions", () => {
    const p: UnequalParams = { order: 4, mode: "unequal", diff: "easy" };
    const zeros = "0,".repeat(15);
    expect(validateDesc(unequalGame, p, "0,0,0")).toBe(DESC_TOO_SHORT); // too few cells
    // A flag pointing off the grid (top-left cell with an UP clue).
    expect(validateDesc(unequalGame, p, `0U,${zeros}`)).toBe(DESC_OUT_OF_RANGE);
    expect(validateDesc(unequalGame, p, `5,${zeros}`)).toBe(DESC_OUT_OF_RANGE);
    // Forms the generator never writes: a cell without its comma, a letter
    // twice or out of order, a skip letter, text after the board.
    expect(validateDesc(unequalGame, p, `0,${zeros.slice(0, -1)}`)).toBe(
      DESC_TOO_SHORT,
    );
    expect(validateDesc(unequalGame, p, `0DD,${zeros}`)).toBe(descBadCharacter("D"));
    expect(validateDesc(unequalGame, p, `0LR,${zeros}`)).toBe(descBadCharacter("R"));
    expect(validateDesc(unequalGame, p, `a${zeros}`)).toBe(descBadCharacter("a"));
    expect(validateDesc(unequalGame, p, `0,${zeros},`)).toBe(DESC_TOO_LONG);
  });
});

// --- generator -------------------------------------------------------------

describe("unequal generator", () => {
  it.each([
    [5, "unequal", "tricky"],
    [5, "adjacent", "tricky"],
    [6, "unequal", "extreme"],
  ] as const)("generates an exactly-graded board: %s %s %s", (order, mode, diff) => {
    const { p, desc, st } = gen(order, mode, diff, `g-${order}-${mode}-${diff}`);
    expect(validateDesc(unequalGame, p, desc)).toBeNull();
    const want = diffToLevel(diff);
    const soln = Uint8Array.from(st.immutable);
    expect(solveUnequal(order, mode, st.clueFlags, soln, want)).toBe(want);
    expect(lowestCap(p, desc)).toBe(want);
  });

  // The cells where a board of the tier is rare: most deals take more than
  // fifty tries, which is where the generator used to hand back the tier below.
  it.each([
    [3, "unequal", "extreme"],
    [4, "unequal", "tricky"],
    [5, "adjacent", "extreme"],
    [6, "adjacent", "extreme"],
  ] as const)("deals a rare tier at its tier: %s %s %s", (order, mode, diff) => {
    for (let seed = 0; seed < 4; seed++) {
      const { p, desc } = gen(order, mode, diff, `rare-${order}-${mode}-${seed}`);
      expect(lowestCap(p, desc), `seed ${seed}`).toBe(diffToLevel(diff));
    }
  });
});

describe("a 3x3's tiers", () => {
  it("are refused by name, and the tier between them deals", () => {
    const refusal = (diff: UnequalParams["diff"]) =>
      paramsError(unequalGame, { order: 3, mode: "unequal", diff }, true);
    expect(refusal("tricky")).toBe("No 3x3 puzzle is Tricky.");
    expect(refusal("recursive")).toBe("No 3x3 puzzle is Unreasonable.");
    // Dealt in "deals a rare tier" above.
    expect(refusal("extreme")).toBeNull();
  });

  describeAbsentTiers(unequalGame, ["3dk", "3dr"]);
});

// --- moves -----------------------------------------------------------------

describe("unequal moves", () => {
  it("enters and pencil-toggles numbers", () => {
    const { st } = gen(5, "unequal", "easy", "moves-1");
    const i = [...st.immutable].indexOf(0);
    const x = i % st.order;
    const y = (i / st.order) | 0;

    const after = unequalGame.executeMove(st, {
      type: "set",
      x,
      y,
      n: 3,
      pencil: false,
    });
    expect(after.grid[i]).toBe(3);

    const pen = unequalGame.executeMove(st, { type: "set", x, y, n: 2, pencil: true });
    expect(pen.pencil[i] & (1 << 2)).toBeTruthy();
    const pen2 = unequalGame.executeMove(pen, {
      type: "set",
      x,
      y,
      n: 2,
      pencil: true,
    });
    expect(pen2.pencil[i] & (1 << 2)).toBeFalsy();
  });

  it("auto-pencil strikes the placed number from its row and column", () => {
    const { st } = gen(5, "unequal", "easy", "moves-auto");
    const o = st.order;
    // Pencil-fill the board, then place a number with autoElim.
    const all = unequalGame.executeMove(st, { type: "pencilAll" });
    const i = [...all.immutable].indexOf(0);
    const x = i % o;
    const y = (i / o) | 0;
    const after = unequalGame.executeMove(all, {
      type: "set",
      x,
      y,
      n: 3,
      pencil: false,
      autoElim: true,
    });
    let checked = 0;
    for (let k = 0; k < o; k++) {
      if (k !== x) {
        expect(after.pencil[y * o + k] & (1 << 3)).toBeFalsy();
        checked++;
      }
      if (k !== y) {
        expect(after.pencil[k * o + x] & (1 << 3)).toBeFalsy();
        checked++;
      }
    }
    expect(checked).toBe(2 * (o - 1));
  });

  it("toggles a clue's spent flag", () => {
    const { st } = gen(5, "unequal", "tricky", "moves-spent");
    // Find a cell with a RIGHT clue.
    let idx = -1;
    for (let i = 0; i < st.order * st.order; i++)
      if (st.clueFlags[i] & 4) {
        idx = i;
        break;
      }
    expect(idx).toBeGreaterThanOrEqual(0);
    const x = idx % st.order;
    const y = (idx / st.order) | 0;
    const after = unequalGame.executeMove(st, { type: "spent", x, y, flag: 2048 });
    expect(after.spent[idx] & 2048).toBeTruthy();
    const back = unequalGame.executeMove(after, { type: "spent", x, y, flag: 2048 });
    expect(back.spent[idx] & 2048).toBeFalsy();
  });

  it("completes when the final correct number is placed", () => {
    const { st } = gen(5, "unequal", "easy", "complete-1");
    const o = st.order;
    const soln = solveBoard(st);
    let cur = cloneState(st);
    // Fill every empty cell with the solution; the last one completes.
    const empties: number[] = [];
    for (let i = 0; i < o * o; i++) if (!st.immutable[i]) empties.push(i);
    empties.forEach((i, k) => {
      cur = unequalGame.executeMove(cur, {
        type: "set",
        x: i % o,
        y: (i / o) | 0,
        n: soln[i],
        pencil: false,
      });
      if (k < empties.length - 1) expect(unequalGame.status(cur)).toBe("ongoing");
    });
    expect(unequalGame.status(cur)).toBe("solved");
    expect(checkComplete(cur)).toBe(1);
  });
});

// --- findMistakes ----------------------------------------------------------

describe("unequal findMistakes", () => {
  it("flags a wrong number, a note-mistake, and ignores ordinary notes", () => {
    const { st } = gen(5, "unequal", "tricky", "mistake-1");
    const o = st.order;
    const soln = solveBoard(st);
    const empties: number[] = [];
    for (let i = 0; i < o * o; i++) if (!st.immutable[i]) empties.push(i);
    const wrongAt = empties[0];
    const noteAt = empties[1];

    const s = cloneState(st);
    // A wrong number (one off the solution, kept in 1..o).
    s.grid[wrongAt] = soln[wrongAt] === o ? 1 : soln[wrongAt] + 1;
    // A note set that has crossed out the solution value (mistake).
    s.pencil[noteAt] = ((1 << (o + 1)) - (1 << 1)) & ~(1 << soln[noteAt]);
    // An ordinary note (still contains the solution value) elsewhere — not flagged.
    if (empties[2] !== undefined) s.pencil[empties[2]] = 1 << soln[empties[2]];

    const m = unequalGame.findMistakes?.(s) ?? [];
    const has = (x: number, y: number, kind: string) =>
      m.some((e) => e.x === x && e.y === y && e.kind === kind);
    expect(has(wrongAt % o, (wrongAt / o) | 0, "cell")).toBe(true);
    expect(has(noteAt % o, (noteAt / o) | 0, "note")).toBe(true);
    if (empties[2] !== undefined)
      expect(has(empties[2] % o, (empties[2] / o) | 0, "note")).toBe(false);
  });
});

// --- Solve via a real Midend ----------------------------------------------

describe("unequal Solve via Midend", () => {
  it("solves a freshly generated board (aux path)", () => {
    const me = new Midend(unequalGame);
    expect(me.newGameFromId("5dk#unequal-solve")).toBeNull();
    expect(me.solve()).toBeNull();
    const solved = (me as unknown as { state: UnequalState }).state;
    expect(unequalGame.status(solved)).toBe("solved");
  });

  it("save round-trips a played board", () => {
    const me = new Midend(unequalGame);
    expect(me.newGameFromId("5de#unequal-save")).toBeNull();
    const st = (me as unknown as { state: UnequalState }).state;
    const i = [...st.immutable].indexOf(0);
    me.playMoves([
      { type: "set", x: i % st.order, y: (i / st.order) | 0, n: 1, pencil: false },
    ]);
    const saved = me.saveGame();
    const me2 = new Midend(unequalGame);
    expect(me2.loadGame(saved)).toBeNull();
    expect((me2 as unknown as { state: UnequalState }).state.grid[i]).toBe(1);
  });
});

// --- interpretMove ---------------------------------------------------------

describe("unequal interpretMove", () => {
  const ts = PREFERRED_TILE_SIZE;
  const center = (cx: number, cy: number) => ({
    x: coord(cx, ts) + Math.floor(ts / 2),
    y: coord(cy, ts) + Math.floor(ts / 2),
  });

  it("rejects digit entry into an immutable cell", () => {
    const { st } = gen(5, "unequal", "easy", "im-1");
    const ui = newUi(st);
    const i = [...st.immutable].findIndex((v) => v !== 0);
    const x = i % st.order;
    const y = (i / st.order) | 0;
    // Select the immutable cell (highlight is suppressed for givens).
    unequalGame.interpretMove?.(
      st,
      ui,
      preferredDrawState(unequalGame, st),
      center(x, y),
      LEFT_BUTTON,
    );
    ui.cursor.visible = true;
    ui.cursor.x = x;
    ui.cursor.y = y;
    const move = unequalGame.interpretMove?.(
      st,
      ui,
      preferredDrawState(unequalGame, st),
      { x: 0, y: 0 },
      49,
    ); // '1'
    expect(move).toBeNull();
  });

  it("maps 'M' to a fill-all-pencil-marks move", () => {
    const { st } = gen(5, "unequal", "easy", "mk-1");
    const ui = newUi(st);
    const move = unequalGame.interpretMove?.(
      st,
      ui,
      preferredDrawState(unequalGame, st),
      { x: 0, y: 0 },
      109,
    ); // 'm'
    expect(move).toEqual({ type: "pencilAll" });
  });
});

// --- tier 2.5: render scenarios --------------------------------------------

describe("unequal render", () => {
  it("draws greater-than chevrons in Unequal mode", () => {
    const { desc } = gen(5, "unequal", "tricky", "render-u");
    const r = renderScenario({ game: unequalGame, id: `5dk:${desc}` });
    // The chevrons are filled polygons; some clue must be present.
    const polys = r.recording.ops.filter((o) => o.op === "polygon");
    expect(polys.length).toBeGreaterThan(0);
    expect(r.recording.ops).toMatchSnapshot();
  });

  it("draws adjacency bars in Adjacent mode", () => {
    const { desc } = gen(5, "adjacent", "tricky", "render-a");
    const r = renderScenario({ game: unequalGame, id: `5adk:${desc}` });
    // Adjacency bars are filled rects in the gaps; the board has many of them.
    const rects = r.recording.ops.filter((o) => o.op === "rect");
    expect(rects.length).toBeGreaterThan(0);
    expect(r.recording.ops).toMatchSnapshot();
  });

  it("renders pencil marks on a partially-filled board", () => {
    const { desc, st } = gen(5, "unequal", "easy", "render-p");
    const size = computeSize({ order: st.order }, PREFERRED_TILE_SIZE);
    expect(size.w).toBeGreaterThan(0);
    const r = renderScenario({
      game: unequalGame,
      id: `5de:${desc}`,
      moves: [{ type: "pencilAll" }],
    });
    const texts = r.recording.ops.filter((o) => o.op === "text");
    expect(texts.length).toBeGreaterThan(0);
  });

  // A tile's outline stays on the tile's own pixels: the gap beside it is
  // painted only on the first frame, so a stroke there outlives the tile.
  it("a repainted tile leaves the canvas a fresh paint would show", () => {
    // (2, 0) has no clue to its right, so nothing else paints that gap; moving
    // the cursor onto it from below repaints it alone.
    const st = newState(decodeParams("4de"), "0,0,0L,0L,0,0,0,0U,0,0,0L,0D,0,0,0,0,");
    const palette = unequalGame.colors(DEFAULT_BACKGROUND);
    const size = computeSize({ order: st.order }, PREFERRED_TILE_SIZE);
    const at = (y: number) => ({ ...newUi(st), cursor: { x: 2, y, visible: true } });
    const frame = (ds: ReturnType<typeof unequalGame.newDrawState>, y: number) => {
      const dr = new RecordingDrawing(palette);
      unequalGame.redraw(dr, ds, null, st, 1, at(y), 0, 0);
      return dr.ops;
    };

    const warmDs = unequalGame.newDrawState(st, PREFERRED_TILE_SIZE);
    const warm = new BoxRaster(size.w, size.h);
    warm.apply(frame(warmDs, 1));
    warm.apply(frame(warmDs, 0));
    const fresh = new BoxRaster(size.w, size.h);
    fresh.apply(frame(unequalGame.newDrawState(st, PREFERRED_TILE_SIZE), 0));

    const differing = warm.px.filter((v, i) => v !== fresh.px[i]).length;
    expect(differing).toBe(0);
  });
});

describe("on-screen keys (requestKeys)", () => {
  const keysFor = (order: number) =>
    unequalGame.requestKeys?.({ ...unequalGame.defaultParams(), order });

  // The Marks key is the engine's, appended to every note-taking game's keypad
  // (`Midend.requestKeys`); a game lists only what is its own.
  it("offers '1'..order plus clear for order < 10", () => {
    expect(keysFor(4)).toEqual([
      ..."1234".split("").map((d) => ({ button: d.charCodeAt(0), label: d })),
      { button: 8, label: "Clear" },
    ]);
  });

  it("switches to a '0'-based keypad for order ≥ 10 (faithful to c2n)", () => {
    // order 10: '0'..'9' = values 1..10, then clear.
    expect(keysFor(10)).toEqual([
      ..."0123456789".split("").map((d) => ({ button: d.charCodeAt(0), label: d })),
      { button: 8, label: "Clear" },
    ]);
    // order 11: '0'..'9' then 'a' (value 11), then clear.
    expect(keysFor(11)).toEqual([
      ..."0123456789a".split("").map((c) => ({ button: c.charCodeAt(0), label: c })),
      { button: 8, label: "Clear" },
    ]);
  });
});
