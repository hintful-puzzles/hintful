/**
 * Filling (Fillomino) behavioral tests.
 *
 * Tier 1 (pure logic): params/desc codec, generator solvability + uniqueness,
 * solver, completion, selection moves, findMistakes. Tier 2.5: a render
 * scenario with targeted op assertions + a snapshot. See
 * docs/games/testing.md § "The test tiers".
 */
import { describe, expect, it } from "vitest";
import {
  DESC_OUT_OF_RANGE,
  DESC_TOO_LONG,
  DESC_TOO_SHORT,
  descBadCharacter,
  validateDesc,
} from "../../engine/desc-error.ts";
import { Midend } from "../../engine/index.ts";
import { paramsError } from "../../engine/params.ts";
import { LEFT_BUTTON, LEFT_DRAG } from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { preferredDrawState } from "../../engine/testing/preferred-draw-state.ts";
import { renderScenario } from "../../engine/testing/render-scenario.ts";
import { newFillingDesc } from "./generator.ts";
import { fillingGame } from "./index.ts";
import { COL_CELL, COL_CORRECT, COL_ERROR, COL_GIVEN, COL_INK } from "./render.ts";
import { solveFilling } from "./solver.ts";
import {
  decodeParams,
  encodeParams,
  executeMove,
  type FillingParams,
  type FillingState,
  isComplete,
  makeRegionDsf,
  newState,
} from "./state.ts";

const PRESETS: FillingParams[] = [
  { w: 9, h: 7 },
  { w: 13, h: 9 },
  { w: 17, h: 13 },
];

/** Every region's size equals its number, and nothing is empty. */
function isFullSolution(board: ArrayLike<number>, w: number, h: number): boolean {
  const dsf = makeRegionDsf(board, w, h);
  for (let i = 0; i < w * h; i++) {
    if (board[i] === 0 || board[i] !== dsf.size(i)) return false;
  }
  return true;
}

describe("filling params", () => {
  it("round-trips encode/decode", () => {
    expect(encodeParams({ w: 13, h: 9 }, false)).toBe("13x9");
    expect(decodeParams("13x9")).toEqual({ w: 13, h: 9 });
  });

  it("decodes a bare dimension as a square", () => {
    expect(decodeParams("9")).toEqual({ w: 9, h: 9 });
  });

  it("rejects degenerate params", () => {
    expect(paramsError(fillingGame, { w: 0, h: 5 }, true)).toBe(
      "Width must be at least 1.",
    );
    expect(paramsError(fillingGame, { w: 5, h: 0 }, true)).toBe(
      "Height must be at least 1.",
    );
    expect(paramsError(fillingGame, { w: 9, h: 7 }, true)).toBeNull();
  });
});

describe("filling desc codec", () => {
  it("decodes a run-length desc to clues + an editable board", () => {
    // 3x1 board: clue 1, empty, clue 2  →  "1a2"
    const st = newState({ w: 3, h: 1 }, "1a2");
    expect([...st.clues]).toEqual([1, 0, 2]);
    expect([...st.board]).toEqual([1, 0, 2]);
  });

  it("rejects a desc whose area does not fill the grid", () => {
    expect(validateDesc(fillingGame, { w: 3, h: 1 }, "11")).toBe(DESC_TOO_SHORT);
    expect(validateDesc(fillingGame, { w: 3, h: 1 }, "1111")).toBe(DESC_TOO_LONG);
    expect(validateDesc(fillingGame, { w: 3, h: 1 }, "1a2")).toBeNull();
  });

  it("rejects invalid characters and clues too large for the board", () => {
    expect(validateDesc(fillingGame, { w: 3, h: 1 }, "1@2")).toBe(
      descBadCharacter("@"),
    );
    expect(validateDesc(fillingGame, { w: 3, h: 1 }, "14a")).toBe(DESC_OUT_OF_RANGE);
  });

  it("refuses a 0 clue, which would spell a blank a second way", () => {
    expect(validateDesc(fillingGame, { w: 3, h: 1 }, "1a0")).toBe(DESC_OUT_OF_RANGE);
  });
});

