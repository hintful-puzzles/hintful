/**
 * Pearl's explained hint: the narration half of the recording projection in
 * [`solver.ts`](./solver.ts).
 *
 * The deduction end is the solver's own ladder, run one firing at a time by
 * `pearlRecordingPass` with a recorder standing (docs/games/hints.md
 * § "Recording the deduction", the *threaded* shape). This file turns each
 * firing into the sentence and the picture.
 *
 * **Every fact a step rests on is an edge or a pearl.** The solver also keeps,
 * per square, the shapes it may still take, which the player has no way to
 * mark; the recording pass re-reads those off the edges before each firing and
 * counts a shape it rules out only through the edges that settles there and
 * then (docs/games/hints.md § "Give the facts a notation (Loopy)", and the
 * measurement in `add-pearl-hint`'s design).
 */

import type { HintStep } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  DEDUCTION_EXHAUSTED,
  type HintRefusal,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { trackTargets } from "../../engine/hint-track.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import {
  type Axis,
  EDGE,
  type Edge,
  type LeftOut,
  type Marked,
  type NoStraight,
  say,
} from "./hint-text.ts";
import { executeMove } from "./moves.ts";
import {
  PearlBoard,
  type PearlEdgeOp,
  type PearlFiring,
  type PearlReason,
  pearlRecordingPass,
} from "./solver.ts";
import {
  CORNER,
  D,
  DX,
  DY,
  F,
  L,
  NOCLUE,
  type PearlMove,
  type PearlOp,
  type PearlState,
  R,
  STRAIGHT,
  U,
} from "./state.ts";

/**
 * How far ahead the plan is computed: a UX bound, not a correctness one. A
 * player rarely follows more than a handful of steps before going their own
 * way, and the plan is recomputed then anyway; it also keeps `hint()` cheap
 * enough for the cross-game resume walk, which asks after every move.
 */
const PLAN_CAP = 24;

