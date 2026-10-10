# Design

What this says of the code was read on 2026-10-10, at the commit before the
change.

## What the twelve generators do

Read in full, one row a game. "The search" is the game's `searchAnswers`, and
"30" is a constant the game defined for itself.

| Game | What is drawn | What is changed, and how it is chosen | Kept where | Its bounds |
| --- | --- | --- | --- | --- |
| Sticks | Blocks and a fill with every clue, which the solver finishes | Each clue hidden in a shuffled order while the search says one within 30 | The solver stops short | One retry guard |
| ABCD, clues hidden | A random fill's clues, thrown away unless the search says one within 30 | Each clue hidden in a shuffled order while the search says one within 30 | The ladder stops short | One retry guard |
| ABCD, every clue | A random fill's clues | Nothing | The ladder stops short and the search says one | One retry guard |
| Pattern | A picture with no monochrome line | Nothing | The lines stop short and the search says one | One retry guard, shared with Easy |
| Crossing | Walls and a fill whose runs read as distinct numbers | Nothing | The solver stops short and the search says one | One retry guard, shared with Easy |
| Filling | A full board | Each region, then each clue, hidden in a shuffled order while the search says one within 30 | The solver stops short | One retry guard |
| Mosaic | An Easy board | Each clue hidden in a shuffled order while the search says one within 30; without aggressive generation, stopping at the first that stops the rule | The rule stops short | One retry guard |
| Palisade | An Easy board | Each clue hidden in a shuffled order while the search says one within 30 | The solver stops short | One retry guard |
| Separate | An Easy board | Each pair of letters in a region swapped, in a shuffled order, while the search says one within 30 | The solver stops short | One retry guard |
| Signpost | An Easy board | Each number but the first and last hidden in a shuffled order while the search says one within 30 | The solver stops short | One retry guard, shared with Easy |
| Range | An Easy board | Each symmetric pair of clues hidden, in the Easy strip's order, while the search says one within 30 | The rules stop short | One retry guard, shared with Easy |
| Net | A tree rewired where the solver is stuck, as Easy's is, until the search says one within 30 while the solver is still stuck; then scrambled and walled | The rewiring is Easy's own, stopped early | With walls, the solver still stops short | One guard for the network, one for the board |
| Rectangles | A division with each number on a random square of its rectangle | A number is moved out of the rectangle a second answer gives it, the answer taken from the search within 30, up to 200 moves | The solver and the hint both stop short | One retry guard shared with Easy, and the 200 |

## What they share

All twelve are one loop: draw a candidate, and keep it where the game's
deduction stops short and the search says it has one answer. They differ in
what happens to a candidate between the two:

- **Eight strip it** (Sticks, ABCD with clues hidden, Filling, Mosaic,
  Palisade, Separate, Signpost, Range): something the board shows is taken
  away, a thing at a time, each only while the search still proves one answer
  within 30 positions. All eight chose 30, and each wrote out the same
  paragraph on why the number is small.
- **Three keep it as drawn** (Pattern, Crossing, ABCD with every clue).
- **Two mend it** (Net, Rectangles): the candidate is changed until it has
  one answer. Net's mending is its Easy generator's rewiring with an earlier
  exit, and Rectangles' reads a second answer off the search to choose what
  to move. Neither is a strip, and they share nothing with each other.

Twelve of twelve fit the loop and eight of twelve the strip, which is past
the "about eight" that `tasks.md` asks for before building.

## What the engine takes

`dealUnreasonable` in `src/engine/answer-search.ts` owns the loop, its retry
guard, the keep test, and the strip's budget (`DEALING_BUDGET`, the 30). A
game gives it four things:

- `draw`: a candidate, or `null` where this try gave none.
- `strip`, where the game has one: take things from the board, asking the
  `one` it is handed after each.
- `deduced`: whether the game's deduction finishes a board.
- `answer`: the game's search of a board, within a budget.

Decisions, and why:

- **The keep test is asked of every candidate, a stripped one too.** A
  stripped board is one the search proves by construction, so the last
  question is redundant while every strip keeps its word. It costs one search
  of at most 30 positions on a board about to be dealt, and it makes "a dealt
  board has one answer" the engine's statement and not eight arguments. Net
  loses a shortcut for the same reason: a board with no walls was not asked
  again, and now every board is.
- **A candidate is asked before it is stripped.** ABCD did this itself, since
  a third of its fills run the budget out, and the others start from a board
  that passes at once. In the engine it is one rule: a strip is handed a
  board the search already proves.
