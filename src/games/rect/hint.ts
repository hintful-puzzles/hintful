/**
 * Rectangles' hint: the next rectangle, or line, that the board forces.
 *
 * Every rung reads only what the player can see: the clues and the lines
 * drawn. A clue's **fits** are the rectangles of its area that contain it, stay
 * on the board, take in no other clue and cross no drawn line; a step draws a
 * clue's rectangle when one fit is left, or draws a line no rectangle can
 * straddle. Nothing a step concludes needs a notation the game lacks: the
 * rectangle and the line it draws are the player's own marks, and every later
 * step rereads the board.
 *
 * The rungs, cheapest first:
 *
 * - **fit**: a clue has one fit.
 * - **reach**: a square only one clue can reach, and one of that clue's fits
 *   covers it.
 * - **overlap**: another clue covers some squares wherever it goes, and this
 *   clue has one fit left that avoids them.
 * - **starve**: every fit but one would leave another clue no room, or leave a
 *   square that no rectangle could cover.
 * - **line**: no fit of any clue covers both squares beside an edge.
 */

import { assertNever } from "../../engine/assert-never.ts";
import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { narratedStep } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import { commonHintRefusal, DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { Rect } from "../../engine/types.ts";
import type { RectEdge } from "./hint-marks.ts";
import { say } from "./hint-text.ts";
import { executeMove, hrange, vrange } from "./moves.ts";
import type { RectMove, RectState } from "./state.ts";

export type RectFiring =
  | {
      kind: "fit";
      clue: number;
      rect: Rect;
      /** Why each other rectangle of the clue's area around it fails. */
      offBoard: boolean;
      blockers: number[];
      crossesLine: boolean;
    }
  | { kind: "reach"; clue: number; rect: Rect; square: number }
  | { kind: "overlap"; clue: number; rect: Rect; other: number; core: number[] }
  | { kind: "starve"; clue: number; rect: Rect; starved: number[]; stranded: number[] }
  | { kind: "line"; edge: RectEdge; squares: [number, number] };

/** A step's highlights: nothing but the move's own data, which keep-track and
 * refresh compare against. The marks are the words' (`stepMarks`). */
export type RectHint = null;

const covers = (r: Rect, i: number, w: number): boolean => {
  const x = i % w;
  const y = Math.floor(i / w);
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
};

const overlap = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const cellsOf = (r: Rect, w: number): number[] => {
  const out: number[] = [];
  for (let y = r.y; y < r.y + r.h; y++)
    for (let x = r.x; x < r.x + r.w; x++) out.push(y * w + x);
  return out;
};

/** Does a drawn line run through the inside of `r`? */
function crossesLine(s: RectState, r: Rect): boolean {
  const { w } = s;
  for (let y = r.y; y < r.y + r.h; y++)
    for (let x = r.x + 1; x < r.x + r.w; x++) if (s.vedge[y * w + x]) return true;
  for (let y = r.y + 1; y < r.y + r.h; y++)
    for (let x = r.x; x < r.x + r.w; x++) if (s.hedge[y * w + x]) return true;
  return false;
}

/** Every rectangle of the clue's area that contains the clue, on the board or
 * not. */
function shapesAround(s: RectState, clue: number): Rect[] {
  const { w } = s;
  const a = s.grid[clue];
  const cx = clue % w;
  const cy = Math.floor(clue / w);
  const out: Rect[] = [];
  for (let rw = 1; rw <= a; rw++) {
    if (a % rw) continue;
    const rh = a / rw;
    for (let y = cy - rh + 1; y <= cy; y++)
      for (let x = cx - rw + 1; x <= cx; x++) out.push({ x, y, w: rw, h: rh });
  }
  return out;
}

type Verdict = "fits" | "offBoard" | { clue: number } | "line";

function judge(s: RectState, clue: number, r: Rect): Verdict {
  const { w, h, grid } = s;
  if (r.x < 0 || r.y < 0 || r.x + r.w > w || r.y + r.h > h) return "offBoard";
  for (const i of cellsOf(r, w)) if (i !== clue && grid[i]) return { clue: i };
  return crossesLine(s, r) ? "line" : "fits";
}

function fitsOf(s: RectState, clue: number): Rect[] {
  return shapesAround(s, clue).filter((r) => judge(s, clue, r) === "fits");
}

/** Are all four sides of `r` drawn? (Its inside is clear, since it fits.) */
function isDrawn(s: RectState, r: Rect): boolean {
  const { w, h } = s;
  for (let y = r.y; y < r.y + r.h; y++) {
    if (r.x > 0 && !s.vedge[y * w + r.x]) return false;
    if (r.x + r.w < w && !s.vedge[y * w + r.x + r.w]) return false;
  }
  for (let x = r.x; x < r.x + r.w; x++) {
    if (r.y > 0 && !s.hedge[r.y * w + x]) return false;
    if (r.y + r.h < h && !s.hedge[(r.y + r.h) * w + x]) return false;
  }
  return true;
}

/** The next firing on `s`, cheapest rung first, or null. */
export function nextFiring(s: RectState): RectFiring | null {
  const { w, h, grid } = s;
  const clues = [...grid.keys()].filter((i) => grid[i]);
  const fits = new Map(clues.map((c) => [c, fitsOf(s, c)]));
  const fitsFor = (c: number): Rect[] => fits.get(c) ?? [];
  const open = clues.filter((c) => {
    const f = fitsFor(c);
    return !(f.length === 1 && isDrawn(s, f[0]));
  });

  for (const clue of open) {
    const f = fitsFor(clue);
    if (f.length !== 1) continue;
    const blockers = new Set<number>();
    let offBoard = false;
    let line = false;
    for (const r of shapesAround(s, clue)) {
      const v = judge(s, clue, r);
      if (v === "offBoard") offBoard = true;
      else if (v === "line") line = true;
      else if (v !== "fits") blockers.add(v.clue);
    }
    return {
      kind: "fit",
      clue,
      rect: f[0],
      offBoard,
      blockers: [...blockers].sort((a, b) => a - b),
      crossesLine: line,
    };
  }

  for (let i = 0; i < w * h; i++) {
    const who = clues.filter((c) => fitsFor(c).some((r) => covers(r, i, w)));
    if (who.length !== 1 || !open.includes(who[0])) continue;
    const through = fitsFor(who[0]).filter((r) => covers(r, i, w));
    if (through.length === 1 && i !== who[0])
      return { kind: "reach", clue: who[0], rect: through[0], square: i };
  }

  for (const other of clues) {
    const fo = fitsFor(other);
    const core = cellsOf({ x: 0, y: 0, w, h }, w).filter(
      (i) => i !== other && fo.every((r) => covers(r, i, w)),
    );
    if (core.length === 0) continue;
    for (const clue of open) {
      if (clue === other) continue;
      const f = fitsFor(clue);
      const left = f.filter((r) => !core.some((i) => covers(r, i, w)));
      if (left.length !== 1 || left.length === f.length) continue;
      const used = core.filter((i) => f.some((r) => covers(r, i, w)));
      return { kind: "overlap", clue, rect: left[0], other, core: used };
    }
  }

  for (const clue of open) {
    const f = fitsFor(clue);
    if (f.length < 2) continue;
    const starved = new Set<number>();
    const stranded = new Set<number>();
    const ok = f.filter((r) => {
      for (const j of clues)
        if (j !== clue && !fitsFor(j).some((q) => !overlap(q, r))) {
          starved.add(j);
          return false;
        }
      for (let i = 0; i < w * h; i++) {
        if (covers(r, i, w)) continue;
        const reached = clues.some(
          (j) =>
            j !== clue && fitsFor(j).some((q) => covers(q, i, w) && !overlap(q, r)),
        );
        if (!reached) {
          stranded.add(i);
          return false;
        }
      }
      return true;
    });
    if (ok.length === 1)
      return {
        kind: "starve",
        clue,
        rect: ok[0],
        starved: [...starved].sort((a, b) => a - b),
        stranded: [...stranded].sort((a, b) => a - b),
      };
  }

  const all = clues.flatMap(fitsFor);
  const apart = (a: number, b: number): boolean =>
    !all.some((r) => covers(r, a, w) && covers(r, b, w));
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (vrange(w, h, x, y) && !s.vedge[i] && apart(i - 1, i))
        return { kind: "line", edge: { edge: "v", x, y }, squares: [i - 1, i] };
      if (hrange(w, h, x, y) && !s.hedge[i] && apart(i - w, i))
        return { kind: "line", edge: { edge: "h", x, y }, squares: [i - w, i] };
    }
  return null;
}

