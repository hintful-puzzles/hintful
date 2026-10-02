# reach-every-declared-mark

**Status: scaffolded, not started (2026-10-02).** Found by
`share-marks-across-tiles`.

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
which roles its hint draws. Make it the population.

- The differential records which roles (and, if task 0 says it is worth it,
  which role-and-kind pairs) its hint frames painted (`RepaintReach`).
- Each hinted game must reach every role it declares, from the seeded run or
  from pinned boards its own tests pass to the comparison. A role that cannot
  be reached is named in a ledger with the reason, per AGENTS.md § "Where
  intent genuinely cannot be observed".

## Hints to pull in

None.
