# find-why-bridges-grades-a-grown-board-differently

Found by `settle-the-cells-the-tier-walk-still-lists`, which worked around it.

## Why

Bridges' solver gave one board two verdicts, depending on how the state it
was handed was built. Measured 2026-10-05: with the generator grading the state
it grew, 4 of 1,200 boards dealt at Tricky (`5x5i30e10m4d2`, `11x11i5e10m3d2`
and `11x11i5e10m4d2`, 400 each) solved at **Easy** once read back from their
descs, and at every cap above it. In memory, the same board had not solved at
Normal, which is how it passed the tier gate. Four of them:

- `5x5i30e10m4d2:5aAa3i2b3b4c5`
- `11x11i5e10m3d2:4b7f2zzf2zn3b2g`
- `11x11i5e10m3d2:2i1zg4d7d2zzh2e`
- `11x11i5e10m4d2:5dAd3v4zzx3d3e`

The generator was made to grade `newStateFromDesc(p, encodeGame(st))`, so what
it dealt was graded as the player gets it.

## What was found

The scaffold guessed a solver pass not run to a fixpoint. The passes are run
to a fixpoint; what fails is that one rule is not monotone, so the fixpoint
depends on the order the islands are visited in.

`islandAdjspace`, the room an island has along a span, was upstream's
`min(possibles, missing, maximum - current)`. `possibles` is the span's whole
capacity (the lesser clue at its ends, zero if blocked), so the bridges
already drawn came off the limit and never off the capacity. On
`4b7f2zzf2zn3b2g` the 7 at (3,0) has a 4, a 2 and a 2 for neighbors, at three
bridges a line:

- In reading order the 7 is visited holding one bridge. Room is 2 + 2 + 2,
  it needs six, and "room for exactly what it needs" fills all three spans.
  Easy solves the board.
- With the corner 2 listed ahead of it, the 2 fills first. The 7 then holds
  three bridges and needs four; the full span to the 2 reads as room for one
  more (limit 3 less 2 drawn), so room is 2 + 1 + 2 = 5 and the rule does not
  fire. Later the span to the lower 2 carries one bridge and still reads as
  room for two. The rule never fires again, and the board needs Tricky.

The rule's slack, room less need, rose with every bridge drawn on a span with
capacity to spare. With the bridges taken off the capacity it only falls.

Reading order was not the strongest order either: before the fix, dealt
Normal boards at `10x10i30e10m3d1` were found that another order solved at
Easy, and others that another order could not solve at Normal.

## What Changes

- `BridgesState.islandAdjspace` returns
  `min(missing, min(possibles, maximum) - current)`, never below zero. This
  is a deliberate divergence from upstream and strengthens Easy and, through
  `islandImpossible`, Tricky.
- The generator grades the state it grew again; the read-back is gone.
- The hint walks the same rungs, so "has room for exactly N" now counts room
  the way a player does. No hint pin or snapshot moved.

## What it costs

Boards a seed deals change wherever the old room gave a different verdict.
The frozen C fixtures all still match byte for byte
(`bridges-differential.test.ts`), so none of them was such a board.

## What replaces the oracle

Upstream's room is no longer reproduced, so the fixtures stop vouching for
this function on boards outside them. In its place: the four boards above
pinned as descs and solved in 720 shuffled orders each, a shuffle over 150
dealt boards at `11x11i5e10m3d2`, and the 80 deals at `11x11i5e10m4d2`. All
three were seen red with the old room planted. The shuffle over dealt boards
was tried at five sizes and went red at one, so it is kept at that one and
the pinned boards are the guard.

## Hints to pull in

None.
