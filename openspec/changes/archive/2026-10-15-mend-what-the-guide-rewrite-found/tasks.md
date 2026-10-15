# Tasks

## 1. The mistake overlay's repaint

- [x] 1.1 Read `engine-drawing`, "A per-cell overlay reaches the render cache
      through the shared sidecar", against the skeleton's tile key and
      against the games that fold a mistake flag into the key
      (`git grep -n 'F_WRONG\|OverlaySidecar' src`). Decide which the
      requirement means and write the delta so it says so.
- [x] 1.2 Give the skeleton the paint-twice mistake test, and the sidecar if
      1.1 asks for it. Stamp a copy and see the test fail on a planted
      stale cache. *Settled otherwise: a stamped copy is held by
      `warm-repaint.test.ts`, which failed on the planted key (proposal,
      "What Changes"); the skeleton needs no test of its own.*
- [x] 1.3 Hold `src/mistake-overlay-coverage.test.ts` to a warm frame. Count
      the games it fails before mending any, and report the count. *Held in
      `warm-repaint.test.ts` instead; 12 failed, each mended by a `WRONG`
      pin.*

## 2. A size refused for its wait

- [x] 2.1 Measure seconds a board at each size Net, Signpost and Sticks
      refuse with "takes too long to deal". *`deal-walk` now deals a named
      size its game refuses.*
- [x] 2.2 Bring the measurement to the owner with the question in the
      proposal. *Filed with the measurement and the question as
      `refuse-a-size-only-for-what-a-wait-does-not-fix`, which waits on the
      answer, so this change archives without it.*

## 3. History in the engine's headers

- [x] 3.1 Take the population by shape: a change id, or a count before
      "games" or "sites", in a comment under `src/engine/`.
- [x] 3.2 Rewrite each to the constraint in the present tense, or delete it.

## 4. Close

- [ ] 4.1 Gate, commit, archive, push.
