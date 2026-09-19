# note-crossing-deep-eliminations — tasks

- [x] 1.1 Find a seed reaching a deep firing (the audit's hits: 9x9, 13x13 and
      15x15 symmetric) and pin it in `crossing-hint.test.ts`.
      A scan of 96 boards found seven deep firings, one of them a fresh 5x5 board
      at its opening move. That board is pinned by desc (`NEEDS_NOTES`), beside a
      13x13 symmetric board whose plan writes two squares of one run
      (`NOTE_JOURNEY`).
- [x] 1.2 Record which note narrowings a deep firing rests on; place them as steps
      beside it.
      Two parts. "Still fits" now reads the notes as well as the entered digits,
      which is sound because `findMistakes` flags a note excluding the answer.
      Where only the solver's fixpoint places something, `fixpoint` records which
      narrowing removed each (square, digit), `support` traces the placement back
      through them, and the plan emits the oldest as a note step and recomputes.
      A square with notes is struck (`noteStrike`); a square without is written
      (`noteDigits`, a new `pencilAdd` move that only ever adds). Notes one run
      decides in several of its squares are one journey.
- [x] 1.3 Assert that no step's sentence is a deep arm, then delete the deep arms if
      nothing reaches them.
      The `deep` flag and both of its sentence arms are deleted. The guard asks the
      question itself instead of looking for the words: "every premise is on the
      board" re-derives each step's premise from the state's own rules (entered
      digits and notes) on every preset and both pinned boards. It fails (5 cases)
      with the old behavior of asserting the fixpoint's placement restored.
- [x] 1.4 Run the app on the pinned board.
      Walked the 5x5 board in Chrome: the ring and the across run outline land on
      the right squares, the clue list boxes the six fitting numbers, the notes
      1 3 5 7 8 arrive as one move, and the third step's crossing argument is
      readable off the notes the first two wrote.

## Measured cost

The audit counted steps (4 on 3 of 40 boards). The notes are the real cost: over
20 boards per preset, 13 of 160 needed any, and the longest run of note steps
was 10 on 13x13 symmetric, many of them writing six to eight digits. Tracing
through the square with the fewest digits left instead of the earliest was tried
and wrote about as many notes, so it was not kept.
