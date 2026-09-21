# select-guess-answer-slots — tasks

- [x] 1 `interpretMove`: a release on an answer slot selects it and turns notes
      mode on; a release on a working-row peg selects it and turns it off; the
      right button does nothing on the answer row.
- [x] 2 `render.ts`: `answerCellAt` becomes `answerSlotAt`, the whole column
      with its gap and margin.
- [x] 3 Tests: slot selection from both ends of the slot, a key then marking,
      the working row leaving notes mode, the after-three-rows regression, and a
      right press marking nothing.
- [x] 4 Ran the app in Chrome.
- [x] 5 Help and `docs/games/input.md`.
