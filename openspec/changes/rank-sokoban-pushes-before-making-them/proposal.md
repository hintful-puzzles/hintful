# rank-sokoban-pushes-before-making-them

**Status: scaffolded, not started (2026-10-04).** A follow-up from
`strengthen-the-sokoban-solver` (design D9).

## Why

Sokoban's search now goes nearly straight to a line, and what it costs is the
positions it generates on the way: every push of every position it expands.
Measured 2026-10-04 on the development machine, under load:

- A line of about 90 pushes on a hard 16×20 board costs about 25,000
  positions, some 150 pushes a side for each step down.
- A position generated at 16×20 costs about 6 µs, of which its key is 2.4 and
  its estimate 2.9. About one position in fifty is ever expanded.
- A hint request on such a board averages 0.2 to 0.4 s, and a Custom 40×40
  deal takes about 8 s to give up, since the cost per position grows with
  the board.

So most of the time goes on keys and estimates for positions the search never
looks at again.

## What Changes

Rank a push before making its position, from something cheap (the change in
the pushed barrel's own distance, and its distance from what is out of
place), and make the position, its key and its full estimate only when it is
taken from the frontier.

What has to be settled first, and why this was not done in the parent change:
a side then knows only the positions it has taken, not the ones it has
generated, so the two sides meet less often. Either side alone finished 24
and 21 of 30 openings at 16×20 within 30,000 positions where the two together
finished 27 (parent design D6), so the meeting matters, and the measurement
that decides this change is whether the cheaper positions buy back more than
the rarer meetings cost.

## What would show it worked

The same figures the parent change took: openings finished within
`DEAL_BUDGET` and `PLAN_BUDGET` at each preset, time per opening, and the
worst hint request on dealt boards. The search must stay deterministic and
must still prove a position lost only by running out of positions.
