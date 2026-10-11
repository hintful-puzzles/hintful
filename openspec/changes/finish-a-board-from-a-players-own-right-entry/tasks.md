# Tasks

## 1. Reproduce

- [x] 1.1 In the running app: the board and the mark in the proposal, then
  Hint until it stops. Seen in Chrome on the old rule: fifteen hints are
  played, and the sixteenth opens "Something went wrong" with "range: the
  hint ran out of deduction at move 16, but the board's tier, Easy, does not
  allow trial and error" under Technical details.
- [x] 1.2 Find why the plan runs out. The 7 in the bottom right corner. From
  the opening its arm up the column is a gap of five that ends at the 5, and
  filling it passes 7, so upstream's rule caps the arm and the 7 must see
  along the bottom row (row 8, column 4 white). With row 5 of that column
  white the first gap is one cell that fits, and upstream's rule, which reads
  the first gap alone, stops capping the arm: it concluded less from a board
  that said more. Not a premise the plan could no longer use, as the proposal
  guessed.

## 2. The engine

- [x] 2.1 The guard's second question, in
  `src/engine/wrong-entry-check.test.ts`: from a position with no mistake,
  the hint finishes. Seen to fail on Range with the old rule, nine ways.
- [x] 2.2 Measure a second gesture. A second and a third blind gesture cost
  about a third of a second each over the file and found no game the first
  did not. What did better is not a deeper gesture but a different position:
  each step of the opening plan played alone, and sixty pairs. With the old
  rule the gestures found Range once in 180, the steps alone three times in
  42, the pairs five times in 60, and large subsets of the plan none in 39.
  Replaying a step on the answer to call it right left Signpost with no
  position at all and six games thin, so a step counts where `findMistakes`
  is empty. No other game stalled.

## 3. The game

- [x] 3.1 Range: the run-length rule bounds an arm by the furthest place it
  can end, which is never above upstream's bound and only falls as cells are
  decided. The old rule also failed one right mark on dealt boards at other
  sizes (`range-solver.test.ts`, "a board that says more"), so it was not
  one board. Some seeds deal a different Easy board, which breaks nothing.
- [x] 3.2 Run the app: the same board and mark, hints to the end, solved at
  move 42 with no dialog; the step that leans on the bound reads true and
  draws as before.

## 4. Close

- [x] 4.1 The spec delta, `docs/games/hints.md`, validate, the gate, commit,
  push, archive.
