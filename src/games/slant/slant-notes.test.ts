/**
 * Slant's same-slant marks (`add-slant-notation`): the notes-mode input, the
 * move, the mistake check that vouches for the marks, and the hint that places
 * them. The hint's claims are checked against the board each step is shown on,
 * not against the solver that produced them.
 */
import { describe, expect, it } from "vitest";
import { UI_UPDATE } from "../../engine/game.ts";
import {
  CURSOR_DOWN,
  CURSOR_RIGHT,
  CURSOR_SELECT,
  ESCAPE,
  LEFT_BUTTON,
  newCursor,
  PENCIL_MODE_BUTTON,
  RIGHT_BUTTON,
} from "../../engine/pointer.ts";
import { randomNew } from "../../engine/random/index.ts";
import { RecordingDrawing } from "../../engine/testing/recording-drawing.ts";
import { DEFAULT_BACKGROUND } from "../../engine/testing/render-scenario.ts";
import type { Point } from "../../engine/types.ts";
import { newDesc } from "./generator.ts";
import type { SlantHint, SlantMark } from "./hint.ts";
import { slantGame } from "./index.ts";
import { border, COL_ERROR, COL_HINT, COL_PENCIL } from "./render.ts";
import { solveFromClues } from "./solver.ts";
import {
  ALIKE_DOWN,
  ALIKE_RIGHT,
  alikeBit,
  DIFF_EASY,
  DIFF_HARD,
  executeMove,
  newState,
  type SlantMove,
  type SlantState,
  type SlantUi,
} from "./state.ts";

const TS = 32;

function fresh(w: number, h: number, diff: number, seed: string): SlantState {
  const { desc } = newDesc({ w, h, diff }, randomNew(seed));
  return newState({ w, h, diff }, desc);
}

function notesUi(): SlantUi {
  return {
    cursor: newCursor(),
    pencilMode: true,
    pin: null,
    swapButtons: false,
    fadeGrounded: false,
  };
}

/** The pixel at fraction (fx, fy) of square (x, y). */
function at(x: number, y: number, fx: number, fy: number): Point {
  return { x: border(TS) + (x + fx) * TS, y: border(TS) + (y + fy) * TS };
}

function press(s: SlantState, u: SlantUi, button: number, p: Point = { x: 0, y: 0 }) {
  return slantGame.interpretMove(s, u, slantGame.newDrawState(s, TS), p, button);
}

const solutionOf = (s: SlantState): Int8Array => {
  const r = solveFromClues(s.w, s.h, s.clues);
  if ("error" in r) throw new Error("unsolvable board");
  return r.soln;
};

