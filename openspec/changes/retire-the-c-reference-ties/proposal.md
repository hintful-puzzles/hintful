## Why

`architectural-review-blue-sky` stage 1. The owner, 2026-11-21: "I'd
probably at this stage get rid of anything that we have that is tying us
specifically to the C version and doesn't have any other benefit to us."
The census, with each tie's other benefit, is the review's design.md § "Ties
to the C version". In short: 56 differential test files (4,349 lines) on 49
frozen C fixtures (1.1 MB) that can never be re-recorded, so they block every
intended generator change; the rule that a generator keeps C's sequence of
random draws; solver verdicts graded against C's tiers; and a C-recorded
corpus for the RNG.

## What Changes

- **Retired**: the byte-match and solver-agreement differentials and their
  C fixtures; `engine/testing/differential.ts`; the RNG-draw-order rule in
  `docs/testing.md` § "Byte-match: fidelity where there is a right answer"
  and the "byte-match critical" headers in the generators; the requirement
  that `engine/random` reproduce `random.c`, and its corpus test. The RNG's
  code stays.
- **Kept**: upstream's game IDs and params strings keep loading, because a
  player's link from Simon Tatham's site opens here
  (`guards/upstream-descs.test.ts`, `puzzle/upstream-params.test.ts`). The
  guard is re-founded on a slim corpus of params and descs drawn from the
  retired fixtures, with no seeds, aux or C verdicts. Credit, licenses and
  provenance comments stay.
- Where a retired test was the only net under something else, the change
  names what replaces it (`docs/test-strength.md`): the description's
  soundness check, the deal's tier gate, the hint sweeps.
- Seeds may deal other boards afterwards, which breaks nothing: the app
  hands out boards, never seeds (`docs/doctrine.md` § "Upstream").

## Capabilities

### Modified Capabilities

Each spec that requires a byte-match or a C-graded verdict, found by search
at the start of the work.

## Impact

`src/games/*/*-differential.test.ts`, `src/games/*/__fixtures__/`,
`src/engine/testing/differential.ts`, `src/engine/random/`,
`src/guards/upstream-descs.test.ts`, `src/games/*/generator.ts` headers,
`docs/testing.md`, `docs/solver-and-generator.md`, `docs/doctrine.md`.
