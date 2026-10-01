import { describe, expect, it } from "vitest";
import { presetMenu } from "../../engine/param-label.ts";
import { paramsError } from "../../engine/params.ts";
import { LEFT_BUTTON, newCursor, RIGHT_BUTTON } from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import type { Point } from "../../engine/types.ts";
import { type RangeMistake, rangeGame } from "./index.ts";
import {
  BLACK,
  decodeParams,
  EMPTY,
  encodeDesc,
  encodeParams,
  idx,
  newState,
  type RangeMove,
  type RangeParams,
  type RangeState,
  type RangeUi,
  validateDesc,
  WHITE,
} from "./state.ts";

const TS = 32;
const BORDER = 16;

function cellPoint(r: number, c: number): Point {
  return { x: BORDER + TS * c + TS / 2, y: BORDER + TS * r + TS / 2 };
}

function makeState(w: number, h: number, grid: number[]): RangeState {
  return { w, h, grid: Int8Array.from(grid) };
}

const ds = { tileSize: TS } as never;

describe("params", () => {
  it("round-trips presets and the bare-width form", () => {
    expect(encodeParams({ w: 13, h: 9 }, true)).toBe("13x9");
    expect(decodeParams("13x9")).toEqual({ w: 13, h: 9 });
    expect(decodeParams("12")).toEqual({ w: 12, h: 12 });
  });

  it("rejects degenerate and non-positive sizes when full", () => {
    const error = (p: RangeParams, full: boolean) => paramsError(rangeGame, p, full);
    expect(error({ w: 2, h: 2 }, true)).not.toBeNull();
    expect(error({ w: 1, h: 2 }, true)).not.toBeNull();
    expect(error({ w: 0, h: 5 }, true)).toBe("Width must be at least 1");
    // 2x2 is allowed when not generating a full puzzle.
    expect(error({ w: 2, h: 2 }, false)).toBeNull();
    expect(error({ w: 9, h: 6 }, true)).toBeNull();
  });

  it("titles a preset by its size alone", () => {
    expect(presetMenu(rangeGame).submenu?.[0]?.title).toBe("6x9");
  });
});

describe("desc codec", () => {
  it("round-trips a hand-built clue grid", () => {
    // 3x3 with clues 2 (top-left) and 5 (center), rest blank.
    const grid = [2, 0, 0, 0, 5, 0, 0, 0, 0];
    const desc = encodeDesc(9, Int8Array.from(grid));
    const p = { w: 3, h: 3 };
    expect(validateDesc(p, desc)).toBeNull();
    const st = newState(p, desc);
    expect(Array.from(st.grid)).toEqual(grid);
    expect(encodeDesc(9, st.grid)).toBe(desc);
  });

  it("rejects malformed or wrong-length descs", () => {
    const p = { w: 3, h: 3 };
    expect(validateDesc(p, "i")).toBeNull(); // 9 blanks exactly
    expect(validateDesc(p, "h")).not.toBeNull(); // 8 cells — too few
    expect(validateDesc(p, "j")).not.toBeNull(); // 10 cells — too many
    expect(validateDesc(p, "2!2")).not.toBeNull(); // invalid char
    expect(validateDesc(p, "99i")).not.toBeNull(); // clue > w+h-1 (=5)
  });

  it("refuses what encodeDesc never writes", () => {
    const p = { w: 3, h: 3 };
    expect(validateDesc(p, "2c5d")).toBeNull();
    // Text after the grid, including after a comma.
    expect(validateDesc(p, "2c5d,x")).toMatch(/too long/);
    // A `_` anywhere but between two adjacent clues.
    expect(validateDesc(p, "_2c5d")).toMatch(/"_"/);
    expect(validateDesc(p, "2_c5d")).toMatch(/"c"/);
    expect(validateDesc(p, "2c_5d")).toMatch(/"_"/);
    expect(validateDesc(p, "2_5g")).toBeNull();
    expect(validateDesc(p, "25g")).toMatch(/out of range/);
    expect(validateDesc(p, "0h")).toMatch(/out of range/);
    // A run overshooting the grid partway through.
    expect(validateDesc(p, "j2")).toMatch(/too long/);
  });
});

