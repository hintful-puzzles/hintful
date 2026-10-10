# Design

Measured 2026-10-10. Every figure is of the code that day.

## Decision 1: no refusal is written, and the deal goes on running out

The proposal offered a refusal by a rule, or a deal. Neither is taken: no
rule separates the shapes, the shapes that find nothing have nothing to deal,
and the engine already answers a deal that finds no board
(`engine-difficulty`, "A generator that runs out of tries is answered, not
thrown"). The wait before that answer is about five seconds.

**The tier follows the base grid, and below ten squares of it no line holds.**
The sweep was every shape from 2 to 6 on the shorter side and up to 14 on the
longer, at factors of 0, 0.25, 0.5, 1, 2 and 4: 4,000 draws a shape, and
400,000 at each shape that found under four.

| Base grid | Found nothing in 400,000 draws | Found boards |
| --- | --- | --- |
| 2x2 | every shape, at every factor | none |
| 2x3 | 3x5, 4x5 at 0.5; 3x6, 3x7, 4x6, 4x7, 5x6, 5x7 at 1; 3x9 to 5x11 and 6x9 at 2 | 6x10 and 6x11 at 2, one draw in 2,600 and in 1,400 |
| 2x4 | 3x5, 3x6 at 0.25; 3x6, 3x7, 4x6 at 0.5; 3x8, 3x9 at 1 | 4x7 at 0.5 (one in 11,000); 4x8 at 1 (one in 44,000); 5x13 at 2 (one in 44,000); twelve more |
| 3x3 | 4x4 at 0.25; 5x5 at 0.5; 6x7 at 1 | 6x6 at 1, one draw in 2,000 |
| 2x5, 3x4 and every larger | none | every shape, one draw in 100 to 11,000 |

A 3x3 base carries the tier stretched to 6x6 and not to 6x7 or 5x5. A 2x3
base carries it at 6x10 and not at 6x9. What decides it is which rectangle
areas have a second way to be drawn on that board, which is arithmetic on the
board's sides and has no line through it in the base, the board or the
factor. A table of the shapes swept would be a guess everywhere past them.

**Where nothing was found there is nothing to find.** At 5x5 with 0.5 and at
6x9 with 2, every number was put on every square of its rectangle, on every
division the generator drew in 20,000 draws: 229 divisions and 193,715 boards
at the first, 103 and 326,067 at the second. No board had one answer that the
solver and the hint both stop short of. At 6x10 with 2, which deals, the same
walk found the tier on one division of 117, and on 192 of its 5,832 boards.
So moving numbers further, the proposal's second option, has nothing to reach.

**A board of two rectangles never has the tier, and that one could be
named.** Every board of two rectangles from 2x2 to 12x12, 649,649 of them,
either is settled by the solver or has a second answer. A 2x2 base always
stretches to two rectangles. It is left unrefused all the same: it would be
one more table in one game's `validateParams`, for a corner of the Custom
dialog, where the engine's answer comes in a few seconds (owner, 2026-10-10:
the per-game refusal tables stop growing).

**What a player meets.** Rectangles, Type, Custom, 5x5, expansion factor 0.5,
Unreasonable: after five seconds in Chrome, "No Unreasonable puzzle of this type
was found. It may be too rare to deal, or there may be none: try again, or
choose another type." The board in play stays.

**The rarest shape that deals runs out one deal in sixteen.** 5x13 at a
factor of 2 finds a board once in 44,000 draws and is allowed 123,000. The
allowance is left alone here, and belongs to
`answer-a-deal-with-no-board-in-the-engine`, which takes the allowance out of
the game.

## Decision 2: a board dealt solved is dealt again, by the engine

The sweep's divisions turned up one that is a single rectangle. On a 3x3 base
the generator mends a lone middle square, where four dominoes surround it, by
laying a 3x3 rectangle over them: the whole base. An Easy deal then hands
over a board with one number, which is solved before a move. Of 2,000 Easy
deals each, 173 came so at 3x3, 176 at 5x5 with 0.5, 154 at 6x6 with 1, 166
at 4x4 with 0.25 and 188 at 9x9 with 2. Upstream does the same.

Asked of every game, over its params corpus (641 cases, 14,450 deals): the
same came from Rectangles and from Netslide at 3x3 with one move, one deal in
25, and from no other game.

So the rule is the engine's. `generate` in `src/engine/deal.ts`, which every
deal in the app comes through, asks the game for the status of the board it
was handed and deals again where it is solved, from the same random stream,
up to twenty times before it answers as for a generator that gave up. No game
gains a line. The four games that reject a solved shuffle in their own
generators (Fifteen, Flood, Flip, Twiddle) are not touched here.
