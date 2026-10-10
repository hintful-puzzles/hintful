# Design

Everything measured here was measured 2026-10-10, under vitest in Node, on a
machine doing other work. The times are that machine's.

## The decision: no size is refused, and the generator stops giving up

The proposal asked for a bound in `validateParams` that refuses a board
Palisade does not deal. This change draws none, and takes away the one
Palisade had at Unreasonable. The generator deals every size instead.

A Custom size is not refused for its wait
(`docs/games/solver-and-generator.md` § "Bound a generator by its tail, not
its median"). Palisade's failure was not a wait: the generator threw away
10,000 divisions and gave up. The same guide says what to ask before a budget
or a refusal is sized to a rate like that (§ "Unlucky, impossible, and
load-bearing validation"): what is each try thrown away for?

## What a division was thrown away for

A division is kept if the solver solves it with every clue showing. For each
one it did not solve, the search counted the answers its clues have:

| Board | Divisions | Solved | One answer, solver stalls | Several answers |
| --- | --- | --- | --- | --- |
| 6x6 in 3s | 300 | 18 | 0 | 282 |
| 9x9 in 3s | 300 | 0 | 0 | 300 |
| 8x8 in 4s | 300 | 12 | 70 | 218 |
| 12x12 in 4s | 200 | 0 | 7 | 193 |
| 10x10 in 5s | 200 | 6 | 65 | 129 |
| 12x12 in 6s | 150 | 2 | 69 | 79 |
| 16x16 in 8s | 80 | 1 | 32 | 47 |
| 12x15 in 10s | 100 | 32 | 40 | 28 |

So the solver is not what is weak. Most divisions have a second answer under
their own clues, and with regions of three every one that fails does. The
count was checked against something that shares nothing with the solver: a
count of tromino tilings that meet the clues agreed on 200 of 200 boards of
6x6 in threes (193 several, 7 one).

A second answer is a local thing: a few neighboring regions that can be cut
another way with every clue unchanged. The chance a division has none falls
with every region added, which is the table in the proposal. A size is never
impossible, only ever rarer, so no bound would have been in the right place.

## Divide the regions round the stall again

Where the solver stalls, some walls of the division are ones it did not
place. The generator takes one of them at random, takes the two regions it
stands between and some of their neighbors, and divides those cells among
those regions again at random: a connected piece of `k` is grown from a random
cell, kept if the rest is still connected, and so on until one region is
left. The solver runs again, and the step is kept if no more walls are
unplaced than before. One step in eight may be worse by up to three walls.

**How many regions is what decides it.** Boards on which the generator gave
up:

| Regions divided at a time | 6x6 in 3s, of 2,000 | 9x9 in 3s, of 1,000 |
| --- | --- | --- |
| 2 | 1,881 | 1,000 |
| 3 | 150 | 260 |
| 4 | none | 5 |
| 4 to 8, one more for every 20 steps stalled | none | none |

Two regions cannot leave some stalls at all. Two I-shaped regions of three
along the rim with an L against them can be cut exactly one other way, and
that way gives every cell the same clue. At four the last traps are rare and
the steps a board takes have a long tail (most 1,518 at 9x9, against 430
with the widening). Widening without a ceiling was tried and is worse: once
the move is many regions wide, hardly any step is kept, the stall never ends
and the move only widens (8 of 1,500 gave up at 9x9). So the width goes from
four to eight and round again.

At four to eight, in all the runs made: none of 8,000 boards of 6x6 in threes
gave up and none of 4,000 of 9x9 in threes.

## The cap

The steps a board takes grow with its regions and no faster, so the cap is
`500 + 50` a region, and running it out is a defect.

| Board | Regions | Boards | Median steps | Most | Cap | An Easy deal |
| --- | --- | --- | --- | --- | --- | --- |
| 5x5 in 5s | 5 | 1,000 | 0 | 10 | 750 | 2 ms |
| 6x8 in 6s | 8 | 500 | 1 | 21 | 900 | 15 ms |
| 8x10 in 8s | 10 | 200 | 0 | 10 | 1,000 | 51 ms |
| 12x15 in 10s | 18 | 50 | 2 | 9 | 1,400 | 0.43 s |
| 3x4 in 3s | 4 | 2,000 | 1 | 21 | 700 | under 1 ms |
| 6x6 in 3s | 12 | 8,000 | 22 | 174 | 1,100 | 5 ms |
| 8x8 in 4s | 16 | 500 | 13 | 83 | 1,300 | 30 ms |
| 9x9 in 3s | 27 | 4,000 | 89 | 536 | 1,850 | 40 ms |
| 3x30 in 3s | 30 | 200 | 93 | 262 | 2,000 | 39 ms |
| 2x60 in 4s | 30 | 30 | 9 | 73 | 2,000 | 0.13 s |
| 10x15 in 5s | 30 | 40 | 20 | 68 | 2,000 | 0.28 s |
| 12x12 in 4s | 36 | 60 | 58 | 139 | 2,300 | 0.22 s |
| 15x18 in 6s | 45 | 15 | 30 | 48 | 2,750 | 1.5 s |
| 12x12 in 3s | 48 | 100 | 177 | 419 | 2,900 | 0.16 s |
| 20x20 in 4s | 100 | 5 | 203 | 240 | 5,500 | 2.9 s |
| 21x21 in 3s | 147 | 5 | 688 | 798 | 7,850 | 2.2 s |
| 30x30 in 3s | 300 | 2 | 1,769 | 1,769 | 15,500 | 16 s |

At 9x9 in threes one board in a hundred took more than 316 steps and one in
a thousand more than 430. The samples at 100 regions and over are small, and
their cap is nine to twenty-three times the most seen.

Running the cap out takes about a second at 9x9. Before, a 9x9 in threes
took ten seconds to give up and a 12x12 thirty.

The larger times are not the repair. A 30x40 board in twenties takes 40
seconds and one step: the time is the strip, which runs the solver once a
clue, and was the same before.

## Which boards moved

A division the solver solves as drawn draws nothing more, so a seed whose
first division was good deals the board it dealt before. Of 264 boards
recorded before the change at the four presets and both tiers, 150 are the
same after and 114 moved, which is the share whose first division failed.
The app hands out boards and not seeds, so nothing a player has is touched.

## The Unreasonable bound goes

It was 180 squares, "a larger one takes too long to deal". A tier's own bound
is held to the same rule as a size's. Every Unreasonable deal measured, inside
the bound and past it, returned a board with one answer that the solver stops
short of, and none gave up:

| Board | Deals | A deal |
| --- | --- | --- |
| 3x4 in 3s, 4x4 in 4s, 2x6 in 3s, 2x4 in 4s | 200 each | under 10 ms |
| 6x6 in 3s | 60 | 0.02 s |
| 9x9 in 3s | 30 | 0.13 s |
| 12x12 in 3s | 10 | 0.51 s |
| 12x12 in 4s | 10 | 0.64 s |
| 12x15 in 10s | 10 | 1.5 s |
| 14x14 in 4s | 5 | 1.3 s |
| 15x15 in 9s | 5 | 2.7 s |
| 15x20 in 10s | 4 | 4.9 s |
| 18x18 in 6s | 3 | 6.9 s |
| 3x80 in 6s | 3 | 2.4 s |
| 20x20 in 10s | 2 | 10 s |
| 21x21 in 3s | 2 | 6.1 s |

9x9 in threes and 12x12 in fours, which the proposal names as dealing at
neither tier, deal at both.

## What was not done

**Regions of two stay refused** on a board wider and taller than one. The
generator was tried on them: every one of 230 boards from 2x2 to 8x8 gave
up. Two dominoes side by side can always be turned, so the refusal is right.

**Each step runs the solver on the whole board**, though a step changes a
few regions. Running it on the regions round the step would need the solver
to start from a position, and the wait is one the player chose.

**The generator moved to `palisade/generator.ts`.** `solver.ts` held both,
and the generator has grown.

## The other `bound-*-to-the-boards-it-deals` changes

Separate divides its grid with the same `divvyRectangle`. Before a bound is
drawn there, count what its thrown-away boards are thrown away for.
