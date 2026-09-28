## 1. Population

- [x] 1.1 Re-read the population by shape, not by the `kind: "note"` key: every
      `findMistakes` that reads the player's pencil array. Same rule in Towers,
      Keen, Unequal, Solo, Mathrax, Seismic, Crossing, Rome, Undead and Salad,
      plus Abcd and Map, whose mistakes carried no `kind` and so were invisible
      to the proposal's scan. Group checked entries only.
- [x] 1.2 Classify the other `"note"` spellers: Loopy and Slant use it as the
      reason a solver merge fired, not as a mistake. Out of scope.
- [x] 1.3 Read `envision-the-game-contract` for conflict: the helper consumes
      the `NoteEncoding` games already declare and adds no check-only list.

## 2. Helper and adoption

- [x] 2.1 `src/engine/entry-mistakes.ts`: `entryMistake` (one cell's verdict),
      `entryMistakes` (the loop, placing each mistake through the game's `at`),
      `gridCell`; `noteBitOf` exported from `candidate-hint.ts` so the
      encoding default has one statement.
- [x] 2.2 Adopt the loop in Group, Towers, Keen, Unequal, Solo, Mathrax,
      Seismic, Crossing, Undead, Abcd, Map and Rome (Rome's `wrong` kind is
      now `cell`); Salad keeps its own loop for crosses and circles and asks
      `entryMistake` for the rest.
- [x] 2.3 Group's mistake type gains the `kind`; its renderer already draws
      every mistake as the Latin siblings' inset outline, which is the look
      they give a note mistake, so it needs no change.

## 3. Tests and docs

- [x] 3.1 Group: marks without the answer are flagged and the hint refuses;
      extra candidates are not flagged. Seen red against the old
      `findMistakes` first.
- [x] 3.2 `entry-mistakes.test.ts` covers each branch, `enc` and `empty`; seen
      red with the "marks are non-empty" condition planted out.
- [x] 3.3 `help/games/group.md` § "Hints" widened to marks; the engine catalog
      and `solver-and-generator.md` § "Marks are checked like entries" point
      at the helper.
- [x] 3.4 Run the app: a Group board with a wrong mark set shows the outline
      on Check & Save and the hint refuses.
