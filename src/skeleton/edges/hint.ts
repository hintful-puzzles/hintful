/**
 * Skeleton's explained hint: the solver's rungs run one firing at a time from
 * the player's own lines and crosses, and each firing turned into a step
 * (docs/hints.md § "Recording the deduction").
 *
 * Every fact a step rests on is a wall, a line or a cross on the board: the
 * ladder reads nothing else. A supposition's chain is shown whole, thin and
 * numbered, and never played (docs/hints-marks.md § "Show the what-if walk
 * statically").
 */

import { EDGE } from "../../engine/edge-hint.ts";
import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { changedCells, trackTargets } from "../../engine/hint-track.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { type EdgeMark, LINE } from "../../engine/line-drawing.ts";
import { squareEdges } from "../../engine/square-edges.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { Point } from "../../engine/types.ts";
import { type Clash, say } from "./hint-text.ts";
import {
  clashOf,
  isComplete,
  SkeletonBoard,
  type SkeletonClash,
  type SkeletonFiring,
  type SkeletonRung,
  skeletonRecordingPass,
  stillHolds,
} from "./solver.ts";
import { executeMove, type SkeletonMove, type SkeletonState } from "./state.ts";

/** How far ahead the plan is computed. A player rarely follows more than a
 * few steps before going their own way, and the plan is asked for again
 * then. */
const PLAN_CAP = 24;

/** A supposition's chain, as the board draws it: each edge it would force,
 * with the mark and the place in the chain it falls. */
export interface SkeletonHighlights {
  /** `order` is on a firing's first edge only: a square forced to two lines
   * is one deduction, and so one number. */
  chain: readonly { edge: number; mark: EdgeMark; order?: number }[];
}

type SkeletonStep = HintStep<SkeletonMove, SkeletonHighlights, SkeletonRung>;

/** The squares of the piece of loop through square `from` on `edges`. */
function pieceOf(state: SkeletonState, edges: Uint8Array, from: number): number[] {
  const g = squareEdges(state.w, state.h);
  const seen = new Set([from]);
  const stack = [from];
  while (stack.length > 0) {
    const i = stack.pop() as number;
    for (let k = 0; k < 4; k++) {
      const e = g.around[i * 4 + k];
      if (e < 0 || edges[e] !== LINE) continue;
      const j = g.a[e] === i ? g.b[e] : g.a[e];
      if (!seen.has(j)) {
        seen.add(j);
        stack.push(j);
      }
    }
  }
  return [...seen].sort((p, q) => p - q);
}

/** What breaks the board `trial`, a supposition has led to, in words. */
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
      return {
        kind: "closed",
        squares: pieceOf(state, trial, g.a[clash.edge]).map(at),
      };
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
    case "lookahead": {
      // The board the supposition leads to, for what breaks there.
      const trial = edges.slice();
      trial[reason.edge] = reason.supposed;
      for (const link of reason.chain) for (const e of link.edges) trial[e] = link.mark;
      return say.lookahead(
        reason.edge,
        reason.supposed === LINE ? "line" : "cross",
        reason.chain.flatMap((link) => link.edges),
        clashWords(state, trial, reason.clash),
      );
    }
  }
}

/**
 * A supposition's chain cut down to the firings its break needs. The ladder
 * records every Easy firing the supposition sets off, in the order the rungs
 * found them, and some settle a corner the break never reads; numbered, they
 * claim an order of consequence that is not there. Each firing is dropped,
 * last first, where the ones left still follow one from the next and still
 * break the board, which is then said as it breaks with those alone.
 */
function pruned(
  state: SkeletonState,
  edges: Uint8Array,
  reason: Extract<SkeletonFiring["reason"], { kind: "lookahead" }>,
): { chain: SkeletonFiring[]; clash: SkeletonClash } {
  const breaks = (chain: readonly SkeletonFiring[]): SkeletonClash | null => {
    const trial = edges.slice();
    trial[reason.edge] = reason.supposed;
    const b = new SkeletonBoard(state.w, state.h, state.walls, trial);
    for (const link of chain) {
      if (!stillHolds(b, link)) return null;
      for (const e of link.edges) b.set(e, link.mark);
    }
    return clashOf(b);
  };
  let chain = reason.chain;
  for (let k = chain.length - 1; k >= 0; k--) {
    const without = chain.filter((_, j) => j !== k);
    if (breaks(without)) chain = without;
  }
  return { chain, clash: breaks(chain) ?? reason.clash };
}

function stepOf(
  state: SkeletonState,
  edges: Uint8Array,
  recorded: SkeletonFiring,
): SkeletonStep {
  const firing: SkeletonFiring =
    recorded.reason.kind === "lookahead"
      ? {
          ...recorded,
          reason: { ...recorded.reason, ...pruned(state, edges, recorded.reason) },
        }
      : recorded;
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
      chain:
        reason.kind === "lookahead"
          ? reason.chain.flatMap((link, k) =>
              link.edges.map((edge, j) =>
                j === 0
                  ? { edge, mark: link.mark, order: k + 1 }
                  : { edge, mark: link.mark },
              ),
            )
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

/**
 * Judge a move against the step on show by what it did to the edges, so a
 * click, a drag and a key that make the same change are the same
 * (`engine/hint-track.ts`). A step that decides several edges shrinks to the
 * ones left.
 */
export function skeletonKeepTrack(
  move: SkeletonMove,
  step: HintStep<SkeletonMove>,
  state: SkeletonState,
): HintTrackVerdict {
  if (move.kind !== "edges" || step.move.kind !== "edges") return "off";
  const after = executeMove(state, move);
  const { verdict, left } = trackTargets({
    targets: step.move.changes,
    changes: changedCells<EdgeMark>(
      state.edges.length,
      (e) => state.edges[e] as EdgeMark,
      (e) => after.edges[e] as EdgeMark,
    ),
    key: (t) => t.edge,
    want: (t) => t.mark,
    holds: (t) => after.edges[t.edge] === t.mark,
  });
  if (verdict === "onTrack") {
    step.move = { kind: "edges", changes: left };
    // The rings are read from the words, so the words shrink with the move.
    const kept = new Set(left.map((t) => String(t.edge)));
    if (step.words) {
      step.words = step.words.narrow(
        (role, kind, key) => role !== "ring" || kind !== EDGE.name || kept.has(key),
      );
      step.explanation = step.words.text;
    }
  }
  return verdict;
}
