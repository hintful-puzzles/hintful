/**
 * Group behavioral tests (tier 1, pure logic): params codec, generation +
 * unique-solvability at target difficulty, desc round-trip, move transitions
 * (multifill, reorder, divider), completion, and findMistakes. The byte-match
 * differential against the C reference lives in `group-differential.test.ts`.
 */

import { describe, expect, it } from "vitest";
import { validateDesc } from "../../engine/desc-error.ts";
import { cappedSolveFor, lowestSolvingCap } from "../../engine/difficulty.ts";
import { DIFF_AMBIGUOUS, DIFF_IMPOSSIBLE } from "../../engine/latin.ts";
import { paramsError } from "../../engine/params.ts";
import {
  CURSOR_RIGHT,
  LEFT_BUTTON,
  LEFT_DRAG,
  LEFT_RELEASE,
  MOD_SHFT,
} from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { MAX_REGENERATE } from "../../engine/retry-limit.ts";
import {
  describeAbsentTiers,
  describeDealtTiers,
} from "../../engine/testing/absent-tiers.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { newGameDesc } from "./generator.ts";
import { groupGame } from "./index.ts";
import { colors, coord, newDrawState, PREFERRED_TILE_SIZE, redraw } from "./render.ts";
import { solveGroup } from "./solver.ts";
import {
  cloneState,
  DIFF_EXTREME,
  DIFF_HARD,
  DIFF_NAMES,
  DIFF_NORMAL,
  DIFF_UNREASONABLE,
  decodeParams,
  encodeGrid,
  encodeParams,
  type GroupParams,
  type GroupState,
  newState,
  newUi,
  PRESETS,
  retryBudget,
} from "./state.ts";

const P = (w: number, diff: number, id: boolean): GroupParams => ({ w, diff, id });

/** A `Ui` whose cursor shows on the square at display position `pos` in both
 * directions. */
function newUiAt(s: GroupState, pos: number) {
  const ui = newUi(s);
  ui.cursor.x = s.sequence[pos];
  ui.cursor.y = s.sequence[pos];
  ui.cursor.visible = true;
  return ui;
}

/**
 * The optional `Game` hooks Group implements, narrowed once. Asserting them
 * here beats a `!` at each call site (a compile-time claim nothing checks) and
 * beats `?.` (which would silently make the assertion vacuous if a hook were
 * ever dropped): if one goes missing, this fails immediately and says which.
 * None of the three reads `this`, so calling them unbound is safe.
 */
const { solve, solvedFlash, findMistakes, difficulty } = groupGame;
if (!solve || !solvedFlash || !findMistakes || !difficulty) {
  throw new Error(
    "group: expected the solve / solvedFlash / findMistakes / difficulty hooks",
  );
}

/** A completed grid is a valid group table iff Latin + associative. */
function isValidGroupTable(grid: Uint8Array, w: number): boolean {
  // Latin: each element once per row and column.
  for (let y = 0; y < w; y++) {
    const seen = new Set<number>();
    for (let x = 0; x < w; x++) {
      const v = grid[y * w + x];
      if (v < 1 || v > w || seen.has(v)) return false;
      seen.add(v);
    }
  }
  for (let x = 0; x < w; x++) {
    const seen = new Set<number>();
    for (let y = 0; y < w; y++) seen.add(grid[y * w + x]);
    if (seen.size !== w) return false;
  }
  // Associative: (ab)c == a(bc).
  const g = (aa: number, bb: number) => grid[aa * w + bb] - 1; // 0-based product
  for (let i = 0; i < w; i++)
    for (let j = 0; j < w; j++)
      for (let k = 0; k < w; k++) if (g(g(i, j), k) !== g(i, g(j, k))) return false;
  return true;
}

