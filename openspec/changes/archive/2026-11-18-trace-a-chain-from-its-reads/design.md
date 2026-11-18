# Design: trace a chain from its reads

## What was measured (task 1.1, 2026-11-18)

Every judging game's default board, one deal; the hint's moves, each made
alone on the board as dealt, judged. Before: 104 of 1,245 chained verdicts
named a start, in the games whose techniques said what they read or whose
walk cited (Path, Boats, Clusters, Light Up through its placements' culls,
and a few more), and none in Unruly, Mosaic, Palisade, Pearl, Tracks and
most others. After: 626, each the earliest firing its chain cannot do
without. The measurement was a scratch test, not kept; the guards below are
what stays.

## Decision: a replay decides, not the reads

The proposal weighed recording each builder's `reads` (the cells a firing
marks, outlines and fills) where nothing narrower is stated. Rejected: those
are what a step shows, not what its premise read (Unruly's quota reads its
whole line).

Recording what each compiled technique's formula read was then built: the
compiler's `says.reads`, which only Path's `lineBreaks` asked for, made the
default, with the conclusion read too (Bricks' `undercount` holds its
condition there). It was measured wrong both ways. A formula that counts a
line reads all of it, so Sticks, Galaxies and Range named starts their chains
did not need. A builder that writes marks outside its firings leaves the
graph a parent short: Pearl's `stepOf` draws the line a pearl carries on, and
34 of its 42 chains could not be replayed. It named 414 starts, where the
replay search below names 626 without it. And it cost every player 240 KB of
download (the game worker, 2.94 MB to 3.18 MB). That also passed the build's
3 MiB precache limit, but the limit is only a trip-wire against Workbox
silently dropping the worker from the offline cache; it would have been
raised, and did not decide this. Dropped; the compiler is as it was.

What decides instead is a replay. A builder hands the judge its trace
(`Judging.traced`: the graph, the firings the walk took with the graph's
facts each made, `LadderWalk.taken`, and its starting marks made again). The
judge replays the walk's firings on fresh marks, each as its technique
offers it then, leaving out one candidate at a time, earliest first, and
names the first without which the move is not made. The candidates are what
the graph says the fact rests on where every firing in it said its reads,
and every earlier firing where one did not.

One trap, found by measuring: a firing no longer offered once a candidate is
left out must be passed over, not end the replay. Ending it named a
candidate for what a later, unrelated firing needed: 738 verdicts named a
start that way, 112 more than once the replay passed over such a firing, and
those 112 were the move not resting on the start.

`traced` replaces `graph` on `Judging`, so a builder cannot hand over a graph
without the means to check it. A search tries at most 12 candidates and asks
for at most 2,000 offers all told, and names none past either; every judging
game's default board stayed within both (at most 1,456 offers; its dearest
check 193 ms under the machine's usual load).

## Per builder (task 1.2)

The question became what each builder supplies for the replay: its marks
made afresh.

- `describedHint`, `describedFiringHint`: the spec's marks or walk again.
- `describedEdgeHint`: the walk again, with `settle` between firings.
- Crossing, Filling, Loopy, Net, Pattern, Slant, Subsets: each game's own
  marks constructor, on a copy of the board it began from (Loopy, Slant,
  Subsets and Crossing write the board they walk).

## What is left, filed

- The candidate plans (`candidate-plan.ts`, judged by `candidateJudge`: the
  notes games, Keen, Solo and Towers among them) keep no trace, so their
  chained verdicts name no start: `trace-candidate-plans`.
- Walks whose chains the replay cannot confirm: Loopy (none of 168), Pearl
  (14 of 46), Galaxies (25 of 53), Pattern (43 of 104), Slant (21 of 43):
  `close-trace-gaps`.
