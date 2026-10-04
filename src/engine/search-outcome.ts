/**
 * What a budgeted search for a finishing line established, and what a game's
 * hint, its rival judging and its Solve each make of that.
 *
 * A game that can be lost and is solved by searching has three answers about
 * a position: a line that finishes, a proof that none does, or neither once
 * the budget ran out. The search is the game's; what the three answers mean
 * to a player is the same in every such game, so it is said here once:
 *
 * - the hint refuses a lost position as one nothing finishes from, and one
 *   past the search as out of its reach ({@link searchRefusal});
 * - a rival move is judged by what the search settled after it
 *   ({@link searchVerdict}, for `rival-judging.ts`);
 * - Solve finishes from the player's position if a line is found there, else
 *   from the board as dealt ({@link solveBySearch}).
 *
 * The budget itself stays the game's, counted in positions and never in time.
 */

import type { SolveResult } from "./game.ts";
import { PUZZLE_NOT_REASONABLE, SEARCH_OUT_OF_REACH } from "./hint-refusal.ts";
import type { Verdict } from "./rival-judging.ts";
import { NO_SOLUTION, NO_SOLUTION_FROM_HERE } from "./solve-failure.ts";

/** A search that found no line: a proof there is none, or a budget spent. */
export type Unfinished = { readonly kind: "lost" } | { readonly kind: "out-of-reach" };

/** What a search established about a position; `line` is the moves that
 * finish from it, none on a finished board. */
export type SearchOutcome<Step> =
  | { readonly kind: "found"; readonly line: readonly Step[] }
  | Unfinished;

/** The hint's refusal where the search found no line. */
export function searchRefusal(outcome: Unfinished): {
  ok: false;
  error: typeof NO_SOLUTION_FROM_HERE | typeof SEARCH_OUT_OF_REACH;
} {
  return {
    ok: false,
    error: outcome.kind === "lost" ? NO_SOLUTION_FROM_HERE : SEARCH_OUT_OF_REACH,
  };
}

/** What a search after a rival move settled about that move. */
export function searchVerdict(outcome: SearchOutcome<unknown>): Verdict {
  if (outcome.kind === "found") return "finishes";
  return outcome.kind === "lost" ? "lost" : "unknown";
}

/**
 * Solve by search: the move `finish` makes of the line found from the
 * player's position, else of the line from the board as dealt, so that the
 * hint's out-of-reach refusal can honestly send a player here. Where neither
 * has a line, the failure says whether the dealt board was proved to have
 * none.
 */
export function solveBySearch<State, Step, Move>(
  orig: State,
  curr: State,
  find: (s: State) => SearchOutcome<Step>,
  finish: (from: State, line: readonly Step[]) => Move,
): SolveResult<Move> {
  let lost = false;
  for (const s of [curr, orig]) {
    const outcome = find(s);
    if (outcome.kind === "found") return { ok: true, move: finish(s, outcome.line) };
    lost = outcome.kind === "lost";
  }
  return { ok: false, error: lost ? NO_SOLUTION : PUZZLE_NOT_REASONABLE };
}
