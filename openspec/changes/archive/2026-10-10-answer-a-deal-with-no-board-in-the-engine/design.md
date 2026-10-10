# Design

Measured 2026-10-10, on one machine. Every figure is of the code that day.

## Decision 1: the unit is wall-clock time, armed by the app's deal alone

`generate` (`src/engine/deal.ts`) arms a deadline around `newDesc`, and every
`retryLimit` guard reads it. A guard given no count gives up when the deadline
passes and counts nothing. A generator called directly arms nothing, and the
same guard counts 10,000 tries and reads no clock.

**What the per-game counts came to, as a wait.** One run-out each, at a size
the game's own tests pin as having no board, called directly so that the
refusal does not answer first. 47 cells in 28 games:

| Giving up took | Cells |
| --- | --- |
| under a second | 15: Filling 0.05 s, Tents 0.07, Palisade 0.08, Signpost, Separate, Boats, Towers, Range, Magnets, Sticks, Unequal, ABCD 3x3 |
| 1 to 5 seconds | 9: Singles, Bricks, Tracks, Dominosa, Net twice, Solo 3 Jigsaw, Light Up 3x3, ABCD 2x15 |
| 5 to 13 seconds | 16: Spokes 2x3, Loopy, Solo, Galaxies, Map, Rectangles, Light Up 4x4, Bridges 5x5 and 7x7, Keen 3x3 |
| 15 to 25 seconds | 6: Pattern 15.7, Keen with multiplication alone 17.3, Spokes 2x4 17.3, Bridges 3x3 18.4, Salad 21.6 and 25.3 |
| 358 seconds | 1: Salad, a 4x4 Number Ball of two numbers |

A factor of 7,000 between the ends, in games whose budgets were each sized
with care, most of them aiming at ten seconds.

**The deadline costs a try nothing, and ends every game at the same moment.**
Under a five-second deadline, twelve of those cells each gave up at 5.00
seconds. Tries a second, before and after: Bridges 109,000 and 114,000,
Rectangles 109,000 and 108,000, Pattern 283,000 and 292,000. Reading the
clock once a try is inside the noise.

**It was tried on the cells the budgets were hardest to size.** Rectangles'
5x13 at an expansion factor of 2, which ran its count out one deal in
sixteen: 16 deals of 16 found a board, 1.7 seconds on average and 4.9 at
most. Bridges' 10x10 of five islands at Tricky: 12 of 12, 0.7 seconds. Map's
four cells of few regions: 30 of 30, 0.8 to 1.9 seconds on average and 8.2
at most.

**Why not counted work.** It is deterministic, and it is what each game had:
squares drawn, islands placed, squares times regions, the cube of the width.
Each unit had to be found for its game and timed at its costliest corner, and
Map's first one was wrong by a factor of ten. No unit of work is the same in
two games, and the wait is.

**What time gives up.** How rare a board the app can deal now depends on the
device: a phone a third as fast has a third of the tries. And a game ID that
carries a seed loads through the same deal, so a seed whose board is 100
seconds away loads on a desktop and may not on a phone. The app hands out
boards and never seeds, so no link it makes is affected.

## Decision 2: two minutes

`DEAL_DEADLINE_MS` is 120,000. The length is one number weighed between two
waits: a size with no board answers after the whole of it, and a cell found
once in `m` seconds runs it out with chance `e^(-length/m)`.

Seconds a board at the rare cells that are dealt today, by the deadline's own
clock with the count lifted. 130 deals at 16 cells; the test suite was
running beside the last of them, so the slow ones read high.

| Cell | Deals | Mean | Longest |
| --- | --- | --- | --- |
| Keen 9x9 Hard, multiplication alone | 6 | 25.9 s | 60.0 s |
| Keen 5x5 Unreasonable, multiplication alone | 6 | 25.0 s | 68.7 s |
| Salad 6x6 Number Ball, two numbers | 5 | 16.7 s | 34.4 s |
| Keen 8x8 Unreasonable, multiplication alone | 6 | 14.7 s | 40.1 s |
| Group 6x6 Tricky, identity shown | 10 | 14.6 s | 77.3 s |
| Salad 7x7 Number Ball, two numbers | 5 | 13.1 s | 20.8 s |
| Group 8x8 Hard, identity shown | 8 | 7.6 s | 12.1 s |
| Salad 4x4 Number Ball, three numbers | 10 | 6.7 s | 11.6 s |
| the other eight (Keen 7x7, Map, Rectangles, Bridges) | 74 | 0.5 to 3.4 s | 8.2 s |

Three of the 130 took more than a minute and none more than two.

