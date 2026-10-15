/**
 * Numgame's hint: a shortest line of combinations from the board on display,
 * offered whole, one step a combination (`add-numgame-ts-port` design D7).
 *
 * No combination is ever forced, so this is a search hint
 * (docs/hints-search.md), but an exact one: the solver's search is
 * exhaustive, so "at the fewest" is proved. What a step teaches is the line's
 * shape, the target split by the line's last operation into two numbers made
 * from separate tiles; the split is read once, from the plan, and every step
 * says which half it builds (§ "Hold a stable subgoal").
 *
 * The plan cannot cycle when recomputed: each step lowers the fewest
 * operations still needed by exactly one, since the rest of the line still
 * makes the target and no shorter line can exist (§ "Recompute-stable
 * plans").
 */

import type { HintResult, HintStep, HintTrackVerdict } from "../../engine/game.ts";
import { type MarkedDeadEnd, markedDeadEnd } from "../../engine/hint-refusal.ts";
import { phrase } from "../../engine/hint-words.ts";
import { type Combination, type Split, say } from "./hint-text.ts";
import { findLine, reachOf, type Step, stepsOf } from "./solver.ts";
import { executeMove, type NumgameMove, type NumgameState } from "./state.ts";

/** Where a step stands in its line. */
export const NUMGAME_RUNGS = ["first", "next", "last", "only"] as const;
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

  const line = found.line;
  const split: Split = {
    target: state.target,
    fewest: line.length,
    a: expr.a.value,
    op: expr.op,
    b: expr.b.value,
  };
  const onA = stepsOf(expr.a).length;
  const steps: Plan[] = [];
  let board = state;
  line.forEach((step, i) => {
    const c = combination(board, step);
    const half = i < onA ? split.a : split.b;
    const [rung, words] =
      line.length === 1
        ? (["only", say.only(c)] as const)
        : i === 0
          ? (["first", say.first(split, c, half)] as const)
          : i === line.length - 1
            ? (["last", say.last(c)] as const)
            : (["next", say.next(c, half)] as const);
    const move: NumgameMove = { kind: "combine", ...step };
    steps.push({
      move,
      rung,
      explanation: words.text,
      words,
      ...(i > 0 ? { continuesPrevious: true } : {}),
    });
    board = executeMove(board, move);
  });
  return { ok: true, steps };
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

/** A combination is settled by its two places and its operator, so the step's
 * own lands exactly the board the plan expects; anything else drops the plan,
 * the same two numbers the other way round included, since the result would
 * stand in the other place. */
export function numgameKeepTrack(
  m: NumgameMove,
  step: Plan | HintStep<NumgameMove>,
  _s: NumgameState,
): HintTrackVerdict {
  const want = step.move;
  if (m.kind !== "combine" || want.kind !== "combine") return "off";
  return m.from === want.from && m.into === want.into && m.op === want.op
    ? "completed"
    : "off";
}
