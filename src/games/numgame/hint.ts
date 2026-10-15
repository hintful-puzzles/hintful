/**
 * Numgame's hint: one combination of a shortest line from the board on
 * display, the one that works on the biggest number (`add-numgame-ts-port`
 * design D7). A request gives away one operation and no more of the line.
 *
 * No combination is ever forced, so this is a search hint
 * (docs/hints-search.md), but an exact one: the solver's search is
 * exhaustive, so the count of operations the step states is proved.
 *
 * A recomputed hint cannot cycle: each step lowers the fewest operations
 * still needed by exactly one, since the rest of the line still makes the
 * target and no shorter line can exist (§ "Recompute-stable plans").
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { type MarkedDeadEnd, markedDeadEnd } from "../../engine/hint-refusal.ts";
import { phrase } from "../../engine/hint-words.ts";
import { type Combination, say } from "./hint-text.ts";
import { findLine, nextStep, reachOf, type Step } from "./solver.ts";
import {
  executeMove,
  type NumgameMove,
  type NumgameState,
  normalized,
} from "./state.ts";

/** A combination on the way to the target, or the one that makes it. */
export const NUMGAME_RUNGS = ["step", "last"] as const;
export type NumgameRung = (typeof NUMGAME_RUNGS)[number];

type Plan = HintStep<NumgameMove, unknown, NumgameRung>;

/** The proof a player can see that the board is lost: the numbers left make
 * every value the solver lists, and the target is not one of them. */
export function hasNoSolution(state: NumgameState): false | MarkedDeadEnd {
  if (reachOf(state.slots).fewestOps(state.target) !== null) return false;
  return markedDeadEnd(
    phrase`The numbers left can no longer make ${String(state.target)}. Undo until they can.`,
  );
}

export function numgameHint(
  state: NumgameState,
): HintResult<NumgameMove, unknown, NumgameRung> {
  const found = findLine(state.slots, state.target);
  // The search is exhaustive, so it never runs out of reach, and a board it
  // finds lost is refused by `hasNoSolution` before a hint is asked; nor is a
  // hint asked of a solved board, so the line has a step.
  const expr = found.kind === "found" ? found.expr : undefined;
  if (found.kind !== "found" || expr === undefined || expr.kind === "number")
    throw new Error(`numgame: no line to hint on a board that is ${found.kind}`);

  const fewest = found.line.length;
  const step = nextStep(expr);
  const c = combination(state, step);
  const [rung, words] =
    fewest === 1
      ? (["last", say.last(c)] as const)
      : (["step", say.step(state.target, fewest, c)] as const);
  const move: NumgameMove = { kind: "combine", ...step };
  return { ok: true, steps: [{ move, rung, explanation: words.text, words }] };
}

/** The step's two numbers on `board`, and what they make. */
function combination(board: NumgameState, step: Step): Combination {
  const from = board.slots[step.from];
  const into = board.slots[step.into];
  if (!from || !into) throw new Error("numgame: a plan step names an empty place");
  const after = executeMove(board, { kind: "combine", ...step }).slots[step.into];
  return {
    from: { place: step.from, value: from.value },
    op: step.op,
    into: { place: step.into, value: into.value },
    makes: after?.value ?? 0,
  };
}

/** A combination is settled by its two numbers and its operator, so the step's
 * own, picked in either order, lands exactly the board the plan expects;
 * anything else drops the plan. */
export function numgameKeepTrack(
  m: NumgameMove,
  step: Plan | HintStep<NumgameMove>,
  s: NumgameState,
): HintTrackVerdict {
  const want = step.move;
  if (m.kind !== "combine" || want.kind !== "combine") return "off";
  const made = normalized(s.slots, m);
  return made.from === want.from && made.into === want.into && made.op === want.op
    ? "completed"
    : "off";
}
