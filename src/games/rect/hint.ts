/**
 * Rectangles' hint: the next rectangle, or line, that the board forces.
 *
 * Every rung reads only what the player can see: the clues and the lines
 * drawn. A clue's **fits** are the rectangles of its area that contain it, stay
 * on the board, take in no other clue and cross no drawn line; a step draws a
 * clue's rectangle when one fit is left, or draws a line where the only
 * rectangles that could cross an edge are ruled out. Nothing a step concludes needs a notation the game lacks: the
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
 * - **line**: the fits across an edge are each out at a glance, for taking a
 *   square another clue covers wherever it goes, or for leaving out a square
 *   no other clue reaches.
 *
 * A line is the one notation the game has for "this placement is out", which
 * is what the solver keeps in its lists (`rectSolver`) and what lets the rungs
 * follow it: every later step rereads the lines.
 */

import { assertNever } from "../../engine/assert-never.ts";
import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { narratedStep } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { Rect } from "../../engine/types.ts";
import type { RectEdge } from "./hint-marks.ts";
import { say } from "./hint-text.ts";
import { executeMove, hrange, isSolved, vrange } from "./moves.ts";
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
  | { kind: "line"; edge: RectEdge; across: Crossing[] };

/** The rungs a step can be: the firings' kinds, cheapest first. */
export const RECT_RUNGS = ["fit", "reach", "overlap", "starve", "line"] as const;
export type RectRung = (typeof RECT_RUNGS)[number];

/**
 * A clue with fits across an edge, and why none of them stands: each takes a
 * square (`takes`) that another clue (`owners`) covers wherever it goes, or
 * leaves out a square (`misses`) that no other clue reaches.
 */
export interface Crossing {
  clue: number;
  takes: number[];
  owners: number[];
  misses: number[];
}

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

/** Each clue's fits, the clues in reading order. */
type Fits = ReadonlyMap<number, readonly Rect[]>;

function readFits(s: RectState): Fits {
  const fits = new Map<number, Rect[]>();
  for (let clue = 0; clue < s.grid.length; clue++)
    if (s.grid[clue]) fits.set(clue, fitsOf(s, clue));
  return fits;
}

/**
 * The fits left on `t`, the board `f` made of the one `fits` were read from.
 * A firing only draws lines, so it only takes fits away, and only ones over a
 * square beside a line it drew. Reading every shape again at every step was
 * most of the time a large board took to deal.
 */
function fitsAfter(fits: Fits, t: RectState, f: RectFiring): Fits {
  const beside: Rect =
    f.kind === "line" ? { x: f.edge.x, y: f.edge.y, w: 1, h: 1 } : f.rect;
  const left = new Map<number, readonly Rect[]>();
  for (const [clue, rects] of fits)
    left.set(
      clue,
      rects.filter((r) => !(overlap(r, beside) && crossesLine(t, r))),
    );
  return left;
}

