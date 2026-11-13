# Tasks

## 1. Measure

- [x] 1.1 Write the census query: per game and preset, the steps whose first-beat mark covers the same squares in every position (fixed lines, sources, borders), and the sample size that would have found one
- [x] 1.2 Run it over every hinting game and record the games it finds (Netslide is the first known)

## 2. Fix

- [x] 2.1 State the rule in `docs/hints-marks.md` and the `engine-hints` spec: a first-beat mark depends on the position
- [x] 2.2 Add the guard, deriving its population from each game's `hint()`, and see it fail on Netslide's striped fixed line before trusting it — declined, with the reason in the proposal § "No guard: why"; the census found the old Netslide stripe instead
- [x] 2.3 For each game the census finds, drop the structural stripe from its marks: Seismic's `singleton`
- [x] 2.4 Run the app: the first click lands on the tile to move in Netslide, and on board state in each other game found (Seismic's single-cell area: the ring on the cell, then "This cell is an area by itself, so it can only be 1.")
- [ ] 2.5 The owner sees the result before the change is archived
