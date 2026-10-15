/**
 * Skeleton's explained hint: the solver's rungs run one firing at a time from
 * the player's own marks, and each firing turned into a step
 * (docs/hints.md § "Recording the deduction").
 *
 * Every fact a step rests on is a number or a mark the player has made: the
 * ladder reads nothing else.
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { deduceHintPlan } from "../../engine/hint-plan.ts";
import {
  DEDUCTION_EXHAUSTED,
  PUZZLE_NOT_REASONABLE,
} from "../../engine/hint-refusal.ts";
import { changedCells, trackTargets } from "../../engine/hint-track.ts";
import type { Sentence } from "../../engine/hint-words.ts";
import { stepBudget } from "../../engine/step-budget.ts";
import type { Point } from "../../engine/types.ts";
import { type Counted, say } from "./hint-text.ts";
import {
  isComplete,
  SkeletonBoard,
  type SkeletonFiring,
  type SkeletonRung,
  skeletonRecordingPass,
} from "./solver.ts";
import {
  executeMove,
  FILLED,
  type SkeletonMark,
  type SkeletonMove,
  type SkeletonState,
} from "./state.ts";

/** How far ahead the plan is computed. A player rarely follows more than a
 * few steps before going their own way, and the plan is asked for again
 * then. */
const PLAN_CAP = 24;

type SkeletonStep = HintStep<SkeletonMove, unknown, SkeletonRung>;

/** What a firing says, with the squares it decides ringed. */
function wordsOf(state: SkeletonState, firing: SkeletonFiring): Sentence {
  const { w, clues } = state;
  const at = (i: number): Point => ({ x: i % w, y: (i / w) | 0 });
  const cells = firing.cells.map(at);
  const { reason } = firing;
  const counted = (clue: number, need: number): Counted => ({
    at: at(clue),
    value: clues[clue],
    need,
  });
  switch (reason.kind) {
    case "count": {
      const c = counted(reason.clue, reason.need);
      return reason.need === 0
        ? say.countMet(c, cells)
        : say.countAll(c, reason.open, cells);
    }
    case "shared":
      return say.shared(
        counted(reason.clue, reason.need),
        counted(reason.inner, reason.innerNeed),
        reason.meet.map(at),
        cells,
        firing.mark === FILLED ? "shaded" : "clear",
      );
  }
}

function stepOf(state: SkeletonState, firing: SkeletonFiring): SkeletonStep {
  const words = wordsOf(state, firing);
  return {
    move: {
      kind: "mark",
      cells: firing.cells.map((index) => ({ index, mark: firing.mark })),
    },
    rung: firing.reason.kind,
    explanation: words.text,
    words,
  };
}

/**
 * The plan from the player's marks. No tier cap: a board that arrives by its
 * ID carries no tier, and the ladder tries the easy rung first, which is the
 * order a hint wants anyway.
 */
export function skeletonHint(
  state: SkeletonState,
): HintResult<SkeletonMove, unknown, SkeletonRung> {
  const { w, h, clues } = state;
  const board = new SkeletonBoard(w, h, clues, state.grid.slice());
  const pass = skeletonRecordingPass(board, stepBudget("skeleton hint"));
  const { plan } = deduceHintPlan<SkeletonBoard, SkeletonFiring, "open" | "done">({
    board,
    status: (b) => (isComplete(w, h, clues, b.grid) ? "done" : "open"),
    incomplete: "open",
    next: () => pass.next(),
    planCap: PLAN_CAP,
  });
  // The mistake check vouches for every mark, so a contradiction here means
  // the board itself has no answer.
  if (pass.impossible()) return { ok: false, error: PUZZLE_NOT_REASONABLE };
  if (plan.length === 0) return { ok: false, error: DEDUCTION_EXHAUSTED };
  return { ok: true, steps: plan.map((firing) => stepOf(state, firing)) };
}

/**
 * Judge a move against the step on show by what it did to the board, so a
 * click, a drag and a key that make the same change are the same
 * (`engine/hint-track.ts`). A step that decides several squares shrinks to
 * the ones left.
 */
export function skeletonKeepTrack(
  move: SkeletonMove,
  step: HintStep<SkeletonMove>,
  state: SkeletonState,
): HintTrackVerdict {
  if (move.kind !== "mark" || step.move.kind !== "mark") return "off";
  const after = executeMove(state, move);
  const { verdict, left } = trackTargets({
    targets: step.move.cells,
    changes: changedCells<SkeletonMark>(
      state.grid.length,
      (i) => state.grid[i] as SkeletonMark,
      (i) => after.grid[i] as SkeletonMark,
    ),
    key: (t) => t.index,
    want: (t) => t.mark,
    holds: (t) => after.grid[t.index] === t.mark,
  });
  if (verdict === "onTrack") {
    step.move = { kind: "mark", cells: left };
    // The rings are read from the words, so the words shrink with the move.
    const { w } = state;
    const kept = new Set(left.map((t) => `${t.index % w},${(t.index / w) | 0}`));
    if (step.words) {
      step.words = step.words.narrow(
        (role, kind, key) => role !== "ring" || kind !== "cell" || kept.has(key),
      );
      step.explanation = step.words.text;
    }
  }
  return verdict;
}
