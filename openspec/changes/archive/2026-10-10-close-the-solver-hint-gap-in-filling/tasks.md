# Tasks

## 1. See it

- [x] 1.1 In the running app: open
  `7x9:a24h8e45552a5255a4d8a2a4d1b544d53a444553b`, follow Hint until it
  stops, and record what the player sees. Seen in Chrome: fifteen steps
  apply, and the sixteenth press opens "Something went wrong", with "the hint
  ran out of deduction at move 15" in its details.
- [x] 1.2 Pin both boards of the proposal as failing tests of "the hint
  finishes a board the solver finishes" (`filling-hint.test.ts`, "a board the
  rules stall on once more of it is filled").

## 2. Find the lost deduction

- [x] 2.1 Log every fill the solver makes from the clues. At the board where
  the hint stalls, find the first of those fills the restarted solver no
  longer makes, and say which technique it was and what it relied on
  (`docs/games/solver-and-generator.md`, "Find the gap by tracing"). Design
  D1.
- [x] 2.2 Decide the fix and record it in a `design.md`: the technique made
  monotone, or the hint carrying the solver's state between steps. Design D2:
  the hint keeps the solver's run from the clues.

## 3. The fix

- [x] 3.1 Implement it, with the spec delta. Remove `skip_specs` from
  `.openspec.yaml`.
- [x] 3.2 A census of dealt boards at every preset, sized for the rate: one in
  480 was the rate found, so a clean zero needs several thousand boards a
  preset, and say how many were dealt. Design D4.
- [x] 3.3 `finishesByDeduction` becomes `hintAndSolveFinish`, and the comment
  on the hook goes. The generator goes on asking the solver, whose answer is
  now the hint's by construction (design D3). No dealt board is refused.

## 4. Close

- [x] 4.1 In the running app: the board of 1.1 hints to the end. Seen in
  Chrome: the walk ends on "Nice work!", and at move 15, where it crashed, the
  step rings the boxed-in square, outlines its three neighbors and says it
  must be 4.
- [x] 4.2 `docs/games/solver-and-generator.md`, where it tells Net's and
  Rectangles' gap, and `docs/games/hints.md` on Filling's plan.
- [x] 4.3 Commit, push, archive.
