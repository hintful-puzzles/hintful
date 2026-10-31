# Tasks

The session that takes this up revises these as it designs.

## 1. The compiler

- [ ] 1.1 Compile a grid's interior corners (a corner as an element, its cells, a cell's corners) and clues at a corner, and read them in the soundness checker

## 2. Describe and compare

- [ ] 2.1 State Mathrax's rules, and check them with the answer check
- [ ] 2.2 State Mathrax's technique in the order `mathrax/solver.ts` scans; decide how its three gates are stated
- [ ] 2.3 Check it sound, with a planted defect
- [ ] 2.4 Run the compiled ladder beside the hand-written one on every deal and hint walk; see the comparison fail on a plant
- [ ] 2.5 Remove `applyOptions` and its callers; every Mathrax test and hint guard passes

## 3. Close

- [ ] 3.1 Measure the speed per deal, run the app, write the report, update the guides, archive, file the next Latin game
