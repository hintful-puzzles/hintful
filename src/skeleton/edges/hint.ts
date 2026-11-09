/**
 * Skeleton's explained hint: the solver's compiled ladder walked one firing
 * at a time from the player's own lines and crosses (`skeletonWalk`), and
 * each firing turned into a step (docs/hints.md § "Recording the
 * deduction").
 *
 * Every fact a step rests on is a wall, a line or a cross on the board: the
 * ladder reads nothing else. The lines a Check tries are drawn thin where its
 * words outline them, and never played.
 */

import { Dsf } from "../../engine/dsf.ts";
import { type ShapedEdge, trackEdgeStep } from "../../engine/edge-hint.ts";
import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { LINE, OPEN } from "../../engine/line-drawing.ts";
import { pieceThrough, squareEdges } from "../../engine/square-edges.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { Point } from "../../engine/types.ts";
import { type Clash, say } from "./hint-text.ts";
import {
  isComplete,
  type SkeletonBoard,
  type SkeletonFiring,
  type SkeletonRung,
  skeletonWalk,
} from "./solver.ts";
import {
  executeMove,
  LINES_PER_SQUARE,
  type SkeletonMove,
  type SkeletonState,
} from "./state.ts";

/** How far ahead the plan is computed. A player rarely follows more than a
 * few steps before going their own way, and the plan is asked for again
 * then. */
const PLAN_CAP = 24;

/** The edges a step tries lines on, as the board draws them. */
export interface SkeletonHighlights {
  tried: readonly ShapedEdge[];
}

type SkeletonStep = HintStep<SkeletonMove, SkeletonHighlights, SkeletonRung>;

/**
 * What lines on `tried` would break at once, on `edges` as the ladder had
 * them, in words: a line closing a loop short of every square, or a square
 * left with too few ways for its two lines. The ladder has proved that one
 * does; this finds which, to say it.
 */
function clashOf(
  state: SkeletonState,
  edges: Uint8Array,
  tried: readonly number[],
): Clash {
  const { w, h, walls } = state;
  const g = squareEdges(w, h);
  const at = (i: number): Point => ({ x: i % w, y: (i / w) | 0 });
  const trial = edges.slice();
  const pieces = new Dsf(g.cells);
  for (let e = 0; e < g.edgeCount; e++)
    if (trial[e] === LINE) pieces.merge(g.a[e], g.b[e]);
  for (const e of tried) {
    if (pieces.equivalent(g.a[e], g.b[e]) && pieces.size(g.a[e]) < g.cells) {
      trial[e] = LINE;
      const piece = pieceThrough(g, (f) => trial[f] === LINE, g.a[e]);
      return { kind: "closed", squares: piece.map(at) };
    }
    trial[e] = LINE;
    pieces.merge(g.a[e], g.b[e]);
  }
  const lines = new Int32Array(g.cells);
  for (let e = 0; e < g.edgeCount; e++)
    if (trial[e] === LINE) {
      lines[g.a[e]]++;
      lines[g.b[e]]++;
    }
  // An edge a line may still take: open, no wall, both its squares short of
  // their lines, and not closing a loop short of every square.
  const live = (e: number): boolean => {
    const [i, j] = [g.a[e], g.b[e]];
    if (trial[e] !== OPEN || walls[e]) return false;
    if (lines[i] >= LINES_PER_SQUARE || lines[j] >= LINES_PER_SQUARE) return false;
    return !pieces.equivalent(i, j) || pieces.size(i) === g.cells;
  };
  for (let i = 0; i < g.cells; i++) {
    if (lines[i] >= LINES_PER_SQUARE) continue;
    let ways = lines[i];
    for (let k = 0; k < 4; k++) {
      const e = g.around[i * 4 + k];
      if (e >= 0 && live(e)) ways++;
    }
    if (ways < LINES_PER_SQUARE) return { kind: "stuck", at: at(i), ways };
  }
  throw new Error(`skeleton: lines on ${tried} break nothing`);
}

/** The words for one firing on `state` with `edges` as the ladder had them
 * when it fired. */
function wordsOf(
  state: SkeletonState,
  edges: Uint8Array,
  firing: SkeletonFiring,
): Sentence {
  const { w } = state;
  const { reason } = firing;
  switch (reason.kind) {
    case "forced":
      return say.forced(
        { x: reason.cell % w, y: (reason.cell / w) | 0 },
        reason.need,
        firing.edges,
      );
    case "pairBreaks":
      return say.pairBreaks(
        reason.tried,
        firing.edges[0],
        clashOf(state, edges, reason.tried),
      );
  }
}

function stepOf(
  state: SkeletonState,
  edges: Uint8Array,
  firing: SkeletonFiring,
): SkeletonStep {
  const words = wordsOf(state, edges, firing);
  const { reason } = firing;
  return {
    move: {
      kind: "edges",
      changes: firing.edges.map((edge) => ({ edge, mark: firing.mark })),
    },
    rung: reason.kind,
    explanation: words.text,
    words,
    highlights: {
      tried:
        reason.kind === "forced"
          ? []
          : reason.tried.map((edge) => ({ edge, mark: LINE })),
    },
  };
}

/** The plan from the player's lines and crosses. */
export function skeletonHint(
  state: SkeletonState,
): HintResult<SkeletonMove, SkeletonHighlights, SkeletonRung> {
  const board: SkeletonBoard = { ...state, edges: state.edges.slice() };
  const next = skeletonWalk(board, stepBudget("skeleton hint"));
  let impossible = false;
  // Each firing is narrated against the edges as they stood when it fired.
  const before: Uint8Array[] = [];
  const { plan } = deduceHintPlan<SkeletonBoard, SkeletonFiring, "open" | "done">({
    board,
    status: (b) => (isComplete(b) ? "done" : "open"),
    incomplete: "open",
    next: () => {
      const edges = board.edges.slice();
      const firing = next();
      if (firing === "contradiction") impossible = true;
      if (firing === null || firing === "contradiction") return null;
      before.push(edges);
      return firing;
    },
    planCap: PLAN_CAP,
  });
  // The mistake check vouches for every line and cross, so a contradiction
  // here means the board itself has no answer.
  if (impossible) return { ok: false, error: PUZZLE_NOT_REASONABLE };
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  return { ok: true, steps: plan.map((firing, k) => stepOf(state, before[k], firing)) };
}

/** Judge a move against the step on show by what it did to the edges, which
 * a solve never makes a step of. */
export function skeletonKeepTrack(
  move: SkeletonMove,
  step: HintStep<SkeletonMove>,
  state: SkeletonState,
): HintTrackVerdict {
  if (move.kind !== "edges" || step.move.kind !== "edges") return "off";
  return trackEdgeStep(
    step,
    step.move.changes,
    state.edges,
    executeMove(state, move).edges,
    (changes): SkeletonMove => ({ kind: "edges", changes }),
  );
}