- **The 30 is the engine's, with no override.** Nine games arrived at it and
  none at another number. A game that needs its own gets a field then.
- **Mending stays in the game's `draw`.** One hook could not serve both Net
  and Rectangles, and a hook used once is a hook the porter has to decide
  about. Both take `DEALING_BUDGET` for their own searches.
- **`deduced` is the solver, and the hint only where the game already asked
  it.** The lower cap of the contract is the solver and the hint together
  (`searchTierContract`). Asking the hint of every candidate would cost a
  whole replay on each draw the solver finishes, which in the games that keep
  a draw as it falls is nearly all of them (one 3x4 Pattern picture in
  100,000 is kept). A candidate the solver finishes is thrown away without
  asking the hint, as before, and Rectangles, whose hint finishes boards its
  solver does not, goes on asking both.
- **The greedy strip is not shared.** Sticks, ABCD and Palisade each have a
  ten-line `stripClues(numbers, rng, keeps)`, used at both tiers. The others
  strip regions, pairs of letters, flags, or pairs of clues in an order
  already drawn, and one skips what another may not. A helper general enough
  for all of them takes a "take this" and a "put it back" from the caller and
  is as long at the call as the loop it replaces.

## Whether the boards move

They do not. The keep test draws no randomness, and the loop draws in the
order each game's did. The one new early exit, a candidate thrown away before
its strip, cannot fire on a board the game's own generator used to strip:
ABCD already threw those away, and the other seven start from a board the
search proves in a position or two.

Measured, 2026-10-10: the generators of the commit before, run beside the
moved ones on the same seeds, at each game's first four presets and both
tiers, forty seeds each. All 3,840 boards came out the same, 160 a game and
tier, and none threw. The twelve games' tests pass with no fixture changed.

The tier-binding guard's whole sweep was run again on the moved generators,
as "Shared generation machinery is argued from economy" asks
(`npm run test:slow -- src/engine/difficulty-contract.test.ts`): it passes.

## How a later game is held to it

A guard in `src/engine/difficulty-contract.test.ts` deals an Unreasonable
board in every game whose contract `searchTierContract` made, and asserts the
engine's deal was what dealt it. Planted, with Crossing's Unreasonable boards
dealt by its Easy loop, it fails on Crossing.

Its population is taken from the contract and not from the tiers' names. The
first version took every game whose tiers are Easy and Unreasonable, and
found fourteen: **Bricks and Galaxies name their tiers the same and are not
this kind of game.** Their Unreasonable is the top rung of upstream's graded
solver, recursion inside the solver, with no `answer-search.ts` in it, and
their generators ask that solver what a board grades as. They stay as they
are. Whether either should move onto the search's two tiers is a question
about its solver, which this change did not read.

## What `hintFinishes` costs

Timed on 2026-10-10 on Easy boards, three a size, a board's time in each part
of the replay:

| Game and size | Plans | Steps | In the game's `hint` | In `executeMove` and `status` |
| --- | --- | --- | --- | --- |
| Pattern 10x10, 20x20, 30x30 | 1 | 65, 261, 543 | 1.8, 6.3, 16.9 ms | 0.1, 0.1, 0.2 ms |
| Sticks 5x5, 10x10, 12x12 | 1, 2, 3 | 21, 80, 116 | 1.1, 21, 66 ms | under 0.2 ms |
| Palisade 5x5, 8x6, 15x12 | 1 | 35, 76, 295 | 1.0, 0.9, 5.0 ms | 0.1 ms at most |
| Filling 9x7, 13x9, 17x13 | 1 | 22, 48, 91 | 1.3, 8.0, 32 ms | under 0.1 ms |
| Separate 4x4, 5x5, 6x6 | 1 | 22, 38, 57 | 0.6, 0.5, 0.7 ms | under 0.1 ms |

The replay is not where the cost is. A hint plans a board to its end in one
plan, three at most, and playing the plan out costs a fifth of a millisecond.
All of the time is the game's own planning, which is the game's to make
cheaper, as Rectangles' and Net's were. `hintFinishes` is left as it is.

## What the change found in a game

Nothing that is a bug. Two things for whoever is next in these files:

- Sticks takes minutes to deal an Easy board at 14x14 when its generator is
  called directly, and 1.8 s at 12x12. That is its fill being thrown away
  whole, which the deal's deadline bounds for a player.
- Only Rectangles and Net ask the hint as well as the solver when they deal
  an Easy board. The other ten rely on the hint finishing what the solver
  does, which the contract's guard checks on a sample of dealt boards.
