# enlarge-guess-answer-row — tasks

- [x] 1 UX review with measured sizes and mockups at phone size, light and dark
      (owner-requested); owner chose: nothing for a ruled-out color, 1.5-tile
      row, dark well in both schemes, the collection's hint blue.
- [x] 2 `render.ts`: `ANSWER_ROWS`, `answerh` in the geometry, `cellGrid`
      choosing the largest cell, solid blocks inset in their cells, nothing for a
      ruled-out color, the hint frame beside the block, cursor and evidence in
      the margin, labels on the blocks, the reveal centered in the taller row.
- [x] 3 `palette-games.ts`: `guessAnswerWell`, board-relative in light and
      authored in dark.
- [x] 4 Tests: the render test counts blocks rather than circles and holds them
      smaller than a peg; the hint frame test holds the target mark thin.
- [x] 5 Ran the app in Chrome: 390×844 light and dark, a 900×520 window in
      dark, a hint about to rule colors out and after it was applied.
- [x] 6 Help (`help/games/guess.md`) and `docs/games/input.md` updated.
