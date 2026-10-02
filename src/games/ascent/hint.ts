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
import { DEDUCTION_EXHAUSTED, type HintRefusal } from "../../engine/hint-refusal.ts";
import { type Sentence, StepMarks } from "../../engine/hint-words.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { findLines, findPointers, type RuledOut } from "./hint-edges.ts";
import {
  type Arrowed,
  type Bound,
  type Count,
  type EndRuledOut,
  GLANCE,
  type Near,
  type Others,
  type Rival,
  type RunEnds,
  SQUARE,
  say,
} from "./hint-text.ts";
import { executeAscentMove } from "./moves.ts";
import {
  lineKind,
  lineSquares,
  type Placed,
  type Premise,
  premisesOf,
  readBoard,
  squaresMeeting,
} from "./premises.ts";
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
  isEdgeValid,
  isNumberEdge,
  isSolved,
  MODE_EDGES,
  movementForMode,
  NUMBER_EMPTY,
  stepDistance,
} from "./state.ts";

/**
 * How far ahead the plan is computed: a UX bound, not a correctness one. A
 * player rarely follows more than a handful of steps before going their own
 * way, and the plan is recomputed then anyway.
 */
const PLAN_CAP = 24;

/** What one step stripes, as its words name it. */
export interface AscentHighlights {
  /** The line an arrow points along, a run's reach, or the squares no other
   * run reaches, when the sentence names them. */
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
  | { kind: "routeOnly" }
  /** Edges only: its own line and `premises` single the square out. */
  | { kind: "lines"; premises: Premise[] }
  /** Edges only: every other number that could stand here fails a premise;
   * `tier` is Tricky when `n` has a placed neighbor, as `single-number`'s
   * simple form asks, Hard otherwise. */
  | { kind: "pointers"; ruledOut: RuledOut[]; tier: number }
  /**
   * A whole run placed at once along its only route: `cells` in order, and
   * `must` the squares no other run reaches, when the route is only unique
   * because it has to take them. `tier` is that of the technique that began
   * the run, whose own deductions reach the same numbers.
   */
  | {
      kind: "wholeRun";
      cells: { cell: number; n: number }[];
      must: number[];
      /** The neighboring run, by its first number, when the route is the only
       * one leaving that run a way through the squares that remain. */
      room: number | null;
      /** Edges: the route is the only one because each number keeps to its
       * arrow's line; ignoring the arrows, there are more. */
      arrows: boolean;
      tier: number;
    };

/** One placement, with the board it was read from. */
export interface AscentFiring {
  reason: HintReason;
  n: number;
  cell: number;
  before: AscentState;
  /** It carries on the run the step before it began, as one journey. */
  joins: boolean;
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
const positionsOf = (state: AscentState): Int32Array => readBoard(state).positions;

/** What a technique found: the number, its square, and why. */
interface Found {
  reason: HintReason;
  n: number;
  cell: number;
}

/** The numbers of one run, when a technique is asked about that run alone. */
type Focus = { lo: number; hi: number } | null;

/** Find the next placement a technique makes, within `focus` when given. */
type Finder = (state: AscentState, focus: Focus) => Found | null;

/** Place with a placing rung over a reading, reporting the first placement. */
function placeBy(
  reason: HintReason,
  reach: Reach,
  rung: (sc: SolverScratch) => number,
): Finder {
  return (state, focus) => {
    const sc = reading(state, reach);
    sc.focus = focus;
    return rung(sc) > 0 && sc.placed ? { reason, ...sc.placed } : null;
  };
}

/**
 * A square the path can reach from only one neighbor must be an end of it. A
 * neighbor is still open to the path when it is empty, or holds a number with
 * a neighbor in the sequence not yet placed beside it; walls, arrows, and
 * numbers already joined on both sides are closed.
 */
function deadEnd(state: AscentState, focus: Focus): Found | null {
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
    const n = ends.length === 1 ? ends[0] : -1;
    if (n >= 0 && (!focus || (focus.lo <= n && n <= focus.hi)))
      return { reason: { kind: "deadEnd", open: open[0] }, n, cell: c };
  }
  return null;
}

const linesFinder: Finder = (state, focus) => {
  const f = findLines(state, focus);
  return f && { reason: { kind: "lines", premises: f.premises }, n: f.n, cell: f.cell };
};

/** `pointers` firings at or below `tier`. */
const pointersFinder =
  (tier: number): Finder =>
  (state, focus) => {
    const f = findPointers(state, focus);
    return f && f.tier <= tier
      ? {
          reason: { kind: "pointers", ruledOut: f.ruledOut, tier: f.tier },
          n: f.n,
          cell: f.cell,
        }
      : null;
  };

/**
 * The tier a technique belongs to in `mode`: the tier of the solver rungs it
 * projects. Edges mode runs `overlap` from Normal up, so a route there comes
 * before the Tricky and Hard techniques.
 */
function techniqueTier(
  kind: Exclude<HintReason["kind"], "wholeRun" | "pointers">,
  mode: number,
): number {
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
    case "lines":
      return edges ? DIFF_NORMAL : DIFF_HARD;
    case "routeBeside":
      return edges ? DIFF_TRICKY : DIFF_HARD;
  }
}

