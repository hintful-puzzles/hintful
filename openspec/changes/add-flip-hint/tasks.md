## 1. Decide

- [x] 1.1 What a step claims, and whether it teaches a technique or reports the
      solver's set. Both, by kind: design D1.
- [x] 1.2 Check the two stability claims in `proposal.md` against the solver.
      Both hold; the tie-break written to make the second hold was not
      needed: design D2.

## 2. Build

- [x] 2.1 `hint()`, `hintGesture`, `hintMarks`, and the marks in `render.ts`.
      The solver moved to `solver.ts`, shared by Solve and the hint.
- [x] 2.2 The help page's `## Hints` section.
- [x] 2.3 Hint tests, and the render scenario for a step. Pins through
      `describeHintPins`, with no scan in the file.

## 3. Acceptance

- [ ] 3.1 The owner plays it.
