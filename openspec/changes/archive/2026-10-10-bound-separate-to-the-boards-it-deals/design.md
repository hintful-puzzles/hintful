# Design

Everything measured here was measured 2026-10-10, under vitest in Node, on a
machine doing other work. The times are that machine's.

## The decision: the generator reaches further, and a refusal is drawn where it stops

The proposal asked for a bound in `validateParams` that refuses a board
Separate "does not deal in a few seconds", and named the sizes it had found
not to deal: 8x8 in fours and eights, 9x9 in threes, 10x10, 12x12, 15x15 and
20x20 in two to five letters. Every one of those is dealt now, most in under
a tenth of a second. The generator was the defect, and it is replaced.

A refusal is still drawn, a long way further out, at the sizes the new
generator gives up on more often than it deals: many letters on a large grid,
and three narrow shapes. Up to seven letters nothing is refused at any size.

A Custom size is not refused for its wait
(`docs/games/solver-and-generator.md` § "Bound a generator by its tail, not
its median"), and this refusal is not for one. § "Where it stops" says why
the line is where the generator fails and not where it is slow.

## What a division was thrown away for

Upstream's generator divides the grid, fills each region with the letters at
random, runs the solver, keeps the letters a deduction read and fills the rest
again, until the solver finishes or a fill gives it nothing new `k * k` times
running. Then it throws the division away. For each division thrown away,
where the solver had got to:

| Board | Divisions | Finished | Squares in a finished region | Letters read | Edges between regions still open | of them, between components wholly read |
| --- | --- | --- | --- | --- | --- | --- |
| 6x6 in 4s | 400 | 2 | 8 of 36 | 29 | 11 | 6 |
| 6x6 in 6s | 400 | 0 | 0 of 36 | 26 | 11 | 5 |
| 8x8 in 4s | 400 | 0 | 8 of 64 | 52 | 25 | 14 |
| 8x8 in 8s | 300 | 0 | 0 of 64 | 44 | 21 | 11 |
| 9x9 in 3s | 300 | 0 | 24 of 81 | 70 | 33 | 20 |
| 10x10 in 5s | 200 | 0 | 5 of 100 | 79 | 43 | 23 |
| 12x12 in 3s | 150 | 0 | 33 of 144 | 125 | 68 | 41 |
| 12x12 in 2s | 150 | 0 | 74 of 144 | 135 | 49 | 34 |

The middle columns are medians over the divisions thrown away. Four letters
in five have been read and are fixed, and next to nothing is joined. Half the
edges still open stand between two components whose every letter is fixed and
which share none, so no fill of what is left can wall them.

**It is the fills and not the division.** Each of the first 40 divisions at
6x6 in fours was filled ten more times from nothing: 3 of 390 finished,
against 2 of 400 the first time. A division that failed is as likely to
finish as one not yet tried, so drawing another does nothing a second go at
the same one would not.

**And one thing is the division.** The solver's only join is of a component
to the one square it can still grow into. A square on a ring of its own
region (four squares in a square, or squares going round one outside) always
has two, so the solver finishes no board with a ringed region, whatever its
letters. Every Easy board ever dealt has regions that are trees. A division
drawn at random has a ring in most regions of six or more, and that is why
the rate falls with the letters.

So nothing here is a size too hard to deal. One part of a draw could have
been made to hold (`docs/games/solver-and-generator.md` § "Unlucky,
impossible, and load-bearing validation": build it in), and the other was
left to chance where it could be chosen.

## A division with no ring

The division is drawn as before. While a region has a ring, it and two
neighbors are divided again (`engine/redivide.ts`, which Palisade's generator
gave up to the engine), each piece grown as a tree: a piece takes only a
square beside exactly one of its own. The last region is what the others
leave and may be ringed, so the step is kept if the joins beyond a tree's,
summed over the regions, are no more than before.

No division of a board more than two wide in up to eleven letters was given
up for its rings at any size swept, one was at 3x12 in twelves, and one in
three at 3x13 in thirteens. Two rows are where it fails: 150 of 190 at 2x12
in twelves, and every one of 87 at 2x26 in thirteens.

## Letters placed for the solver

Three ways were tried on divisions with no ring.

**Swap and solve again.** Take an edge between two regions that the solver
left open, give one square the other's letter by a swap inside its region,
solve from nothing, and keep the swap if no more edges are open. It deals
20x20 in twos in 0.8 s and 12x12 in fours in 0.14 s, where upstream never
did. It pays a whole solve a step (7 s at 20x20 in fours) and stalls with
many letters: 1,272 steps at 8x8 in eights, and never at 12x12 in twelves.

**Swap only what no deduction has read.** A deduction depends on the letters
it read and no others, so swapping two that none has read undoes nothing, and
the solver goes on from where it was. Each such swap walls an edge for
certain. Alone it is worse than the first: with no way back from a stop where
every swap left would touch a read letter, 8x8 in twos took a median of 672
fills from nothing and 12x12 never dealt in 2,000.

**Both.** The free swap while there is one, and at a stop a swap of read
letters, a solve from nothing, and the swap kept if no more edges are open
(one in eight may leave two more). This is what was built. The edge taken is
on the component nearest to being forced: one with a single square of its own
region to grow into, and the fewest open edges to other regions.

| Board | Swap and solve again | Unread only | Both |
| --- | --- | --- | --- |
| 6x6 in 6s | 8 ms | 3.7 ms | 3.5 ms |
| 8x8 in 2s | 3 ms | 261 ms, 7 of 23 gave up | 3.3 ms |
| 8x8 in 8s | 242 ms | 750 ms | 97 ms |
| 10x10 in 5s | 88 ms | gave up 3 of 3 | 70 ms |
| 12x12 in 4s | 144 ms | gave up | 87 ms |
| 20x20 in 2s | 762 ms | gave up | 786 ms |
| 20x20 in 4s | 7.3 s | gave up | 3.4 s |

**The solve from nothing agrees with the one carried over.** A board is
handed over when the scratch carried across swaps is solved. Every one of
some thousands dealt in these runs was solved again from an empty scratch,
and none failed: the deductions only add, and one that could be made stays
makeable until it is.

**More tries at a stop buy nothing.** At twelve letters the edges open when a
division was given up were the same at 100, 400 and 1,600 swaps without
progress (a median of 66, 63 and 61 at 12x12), so the cap on them is 100 and
the rest of the patience goes to another division.

**Mending the division at a stop buys nothing either.** Palisade's move was
tried in place of one swap in three: divide the regions round an open edge
again, fill them, solve, keep it if no more edges are open. A board came 4
times as fast at 8x8 in eights and 5 times as slow at 12x12 in eights, six
boards each. A stalled fill is not a fault in a few regions, as a Palisade
division's second answer is. So a division that stalls is thrown away.

## What it deals

Up to 30 boards a size, 4 seconds a size, each board solved again from
nothing. No board dealt in any run here failed that.

| Letters | Sizes | Divisions a board, median and most | A board |
| --- | --- | --- | --- |
| 2 | 1x4 to 12x12 | 1, 2 | under 30 ms |
| 2 | 15x16, 20x20 | 1, 3 | 0.11 s, 0.59 s |
| 3 | 1x6 to 12x12 | 1, 2 | under 40 ms |
| 3 | 15x15, 20x21 | 1, 2 | 0.15 s, 0.90 s |
| 4 | 1x8 to 12x12 | 1, 2 | under 70 ms |
| 4 | 15x16, 20x20 | 1, 1 | 0.37 s, 2.7 s |
| 5 | 1x10 to 10x10 | 1, 4 | under 50 ms |
| 5 | 12x15, 15x15, 20x20 | 1 or 2, 2 | 0.59 s, 0.54 s, 9.5 s |
| 6 | 1x12 to 8x9 | 1 to 3, 7 | under 40 ms |
| 6 | 10x12, 12x12, 15x16, 20x21 | 3, 2, 1 to 6, 10 | 0.50 s, 0.44 s, 1.4 to 6 s, 61 s |
| 7 | 1x14 to 6x7 | 1 or 2, 5 | under 10 ms |
| 7 | 8x14, 10x14, 12x14, 15x21 | 9, 4, 6, 47 | 1.3 s, 1.1 s, 2.8 s, 91 s |
| 8 | 1x16 to 8x8 | 1 to 4, 30 | under 60 ms |
| 8 | 10x12, 12x12 | 19, 5 and 35 at most | 2.2 s, 1.1 s |
| 9 | 2x9, 3x9, 4x9, 5x9, 6x6, 6x9, 8x9, 9x9 | 1 to 14, 21 | under 0.35 s |
| 9 | 9x13 | 35, 90 | 9.6 s |
| 10 | 2x10, 3x10, 4x5, 4x10, 5x6, 6x10 | 1 to 32, 107 | under 0.3 s |
| 10 | 8x10, 10x10 | 23 to 67, 32 and 176 at most | 2 to 4 s, 4.5 s |
| 11 | 2x11, 3x11, 4x11, 5x11, 6x11 | 3 to 43, 85 | 0.2 to 1.3 s |
| 11 | 7x11 | 379, one board | 33 s |
| 12 | 3x12, 4x9, 4x12, 5x12, 6x6, 6x8 | 4 to 45, 129 | 0.5 to 2 s |
| 12 | 4x6, 6x10, 2x12 | 298, 181, 37 | 2.7 s, 12 s, 9.6 s |
| 13 | 3x13, 4x13 | 7, 70 | 2.2 s, 5.5 s |
| 26 | 1x52 | 1 | 1 ms |

The proposal's own tables, for the same sizes: 8x8 in twos 0.36 s and now
3 ms; 6x6 in sixes 0.74 s and now 2 ms; 8x8 in eights never in 60,000
divisions and now 57 ms; 20x20 in twos never in three and a half minutes and
now 0.6 s.

**Unreasonable is dealt wherever Easy is**, since it swaps letters on an Easy
board. Four boards a size, each with one answer by the search and stopped
short of by the solver: 6x6 in sixes 0.08 s, 8x8 in eights 0.7 s, 12x12 in
fours 1.0 s, 9x9 in nines 1.1 s, 15x15 in threes 1.9 s, 4x13 in thirteens
2.2 s, 12x12 in eights 5.7 s, 10x10 in tens 8.0 s, 15x16 in sixes 8.5 s,
5x12 in twelves 12 s, 20x20 in fours 16 s.

## Where it stops

Given two minutes a size, the sizes the sweep had cut short:

| Board | Squares x letters squared | Divisions a board | A board |
| --- | --- | --- | --- |
| 15x16 in 6s | 8,640 | 1 to 6 | 1.4 to 6 s |
| 20x21 in 6s | 15,120 | 10 | 61 s |
| 15x21 in 7s | 15,435 | 47 | 91 s |
| 12x12 in 8s | 9,216 | 5, 35 at most | 1.1 s |
| 12x16 in 8s | 12,288 | 70 | 24 s |
| 16x16 in 8s | 16,384 | 155 | 98 s |
| 20x20 in 8s | 25,600 | none in 85 | none in 100 s |
| 12x12 in 9s | 11,664 | 170 | 28 s |
| 10x18 in 9s | 14,580 | 124 | 30 s |
| 10x10 in 10s | 10,000 | 32, 176 at most | 4.5 s |
| 10x12 in 10s | 12,000 | 969 | 98 s |
| 8x11 in 11s | 10,648 | 137 to 235 | 9 to 28 s |
| 6x12 in 12s | 8,640 | 401 | 27 s |
| 8x9 in 12s | 10,368 | 1,000 | 79 s |
| 12x12 in 12s | 20,736 | none in 521 | none in 100 s |

There is no size at which it turns from dealing to not: the divisions a
board takes climb. What they climb with, from eight letters, is the squares
times the letters squared. With many letters a border between the same two
regions is long, and every step along it needs the two sides to share a
different letter.

**Why this is a refusal and not a wait.** Up to seven letters a large board
takes few divisions (10 at 20x21 in sixes) and its minute goes on the solver
runs of a 420-square board: that is a wait, the board asked for arrives at
the end of it, and it is not refused. From eight letters the time goes on
divisions thrown away, hundreds and then thousands, each a whole board's
work. The guide's line for a refusal is a generator that fails more often
than it finds, and with a search that starts over the cap on its tries is
that line. So the cap is sized to the rarest size admitted, and what is past
it is refused:

- **From eight letters, squares times letters squared over 10,000.** The
  rarest sizes under it took a median of 379 divisions (7x11 in elevens) and
  298 (4x6 in twelves); the nearest over it 969 and 1,000.
- **More than thirteen letters,** but for a strip. Nine sizes from 4x7 in
  fourteens to 4x13 in twenty-sixes, 20 seconds each: one board, at 5x9 in
  fifteens.
- **Three wide in two regions of nine or more.** None in 5,682 divisions at
  3x6 in nines, none in 709 at 3x8 in twelves. With one other region a
  square is walled from one neighbor a letter, so the solver starts from a
  corner or nowhere. 3x4 in sixes deals, and so do 4x5 in tens and 4x6 in
  twelves.
- **Two wide in thirteens.** One board in 40 seconds at 2x13 and none at
  2x26: two rows seldom divide into thirteens with no ring. 2x12 in twelves
  takes ten seconds and is dealt.

The cap is 4,000 divisions. A size whose median is 400 runs it out once in a
thousand boards.

**A strip is dealt at any length.** It divides one way, and 1x52 in
twenty-sixes takes a millisecond.

**Nothing that dealt before is refused.** The proposal records upstream's
generator dealing, in eight letters, 4x4 and one 8x4 board in ten at 300
divisions, and none at 8x5, 8x6 or 8x8; in nine, one 9x4 board in ten and
none at 3x6. It tried nothing above nine. Every size it records as dealing
is under the line, and is dealt in milliseconds now.

**A pasted board of a refused size opens.** A 3x6 board in nines with one
answer is a test. Such boards are common, three of the first ten random
fills tried, and the solver finished none of the three: the size has boards
and no Easy ones that were found.

## The cap, and running it out

Running the cap out on a size admitted is a defect. It takes long where a
division does: 4,000 divisions are half a minute on a 4x6 board and a quarter
of an hour on a 12x12 in eights. That is the same wait a slow size has, and a player can
stop it. A cap in a unit of time was not looked for.

## Which boards moved

All of them. The generator draws the division as before and then places
letters by a different walk, so no seed deals the board it did. The app
hands out boards and not seeds, so nothing a player has is touched. The
frozen boards upstream's C dealt are kept as a check on the solver, which
solves all of them; they are no longer asked to be dealt again from their
seeds.

**They are the same kind of board at the menu's sizes.** The generator walls
an edge by putting the same letter on both sides of it, and an 8x8 board in
eights shows it: a row of four Ds. So the share of edges with the same
letter either side was counted on 100 Easy boards a preset, against the
frozen boards upstream dealt and against chance (one in `k`):

| Board | Upstream's | Now, mean and range | Chance |
| --- | --- | --- | --- |
| 4x4 in 4s | 27% | 24%, 8 to 38 | 25% |
| 5x5 in 5s | 31% | 22%, 10 to 35 | 20% |
| 6x6 in 4s | 26% | 25%, 17 to 33 | 25% |
| 6x6 in 6s | 20% | 21%, 12 to 32 | 17% |

Upstream's are one or two boards a size. An Unreasonable board has fewer, 12
to 17%, as it did: its swaps are kept only while the solver stays short.

## In the running app

Chrome, 2026-10-10. `separate?type=8x8n8de` deals and draws. From the Custom
dialog, 12 by 14 with 8 letters is refused in the dialog with "A 12x14 puzzle
with 8 letters is too rare to deal; use fewer letters or a smaller grid.",
and 20 by 20 with 2 letters is dealt at once; Hint on it explains its first
wall.

## What was not done

**The sizes refused are not shown to have no board.** They are where this
generator gives up. A division chosen for its borders (short ones between
any two regions) is the thing to try if many letters on a large grid are
wanted, and nobody has asked for them.

**The solver's rule against a ringed region stands.** A region with four
squares in a square is one the solver cannot finish, so no Easy board has
one and no Unreasonable board made from one. A rule that joins a walled-off
pocket of exactly `k` squares would lift that, and would change what Easy
means; it is a change to the game and not to its generator.

**A fresh solve costs what it did.** A swap of read letters solves the board
from nothing, 10 ms at 20x20, and that is where a large board in few letters
spends its time (9.5 s at 20x20 in fives, in two divisions).