describe("params codec", () => {
  it("round-trips every preset through encode/decode", () => {
    for (const p of PRESETS) {
      const enc = encodeParams(p, true);
      const dec = decodeParams(enc);
      expect(dec.w).toBe(p.w);
      expect(dec.diff).toBe(p.diff);
      expect(dec.id).toBe(p.id);
    }
  });

  it("encodes identity-hidden and difficulty faithfully", () => {
    expect(encodeParams(P(8, DIFF_HARD, false), true)).toBe("8dhi");
    expect(encodeParams(P(6, DIFF_NORMAL, true), true)).toBe("6dn");
    expect(encodeParams(P(6, DIFF_NORMAL, true), false)).toBe("6");
  });

  it("rejects the two impossible identity-hidden combinations", () => {
    const error = (p: GroupParams) => paramsError(groupGame, p, true);
    expect(error(P(3, DIFF_NORMAL, false))).toMatch(/3x3/);
    expect(error(P(6, 0, false))).toBe("Easy puzzles must have an identity.");
    expect(error(P(6, DIFF_NORMAL, false))).toBeNull();
    expect(error(P(2, DIFF_NORMAL, true))).toBe("Grid size must be at least 3.");
  });
});

describe("a size with no board at a tier", () => {
  const refusal = (p: GroupParams) => paramsError(groupGame, p, true);

  /** Every cell from 3x3 to 9x9 whose refusal starts with `words`. */
  const refusedWith = (words: RegExp): GroupParams[] => {
    const cells: GroupParams[] = [];
    for (let w = 3; w <= 9; w++) {
      for (const id of [true, false]) {
        for (let diff = 0; diff < DIFF_NAMES.length; diff++) {
          if (words.test(refusal(P(w, diff, id)) ?? "")) cells.push(P(w, diff, id));
        }
      }
    }
    return cells;
  };
  const absent = refusedWith(/^No /);
  const rare = refusedWith(/too rare/);
  const labels = (cells: GroupParams[]) => cells.map((p) => encodeParams(p, true));

  it("is refused, naming the size and the tier", () => {
    expect(refusal(P(5, DIFF_HARD, true))).toBe(
      "No 5x5 puzzle that shows its identity is Tricky.",
    );
    expect(refusal(P(5, DIFF_EXTREME, false))).toBe("No 5x5 puzzle is Hard.");
    expect(refusal(P(4, DIFF_UNREASONABLE, true))).toBe(
      "No 4x4 puzzle is Unreasonable.",
    );
    expect(labels(absent)).toEqual(
      "3dn 3dh 3dx 3du 4dn 4dh 4dx 4du 4dxi 4dui 5dh 5dx 5dxi".split(" "),
    );
  });

  it("is refused where its boards are too rare to deal", () => {
    expect(refusal(P(6, DIFF_EXTREME, true))).toBe(
      "Hard 6x6 puzzles that show their identity are too rare to deal.",
    );
    expect(labels(rare)).toEqual(["6dx"]);
  });

  it("still loads a rare board that arrives with its desc", () => {
    for (const p of rare) expect(paramsError(groupGame, p, false)).toBeNull();
  });

  // The rare cell is not held to the run-out: none was found in 290,000
  // tries, and that says only that its boards are rarer than the count saw.
  describeAbsentTiers(groupGame, labels(absent));
});

describe("a tier found seldom, with the budget to find it", () => {
  const SELDOM = [P(6, DIFF_HARD, true), P(8, DIFF_EXTREME, true)];

  it("is dealt, and only it is given more tries than the house bound", () => {
    for (const p of SELDOM) expect(paramsError(groupGame, p, true)).toBeNull();
    const raised: string[] = [];
    for (let w = 3; w <= 12; w++) {
      for (const id of [true, false]) {
        for (let diff = 0; diff < DIFF_NAMES.length; diff++) {
          const p = P(w, diff, id);
          if (retryBudget(p) !== MAX_REGENERATE) raised.push(encodeParams(p, true));
        }
      }
    }
    expect(raised).toEqual(SELDOM.map((p) => encodeParams(p, true)));
  });

  // Ten seconds a board on average, so the slow tier's: from these seeds the
  // 6x6 came in a fifth of a second and the 8x8 in thirteen (2026-10-06, six
  // seeds a cell, where the slowest 6x6 took 47 on a loaded machine and none
  // ran out).
  describeDealtTiers(
    groupGame,
    SELDOM.map((p) => encodeParams(p, true)),
    { seldom: true },
  );
});

