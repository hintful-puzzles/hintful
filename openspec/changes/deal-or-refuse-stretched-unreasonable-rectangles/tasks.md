# Tasks

## 1. Measure

- [ ] 1.1 Re-run the sweep in the proposal (Unreasonable, 2 to 6 on the
  shorter side, up to 14 on the longer, factors 0.5 and 2) with a low cap on
  draws and a line logged per shape, and add factors of 0.25, 1 and 4. A
  shape that never deals costs its whole allowance, so cap the draws and read
  a rate.
- [ ] 1.2 At 5x5 with 0.5 and 6x9 with 2, count the generator's draws that
  have one answer the solver and the hint stop short of, numbers placed
  anywhere. Absent, or rare?
- [ ] 1.3 Tabulate deals against the base grid's size, its count of
  rectangles and the rows and columns added, and choose: a refusal by a rule
  the table bears out, or a deal. Record it in a `design.md`.

## 2. Build

- [ ] 2.1 The base grid's size as one function that `division` and
  `validateParams` both call.
- [ ] 2.2 The refusal, with the sentence for absent or for too rare, or the
  deal.
- [ ] 2.3 Tests: a shape each side of the rule at two factors; a refused
  shape still opens pasted.
- [ ] 2.4 In the running app: the Custom dialog on a 5x5 board at 0.5 and
  Unreasonable.

## 3. Close

- [ ] 3.1 The spec delta, and remove `skip_specs` from `.openspec.yaml`.
- [ ] 3.2 `help/games/rect.md`, if it names the expansion factor's limits.
- [ ] 3.3 Commit, push, archive.
