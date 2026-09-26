# unflip-a-mirrored-untangle-cluster

**Status: scaffolded, not started (2026-09-26).** Found by
`shorten-the-untangle-endgame`; see its `design.md` § "D8", "What is left".

## Why

With endgame journeys, Untangle's hint follows a person's pace on 20-point
boards, but on 25-point boards it still averaged 47.4 moves (from 50.9). The
remaining thrash is mostly one shape: a whole cluster of about ten points
drawn as the mirror image of how it must sit against the rest. The
neighbor-order check against the solved layout names exactly that cluster.
Journeys re-place at most 8 points, and a trial with sets of up to 11 and ten
times the work did not unflip it either. So the walk falls back to
single-point steps for thirty moves or more.

A person moves such a cluster bodily: reflect it, keep its shape.

## What changes

A journey that re-places a whole cluster by a reflection of its current
positions (across a line chosen so it lands in the room it vacated, or beside
it), keeping the rest fixed. It is checked like any other journey: exact
crossings, the hint's gaps, and the termination rules of
`shorten-the-untangle-endgame` (the first leg cuts crossings and moves no
placed point, and a journey that leaves crossings behind moves none). If the
reflected cluster still crosses a few lines, the ordinary culprit search can
finish from there.

Open questions for the change to settle:

- Which cluster: the wrong-order set's connected pieces are a start, but that
  set is unreliable on graphs that are not 3-connected (the same D8).
- How to narrate a journey of ten legs whose early legs raise crossings, or
  whether a cluster should move as one step (Untangle's move format already
  places several points at once).

## Impact

- Player-visible: fewer hint moves on large boards, and possibly a new kind of
  step. Owner acceptance is required.
- `untangle` spec: the journey requirement.
