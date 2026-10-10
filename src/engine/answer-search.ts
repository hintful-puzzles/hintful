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
 *   ({@link searchTierItem}, {@link searchTierSegment});
 * - the deal of an Unreasonable board ({@link dealUnreasonable}): the loop,
 *   its bound, and the test that keeps a board.
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
import { retryLimit } from "./retry-limit.ts";
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
  const found = solvedPositions(search, 2);
  if (found === null) return { kind: "out-of-reach" };
  if (found.length === 0) return { kind: "none" };
  if (found.length > 1) return { kind: "several" };
  return { kind: "one", solution: search.solution(found[0] as Position) };
}

/**
 * The solved positions the search of {@link searchAnswers} comes to, the first
 * `limit` of them, or null where the budget ran out before it had them. A
 * generator that knows one answer, the one it dealt, asks for two: the other
 * is where its board has to change to have one.
 */
export function solvedPositions<Position, Solution>(
  search: AnswerSearch<Position, Solution>,
  limit: number,
): Position[] | null {
  const found: Position[] = [];
  let left = search.budget;
  // Depth first: the positions still to try, the next one last.
  const stack: Position[] = [search.start];
  for (let top = stack.pop(); top !== undefined; top = stack.pop()) {
    if (left-- <= 0) return null;
    const verdict = search.deduce(top);
    if (verdict === "contradiction") continue;
    if (verdict === "solved") {
      found.push(top);
      if (found.length === limit) return found;
      continue;
    }
    const next = search.assume(top);
    for (let i = next.length - 1; i >= 0; i--) stack.push(next[i] as Position);
  }
  return found;
}

/**
 * The positions the search may try on a board that is being made, far under
 * what a game allows a pasted one. A strip stops only when the search can no
 * longer prove one answer, so it takes a board up to whatever the search is
 * allowed: this is how hard a stripped board is, and under a game's whole
 * budget every board came out at the edge of it (ABCD, 2026-10-10: a median
 * of 1,728 positions of 2,000 on a 6x6, where a board with every clue showing
 * needs 9).
 *
 * Measured in each game that strips, the same day: at 30 a dealt board needs
 * a median of 3 to 29 positions, and trying one thing and following the
 * deduction from it finishes nearly every one. At 10 a number that breaks a
 * rule the moment it is written settled 24 of 66 Filling boards, which is a
 * deduction the solver lacks and not a search.
 */
export const DEALING_BUDGET = 30;

/** A game's side of {@link dealUnreasonable}: what is about its puzzle. */
export interface UnreasonableDeal<Board> {
  /** Names the game and the size where no board is found. */
  label: string;
  /**
   * A candidate: everything of a try that comes before the tier is asked
   * for, or `null` where this try gave none. A game whose generator mends a
   * board toward one answer does that here.
   */
  draw(): Board | null;
  /**
   * Take from `board`, in place, what it shows a player (a clue, a given, the
   * order of two letters), asking `one` after each thing taken and putting
   * back what it refuses. `one` is the search within {@link DEALING_BUDGET},
   * and the board it is handed is one `one` already holds of. Left out, a
   * candidate is kept or thrown away as drawn.
   */
  strip?(board: Board, one: () => boolean): void;
  /** Whether the game's deduction finishes `board`, by its solver and by
   * whatever else of its hint could finish one the solver does not. */
  deduced(board: Board): boolean;
  /** The game's search of `board`, within `budget` positions or the game's
   * own where none is given. */
  answer(board: Board, budget?: number): Answer<unknown>;
}

/**
 * Deal an Unreasonable board: draw candidates until one has a single answer
 * that the game's deduction stops short of. Every try is under the deal's
 * bound (`retry-limit.ts`), so a size with no such board is answered and not
 * waited for.
 *
 * A candidate with a strip is asked within {@link DEALING_BUDGET} throughout,
 * the last time as well: the strip leaves a board the search proves within
 * it, and a strip that did not would be caught here.
 */
export function dealUnreasonable<Board>(deal: UnreasonableDeal<Board>): Board {
  const { strip } = deal;
  const budget = strip === undefined ? undefined : DEALING_BUDGET;
  const one = (board: Board) => deal.answer(board, budget).kind === "one";
  const attempt = retryLimit(deal.label);
  for (;;) {
    attempt();
    const board = deal.draw();
    if (board === null) continue;
    if (strip !== undefined) {
      if (!one(board)) continue;
      strip(board, () => one(board));
    }
    if (!deal.deduced(board) && one(board)) return board;
  }
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
  const contract: DifficultyContract<Params> = {
    solveAtCap(p, desc, cap) {
      const state = game.newState(p, desc);
      if (cap === DIFF_EASY)
        return game.deductionFinishes(state) ? "solved" : "unsolved";
      const answer = game.answerOf(state);
      if (answer.kind === "one") return "solved";
      return answer.kind === "none" ? "impossible" : "unsolved";
    },
  };
  searchTierContracts.add(contract);
  return contract;
}

const searchTierContracts = new WeakSet<object>();

/**
 * Whether `contract` is one {@link searchTierContract} made: the games whose
 * Unreasonable tier is this module's, apart from a game that names its tiers
 * the same and grades them by a solver of its own (Bricks, Galaxies).
 */
export function isSearchTierContract(contract: object): boolean {
  return searchTierContracts.has(contract);
}