describe("generation", () => {
  // A small, fast matrix across sizes / difficulties / both identity modes,
  // and every cell that stands beside one `validateParams` refuses.
  const cases: GroupParams[] = [
    P(4, DIFF_NORMAL, false),
    P(4, DIFF_HARD, false),
    P(5, DIFF_HARD, false),
    P(5, DIFF_NORMAL, true),
    P(5, DIFF_UNREASONABLE, true),
    P(6, DIFF_NORMAL, true),
    P(6, DIFF_NORMAL, false),
    P(6, DIFF_HARD, false),
    P(6, DIFF_EXTREME, false),
    P(6, DIFF_UNREASONABLE, true),
    P(7, DIFF_HARD, true),
    P(8, DIFF_HARD, true),
    P(8, DIFF_HARD, false),
  ];

  for (const p of cases) {
    it(`produces a uniquely-solvable board at ${p.w}d${p.diff}${p.id ? "" : "i"}`, () => {
      const rng = randomNew(`group-${p.w}-${p.diff}-${p.id}`);
      const { desc, aux } = newGameDesc(p, rng);

      // Desc validates and round-trips through the codec.
      expect(validateDesc(groupGame, p, desc)).toBeNull();
      const state = newState(p, desc);
      expect(encodeGrid(state.grid, p.w * p.w)).toBe(desc);

      // The board needs the tier it was dealt at.
      expect(
        lowestSolvingCap(cappedSolveFor(difficulty, p, desc), DIFF_NAMES.length),
      ).toBe(p.diff);

      // It is uniquely solvable, and the solution is a genuine group table.
      const soln = state.grid.slice();
      const ret = solveGroup(soln, p.w, DIFF_UNREASONABLE);
      expect(ret).not.toBe(DIFF_IMPOSSIBLE);
      expect(ret).not.toBe(DIFF_AMBIGUOUS);
      expect(isValidGroupTable(soln, p.w)).toBe(true);

      // aux encodes that same solution.
      expect(aux[0]).toBe("S");
      expect(aux.length).toBe(p.w * p.w + 1);
    });
  }
});

