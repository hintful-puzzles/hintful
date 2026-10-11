# Design

Measured 2026-10-11 through `deduce.ts` itself, the rule first behind a switch
and then as built. What it says of the code was true that day.

## What the proposal's rule is made of

The proposal's rule: a way of turning a tile is out when it leaves a tile
beside it no way to turn. Its picture was a glance, "if this corner points up,
that T has nowhere to go". Run through the engine on dealt Unreasonable
boards, the rule splits into three, by why the tile beside it has no way.

- **By its sides alone: never.** Where every way of a tile contradicts a
  known side once its neighbor is turned, the side between them is one every
  way of that tile already agrees on, and the engine notes it first. Held to
  sides, the rule finished none of 300 boards.
- **By a loop.** Each way of the tile beside it either fails to fit or closes
  a loop, through the turned tile's own wires. This is the proposal's picture
  with one more thing to look at, and it is built (D2).
- **By a group it seals off.** One of its ways survives the sides and the
  loops and is out because its wires run out. That is the tile beside it
  looked at as turned, inside the first tile looked at as turned: one
  assumption inside another. It is not built (D3).

Most of what the proposal's instrument counted is none of these. It is the
engine's own third reason, read better (D1).

Boards finished of 150 dealt as Unreasonable before this change, a size. The
three reasons the engine had finished one of the 750, a wrapping 7x7 the
solver stops on. No step on any board disagreed with the network it was drawn
as.

| Board | D1 | D2 alone | D1 and D2 | with D3 | D3 at any tile |
| --- | --- | --- | --- | --- | --- |
| 5x5 | 145 | 5 | 150 | 150 | 150 |
| 9x9 | 89 | 28 | 102 | 107 | 111 |
| 11x13 | 75 | 33 | 95 | 100 | 106 |
| 7x7 wrapping | 45 | 4 | 46 | 64 | 68 |
| 11x11 wrapping | 52 | 23 | 65 | 73 | 81 |

The last column is the proposal's instrument, and its counts hold without
wrapping (58, 45 and 39 of 60 there; 60, 46 and 40 of the first 60 here). At
7x7 wrapping it gave 15 of 60 and this gives 29: the generator's deal changed
between the two, and the count through the engine is the one to go by.

## D1: A sealed group is read with the tile turned

`Reach` bounds how far a wire runs over every way the tiles past it can turn,
among the ways that fit the known sides and close no loop through known
wires. The tile being asked about was not among the known: a tile its wire
ran into could "lead on" by pointing at a side the turned tile leaves blank,
or by closing a loop through the turned tile's own wires.

Where the recorded facts decide nothing, each surviving way of a tile is now
looked at with the tile held that way (`Facts.assuming`, `ruledOutInPlace`),
and the bound is taken again. It is the same reason, the same sentence and
the same stripes, and a player following a wire from a tile pictures the tile
turned already. It is what finishes 145 of 150 boards at 5x5.

It runs only where the three reasons as they were give no step, so a board
they finish is finished by the same steps: no Easy deal moved on 280 seeds
(40 at each of seven sizes), and no recorded plan or snapshot changed.

## D2: The tile beside it, by its sides and its loops

The fourth reason, and the hint's fourth rung (`neighbor`). With the tile
turned one way, some tile beside it has no way that fits the known sides and
closes no loop.

- **A Check**, by `docs/games/solver-and-generator.md` § "Check, Tactic,
  Search": one tile turned, one tile beside it looked at, each of its two to
  four ways either against a side or closing a loop the hint already knows
  how to show.
- **The sentence** leads with the turning and names the neighbor by its
  piece: "pointing up, down and left, it would leave the outlined straight
  no way to fit it without closing a loop through the striped squares". The
  sides the neighbor shares with the tile are "it". Its other known sides
  are cited as every step cites them, the wall, the outlined notes and locks.
- **The marks**: the tile ringed (or outlined, where the step notes a side of
  it), the tile beside it outlined, the squares a loop would run through
  striped. No mark is new.
- Where a step rules out several ways and one strands a neighbor, the
  sentence says "would leave the outlined square no way to turn without
  closing a loop" and cites nothing more, since no count is true of each. On
  750 boards about one such step in fifteen cites two ways.

## D3: A neighbor that would seal a group off is not written

It would finish 5 more boards of 150 without wrapping and 8 to 18 with it.
It is an assumption inside an assumption, which the guide calls a search
twice over, and its group is large: a median of 14 squares at 7x7 wrapping
and 57 to 135 on the larger boards. Looking at every tile instead of the four
beside the one turned adds 4 to 8 boards again and has no bound a sentence
could follow. Both stay the tier's.

## D4: Easy is dealt as it was, and graded by the hint

There is no middle tier, and the Easy generator is untouched.

