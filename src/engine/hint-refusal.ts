/**
 * What a hint says when it will not give one.
 *
 * A refusal is the message a player is *most* likely to meet without warning and
 * least likely to interpret correctly, and `help/features.md` §Hints teaches the
 * two that matter as a pair — "there is a mistake on the board" and "deduction
 * has run out" call for opposite responses. That contract is only keepable if
 * the same situation says the same thing in every game, since a player moves
 * between games freely.
 *
 * **`HintResult`'s error is a {@link HintRefusal}**, so a game cannot return a
 * sentence of its own by accident: it says one of the kinds below, or names a
 * dead end of its own through {@link puzzleDeadEnd} or {@link markedDeadEnd},
 * the named escapes.
 *
 * **Every refusal says whether it is a dead end** ({@link isDeadEnd}): whether
 * its advice is to go back. The check behind Check & save asks the hint for
 * exactly that, and refuses to save a position the hint says to undo out of,
 * since a save is somewhere to come back to.
 *
 * **The midend opens every hint with two refusals of its own**, before it asks
 * the game: {@link ALREADY_SOLVED} for a board whose status is solved, then
 * {@link FIX_MISTAKES_FIRST}, with the mistakes highlighted, for a board on
 * which the game's `findMistakes` finds some. So a `hint` is only ever asked
 * about an unfinished board with nothing wrong on it that the game can see, and
 * neither is a refusal a game can give at all.
 *
 * **What a game may still differ on.** The bar is whether we can say what a game
 * would legitimately want to do differently, and there are five real answers:
 * a game whose board can be *inconsistent without any single cell being
 * provably wrong* needs {@link CONTRADICTION_UNLOCALIZED}, because no highlight
 * will appear; a **non-deductive** game must not say "deduced" at all
 * ({@link NO_MOVE_WORTH_MAKING}); a game whose hint is a bounded **search** has
 * a reach rather than a deduction, and past it can only say so
 * ({@link SEARCH_OUT_OF_REACH}); a game that can be lost says so
 * ({@link GAME_OVER}); and a game with a genuinely game-shaped dead end says so
 * in its own words, through {@link puzzleDeadEnd} (Inertia's dead ball), and
 * points at its cause where it knows it, through {@link markedDeadEnd} (Pegs'
 * cut-off pegs).
 */

import type { Narration } from "./hint-words.ts";
import { NO_SOLUTION_FROM_HERE, SOLUTION_UNKNOWN } from "./solve-failure.ts";

/**
 * The board is finished. Nothing to hint.
 *
 * Only the midend says this, for a board whose status is solved. A game's
 * status is judged from the board alone, so every finished board's status says
 * solved, and the sentence is not a {@link HintRefusal} a game can give.
 */
export const ALREADY_SOLVED = "This board is already solved.";

/**
 * Something on the board contradicts the solution, and the offending cells
 * **are about to be highlighted**. Only the midend says it, and only after the
 * game's `findMistakes` has found something to highlight, which is the promise
 * the sentence makes. It is therefore not a {@link HintRefusal}.
 */
export const FIX_MISTAKES_FIRST =
  "Fix the highlighted mistakes first; a hint can't deduce from a wrong board.";

/**
 * The board is inconsistent, but no individual entry can be proved wrong — so
 * there is nothing for `findMistakes` to light up, and
 * {@link FIX_MISTAKES_FIRST} would point at a highlight that never comes.
 * Distinct because the player's next action differs: they cannot fix the cell
 * they are shown, only undo or clear what they are unsure of.
 */
export const CONTRADICTION_UNLOCALIZED =
  "These entries contradict each other, so one of them must be wrong. Undo, or clear the ones you are unsure of.";

