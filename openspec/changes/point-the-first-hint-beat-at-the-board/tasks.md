# Tasks

## 1. Measure

- [ ] 1.1 Write the census query: per game and preset, the steps whose first-beat mark covers the same squares in every position (fixed lines, sources, borders), and the sample size that would have found one
- [ ] 1.2 Run it over every hinting game and record the games it finds (Netslide is the first known)

## 2. Fix

- [ ] 2.1 State the rule in `docs/hints-marks.md` and the `engine-hints` spec: a first-beat mark depends on the position
- [ ] 2.2 Add the guard, deriving its population from each game's `hint()`, and see it fail on Netslide's striped fixed line before trusting it
- [ ] 2.3 For each game the census finds, drop the structural stripe from its marks (the sentence is `standardize-hint-vocabulary`'s, or the game's own change)
- [ ] 2.4 Run the app: the first click lands on the tile to move in Netslide, and on board state in each other game found
