# bound-loopy-note-journeys — tasks

## 1. Decide whether a long journey is a defect

- [x] 1.1 Walk the 10×10 Hard replay (seed `frontier-squares-10x10-hard-replay-a`)
      in the running app with the owner. The owner stopped at a 15-leg journey
      around move 29: it jumped around the board, and read as at least two smaller
      deductions run together. So it was a defect, but its cause was composition,
      not length.
- [x] 1.2 Measure the cause. 23 of 154 notes sat in a journey whose line does not
      cite them, and every jump of four or more edges inside a journey came from one
      of those. The previous 55-leg journey is intrinsic: the recorder's relation
      path is already a breadth-first shortest chain.

## 2. Split journeys into deductions

- [x] 2.1 `deductions` in `src/games/loopy/hint.ts`: the facts placed at one
      position split by what they cite (and by a shared note), each ordered
      depth-first. `planSteps` emits each as its own journey; the line joins
      the one it rests on or stands alone after several.
- [x] 2.2 Guard in `loopy-hint.test.ts`, "a journey is one deduction". Shown to fail
      on each of two planted defects: all of a position's groups merged into one
      (fails as "makes 2 separate deductions"), the line joining a group it does not
      rest on under discovery placement (fails as "places a note its line does not
      rest on"). The first cut of the guard joined notes through the line and
      matched a corner move to every fact on its dline; both let the merged-group
      plant through, and were tightened.

## 3. Widen the note placement

- [x] 3.1 An expiring note placed at the **latest** position its sentence still
      describes (`sentenceHolds`), walking forward from `tickOf`.
- [x] 3.2 Guard in `loopy-hint.test.ts`, "a pair note that can go stale is true of the
      board it is shown on". It reads the premise off the board directly rather
      than through `sentenceHolds`, and fails when expiring pairs are planted one
      firing late. On the corpus, and on four 10×10 Hard boards, no expiring
      note's sentence goes stale before its consumer, so the placement's stop is
      not reached. The guard holds that moving notes later never outran it.
- [x] 3.3 Widen the `ts-engine` requirement "A note a hint asks for is placed beside
      the step that uses it" to match.
- [x] 3.4 `docs/games/hints.md` § "Give the facts a notation (Loopy)" updated.

## 4. Acceptance

- [ ] 4.1 The owner walks the replay again in the running app: journeys stay on one
      piece of the board, and a line combining two derivations reads well standing
      alone after them.
