# describe-ascents-hint

**Status: filed by `describe-ascent` (2026-11-09)**, which moved Ascent's
solver and its generator's grading onto the described ladder and split the
hint off at its start (its `design.md` § "Decisions"). It finishes step 11 of
`describe-the-whole-catalog`'s plan; when it is archived, that change's
task 4 is next.

## Why

Ascent's hint still runs the solver's hand-written rungs: `hint.ts` builds a
`SolverScratch` a technique (`reading`, `placeBy`) and calls
`solverProximitySimple`, `solverProximityFull`, `solverOverlap`,
`solverSinglePosition` and `solverSingleNumber` from `solver.ts`. Those rungs
are a second statement of the reasoning the description states and the
checker proves sound, kept only for the hint.

## What Changes

- **The hint walks the compiled ladder's firings** (`ascent.compiled.ts`,
  run as `ascentSolve` runs it), each firing narrated by its technique, as
  the other described games' hints do; `touch`, `reach`, `only`, `route` and
  `routeOnly` become narrations of `nextTo`/`onlySquare`, `reach`,
  `onlyNumber`/`onlyNumberNear` and `overlap`. Readings the ladder does not
  hold (dead ends, the Edges lines and arrows, whole runs) are weighed
  first as techniques of the description; one stays a reading of the hint
  only with its reason.
- **The rest of the hand-written solver is removed**: `SolverScratch`,
  `solverStart`, `solverPlace`, the five rungs above and `solverEdges`.
- A hint still rests only on numbers, walls and arrows the player sees
  (`hint.ts`' header): the ladder's candidates and links are never named.

## Acceptance

Ascent's hint runs on the compiled ladder, and `solver.ts` holds no
hand-written rung. The hint walks are compared with HEAD's (steps, words,
refusals), each difference reported. The hint tests and the hint-quality
walk pass, the help is updated, and the running app is checked.

## What binds here

The lessons in `describe-ascent`'s proposal (Crossing's on aiming a hint's
narrowing and tracing a placement's premise by fact) bind here.
