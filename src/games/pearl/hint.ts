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
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import { type Axis, type LeftOut, type NoStraight, say } from "./hint-text.ts";
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

/** What one step marks. */
export interface PearlHint {
  /** Edges the step decides, and whether each must carry the line. */
  targets: PearlEdgeOp[];
  /** Squares the deduction reasons from, outlined. */
  area: number[];
}

/** A firing with the edges it asks the player for: all it decided, less the
 * crosses beside a square that already has two lines. */
interface ShownFiring extends PearlFiring {
  shown: PearlEdgeOp[];
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
function narrateSquare(b: PearlBoard, f: PearlFiring, sq: number): string {
  const ws = f.before;
  const clue = b.clues[sq];
  if (clue === CORNER) {
    // One axis: the op's edge, and the edge opposite it.
    const d = dirFrom(b, f.ops[0], sq);
    const opposite = edgeState(b, ws, sq, F(d));
    if (opposite === 1) return say.blackOpposite("line");
    return say.blackOpposite(onBoard(b, sq, F(d)) ? "ruledOut" : "boardEdge");
  }
  if (clue === STRAIGHT) {
    if (linesAt(b, ws, sq) > 0) return say.whiteCarriesOn;
    for (const d of DIRS)
      if (edgeState(b, ws, sq, d) === 2)
        return say.whiteBlocked(otherAxis(axisOf(d)), !onBoard(b, sq, d));
    throw new Error("pearl hint: a white pearl settled with nothing beside it");
  }
  const lines = linesAt(b, ws, sq);
  if (lines === 2) return say.squareFull(f.ops.length);
  return lines === 1 ? say.lineGoesOn : say.deadEnd;
}

/** Which sentence a firing speaks, and with what values. */
function narrate(b: PearlBoard, f: PearlFiring, reason: PearlReason): string {
  const ws = f.before;
  switch (reason.kind) {
    case "square":
      return narrateSquare(b, f, reason.sq);
    case "blackRunsOn":
      return say.blackRunsOn;
    case "blackCannotRunOn": {
      const next = step(b, reason.pearl, reason.dir);
      return say.blackCannotRunOn(noStraight(b, ws, next, reason.dir));
    }
    case "whiteCannotTurn": {
      const blocked = axisOf(reason.axis);
      return say.whiteCannotTurn(blocked, otherAxis(blocked));
    }
    case "whiteTurnsOpposite":
      return say.whiteTurnsOpposite;
    case "closesEarly":
      return say.closesEarly(leftOut(b, reason.piece, null));
    case "closesEarlyThrough": {
      const out = leftOut(b, reason.piece, reason.sq);
      if (b.clues[reason.sq] === STRAIGHT) {
        const blocked = axisOf(reason.shape & -reason.shape);
        return say.closesEarlyWhite(blocked, otherAxis(blocked), out);
      }
      return say.closesEarlyThrough(out);
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
  | { ok: true; steps: HintStep<PearlMove, PearlHint>[] }
  | { ok: false; error: string } {
  const board = boardOf(state);
  const pass = pearlRecordingPass(board, stepBudget("pearl hint"));
  const { plan } = deduceHintPlan<PearlBoard, ShownFiring, string>({
    board,
    status: (b) => (pass.impossible() ? "broken" : b.closed ? "done" : "open"),
    incomplete: "open",
    next: (b) => {
      const f = pass.next();
      return f && { ...f, shown: f.ops.filter((op) => !evident(b, op)) };
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
      return {
        move: moveOf(board, f.shown),
        explanation: narrate(board, f, reason),
        highlights: { targets: f.shown, area: areaOf(board, reason) },
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
 * click or one drag at a time. So the move is judged by what it does to the
 * board rather than by its ops (a drag and a click spell the same edge
 * differently): every edge it changes must be one the step asks for, set the
 * way the step asks, and the step shrinks in place to what is left.
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
  let changed = 0;
  for (let sq = 0; sq < state.w * state.h; sq++)
    for (const dir of [R, D]) {
      const e = { sq, dir, line: false };
      const was = edgeOn(state, e);
      const now = edgeOn(after, e);
      if (was === now) continue;
      changed++;
      const t = targets.find((t) => t.sq === sq && t.dir === dir);
      if (!t || now !== (t.line ? "line" : "cross")) return "off";
    }
  if (changed === 0) return "off";

  const left = targets.filter((t) => edgeOn(after, t) !== (t.line ? "line" : "cross"));
  if (left.length === 0) return "completed";
  hintStep.move = moveOf(boardOf(state), left);
  if (hintStep.highlights)
    hintStep.highlights = { ...hintStep.highlights, targets: left };
  return "onTrack";
}