describe("interpretMove cycling", () => {
  it("left-button cycles empty -> black -> white -> empty", () => {
    let st = makeState(3, 1, [0, 0, 0]);
    const ui: RangeUi = { cursor: newCursor() };
    for (const expected of [BLACK, WHITE, EMPTY]) {
      const mv = rangeGame.interpretMove(st, ui, ds, cellPoint(0, 0), LEFT_BUTTON);
      st = rangeGame.executeMove(st, mv as RangeMove);
      expect(st.grid[idx(0, 0, 3)]).toBe(expected);
    }
  });

  it("right-button cycles empty -> white -> black -> empty", () => {
    let st = makeState(3, 1, [0, 0, 0]);
    const ui: RangeUi = { cursor: newCursor() };
    for (const expected of [WHITE, BLACK, EMPTY]) {
      const mv = rangeGame.interpretMove(st, ui, ds, cellPoint(0, 0), RIGHT_BUTTON);
      st = rangeGame.executeMove(st, mv as RangeMove);
      expect(st.grid[idx(0, 0, 3)]).toBe(expected);
    }
  });

  it("treats clue cells as inert", () => {
    const st = makeState(3, 1, [2, 0, 0]);
    const ui: RangeUi = { cursor: newCursor() };
    expect(
      rangeGame.interpretMove(st, ui, ds, cellPoint(0, 0), LEFT_BUTTON),
    ).toBeNull();
  });
});

describe("executeMove", () => {
  it("throws on a clue-cell or out-of-bounds target", () => {
    const st = makeState(3, 1, [2, 0, 0]);
    expect(() =>
      rangeGame.executeMove(st, { sets: [{ r: 0, c: 0, value: "black" }] }),
    ).toThrow();
    expect(() =>
      rangeGame.executeMove(st, { sets: [{ r: 9, c: 9, value: "black" }] }),
    ).toThrow();
  });

  it("detects completion via the error-free rule, from the position alone", () => {
    // 1x3: clue 3 in the middle means both ends are white and visible.
    // A single white run of 3 satisfies the clue; no blacks needed.
    const st = makeState(3, 1, [0, 3, 0]);
    // The board as dealt already has the clue's run satisfied (empties
    // count as white), so it is solved before any move.
    expect(rangeGame.status(st)).toBe("solved");
    const after = rangeGame.executeMove(st, { sets: [{ r: 0, c: 0, value: "white" }] });
    expect(rangeGame.status(after)).toBe("solved");
    expect(rangeGame.solvedFlash?.(after, { cursor: newCursor() })).toBeGreaterThan(0);
    // Blacking an end hides the clue's run: no longer solved.
    const broken = rangeGame.executeMove(after, {
      sets: [{ r: 0, c: 2, value: "black" }],
    });
    expect(rangeGame.status(broken)).toBe("ongoing");
  });
});

describe("solve + findMistakes", () => {
  it("solves a generated board and clears all undecided cells", () => {
    const id = "9x6#range-solve";
    const st = makeFromId(id);
    const res = rangeGame.solve?.(st, st);
    expect(res?.ok).toBe(true);
    if (!res?.ok) return;
    const solved = rangeGame.executeMove(st, res.move);
    // every non-clue cell is now decided
    for (const v of solved.grid) expect(v).not.toBe(EMPTY);
    expect(rangeGame.status(solved)).toBe("solved");
  });

  it("flags a wrong black and clears on a consistent board", () => {
    const id = "9x6#range-mistake";
    const st = makeFromId(id);
    const res = rangeGame.solve?.(st, st);
    if (!res?.ok) throw new Error("expected solvable");
    const solved = rangeGame.executeMove(st, res.move);
    // A consistent (fully solved) board has no mistakes.
    expect(rangeGame.findMistakes?.(solved)).toEqual([]);

    // Flip the first solution-black cell to white (a dot) → a mistake.
    const blackCell = solved.grid.indexOf(BLACK);
    const r = Math.floor(blackCell / st.w);
    const c = blackCell % st.w;
    const wrong = rangeGame.executeMove(st, { sets: [{ r, c, value: "white" }] });
    const mistakes = rangeGame.findMistakes?.(wrong) as RangeMistake[];
    expect(mistakes).toContainEqual({ r, c });
  });
});

function makeFromId(id: string): RangeState {
  // Generate a fresh board the same way the midend does, from a seed.
  const hashIdx = id.indexOf("#");
  const params = decodeParams(id.slice(0, hashIdx));
  const seed = id.slice(hashIdx + 1);
  const { desc } = rangeGame.newDesc(params, randomNew(seed));
  return newState(params, desc);
}
