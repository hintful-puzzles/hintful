/**
 * Skeleton's explained hint: the solver's rungs run one firing at a time from
 * the player's own lines and crosses, and each firing turned into a step
 * (docs/hints.md § "Recording the deduction").
 *
 * Every fact a step rests on is a wall, a line or a cross on the board: the
 * ladder reads nothing else. The lines a Check tries are drawn thin where its
 * words outline them, and never played.
 */

import { type ShapedEdge, trackEdgeStep } from "../../engine/edge-hint.ts";
import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { LINE } from "../../engine/line-drawing.ts";
import { pieceThrough, squareEdges } from "../../engine/square-edges.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { Point } from "../../engine/types.ts";
import { type Clash, say } from "./hint-text.ts";
import {
  isComplete,
  SkeletonBoard,
  type SkeletonClash,
  type SkeletonFiring,
  type SkeletonRung,
  skeletonRecordingPass,
} from "./solver.ts";
import { executeMove, type SkeletonMove, type SkeletonState } from "./state.ts";

/** How far ahead the plan is computed. A player rarely follows more than a
 * few steps before going their own way, and the plan is asked for again
 * then. */
const PLAN_CAP = 24;

/** The edges a step tries lines on, as the board draws them. */
export interface SkeletonHighlights {
  tried: readonly ShapedEdge[];
}

type SkeletonStep = HintStep<SkeletonMove, SkeletonHighlights, SkeletonRung>;

/** What breaks the board `trial`, the lines tried have made, in words. */
function clashWords(
  state: SkeletonState,
  trial: Uint8Array,
  clash: SkeletonClash,
): Clash {
  const { w } = state;
  const at = (i: number): Point => ({ x: i % w, y: (i / w) | 0 });
  switch (clash.kind) {
    case "crowded": {
      const b = new SkeletonBoard(state.w, state.h, state.walls, trial);
      return {
        kind: "crowded",
        at: at(clash.cell),
        lines: b.edgesAt(clash.cell, LINE).length,
      };
    }
    case "stuck": {
      const b = new SkeletonBoard(state.w, state.h, state.walls, trial);
      const ways = b.edgesAt(clash.cell, LINE).length + b.liveAt(clash.cell).length;
      return { kind: "stuck", at: at(clash.cell), ways };
    }
    case "closed": {
      const g = squareEdges(state.w, state.h);
      const piece = pieceThrough(g, (e) => trial[e] === LINE, g.a[clash.edge]);
      return { kind: "closed", squares: piece.map(at) };
    }
  }
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
    case "breaks": {
      // The board with the lines tried, for what breaks there.
      const trial = edges.slice();
      for (const e of reason.tried) trial[e] = LINE;
      const clash = clashWords(state, trial, reason.clash);
      return reason.cell === null
        ? say.lineBreaks(firing.edges[0], clash)
        : say.pairBreaks(reason.tried, firing.edges[0], clash);
    }
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
        reason.kind === "breaks"
          ? reason.tried.map((edge) => ({ edge, mark: LINE }))
          : [],
    },
  };
}

/**
 * The plan from the player's lines and crosses. No tier cap: a board that
 * arrives by its ID carries no tier, and the ladder tries the Easy rung
 * first, which is the order a hint wants anyway.
 */
export function skeletonHint(
  state: SkeletonState,
): HintResult<SkeletonMove, SkeletonHighlights, SkeletonRung> {
  const { w, h, walls } = state;
  const board = new SkeletonBoard(w, h, walls, state.edges.slice());
  const pass = skeletonRecordingPass(board, stepBudget("skeleton hint"));
  // Each firing is narrated against the edges as they stood when it fired.
  const before: Uint8Array[] = [];
  const { plan } = deduceHintPlan<SkeletonBoard, SkeletonFiring, "open" | "done">({
    board,
    status: (b) => (isComplete(w, h, walls, b.edges) ? "done" : "open"),
    incomplete: "open",
    next: () => {
      const edges = board.edges.slice();
      const firing = pass.next();
      if (firing) before.push(edges);
      return firing;
    },
    planCap: PLAN_CAP,
  });
  // The mistake check vouches for every line and cross, so a contradiction
  // here means the board itself has no answer.
  if (pass.impossible()) return { ok: false, error: PUZZLE_NOT_REASONABLE };
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