/** What one step plans. */
export interface PearlHint {
  /** Edges the step decides, and whether each must carry the line. */
  targets: PearlEdgeOp[];
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

// --- reading a workspace --------------------------------------------------

/** The four directions, in the order the narration searches them. */
const DIRS = [R, U, L, D];

/** Edge states: 1 a line, 2 ruled out (or the board's edge), 3 unknown. */
function edgeState(b: PearlBoard, ws: Int32Array, sq: number, d: number): number {
  return ws[b.edgeAt(sq % b.w, Math.floor(sq / b.w), d)];
}

function onBoard(b: PearlBoard, sq: number, d: number): boolean {
  const x = (sq % b.w) + DX(d);
  const y = Math.floor(sq / b.w) + DY(d);
  return x >= 0 && x < b.w && y >= 0 && y < b.h;
}

const step = (b: PearlBoard, sq: number, d: number): number => sq + DY(d) * b.w + DX(d);

function linesAt(b: PearlBoard, ws: Int32Array, sq: number): number {
  let n = 0;
  for (const d of DIRS) if (edgeState(b, ws, sq, d) === 1) n++;
  return n;
}

const axisOf = (d: number): Axis => (d === R || d === L ? "across" : "upDown");
const otherAxis = (a: Axis): Axis => (a === "across" ? "upDown" : "across");

/** The op's edge as seen from square `sq`: the direction it leaves `sq` by, or
 * 0 when it is not one of `sq`'s edges. */
function dirFrom(b: PearlBoard, op: PearlEdgeOp, sq: number): number {
  if (op.sq === sq) return op.dir;
  if (step(b, op.sq, op.dir) === sq) return F(op.dir);
  return 0;
}

/** Does anything a closed loop through `piece` (and `also`) would leave out
 * hold a pearl? Otherwise what it leaves out is lines: the rung fires only
 * when it leaves out a pearl or a line. */
function leftOut(
  b: PearlBoard,
  piece: readonly number[],
  also: number | null,
): LeftOut {
  const on = new Set(piece);
  if (also !== null) on.add(also);
  for (let c = 0; c < b.w * b.h; c++)
    if (!on.has(c) && b.clues[c] !== NOCLUE) return "pearl";
  return "lines";
}

/**
 * Draw, on the working board, every line the pearls' own rules carry on from
 * the lines in `ops`, and the lines those carry on in turn: a line leaving a
 * black pearl runs straight through the next square, and a line entering a
 * white pearl leaves by its opposite edge. They go in the same step because
 * they are the rules, not deductions, and asking for them one at a time costs
 * the player steps that teach nothing (owner, 2026-09-27).
 */
function carryOn(b: PearlBoard, ops: readonly PearlEdgeOp[]): Carried[] {
  const carried: Carried[] = [];
  const work = ops.filter((op) => op.line);
  const draw = (sq: number, d: number, rule: Carried["rule"]) => {
    if (!onBoard(b, sq, d)) return;
    const e = b.edgeAt(sq % b.w, Math.floor(sq / b.w), d);
    if (b.ws[e] !== 3) return;
    b.ws[e] = 1;
    const op =
      d === R || d === D
        ? { sq, dir: d, line: true }
        : { sq: step(b, sq, d), dir: F(d), line: true };
    carried.push({ op, rule });
    work.push(op);
  };
  for (let op = work.pop(); op; op = work.pop()) {
    const far = step(b, op.sq, op.dir);
    for (const [sq, next, d] of [
      [op.sq, far, op.dir],
      [far, op.sq, F(op.dir)],
    ]) {
      // `d` leads from `sq` along the line to `next`.
      if (b.clues[sq] === CORNER) draw(next, d, "black");
      if (b.clues[sq] === STRAIGHT) draw(sq, F(d), "white");
    }
  }
  return carried;
}

// --- narration ------------------------------------------------------------

/** Why the square past a black pearl cannot run straight on toward `d`. */
function noStraight(
  b: PearlBoard,
  ws: Int32Array,
  next: number,
  d: number,
): NoStraight {
  if (b.clues[next] === CORNER) return "blackPearl";
  for (const s of DIRS)
    if (s !== d && s !== F(d) && edgeState(b, ws, next, s) === 1) return "sideLine";
  return onBoard(b, next, d) ? "farEdge" : "boardEdge";
}

/** A firing that reads one square's own edges. */
function narrateSquare(b: PearlBoard, f: ShownFiring, sq: number, m: Marked): Sentence {
  const ws = f.before;
  const clue = b.clues[sq];
  if (clue === CORNER) {
    // One axis: the op's edge, and the edge opposite it.
    const d = dirFrom(b, f.ops[0], sq);
    const opposite = edgeState(b, ws, sq, F(d));
    if (opposite === 1) return say.blackOpposite("line", m);
    return say.blackOpposite(
      onBoard(b, sq, F(d)) ? "ruledOut" : "boardEdge",
      m,
      m.black.length > 0,
    );
  }
  if (clue === STRAIGHT) {
    if (linesAt(b, ws, sq) > 0) return say.whiteCarriesOn(m);
    for (const d of DIRS)
      if (edgeState(b, ws, sq, d) === 2)
        return say.whiteBlocked(otherAxis(axisOf(d)), !onBoard(b, sq, d), m);
    throw new Error("pearl hint: a white pearl settled with nothing beside it");
  }
  const lines = linesAt(b, ws, sq);
  if (lines === 2) return say.squareFull(m);
  return lines === 1 ? say.lineGoesOn(m) : say.deadEnd(m);
}

const edgeOf = (op: PearlEdgeOp): Edge => ({ sq: op.sq, dir: op.dir });

/** What a firing's step marks, split the way its words name it: the edges its
 * own deduction decides, and the lines each pearl rule carries on from them. */
function markedOf(b: PearlBoard, f: ShownFiring, reason: PearlReason): Marked {
  const carried = new Map(f.carried.map((c) => [EDGE.key(c.op), c.rule]));
  const rule = (op: PearlEdgeOp) => carried.get(EDGE.key(op)) ?? null;
  return {
    own: f.shown.filter((op) => rule(op) === null).map(edgeOf),
    black: f.shown.filter((op) => rule(op) === "black").map(edgeOf),
    white: f.shown.filter((op) => rule(op) === "white").map(edgeOf),
    area: areaOf(b, reason),
  };
}

/** Which sentence a firing speaks, and with what values. */
function narrate(b: PearlBoard, f: ShownFiring, reason: PearlReason): Sentence {
  // Only a black pearl's own square firing draws a line whose run-on is still
  // open, and its sentence names it; the other rungs that draw a line beside
  // one draw its run-on too.
  if (
    f.carried.some((c) => c.rule === "black") &&
    !(reason.kind === "square" && b.clues[reason.sq] === CORNER)
  )
    throw new Error(`pearl hint: a ${reason.kind} step drew a black pearl's run-on`);
  return premise(b, f, reason, markedOf(b, f, reason));
}

/** The sentence for the firing's own deduction. */
function premise(
  b: PearlBoard,
  f: ShownFiring,
  reason: PearlReason,
  m: Marked,
): Sentence {
  const ws = f.before;
  switch (reason.kind) {
    case "square":
      return narrateSquare(b, f, reason.sq, m);
    case "blackRunsOn":
      return say.blackRunsOn(m);
    case "blackCannotRunOn": {
      const next = step(b, reason.pearl, reason.dir);
      return say.blackCannotRunOn(noStraight(b, ws, next, reason.dir), m);
    }
    case "whiteCannotTurn": {
      const blocked = axisOf(reason.axis);
      return say.whiteCannotTurn(blocked, otherAxis(blocked), m);
    }
    case "whiteTurnsOpposite":
      return say.whiteTurnsOpposite(f.ops[0].line, m);
    case "closesEarly":
      return say.closesEarly(leftOut(b, reason.piece, null), m);
    case "closesEarlyThrough": {
      const out = leftOut(b, reason.piece, reason.sq);
      if (b.clues[reason.sq] === STRAIGHT) {
        const blocked = axisOf(reason.shape & -reason.shape);
        return say.closesEarlyWhite(blocked, otherAxis(blocked), out, m);
      }
      return say.closesEarlyThrough(out, m);
    }
  }
}

// --- highlights -----------------------------------------------------------

/** The squares a firing reasons from. */
function areaOf(b: PearlBoard, reason: PearlReason): number[] {
  switch (reason.kind) {
    case "square":
      return [reason.sq];
    case "blackRunsOn":
      return [reason.pearl];
    case "blackCannotRunOn":
      return [step(b, reason.pearl, reason.dir)];
    case "whiteCannotTurn": {
      const d = reason.axis;
      return [step(b, reason.pearl, d), step(b, reason.pearl, F(d))];
    }
    case "whiteTurnsOpposite":
      return [step(b, reason.pearl, reason.dir)];
    case "closesEarly":
    case "closesEarlyThrough":
      return reason.piece;
  }
}

// --- the plan -------------------------------------------------------------

/** The player's board as the solver's workspace: their lines and crosses. */
export function boardOf(state: PearlState): PearlBoard {
  const { w, h, clues, lines, marks } = state;
  const b = new PearlBoard(w, h, clues);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      for (const d of [R, D]) {
        if (x + DX(d) >= w || y + DY(d) >= h) continue;
        const i = y * w + x;
        const j = i + DY(d) * w + DX(d);
        const e = b.edgeAt(x, y, d);
        if (lines[i] & d || lines[j] & F(d)) b.ws[e] = 1;
        else if (marks[i] & d || marks[j] & F(d)) b.ws[e] = 2;
      }
  return b;
}

/**
 * Does the board already say this? True of a cross beside a square that has
 * both its lines, which the player can read off the square as surely as off a
 * cross: the step's own lines count, since following the step draws them.
 */
function evident(b: PearlBoard, op: PearlEdgeOp): boolean {
  if (op.line) return false;
  return (
    linesAt(b, b.ws, op.sq) === 2 || linesAt(b, b.ws, step(b, op.sq, op.dir)) === 2
  );
}

/** The hint's rungs: the kinds of the solver's premises. */
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
 * No tier cap: a shared game ID carries no difficulty, and the ladder already
 * tries every Easy rung before the Tricky one, which is the easiest-first
 * order a hint wants anyway.
 */
export function pearlHint(
  state: PearlState,
):
  | { ok: true; steps: HintStep<PearlMove, PearlHint, PearlRung>[] }
  | { ok: false; error: HintRefusal } {
  const board = boardOf(state);
  const pass = pearlRecordingPass(board, stepBudget("pearl hint"));
  const { plan } = deduceHintPlan<PearlBoard, ShownFiring, string>({
    board,
    status: (b) => (pass.impossible() ? "broken" : b.closed ? "done" : "open"),
    incomplete: "open",
    next: (b) => {
      const f = pass.next();
      if (!f) return null;
      const carried = carryOn(b, f.ops);
      const shown = [...f.ops, ...carried.map((c) => c.op)].filter(
        (op) => !evident(b, op),
      );
      return { ...f, carried, shown };
    },
    showable: (_b, f) => f.reason !== null && f.shown.length > 0,
    planCap: PLAN_CAP,
  });

  // `findMistakes` vouches for every line and cross, so a contradiction here
  // would mean the deduction is unsound: say the honest thing.
  if (pass.impossible()) return { ok: false, error: PUZZLE_NOT_REASONABLE };
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };

  return {
    ok: true,
    steps: plan.map((f) => {
      // `showable` admits only firings with a premise.
      const { reason } = f;
      if (!reason) throw new Error("pearl hint: a step with no premise was shown");
      const words = narrate(board, f, reason);
      return {
        move: moveOf(board, f.shown),
        rung: reason.kind,
        explanation: words.text,
        words,
        highlights: { targets: f.shown },
      };
    }),
  };
}

/** The move that makes these edges: each a line or a cross, set on the squares
 * either side of it. */
function moveOf(b: PearlBoard, targets: readonly PearlEdgeOp[]): PearlMove {
  const ops: PearlOp[] = [];
  for (const t of targets) {
    const kind = t.line ? "line" : "mark";
    const far = step(b, t.sq, t.dir);
    ops.push({ kind, l: t.dir, x: t.sq % b.w, y: Math.floor(t.sq / b.w) });
    ops.push({ kind, l: F(t.dir), x: far % b.w, y: Math.floor(far / b.w) });
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
    hintStep.move = moveOf(boardOf(state), left);
    if (hintStep.highlights)
      hintStep.highlights = { ...hintStep.highlights, targets: left };
    if (hintStep.words) {
      const kept = new Set(left.map((t) => EDGE.key(t)));
      hintStep.words = hintStep.words.narrow(
        (role, _kind, key) => role !== "ring" || kept.has(key),
      );
      hintStep.explanation = hintStep.words.text;
    }
  }
  return verdict;
}
