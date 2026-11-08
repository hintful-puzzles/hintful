/**
 * Pearl's explained hint: the ladder `pearl.description.yaml` states, walked
 * one firing a step from the player's lines and crosses (`ladderWalk`), and
 * the sentence and the picture each firing's binding gives.
 *
 * **Every fact a step rests on is an edge or a pearl**, since those are all
 * the ladder reads: a square's ways through are read off its edges whenever
 * a technique asks, so nothing struck from a square outlives the edges that
 * struck it.
 */

import { EDGE } from "../../engine/edge-hint.ts";
import type { HintStep } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  DEDUCTION_EXHAUSTED,
  type HintRefusal,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { trackTargets } from "../../engine/hint-track.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { ladderWalk, type Taken, TIERS } from "../../engine/ladder-runtime.ts";
import {
  bitDirection,
  D,
  DIRECTIONS,
  dirX,
  dirY,
  L,
  opposite,
  R,
  squareEdges,
  U,
} from "../../engine/square-edges.ts";
import {
  type Axis,
  type LeftOut,
  type Marked,
  type NoStraight,
  say,
} from "./hint-text.ts";
import { executeMove } from "./moves.ts";
import type * as pearl from "./pearl.compiled.ts";
import {
  type Fired,
  LINE,
  ladderOf,
  marksOn,
  NONE,
  type PearlGeometry,
  sideEdge,
} from "./solver.ts";
import {
  CORNER,
  NOCLUE,
  type PearlMove,
  type PearlOp,
  type PearlState,
  STRAIGHT,
} from "./state.ts";

/**
 * How far ahead the plan is computed: a UX bound, not a correctness one. A
 * player rarely follows more than a handful of steps before going their own
 * way, and the plan is recomputed then anyway; it also keeps `hint()` cheap
 * enough for the cross-game resume walk, which asks after every move.
 */
const PLAN_CAP = 24;

/** An edge a step decides: the side of square `sq` toward `dir` (`R` or `D`,
 * so each edge has one name), and whether it carries the line. */
export interface PearlEdgeOp {
  sq: number;
  dir: number;
  line: boolean;
}

/** What one step plans. */
export interface PearlHint {
  /** Edges the step decides, and whether each must carry the line. */
  targets: PearlEdgeOp[];
}

/**
 * Why one firing holds, as its sentence tells it, read off the technique's
 * binding. Squares are cell indices (`y * w + x`); a direction is a single
 * `R`/`U`/`L`/`D` bit.
 */
export type PearlReason =
  /** A square's pearl and edges leave it one way to take some edge. */
  | { kind: "square"; sq: number }
  /** A black pearl's line runs straight through the next square along `dir`. */
  | { kind: "blackRunsOn"; pearl: number; dir: number }
  /** ...and it cannot here, so the pearl's side toward `dir` is ruled out. */
  | { kind: "blackCannotRunOn"; pearl: number; dir: number }
  /** A white pearl cannot run along `axis` (`R` across, `U` up and down),
   * because neither square beside it that way can turn into it. */
  | { kind: "whiteCannotTurn"; pearl: number; axis: number }
  /** A white pearl's line runs straight on through the square toward `dir`, so
   * it must turn in the square on the other side. */
  | { kind: "whiteTurnsOpposite"; pearl: number; dir: number }
  /** The edge from `sq` toward `dir` would close the lines through `piece`
   * into a loop that leaves something out. */
  | { kind: "closesEarly"; sq: number; dir: number; piece: number[] }
  /** Taking `shape` would join `sq` to both ends of `piece`, with the same
   * result. */
  | { kind: "closesEarlyThrough"; sq: number; shape: number; piece: number[] };

/** A board as the hint reads it: its pearls, its tiling, and its edges as
 * the walk's marks hold them (0 open, `LINE`, `NONE`). */
interface View {
  readonly w: number;
  readonly h: number;
  readonly clues: Uint8Array;
  readonly g: PearlGeometry;
  readonly grid: Uint8Array | Int8Array;
}

/** One firing on the hint path. */
interface PearlFiring {
  /** Why it holds; `null` for the closed loop, which only confirms. */
  reason: PearlReason | null;
  /** The edges it decided. */
  ops: PearlEdgeOp[];
  /** The edges just before it fired, which is what its sentence describes. */
  before: Uint8Array;
}

