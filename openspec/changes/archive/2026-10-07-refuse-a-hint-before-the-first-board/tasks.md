## 1. Verify first

- [x] 1.1 Reproduce it through the frontend's own path in a test, and list
      every command that can reach the midend before the first board.

      Measured 2026-10-07 by calling every `EngineCore` method on a midend
      with no board, in eight games (Tracks, Boats, Mines, Net, Solo, Guess,
      Fifteen, Untangle). Seven throw from inside the game: `hint`,
      `executeHint`, `solve`, `findMistakes`, `check`, `formatAsText` (four of
      the eight) and `saveGame` (three, the games with an `encodeUi`). The rest
      answer: `undo`, `redo`, `restartGame`, input and hover are guarded or
      find nothing to do.

      From the chrome those are Hint and its `H` key, Auto-solve, Show
      solution, Check without saving, Check & save and its `Ctrl+S` (the check,
      then the save), Save game, and Share (the board as text).

      The window is the first deal alone because a deal runs on a second
      worker (`DealAhead`): the puzzle's own worker is free to answer while
      the board is looked for, and before the first one it has none.

## 2. Build

- [x] 2.1 None of them does. Say where that is decided and why there.

      In `Puzzle` (`src/puzzle/puzzle.ts`), the one object every frontend
      caller goes through. The engine surface's board-reading methods are a
      type of their own, `BoardSurface`, and `Puzzle` reaches them only through
      `board()`, which waits for the first `game-id-change`. A direct call
      does not compile (planted: `Property 'hint' does not exist`), so a
      command added later cannot be sent early.

      Waiting, not refusing, because three of the seven return something a
      caller cannot do without (a verdict, a save's bytes), and a refusal
      would put a null in front of each of six callers. The midend keeps no
      new guard: nothing can reach it early.

      The chrome draws those commands' controls unavailable until then
      (`board-commands.ts`). That list is what a control shows and no more: a
      command left off it looks live a moment early and still waits.

## 3. Close

- [x] 3.1 Run the app on a throttled CPU with a slow-dealing preset: the
      controls while the first board is dealt, by pointer and by key.

      Chrome, CPU throttled 6x, dev server, 2026-10-07. Tracks 10x10 Hard at
      1300px: Hint drawn at 1.1 s and unavailable, a click on it did nothing,
      `H` pressed then; the board at 1.4 s, and the hint's sentence under the
      button 80 ms later. Boats 10x10 Hard at 390px: the same in the phone bar
      and the More sheet. No error dialog and no page error in either. New
      game stayed available throughout.
