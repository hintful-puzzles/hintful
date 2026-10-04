## 1. Decide

- [x] 1.1 Owner, 2026-10-04: only a check that found something counts, and it
      counts alike from every button.

## 2. Implement

- [x] 2.1 One rule in the midend (`markHelped`, from `findMistakes` and
      `showDeadEnd`), persisted under the save's existing `hinted` key; tests in
      `check.test.ts` and the timer block of `midend.test.ts`, each seen red
      against a planted defect.
- [x] 2.2 Help: `help/features.md` § "Timing your solve" says what counts.