describe("slant notes mode input", () => {
  const s = fresh(5, 5, DIFF_EASY, "notes-input");

  it("the Marks key toggles the mode and drops a pin", () => {
    const u = notesUi();
    u.pencilMode = false;
    expect(press(s, u, PENCIL_MODE_BUTTON)).toBe(UI_UPDATE);
    expect(u.pencilMode).toBe(true);
    u.pin = { x: 1, y: 1 };
    press(s, u, PENCIL_MODE_BUTTON);
    expect(u).toMatchObject({ pencilMode: false, pin: null });
  });

  it("a tap toggles the mark on the side nearest it, with either button", () => {
    const u = notesUi();
    expect(press(s, u, LEFT_BUTTON, at(2, 2, 0.9, 0.5))).toEqual({
      type: "alike",
      x: 2,
      y: 2,
      dir: "right",
      on: true,
    });
    // The same side, tapped from the square beside it.
    expect(press(s, u, RIGHT_BUTTON, at(3, 2, 0.1, 0.5))).toMatchObject({
      x: 2,
      y: 2,
      dir: "right",
    });
    expect(press(s, u, LEFT_BUTTON, at(2, 2, 0.5, 0.15))).toMatchObject({
      x: 2,
      y: 1,
      dir: "down",
    });
    const marked = executeMove(s, {
      type: "alike",
      x: 2,
      y: 2,
      dir: "right",
      on: true,
    });
    expect(press(marked, u, LEFT_BUTTON, at(2, 2, 0.9, 0.5))).toMatchObject({
      on: false,
    });
  });

  it("a tap nearest the board's outer edge does nothing", () => {
    expect(press(s, notesUi(), LEFT_BUTTON, at(0, 2, 0.05, 0.5))).toBeNull();
    expect(press(s, notesUi(), LEFT_BUTTON, at(4, 4, 0.5, 0.95))).toBeNull();
  });

  it("the keyboard pins a square and marks it with a neighbor", () => {
    const u = notesUi();
    u.cursor = newCursor(1, 1, true);
    expect(press(s, u, CURSOR_SELECT)).toBe(UI_UPDATE);
    expect(u.pin).toEqual({ x: 1, y: 1 });
    press(s, u, CURSOR_DOWN);
    expect(press(s, u, CURSOR_SELECT)).toEqual({
      type: "alike",
      x: 1,
      y: 1,
      dir: "down",
      on: true,
    });
    expect(u.pin).toBeNull();

    // Enter on the pin lets go; Enter two squares away moves the pin.
    press(s, u, CURSOR_SELECT);
    expect(u.pin).toEqual({ x: 1, y: 2 });
    press(s, u, CURSOR_SELECT);
    expect(u.pin).toBeNull();
    press(s, u, CURSOR_SELECT);
    press(s, u, CURSOR_RIGHT);
    press(s, u, CURSOR_RIGHT);
    press(s, u, CURSOR_SELECT);
    expect(u.pin).toEqual({ x: 3, y: 2 });
    expect(press(s, u, ESCAPE)).toBe(UI_UPDATE);
    expect(u.pin).toBeNull();
  });

  it("every shared side is reachable by a tap from both of its squares", () => {
    let count = 0;
    for (let y = 0; y < s.h; y++) {
      for (let x = 0; x < s.w; x++) {
        const sides: [number, number, SlantMark][] = [];
        if (x + 1 < s.w) sides.push([0.9, 0.5, { x, y, dir: "right" }]);
        if (y + 1 < s.h) sides.push([0.5, 0.9, { x, y, dir: "down" }]);
        for (const [fx, fy, mark] of sides) {
          const [nx, ny] = mark.dir === "right" ? [x + 1, y] : [x, y + 1];
          const [gx, gy] = mark.dir === "right" ? [0.1, 0.5] : [0.5, 0.1];
          expect(press(s, notesUi(), LEFT_BUTTON, at(x, y, fx, fy))).toMatchObject(
            mark,
          );
          expect(press(s, notesUi(), LEFT_BUTTON, at(nx, ny, gx, gy))).toMatchObject(
            mark,
          );
          count++;
        }
      }
    }
    expect(count).toBe(2 * s.w * (s.h - 1));
  });
});

describe("slant marks as state", () => {
  const s = fresh(5, 5, DIFF_EASY, "notes-state");

  it("a mark move is an absolute set", () => {
    const on: SlantMove = { type: "alike", x: 0, y: 0, dir: "down", on: true };
    const once = executeMove(s, on);
    expect(once.alike[0]).toBe(ALIKE_DOWN);
    expect(executeMove(once, on).alike[0]).toBe(ALIKE_DOWN);
    expect(executeMove(once, { ...on, on: false }).alike[0]).toBe(0);
    expect(() =>
      executeMove(s, { type: "alike", x: 4, y: 0, dir: "right", on: true }),
    ).toThrow();
  });

  it("a log of diagonals alone, as every save before marks holds, replays", () => {
    const sol = solutionOf(s);
    let st = s;
    for (let i = 0; i < 5; i++) {
      st = executeMove(st, { type: "set", x: i, y: 0, v: sol[i] as 1 | -1 });
    }
    expect(st.alike.every((b) => b === 0)).toBe(true);
    expect(Array.from(st.soln.slice(0, 5))).toEqual(Array.from(sol.slice(0, 5)));
  });

  it("findMistakes flags a mark joining squares that slant differently, and only that", () => {
    const sol = solutionOf(s);
    let right: SlantMark | null = null;
    let wrong: SlantMark | null = null;
    for (let i = 0; i + 1 < s.w; i++) {
      const mark: SlantMark = { x: i, y: 0, dir: "right" };
      if (sol[i] === sol[i + 1]) right ??= mark;
      else wrong ??= mark;
    }
    if (!right || !wrong) throw new Error("expected both kinds of pair in row 0");
    const good = executeMove(s, { type: "alike", ...right, on: true });
    expect(slantGame.findMistakes?.(good)).toEqual([]);
    const bad = executeMove(good, { type: "alike", ...wrong, on: true });
    expect(slantGame.findMistakes?.(bad)).toEqual([wrong]);
    expect(slantGame.hint?.(bad).ok).toBe(false);
  });
});

