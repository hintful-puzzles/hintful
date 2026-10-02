# reach-every-declared-mark

**Status: implemented (2026-10-02).** Found by `share-marks-across-tiles`.

## Why

`warm-repaint.test.ts` requires a hinted game to have painted *a* hint frame.
It does not ask *which marks* that frame carried. A mark the seeded deal never
shows therefore passes the comparison forever, whatever its tile key gets wrong.

This is measured, not suspected. On 2026-10-02, leaving Pegs' rival arrows or
stripes out of the tile key went green on the collection-wide run, because
the deal's opening hint never draws either. Bricks' edge diamond, which the
run once convicted, had also fallen out of its reach. Both are now pinned by
hand in their games' tests (`share-marks-across-tiles` D2). That covers the
two games someone checked, not the population.

## What Changes

`hintMarks` is already a declaration the engine consumes: each bound game says
which roles its hint draws. The renderer's own reads (`StepMarks.of`) say which
`role|kind` pairs it can paint. Together they are the population (design.md
D2).

- The differential records the pairs its hint frames painted and the pairs
  the renderer asked for (`RepaintReach`). It also walks the hint's plan to
  its end, and passes a marked dead end to `redraw`.
- Each hinted game must paint every pair its renderer asks for in a role its
  legend lists. A pair can come from the seeded run or from a board pinned in
  `warm-repaint.test.ts`. A pair that cannot be reached is named in a ledger
  with the reason, per AGENTS.md § "Where intent genuinely cannot be
  observed".

## Hints to pull in

None.
