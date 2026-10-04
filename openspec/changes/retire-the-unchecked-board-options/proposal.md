# retire-the-unchecked-board-options

Scaffolded 2026-10-02 as `let-a-board-waive-the-deduction-promise`, by
`reach-every-declared-mark`. Redirected by the owner on 2026-10-04, before any
of it was built: *"I don't quite like the idea of these games have a checkbox
instead of what the other games have … fold them into the same engine approach,
with no unsolvable games, and no games that can't be solved deductively unless
Unreasonable."*

## Why

When a hint returns `DEDUCTION_EXHAUSTED`, the midend asks `permitsSearch`
whether the board was ever promised to solve by deduction. Only a tier named
Unreasonable releases that promise; anywhere else the midend throws and the
player sees the crash dialog.

Five games carried an upstream checkbox that switches the generator's checks
off: Rectangles' and Net's "Ensure unique solution", Mines' and Same Game's
"Ensure solubility", Pearl's "Allow unsoluble". The scaffold proposed a second
way to release the promise, declared on the checkbox, with its own refusal
sentence. Measured before building it (2026-10-04, boards dealt with the box
unticked and walked by hints):

| Game, params | Boards | Hint ran out |
|---|---|---|
| Rectangles 4x4 | 150 | 103 |
| Rectangles 7x7 | 60 | 39 |
| Net 5x5 | 150 | 3 |
| Net 5x5 wrapping | 150 | 65 |
| Pearl 6x6, either tier | 80 | 67 |

The box is not a difficulty. In Rectangles, Net and Pearl the only test for one
answer is the deductive solver finishing, so an unticked board is an unfiltered
one, and most have several answers. Those boards already broke the rule
`play-only-boards-with-one-answer` set a day after the scaffold: Rectangles' and
Pearl's `findMistakes` return nothing on a board the solver does not finish, so
Check & Save checked nothing there, and `loadDesc` could not see it because
these games' `solve` returns an answer regardless (0 of the 670 boards above
were refused).

So there is nothing a game would legitimately want here that a tier named
Unreasonable does not already say. The option goes, and the promise keeps one
source.

## What Changes

- **The five options are removed.** Each generator always applies its checks.
  The Custom dialog loses the field and the "ambiguous" / "risky" label.
- **The params codecs read past upstream's letter** (`a` in Rectangles, Net and
  Mines, `n` in Pearl, `r` in Same Game), so an ID that asks for an unchecked
  board deals a checked one. Nothing writes the letter.
- **Loading holds a board to the promise.** `loadDesc` refuses a board
  deduction cannot finish (`DESC_NOT_DEDUCIBLE`) unless its tier permits search.
  A tiered game is asked through its difficulty contract: the board loads when
  some cap solves it, whatever tier the ID states. An untiered deductive game
  declares `Game.finishesByDeduction`; Rectangles, Net and Mines do. A game with
  a `nonUniqueTiers` tier (Dominosa) is not asked.
- **A save is asked too.** A save that carries a private desc (Mines) rebuilds
  from a layout with no first click, so the midend asks the public desc.
- **Narrower params.** With the checks always on, Mines needs a grid more than 2
  squares each way, wrapping Net cannot be exactly 2 wide or high, and Same Game
  needs 3 colors. Each was already the rule with the box ticked.
- **The eight frozen fixtures dealt unchecked are retired**, and
  `upstream-descs.test.ts` holds every fixture that remains to "dealt checked".

## Compatibility

Owner-approved 2026-10-04: a game ID for a board dealt with the box unticked
stops loading where the board needs a guess. An unchecked board that happens to
be deducible still loads (one of upstream's two Rectangles fixtures is), and
Same Game has no solver to ask, so any Same Game board loads.

Not broken, and held by `upstream-descs.test.ts`: every desc upstream's
generators wrote with their checks on still loads, in every game. The new
verdict refused none of them across the tiered games.

## What this does not close

Loading asks each game's **solver**, and Net's and Rectangles' hints are weaker
than their solvers: 62 of 261 solver-unique wrapping 5x5 Net boards, 14 of 120
at 7x7, and 2 of 84 Rectangles 9x9 boards at expansion 0.5 are past the hint.
Our generators never deal such a board. One that upstream dealt loads, and its
hint runs out and throws, as it did before this change. Refusing them at load
would break IDs upstream writes with its checks on, which is a separate call:
`close-the-solver-hint-gap-in-net-and-rect`.

Mines' door is the hint's own plan, and its generator's is `minesolve`. No
board has separated the two (0 of 980, `derive-completion-from-the-position`).

Rectangles' `line` rung has fired only on boards the rungs do not finish (3 of
315 unchecked deals, 0 of 6,000 checked). It stays in `warm-repaint.test.ts`'s
`UNREACHED` with that reason, and the question of whether it is dead belongs to
the same follow-up, since strengthening the rungs changes the answer.

## Wording for the owner

`DESC_NOT_DEDUCIBLE`: *"This game ID's puzzle needs trial and error, and only
puzzles that deduction alone solves can be played here."*

`help/differences.md` gains an entry under "In particular puzzles".

## Hints to pull in

None.
