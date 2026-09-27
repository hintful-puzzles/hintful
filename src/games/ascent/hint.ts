/**
 * Ascent's explained hint. Every step places one number.
 *
 * **Every fact a step rests on is a number, a wall or an arrow on the board.**
 * The solver reasons over a candidate bitmap the player has no way to note, and
 * over a second one of possible path links. Neither survives between steps
 * here: each technique rebuilds what it reads from the player's board, through
 * the solver's own rungs, and places the one number that reading forces.
 * `add-ascent-hint`'s design D1 measured that nothing more is ever needed
 * (docs/games/hints.md § "Give the facts a notation (Loopy)").
 *
 * The techniques, easiest first, and the rungs each is a projection of:
 *
 * - `touch`: a number must sit next to its placed neighbors in the sequence
 *   (`proximity-simple`, then `single-position`).
 * - `reach`: a number must be within as many steps of each placed number either
 *   side of it as they are apart (`proximity-full`, then `single-position`).
 * - `deadEnd`: a square the path can reach from one neighbor only is an end of
 *   the path. The solver reaches this through three of its path rungs
 *   (`update-path`, `adjacent-path`, `remove-endpoints`); the hint reads it off
 *   the numbers directly, which is how a player sees it.
 * - `only`: one missing number can reach a square (`single-number`, the Tricky
 *   form first, where that number's neighbor in the sequence is placed).
 * - `route`, `routeOnly`: the same two readings with reach counted along a
 *   route of empty squares, one step per number (`overlap`, to its fixpoint).
 */