describe("filling generator + solver", () => {
  for (const p of PRESETS) {
    // Heavy but seed-deterministic: the retry-until-unique generator + solver
    // does fixed work per fixed seed (the 17×13 worst case is ~1.2s solo).
    // Nothing here is clock-gated: a regression surfaces as a wrong verdict
    // below, never as slowness. (See repo-layout test-determinism spec.)
    it(`generates uniquely solvable ${p.w}x${p.h} boards`, () => {
      for (let seed = 0; seed < 4; seed++) {
        const { desc } = newFillingDesc(p, randomNew(`filling-${p.w}x${p.h}-${seed}`));
        expect(validateDesc(fillingGame, p, desc)).toBeNull();
        const st = newState(p, desc);
        const { solved, board } = solveFilling(st.clues, p.w, p.h);
        expect(solved).toBe(true);
        expect(isFullSolution(board, p.w, p.h)).toBe(true);
      }
    });
  }

  it("the solver fills a hand-made deducible board", () => {
    // A 1 forced in the corner, the rest a 2-domino.
    const st = newState({ w: 3, h: 1 }, "1a2");
    const { solved, board } = solveFilling(st.clues, 3, 1);
    expect(solved).toBe(true);
    expect([...board]).toEqual([1, 2, 2]);
  });
});

describe("filling completion", () => {
  it("recognizes a full correct grid", () => {
    expect(isComplete([1, 2, 2], 3, 1)).toBe(true);
    expect(isComplete([1, 2, 0], 3, 1)).toBe(false); // empty cell
    expect(isComplete([1, 1, 2], 3, 1)).toBe(false); // wrong region size
  });

  it("marks the state solved when the last cell completes it", () => {
    const st = newState({ w: 3, h: 1 }, "1a2");
    const done = executeMove(st, { type: "set", cells: [1], value: 2 });
    expect(fillingGame.status(st)).toBe("ongoing");
    expect(fillingGame.status(done)).toBe("solved");
    expect([...done.board]).toEqual([1, 2, 2]);
  });
});

describe("filling moves + selection", () => {
  it("fills every selected cell with one digit", () => {
    const st = newState({ w: 3, h: 1 }, "aaa"); // all empty
    const ui = fillingGame.newUi(st);
    const ds = fillingGame.newDrawState(st, fillingGame.preferredTileSize ?? 32);
    // Select cells 1 and 2 with left-click + drag.
    const ts = fillingGame.preferredTileSize ?? 32;
    const cx = (i: number) => Math.floor(ts / 2) + i * ts + Math.floor(ts / 2);
    fillingGame.interpretMove(st, ui, ds, { x: cx(1), y: cx(0) }, LEFT_BUTTON);
    fillingGame.interpretMove(st, ui, ds, { x: cx(2), y: cx(0) }, LEFT_DRAG);
    expect(ui.sel && [...ui.sel].sort()).toEqual([1, 2]);
    const move = fillingGame.interpretMove(st, ui, ds, { x: 0, y: 0 }, 0x32 /* '2' */);
    expect(move).toEqual({ type: "set", cells: [1, 2], value: 2 });
  });

  it("rejects a digit larger than the grid permits", () => {
    const st = newState({ w: 3, h: 1 }, "aaa");
    const ui = fillingGame.newUi(st);
    ui.sel = new Set([0]);
    // max(w,h) = 3, so '4' is rejected.
    const move = fillingGame.interpretMove(
      st,
      ui,
      preferredDrawState(fillingGame, st),
      { x: 0, y: 0 },
      0x34 /* '4' */,
    );
    expect(move).toBeNull();
  });
});

describe("filling findMistakes", () => {
  function generated(): { st: FillingState; p: FillingParams } {
    const p = { w: 9, h: 7 };
    const { desc } = newFillingDesc(p, randomNew("filling-mistake-seed"));
    return { st: newState(p, desc), p };
  }

  it("flags a player cell that contradicts the unique solution", () => {
    const { st, p } = generated();
    const solution = solveFilling(st.clues, p.w, p.h).board;
    // Find a non-clue cell and fill it with a deliberately wrong value.
    let target = -1;
    for (let i = 0; i < p.w * p.h; i++) {
      if (st.clues[i] === 0) {
        target = i;
        break;
      }
    }
    expect(target).toBeGreaterThanOrEqual(0);
    const wrongValue = solution[target] === 1 ? 2 : 1;
    const dirty = executeMove(st, { type: "set", cells: [target], value: wrongValue });
    const mistakes = fillingGame.findMistakes?.(dirty) ?? [];
    expect(mistakes).toContainEqual({ x: target % p.w, y: (target / p.w) | 0 });

    // Correcting the cell clears the mistake.
    const fixed = executeMove(dirty, {
      type: "set",
      cells: [target],
      value: solution[target],
    });
    const after = fillingGame.findMistakes?.(fixed) ?? [];
    expect(after).toHaveLength(0);
  });

  it("reports no mistakes on a freshly generated board", () => {
    const { st } = generated();
    expect(fillingGame.findMistakes?.(st) ?? []).toHaveLength(0);
  });
});

