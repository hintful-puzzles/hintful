# Design: close the trace gaps

## Measured (task 1.1, 2026-11-18)

Every judging game's default board, one deal; the hint's moves on the board
as dealt, each made alone, judged, with the judge's replay heard
(`auditChains`). Before: 852 of 1,181 chained verdicts named a start. The
329 unnamed, by reason:

| Reason | Verdicts | Games |
| --- | ---: | --- |
| No chain: the graph names no candidate before the firing that made the move | 168 + 19 | Loopy all 168; Magnets 6, Subsets 4, Adjacent 3, Filling 2, Spokes 2, Pearl 2, Map 2, Salad 1 |
| Candidates cut off at 12 (`MOST_TRIED`) | 103 | Pattern 56, Slant 22, Sticks 14, Unruly 7, Clusters 3, Pearl 1 |
| The replay misses the move: a firing is not offered | 33 | Pearl 16, Subsets 9, Map 3, Salad 5 |
| Every candidate can be left out | 3 | Galaxies |

The measurement was a scratch test, not kept; the guards below stay.

## What each reason was, and the mend

**The graph names no candidate (Loopy).** A Loopy firing cites the corner
notes and relations it rests on and never a line, which the player sees.
The graph calls such a chain complete, with nothing before the firing, so
`chainOf` named no candidate. But the judging walk takes the firing that
makes the move the moment one is on offer, so a move it reached late rests on
something earlier the graph does not say. `chainOf` now falls back to every
earlier firing there, as it already did where a firing reported no reads.
The same holds where the firing that reached the move made none of the facts
that make it.

**Builders write marks outside the firings (Pearl, Map, Subsets).** Pearl's
step draws the line a pearl carries on (`stepOf`, `carryOn`); Map's settle
brings the marks down to the working board its legs color; Subsets' collapse
strikes the sets a square's decided letters rule out. None was in the graph,
so the replay never made them. The proposal's choice: record them through an
engine hook, not per game. `LadderWalk.trace(fresh)` builds the `Traced` the
judge reads, and from then on the walk keeps a copy of the marks as each
firing leaves them. What changed since, which the graph does not already
hold, is recorded as that firing's facts (no reads), and its `to` moves past
them: the judge asks (`Traced.adopt`) before it reads the marks, and the
walk before it takes the next firing. Each of the eleven ladder builders now
traces through `walk.trace`, so none can hand the judge a graph without the
hook. The replay makes a firing's facts past its own (`besides`) once the
firing is made. Writes a firing's strikes set off inside `applyFacts`
(`CellMarks.striking`, which records nothing) are kept the same way.

The edge hint's `between` (its `settle` before each replayed firing) was then
redundant: without it, every chained verdict in the fourteen edge-hint games
over three deals named its start (817 of 817). Removed. The candidate plan
keeps its own `between` (the obvious clean, which is no firing's).

**A firing with no step made the move (Magnets, Subsets).** A firing that
shows no step is bookkeeping, and its facts go with the next shown one. The
judge dated a fact such a firing made to the shown firing before it, and
where the walk ended there, those facts reached no firing at all. A fact
reached while facts are carried is now dated to the firing they go with, and
the walk's end hands carried facts over as a last firing.

**Candidates cut off.** The search left out one candidate at a time, the
earliest first, up to 12. Lifted, it named all 103, but Pattern's dearest
check rose to 543 ms (11,849 offers). It now halves: the first `j` such that
the chain, less every candidate up to `j`, stops short, then confirms `j`
left out alone; where the chain reaches the move without it, the search goes
on past it. `MOST_TRIED` is gone.

Decision, halving over a linear search: the replay is not quite monotone. A
technique may offer a fact on fewer marks and not on more (with more decided,
another rung would make it), so leaving out more can bring the move back.
Against the unbounded linear search, halving named a later start in 6 of
1,181 verdicts, all Pattern; each start it names was confirmed alone, so the
chain cannot do without it. The linear search's "earliest" there rests on the
same artifact from the other side.

`MOST_OFFERS` rose from 2,000 to 4,000: over ten Pattern deals the busiest
check asked 2,829 offers (130 ms), and at 2,000 four checks on one deal named
nothing.

**Every candidate can be left out (Galaxies; Adjacent once the above were
mended).** The chain reached the move with every earlier firing left out, so
the firing that made it made it from the board as it stood, and the walk
came to it late only by the order it took firings in. In Adjacent that is the
aim, which counts a firing's own facts and not the cull of a placement its
strike folds into (`trace-candidate-plans`); Galaxies' `soleOwner` is no
fallback, and why its walk took others first was not traced, since the
verdict is the same whatever the order. The verdict is now direct,
naming that firing's technique, which is the technique the hint's own step
names. This mends Adjacent's case without teaching the aim to simulate a
fold, which would cost a copy of the marks per offered firing.

## Left

Salad, 6 verdicts: a firing that rests on a marker (`countHolesDone`) is not
offered again, since a marker is Salad's own state and no fact. As
`trace-candidate-plans` recorded, making the markers facts is Salad's own
work.

## Measured after (task 1.4)

Same boards: 1,169 of 1,175 chained verdicts name a start, and 6 more are
direct. Dearest check 142 ms (Path), most offers 1,878 (Pattern), under the
machine's usual load.

In the app (Chrome, dev server), a fresh 10x10 Easy Pattern board: shading
the second square of the top row, then Check & save, shows "Your last move follows a few steps on, starting
from every way a line's runs fit.", the verdict the judge gives that move on
that board in a test.

## Guards (task 1.3)

`move-judge.test.ts`, "where a chain began", each seen failing with its mend
reverted: a graph that names no parent ("looks before the move"); a start
past a dozen candidates; a builder's writes, after a middle firing and after
the last ("replays what the builder writes"; and Map's board, which also
failed with the hook off); a step-less firing's facts ("dates a move"); and
a move made from the board by a firing the walk took last (the direct
verdict, "names no start the move does not rest on").