/** A line a pearl's rule carries on from a line the step draws: through the
 * square past a black pearl, or out through a white one. */
interface Carried {
  op: PearlEdgeOp;
  rule: "black" | "white";
}

/** A firing with the edges it asks the player for: all it decided and the
 * lines the pearls carry on from it, less the crosses beside a square that
 * already has two lines. */
interface ShownFiring extends PearlFiring {
  shown: PearlEdgeOp[];
  carried: Carried[];
}

// --- reading the edges ----------------------------------------------------

/** Edge states as the narration reads them: 1 a line, 2 ruled out (or the
 * board's edge), 3 unknown. */
function edgeState(v: View, grid: ArrayLike<number>, sq: number, d: number): number {
  const e = sideEdge(v.g, sq, d);
  if (e < 0) return 2;
  return grid[e] === 0 ? 3 : grid[e];
}

function onBoard(v: View, sq: number, d: number): boolean {
  return sideEdge(v.g, sq, d) >= 0;
}

const step = (v: { w: number }, sq: number, d: number): number =>
  sq + dirY(d) * v.w + dirX(d);

function linesAt(v: View, grid: ArrayLike<number>, sq: number): number {
  let n = 0;
  for (const d of DIRECTIONS) if (edgeState(v, grid, sq, d) === 1) n++;
  return n;
}

const axisOf = (d: number): Axis => (d === R || d === L ? "across" : "upDown");
const otherAxis = (a: Axis): Axis => (a === "across" ? "upDown" : "across");

/** The edge `e` as an op of the given value. */
function opOf(g: PearlGeometry, e: number, line: boolean): PearlEdgeOp {
  return { sq: g.edgeSquare[e], dir: g.edgeSide[e], line };
}

/** The direction edge `e` leaves square `sq` by. */
function dirOf(v: View, sq: number, e: number): number {
  const d = DIRECTIONS.find((x) => sideEdge(v.g, sq, x) === e);
  if (d === undefined) throw new Error(`pearl hint: edge ${e} is no side of ${sq}`);
  return d;
}

/** The op's edge as seen from square `sq`: the direction it leaves `sq` by, or
 * 0 when it is not one of `sq`'s edges. */
function dirFrom(v: { w: number }, op: PearlEdgeOp, sq: number): number {
  if (op.sq === sq) return op.dir;
  if (step(v, op.sq, op.dir) === sq) return opposite(op.dir);
  return 0;
}

/** The squares the lines in `grid` join to `sq`, in reading order. */
function pieceOf(v: View, grid: ArrayLike<number>, sq: number): number[] {
  const seen = new Set([sq]);
  const work = [sq];
  for (let c = work.pop(); c !== undefined; c = work.pop())
    for (const d of DIRECTIONS)
      if (edgeState(v, grid, c, d) === 1) {
        const n = step(v, c, d);
        if (!seen.has(n)) {
          seen.add(n);
          work.push(n);
        }
      }
  return [...seen].sort((a, b) => a - b);
}

/** Does anything a closed loop through `piece` (and `also`) would leave out
 * hold a pearl? Otherwise what it leaves out is lines: the technique fires
 * only when it leaves out a pearl or a line. */
function leftOut(v: View, piece: readonly number[], also: number | null): LeftOut {
  const on = new Set(piece);
  if (also !== null) on.add(also);
  for (let c = 0; c < v.w * v.h; c++)
    if (!on.has(c) && v.clues[c] !== NOCLUE) return "pearl";
  return "lines";
}

/**
 * The firing's premise, as the narration names it, from its technique's
 * binding on the edges before it fired. `null` for the closed loop.
 */
