/**
 * Pegs' hint.
 *
 * Pegs is a search game: no jump is forced by logic, so the hint is the
 * non-deductive kind (docs/games/hints.md § "Non-deductive (heuristic) hints").
 * It finds a line of jumps that leaves one peg (`findFinish`) and narrates each
 * jump by what this file has checked about it, which `add-pegs-hint` design D1
 * measured: a jump that is the only one left that can finish, a rival jump that
 * would cut a peg off for good, and one peg's run of jumps.
 *
 * Every jump removes a peg, so a plan recomputed after any move cannot cycle:
 * the peg count is the potential (docs/games/hints.md § "Recompute-stable
 * plans").
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { puzzleHintRefusal, SEARCH_OUT_OF_REACH } from "../../engine/hint-refusal.ts";
import type { Narration } from "../../engine/hint-words.ts";
import { NO_SOLUTION_FROM_HERE } from "../../engine/solve-failure.ts";
import { type Marked, say } from "./hint-text.ts";
import { findFinish, frozenPegs, type Jump, legalJumps, provedLost } from "./solver.ts";
import {
  GRID_HOLE,
  GRID_PEG,
  type PegsJump,
  type PegsMove,
  type PegsState,
} from "./state.ts";

type Step = HintStep<PegsMove>;

/** How far one rival jump is searched before giving up on proving it lost, and
 * how far all of a plan's proofs together; past either, the step makes no
 * claim it has not checked. */
const RIVAL_BUDGET = 20_000;
const PLAN_PROOF_BUDGET = 120_000;

/** The board after `j`. */
function jumped(s: PegsState, j: Jump): PegsState {
  const grid = new Uint8Array(s.grid);
  grid[j.from] = GRID_HOLE;
  grid[j.over] = GRID_HOLE;
  grid[j.to] = GRID_PEG;
  return { ...s, grid };
}

function toMove(s: PegsState, j: Jump): PegsJump {
  return {
    type: "jump",
    sx: j.from % s.w,
    sy: Math.floor(j.from / s.w),
    tx: j.to % s.w,
    ty: Math.floor(j.to / s.w),
  };
}

/**
 * The sentence for jump `j` from `s`, from what checks out:
 *
 * - **only** — every rival jump was searched to the end and none finishes. A
 *   rival that leaves a peg frozen is lost without a search, which is most of
 *   the proofs late in a game;
 * - **strands** — some rival jump leaves a peg frozen (`frozenPegs`), which the
 *   step outlines;
 * - **again** — the peg that jumped last jumps on;
 * - **plain** — the jump, and how many pegs it leaves.
 */
function narrate(
  s: PegsState,
  j: Jump,
  runs: boolean,
  budget: { left: number },
): Narration {
  const m: Marked = { from: j.from, to: j.to };
  const rivals = legalJumps(s).filter((r) => r.from !== j.from || r.to !== j.to);
  let cut: number | null = null;
  let allLost = rivals.length > 0;
  for (const r of rivals) {
    const after = jumped(s, r);
    const frozen = frozenPegs(after);
    if (frozen.length > 0) {
      cut ??= frozen[0];
      continue;
    }
    if (!allLost) continue;
    const spend = Math.min(RIVAL_BUDGET, budget.left);
    budget.left -= spend;
    if (spend === 0 || !provedLost(after, spend)) allLost = false;
  }
  if (allLost) return say.only(m);
  if (cut !== null) return say.strands(m, cut);
  if (runs) return say.again(m);
  let left = 0;
  for (const v of s.grid) if (v === GRID_PEG) left++;
  return say.plain(m, left - 1);
}

export function hint(state: PegsState): HintResult<PegsMove> {
  // Pegs' one verdict a player can see at a glance: a peg nothing can reach.
  const frozen = frozenPegs(state);
  if (frozen.length === 1) {
    return {
      ok: false,
      error: puzzleHintRefusal(
        "A peg is cut off where no other peg can ever reach it, so more than one peg will always be left. Undo to a position where it can still be jumped.",
      ),
    };
  }
  if (frozen.length > 1) {
    return {
      ok: false,
      error: puzzleHintRefusal(
        `${frozen.length} pegs are cut off where no other peg can ever reach them, so more than one peg will always be left. Undo to a position where they can still be jumped.`,
      ),
    };
  }

  const finish = findFinish(state);
  if (finish.kind === "lost") return { ok: false, error: NO_SOLUTION_FROM_HERE };
  if (finish.kind === "out-of-reach") return { ok: false, error: SEARCH_OUT_OF_REACH };

  const budget = { left: PLAN_PROOF_BUDGET };
  const steps: Step[] = [];
  let s = state;
  let last: Jump | null = null;
  for (const j of finish.jumps) {
    const runs = last !== null && last.to === j.from;
    const words = narrate(s, j, runs, budget);
    steps.push({
      move: toMove(s, j),
      explanation: words.text,
      words,
      ...(runs ? { continuesPrevious: true } : {}),
    });
    s = jumped(s, j);
    last = j;
  }
  return { ok: true, steps };
}

/** A jump is settled by its two ends, so the step's own jump lands exactly the
 * board the plan expects; anything else drops the plan. */
export function hintKeepTrack(
  m: PegsMove,
  step: Step,
  _s: PegsState,
): HintTrackVerdict {
  const want = step.move;
  if (m.type !== "jump" || want.type !== "jump") return "off";
  return m.sx === want.sx && m.sy === want.sy && m.tx === want.tx && m.ty === want.ty
    ? "completed"
    : "off";
}
