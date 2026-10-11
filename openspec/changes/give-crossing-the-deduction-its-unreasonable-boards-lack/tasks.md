# Tasks

## 1. Measure

- [x] 1.1 Write the deduction into the solver behind a switch that is off, and
  repeat the proposal's count through the solver itself: of the boards the two
  deductions stop short on that have one answer, how many the three finish, at
  5x5, 9x9 and 13x13.
- [x] 1.2 Count how often an Unreasonable board is then drawn at each preset
  and how long a deal takes, and how often a board the three finish and the
  two do not is drawn.
- [x] 1.3 Choose between a middle tier and a wider Easy (proposal, "What to
  settle first"), and record the choice and its reason in a `design.md`.
  Easy widens (D1), and the pair is measured and not written (D3).

## 2. Build

- [x] 2.1 The solver's third deduction, with a test on a hand-built board
  where a number fits one run that two numbers fit.
- [x] 2.2 The hint's rung: sentence, marks, `hintRungs` entry, pins, and the
  help page's entry under "A few ideas are worth learning by name".
- [x] 2.3 The tiers as chosen in 1.3, the contract, the generator, the menu,
  and the Unreasonable size bound measured again.
- [x] 2.4 In the running app: deal a board the new rung is needed on, follow
  the hint through that step and read it; deal an Unreasonable board and see
  the hint stop where no number has a single run left.

## 3. Close

- [x] 3.1 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [x] 3.2 `docs/games/solver-and-generator.md`: what the measurement in § "Giving
  a deductive game an Unreasonable tier" says of Crossing, once it is no
  longer true.
- [ ] 3.3 Commit, push, archive.
