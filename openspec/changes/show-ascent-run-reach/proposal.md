# show-ascent-run-reach

## Why

The owner found "no other missing number can reach it" overly abstract
(2026-09-27): it is a claim over dozens of numbers, with nothing on the board
to check it against.

Measured over every preset (a scratch census of 318 such steps): in 97% of them
every other number is ruled out by one fact per **run** of missing numbers, the
numbers between two placed ones. A run can only use squares whose steps to its
two ends add up to at most their difference. So the claim is really over a
handful of runs, and the one run that reaches the square can be drawn. The
owner chose, from three sketches, to name that run and stripe its whole reach.

The same census showed the old "This square is next to 16, …, so it must be 17"
was not a valid inference in general (18 could sit next to 16 as well). What
forces the number within its run is reach again, in 275 of 280 steps; an arrow
does it in the rest.

## What changes

- The four "only one can reach" techniques speak one sentence: "Only the run 14
  to 15 between 13 and 16 can reach this square, and of those only 14 can, so it
  must be 14" (with "can step here through empty squares" for the route
  variants), outline the run's ends, and stripe every square the run can reach.
- Hexagons take stripes too, on rects inside the cell.
- The help page teaches runs; the spec's hint requirement says so.