function reasonOf(v: View, fired: Fired, before: Uint8Array): PearlReason | null {
  const b = fired.b;
  const c = b["c"] as number;
  const e = b["e"] as number;
  switch (fired.kind) {
    case "square":
    case "blackPearl":
      return { kind: "square", sq: c };
    case "blackRunsOn":
      return { kind: "blackRunsOn", pearl: c, dir: dirOf(v, c, e) };
    case "blackCannotRunOn":
      return { kind: "blackCannotRunOn", pearl: c, dir: dirOf(v, c, e) };
    case "whiteCannotTurn": {
      const d = dirOf(v, c, e);
      return { kind: "whiteCannotTurn", pearl: c, axis: d === L || d === R ? R : U };
    }
    case "whiteTurnsOpposite":
      return { kind: "whiteTurnsOpposite", pearl: c, dir: dirOf(v, c, e) };
    case "closed":
      return null;
    case "earlyLoop":
      return {
        kind: "closesEarly",
        sq: v.g.edgeSquare[e],
        dir: v.g.edgeSide[e],
        piece: pieceOf(v, before, v.g.edgeSquare[e]),
      };
    case "earlyThrough": {
      // The way through it rules out: two of its open edges into one piece.
      const open = DIRECTIONS.filter((d) => edgeState(v, before, c, d) === 3);
      for (const [i, x] of open.entries())
        for (const y of open.slice(i + 1)) {
          const piece = pieceOf(v, before, step(v, c, x));
          if (piece.includes(step(v, c, y)))
            return { kind: "closesEarlyThrough", sq: c, shape: x | y, piece };
        }
      throw new Error(`pearl hint: earlyThrough at ${c} joins no piece`);
    }
  }
}

/**
 * The squares a firing's premise reads, which a hint plan continues from:
 * the square it reads, the pearl and the squares beside it its rule looks
 * along, or the piece of line it would close.
 */
function premise(v: View, r: PearlReason): number[] {
  const at = (cell: number, d: number, k: number): number[] => {
    const x = (cell % v.w) + k * dirX(d);
    const y = ((cell / v.w) | 0) + k * dirY(d);
    return x >= 0 && y >= 0 && x < v.w && y < v.h ? [y * v.w + x] : [];
  };
  switch (r.kind) {
    case "square":
      return [r.sq];
    case "blackRunsOn":
    case "blackCannotRunOn":
      return [r.pearl, ...at(r.pearl, r.dir, 1), ...at(r.pearl, r.dir, 2)];
    case "whiteCannotTurn":
      return [r.pearl, ...at(r.pearl, r.axis, 1), ...at(r.pearl, r.axis, -1)];
    case "whiteTurnsOpposite":
      return [r.pearl, ...at(r.pearl, r.dir, 1), ...at(r.pearl, r.dir, -1)];
    case "closesEarly":
      return [r.sq, ...at(r.sq, r.dir, 1), ...r.piece];
    case "closesEarlyThrough":
      return [r.sq, ...r.piece];
  }
}

/**
 * Draw, on the working board, every line the pearls' own rules carry on from
 * the lines in `ops`, and the lines those carry on in turn: a line leaving a
 * black pearl runs straight through the next square, and a line entering a
 * white pearl leaves by its opposite edge. They go in the same step because
 * they are the rules, not deductions, and asking for them one at a time costs
 * the player steps that teach nothing (owner, 2026-09-27).
 */
function carryOn(
  v: View,
  draw1: (e: number) => void,
  ops: readonly PearlEdgeOp[],
): Carried[] {
  const carried: Carried[] = [];
  const work = ops.filter((op) => op.line);
  const draw = (sq: number, d: number, rule: Carried["rule"]) => {
    const e = sideEdge(v.g, sq, d);
    if (e < 0 || v.grid[e] !== 0) return;
    draw1(e);
    const op = opOf(v.g, e, true);
    carried.push({ op, rule });
    work.push(op);
  };
  for (let op = work.pop(); op; op = work.pop()) {
    const far = step(v, op.sq, op.dir);
    for (const [sq, next, d] of [
      [op.sq, far, op.dir],
      [far, op.sq, opposite(op.dir)],
    ]) {
      // `d` leads from `sq` along the line to `next`.
      if (v.clues[sq] === CORNER) draw(next, d, "black");
      if (v.clues[sq] === STRAIGHT) draw(sq, opposite(d), "white");
    }
  }
  return carried;
}

// --- narration ------------------------------------------------------------

/** Why the square past a black pearl cannot run straight on toward `d`. */
function noStraight(
  v: View,
  grid: ArrayLike<number>,
  next: number,
  d: number,
): NoStraight {
  if (v.clues[next] === CORNER) return "blackPearl";
  for (const s of DIRECTIONS)
    if (s !== d && s !== opposite(d) && edgeState(v, grid, next, s) === 1)
      return "sideLine";
  return onBoard(v, next, d) ? "farEdge" : "boardEdge";
}

