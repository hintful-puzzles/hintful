# describe-runs-sightlines-and-looks

**Status: filed by `describe-on-a-graph` (2026-11-02)**, step 7 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). It files
step 8, `describe-connectivity`, when it is archived.

## Why

ABCD, Sticks, Magnets, Light Up and Bricks each run a hand-written ladder
beside a description that states at most its answer check. What they read
that the language lacks: Q, a run along a line (a segment, a beam from a
cell until a wall or a mark); L, a `look` premise, the rules checked once
on the marks with a fact or two added and nothing propagated; P,
propagation when a candidate is struck, not only when a value is placed;
W, cells outside the answer (Light Up's walls, Bricks' holes); tile marks
(Magnets); and a brick-wall space (Bricks). Light Up's solver is the
fixpoint header's named exception, a scan that is not a ladder.

## What Changes

- **Q, L, P, W, tile marks and a brick-wall space** in the description
  language, the ladder runtime and the checker, each only as far as a game
  of the five reads it.
- **Each game's ladder stated**, its tiers as the game grades them, and the
  hand-written rungs retired; Light Up's exception in the fixpoint header
  retired with its scan. A search tier stays the engine's search.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's
grading; the hand-written rungs removed; every technique checked sound;
the boards dealt, their tiers and the hint walks compared with HEAD and
each difference reported, with which saves or links no longer load; the
guides updated; step 8 filed.

## What step 6 learned that binds here

- A construct the planning compiler already had (Map's `space.cells` and a
  dealt relation) cost the technique compiler a few lines: look there, and
  at the engine, before declaring anything (`docs/descriptions.md`
  § "The runtime a ladder runs on").
- A hint with its own plan and words can keep them and take its firings
  from the compiled rungs' `firings`; Map's walks then matched HEAD's step
  for step (`describe-on-a-graph`'s `design.md` § "Map").
- A search tier goes to `searchAnswers` (`engine/answer-search.ts`); measure
  the positions dealt boards need before choosing its budget.
- The soundness checker's `CHECK_LOG` takes a path to log to.
- Compare with HEAD by a harness run on the tree before the game's code
  moves: desc and aux, grade, and every hint walk to the end under each
  reading.

## Figures to re-check

Measured on `describe-on-a-graph`'s last commit (2026-11-02): `solver.ts`
and `hint.ts` lines, ABCD 480 + 405, Sticks 733 (one file), Magnets
597 + 894, Light Up 679 (one file), Bricks 538 (one file). Re-measure
before designing against any of them.