/** The tier a firing's reasoning belongs to in `mode`. */
export function firingTier(f: AscentFiring, mode: number): number {
  return f.reason.kind === "wholeRun" || f.reason.kind === "pointers"
    ? f.reason.tier
    : techniqueTier(f.reason.kind, mode);
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
  const number = (simple: boolean) => (sc: SolverScratch) =>
    solverSingleNumber(sc, simple);
  // Easiest first; the sort is stable, so within a tier the order is as listed.
  const tech = (
    kind: Exclude<HintReason["kind"], "wholeRun" | "pointers">,
    find: Finder,
  ) => ({
    kind,
    tier: techniqueTier(kind, start.mode),
    find,
  });
  // The Edges techniques are listed ahead of the run techniques of their
  // tier, which the stable sort keeps: on an Edges board the arrows decide
  // more than the runs do. On any other board they are absent.
  const edges = start.mode === MODE_EDGES;
  const ladder: { kind: HintReason["kind"]; tier: number; find: Finder }[] = [
    tech("touch", placeBy({ kind: "touch" }, "touch", solverSinglePosition)),
    tech("reach", placeBy({ kind: "reach" }, "reach", solverSinglePosition)),
    tech("deadEnd", deadEnd),
    ...(edges
      ? [
          tech("lines", linesFinder),
          {
            kind: "pointers" as const,
            tier: DIFF_TRICKY,
            find: pointersFinder(DIFF_TRICKY),
          },
          {
            kind: "pointers" as const,
            tier: DIFF_HARD,
            find: pointersFinder(DIFF_HARD),
          },
        ]
      : []),
    tech("onlyBeside", placeBy({ kind: "onlyBeside" }, "reach", number(true))),
    tech("only", placeBy({ kind: "only" }, "reach", number(false))),
    tech("route", placeBy({ kind: "route" }, "route", solverSinglePosition)),
    tech("routeBeside", placeBy({ kind: "routeBeside" }, "route", number(true))),
    tech("routeOnly", placeBy({ kind: "routeOnly" }, "route", number(false))),
  ].sort((a, b) => a.tier - b.tier);

  const board: Board = { state: start, spilled: false };
  let found: AscentFiring | null = null;
  const pass = singleFirings({
    techniques: ladder.map(
      ({ kind, tier, find }): DeductionTechnique => ({
        id: kind,
        tier,
        run: () => {
          const f = find(board.state, null);
          if (!f) return 0;
          found = { ...f, before: board.state, joins: false };
          return 1;
        },
      }),
    ),
    budget: stepBudget("ascent hint"),
  });

  // The rest of a run, when the step that began it lets it be finished there
  // and then: the same techniques, asked about that run alone and none harder
  // than the one that began it, so the journey teaches nothing above it.
  let following: Found[] = [];
  const followRun = (f: AscentFiring): Found[] => {
    const run = runsOf(f.before).find((r) => r.lo <= f.n && f.n <= r.hi);
    if (!run || run.lo === run.hi) return [];
    const focus = { lo: run.lo, hi: run.hi };
    const cap = firingTier(f, start.mode);
    const out: Found[] = [];
    let state = executeAscentMove(f.before, placeOf(f));
    for (let left = run.hi - run.lo; left > 0; left--) {
      let next: Found | null = null;
      for (const t of ladder) {
        if (t.tier > cap) continue;
        next = t.find(state, focus);
        if (next) break;
      }
      if (!next) return [];
      const after = executeAscentMove(state, placeOf(next));
      if (after.grid.some((v, i) => v !== state.grid[i] && i !== next.cell)) return [];
      out.push(next);
      state = after;
    }
    return out;
  };

  const { plan } = deduceHintPlan<Board, AscentFiring, "open" | "done">({
    board,
    // A step that spilled past its own square ends the plan: the numbers a
    // player's line filled in are theirs to vouch for, so the next hint reads
    // them afresh, after the mistake check has seen them.
    status: (b) => (b.spilled || isSolved(b.state) ? "done" : "open"),
    incomplete: "open",
    next: () => {
      const queued = following.shift();
      if (queued) return { ...queued, before: board.state, joins: true };
      found = null;
      if (!pass.next() || !found) return null;
      // When the run has only one route that leaves no gap, it is one
      // deduction, and the player's (owner, 2026-09-27): say that, once.
      const whole = wholeRun(found, firingTier(found, start.mode));
      if (whole) return whole;
      following = followRun(found);
      return found;
    },
    apply: (b, f) => {
      const after = executeAscentMove(b.state, moveOf(f));
      const own = new Set(cellsOf(f));
      b.spilled = after.grid.some((v, i) => v !== b.state.grid[i] && !own.has(i));
      b.state = after;
    },
    planCap: PLAN_CAP,
  });
  // The cap never ends a plan partway through a run it is following.
  for (const f of following) {
    if (board.spilled || isSolved(board.state)) break;
    const firing = { ...f, before: board.state, joins: true };
    plan.push(firing);
    const after = executeAscentMove(board.state, placeOf(firing));
    board.spilled = after.grid.some(
      (v, i) => v !== board.state.grid[i] && i !== f.cell,
    );
    board.state = after;
  }
  return plan;
}

