## 0. Design pass

- [ ] 0.1 Measure each candidate in the proposal on positions reached by play
      from every preset, and record what each proves and how often.
- [ ] 0.2 Write `design.md`: the provable fact the hint leads with, the
      search's bound per board, and the narration.

## 1. Solver and Solve

- [ ] 1.1 A bounded, memoized search from the current position.
- [ ] 1.2 `solve`, refusing with `NO_SOLUTION_FROM_HERE` or
      `SEARCH_OUT_OF_REACH`'s Solve counterpart, `PUZZLE_NOT_REASONABLE`, as
      the search establishes.

## 2. Hint

- [ ] 2.1 `hint`, `hintMarks`, `hintGesture`, bound words from the first commit.
- [ ] 2.2 The help page's `## Hints` section.
- [ ] 2.3 Run the app; owner acceptance on how it plays.
