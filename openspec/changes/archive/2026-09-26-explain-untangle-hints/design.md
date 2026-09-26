# Design: explain-untangle-hints

## D1. Compute the solution rather than persist `aux`

Two ways to give a resumed game its solution: add `aux` to the save envelope,
or compute a layout from the edges. Persisting fixes resumed saves only; a
shared `<n>:<desc>` ID would still have no solution. Computing fixes both and
needs no save-format change. `aux` is still preferred when the session has it,
because the generator's grid layout is the tidiest one available.

The algorithm is the standard pipeline (the same one networkx's
`planar_layout` runs): LR-planarity for a rotation system, join components and
biconnect every face, triangulate all faces but the largest, canonical
ordering, shift drawing. Coordinates are integers on a `(2n-4)×(n-2)` grid, so
an affine stretch to the box is exact in rationals.

Every walk over the rotation system is bounded by `retryLimit`: a planted
defect in the embedding phase first showed up as a hang (a face walk that never
closes), which would freeze the worker for a player and hang vitest's
hour-long timeout for a developer.

**The shift drawing crowds points along one edge of a triangle**, so
`solution.ts` relaxes it: spring-and-repulsion steps per point, each taken only
if the point's lines still cross nothing and it comes no nearer than a
clearance to any point or line (or no nearer than it already was). The result
is rounded to 1/64 and verified exactly; if the check failed, it would fall back
to the unrelaxed stretch, then to the raw integer grid, which needs no rounding.

## D2. The hint: most crossings removed, counted exactly

The search runs in floats over a 24×24 offset grid of spots (offset so a spot is
not collinear with points on whole or half units), plus the point's place in
the solved layout and its neighbor centroid. Candidates are settled one gain at
a time, best first. Within a gain tier the order is: a move onto the point's
place first (so it will not need moving again), then the least crowded spot,
counting the box walls as crowding (without them the roomiest spot is always
against the frame). Spots too near another point or line are excluded, so a
line never appears to run through a point (the gaps are in D3a). The chosen
move is then recounted with the exact `cross()`; the narration's numbers are
those exact counts.

**What the sentence claims, and what it does not.** It states the point's
crossings before and after — checked. It does not say "the best move", because
a grid search is not exhaustive (the true optimum lives in the cells of an
arrangement of lines, too many to enumerate per request).

## D3. Termination and recompute stability

A stalled greedy walk switches to placing points at their solved-layout spots.
Naively, the next greedy step undoes that placement (moving the point back off
its spot removes crossings), and the walk cycles. Two rules prevent it:

- **A point exactly on its place is never moved by either kind of step.**
- **The layout's orientation (one of the square's eight symmetries) is chosen,
  on every request, as the one with the most points already in place**, ties
  broken by least motion.

Then each step either removes a crossing without lowering the placed count, or
raises the placed count by one. The pair (placed count, −crossings) strictly
increases lexicographically, so a hint recomputed after any step cannot cycle,
and the walk ends solved. Removing the first rule makes
`untangle-hint.test.ts` fail with "did not converge" (checked).

"In place" is exact rational equality, not pixel tolerance: the targets are
now fixed exact rationals, so the jitter that once forced a pixel tolerance
(`hint-resume.test.ts`'s Untangle history) no longer exists.

## D3a. Wording, spacing and the board's own count (owner review, 2026-09-26)

The first cut said *"This point's lines make 12 crossings. Moved here, they
make only three."*: a fragment with a full stop, and "12" beside "three". Now
one sentence with numerals throughout: *"Moving this point here cuts its
crossings from 12 to 3."*, *"…clears all 12 of its crossings."*, *"…clears
both of its crossings."*

The fallback step said the point "goes to its place in an untangled layout".
The player has never seen that layout, so the sentence rested on hidden
information. It now reports what the board shows: *"Moving this point here
keeps its crossings at 1, but frees a move that removes 2."* The payoff is
the next step's measured removal, looked up past the plan's end so a step
reads the same wherever it falls in a plan. Without a payoff: *"No single move
cuts the crossings from here. Moving this point here raises its crossings from
1 to 2."* Every sentence stays under the collection's 120-character ledger.

Owner: moves put points too close to others and to the frame. The gaps are now
fractions of the typical point spacing `w/√n` (0.45 to a point, 0.2 to a line,
0.35 to the frame), shared with the solved layout's margin and relaxation, and
the fallback prefers a place that passes the same clearance check. Measured on
12 boards followed to solved, the 10th-percentile distance from a hinted spot
to its nearest point rose from 0.23–0.28 spacings to about 0.5, and the frame
margin from 0.19 to 0.35. But strict gaps made the search stall more often
(55 payoff-less fallback steps at n = 25). A second search at 0.8 of the gaps
before falling back removed all of them, at a 10th percentile of 0.35–0.41.

Following the fallback steps also exposed a counting defect: `cross()` is a
verbatim port of upstream's and is not symmetric when a point lies exactly on
a line. The hint tested each pair in a different argument order from
`findCrossings`, so in that case a narrated count could differ by one from the
red lines. `crossingsAt` now tests each pair in the board's order, and the test
counts a point's crossings as the board's total less the total without that
point's lines. A snap-to-grid start makes the case common, and it catches the
old order (checked).

## D3b. Which point a stall-breaking step moves (owner review, 2026-09-26)

On a shared 20-point board (pinned in `untangle-hint.test.ts`) the fallback
nudged a crossing-free point 0.18 units and said it "keeps its lines clear":
a move with nothing to show. Any unplaced point keeps the walk terminating
(D3), so the choice is free, and it had been made only by "place clear, fewest
crossings added", which ranks exactly that move best. The choice is now:

1. Points in some crossing, moving at least a point gap, onto a clear place,
   before any other.
2. Among the six such placements that add the fewest crossings, look one move
   past each, and take the one whose next move removes the most, net of what the
   placement adds.

Across 24 boards followed to solved (half scattered), idle fallback moves went
from 81 to 1, and moves to solve at n = 20 from 40 to 30. The lookahead is
capped at six placements because each one is a full search; uncapped, the
worst request at n = 25 was 897 ms, capped 311 ms (both under load).

The payoff clause ("…but frees a move that removes N") is said only when N is
at least what the move adds. Otherwise the "but" would promise a payoff that
does not cover the cost, as in "raises its crossings from 1 to 5, but frees a
move that removes 1".

## D4. Plans are short

A plan holds at most six steps. Every step is a fresh measurement, and the
midend recomputes when a plan runs out, so a shorter plan loses nothing and
keeps a request around 50–300 ms on a desktop (n = 10–50, measured under load).

## Declined

- **Two-move lookahead as the stall breaker**: measured slow and still
  incomplete (it left 1–6 crossings on about 10% of scattered 25-point boards).
- **Rings capped on the opening tangle**: the first hint on a circle can ring
  40+ crossings. It is honest and it thins out fast. Left for owner
  acceptance rather than decided here.