/** For each square, the clues with a fit over it, in reading order. */
function reachersOf(s: RectState, fits: Fits): number[][] {
  const reachers: number[][] = Array.from({ length: s.w * s.h }, () => []);
  for (const [clue, rects] of fits)
    for (const r of rects)
      for (const i of cellsOf(r, s.w)) {
        const who = reachers[i];
        if (who[who.length - 1] !== clue) who.push(clue);
      }
  return reachers;
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

/**
 * The next firing on `s`, cheapest rung first, or null. `fits` is what
 * {@link fitsAfter} kept of an earlier board's, where the caller has them.
 */
export function nextFiring(s: RectState, fits: Fits = readFits(s)): RectFiring | null {
  const { w, h } = s;
  const clues = [...fits.keys()];
  const fitsFor = (c: number): readonly Rect[] => fits.get(c) ?? [];
  const open = clues.filter((c) => {
    const f = fitsFor(c);
    return !(f.length === 1 && isDrawn(s, f[0]));
  });
  const isOpen = new Set(open);

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

  const reachers = reachersOf(s, fits);
  for (let i = 0; i < w * h; i++) {
    const who = reachers[i];
    if (who.length !== 1 || !isOpen.has(who[0])) continue;
    const through = fitsFor(who[0]).filter((r) => covers(r, i, w));
    if (through.length === 1 && i !== who[0])
      return { kind: "reach", clue: who[0], rect: through[0], square: i };
  }

  // The squares each clue covers wherever it goes, its own among them.
  const sure = new Map<number, Rect>();
  for (const clue of clues) {
    const core = common(fitsFor(clue));
    if (core) sure.set(clue, core);
  }

  for (const [other, core] of sure) {
    if (core.w * core.h === 1) continue;
    for (const clue of open) {
      if (clue === other) continue;
      const f = fitsFor(clue);
      // No fit takes in another clue, so one that overlaps `core` takes a
      // square of it other than the clue's own.
      const left = f.filter((r) => !overlap(r, core));
      if (left.length !== 1 || left.length === f.length) continue;
      const used = cellsOf(core, w).filter((i) => f.some((r) => covers(r, i, w)));
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
        const reached = reachers[i].some(
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

  // A fit is out at a glance when it takes a square another clue is sure of,
  // or leaves out one that only its own clue reaches. An edge is a line when
  // every fit across it is out, and the line is how the player keeps that. An
  // edge no fit crosses is left alone: a line there would cut no fit, so no
  // later step could tell it had been drawn.
  const sole = new Map<number, number[]>();
  reachers.forEach((who, i) => {
    if (who.length !== 1) return;
    const squares = sole.get(who[0]);
    if (squares) squares.push(i);
    else sole.set(who[0], [i]);
  });
  const owners = [...sure];
  const crossing = (a: number, b: number): Crossing[] | null => {
    const by = new Map<number, Crossing>();
    for (const clue of reachers[b])
      for (const rect of fitsFor(clue)) {
        if (!covers(rect, a, w) || !covers(rect, b, w)) continue;
        const c = by.get(clue) ?? { clue, takes: [], owners: [], misses: [] };
        by.set(clue, c);
        const owned = owners.find(([o, core]) => o !== clue && overlap(core, rect));
        if (owned) {
          const [owner, core] = owned;
          for (const i of cellsOf(core, w))
            if (covers(rect, i, w) && !c.takes.includes(i)) c.takes.push(i);
          if (!c.owners.includes(owner)) c.owners.push(owner);
          continue;
        }
        const missed = sole.get(clue)?.find((i) => !covers(rect, i, w));
        if (missed === undefined) return null;
        if (!c.misses.includes(missed)) c.misses.push(missed);
      }
    return [...by.values()];
  };
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const edges: [boolean, RectEdge, number][] = [
        [vrange(w, h, x, y) && !s.vedge[i], { edge: "v", x, y }, i - 1],
        [hrange(w, h, x, y) && !s.hedge[i], { edge: "h", x, y }, i - w],
      ];
      for (const [open, edge, j] of edges) {
        const across = open ? crossing(j, i) : null;
        if (across && across.length > 0) return { kind: "line", edge, across };
      }
    }
  return null;
}

/** The squares every one of `fits` covers, or null when there are none. */
function common(fits: readonly Rect[]): Rect | null {
  if (fits.length === 0) return null;
  const x = Math.max(...fits.map((r) => r.x));
  const y = Math.max(...fits.map((r) => r.y));
  const x2 = Math.min(...fits.map((r) => r.x + r.w));
  const y2 = Math.min(...fits.map((r) => r.y + r.h));
  return x2 > x && y2 > y ? { x, y, w: x2 - x, h: y2 - y } : null;
}

/** Whether the rungs alone finish `s`. The generator deals only boards they
 * do, so the hint never runs out on a board it dealt. */
export function rungsFinish(s: RectState): boolean {
  let t = s;
  let fits = readFits(t);
  while (!isSolved(t)) {
    const f = nextFiring(t, fits);
    if (!f) return false;
    t = executeMove(t, moveOf(f));
    fits = fitsAfter(fits, t, f);
  }
  return true;
}

/** The move a firing makes. */
export function moveOf(f: RectFiring): RectMove {
  if (f.kind === "line") return { type: "edge", ...f.edge };
  return { type: "rect", erasing: false, ...f.rect };
}

function stepOf(s: RectState, f: RectFiring): HintStep<RectMove, RectHint, RectRung> {
  return narratedStep({
    move: moveOf(f),
    rung: f.kind,
    words: say.firing(s, f),
    highlights: null,
  });
}

/**
 * The plan from the player's lines to the end, a step per rectangle or line.
 * Stops where the rungs run out.
 */
export function rectHint(state: RectState): HintResult<RectMove, RectHint, RectRung> {
  const board = { s: state, fits: readFits(state) };
  const steps: HintStep<RectMove, RectHint, RectRung>[] = [];
  deduceHintPlan({
    board,
    status: (b) => isSolved(b.s),
    incomplete: false,
    next: (b) => nextFiring(b.s, b.fits),
    apply: (b, f) => {
      steps.push(stepOf(b.s, f));
      b.s = executeMove(b.s, moveOf(f));
      b.fits = fitsAfter(b.fits, b.s, f);
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
  step: HintStep<RectMove, RectHint, RectRung>,
  state: RectState,
): HintStep<RectMove, RectHint, RectRung> | null {
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