/** A firing that reads one square's own edges. */
function narrateSquare(v: View, f: ShownFiring, sq: number, m: Marked): Sentence {
  const grid = f.before;
  const clue = v.clues[sq];
  if (clue === CORNER) {
    // One axis: the op's edge, and the edge opposite it.
    const d = dirFrom(v, f.ops[0], sq);
    const facing = edgeState(v, grid, sq, opposite(d));
    if (facing === 1) return say.blackOpposite("line", m);
    return say.blackOpposite(
      onBoard(v, sq, opposite(d)) ? "ruledOut" : "boardEdge",
      m,
      m.black.length > 0,
    );
  }
  if (clue === STRAIGHT) {
    if (linesAt(v, grid, sq) > 0) return say.whiteCarriesOn(m);
    for (const d of DIRECTIONS)
      if (edgeState(v, grid, sq, d) === 2)
        return say.whiteBlocked(otherAxis(axisOf(d)), !onBoard(v, sq, d), m);
    throw new Error("pearl hint: a white pearl settled with nothing beside it");
  }
  const lines = linesAt(v, grid, sq);
  if (lines === 2) return say.squareFull(m);
  return lines === 1 ? say.lineGoesOn(m) : say.deadEnd(m);
}

/** The op's edge, by its `square-edges.ts` number. */
export function edgeOf(board: { w: number; h: number }, op: PearlEdgeOp): number {
  return squareEdges(board.w, board.h).around[op.sq * 4 + bitDirection(op.dir)];
}

/** What a firing's step marks, split the way its words name it: the edges its
 * own deduction decides, and the lines each pearl rule carries on from them. */
function markedOf(v: View, f: ShownFiring, reason: PearlReason): Marked {
  const carried = new Map(f.carried.map((c) => [edgeOf(v, c.op), c.rule]));
  const rule = (op: PearlEdgeOp) => carried.get(edgeOf(v, op)) ?? null;
  const edges = (r: Carried["rule"] | null) =>
    f.shown.filter((op) => rule(op) === r).map((op) => edgeOf(v, op));
  return {
    own: edges(null),
    black: edges("black"),
    white: edges("white"),
    area: areaOf(v, reason),
  };
}

/** Which sentence a firing speaks, and with what values. */
function narrate(v: View, f: ShownFiring, reason: PearlReason): Sentence {
  // Only a black pearl's own square firing draws a line whose run-on is still
  // open, and its sentence names it; the other techniques that draw a line
  // beside one draw its run-on too.
  if (
    f.carried.some((c) => c.rule === "black") &&
    !(reason.kind === "square" && v.clues[reason.sq] === CORNER)
  )
    throw new Error(`pearl hint: a ${reason.kind} step drew a black pearl's run-on`);
  return sentenceOf(v, f, reason, markedOf(v, f, reason));
}

/** The sentence for the firing's own deduction. */
function sentenceOf(v: View, f: ShownFiring, reason: PearlReason, m: Marked): Sentence {
  const grid = f.before;
  switch (reason.kind) {
    case "square":
      return narrateSquare(v, f, reason.sq, m);
    case "blackRunsOn":
      return say.blackRunsOn(m);
    case "blackCannotRunOn": {
      const next = step(v, reason.pearl, reason.dir);
      return say.blackCannotRunOn(noStraight(v, grid, next, reason.dir), m);
    }
    case "whiteCannotTurn": {
      const blocked = axisOf(reason.axis);
      return say.whiteCannotTurn(otherAxis(blocked), m);
    }
    case "whiteTurnsOpposite": {
      // The square that turns may settle its straight-on cross and a line to
      // one side at once. It then has its two lines, so the cross is not
      // shown, and the words go by the edges the step shows: all lines, or all
      // crosses.
      const lines = f.shown
        .filter((op) => m.own.includes(edgeOf(v, op)))
        .map((op) => op.line);
      if (lines.includes(true) && lines.includes(false))
        throw new Error("pearl hint: a white pearl's turn showed a line and a cross");
      return say.whiteTurnsOpposite(lines[0], m);
    }
    case "closesEarly":
      return say.closesEarly(leftOut(v, reason.piece, null), m);
    case "closesEarlyThrough": {
      const out = leftOut(v, reason.piece, reason.sq);
      if (v.clues[reason.sq] === STRAIGHT) {
        const blocked = axisOf(reason.shape & -reason.shape);
        return say.closesEarlyWhite(blocked, otherAxis(blocked), out, m);
      }
      return say.closesEarlyThrough(out, m);
    }
  }
}