const placeOf = (f: { cell: number; n: number }): AscentMove => ({
  kind: "place",
  cell: f.cell,
  n: f.n,
});

/** The move a firing's step makes: a whole run at once, or one number. */
export function moveOf(f: AscentFiring): AscentMove {
  return f.reason.kind === "wholeRun"
    ? { kind: "places", cells: f.reason.cells }
    : placeOf(f);
}

/** The squares a firing fills. */
function cellsOf(f: AscentFiring): number[] {
  return f.reason.kind === "wholeRun" ? f.reason.cells.map((c) => c.cell) : [f.cell];
}

/**
 * The whole run `first` belongs to as one step, when the run has exactly one
 * route: through the empty squares at all, or through every square no other
 * run can reach, which would otherwise be left empty. Checked by counting the
 * routes, and the route must put `first` where the ladder did; `null` when
 * there is more than one.
 *
 * `tier` is the ladder technique's that found `first`. The route count is not
 * a solver rung, so a Tricky board may meet it where its own techniques would
 * have placed the run a number at a time; the owner prefers it there, as the
 * way a player sees the run (2026-09-27).
 */
function wholeRun(first: AscentFiring, tier: number): AscentFiring | null {
  const { before } = first;
  const run = runsOf(before).find((r) => r.lo <= first.n && first.n <= r.hi);
  if (!run || run.lo === run.hi || run.hi - run.lo + 1 > WHOLE_RUN_MAX) return null;
  // The one route, if there is one; it must agree with the step that began it.
  const one = (must: number[]) => {
    const routes = runRoutes(before, run, must);
    const route = routes !== null && routes.length === 1 ? routes[0] : null;
    return route && route[first.n - run.lo] === first.cell ? route : null;
  };
  let must: number[] = [];
  let room: number | null = null;
  let route = one(must);
  if (!route) {
    must = mustVisit(before, run);
    route = must.length > 0 ? one(must) : null;
  }
  if (!route) {
    must = [];
    const left = leavesRoom(before, run);
    if (left && left.route[first.n - run.lo] === first.cell) {
      route = left.route;
      room = left.other.lo;
    }
  }
  if (!route) return null;
  // Say the arrows decide it only when a count without them finds another
  // route; a count that gave up has shown nothing either way.
  const loose =
    before.mode === MODE_EDGES && room === null
      ? runRoutes(before, run, must, 2, false)
      : null;
  const arrows = loose !== null && loose.length > 1;
  const cells = route.map((cell, k) => ({ cell, n: run.lo + k }));
  return {
    reason: { kind: "wholeRun", cells, must, room, arrows, tier },
    n: first.n,
    cell: first.cell,
    before,
    joins: false,
  };
}

/** How many of a run's routes the gap check will weigh one by one. */
const ROOM_ROUTES_MAX = 24;

