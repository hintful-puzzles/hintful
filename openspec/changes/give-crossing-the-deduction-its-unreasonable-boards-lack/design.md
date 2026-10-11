# Design

Measured 2026-10-11 through `solver.ts` itself, with the deduction behind a
switch. What it says of the code was true that day.

## What the deduction finishes

Draws of the generator, counted until 300 boards had been found that the two
deductions stop on with one answer (20 to 40 seconds a size where that came
first). "Mid" is such a board that the three finish. "Left" is one they do
not.

| Size | Mid | Left | An Easy draw (two) | A mid draw | A left draw | A left deal |
| --- | --- | --- | --- | --- | --- | --- |
| 5x5 | 245 | 55 | 1 in 1.5 | 1 in 50 | 1 in 240 | 6 ms |
| 7x7 | 256 | 44 | 1 in 2.4 | 1 in 51 | 1 in 296 | 19 ms |
| 9x9 | 251 | 49 | 1 in 5.5 | 1 in 68 | 1 in 347 | 40 ms |
| 11x11 | 247 | 53 | 1 in 34 | 1 in 258 | 1 in 1,200 | 0.2 s |
| 13x13 | 103 | 23 | 1 in 290 | 1 in 1,600 | 1 in 8,500 | 2 s |
| 9x9 symmetric | 228 | 72 | 1 in 4.5 | 1 in 79 | 1 in 250 | 31 ms |

The proposal's counts hold: five boards in six that the tier dealt need no
trial and error. The instrument was checked each way: no mid board had
another answer by the search over the two deductions alone, and a second
implementation over run domains, sharing no code with the solver, finished
no mid board without the rule, every one with it, and no left board.

## D1: Easy widens, and there is no middle tier

The boards the third deduction finishes are dealt as Easy.

- It is the least work in the game, which is the owner's condition. A middle
  tier is an engine change first: `answer-search.ts` knows two tiers by
  constant, in its names, its codec segment and its contract, and twelve games
  use it. Nothing here needs that.
- A mid board is a small share of a wider Easy: 3 in 100 at 5x5, 5 at 7x7, 8
  at 9x9, 13 at 11x11, 15 at 13x13. A tier holding only them would be Easy
  with, at the small sizes, one step of another kind in it (10,464 of 16,931
  mid boards at 5x5 need the rule once).
- A menu section holds twelve lines. Five sizes at three tiers is fifteen.
- It is the choice that can be undone. A middle tier added later only raises
  boards as they load, which the midend does already. A middle tier retired
  later leaves boards pinned to it.

What it costs: an Easy deal is no longer upstream's from the same seed. One
recorded seed of 48 deals another board, and the differential names it. And
the hint on a mid board usually writes notes before the placement, below.

**For the owner to accept or turn round.** The case for a middle tier is the
hint's notes: a person meets the new rule on an Easy board about as often as
the shares above, and on most of those boards it is not "scan the list" but
"note what these squares can hold, then scan the list". If that reads as more
than Easy, the middle tier is `Easy · Normal · Unreasonable` from
`tierNames(3, { search: true })`, and the engine change is the two-tier
constants of `answer-search.ts` taking a count.

## D2: The bound on Unreasonable falls to 144 squares

An Unreasonable board is five to seven times rarer with the rule. The old
bound, 182, was drawn where a deal took about a second. Mean time for a
board, and one draw in so many kept:

| At 144 | | Past it | |
| --- | --- | --- | --- |
| 12x12 | 0.6 s, 2,900 | 12x13 | 0.9 s, 4,300 |
| 8x18 | 0.4 s, 2,200 | 10x15 | 1.1 s, 5,200 |
| 6x24 | 0.7 s, 3,600 | 5x30 | 1.0 s, 4,400 |
| 3x48 | 0.6 s, 2,800 | 13x13 | 2 s, 8,500 |
| 4x36 | 1.4 s, 7,700 | 3x60 | 2.9 s, 9,300 |
| 2x40 (80 squares) | 0.6 s, 5,900 | 13x13 symmetric | 1.1 s, 3,300 |

Four squares across is the slow shape at the bound, as 3x60 was at the old
one, and is left inside it. The smallest boards still carry the tier (4x2 one
draw in 60, 4x3 one in 135).

The menu offers 13x13 at Easy alone. A 13x13 Unreasonable board already dealt
still opens, since no bound applies to a board that arrives with its
description, and its pinned tier is kept because the search still proves it.

## D3: The pair is not written

Two numbers that fit only the same two runs, and two runs that fit only the
same two numbers, added to the second implementation, finished 551 of 3,570
left boards at 5x5, 59 of 506 at 9x9 and 2 of 9 at 13x13: about one in seven.
What is left still takes a median of three to five positions. It would thin
the tier again for a rule that is harder to see, so it stays the search's.

## D4: The solver's rule keeps no state

Narrowing the run's squares to the number's digits is all it does: listed
numbers differ, so no other fits the run after. It runs only where narrowing
and confirming have nothing left, which is when the solver's record of the
numbers written in is current.

A number that fits no run is not called a contradiction. The search is right
without it, since such a position empties a square a step later, and a
verdict only the search reads is one the guide says to leave out.

## D5: The hint's rung, and what it rests on

`onlyRun` is read off the board like every placement: the number is its
run's length, is not written in, and disagrees with a digit or a note in
every other run of that length. It comes second, after a run with one number
left, since both fill a whole run.

- **The evidence is the squares it disagrees with**, outlined, in the other
  runs of its length that are not full. A full run needs no ruling out. So
  the sentence names no cause: a digit and a note both show in the square.
- **Where the board does not show it yet, the notes come first**, by the
  mechanism the hint had. The fixpoint gains the solver's rule as a second
  kind of narrowing, which rests on the number having died in every other
  run, and the trace follows that to the notes to write.
- **A Check**, by `docs/games/solver-and-generator.md` § "Check, Tactic,
  Search": one number, looked for in each run of its length.

What it costs, on 300 dealt Easy boards at 5x5 before and after: 6 boards
needed notes and now 12; 10 note steps in all and now 51; the longest run of
note steps was 3 and is 17, on one board, a staircase of eight two-square
runs where the number is ruled out of seven of them a square at a time. At
9x9 symmetric, 8 boards of 150 and now 15, and the longest run 6 and now 22.
Each note step writes a square from one run and a later one strikes it from
the crossing run, so a step that wrote what both runs leave would halve
these. That is the note steps' design and not this rung's, and is not taken
up here.

One thing seen in the app: a square can be both one the step fills and one
that rules the number out of a crossing run. It is drawn with the ring alone.

## What the engine would have had to offer

Nothing for the rule itself, which is about this puzzle. For a middle tier,
had it been chosen: the search tiers of `answer-search.ts` taking a count.