| Deadline | A size with no board waits | A 15 s cell runs out | A 26 s cell runs out |
| --- | --- | --- | --- |
| 30 s | 30 s | 1 deal in 7 | 1 in 3 |
| 60 s | 60 s | 1 in 55 | 1 in 10 |
| 120 s | 120 s | 1 in 3,000 | 1 in 100 |

The budgets these cells had were five times their mean tries, which ran out
one deal in 150. Two minutes keeps the slowest of them at one in 100 and the
rest far under, and a minute would have made Keen's two slowest cells fail
one deal in ten. The guide's line for a cell that is dealt at all is half a
minute a board, where two minutes runs out one deal in 55.

**The cost, which is the owner's to weigh.** A size with no board used to
answer in a median of four seconds (the table above) and now answers after two minutes.
The wait says *Looking for a board…* from the first second, with **Stop**
beside it, and the board in play goes on being played. Against that, no
generator's run-out is 358 seconds any more, and none is a twentieth of a
second with the board half a second away. The refusals that exist still
answer at once. `DEAL_DEADLINE_MS` is the one number to change.

## Decision 3: a count means the algorithm, and only where it is passed

`retryLimit(label)` is the engine's bound. `retryLimit(label, n)` counts `n`
always, and gives up at the deadline too. The distinction is needed because a
count can be what moves a deal on: Loopy catches the run-out of its boards on
one patch and draws another, so lifting that count under a deadline would
leave a deal on a patch that cannot carry the tier until the deadline, where
the count deals a board from the next.

No generator catches a run-out but Loopy (`git grep -n "RetryLimitExceeded"
-- src/games`), so everywhere else a guard's run-out is the deal's, and
lifting its count can only turn a run-out into a board, never one board into
another. That is what makes leaving the number out safe for an inner loop as
well as the outer one.

Rejected: a second function for the whole-deal loop. Every deal-again loop in
every game would have had to be reclassified by hand, and a porter would have
a choice to make. As it is the default is right and a number is the exception.

Rejected: treating the first guard a deal creates as the whole-deal loop. It
is the outer loop in most generators and a first stage in some.

**What went.** The second argument at every call that passed a budget, with
its constant, its sizing comment and its helper, in 30 games: the diff is
+217 and -589 lines under `src/games`, tests included. Four deal-again loops that counted for
themselves and threw (Inertia, Pattern, Undead, Black Box) take the guard, so
that the deadline reaches them; each makes the draws it made.

**What stayed, each with its reason** (`git grep -n "retryLimit(" --
src/games`, the calls with a second argument): Loopy's patches, its boards a
patch and its clue draws on an aperiodic tiling, which hand over; Boats'
`w * h + 1` clues and Untangle's `(6n + 6)^2` walk, which the board sets;
Signpost's distinct picks, which is rejection sampling for one item and by
the guide is not to take the default.

## Decision 4: tests count, and a rare board is asked for in one place

With the budgets gone a generator called directly gives up at 10,000 tries in
every game. The whole fast suite then had three failures of 14,730 tests, all
one kind: a board the app deals and that count does not reach (Group's 6x6
at Tricky, through two cross-game sweeps, and Pattern's 4x4 at Unreasonable).

`dealRare` (`src/engine/testing/dealt.ts`) is `newDesc` with the count raised
to 5,000,000 for that call. `describeDealtTiers` and the shared `dealt`
boards go through it, and a game's own test of a rare board calls it. The
number is one, in the engine's test helpers, and bounds a deal known to end.

`describeAbsentTiers` lost its `budgets` option: it searches every cell for
50,000 tries, in every game. That is fewer than it ran where a game's budget
was large (Keen 555,000, Bridges up to 2,000,000 twice, Pattern 4,400,000),
so those pins are weaker than they were. The count a refusal rests on is the
one recorded beside it when it was written (`engine-difficulty`, "A refusal
that claims absence rests on a count"); this test keeps the answer from
drifting, and misses a tier found once in 17,000 tries one time in twenty.

The scan that holds a counted loop to throwing `RetryLimitExceeded`
(`retry-bound.test.ts`) had a floor of four such loops in the tree and now
finds one, since four became guards. Its synthetic cases are what show it
still sees the shape.

## What a player meets

In Chrome, on the dev server.

- Rectangles at 5x5, expansion factor 0.5, Unreasonable, which has no board:
  *Looking for a board…* and **Stop** within a second, and 122 seconds after
  the page opened, "No Unreasonable puzzle of this type was found. It may be
  too rare to deal, or there may be none: try again, or choose another type."
- Group's 6x6 at Tricky dealt in 26 seconds, Keen's 5x5 Unreasonable with
  multiplication alone in 7, Rectangles' 5x13 at a factor of 2 in 7.
- The help page's "Boards that take a while to find" says the search lasts
  two minutes at most and what the app says then.
