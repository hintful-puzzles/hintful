# Tasks

## 1. Describe

- [x] 1.1 State Group's rules (a Latin square whose product is associative) and its techniques, `associativity` and `identity` at Normal and `notIdentity` at Hard, in the scan order `group/solver.ts` used; the compiler and the checker read `cell(x, y)`
- [x] 1.2 Check all three sound at orders 3 and 4, with a planted defect each; see them unsound with the associativity rule taken away

## 2. Compile and compare

- [x] 2.1 Group runs its compiled ladder, with its reasons built from the bindings (`uncluedRung`)
- [x] 2.2 Compare it with the hand-written deductions on every deal and hint walk, the hidden-identity tiers included (returns, grids, cubes, records); see the comparison fail on a plant
- [ ] 2.3 Remove `solverNormal` and `solverHard`; every Group test, the differential and the hint guards pass

## 3. Speed

- [ ] 3.1 The compiler hoists loop-invariant reads; check it changes no deal or hint on any Latin game against HEAD's modules; measure Group and Unequal per deal against `compile-the-latin-ladder`'s report

## 4. Close

- [ ] 4.1 Run the app, write the report, update the guides, archive, file the next Latin game