/** Walk a plan from `s`, checking every step against the board it is shown on. */
function walkPlan(s: SlantState): { marks: number; steps: number } {
  const res = slantGame.hint?.(s);
  if (!res?.ok) throw new Error("expected a plan");
  const sol = solutionOf(s);
  const { w } = s;
  const W = w + 1;
  let st = s;
  let marks = 0;
  const has = (m: SlantMark) => (st.alike[m.y * w + m.x] & alikeBit(m.dir)) !== 0;
  for (const step of res.steps) {
    const hl = step.highlights as SlantHint;
    // Every mark a step cites is already on the board.
    for (const m of hl.marks ?? []) expect(has(m)).toBe(true);
    const move = step.move;
    if (move.type === "alike") {
      marks++;
      const a = move.y * w + move.x;
      const b = move.dir === "right" ? a + 1 : a + w;
      // A mark is placed once, never over one already there, and is true.
      expect(has(move)).toBe(false);
      expect(sol[a]).toBe(sol[b]);
      checkMarkSentence(st, step.explanation, a, b);
    }
    st = executeMove(st, move);
  }
  expect(st.completed).toBe(true);
  return { marks, steps: res.steps.length };

  /** The clues a mark's sentence names are where it says they are. */
  function checkMarkSentence(board: SlantState, text: string, a: number, b: number) {
    const horizontal = b === a + 1;
    const ax = a % w;
    const ay = Math.floor(a / w);
    // The two ends of the shared side, in the sentence's words.
    const ends: Record<string, number> = horizontal
      ? { above: ay * W + ax + 1, below: (ay + 1) * W + ax + 1 }
      : { "on the left": (ay + 1) * W + ax, "on the right": (ay + 1) * W + ax + 1 };
    for (const [, digit, where] of text.matchAll(
      /the ([123]) (above|below|on the left|on the right)/g,
    )) {
      expect(board.clues[ends[where]]).toBe(Number(digit));
    }
    for (const [, digit] of text.matchAll(/either ([13])/g)) {
      for (const pt of Object.values(ends)) expect(board.clues[pt]).toBe(Number(digit));
    }
    const clue = text.match(
      /^This (\d) clue (needs one more line|gets one line from its)/,
    );
    if (clue) {
      // Some clue of that value at an end of the shared side needs exactly one
      // more line, and its only open squares are these two (and, if the
      // sentence says so, a marked pair it counts as one line).
      const c = Number(clue[1]);
      const pair = clue[2].startsWith("gets");
      const holds = Object.values(ends).some((pt) => {
        if (board.clues[pt] !== c) return false;
        const px = pt % W;
        const py = Math.floor(pt / W);
        let lines = 0;
        const open: number[] = [];
        for (const [sx, sy] of [
          [px - 1, py - 1],
          [px - 1, py],
          [px, py - 1],
          [px, py],
        ]) {
          if (sx < 0 || sy < 0 || sx >= w || sy >= board.h) continue;
          const v = board.soln[sy * w + sx];
          if (v === 0) open.push(sy * w + sx);
          else if (v < 0 === (px - sx === py - sy)) lines++;
        }
        const others = open.filter((i) => i !== a && i !== b);
        const pairMarked =
          others.length === 2 &&
          (board.alike[Math.min(...others)] &
            alikeBit(
              Math.max(...others) === Math.min(...others) + 1 ? "right" : "down",
            )) !==
            0;
        return (
          open.includes(a) &&
          open.includes(b) &&
          (pair ? pairMarked : others.length === 0) &&
          c - lines - (pair ? 1 : 0) === 1
        );
      });
      expect(holds).toBe(true);
    }
    const line = text.match(/^(This 2 lies|These 2s lie) in a line between (.*), so /);
    if (line) checkLine(board, line[1] === "This 2 lies", line[2], Object.values(ends));
    if (/^The pair across this 2 /.test(text)) {
      expect(Object.values(ends).some((pt) => board.clues[pt] === 2)).toBe(true);
    }
  }

  /**
   * Walk the line of 2s out from both ends of the pair's shared side, and hold
   * the sentence to it: how many 2s there are, and what caps each end (a 1 or 3
   * clue, or a placed diagonal in the end pair meeting or missing the 2 beside
   * it).
   */
  function checkLine(board: SlantState, one2: boolean, caps: string, ends: number[]) {
    const [e1, e2] = ends;
    const sx = (e2 % W) - (e1 % W);
    const sy = Math.floor(e2 / W) - Math.floor(e1 / W);
    const onGrid = (x: number, y: number) => x >= 0 && y >= 0 && x <= w && y <= board.h;
    // Per side, every cap the line could end in and how many 2s come before
    // it: a placed diagonal may cap it at any 2 along the way, a clue only
    // where the 2s stop.
    const options: { twos: number; cap: string }[][] = [];
    for (const [start, other, dir] of [
      [e1, e2, -1],
      [e2, e1, 1],
    ]) {
      const found: { twos: number; cap: string }[] = [];
      let [px, py] = [start % W, Math.floor(start / W)];
      let [qx, qy] = [other % W, Math.floor(other / W)];
      for (let twos = 0; ; twos++) {
        // The end pair: the two squares either side of the segment from the
        // last 2, (qx, qy), to (px, py).
        const [lx, ly] = [Math.min(px, qx), Math.min(py, qy)];
        const pair =
          sx === 0
            ? [
                [lx - 1, ly],
                [lx, ly],
              ]
            : [
                [lx, ly - 1],
                [lx, ly],
              ];
        for (const [x, y] of pair) {
          if (x < 0 || y < 0 || x >= w || y >= board.h) continue;
          const v = board.soln[y * w + x];
          if (v === 0) continue;
          const meets = v < 0 === (qx - x === qy - y);
          found.push({ twos, cap: `a diagonal ${meets ? "meeting" : "missing"}` });
        }
        const c = onGrid(px, py) ? board.clues[py * W + px] : -1;
        if (c !== 2) {
          if (c === 1 || c === 3) found.push({ twos, cap: `a ${c}` });
          break;
        }
        [qx, qy] = [px, py];
        [px, py] = [px + dir * sx, py + dir * sy];
      }
      options.push(found);
    }
    const both = caps.match(/^two (?:(\d)s|diagonals (meeting|missing))/);
    const said = both
      ? Array(2).fill(both[1] ? `a ${both[1]}` : `a diagonal ${both[2]}`)
      : [...caps.matchAll(/a \d|a diagonal (?:meeting|missing)/g)].map((m) => m[0]);
    expect(said).toHaveLength(2);
    const fits = (x: number, y: number) =>
      options[0].some((a) =>
        options[1].some(
          (b) =>
            a.cap === said[x] &&
            b.cap === said[y] &&
            (one2 ? a.twos + b.twos === 1 : a.twos + b.twos >= 2),
        ),
      );
    expect(fits(0, 1) || fits(1, 0), `${caps} on ${JSON.stringify(options)}`).toBe(
      true,
    );
  }
}

