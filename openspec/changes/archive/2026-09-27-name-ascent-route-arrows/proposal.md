# name-ascent-route-arrows

## Why

Owner playtest on the deployed Edges hints, 2026-09-27: "The run between 16
and 20 has only one route through the empty squares, so it must go along the
line" was "slightly unclear", because it "doesn't make the case for why the run
can't be on the other side". The route was forced by the arrows: 17 and 18 point
down the first column and 19 along the bottom row. Without the arrows the run
could have gone around the other side, and the step neither said this nor
showed the arrows.

## What changes

- A whole-run step in Edges mode records whether the arrows are why its route
  is the only one. This is checked by counting routes again with the arrows
  ignored and finding more than one, not inferred. A count that gives up claims
  nothing.
- When they are, the sentence says so: *"With each number on its arrow's line,
  the run between 4 and 7 has only one route, so it must take the one drawn."*
  With must-visit squares: *"No other run reaches the striped squares, so the
  run between 13 and 21 must take them, on the one route its arrows allow."*
  When that exceeds 120 characters, the old sentence stays. Either way the run's
  arrows are outlined. The route is "the one drawn" because "the line" would
  read as an arrow's.

## Measured

Over 120 5x5 Edges boards, 170 of the 197 unique-route steps turned out to be
arrow-forced, so the owner's screenshot was the common case. 4 of 7 "must" steps
fit the new sentence; the other 3 keep the old words and outline the arrows.
Regular boards were checked plan for plan against the previous commit: 679
plans, zero differences. The test recounts routes without arrows by brute force.
It went red when the flag was planted to claim the arrows on every Edges route.