import {
  type DeductionTechnique,
  singleFirings,
} from "../../engine/deduction-fixpoint.ts";
import type { HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import { DEDUCTION_EXHAUSTED } from "../../engine/hint-refusal.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { type Bound, type EndRuledOut, say } from "./hint-text.ts";
import { executeAscentMove } from "./moves.ts";
import {
  SolverScratch,
  solverOverlap,
  solverProximityFull,
  solverProximitySimple,
  solverSingleNumber,
  solverSinglePosition,
  solverStart,
} from "./solver.ts";
import {
  type AscentMove,
  type AscentState,
  CELL_NONE,
  DIFF_EASY,
  DIFF_HARD,
  DIFF_NORMAL,
  DIFF_TRICKY,
  fromNumberEdge,
  isBorderCell,
  isEdgeValid,
  isNumberEdge,
  MODE_EDGES,
  movementForMode,
  NUMBER_EMPTY,
  stepDistance,
  updatePositions,
} from "./state.ts";

/**
 * How far ahead the plan is computed: a UX bound, not a correctness one. A
 * player rarely follows more than a handful of steps before going their own
 * way, and the plan is recomputed then anyway.
 */
const PLAN_CAP = 24;

/** What one step marks. */
export interface AscentHighlights {
  /** The square the step fills, ringed. */
  target: number;
  /** The numbers and squares the reason rests on, outlined: a placed number
   * the sentence names, the arrow it reads, a dead end's one way in, the
   * squares a route may use. */
  area: number[];
  /** The line an arrow points along, when the sentence names it, striped. */
  hatch: number[];
}

type AscentStep = HintStep<AscentMove, AscentHighlights>;

/** Why a number goes where it does; the technique names are the module comment's. */
export type HintReason =
  | { kind: "touch" }
  | { kind: "reach" }
  | { kind: "deadEnd"; open: number }
  | { kind: "onlyBeside" }
  | { kind: "only" }
  | { kind: "route" }
  | { kind: "routeBeside" }
  | { kind: "routeOnly" };

/** One placement, with the board it was read from. */
export interface AscentFiring {
  reason: HintReason;
  n: number;
  cell: number;
  before: AscentState;
}

// --- reading the board -------------------------------------------------------

/** How far a reading counts reach from the placed numbers. */
type Reach = "touch" | "reach" | "route";

/**
 * The candidate bitmap the solver's own rungs build from the board alone:
 * every number may go in any empty square on its arrow's line, narrowed by
 * reach from the placed numbers. Built fresh for every question, so nothing it
 * holds outlives the board it was read from.
 */
function reading(state: AscentState, reach: Reach): SolverScratch {
  const sc = new SolverScratch(state.w, state.h, state.mode, state.last);
  solverStart(state.grid, sc);
  if (reach === "touch") solverProximitySimple(sc);
  else solverProximityFull(sc);
  if (reach === "route") while (solverOverlap(sc) > 0);
  sc.recording = true;
  return sc;
}

/** The squares a move away from `i`. */
function neighbors(state: AscentState, i: number): number[] {
  const { w, h } = state;
  const out: number[] = [];
  for (const { dx, dy } of movementForMode(state.mode).dirs) {
    const x = (i % w) + dx;
    const y = Math.trunc(i / w) + dy;
    if (x >= 0 && x < w && y >= 0 && y < h) out.push(y * w + x);
  }
  return out;
}

/** Where each number sits, `CELL_NONE` where it is missing. */
function positionsOf(state: AscentState): Int32Array {
  const s = state.w * state.h;
  const positions = new Int32Array(s);
  updatePositions(positions, state.grid, s);
  return positions;
}

/** What a technique found: the number, its square, and why. */
interface Found {
  reason: HintReason;
  n: number;
  cell: number;
}

/** Place with a placing rung over a reading, reporting the first placement. */
function placeBy(
  reason: HintReason,
  reach: Reach,
  rung: (sc: SolverScratch) => number,
): (state: AscentState) => Found | null {
  return (state) => {
    const sc = reading(state, reach);
    return rung(sc) > 0 && sc.placed ? { reason, ...sc.placed } : null;
  };
}

/**
 * A square the path can reach from only one neighbor must be an end of it. A
 * neighbor is still open to the path when it is empty, or holds a number with
 * a neighbor in the sequence not yet placed beside it; walls, arrows, and
 * numbers already joined on both sides are closed.
 */
function deadEnd(state: AscentState): Found | null {
  const { grid, last } = state;
  const sc = reading(state, "reach");
  const s = state.w * state.h;
  const placed = (m: number) => sc.positions[m] !== CELL_NONE;
  const joinsMore = (m: number) =>
    (m > 0 && !placed(m - 1)) || (m < last && !placed(m + 1));
  for (let c = 0; c < s; c++) {
    if (grid[c] !== NUMBER_EMPTY) continue;
    const open = neighbors(state, c).filter(
      (j) => grid[j] === NUMBER_EMPTY || (grid[j] >= 0 && joinsMore(grid[j])),
    );
    if (open.length !== 1) continue;
    const ends = [0, last].filter((n) => !placed(n) && sc.marks[c * s + n]);
    if (ends.length === 1)
      return { reason: { kind: "deadEnd", open: open[0] }, n: ends[0], cell: c };
  }
  return null;
}

/**
 * The tier a technique belongs to in `mode`: the tier of the solver rungs it
 * projects. Edges mode runs `overlap` from Normal up, so a route there comes
 * before the Tricky and Hard techniques.
 */
export function techniqueTier(kind: HintReason["kind"], mode: number): number {
  const edges = mode === MODE_EDGES;
  switch (kind) {
    case "touch":
      return DIFF_EASY;
    case "reach":
    case "deadEnd":
      return DIFF_NORMAL;
    case "onlyBeside":
      return DIFF_TRICKY;
    case "only":
    case "routeOnly":
      return DIFF_HARD;
    case "route":
      return edges ? DIFF_NORMAL : DIFF_HARD;
    case "routeBeside":
      return edges ? DIFF_TRICKY : DIFF_HARD;
  }
}

// --- the plan ----------------------------------------------------------------

/** The working board the plan advances. */
interface Board {
  state: AscentState;
  /** A step filled in more than its own square (a line the player drew). */
  spilled: boolean;
}

/**
 * The plan as firings: what `ascentHint` shows, and what a test reads to hold
 * each premise to the board it was shown on.
 *
 * No tier cap: a shared game ID carries no difficulty, and the ladder tries
 * the easiest techniques first, which is the order a hint wants anyway.
 */
export function ascentPlan(start: AscentState): AscentFiring[] {
  const board: Board = { state: start, spilled: false };
  let found: AscentFiring | null = null;
  const technique = (
    id: HintReason["kind"],
    find: (s: AscentState) => Found | null,
  ): DeductionTechnique => ({
    id,
    tier: techniqueTier(id, start.mode),
    run: () => {
      const f = find(board.state);
      if (!f) return 0;
      found = { ...f, before: board.state };
      return 1;
    },
  });
  const number = (simple: boolean) => (sc: SolverScratch) =>
    solverSingleNumber(sc, simple);
  const pass = singleFirings({
    // Easiest first; the sort is stable, so within a tier the order is as listed.
    techniques: [
      technique("touch", placeBy({ kind: "touch" }, "touch", solverSinglePosition)),
      technique("reach", placeBy({ kind: "reach" }, "reach", solverSinglePosition)),
      technique("deadEnd", deadEnd),
      technique("onlyBeside", placeBy({ kind: "onlyBeside" }, "reach", number(true))),
      technique("only", placeBy({ kind: "only" }, "reach", number(false))),
      technique("route", placeBy({ kind: "route" }, "route", solverSinglePosition)),
      technique("routeBeside", placeBy({ kind: "routeBeside" }, "route", number(true))),
      technique("routeOnly", placeBy({ kind: "routeOnly" }, "route", number(false))),
    ].sort((a, b) => a.tier - b.tier),
    budget: stepBudget("ascent hint"),
  });
  const { plan } = deduceHintPlan<Board, AscentFiring, "open" | "done">({
    board,
    // A step that spilled past its own square ends the plan: the numbers a
    // player's line filled in are theirs to vouch for, so the next hint reads
    // them afresh, after the mistake check has seen them.
    status: (b) => (b.state.completed || b.spilled ? "done" : "open"),
    incomplete: "open",
    next: () => {
      found = null;
      return pass.next() ? found : null;
    },
    apply: (b, f) => {
      const after = executeAscentMove(b.state, placeOf(f));
      b.spilled = after.grid.some((v, i) => v !== b.state.grid[i] && i !== f.cell);
      b.state = after;
    },
    planCap: PLAN_CAP,
  });
  return plan;
}

const placeOf = (f: AscentFiring): AscentMove => ({
  kind: "place",
  cell: f.cell,
  n: f.n,
});

export function ascentHint(
  state: AscentState,
): { ok: true; steps: AscentStep[] } | { ok: false; error: string } {
  const plan = ascentPlan(state);
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  return { ok: true, steps: plan.map(stepOf) };
}

// --- narrating a firing ------------------------------------------------------

/** The placed numbers nearest `n` below and above it, and where they sit. */
function bracket(state: AscentState, n: number) {
  const positions = positionsOf(state);
  let lo = n - 1;
  while (lo >= 0 && positions[lo] === CELL_NONE) lo--;
  let hi = n + 1;
  while (hi <= state.last && positions[hi] === CELL_NONE) hi++;
  return {
    below: lo >= 0 ? { m: lo, cell: positions[lo] } : null,
    above: hi <= state.last ? { m: hi, cell: positions[hi] } : null,
  };
}

/** The border square holding `n`'s arrow, or -1. */
function arrowOf(state: AscentState, n: number): number {
  const { grid } = state;
  for (let i = 0; i < grid.length; i++)
    if (isNumberEdge(grid[i]) && fromNumberEdge(grid[i]) === n) return i;
  return -1;
}

/** The squares inside the border along the line `arrow` points. */
function arrowLine(state: AscentState, arrow: number): number[] {
  const { w, h } = state;
  const out: number[] = [];
  for (let i = 0; i < w * h; i++)
    if (!isBorderCell(i, w, h) && isEdgeValid(arrow, i, w, h)) out.push(i);
  return out;
}

/** A placed number a premise measures from. */
interface Measured {
  m: number;
  cell: number;
  d: number;
}

/**
 * The empty squares within reach of every bound, and on `arrow`'s line when
 * there is one: a premise restated from the board alone, so a test can check
 * it singles out the square the step fills.
 */
export function squaresWithin(
  state: AscentState,
  bounds: readonly Measured[],
  arrow: number,
): number[] {
  const { w, h, grid, mode } = state;
  const out: number[] = [];
  for (let i = 0; i < w * h; i++) {
    if (grid[i] !== NUMBER_EMPTY) continue;
    if (arrow >= 0 && !isEdgeValid(arrow, i, w, h)) continue;
    if (bounds.every((b) => stepDistance(i, b.cell, w, mode) <= b.d)) out.push(i);
  }
  return out;
}

/**
 * The bounds a `touch` or `reach` firing measured `n` from: the placed numbers
 * either side of it, and for `touch` only a neighbor in the sequence.
 */
export function boundsOf(f: AscentFiring): Measured[] {
  const { n, before } = f;
  const { below, above } = bracket(before, n);
  const out: Measured[] = [];
  const touch = f.reason.kind === "touch";
  if (below && (!touch || below.m === n - 1)) out.push({ ...below, d: n - below.m });
  if (above && (!touch || above.m === n + 1)) out.push({ ...above, d: above.m - n });
  return out;
}

/** Whether `n`'s arrow is needed to single the square out, and where it is. */
function arrowNeeded(f: AscentFiring, bounds: readonly Measured[]): number {
  const arrow = arrowOf(f.before, f.n);
  if (arrow < 0) return -1;
  return squaresWithin(f.before, bounds, -1).length > 1 ? arrow : -1;
}

/** The squares the missing run around `n` may use, by the route reading. */
function routeSquares(f: AscentFiring): { lo: number; hi: number; squares: number[] } {
  const { n, before } = f;
  const { below, above } = bracket(before, n);
  const lo = below ? below.m + 1 : 0;
  const hi = above ? above.m - 1 : before.last;
  const sc = reading(before, "route");
  const s = before.w * before.h;
  const squares = new Set<number>();
  for (let k = lo; k <= hi; k++)
    for (let i = 0; i < s; i++) if (sc.marks[i * s + k]) squares.add(i);
  return { lo, hi, squares: [...squares].sort((a, b) => a - b) };
}

/**
 * Why the path's other end, `other`, cannot be at `cell`: it is placed, it is
 * out of reach of the placed numbers beside it, or its arrow points elsewhere.
 */
export function whyNotEnd(
  state: AscentState,
  other: number,
  cell: number,
): EndRuledOut {
  if (positionsOf(state)[other] !== CELL_NONE) return "placed";
  const f: AscentFiring = { reason: { kind: "reach" }, n: other, cell, before: state };
  return squaresWithin(state, boundsOf(f), -1).includes(cell) ? "arrow" : "reach";
}

/** The number shown on the board for `n`. */
const shown = (n: number) => n + 1;

/** The step a firing shows: its move, its sentence and its marks. */
export function stepOf(f: AscentFiring): AscentStep {
  const { n, cell, before } = f;
  const step = (explanation: string, area: number[], hatch: number[] = []) => ({
    move: placeOf(f),
    explanation,
    highlights: { target: cell, area, hatch },
  });
  switch (f.reason.kind) {
    case "touch":
    case "reach": {
      const bounds = boundsOf(f);
      const arrow = arrowNeeded(f, bounds);
      const area = bounds.map((b) => b.cell);
      if (arrow >= 0) area.push(arrow);
      const hatch = arrow >= 0 ? arrowLine(before, arrow) : [];
      const text =
        f.reason.kind === "touch"
          ? say.touch(
              shown(n),
              bounds.map((b) => shown(b.m)),
              arrow >= 0,
            )
          : say.reach(
              shown(n),
              bounds.map((b): Bound => ({ m: shown(b.m), d: b.d })),
              arrow >= 0,
            );
      return step(text, area, hatch);
    }
    case "deadEnd": {
      const other = n === 0 ? before.last : 0;
      return step(say.deadEnd(shown(n), shown(other), whyNotEnd(before, other, cell)), [
        f.reason.open,
      ]);
    }
    case "onlyBeside":
    case "routeBeside": {
      const positions = positionsOf(before);
      const beside = [n - 1, n + 1].find(
        (m) => m >= 0 && m <= before.last && positions[m] !== CELL_NONE,
      );
      if (beside === undefined)
        throw new Error("ascent hint: a single number with no placed neighbor");
      const text =
        f.reason.kind === "onlyBeside"
          ? say.only(shown(n), shown(beside))
          : say.routeOnly(shown(n), shown(beside));
      return step(text, [positions[beside]]);
    }
    case "only":
      return step(say.only(shown(n), null), []);
    case "route": {
      const { below, above } = bracket(before, n);
      const { lo, hi, squares } = routeSquares(f);
      const ends: number[] = [];
      if (below) ends.push(below.cell);
      if (above) ends.push(above.cell);
      return step(
        say.route(
          shown(n),
          shown(lo),
          shown(hi),
          below ? shown(below.m) : null,
          above ? shown(above.m) : null,
        ),
        [...ends, ...squares.filter((i) => i !== cell)],
      );
    }
    case "routeOnly":
      return step(say.routeOnly(shown(n), null), []);
  }
}

// --- following the plan ------------------------------------------------------

/** A step is followed by placing its number in its square, by any gesture. */
export function ascentKeepTrack(
  m: AscentMove,
  step: HintStep<AscentMove>,
): HintTrackVerdict {
  const want = step.move;
  if (want.kind !== "place" || m.kind !== "place") return "off";
  return m.cell === want.cell && m.n === want.n ? "completed" : "off";
}