- **It is the least work in the game**, which is the owner's condition. The
  rewiring loop in `generator.ts` stops at the first network upstream's
  solver settles, so a wider Easy needs the rule written a second time, in
  `solver.ts`, or the engine asked on every round of rewiring. A middle tier
  is an engine change first (`a-middle-tier-for-the-games-that-search`).
- **Easy stays upstream's deal**, draw for draw, which the differential
  holds and D1 does not move.
- **The contract's Easy is the hint's verdict alone.** It was the solver's
  and the hint's both. A pasted board the hint finishes and the solver does
  not opens as Easy now: the hint finishes it, so its player is never told
  that deduction has run out. One dealt board in 750 was already such a
  board under the three reasons, dealt as Unreasonable.
- **Unreasonable keeps the boards the hint stops on.** The deal asks the
  solver and then the hint (`deduced` in `unreasonableBoard`).
- **A board saved as Unreasonable that the hint now finishes stays
  Unreasonable**: a pinned tier is kept where the board solves at it, and the
  search still proves it. Its hint no longer stops.

## D5: The deal asks the hint from where the solver stopped

Asked from the opening position, the hint's engine costs the square of the
board, and a 30x30 Unreasonable deal went from 0.45 s to 3.3 s. The deal
locks the tiles the solver settled and asks from there (0.6 s). More facts
never rule out less, so a board the hint stops on from there is one it stops
on from the start, which is the way a deal needs. The other way it is only
careful: a board thrown back that the hint alone would have stopped on.

## D6: The bounds, measured again

A network the solver stops on with one answer, and how often the hint stops
on it too (one stream a size, 20 to 90 s):

| Board | Networks | The hint stops | A deal |
| --- | --- | --- | --- |
| 5x5 | 2,872 | 1 in 96 | 2.3 s |
| 7x7 | 1,326 | 1 in 4.8 | 0.13 s |
| 9x9 | 659 | 1 in 3.1 | 0.11 s |
| 11x11 | 370 | 1 in 2.9 | 0.17 s |
| 11x13 | 304 | 1 in 2.5 | 0.17 s |
| 7x7 wrapping | 1,052 | 1 in 1.3 | 0.02 s |
| 11x11 wrapping | 335 | 1 in 1.9 | 0.12 s |

Mean time for a board, 10 to 15 s of deals a shape, each given up after 8 s:

| Kept | | Refused | |
| --- | --- | --- | --- |
| 5x6 | 1.05 s | 5x5 | 2.3 s |
| 5x7 | 0.65 s | 4x6, 4x8, 4x10, 4x30 | 4.1, 2.7, 1.1, 1.4 s |
| 6x6 | 0.3 s | 4x4, 4x5, 3x5 to 3x300, 2x7 to 2x40 | none in 16 s |
| 5x40 | 0.8 s | 5x80, 5x120, 6x100 | 1.4, 2.9, 3.6 s |
| 7x128, 30x30 | 0.55, 0.6 s | | |
| 11x13 walls 0.2 | 0.6 s | 11x13 walls 0.3 | 1.5 s |
| 7x7 walls 0.2 | 0.5 s | 7x7 walls 0.3 | 0.9 s |
| 6x6 walls 0.2 | 1.9 s | 6x6 walls 0.3 | 2.7 s |

So without wrapping the tier needs a shorter side of five and more than 5x5,
a board five or six wide is at most 40 long, and the wall bound falls from
0.3 to 0.2. The wrapping bounds hold: 30x30 1.2 s, 10x80 and 6x80 0.8 s,
4x30 0.75 s, and 3x4 to 5x5 in milliseconds. The small shapes are refused as
too rare, since nothing proves there is none; the shapes every board of which
was walked keep their sentence.

The menu offers 5x5 at Easy alone. A 5x5 Unreasonable board already dealt
still opens, and keeps its tier, since the search still proves it. Its hint
now finishes it in most cases.

## Seen in the app

- `5x5:81924a3be3be5731bb848cca2`, pasted: it opens as "5x5 Easy". Followed
  to the eighteenth hint, the T is ringed, the straight beside it outlined,
  and the four squares the loop would run through striped, under "This T must
  fit the outlined locks, and, pointing up, down and left, it would leave the
  outlined straight no way to fit it without closing a loop through the
  striped squares, so only one way fits: turn it."
- One of the T's cited locks is also on the loop, and is drawn outlined and
  striped both. It reads.
- A dealt 9x9 Unreasonable board, followed to the refusal: about eight
  squares are left open in one pocket, and the hint says nothing further
  follows by deduction.

**For the owner to accept or turn round.** The boards between the tiers are
no longer dealt: upstream's solver stops on them and they need no trial and
error. Without wrapping they are most of what the tier dealt, and nearly all
of it at 5x5. The case for a middle tier is as strong here as in Mosaic, and
Net would deal one cheaply, since its Unreasonable deal passes these boards on
its way: a board the solver stops on that the hint finishes is one draw in
1.5 to 3 of those at 7x7 and up. That is added to
`a-middle-tier-for-the-games-that-search`.
