/**
 * A deductive game's second tier: a board with exactly one answer that the
 * game's deductions do not reach, and the search that proves it has one.
 *
 * Such a game has two tiers. Easy is what its deductions and its hint finish.
 * Unreasonable is a board a search by trial and error over those deductions
 * proves has one answer. The deduction, and what to assume where it stops, are
 * the game's. What is the same in every such game is here:
 *
 * - the four things a search can establish ({@link Answer}), and the loop that
 *   establishes them ({@link searchAnswers});
 * - the answer kept for each board ({@link answerCache}), since Solve and the
 *   mistake check both go by it at either tier;
 * - what Solve says of each ({@link solveFromAnswer});
 * - the difficulty contract ({@link searchTierContract});
 * - the two tiers, their params field and its codec segment
 *   ({@link searchTierItem}, {@link searchTierSegment}).
 *
 * The hint never searches: it ends in `DEDUCTION_EXHAUSTED` where nothing
 * follows, which the midend lets through on a tier named Unreasonable.
 */

import {
  type DifficultyContract,
  difficultyItem,
  type TierField,
  tierNames,
} from "./difficulty.ts";
import type { ParamConfigItem, SolveResult } from "./game.ts";
import { PUZZLE_NOT_REASONABLE } from "./hint-refusal.ts";
import { choice, type ParamsSegment } from "./params-codec.ts";
import { MULTIPLE_SOLUTIONS, NO_SOLUTION } from "./solve-failure.ts";

/** A board the game's deductions, and its hint, finish. */
export const DIFF_EASY = 0;
/** A board with one answer that the deductions do not reach. */
export const DIFF_UNREASONABLE = 1;

/** The two tiers' names, indexed by {@link DIFF_EASY} and
 * {@link DIFF_UNREASONABLE}. */
export const SEARCH_TIER_NAMES: readonly string[] = tierNames(2, { search: true });

/** The Custom dialog's difficulty field for the two tiers. `doc` says what
 * each asks of a player in this game. */
export function searchTierItem<P>(
  field: TierField<P>,
  doc: string,
): ParamConfigItem<P> {
  return difficultyItem(SEARCH_TIER_NAMES, field, { doc });
}

/**
 * The tier in a params string: `de` or `du`, written in the full form only.
 * A board's ID leaves it out, since a board is graded as it loads, and a
 * string from before the game had tiers has no `d` and reads as the default,
 * which is to be {@link DIFF_EASY}.
 */
export function searchTierSegment<P>(
  config: readonly ParamConfigItem<P>[],
): ParamsSegment<P> {
  return choice(config, "d", "difficulty", "eu", { full: true });
}

/** What a search for a board's answers established: its one answer, a proof
 * that it has several or none, or neither once the budget ran out. */
export type Answer<Solution> =
  | { readonly kind: "one"; readonly solution: Solution }
  | { readonly kind: "several" }
  | { readonly kind: "none" }
  | { readonly kind: "out-of-reach" };

/** Where a game's deduction leaves a position: finished and correct, short of
 * finished, or holding something no answer can. */
export type Deduced = "solved" | "stuck" | "contradiction";

/** A game's side of {@link searchAnswers}. A `Position` is a board with some
 * of it decided, in whatever form the game's deduction works on. */
export interface AnswerSearch<Position, Solution> {
  /** The board as dealt. */
  start: Position;
  /**
   * Deduce on `position`, in place, as far as the game's deduction goes. It
   * must be able to say `"contradiction"`: a wrong assumption is found no
   * other way, and a deduction that stops quietly on an impossible position
   * turns it into a second answer or an endless search. `"solved"` is a
   * position checked against every rule, not one merely full.
   */
  deduce(position: Position): Deduced;
  /**
   * The positions a stuck one divides into: one undecided thing assumed each
   * way it can go, on a copy each. Between them they hold every answer of
   * `position` and no answer twice. They are tried in the order given.
   */
  assume(position: Position): readonly Position[];
  /** The answer a solved position holds. */
  solution(position: Position): Solution;
  /**
   * The positions the search may try before it gives up, counted in
   * positions and not in time so that a board is dealt or refused the same on
   * every machine. It decides which Unreasonable boards exist: one that needs
   * more is thrown away when dealing and refused when pasted, so lowering it
   * refuses boards in saved games. Size it from what dealt boards need.
   */
  budget: number;
}

