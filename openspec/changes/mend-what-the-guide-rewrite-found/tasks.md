# Tasks

## 1. The mistake overlay's repaint

- [ ] 1.1 Read `engine-drawing`, "A per-cell overlay reaches the render cache
      through the shared sidecar", against the skeleton's tile key and
      against the games that fold a mistake flag into the key
      (`git grep -n 'F_WRONG\|OverlaySidecar' src`). Decide which the
      requirement means and write the delta so it says so.
- [ ] 1.2 Give the skeleton the paint-twice mistake test, and the sidecar if
      1.1 asks for it. Stamp a copy and see the test fail on a planted
      stale cache.
- [ ] 1.3 Hold `src/mistake-overlay-coverage.test.ts` to a warm frame. Count
      the games it fails before mending any, and report the count.

## 2. A size refused for its wait

- [ ] 2.1 Measure seconds a board at each size Net, Signpost and Sticks
      refuse with "takes too long to deal".
- [ ] 2.2 Bring the measurement to the owner with the question in the
      proposal. Nothing else in this section starts before the answer.

## 3. History in the engine's headers

- [ ] 3.1 Take the population by shape: a change id, or a count before
      "games" or "sites", in a comment under `src/engine/`.
- [ ] 3.2 Rewrite each to the constraint in the present tense, or delete it.

## 4. Close

- [ ] 4.1 Gate, commit, archive, push.