describe("moves and completion", () => {
  function freshGame(p: GroupParams): { state: GroupState; aux: string } {
    const rng = randomNew(`play-${p.w}-${p.diff}-${p.id}`);
    const { desc, aux } = newGameDesc(p, rng);
    return { state: newState(p, desc), aux };
  }

  it("solve() completes the board to a valid group table", () => {
    const p = P(6, DIFF_NORMAL, true);
    const { state, aux } = freshGame(p);
    const res = solve(state, state, aux);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const done = groupGame.executeMove(state, res.move);
    expect(isValidGroupTable(done.grid, p.w)).toBe(true);
    expect(groupGame.status(done)).toBe("solved");
  });

  it("placing the last cell solves the board, which has a flash", () => {
    const p = P(6, DIFF_NORMAL, true);
    const { state, aux } = freshGame(p);
    const res = solve(state, state, aux);
    if (!res.ok) throw new Error("unsolvable");
    const solved = groupGame.executeMove(state, res.move);
    // The solved table with one non-given cell taken back out.
    const last = solved.immutable.indexOf(0);
    const before = cloneState(solved);
    before.grid[last] = 0;
    expect(groupGame.status(before)).toBe("ongoing");
    const after = groupGame.executeMove(before, {
      type: "set",
      n: solved.grid[last],
      cells: [{ x: last % p.w, y: Math.floor(last / p.w) }],
    });
    expect(groupGame.status(after)).toBe("solved");
    expect(solvedFlash(after, newUi(state))).toBeGreaterThan(0);
  });

  it("a multifill set writes every listed cell", () => {
    const p = P(6, DIFF_NORMAL, true);
    const { state } = freshGame(p);
    // Find three empty non-immutable cells to fill.
    const cells: { x: number; y: number }[] = [];
    for (let y = 0; y < p.w && cells.length < 3; y++)
      for (let x = 0; x < p.w && cells.length < 3; x++)
        if (!state.immutable[y * p.w + x] && !state.grid[y * p.w + x])
          cells.push({ x, y });
    const next = groupGame.executeMove(state, { type: "set", cells, n: 1 });
    for (const c of cells) expect(next.grid[c.y * p.w + c.x]).toBe(1);
  });

  it("reorder moves an element and clears an obsoleted divider", () => {
    const p = P(6, DIFF_NORMAL, true);
    const { state } = freshGame(p);
    // Put a divider to the right of element 0 (currently followed by element 1).
    const withDiv = groupGame.executeMove(state, { type: "divider", i: 0, j: 1 });
    expect(withDiv.dividers[0]).toBe(1);
    // Move element 3 to position 1, splitting 0 and 1 apart.
    const reordered = groupGame.executeMove(withDiv, {
      type: "reorder",
      num: 3,
      pos: 1,
    });
    expect(reordered.sequence[1]).toBe(3);
    // 0 is no longer immediately followed by 1, so its divider is cleared.
    expect(reordered.dividers[0]).toBe(-1);
    // Every element still present exactly once.
    expect([...reordered.sequence].sort((a, b) => a - b)).toEqual(
      Array.from({ length: p.w }, (_, i) => i),
    );
  });

  it("divider toggles off when reapplied", () => {
    const p = P(6, DIFF_NORMAL, true);
    const { state } = freshGame(p);
    const on = groupGame.executeMove(state, { type: "divider", i: 2, j: 3 });
    expect(on.dividers[2]).toBe(3);
    const off = groupGame.executeMove(on, { type: "divider", i: 2, j: 3 });
    expect(off.dividers[2]).toBe(-1);
  });

  it("the keyboard reorders and divides as dragging and clicking headings do", () => {
    const p = P(6, DIFF_NORMAL, true);
    const { state } = freshGame(p);
    const ds = newDrawState(state, PREFERRED_TILE_SIZE);
    const ts = ds.tileSize;
    const send = (ui: ReturnType<typeof newUi>, x: number, y: number, b: number) =>
      groupGame.interpretMove(state, ui, ds, { x, y }, b);

    // Keyboard: an arrow shows the cursor on column 1, Shift+Right moves that
    // column's element one place right.
    const keyed = newUi(state);
    send(keyed, 0, 0, CURSOR_RIGHT);
    expect(send(keyed, 0, 0, CURSOR_RIGHT | MOD_SHFT)).toEqual({
      type: "reorder",
      num: state.sequence[1],
      pos: 2,
    });
    // Pointer: the same column's heading dragged one column right.
    const dragged = newUi(state);
    const heading = coord(-1, ts) + ts / 2;
    send(dragged, coord(1, ts) + ts / 2, heading, LEFT_BUTTON);
    send(dragged, coord(2, ts) + ts / 2, heading, LEFT_DRAG);
    expect(send(dragged, coord(2, ts) + ts / 2, heading, LEFT_RELEASE)).toEqual(
      send(newUiAt(state, 1), 0, 0, CURSOR_RIGHT | MOD_SHFT),
    );

    // `|` after column 1 against a click on the line between headings 1 and 2.
    const clicked = newUi(state);
    send(clicked, coord(2, ts), heading, LEFT_BUTTON);
    expect(send(clicked, coord(2, ts), heading, LEFT_RELEASE)).toEqual(
      send(newUiAt(state, 1), 0, 0, 0x7c),
    );
    // `-` below the last row has no line to toggle.
    expect(send(newUiAt(state, p.w - 1), 0, 0, 0x2d)).toBeNull();
  });

  it("rejects setting an immutable cell to a different value", () => {
    const p = P(6, DIFF_NORMAL, true);
    const { state } = freshGame(p);
    const imm = state.grid.findIndex((v, i) => state.immutable[i] !== 0 && v !== 0);
    const x = imm % p.w;
    const y = (imm / p.w) | 0;
    const wrong = (state.grid[imm] % p.w) + 1;
    expect(() =>
      groupGame.executeMove(state, { type: "set", cells: [{ x, y }], n: wrong }),
    ).toThrow();
  });
});

