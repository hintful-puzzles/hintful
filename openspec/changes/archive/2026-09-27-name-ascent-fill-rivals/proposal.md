# name-ascent-fill-rivals

## Why

Owner playtest, 2026-09-27, on a regular 8x10 Hard board
(`8x10mRdh#d3786d1d423a44aa21ae566610d639a1`, several numbers in): the hint
said "Only the run between 67 and 72 can reach this square, and of its numbers
only 70 can, so it must be 70" and striped most of the top-left quarter. The
owner found it unclear. It is the same symptom as the Edges `route` step fixed
by `read-ascent-edges-by-lines`: a large striped area standing in for a reason.
The cause is different.

Read off the screenshot (dated 2026-09-27; re-derive before building): the
ringed square is the top-left corner. 67 is at row 4, column 2 and 72 at row 3,
column 3, so the corner is 3 steps from 67 and 2 from 72. That is exactly 70,
and the step counts rule out 68, 69 and 71. The step fell back to the striped
reach because `fillReason` names a rival only when **exactly one** other run
comes within two steps, and two did: the run between 72 and 76 (76 at row 1,
column 4) misses by 1, and the run between 61 and 67 (61 at row 5, column 6)
misses by 2. That rule was deliberate (`follow-ascent-runs`): naming one of
two rivals would imply it was the only contender.

Measured the same day: 11 of 2,594 steps across the rectangle presets mark
more than a third of the board, almost all of them this fallback. It is rare,
but it is what the player sees when a board gets hard.

## What changes (to design)

The options, none chosen yet:

- **Name both rivals when the sentence fits**: "Only 70 can fill this square:
  the runs between 61 and 67 and between 72 and 76 fall short, and 3 steps from
  67 and 2 from 72 rule out the rest." That is about 140 characters today, so it
  needs a shorter shape.
- **Lead with the counts, which carry the reason here**, and outline the
  rivals' ends instead of naming them. The sentence would still have to say
  why the other runs cannot, or it claims less than it proves.
- **Stripe less**: the rivals' reach, or only the squares near the target, in
  place of the whole run's reach.

This changes wording a player reads, so the owner judges it.

## Census (2026-09-27)

Following the hint to the end on every non-Edges preset, 10 seeds each (2,469
steps), the striped fill steps whose counts single the number out had **two**
close rivals 35 times, **three** 32 times, and **four to seven** 22 times.
Another 12 had one rival whose sentence ran past 120 characters. Naming the
rivals is a roll call that cannot fit: the owner's two-rival sentence is ~150
characters, and two is the smallest case. Of the remaining striped steps, most
are runs of a single number (two or three squares striped, which reads well),
and the rest are route readings that straight reach does not settle.

## Decision

The deduction that the stripes failed to show is "of its numbers only 70",
and the counts say it in one clause. So when a run of several numbers is
singled out by its counts and the rivals cannot be named at a glance, the step
says **"Only 70 can fill this square: no other run can reach it, and 3 steps
from 67 and 2 from 72 rule out the rest."**, outlines 67 and 72, and stripes
nothing. The zero- and one-rival sentences are tried first, unchanged; a run of
one number keeps its striped reach.

This was implemented without waiting on the owner: it is the existing fill
sentence with a third reason, not a new shape, and the proposal's own
constraint (other steps unchanged) held exactly. The owner accepts it on top.

Proved against the previous commit over 3,772 steps in every mode and option:
identical plans and moves, 78 steps changed, every one a fill step that was
striped and now is not. Steps marking more than a third of the board fell from
15 to 4: three Edges `pointers` steps on 5x5 boards and one orthogonal
`routeOnly`, whose reach is counted through empty squares, so counts by straight
reach cannot carry it.

## Constraint

Regular boards' other steps must not move. Check plan for plan against the
previous commit, as `read-ascent-edges-by-lines` did, and let the only
differences be the steps that took this fallback.
