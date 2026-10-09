# Design

Written 2026-10-09 when the change was filed, and settled 2026-10-10 by the
session that built it. What each decision came to is under it.

## Context

`loadDesc` gives a pasted description three verdicts: its shape, its answer
(`answerVerdict`, which refuses no solution and several), and its solver
(`solverVerdict`). A tiered game is held by its difficulty contract. An
untiered one is held by `Game.finishesByDeduction`, and where the game
declared none the engine assumed yes.

## Decisions

### Decision 1: the population is derived, and counted first

Every registered game with no `difficulty` and no `finishesByDeduction`, sorted
into three kinds: its hint or Solve deduces and can run out (the defect); it
never deduces; or its generator and solver already guarantee the answer some
other way.

**What it came to.** Twenty-four games had neither. The sort is by what the
game's code can do, and `untiered-load.test.ts` makes it on every run: a game
is of the first kind when its code can end a hint with `DEDUCTION_EXHAUSTED`,
itself or through `candidateHint`. Nine are: ABCD, Crossing, Filling, Mosaic,
Palisade, Pattern, Separate, Signpost and Sticks, five more than the four the
proposal named. The other fifteen move, search or guess.

The third kind had one member and it was a second defect. ABCD's solver calls
a ladder that stops short "ambiguous", and its `solve` reported that as
`MULTIPLE_SOLUTIONS`, so the answer check refused every such board as having
more than one solution. Nothing had proved a second. `solve-failure.ts` says
only a solver that established it may say so, and the other five games that
say it search. ABCD's `solve` now says `PUZZLE_NOT_REASONABLE`, and the board
is refused as needing trial and error.

### Decision 2: the generator is checked before a board is refused

**What it came to: it stopped Filling.** `desc-error-games.test.ts` already
holds every board a generator deals, on every preset and every value the
Custom dialog offers, to `loadVerdict`, so the new answers joined that guard by
existing. It deals one board of each, and it passed.

A census beside it dealt each of the nine games for 75 s and refused none of
101,148 boards. That zero was not a finding for the games with few boards in
it: Net's gap had been one in 700, and Filling had 762. A second pass of 150 s
on the small boards of the thin games found Filling refusing 14 of 6,688
boards it had dealt, about one in 480. Its solver finishes them from the clues
and its hint, which restarts the solver from the half-filled board at each
step, does not. The counts are in `tasks.md`, 2.2.

So Filling's answer is its solver alone, which refuses no board a player
holds, and the hint's gap is `close-the-solver-hint-gap-in-filling`. The gap
is older than this change: such a board's hint already threw.

### Decision 3: the absence of the hook stops meaning yes

**Decided: a declaration, checked where the game is registered.**
`registerGame` throws for a game with no difficulty contract and no
`finishesByDeduction`, and for a tiered game that has one, whose second answer
nothing would read.

- **Not the derivation.** Asking every untiered game's hint to walk a pasted
  board would refuse boards on which a search hint is honestly past its reach
  (Sixteen, Netslide, Pegs, Guess, Black Box), and Sixteen's walk is the most
  expensive in the collection.
- **Not `notApplicable`.** Its reasons are printed on the help page, and
  "this game's hint does not deduce" is not something a player is told there.
- **Not a type.** Making the member required only of an untiered game needs
  `Game` to be a union, and `Game` is an interface that
  `testing/enrollment.ts` reads its optional members from. A check at
  registration fails every test in the suite and the app's start, which is as
  loud.
- **Not `null` for "nothing to deduce".** The member is declared with method
  syntax, which is what lets a `Game<P, S, …>` be passed where a
  `Game<unknown, …>` is wanted. A property typed `((s) => boolean) | null`
  loses that and broke the registry and every caller of `loadDesc`. The
  answer is a shared function, `nothingToDeduce`, which a guard can tell by
  identity.

**Eight of the nine give the same answer, so the engine owns it.**
`hintAndSolveFinish(game, state)`: Solve answers the board, and the hint,
played from the opening a whole plan at a time, ends on a solved one. It asks
the hint because a solver can settle a board its hint cannot, which is no
longer only Net's and Rectangles' finding: a near-miss Pattern board and a
Sticks board each had a Solve that succeeded and a hint that stopped, and
Filling deals such boards (Decision 2). Playing whole plans agreed with replanning after every move on
all 145 presets-by-board tried, and cost a hundredth as much.

**What holds `nothingToDeduce`**, the one answer that turns the check off:
the games that give it are exactly those whose code cannot end a hint with
the deduction-exhausted refusal. And for a game with a test of its own, the
guard keeps one game ID per game that the game reads and refuses, so a test
that always says yes fails. All three were planted in Palisade and seen to
fail: the answer taken out, swapped for `nothingToDeduce`, and replaced by
`() => true`.

### Decision 4: the throw stays

`Midend.computeHintPlan` throwing on a deduction-exhausted refusal from a
game with no tier that allows search is the defect's alarm. No loaded board
reaches it. `engine-hints` said such a game "SHALL NOT be able to emit" the
refusal, which the code never guaranteed and need not: the hint's refusal is
now what the load test reads. The requirement is restated as what a player
can be shown.

## What a player is told

"This game ID's puzzle needs trial and error, and only puzzles that deduction
alone solves can be played here." It is the sentence Mines, Net, Range and
Rectangles already gave. On a board with no clues, or one whose clues
contradict, "needs trial and error" is the kindest reading of a board that has
many answers or none, and the second half is exact. A solver that stops short
cannot tell which it was. Left as it is; a sentence that claims less ("isn't
solved by deduction alone") is a wording change across thirteen games and the
tiered ones, and is the owner's if wanted.

## Risks

- A game's hint is weaker than its generator's acceptance test, so the verdict
  refuses dealt boards → the census of Decision 2.
- The check is slow on a large pasted board → `tasks.md`, 3.4.
