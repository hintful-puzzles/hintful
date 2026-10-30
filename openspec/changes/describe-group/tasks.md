# Tasks

The session that takes this up revises these as it designs. It starts once
`describe-games-in-yaml-with-their-help` is archived.

## 1. Describe

- [ ] 1.1 State Group's rules and its two techniques, in the scan order `group/solver.ts` uses
- [ ] 1.2 Check both sound, with a planted defect each; record the verdicts

## 2. Compile and compare

- [ ] 2.1 Group runs its compiled ladder, with its reasons built from the bindings
- [ ] 2.2 Compare it with the hand-written deductions on every deal and hint walk (returns, grids, cubes, records); see the comparison fail on a plant
- [ ] 2.3 Remove `solverNormal` and `solverHard`; every Group test, the differential and the hint guards pass

## 3. Speed

- [ ] 3.1 The compiler hoists loop-invariant reads; measure Group and Unequal per deal against `compile-the-latin-ladder`'s report

## 4. Close

- [ ] 4.1 Run the app, write the report, update the guides, archive, file the next Latin game
