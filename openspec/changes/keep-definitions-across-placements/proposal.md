# keep-definitions-across-placements

**Status: filed by `describe-rectangles-and-galaxies` (2026-11-07)**, from
what Rect's Unreasonable deals measured. The owner chose (2026-11-07) to
ship Rect with that cost and take this change next, before
`describe-galaxies`.

## Why

A kept definition (`docs/descriptions.md` § "What a technique compiles to")
is thrown away whole the moment any value is placed. A rung that fires
places a few values in one corner of the board, and every pass after it
rebuilds every element's value, though most read nothing that changed.

Rect shows the cost. Its Unreasonable deals take about three deductions a
mending search and several hundred searches a deal, as HEAD's did, but each
deduction costs about 0.8 ms on a 12×14 board against about 0.1 ms for
upstream's incremental solver. Most of it is `fits(q)` and `reachers(x)`
rebuilt for every clue and square after every firing. Measured 2026-11-07
(the change's last commit), a deal took, back to back with HEAD: 11×11
Unreasonable 0.28 s against 0.03 (mean of six); 12×14 and 15×15 0.2 to 2.1
s against 0.03 to 0.2 (four seeds each). Easy and Normal deal as fast as
HEAD; Patches 9×12 Normal takes 0.35 s against 0.13.

Every described game whose search or grading runs a ladder many times pays
the same, so the fix is the engine's.

## What Changes

- **A kept value is kept until a placement that could change it**: the
  marks it read, or the elements it was built over, recorded as it is made,
  and a placement drops only the values that read the placed element.
  Alternatively, a set the description filters by the marks is refiltered
  from its last value when a placement can only narrow it (Rect's `fits`).
  Which of the two is the design's first question.
- **Measured on Rect's Unreasonable deals and one other described game**
  that runs a search, against the change's own HEAD, back to back.

## Open

- Whether a kept value's reads can be recorded cheaply enough that the
  recording does not cost what it saves on a game whose rungs read little
  (a Latin square's).