/**
 * Nothing further follows from what is on the board. The counterpart to
 * {@link FIX_MISTAKES_FIRST}: the board is *sound*, the reasoning has simply run
 * out — which is what a tier named `Unreasonable` promises can happen.
 *
 * **There is one situation here, not two, and that is a measurement rather than
 * a judgment** (2026-09-08): walking every preset of every hinting game found
 * **thirteen refusals and every one was on a board whose tier permits search**;
 * nothing refused on a deduction-complete tier at any size, in any mode. A
 * wording that hedges about whether trial and error is expected therefore
 * describes a state no player occupies. `hint-resume.test.ts` holds that: a
 * refusal outside a search-permitting tier fails the walk.
 *
 * **The wording is Galaxies', the one that went through owner acceptance**, and
 * the only one that tells the player what to *do*. A refusal that says only
 * that nothing follows leaves them unable to tell a puzzle demanding a guess
 * from a broken hint, which is the pair `help/features.md` §Hints teaches as
 * calling for opposite responses.
 */
export const DEDUCTION_EXHAUSTED =
  "Nothing further follows by deduction here. This board's difficulty allows positions that need trial and error: save a checkpoint, try one, and undo if it breaks.";

/** The non-deductive counterpart to {@link DEDUCTION_EXHAUSTED}: a game that
 * walks a player toward a solution rather than teaching a technique has no
 * deduction to run out of, so it must not claim one.
 *
 * **It is a claim about the board, and only a game that can check it may say
 * it.** Every remaining call site is a construction that cannot come back empty
 * on an unsolved board — Fifteen's row-by-row placement, Flood's solver,
 * Inertia's tour — so the message is a backstop that states the truth if it
 * ever fires. A game whose hint is a bounded *search* is in the opposite
 * position: an empty result there says only that it did not find one, which is
 * {@link SEARCH_OUT_OF_REACH}. */
export const NO_MOVE_WORTH_MAKING = "No move here would get you closer.";

/**
 * A hint that *searches* has a **reach**, and this board is past it.
 *
 * The counterpart to {@link DEDUCTION_EXHAUSTED} for a game with nothing to
 * deduce. A deductive game's hint is complete for its tier or the tier admits
 * search, and either way it can say something true about the position. A game
 * like Sixteen has neither: its hint plans by searching ahead a bounded number
 * of moves, and past that bound the only true thing to say is that it did not
 * find a way — never {@link NO_MOVE_WORTH_MAKING}, which asserts something
 * about the board that the search never established.
 *
 * The distinction is not a nicety. Sixteen's tangled endgames are solvable
 * boards a dozen moves from home on which every single slide looks worse, and
 * the player meeting them had followed thirty hints to get there; being told
 * that no move would help is both false and a reason to stop playing.
 *
 * **So it says what to do instead, in the two ways that work.** Playing on
 * changes the board, and a board the search could not reach is often one move
 * from one it can; revealing the answer ends the game but is honest about doing
 * so. The control it names is the Menu's `Show solution…` — deliberately not
 * `Auto-solve for me`, which is *continuous hinting* and would refuse for the
 * same reason the hint just did. Naming it would have been advice that cannot
 * work, on the one screen a player has just been let down on.
 *
 * `hint-resume.test.ts` accepts this as an honest end to its walk, but only
 * from a game whose hint really is a bounded search — derived from the game's
 * own source, not from a roster.
 */
export const SEARCH_OUT_OF_REACH =
  "I can't find a way home from here: this position is further ahead than the hint can search. Play a few moves of your own and ask again, or take the answer from Show solution.";

/** The puzzle itself cannot be reasoned about — not a statement about anything
 * the player did. Kept apart from the refusals above because no action of
 * theirs will clear it. */
export const PUZZLE_NOT_REASONABLE = "This puzzle's solution can't be determined.";

/**
 * The game has been lost and takes no more moves: Guess's answer is revealed,
 * Flood's board is flooded past its move limit. The status says lost. The
 * midend refuses Solve there itself, since no Solve move can win the board back,
 * but leaves a hint to the game, because a lost board is not always over: Flood
 * plays on past its limit, and its hint still leads home.
 */
export const GAME_OVER = "This game is over. Undo to play on, or start a new one.";

declare const puzzleDeadEndBrand: unique symbol;

