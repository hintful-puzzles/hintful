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
line never appears to run through a point. The chosen move is then recounted
with the exact `cross()`; the narration's numbers are those exact counts.

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