describe("findMistakes", () => {
  it("flags a wrong entry and clears once corrected", () => {
    const p = P(6, DIFF_NORMAL, true);
    const rng = randomNew("mistake");
    const { desc, aux } = newGameDesc(p, rng);
    const state = newState(p, desc);

    // Solve to the unique solution, then corrupt one non-immutable cell.
    const res = solve(state, state, aux);
    if (!res.ok) throw new Error("unsolvable");
    const solved = groupGame.executeMove(state, res.move);
    expect(findMistakes(solved)).toHaveLength(0);

    const idx = solved.grid.findIndex((_, i) => !state.immutable[i]);
    const bad = cloneState(solved);
    bad.grid[idx] = (bad.grid[idx] % p.w) + 1;
    const mistakes = findMistakes(bad);
    expect(mistakes.length).toBeGreaterThan(0);
    expect(mistakes.some((m) => m.y * p.w + m.x === idx)).toBe(true);
  });
});

describe("rendering smoke", () => {
  it("draws without throwing and the palette has all colors", () => {
    const p = P(6, DIFF_NORMAL, true);
    const rng = randomNew("render");
    const { desc } = newGameDesc(p, rng);
    const state = newState(p, desc);
    const pal = colors([0.9, 0.9, 0.9]);
    // 8 upstream + COL_HINT / COL_HINT_CELL + COL_PENCIL_BODY. The chain ordinal
    // shares `COL_HINT_CELL`: a number saying where a cell falls in the chain is
    // an index into the evidence, not a hint role of its own.
    expect(pal).toHaveLength(11);

    const ds = newDrawState(state, 48);
    const dr = new RecordingDrawing(pal);
    redraw(dr, ds, null, state, 0, newUi(state), 0, 0);
    expect(
      dr.ops.filter((o) => o.op !== "clip" && o.op !== "unclip").length,
    ).toBeGreaterThan(0);
  });
});

describe("Group desc parsing", () => {
  const p = P(3, DIFF_NORMAL, true);

  it("accepts what encodeGrid writes and builds that grid", () => {
    const grid = Uint8Array.from([1, 2, 0, 0, 0, 0, 0, 0, 3]);
    const desc = encodeGrid(grid, 9);
    expect(desc).toBe("1_2f3");
    expect(validateDesc(groupGame, p, desc)).toBeNull();
    expect(Array.from(newState(p, desc).grid)).toEqual(Array.from(grid));
  });

  it("refuses what encodeGrid never writes", () => {
    const tooShort = validateDesc(groupGame, p, "1_2f");
    const tooLong = validateDesc(groupGame, p, "1_2h");
    expect(tooShort).toMatch(/too short/);
    expect(tooLong).toMatch(/too long/);
    // Text after the grid, including after a comma.
    expect(validateDesc(groupGame, p, "1_2f3,x")).toBe(tooLong);
    // A `_` anywhere but between two numbers.
    expect(validateDesc(groupGame, p, "_1_2f3")).toMatch(/"_"/);
    expect(validateDesc(groupGame, p, "1__2f3")).toMatch(/"_"/);
    expect(validateDesc(groupGame, p, "1_2_f3")).toMatch(/"f"/);
    // Two numbers run together read as one, out of range.
    expect(validateDesc(groupGame, p, "12f3")).toMatch(/out of range/);
    expect(validateDesc(groupGame, p, "1_2f0")).toMatch(/out of range/);
    expect(validateDesc(groupGame, p, "1_2f!")).toMatch(/"!"/);
  });
});
