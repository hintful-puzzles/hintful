# add-abcd-hint — tasks

Read [`docs/games/hints.md`](../../../docs/games/hints.md) and
[`docs/games/solver-and-generator.md`](../../../docs/games/solver-and-generator.md)
first, and keep them current as you go.

## 1. Certify the ladder before narrating it

- [x] 1.1 Build `abcd-ladder.test.ts`: a firing census over the three
      techniques. ABCD is untiered, so one cap; the solver moved onto
      `runDeductionFixpoint` with upstream's loop kept as the oracle.
- [x] 1.2 Carry its vacuity guard (the harness's compared-count).
- [x] 1.3 Prove it fails: silencing the runs rung turned the census red and left
      every board comparison green (design D-notes, and the test's header).
- [x] 1.4 Kept in this change: the census needed no design of its own.

## 2. The ordering question

- [x] 2.1 What the sweep produces per pass: every line's firing at once. What a
      person does: one line. The gap is a finder yielding one line at a time.
- [x] 2.2 Where the rule lives: nowhere new. The `HintFrontier` already orders
      a rung's firings; `pearl` and `tents` need nothing from here on this axis.
- [x] 2.3 Recompute-stable: `hint-resume.test.ts` walks ABCD.

## 3. The candidate cube

- [x] 3.1 The cube was per-cell layout; ABCD now stores a bitmask per cell and
      uses `adaptiveMarkAll` and the whole candidate walk unchanged.
- [x] 3.2 Recorded in `design.md`: no `NoteEncoding` locator.

## 4. Narration

- [x] 4.1 Satisfied clue, the walk's singles and cull, and runs, the counting
      argument checked against brute-force enumeration.
- [x] 4.2 One firing = one journey (runs places as one); one color.
- [x] 4.3 Every premise is a mark the player can make; `findMistakes` vouches
      for the notes the rungs read.

## 5. Tests and cost

- [x] 5.1 Enrollment derived; the one census count (`hint-mark.test.ts`) bumped.
- [x] 5.2 Tier-2.5 render scenario and snapshot for a runs frame.
- [x] 5.3 Cost: the ABCD directory's tests run in about half a second.

## 6. Close out

- [x] 6.1 Cost reported in `design.md`.
- [x] 6.2 Spec deltas: `abcd`, and `ts-engine` for the note-leg rule.
- [x] 6.3 Guides: `hints.md` § "A solver that sweeps (ABCD)", and two notes in
      `solver-and-generator.md`.
- [x] 6.4 Ran the app: the runs frame renders as designed (Chromium).
