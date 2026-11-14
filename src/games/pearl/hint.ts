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

import {
  describedEdgeHint,
  type Fired as FiredOf,
} from "../../engine/described-edge-hint.ts";
import { EDGE } from "../../engine/edge-hint.ts";
import { keepTrackBy } from "../../engine/hint-track.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import type { CellMarks, Ladder } from "../../engine/ladder-runtime.ts";
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
import * as pearl from "./pearl.compiled.ts";
import {
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
type PearlReason =
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
  readonly grid: ArrayLike<number>;
}

/** One firing on the hint path. */
interface PearlFiring {
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

/** A firing as its technique said it. */
type Said = { [K in pearl.LadderId]: { id: K; says: PearlSays[K] } }[pearl.LadderId];

/**
 * The firing's premise, as the narration names it, from what its technique
 * said on the edges before it fired. `null` for the closed loop.
 */
function reasonOf(v: View, said: Said): PearlReason | null {
  switch (said.id) {
    case "square":
    case "blackPearl":
      return { kind: "square", sq: said.says.terms.c };
    case "blackRunsOn":
    case "blackCannotRunOn":
    case "whiteTurnsOpposite": {
      const { c, e } = said.says.terms;
      return { kind: said.id, pearl: c, dir: dirOf(v, c, e) };
    }
    case "whiteCannotTurn": {
      const { c, e } = said.says.terms;
      const d = dirOf(v, c, e);
      return { kind: "whiteCannotTurn", pearl: c, axis: d === L || d === R ? R : U };
    }
    case "closed":
      return null;
    case "earlyLoop": {
      const { e } = said.says.terms;
      return {
        kind: "closesEarly",
        sq: v.g.edgeSquare[e],
        dir: v.g.edgeSide[e],
        piece: [...said.says.marks.outline],
      };
    }
    case "earlyThrough": {
      // The way through it rules out: the first two of its open sides, in
      // the order a square lists its sides, into the piece it shows.
      const { c, F } = said.says.terms;
      const piece = said.says.marks.outline;
      const ways = F.map((e) => dirOf(v, c, e)).filter((d) =>
        piece.includes(step(v, c, d)),
      );
      const [x, y] = DIRECTIONS.filter((d) => ways.includes(d));
      if (y === undefined)
        throw new Error(`pearl hint: earlyThrough at ${c} joins no piece`);
      return { kind: "closesEarlyThrough", sq: c, shape: x | y, piece: [...piece] };
    }
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
function recordedEdges(state: PearlState, g: PearlGeometry): Uint8Array {
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

/** What each technique says, as the hint's sentences read it. */
type PearlSays = pearl.SaysById;

/** The rungs, the techniques a step can speak: every one but the closed loop,
 * which only confirms. */
export const PEARL_RUNGS = pearl.SAYS_KINDS.filter((k) => k !== "closed");
export type PearlRung = Exclude<pearl.LadderId, "closed">;

/** What the walk reads a firing by: the board's edges, live as the marks hold
 * them, and whether the lines have closed into the loop. */
interface PearlWalkContext {
  view: View;
  closed: boolean;
}

/** What a sentence is told of its step: the firing, why it holds, and the
 * board it reads. */
interface PearlMarked {
  view: View;
  firing: ShownFiring;
  reason: PearlReason;
}

/** A firing's step: the edges it decided and the lines the pearls carry on
 * from them, drawn on the working board in the same step. */
function stepOf(fired: FiredOf<PearlSays[keyof PearlSays], PearlWalkContext>): {
  move: PearlMove;
  highlights: PearlHint;
  marked: PearlMarked;
}[] {
  const { taken, says, ctx, marks: m } = fired;
  const { view } = ctx;
  // The edges as they stood before the firing: every edge it sets was open.
  const before = Uint8Array.from(m.grid);
  for (let i = 0; i < taken.facts.length; i += 3) before[taken.facts[i + 1]] = 0;
  const reason = reasonOf(view, { id: taken.entry.id, says } as Said);
  if ((taken.entry.id as pearl.LadderId) === "closed") ctx.closed = true;
  const ops: PearlEdgeOp[] = [];
  for (let e = 0; e < m.grid.length; e++)
    if (m.grid[e] !== before[e]) ops.push(opOf(view.g, e, m.grid[e] === LINE));
  const carried = carryOn(view, (e) => m.place(e, LINE), ops);
  const shown = [...ops, ...carried.map((c) => c.op)].filter(
    (op) => !evident(view, op),
  );
  // The closed loop only confirms, and a firing whose edges the board already
  // shows has nothing to ask of the player.
  if (reason === null || shown.length === 0) return [];
  return [
    {
      move: moveOf(view, shown),
      highlights: { targets: shown },
      marked: { view, firing: { ops, before, carried, shown }, reason },
    },
  ];
}

/**
 * The ladder over the player's lines and crosses, for the engine's hint to
 * walk (`engine/described-edge-hint.ts`).
 */
function pearlWalk(state: PearlState): {
  marks: CellMarks;
  entries: Ladder["entries"];
  ctx: PearlWalkContext;
} {
  const { g, ladder } = ladderOf(state.w, state.h, state.clues);
  const marks = marksOn(g, recordedEdges(state, g));
  const view: View = {
    w: state.w,
    h: state.h,
    clues: state.clues,
    g,
    grid: marks.grid,
  };
  return { marks, entries: ladder.entries, ctx: { view, closed: false } };
}

/**
 * Deduce the plan from the player's lines and crosses.
 *
 * No tier cap: a shared game ID carries no difficulty, and the walk never
 * takes a Normal firing while an Easy one is left, which is the
 * easiest-first order a hint wants anyway.
 */
export const pearlHint = describedEdgeHint<
  PearlState,
  PearlMove,
  PearlHint,
  PearlMarked,
  PearlWalkContext,
  PearlSays,
  PearlRung
>({
  name: "pearl hint",
  walk: pearlWalk,
  tiers: { lowest: () => pearl.tiers.length - 1, count: pearl.tiers.length },
  done: (m, ctx) => ctx.closed || !m.grid.includes(0),
  step: stepOf,
  // Every technique's sentence is the one `narrate` says for its premise.
  say: (_spoken, { view, firing, reason }) => narrate(view, firing, reason),
});

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

const keyOf = (e: { sq: number; dir: number }) => e.sq * 16 + e.dir;

/**
 * Classify a player move against the displayed step.
 *
 * A step that decides several edges is one step, and the player makes them one
 * click or one drag at a time, a drag and a click spelling the same edge
 * differently. So the move is judged by the edges it changes, and the step
 * shrinks in place to what is left.
 */
export const pearlKeepTrack = keepTrackBy<
  PearlState,
  PearlMove,
  PearlHint,
  PearlEdgeOp,
  number,
  "line" | "cross" | null
>({
  foreign: (m) => m.ops.some((op) => op.kind === "solve" || op.kind === "hint"),
  execute: (state, m) => {
    try {
      return executeMove(state, m);
    } catch {
      return null;
    }
  },
  targets: (step) => step.highlights?.targets ?? [],
  changesOf: (before, after) => {
    const changes = new Map<number, "line" | "cross" | null>();
    for (let sq = 0; sq < before.w * before.h; sq++)
      for (const dir of [R, D]) {
        const e = { sq, dir, line: false };
        const now = edgeOn(after, e);
        if (edgeOn(before, e) !== now) changes.set(keyOf(e), now);
      }
    return changes;
  },
  key: keyOf,
  want: (t) => (t.line ? "line" : "cross"),
  valueOf: edgeOn,
  narrowed: (step, left, state) => ({
    move: moveOf(state, left),
    highlights: step.highlights && { ...step.highlights, targets: [...left] },
  }),
  ring: (t, state) => EDGE.key(edgeOf(state, t)),
});