describe("filling Midend integration", () => {
  it("solves a generated board to completion", () => {
    const me = new Midend(fillingGame);
    expect(me.newGameFromId("9x7#filling-seed-1")).toBeNull();
    expect(me.solve()).toBeNull();
    const text = me.formatAsText() ?? "";
    expect(text).not.toContain("   |"); // every cell filled
  });

  it("round-trips a save with progress", () => {
    const me = new Midend(fillingGame);
    expect(me.newGameFromId("9x7#filling-seed-2")).toBeNull();
    me.solve();
    const saved = me.saveGame();
    const me2 = new Midend(fillingGame);
    expect(me2.loadGame(saved)).toBeNull();
    expect(me2.formatAsText()).toBe(me.formatAsText());
  });
});

describe("filling render scenario", () => {
  it("draws the grid frame and clue digits on the initial frame", () => {
    const { recording } = renderScenario({
      game: fillingGame,
      id: "9x7#filling-seed-3",
    });
    expect(recording.ops.some((o) => o.op === "rect" && o.color === COL_INK)).toBe(
      true,
    );
    expect(recording.ops.some((o) => o.op === "text")).toBe(true);
    // A clue is told by the cell under it: every clue's cell is lifted or in
    // a completed region's shade, and every empty cell is the plain surface.
    const rects = (color: number) =>
      recording.ops.filter((o) => o.op === "rect" && o.color === color).length;
    const clues = recording.ops.filter((o) => o.op === "text").length;
    expect(rects(COL_GIVEN)).toBeGreaterThan(0);
    expect(rects(COL_GIVEN) + rects(COL_CORRECT)).toBe(clues);
    expect(rects(COL_CELL)).toBe(9 * 7 - clues);
    expect(recording.ops).toMatchSnapshot();
  });

  it("frames the board as heavily as it borders two regions, and no heavier", () => {
    const { recording, size } = renderScenario({ game: fillingGame, id: "2x1:12" });
    // The ink along one row of pixels through both cells: the frame's left
    // side, the border between the two regions, the frame's right side.
    const y = size.h >> 1;
    const row = new Int32Array(size.w).fill(-1);
    for (const o of recording.ops) {
      if (o.op !== "rect" || y < o.y || y >= o.y + o.h) continue;
      row.fill(o.color, Math.max(0, o.x), Math.min(size.w, o.x + o.w));
    }
    const runs: number[] = [];
    for (let x = 0; x < size.w; x++) {
      if (row[x] !== COL_INK) continue;
      if (x > 0 && row[x - 1] === COL_INK) runs[runs.length - 1]++;
      else runs.push(1);
    }
    expect(runs).toHaveLength(3);
    expect(new Set(runs).size).toBe(1);
  });

  it("shades a completed region and an overfull region", () => {
    // 3x1, all clues: "1 2 2" is complete (CORRECT_BG); "2 2 2" is overfull.
    const correct = renderScenario({ game: fillingGame, id: "3x1:122" });
    expect(
      correct.recording.ops.some((o) => o.op === "rect" && o.color === COL_CORRECT),
    ).toBe(true);

    const overfull = renderScenario({ game: fillingGame, id: "3x1:222" });
    expect(
      overfull.recording.ops.some((o) => o.op === "rect" && o.color === COL_ERROR),
    ).toBe(true);
  });
});

describe("on-screen keys (requestKeys)", () => {
  it("offers a fixed digits 1..9 plus clear", () => {
    expect(fillingGame.requestKeys?.(fillingGame.defaultParams())).toEqual([
      ..."123456789".split("").map((d) => ({ button: d.charCodeAt(0), label: d })),
      { button: 8, label: "Clear" },
    ]);
  });
});
