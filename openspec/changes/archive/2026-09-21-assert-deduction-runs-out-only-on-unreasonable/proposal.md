# assert-deduction-runs-out-only-on-unreasonable

**Status: scaffolded 2026-09-21, not started.** Proposed by the owner after a
Bridges board shared without its difficulty loaded as Easy and its hint said
`DEDUCTION_EXHAUSTED` at move 10 (fixed by
`grade-a-board-shared-without-its-tier`).

## Why

`DEDUCTION_EXHAUSTED` tells the player that "this board's difficulty allows
positions that need trial and error". That is true only on a tier named
`Unreasonable`. On any other tier the board is promised to solve by deduction,
so the refusal there is always a bug, and the sentence is a false claim about
it.

The rule is already held in tests: `hint-resume.test.ts` fails a walk that
refuses outside a search-permitting tier (`permitsSearch`, derived from the
tier's name). But the walk only sees boards the generators dealt, which are
correctly tiered by construction. The owner's board reached the hint
mislabeled at runtime, where no test walk can meet it. Boards can still arrive
that way after grading: a hand-edited id that pins a wrong tier, or an old save.
Nothing at runtime notices.

## What changes

The owner's proposal: assert the rule at runtime as well as in tests.

- `Midend` (the one place every game's `hint` passes through,
  `midend.ts` near `this.game.hint(...)`) checks a refusal of
  `DEDUCTION_EXHAUSTED` against the board's tier. On a tier whose name is not
  `Unreasonable`, including an untiered game, it throws an error carrying the
  game id and the tier, so Sentry records the board that broke the promise and
  the player never reads the false sentence.
- Share the tier test with `hint-resume.test.ts`'s `permitsSearch` rather than
  writing it twice (an engine helper beside `difficultyTiers`).

## Open questions for the session that takes it

- **How a thrown hint surfaces in the app.** Check what the player sees when
  `hint()` throws through the worker, and make sure it is an honest error
  rather than a silent no-op. AGENTS.md says let it propagate to Sentry, and
  bridges' `hint.ts` already throws for "a step with no premise was shown".
- **Which games return the refusal where they have no tiers**, and whether
  every call site that has one is truly deduction-complete. Take the population
  by reference (`npm run refs`), not by grep.
- **Whether an unlocalized annotation mistake can end in exhaustion rather
  than contradiction** in some game (a wrong note, a wrong cross). If it can,
  the assert would fire on a player's mistake, and that game needs its own
  refusal first.

## Tests

- Pin the owner's board under a full id that pins it to Easy
  (`10x10i30e10m2d0:a2a4e31c2a4a1l1b1e5b4b4a1m1f43j2a4e43d4a2b`), which grading
  leaves alone. Walking its hint must throw where it used to refuse. Prove it
  red with the check removed.
- A walk on an `Unreasonable` board that does refuse must still refuse, not
  throw.
