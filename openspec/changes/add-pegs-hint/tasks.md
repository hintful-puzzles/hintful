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

## 4. Redesign (design D6, owner-approved 2026-10-02)

- [ ] 4.1 Measure how often the beam's plans decompose into packages (rows of
      three with a catalyst, the L, the 6-block); decide on package narration.
- [ ] 4.2 Time the rival classification's stages apart, and set a per-request
      budget that keeps a hint under ~0.5 s on 9×9 Cross.
- [ ] 4.3 A `JUMP` mark kind and its arrow, bound to words; the good-jump
      overlay drawn only where a rival is BAD.
- [ ] 4.4 The trap step: a rival that cuts a peg off at once or within two
      jumps, with a depiction a player can follow.
- [ ] 4.5 Rewrite every sentence, the opening's included; drop the peg count
      and "Keep going". Read one whole plan out loud.
- [ ] 4.6 Rewrite the help page's Hints section for the new marks.
- [ ] 4.7 Run the app; owner acceptance.

## 3. Engine

- [x] 3.1 Derive the walk's out-of-reach population from the refusal
      (`SEARCH_REACH_GAMES`) rather than from calling the slide planner, which
      had missed Guess; ledger entries for Guess and Pegs.
