# Design

Everything measured here was measured 2026-10-10, under vitest in Node, on a
machine doing other work. The times are that machine's.

## The decision: no size is refused, and the deals are made cheaper

The proposal asked for a bound in `validateParams` that refuses a board
Rectangles "does not deal in a few seconds". This change draws none, and takes
away the one Rectangles had at Unreasonable.

A Custom size is not refused for its wait
(`docs/games/solver-and-generator.md` § "Bound a generator by its tail, not
its median"). An Easy deal was only ever a wait: of 177 tries made dealing 70
boards from 30x30 to 100x100, the solver turned 107 away, the hint none, and
a deal took four tries on average at the largest. So the time was made smaller and nothing is
refused.

Unreasonable was not a wait. A 30x30 deal took a mean of 4,000 draws against a
cap of 10,000, so about one deal in twelve would have given up, and inside the
old bound a 19x19 deal would have about one time in 1,600. The draws are now
chosen and not hoped for, and that tier deals at every size as well.

Three things are refused or fixed that were failing before:

- **2x9, 2x10 and 2x11 at Unreasonable are refused**, as too rare to deal.
  They were admitted and every deal gave up.
- **A board one square wide with an expansion factor never finished dealing**,
  at either tier. It deals.
- **Small boards with an expansion factor at Unreasonable give up.** This one
  is not fixed here: see "What was not done".

## Where an Easy deal's time went

Twenty deals a size, the three parts timed apart:

| Board | Layout | Solver | Hint replay | Tries a deal |
| --- | --- | --- | --- | --- |
| 30x30 | 2 ms | 96 ms | 73 ms | 1.7 |
| 50x50 | 7 ms | 523 ms | 691 ms | 1.9 |
| 70x70 | 31 ms | 2.5 s | 3.1 s | 3.1 |

Both halves grew, so both were made cheaper.

### The hint replay

`rungsFinish` replays the hint a step at a time, and `nextFiring` read every
clue's fits from the board at every step: each rectangle of the clue's area
around it, tested square by square. A firing only draws lines, so it only
takes fits away, and only fits over a square beside a line it drew. The fits
are now read once and carried (`fitsAfter`), and the rungs past the first look
up which clues reach a square in an index built from them, where each used to
ask every clue about every square.

A move also cost more than it looked. `getCorrect` measured the box each
square starts and then read every edge in it; on a board with few lines that
box is most of the board, for every square. It stops at the first edge that
is wrong (`isOutlined`), which changes nothing it reports. A move in the
replay of a 50x50 board averaged 1.5 ms; a whole step of it, the move
included, now takes under 0.4 ms. A player of a large board meets the same
cost on every line drawn.

### The solver

Upstream's `rect_solver`, for every placement of every rectangle on every
pass, cleared a count for every number and then read every one. A placement
lies over a few numbers' positions, so the ones it touched are listed and only
those are read and cleared. Its square-focused pass counted, for every square
on every pass, the rectangles with a placement over it; that count is kept as
placements are removed. And the winnowing built a list of every placement over
every foreign number's square each time the deductions stalled, to draw one;
it counts them and walks to the one drawn.

The deductions, their order and every random draw are the same.

### What it came to

Mean time for an Easy deal, ten deals a size:

| Board | Before | After |
| --- | --- | --- |
| 30x30 | 0.17 s | 0.04 s |
| 50x50 | 1.2 s | 0.18 s |
| 70x70 | 5.6 s | 0.73 s |
| 100x100 | 28 s (the proposal's) | 2.9 s |

The solver is still four fifths of it, and inside the solver the
rectangle-focused pass, which rereads every placement on every pass though one
winnowing changes a few. Tracking which placements a pass could have changed
would be the next step and is a larger change to upstream's algorithm than a
wait the player chose is worth.

### Checked by recording first

129 boards with the hint's plan of each, from the start and from halfway
(eleven Easy shapes from 7x7 to 40x40, 8x40 and a stretched 3x30 among them,
and five Unreasonable ones), and what `rungsFinish` says of 780 boards with
their numbers placed anywhere, 261 that it finishes and 519 that it does not.
After the hint and solver changes none of the 142 records moved. With the
Unreasonable deal changed, the 33 Unreasonable boards moved, which is that
change, and nothing else.

Each guard was seen to fail: the solver's kept count left stale fails nineteen
tests, the byte-for-byte comparison with upstream's boards among them; the
plan's fits read against the wrong board fails the new test that every step of
a plan is the firing its board gives when read afresh. No test saw a broken
vertical check in `isOutlined`, so one was added and seen to fail.

## The Unreasonable deal moves a number off the second answer

A draw was a division with each number on a square of its rectangle at
random, thrown away unless it had one answer that the solver and the hint stop
short of. What they were thrown away for, over 40 deals at 19x19: 43,543 for
several answers, 10,486 because the solver finishes them, 56 because the hint
does, and one where the search ran out.

The search that finds a second answer has it in hand. Some number's rectangle
in that answer is not the one dealt, of the same area, so the dealt rectangle
has a square the other leaves out. Moving the number there keeps the dealt
division an answer and ends the other. The deal repeats that until the search
finds the dealt division alone, and then keeps the board if the solver and the
hint stop short of it (`unreasonableBoard`, and `solvedPositions` in the
shared search, which hands over the positions `searchAnswers` used to keep to
itself).

Draws for a board, and the time for a deal:

| Board | Deals | Draws before | Draws after | A deal before | A deal after |
| --- | --- | --- | --- | --- | --- |
| 15x15 | 40 before, 8 after | 986 | 250 | 0.31 s | 0.13 s |
| 19x19 | 40 before, 8 after | 1,353 | 191 | 0.86 s | 0.22 s |
| 25x25 | 8 | 2,047 | 266 | 3.1 s | 0.82 s |
| 30x30 | 8 | 3,987 | 242 | 10.8 s | 1.6 s |
| 40x40 | 4 | not tried | 98 | | 2.2 s |
| 50x50 | 4 | not tried | 234 | | 14 s |
| 70x70 | 4 | not tried | 27 | | 8 s |

The "before" times are with the solver already made cheaper, so the difference
is the draws. A board takes 100 to 400 draws at every size from 4x5 up, where
it took more with every size. Most draws mended to one answer are ones the
solver finishes; that is what the rest are thrown away for now.

A draw took 59 moves at most on a shape that is dealt, and is thrown away at
200. No search ran out of its 30 positions in two million.

Small boards and strips are rare as they were, and a draw of one is cheap:

| Board | Draws for a board, ten deals | Allowed |
| --- | --- | --- |
| 4x4 | 10,500 | 500,000 |
| 2x12 | 7,400 | 333,000 |
| 3x5 | 6,100 | 533,000 |
| 2x14 | 4,900 | 286,000 |
| 2x40 | 2,800 | 100,000 |
| 2x20 | 2,300 | 200,000 |
| 3x30 | 1,000 | 89,000 |

The allowance was two million squares drawn and is eight million, which puts
the chance of running out under one in a thousand million at each of these,
with room for a mean that is half again what ten deals showed.

## Three shapes are too rare to deal

2x9, 2x10 and 2x11 were admitted at Unreasonable and failed: six deals of six
at 2x9 and at 2x10, three of six at 2x11, each after about two seconds.

The tier is there. Of the 1,396,400 boards of 2x9 with no 1 on them, 32 have
one answer that the solver and the hint stop short of; 240 of 7.7 million at
2x10; 1,820 of 43 million at 2x11. Every one has a rectangle of four squares
or more. The generator draws no rectangle larger than a sixth of the board, so
under 24 squares a 4 comes only from a single square merged into a 3. None
came in 400,000 draws at 2x9 or at 2x10, one in 78,000 at 2x11, and one in
7,400 at 2x12, where a 4 is drawn outright.

So they are refused with the sentence for a tier that exists and is not found
(`tooRareToDeal`), and a pasted one still opens. Dealing them would mean a
generator for three shapes with a few dozen boards between two of them.

## A strip with an expansion factor

Upstream makes the base grid `size / (1 + expansion)` squares a side, at least
two where the board is at least two. A board one square wide has a base no
squares wide, the stretch is asked for a random row below nought, and the
generator does not return. The base is at least as wide as the board where
that is one. Seen in the app: a 1x7 board at 50% expansion deals.

## A hint sentence with two reasons ran long

One of the newly dealt Unreasonable boards has a step that rules a fit out
both ways at once, for leaving a clue no room and for leaving squares no
rectangle covers. Its sentence was 144 characters against the 120 a step is
held to, and no board walked before had spoken it. It reads "Elsewhere the 6
leaves the outlined clue no room or the outlined squares uncovered, so it
must take this rectangle." now, and the sentence with one reason is shorter
the same way.

## The three things the proposal said to settle first

1. **Where the time goes at 70x70.** Above: the solver and the hint replay,
   about evenly, and nothing in the layout.
2. **Whether a pasted 70x70 board opens.** It grades by the same replay and
   one search. A 60x60 board dealt and pasted back is a slow test now, and a
   70x70 one dealt in the app in under four seconds, its grading included.
3. **Not refusing what deals today.** The only new refusals are the three
   shapes above, two of which never dealt and the third half the time.

## What was not done

**Small Unreasonable boards with an expansion factor still give up.** At 0.5:
3x5, 3x6, 3x7, 4x4, 4x5, 4x6 and 5x5 failed five deals of five. At 2: every
shape from 3x5 to 3x11, 4x4 to 4x11, 5x5 to 5x11 and 6x6 to 6x9, where the
next longer of each deals, as the two-wide ones do. A stretched board has the few rectangles of its small base, and the
shapes that fail follow no rule in the base's size or the board's that the
sweep showed (6x9 at 2 fails and 6x10 deals, from the same 2x3 base). They
failed before this change too, sooner: the allowance is four times what it
was. Filed as `deal-or-refuse-stretched-unreasonable-rectangles`.

**The menu keeps 17x17 and 19x19 at Easy alone.** They deal quickly at
Unreasonable now, and the menu's reason is its length, which has not changed.

**`rungsFinish` has no bound of its own.** Fits left stale make it fire the
same step for ever, which is how two planted defects showed themselves: as a
run that had to be stopped. Each step draws a line, so the loop ends while the
fits are right, and the new test is what says they are.

**The help pages do not change.** Neither named a size bound.