// --- highlights -----------------------------------------------------------

/** The squares a firing reasons from. */
function areaOf(v: View, reason: PearlReason): number[] {
  switch (reason.kind) {
    case "square":
      return [reason.sq];
    case "blackRunsOn":
      return [reason.pearl];
    case "blackCannotRunOn":
      return [step(v, reason.pearl, reason.dir)];
    case "whiteCannotTurn": {
      const d = reason.axis;
      return [step(v, reason.pearl, d), step(v, reason.pearl, opposite(d))];
    }
    case "whiteTurnsOpposite":
      return [step(v, reason.pearl, reason.dir)];
    case "closesEarly":
    case "closesEarlyThrough":
      return reason.piece;
  }
}

// --- the plan -------------------------------------------------------------

/** The player's edges as the description reads them: a line, a cross, or
 * open. */
export function recordedEdges(state: PearlState, g: PearlGeometry): Uint8Array {
  const known = new Uint8Array(g.sp.edges.length);
  for (let e = 0; e < known.length; e++) {
    const i = g.edgeSquare[e];
    const d = g.edgeSide[e];
    const j = step(state, i, d);
    if (state.lines[i] & d || state.lines[j] & opposite(d)) known[e] = LINE;
    else if (state.marks[i] & d || state.marks[j] & opposite(d)) known[e] = NONE;
  }
  return known;
}

/**
 * Does the board already say this? True of a cross beside a square that has
 * both its lines, which the player can read off the square as surely as off a
 * cross: the step's own lines count, since following the step draws them.
 */
function evident(v: View, op: PearlEdgeOp): boolean {
  if (op.line) return false;
  return (
    linesAt(v, v.grid, op.sq) === 2 || linesAt(v, v.grid, step(v, op.sq, op.dir)) === 2
  );
}

/** The hint's rungs: the kinds of premise the narration speaks. */
export const PEARL_RUNGS = [
  "square",
  "blackRunsOn",
  "blackCannotRunOn",
  "whiteCannotTurn",
  "whiteTurnsOpposite",
  "closesEarly",
  "closesEarlyThrough",
] as const;
export type PearlRung = (typeof PEARL_RUNGS)[number];

/**
 * Deduce the plan from the player's lines and crosses.
 *
 * No tier cap: a shared game ID carries no difficulty, and the walk never
 * takes a Normal firing while an Easy one is left, which is the
 * easiest-first order a hint wants anyway.
 */
export function pearlHint(
  state: PearlState,
):
  | { ok: true; steps: HintStep<PearlMove, PearlHint, PearlRung>[] }
  | { ok: false; error: HintRefusal } {
  const { view, impossible, plan } = pearlPlan(state);

  // `findMistakes` vouches for every line and cross, so a contradiction here
  // would mean the deduction is unsound: say the honest thing.
  if (impossible) return { ok: false, error: PUZZLE_NOT_REASONABLE };
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };

  return {
    ok: true,
    steps: plan.map((f) => {
      // `showable` admits only firings with a premise.
      const { reason } = f;
      if (!reason) throw new Error("pearl hint: a step with no premise was shown");
      const words = narrate(view, f, reason);
      return {
        move: moveOf(view, f.shown),
        rung: reason.kind,
        explanation: words.text,
        words,
        highlights: { targets: f.shown },
      };
    }),
  };
}