describe("slant hint places the marks it uses", () => {
  it("every mark is true, placed once before any step citing it, and named rightly", () => {
    let marks = 0;
    for (const [w, h, diff] of [
      [8, 8, DIFF_HARD],
      [12, 10, DIFF_HARD],
      [12, 10, DIFF_EASY],
    ] as const) {
      for (let seed = 0; seed < 6; seed++) {
        marks += walkPlan(fresh(w, h, diff, `notes-plan-${w}.${diff}.${seed}`)).marks;
      }
    }
    // Vacuity: the walk must actually have met marks to check.
    expect(marks).toBeGreaterThan(50);
  });

  it("a plan resumed from the player's own marks cites them and places none twice", () => {
    const s = fresh(12, 10, DIFF_HARD, "notes-resume");
    const first = slantGame.hint?.(s);
    if (!first?.ok) throw new Error("expected a plan");
    // The player makes only the plan's marks, none of its diagonals.
    let marked = s;
    for (const step of first.steps) {
      if (step.move.type === "alike") marked = executeMove(marked, step.move);
    }
    const placed = first.steps.filter((st) => st.move.type === "alike").length;
    expect(placed).toBeGreaterThan(0);
    // The walk refuses a mark placed over one already there. The solver counts
    // one pair per clue, so marks known from the start can change which pair
    // it counts, and a resumed plan may place a mark the first did not: fewer,
    // never the same ones.
    const { marks } = walkPlan(marked);
    expect(marks).toBeLessThan(placed);
    const again = slantGame.hint?.(marked);
    if (!again?.ok) throw new Error("expected a plan");
    const cited = again.steps.some(
      (st) => ((st.highlights as SlantHint).marks ?? []).length,
    );
    expect(cited).toBe(true);
  });

  it("keep-track completes a mark step only on that mark", () => {
    const s = fresh(12, 10, DIFF_HARD, "notes-track");
    const res = slantGame.hint?.(s);
    if (!res?.ok) throw new Error("expected a plan");
    const step = res.steps.find((st) => st.move.type === "alike");
    if (step?.move.type !== "alike") throw new Error("expected a mark step");
    expect(slantGame.hintKeepTrack?.(step.move, step, s)).toBe("completed");
    expect(slantGame.hintKeepTrack?.({ ...step.move, on: false }, step, s)).toBe("off");
  });
});