/**
 * Count a board's answers up to two, by trial and error over the game's own
 * deduction: where it stops, assume something each way and deduce on. This is
 * the search an Unreasonable board asks of its player, and it is what proves
 * such a board has exactly one answer, which the deduction cannot: stopping
 * short, it has shown neither a second answer nor none.
 */
export function searchAnswers<Position, Solution>(
  search: AnswerSearch<Position, Solution>,
): Answer<Solution> {
  let found: Position | null = null;
  let left = search.budget;
  // Depth first: the positions still to try, the next one last.
  const stack: Position[] = [search.start];
  for (let top = stack.pop(); top !== undefined; top = stack.pop()) {
    if (left-- <= 0) return { kind: "out-of-reach" };
    const verdict = search.deduce(top);
    if (verdict === "contradiction") continue;
    if (verdict === "solved") {
      if (found !== null) return { kind: "several" };
      found = top;
      continue;
    }
    const next = search.assume(top);
    for (let i = next.length - 1; i >= 0; i--) stack.push(next[i] as Position);
  }
  if (found === null) return { kind: "none" };
  return { kind: "one", solution: search.solution(found) };
}

/**
 * Each board's answer, searched once: the mistake check asks after every
 * move. `Board` is the part of a state every state of one game shares by
 * reference and no move replaces, so the player's marks are not in the key
 * and `search` must not read them.
 */
export function answerCache<Board extends object, Solution>(): (
  board: Board,
  search: () => Answer<Solution>,
) => Answer<Solution> {
  const answers = new WeakMap<Board, Answer<Solution>>();
  return (board, search) => {
    let answer = answers.get(board);
    if (answer === undefined) {
      answer = search();
      answers.set(board, answer);
    }
    return answer;
  };
}

/** Solve from the search, which knows the answer at either tier and says
 * which of the ways a board can lack one it proved. `move` makes the game's
 * solve move of the answer. */
export function solveFromAnswer<Solution, Move>(
  answer: Answer<Solution>,
  move: (solution: Solution) => Move,
): SolveResult<Move> {
  switch (answer.kind) {
    case "one":
      return { ok: true, move: move(answer.solution) };
    case "several":
      return { ok: false, error: MULTIPLE_SOLUTIONS };
    case "none":
      return { ok: false, error: NO_SOLUTION };
    case "out-of-reach":
      return { ok: false, error: PUZZLE_NOT_REASONABLE };
  }
}

/**
 * The two tiers' contract. At {@link DIFF_EASY} a board is solved where
 * `deductionFinishes` says so, which is what the game answered
 * `finishesByDeduction` with before it had tiers, less its Solve: the
 * deduction and the hint (`hintFinishes`), since the hint is what a player is
 * left with where it stops. At {@link DIFF_UNREASONABLE} it is solved where
 * the search says one answer.
 */
export function searchTierContract<Params, State>(game: {
  newState(p: Params, desc: string): State;
  deductionFinishes(state: State): boolean;
  answerOf(state: State): Answer<unknown>;
}): DifficultyContract<Params> {
  return {
    solveAtCap(p, desc, cap) {
      const state = game.newState(p, desc);
      if (cap === DIFF_EASY)
        return game.deductionFinishes(state) ? "solved" : "unsolved";
      const answer = game.answerOf(state);
      if (answer.kind === "one") return "solved";
      return answer.kind === "none" ? "impossible" : "unsolved";
    },
  };
}
