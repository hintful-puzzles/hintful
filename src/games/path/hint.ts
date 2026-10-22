/**
 * Path's explained hint: the solver's rungs run one firing at a time from the
 * player's own lines and crosses, and each firing turned into a step
 * (docs/hints.md § "Recording the deduction").
 *
 * Every fact a step rests on is a number, a line or a cross on the board: the
 * ladder reads nothing else. A supposition's chain is shown whole, thin and
 * numbered, and never played (docs/hints-marks.md § "Show the what-if walk
 * statically").
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { changedCells, trackTargets } from "../../engine/hint-track.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { CROSS, type EdgeMark, LINE } from "../../engine/line-drawing.ts";
import { squareEdges } from "../../engine/square-edges.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { Point } from "../../engine/types.ts";
import { type Clash, EDGE, type Square, say } from "./hint-text.ts";
import {
  clashOf,
  isComplete,
  PathBoard,
  type PathClash,
  type PathFiring,
  type PathRung,
  pathRecordingPass,
  stillHolds,
} from "./solver.ts";
import { executeMove, NO_END, type PathMove, type PathState } from "./state.ts";

/** How far ahead the plan is computed. A player rarely follows more than a
 * few steps before going their own way, and the plan is asked for again
 * then. */
const PLAN_CAP = 24;

/** A supposition's chain, as the board draws it: each edge it would force,
 * with the mark and the place in the chain it falls. */
export interface PathHighlights {
  /** `order` is on a firing's first edge only: a square forced to two lines
   * is one deduction, and so one number. */
  chain: readonly { edge: number; mark: EdgeMark; order?: number }[];
}

type PathStep = HintStep<PathMove, PathHighlights, PathRung>;

/** The squares of the piece of line through square `from` on `edges`. */
function pieceOf(state: PathState, edges: Uint8Array, from: number): number[] {
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

/** The words for one firing on `state` with `edges` as the ladder had them
 * when it fired. */
function wordsOf(state: PathState, edges: Uint8Array, firing: PathFiring): Sentence {
  const { w, ends } = state;
  const at = (i: number): Point => ({ x: i % w, y: (i / w) | 0 });
  const square = (i: number): Square => ({
    at: at(i),
    number: ends[i] === NO_END ? null : ends[i],
  });
  /** The numbered square at the far end of the piece through `i`. */
  const numberOn = (i: number, lines: Uint8Array): Square => {
    const found = pieceOf(state, lines, i).find((j) => ends[j] !== NO_END);
    return square(found ?? i);
  };
  const { reason } = firing;
  switch (reason.kind) {
    case "forced":
      return say.forced(square(reason.cell), reason.need, firing.edges);
    case "lookahead": {
      // The board the supposition leads to, for what breaks there.
      const trial = edges.slice();
      trial[reason.edge] = reason.supposed;
      for (const link of reason.chain) for (const e of link.edges) trial[e] = link.mark;
      return say.lookahead(
        reason.edge,
        reason.supposed === LINE ? "line" : "cross",
        reason.chain.flatMap((link) => link.edges),
        clashWords(state, trial, reason.clash, square, numberOn),
      );
    }
  }
}

function clashWords(
  state: PathState,
  trial: Uint8Array,
  clash: PathClash,
  square: (i: number) => Square,
  numberOn: (i: number, lines: Uint8Array) => Square,
): Clash {
  const g = squareEdges(state.w, state.h);
  switch (clash.kind) {
    case "crowded": {
      let lines = 0;
      for (let k = 0; k < 4; k++) {
        const e = g.around[clash.cell * 4 + k];
        if (e >= 0 && trial[e] === LINE) lines++;
      }
      return { kind: "crowded", square: square(clash.cell), lines };
    }
    case "stuck": {
      const b = new PathBoard(state.w, state.h, state.ends, trial);
      const ways = b.edgesAt(clash.cell, LINE).length + b.liveAt(clash.cell).length;
      return { kind: "stuck", square: square(clash.cell), ways };
    }
    case "closed":
      return {
        kind: "closed",
        squares: pieceOf(state, trial, g.a[clash.edge]).map((i) => square(i).at),
      };
    case "joined": {
      // The two sides of the joining edge, each before it was laid.
      const before = trial.slice();
      before[clash.edge] = CROSS;
      return {
        kind: "joined",
        a: numberOn(g.a[clash.edge], before),
        b: numberOn(g.b[clash.edge], before),
      };
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
  state: PathState,
  edges: Uint8Array,
  reason: Extract<PathFiring["reason"], { kind: "lookahead" }>,
): { chain: PathFiring[]; clash: PathClash } {
  const breaks = (chain: readonly PathFiring[]): PathClash | null => {
    const trial = edges.slice();
    trial[reason.edge] = reason.supposed;
    const b = new PathBoard(state.w, state.h, state.ends, trial);
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

function stepOf(state: PathState, edges: Uint8Array, recorded: PathFiring): PathStep {
  const firing: PathFiring =
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
export function pathHint(
  state: PathState,
): HintResult<PathMove, PathHighlights, PathRung> {
  const { w, h, ends } = state;
  const board = new PathBoard(w, h, ends, state.edges.slice());
  const pass = pathRecordingPass(board, stepBudget("path hint"));
  // Each firing is narrated against the edges as they stood when it fired.
  const before: Uint8Array[] = [];
  const { plan } = deduceHintPlan<PathBoard, PathFiring, "open" | "done">({
    board,
    status: (b) => (isComplete(w, h, ends, b.edges) ? "done" : "open"),
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
export function pathKeepTrack(
  move: PathMove,
  step: HintStep<PathMove>,
  state: PathState,
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