/**
 * The one route for `run` that leaves a neighboring run a way through, when
 * every other route would leave it none: the gap a player sees when a run
 * turned the wrong way would strand the squares another run needs. The other
 * run is one whose reach meets a square of this run's routes; it needs only
 * *a* route in the squares left, so the claim is exactly that the rest leave it
 * none. `null` when no single run makes the choice, or when the routes are too
 * many to weigh.
 */
function leavesRoom(
  state: AscentState,
  run: Run,
): { route: number[]; other: Run } | null {
  const routes = runRoutes(state, run, [], ROOM_ROUTES_MAX + 1);
  if (!routes || routes.length < 2 || routes.length > ROOM_ROUTES_MAX) return null;
  const squares = new Set(routes.flat());
  const neighbors = runsOf(state).filter(
    (r) =>
      r.lo !== run.lo &&
      r.hi - r.lo + 1 <= WHOLE_RUN_MAX &&
      [...squares].some((c) => runShortfall(state, r, c) <= 0),
  );
  for (const other of neighbors) {
    const fits = routes.filter((route) => {
      const grid = state.grid.slice();
      route.forEach((c, k) => {
        grid[c] = run.lo + k;
      });
      const found = runRoutes({ ...state, grid }, other, [], 1);
      return found === null || found.length > 0;
    });
    // `null` above counts as fitting: a search that gave up has shown nothing.
    if (fits.length === 1) return { route: fits[0], other };
  }
  return null;
}