/** The firings a plan shows, each with the edges it was found on. */
export function pearlPlan(state: PearlState): {
  view: View;
  impossible: boolean;
  plan: ShownFiring[];
} {
  const { g, ladder } = ladderOf(state.w, state.h, state.clues);
  const m = marksOn(g, recordedEdges(state, g));
  const view: View = { w: state.w, h: state.h, clues: state.clues, g, grid: m.grid };
  const reasons = new WeakMap<object, PearlReason | null>();
  let before = Uint8Array.from(m.grid);
  const reasonFor = (taken: Taken): PearlReason | null => {
    const fired = taken.reasons[0] as Fired;
    let r = reasons.get(fired);
    if (r === undefined) {
      r = reasonOf(view, fired, before);
      reasons.set(fired, r);
    }
    return r;
  };
  const walk = ladderWalk(
    m,
    ladder.entries,
    { [TIERS]: ladder.entries.length },
    (t) => {
      const r = reasonFor(t);
      return r ? premise(view, r) : [];
    },
  );
  let broken = false;
  let closed = false;
  const { plan } = deduceHintPlan<View, ShownFiring, string>({
    board: view,
    status: () => (broken ? "broken" : closed || !m.grid.includes(0) ? "done" : "open"),
    incomplete: "open",
    next: (v) => {
      before = Uint8Array.from(m.grid);
      const taken = walk.next();
      if (taken === null) return null;
      if (taken === "contradiction") {
        broken = true;
        return null;
      }
      const reason = reasonFor(taken);
      if ((taken.entry.id as pearl.LadderId) === "closed") closed = true;
      const ops: PearlEdgeOp[] = [];
      for (let e = 0; e < m.grid.length; e++)
        if (m.grid[e] !== before[e]) ops.push(opOf(g, e, m.grid[e] === LINE));
      const carried = carryOn(v, (e) => m.place(e, LINE), ops);
      const shown = [...ops, ...carried.map((c) => c.op)].filter(
        (op) => !evident(v, op),
      );
      return { reason, ops, before, carried, shown };
    },
    showable: (_v, f) => f.reason !== null && f.shown.length > 0,
    planCap: PLAN_CAP,
  });
  return { view, impossible: broken, plan };
}

/** The move that makes these edges: each a line or a cross, set on the squares
 * either side of it. */
function moveOf(b: { w: number }, targets: readonly PearlEdgeOp[]): PearlMove {
  const ops: PearlOp[] = [];
  for (const t of targets) {
    const kind = t.line ? "line" : "mark";
    const far = step(b, t.sq, t.dir);
    ops.push({ kind, l: t.dir, x: t.sq % b.w, y: Math.floor(t.sq / b.w) });
    ops.push({ kind, l: opposite(t.dir), x: far % b.w, y: Math.floor(far / b.w) });
  }
  return { ops };
}

// --- following the plan ---------------------------------------------------

/** What the player's board says of this edge: a line, a cross, or nothing. */
function edgeOn(state: PearlState, t: PearlEdgeOp): "line" | "cross" | null {
  const i = t.sq;
  if (state.lines[i] & t.dir) return "line";
  if (state.marks[i] & t.dir) return "cross";
  return null;
}

/**
 * Classify a player move against the displayed step.
 *
 * A step that decides several edges is one step, and the player makes them one
 * click or one drag at a time, a drag and a click spelling the same edge
 * differently. So the move is judged by the edges it changes
 * (`engine/hint-track.ts`), and the step shrinks in place to what is left.
 */
export function pearlKeepTrack(
  m: PearlMove,
  hintStep: HintStep<PearlMove, PearlHint>,
  state: PearlState,
): "completed" | "onTrack" | "off" {
  if (m.ops.some((op) => op.kind === "solve" || op.kind === "hint")) return "off";
  const targets = hintStep.highlights?.targets ?? [];
  let after: PearlState;
  try {
    after = executeMove(state, m);
  } catch {
    return "off";
  }
  const changes = new Map<number, "line" | "cross" | null>();
  const keyOf = (e: { sq: number; dir: number }) => e.sq * 16 + e.dir;
  for (let sq = 0; sq < state.w * state.h; sq++)
    for (const dir of [R, D]) {
      const e = { sq, dir, line: false };
      const now = edgeOn(after, e);
      if (edgeOn(state, e) !== now) changes.set(keyOf(e), now);
    }
  const want = (t: PearlEdgeOp) => (t.line ? "line" : "cross");
  const { verdict, left } = trackTargets<PearlEdgeOp, number, "line" | "cross" | null>({
    targets,
    changes,
    key: keyOf,
    want,
    holds: (t) => edgeOn(after, t) === want(t),
  });
  if (verdict === "onTrack") {
    hintStep.move = moveOf(state, left);
    if (hintStep.highlights)
      hintStep.highlights = { ...hintStep.highlights, targets: left };
    if (hintStep.words) {
      const kept = new Set(left.map((t) => EDGE.key(edgeOf(state, t))));
      hintStep.words = hintStep.words.narrow(
        (role, _kind, key) => role !== "ring" || kept.has(key),
      );
      hintStep.explanation = hintStep.words.text;
    }
  }
  return verdict;
}
