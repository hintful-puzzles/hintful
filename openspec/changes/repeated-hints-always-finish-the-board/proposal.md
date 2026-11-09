# repeated-hints-always-finish-the-board

**Status: filed on the owner's word (2026-11-09)**, from a Path playtest on
their phone, and handed to a fresh session to take on. Player-visible work
the owner named, so its result is brought to them before it is archived.

## Why

On a board with a mistake, the hint refuses: "Fix the highlighted mistakes
first; a hint can't deduce from a wrong board." The mistakes are
highlighted, but applying that hint does nothing (owner's screenshot: Path
6x6 Easy, a line from the 4 to the 5 drawn out of order, in red). A player
who leans on the hint to get unstuck gets stuck on the hint itself.

The owner's ask, in two parts:

1. **Applying the hint on a wrong board clears what is wrong**, and the
   engine does it, not each game.
2. **The invariant: whatever the board's state, pressing Hint over and over
   finishes the board.** Not just the mistakes case: every way the hint can
   refuse today is a place this breaks.

## Where it stands (read 2026-11-09; re-check before relying on it)

- The midend refuses with `FIX_MISTAKES_FIRST` before it asks the game at
  all, in `computeHintPlan` (`src/engine/midend.ts`), when
  `this.findMistakes() > 0`; the mistakes are on the overlay, and no move is
  attached.
- A game's mistakes are its own type (`Game.findMistakes`,
  `src/engine/game.ts`). The engine can list them and draw them, but has no
  way to turn one into a move that takes it off. That is the engine's gap:
  a game declares how a mistake is cleared, or the mistake type carries
  enough for the engine to build the clearing move (an edge game's mistake is
  an edge, whose clearing is "set it open"; a cell game's is a cell, whose
  clearing is "empty it"). Find the shapes by reading every game's
  `findMistakes`, and prefer a declaration the engine consumes over a
  per-game function (doctrine: "Declare what the engine consumes").
- The other refusals are listed in `src/engine/hint-refusal.ts`. Each is a
  place the invariant fails today, and each needs an answer:
  - `FIX_MISTAKES_FIRST`: clear the mistakes (above).
  - Dead ends a game names (`puzzleDeadEnd`, `markedDeadEnd`,
    `CONTRADICTION_UNLOCALIZED`): the board holds no mistake against the
    answer yet cannot finish. What takes the player out: clearing the marked
    cause, or going back to the last position that could still finish?
  - `DEDUCTION_EXHAUSTED` (Unreasonable tiers only), `SEARCH_OUT_OF_REACH`,
    `NO_MOVE_WORTH_MAKING`: the board is right but the hint has no reasoned
    step. A board with one answer can still be finished from the answer;
    what does such a step say, given that a hint explains why a move is
    forced (doctrine)?
  - `PUZZLE_NOT_REASONABLE`, `SOLUTION_UNKNOWN`, `NO_SOLUTION_FROM_HERE`, and
    `GAME_OVER` (a lost game, as in Mines): can the invariant hold at all,
    and if not, which exceptions does it name?
- Games with no `hint` say "This game does not support hints"; the doctrine
  says every game has one, so check whether any still lacks it.

## What Changes

- A refusal that has a way forward carries a move, and applying it makes
  that move: on a wrong board, a move that clears every mistake the overlay
  shows, in one step of Undo. The engine builds it from what each game
  declares.
- Every refusal that can be given a way forward gets one, so that repeated
  presses finish any board, from any position a player can reach. The
  session decides each refusal's answer from the list above, and brings the
  owner any that is a real choice of what a player sees.
- The help's hints page (`help/features.md` §Hints) says what applying a
  refusal does.

## The guard

A cross-game check that the invariant holds: for every game with a `hint`
(its population derived from what each game is, never a list), deal a board,
put it in a state a player could reach that is wrong (random moves, wrong
entries), and press Hint until the board is solved, within a bound the check
states. It must fail before it is trusted: plant a refusal that carries no
move and see it fail. It will be costly at the whole catalog's scale; size it
by `docs/testing.md` § "What runs when" and the rule that a test earns its
runtime.

## Read first

`docs/hints.md` (refusals, the plan, the guards), `docs/doctrine.md`,
`docs/method.md`, and `src/engine/hint-refusal.ts`'s header.

## Acceptance

- On the owner's board shape (Path, a line between numbers out of order),
  applying the hint clears the wrong lines and the next press gives a step.
- The guard holds across the catalog, and fails with a refusal planted that
  carries no move.
- The owner tries it on their phone.