export function ascentHint(
  state: AscentState,
): { ok: true; steps: AscentStep[] } | { ok: false; error: HintRefusal } {
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
const arrowOf = (state: AscentState, n: number): number => readBoard(state).arrows[n];

/**
 * The placed numbers a `touch` or `reach` firing measured `n` from: those
 * either side of it, and for `touch` only a neighbor in the sequence.
 */
export function boundsOf(f: AscentFiring): Placed[] {
  const touch = f.reason.kind === "touch";
  return premisesOf(readBoard(f.before), f.n).filter(
    (p): p is Placed => p.cell !== null && (!touch || p.d === 1),
  );
}

/** Whether `n`'s arrow is needed to single the square out, and where it is. */
function arrowNeeded(f: AscentFiring, bounds: readonly Placed[]): number {
  const b = readBoard(f.before);
  const arrow = b.arrows[f.n];
  if (arrow < 0) return -1;
  return squaresMeeting(b, -1, bounds).length > 1 ? arrow : -1;
}

/**
 * The run of missing numbers `n` belongs to: `lo` to `hi`, the placed numbers
 * either side of it (absent at an end of the path), their squares, and every
 * square the run's numbers may use by `reach`.
 */
function runOf(f: AscentFiring, reach: Reach) {
  const { n, before } = f;
  const { below, above } = bracket(before, n);
  const lo = below ? below.m + 1 : 0;
  const hi = above ? above.m - 1 : before.last;
  const sc = reading(before, reach);
  const s = before.w * before.h;
  const squares = new Set<number>();
  for (let k = lo; k <= hi; k++)
    for (let i = 0; i < s; i++) if (sc.marks[i * s + k]) squares.add(i);
  const ends: number[] = [];
  if (below) ends.push(below.cell);
  if (above) ends.push(above.cell);
  return {
    lo,
    hi,
    below: below ? below.m : null,
    above: above ? above.m : null,
    ends,
    squares: [...squares].sort((a, b) => a - b),
  };
}

/** A run of missing numbers, `lo` to `hi`, and the placed numbers either side. */
interface Run {
  lo: number;
  hi: number;
  a: { m: number; cell: number } | null;
  b: { m: number; cell: number } | null;
}

/** Every run of missing numbers on the board. */
export function runsOf(state: AscentState): Run[] {
  const positions = positionsOf(state);
  const at = (m: number) => ({ m, cell: positions[m] });
  const out: Run[] = [];
  for (let n = 0; n <= state.last; n++) {
    if (positions[n] !== CELL_NONE) continue;
    const lo = n;
    while (n + 1 <= state.last && positions[n + 1] === CELL_NONE) n++;
    out.push({
      lo,
      hi: n,
      a: lo > 0 ? at(lo - 1) : null,
      b: n < state.last ? at(n + 1) : null,
    });
  }
  return out;
}

/**
 * How many steps too far `cell` is for any number of `run` to stand on, by
 * straight reach: a number there must be within as many steps of each end as
 * they are apart, so the steps to both ends together may be at most the gap.
 * At most zero means the run reaches it.
 */
export function runShortfall(state: AscentState, run: Run, cell: number): number {
  const { w, mode } = state;
  const d = (end: { cell: number }) => stepDistance(cell, end.cell, w, mode);
  if (run.a && run.b) return d(run.a) + d(run.b) - (run.b.m - run.a.m);
  if (run.a) return d(run.a) - (run.hi - run.a.m);
  if (run.b) return d(run.b) - (run.b.m - run.lo);
  return Number.NEGATIVE_INFINITY;
}

/** A way to say why only `n` can fill its square. */
interface Fill {
  others: Others;
  counts: Count[];
}

/** A run's placed ends, as a sentence names them. */
const endsOf = (r: Run): RunEnds => ({
  from: r.a ? shown(r.a.m) : null,
  to: r.b ? shown(r.b.m) : null,
  cells: [r.a, r.b].flatMap((e) => (e ? [e.cell] : [])),
});

/**
 * The "only this number can fill it" reasons that can be said plainly, most
 * helpful first: the one other run that comes within two steps and why it
 * fails (or that none does), then, when several come close, only that none
 * reaches the square; each with the step counts to the run's own ends that
 * rule out its other numbers. Empty when a rival is ruled out by more than
 * straight reach, or when the counts alone do not single the number out; the
 * step then stripes the run's reach instead. A run of one number has no counts
 * to say, so its striped reach, two or three squares, is the better picture
 * than an unnamed "no other run".
 */
function fillReasons(f: AscentFiring): Fill[] {
  const { n, cell, before } = f;
  const { w, mode } = before;
  const runs = runsOf(before);
  const own = runs.find((r) => r.lo <= n && n <= r.hi);
  if (!own) return [];

  const shortfalls = runs
    .filter((r) => r !== own)
    .map((r) => ({ r, by: runShortfall(before, r, cell) }));
  if (shortfalls.some(({ by }) => by <= 0)) return [];

  const counts: Count[] = [];
  if (n > own.lo) {
    const a = own.a;
    if (!a || a.m + stepDistance(cell, a.cell, w, mode) !== n) return [];
    counts.push({ m: shown(a.m), d: n - a.m, cell: a.cell, side: "lower" });
  }
  if (n < own.hi) {
    const b = own.b;
    if (!b || b.m - stepDistance(cell, b.cell, w, mode) !== n) return [];
    counts.push({ m: shown(b.m), d: b.m - n, cell: b.cell, side: "higher" });
  }

  const out: Fill[] = [];
  const close = shortfalls.filter(({ by }) => by <= 2);
  if (close.length === 0) out.push({ others: { kind: "none" }, counts });
  if (close.length === 1) {
    const r = close[0].r;
    const ends = [r.a, r.b].filter((e) => e !== null);
    const others: Rival =
      r.lo === r.hi
        ? {
            kind: "one",
            run: endsOf(r),
            need: ends
              .filter((e) => stepDistance(cell, e.cell, w, mode) > 1)
              .map((e) => shown(e.m)),
          }
        : { kind: "run", run: endsOf(r) };
    out.push({ others, counts });
  }
  if (close.length > 0 && counts.length > 0)
    out.push({ others: { kind: "unnamed" }, counts });
  return out;
}

/**
 * The empty squares only `run` can reach, by straight reach: every other run
 * falls short of each. Nothing but this run can fill them, so its route must
 * take them all.
 */
function mustVisit(state: AscentState, run: Run): number[] {
  const others = runsOf(state).filter((r) => r.lo !== run.lo);
  const out: number[] = [];
  for (let c = 0; c < state.grid.length; c++) {
    if (state.grid[c] !== NUMBER_EMPTY) continue;
    if (runShortfall(state, run, c) > 0) continue;
    if (others.every((r) => runShortfall(state, r, c) > 0)) out.push(c);
  }
  return out;
}

/** The longest run a step places whole: past it a unique route is rare, and a
 * sentence claiming one would ask the player to check too much. */
const WHOLE_RUN_MAX = 8;

/** Past this many search steps a route count gives up, and says "not one". */
const ROUTE_SEARCH_LIMIT = 200_000;

/**
 * The routes `run` could take through empty squares, one square per number,
 * from the placed number at one end to the one at the other, taking in every
 * square of `must`, and in Edges mode keeping each number on its arrow's line.
 * Stops at `limit`: two answers "is there exactly one?", more lists them all
 * when there are few. `null` when the search gives up first. Without
 * `onArrows`, the arrows are ignored: whether they are what makes a route the
 * only one.
 */
function runRoutes(
  state: AscentState,
  run: Run,
  must: readonly number[],
  limit = 2,
  onArrows = true,
): number[][] | null {
  const { w, h, grid } = state;
  const len = run.hi - run.lo + 1;
  // Walk from a placed end; with none, there is nothing to anchor a route to.
  const forward = run.a !== null;
  const anchor = run.a ?? run.b;
  if (!anchor) return null;
  const numberAt = (k: number) => (forward ? run.lo + k : run.hi - k);
  const far = forward ? run.b : run.a;
  const arrows = new Map<number, number>();
  if (onArrows)
    grid.forEach((v, i) => {
      if (isNumberEdge(v)) arrows.set(fromNumberEdge(v), i);
    });
  const mustSet = new Set(must);
  const found: number[][] = [];
  const path: number[] = [];
  const used = new Set<number>();
  let steps = 0;
  const dfs = (from: number, k: number): boolean => {
    if (++steps > ROUTE_SEARCH_LIMIT) return false;
    if (k === len) {
      if (far && stepDistance(from, far.cell, w, state.mode) !== 1) return true;
      if ([...mustSet].some((c) => !used.has(c))) return true;
      found.push(forward ? [...path] : [...path].reverse());
      return found.length < limit;
    }
    // A square must still be able to reach the far end in the numbers left.
    for (const c of neighbors(state, from)) {
      if (grid[c] !== NUMBER_EMPTY || used.has(c)) continue;
      const arrow = arrows.get(numberAt(k));
      if (arrow !== undefined && !isEdgeValid(arrow, c, w, h)) continue;
      if (far && stepDistance(c, far.cell, w, state.mode) > len - k) continue;
      path.push(c);
      used.add(c);
      const go = dfs(c, k + 1);
      path.pop();
      used.delete(c);
      if (!go) return false;
    }
    return true;
  };
  const finished = dfs(anchor.cell, 0);
  if (!finished && found.length < limit) return null;
  return found;
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
  const f: AscentFiring = {
    reason: { kind: "reach" },
    n: other,
    cell,
    before: state,
    joins: false,
  };
  return squaresMeeting(readBoard(state), -1, boundsOf(f)).includes(cell)
    ? "arrow"
    : "reach";
}

/** The number shown on the board for `n`. */
const shown = (n: number) => n + 1;

/** An arrow as a sentence names it, with its line when the step stripes it. */
const arrowed = (state: AscentState, arrow: number, striped: boolean): Arrowed => ({
  kind: lineKind(state, arrow),
  arrow,
  line: striped ? lineSquares(state, arrow) : null,
});

/** An Edges premise as a sentence names it: a placed number, or a missing
 * one's arrow and its striped line. */
const nearOf = (state: AscentState, p: Premise): Near => ({
  m: shown(p.m),
  d: p.d,
  cell: p.cell ?? -1,
  line: p.arrow === null ? null : arrowed(state, p.arrow, true),
});

/** The step a firing shows: its move, its sentence and its marks. */
export function stepOf(f: AscentFiring): AscentStep {
  const { n, cell, before } = f;
  const at = cellsOf(f);
  const step = (words: Sentence): AscentStep => ({
    move: moveOf(f),
    explanation: words.text,
    words,
    highlights: { hatch: [...StepMarks.of(words).of("stripes", SQUARE)] },
    ...(f.joins ? { continuesPrevious: true } : {}),
  });
  /** A run of `runOf`'s, as a sentence names it. */
  const runEnds = (run: ReturnType<typeof runOf>): RunEnds => ({
    from: run.below === null ? null : shown(run.below),
    to: run.above === null ? null : shown(run.above),
    cells: run.ends,
  });
  switch (f.reason.kind) {
    case "wholeRun": {
      const run = runsOf(before).find((r) => r.lo <= n && n <= r.hi);
      if (!run) throw new Error("ascent hint: a whole run that is not a run");
      const path = f.reason.cells.map((c) => c.cell);
      const { room } = f.reason;
      const other =
        room === null ? null : (runsOf(before).find((r) => r.lo === room) ?? null);
      // The arrows that keep the run to its route, when they are the reason.
      const arrows = f.reason.arrows
        ? f.reason.cells.map(({ n: m }) => arrowOf(before, m)).filter((a) => a >= 0)
        : null;
      const route = [
        ...(run.a ? [run.a.cell] : []),
        ...path,
        ...(run.b ? [run.b.cell] : []),
      ];
      // The neighboring run the route leaves room for is named by its ends,
      // so they are outlined too.
      const words = say.wholeRun(
        endsOf(run),
        route,
        other
          ? { kind: "room", run: endsOf(other) }
          : f.reason.must.length > 0
            ? { kind: "must", squares: f.reason.must }
            : { kind: "plain" },
        arrows,
      );
      return step(words);
    }
    case "touch":
    case "reach": {
      const bounds = boundsOf(f);
      const arrow = arrowNeeded(f, bounds);
      const line = arrow >= 0 ? arrowed(before, arrow, true) : null;
      const shownBounds = bounds.map(
        (b): Bound => ({ m: shown(b.m), d: b.d, cell: b.cell }),
      );
      return step(
        f.reason.kind === "touch"
          ? say.touch(at, shown(n), shownBounds, line)
          : say.reach(at, shown(n), shownBounds, line),
      );
    }
    case "lines": {
      const own = arrowOf(before, n);
      // Its own line is named by its outlined arrow; the lines it must be
      // near are striped, so the square is where they cross it.
      return step(
        say.lines(
          at,
          shown(n),
          own >= 0 ? arrowed(before, own, false) : null,
          f.reason.premises.map((p) => nearOf(before, p)),
        ),
      );
    }
    case "pointers": {
      // Every arrow pointing here is outlined, the rivals' reasons with them.
      return step(
        say.pointers(
          at,
          shown(n),
          arrowOf(before, n),
          f.reason.ruledOut.map((o) => ({
            m: shown(o.m),
            arrow: o.arrowless ? -1 : arrowOf(before, o.m),
            by: nearOf(before, o.by),
          })),
        ),
      );
    }
    case "deadEnd": {
      const other = n === 0 ? before.last : 0;
      return step(
        say.deadEnd(
          at,
          f.reason.open,
          shown(n),
          shown(other),
          whyNotEnd(before, other, cell),
        ),
      );
    }
    case "onlyBeside":
    case "only":
    case "routeBeside":
    case "routeOnly": {
      // Say the reason in words when it fits at a glance: the counts are what
      // single the number out of its run, which the stripes cannot show.
      for (const fill of fillReasons(f)) {
        const said = say.fill(at, shown(n), fill.others, fill.counts);
        if (said.text.length <= GLANCE) return step(said);
      }
      // Otherwise the square is in one run's reach and no other's: stripe that
      // reach and outline the run's ends, so the run the sentence names is on
      // the board beside the others the player can compare it with.
      const byRoute = f.reason.kind === "routeBeside" || f.reason.kind === "routeOnly";
      const run = runOf(f, byRoute ? "route" : "reach");
      return step(
        say.onlyRun(
          at,
          shown(n),
          run.lo === run.hi,
          runEnds(run),
          run.squares,
          byRoute,
        ),
      );
    }
    case "route": {
      const run = runOf(f, "route");
      return step(
        say.route(
          at,
          shown(n),
          runEnds(run),
          run.squares.filter((i) => i !== cell),
        ),
      );
    }
  }
}

// --- following the plan ------------------------------------------------------

/** A step is followed by placing its numbers in their squares, by any gesture. */
export function ascentKeepTrack(
  m: AscentMove,
  step: HintStep<AscentMove>,
): HintTrackVerdict {
  const want = step.move;
  if (want.kind === "place")
    return m.kind === "place" && m.cell === want.cell && m.n === want.n
      ? "completed"
      : "off";
  if (want.kind !== "places") return "off";
  // A whole run: the hint's own move takes it all; a player places it a number
  // at a time, in any order, and the step shrinks to what is left.
  const same = (a: { cell: number; n: number }, b: { cell: number; n: number }) =>
    a.cell === b.cell && a.n === b.n;
  if (m.kind === "places")
    return m.cells.length === want.cells.length &&
      m.cells.every((c) => want.cells.some((w) => same(c, w)))
      ? "completed"
      : "off";
  if (m.kind !== "place" || !want.cells.some((w) => same(w, m))) return "off";
  const left = want.cells.filter((w) => !same(w, m));
  if (left.length === 0) return "completed";
  step.move = { kind: "places", cells: left };
  return "onTrack";
}