/** A dead end in a game's own words, made only by {@link puzzleDeadEnd}. */
type PuzzleDeadEnd = string & { readonly [puzzleDeadEndBrand]: true };

/**
 * A dead end only this puzzle has, in its words, where naming it is the whole
 * of what the hint can give: Inertia's dead ball, Mines' opened mine. Always a
 * dead end ({@link isDeadEnd}), so the sentence says how to go back.
 *
 * There is no escape for a game's own refusal that is *not* a dead end, because
 * no game has needed one.
 *
 * `hint-refusal.test.ts` reads every call and fails a sentence two games pass,
 * since a situation two games share is a kind, and a sentence that spells out a
 * kind.
 */
export function puzzleDeadEnd(sentence: string): PuzzleDeadEnd {
  return sentence as PuzzleDeadEnd;
}

/** A hint's refusal that points at its cause: the sentence, and the words it
 * is made from, whose references the board marks while the refusal is shown. */
export interface MarkedDeadEnd {
  readonly ok: false;
  readonly error: PuzzleDeadEnd;
  readonly words: Narration;
}

/**
 * A {@link puzzleDeadEnd} whose words name the elements that cause it (Pegs'
 * cut-off pegs, Inertia's stranded gems), so the board marks them as it marks a
 * step's. A whole `HintResult`, so that the sentence is the words' text and the
 * two cannot disagree.
 *
 * Write the words as a `phrase` template at the call: `hint-refusal.test.ts`
 * reads them there, as it reads a {@link puzzleDeadEnd}'s sentence.
 */
export function markedDeadEnd(words: Narration): MarkedDeadEnd {
  return { ok: false, error: puzzleDeadEnd(words.text), words };
}

/**
 * Every reason a game's `hint` can give for not hinting. Two are Solve's
 * ({@link NO_SOLUTION_FROM_HERE}, {@link SOLUTION_UNKNOWN}), because a hint
 * meets the same facts: a position nothing finishes from, and a game ID that
 * came without its solution.
 */
export type HintRefusal =
  | typeof CONTRADICTION_UNLOCALIZED
  | typeof DEDUCTION_EXHAUSTED
  | typeof NO_MOVE_WORTH_MAKING
  | typeof SEARCH_OUT_OF_REACH
  | typeof PUZZLE_NOT_REASONABLE
  | typeof GAME_OVER
  | typeof NO_SOLUTION_FROM_HERE
  | typeof SOLUTION_UNKNOWN
  | PuzzleDeadEnd;

/**
 * Whether each kind is a dead end: whether its advice is to go back. Typed over
 * every kind, so a kind added without a verdict fails the typecheck, and
 * `hint-refusal.test.ts` holds each verdict to its sentence.
 *
 * - **Dead ends**: the entries contradict each other, the game is over, or
 *   nothing was found that finishes from here. That last may be a proof or a
 *   heuristic's failure, and the sentence says only what was found; either way
 *   its advice is undo.
 * - **Not**: deduction ran out on a sound board, a search ran past its reach, no
 *   move would help, or the puzzle itself cannot be reasoned about. None says
 *   this position is worse than an earlier one.
 */
const DEAD_END: Record<Exclude<HintRefusal, PuzzleDeadEnd>, boolean> = {
  [CONTRADICTION_UNLOCALIZED]: true,
  [GAME_OVER]: true,
  [NO_SOLUTION_FROM_HERE]: true,
  [DEDUCTION_EXHAUSTED]: false,
  [SEARCH_OUT_OF_REACH]: false,
  [NO_MOVE_WORTH_MAKING]: false,
  [PUZZLE_NOT_REASONABLE]: false,
  [SOLUTION_UNKNOWN]: false,
};

/** Whether `refusal` says the position is a dead end. A sentence that is no
 * kind's was made by {@link puzzleDeadEnd}, since the type admits no other. */
export function isDeadEnd(refusal: HintRefusal): boolean {
  return Object.hasOwn(DEAD_END, refusal)
    ? DEAD_END[refusal as keyof typeof DEAD_END]
    : true;
}