describe("slant marks render", () => {
  const s = fresh(5, 5, DIFF_EASY, "notes-render");

  function frame(state: SlantState, ui: SlantUi, hint?: unknown, mistakes?: unknown) {
    const dr = new RecordingDrawing(slantGame.colors(DEFAULT_BACKGROUND));
    slantGame.redraw(
      dr,
      slantGame.newDrawState(state, TS),
      null,
      state,
      1,
      ui,
      0,
      0,
      hint as never,
      mistakes as never,
    );
    return dr.ops;
  }

  /** The bars of a mark across the side between (1, 1) and (2, 1). */
  const barsAcross = (ops: ReturnType<typeof frame>, color: number) => {
    const sideX = border(TS) + 2 * TS;
    const midY = border(TS) + TS + TS / 2;
    return ops.filter(
      (o) =>
        o.op === "rect" &&
        o.color === color &&
        o.x < sideX &&
        o.x + o.w > sideX &&
        Math.abs(o.y - midY) < TS / 4 &&
        o.h < o.w,
    );
  };

  const mark: SlantMove = { type: "alike", x: 1, y: 1, dir: "right", on: true };
  const ui = { ...notesUi(), pencilMode: false };

  it("a player's mark is two pencil bars across the shared side, drawn by both squares", () => {
    const ops = frame(executeMove(s, mark), ui);
    // Two bars, each drawn once by the square on either side.
    expect(barsAcross(ops, COL_PENCIL)).toHaveLength(4);
    expect(barsAcross(frame(s, ui), COL_PENCIL)).toHaveLength(0);
  });

  it("a mistaken mark is drawn in the mistake color", () => {
    const marked = executeMove(s, mark);
    const ops = frame(marked, ui, undefined, [{ x: 1, y: 1, dir: "right" }]);
    expect(barsAcross(ops, COL_ERROR)).toHaveLength(4);
    expect(barsAcross(ops, COL_PENCIL)).toHaveLength(0);
  });

  it("a hint step placing a mark draws it in the hint color", () => {
    const step = { move: mark, explanation: "", highlights: { mark: mark } };
    expect(barsAcross(frame(s, ui, step), COL_HINT)).toHaveLength(4);
  });

  it("marks are keyed per tile, so a new mark repaints the squares beside it", () => {
    const ds = slantGame.newDrawState(s, TS);
    const dr = new RecordingDrawing(slantGame.colors(DEFAULT_BACKGROUND));
    slantGame.redraw(dr, ds, null, s, 1, ui, 0, 0);
    const dr2 = new RecordingDrawing(slantGame.colors(DEFAULT_BACKGROUND));
    slantGame.redraw(dr2, ds, s, executeMove(s, mark), 1, ui, 0, 0);
    expect(barsAcross(dr2.ops, COL_PENCIL)).toHaveLength(4);
  });

  it("ALIKE bits are the ones the state stores", () => {
    expect([ALIKE_RIGHT, ALIKE_DOWN]).toEqual([alikeBit("right"), alikeBit("down")]);
  });
});