/** Whether the rungs alone finish `s`. The generator deals only boards they
 * do, so the hint never runs out on a board it dealt. */
export function rungsFinish(s: RectState): boolean {
  let t = s;
  for (let f = nextFiring(t); f && !t.completed; f = nextFiring(t))
    t = executeMove(t, moveOf(f));
  return t.completed;
}

/** The move a firing makes. */
export function moveOf(f: RectFiring): RectMove {
  if (f.kind === "line") return { type: "edge", ...f.edge };
  return { type: "rect", erasing: false, ...f.rect };
}

function stepOf(s: RectState, f: RectFiring): HintStep<RectMove, RectHint> {
  return narratedStep({ move: moveOf(f), words: say.firing(s, f), highlights: null });
}

/**
 * The plan from the player's lines to the end, a step per rectangle or line.
 * Refuses on a finished board and one with a wrong line; stops where the rungs
 * run out.
 */
export function rectHint(
  state: RectState,
  mistakes: number,
): HintResult<RectMove, RectHint> {
  const refusal = commonHintRefusal(state.completed, mistakes);
  if (refusal) return refusal;
  const board = { s: state };
  const steps: HintStep<RectMove, RectHint>[] = [];
  deduceHintPlan({
    board,
    status: (b) => b.s.completed,
    incomplete: false,
    next: (b) => nextFiring(b.s),
    apply: (b, f) => {
      steps.push(stepOf(b.s, f));
      b.s = executeMove(b.s, moveOf(f));
    },
    budget: stepBudget("rect hint"),
  });
  if (steps.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  return { ok: true, steps };
}

/**
 * The step is done when the player's move leaves exactly the lines the step's
 * own move would, however they were drawn (a drag, or the sides one at a
 * time). A move that changes only lines the step would change, and changes
 * them the same way, is on track. `state` is the board before the move.
 */
export function rectKeepTrack(
  m: RectMove,
  step: HintStep<RectMove, RectHint>,
  state: RectState,
): HintTrackVerdict {
  const planned = executeMove(state, step.move);
  const after = executeMove(state, m);
  let done = true;
  let moved = false;
  let astray = false;
  const pairs: [Uint8Array, Uint8Array, Uint8Array][] = [
    [state.hedge, after.hedge, planned.hedge],
    [state.vedge, after.vedge, planned.vedge],
  ];
  for (const [before, now, want] of pairs)
    for (let i = 0; i < before.length; i++) {
      if (now[i] !== want[i]) done = false;
      if (now[i] === before[i]) continue;
      if (now[i] === want[i]) moved = true;
      else astray = true;
    }
  if (done) return "completed";
  return moved && !astray ? "onTrack" : "off";
}

/** A stored step whose lines are already on the board is resolved. */
export function rectRefreshStep(
  step: HintStep<RectMove, RectHint>,
  state: RectState,
): HintStep<RectMove, RectHint> | null {
  const m = step.move;
  switch (m.type) {
    case "rect":
      return isDrawn(state, m) && !crossesLine(state, m) ? null : step;
    case "edge":
      return (m.edge === "h" ? state.hedge : state.vedge)[m.y * state.w + m.x]
        ? null
        : step;
    case "solve":
      return step;
    default:
      return assertNever(m, "rect hint refresh");
  }
}
