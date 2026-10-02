## 0. Design pass

- [x] 0.1 Measure each candidate in the proposal on positions reached by play
      from every preset, and record what each proves and how often.
- [x] 0.2 Write `design.md`: the provable fact the hint leads with, the
      search's bound per board, and the narration.

## 1. Solver and Solve

- [x] 1.1 A bounded, memoized search from the current position (`solver.ts`:
      beam search to find, budgeted exhaustive search to prove loss).
- [x] 1.2 `solve`, refusing with `NO_SOLUTION` or `PUZZLE_NOT_REASONABLE` as
      the search establishes, and falling back to the dealt board so the
      out-of-reach refusal's advice holds (design D3).

## 2. Hint

- [x] 2.1 `hint`, `hintMarks`, `hintGesture`, bound words from the first commit.
- [x] 2.2 The help page's `## Hints` section.
- [x] 2.3 Run the app: hint rings, Auto-solve to solved through the drag
      gesture, and Show solution checked in Chromium. Owner acceptance on how
      it plays is the remaining step.

## 3. Engine

- [x] 3.1 Derive the walk's out-of-reach population from the refusal
      (`SEARCH_REACH_GAMES`) rather than from calling the slide planner, which
      had missed Guess; ledger entries for Guess and Pegs.
