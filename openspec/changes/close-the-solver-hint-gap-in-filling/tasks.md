# Tasks

## 1. See it

- [ ] 1.1 In the running app: open
  `7x9:a24h8e45552a5255a4d8a2a4d1b544d53a444553b`, follow Hint until it
  stops, and record what the player sees.
- [ ] 1.2 Pin both boards of the proposal as failing tests of "the hint
  finishes a board the solver finishes".

## 2. Find the lost deduction

- [ ] 2.1 Log every fill the solver makes from the clues. At the board where
  the hint stalls, find the first of those fills the restarted solver no
  longer makes, and say which technique it was and what it relied on
  (`docs/games/solver-and-generator.md`, "Find the gap by tracing").
- [ ] 2.2 Decide the fix and record it in a `design.md`: the technique made
  monotone, or the hint carrying the solver's state between steps.

## 3. The fix

- [ ] 3.1 Implement it, with the spec delta. Remove `skip_specs` from
  `.openspec.yaml`.
- [ ] 3.2 A census of dealt boards at every preset, sized for the rate: one in
  480 was the rate found, so a clean zero needs several thousand boards a
  preset, and say how many were dealt.
- [ ] 3.3 `finishesByDeduction` becomes `hintAndSolveFinish`, the generator
  asks the same, and the comment on the hook goes. If any dealt board is
  still refused, stop and ask the owner with the rate.

## 4. Close

- [ ] 4.1 In the running app: the board of 1.1 hints to the end.
- [ ] 4.2 `docs/games/solver-and-generator.md`, where it tells Net's and
  Rectangles' gap.
- [ ] 4.3 Commit, push, archive.
