## 1. Verify first

- [ ] 1.1 Read the commit that made Restart drop the history, and upstream's
      restart entry, before deciding the shape.
- [ ] 1.2 Read how a board is remembered across a deal today (the autosave,
      the last game id), and say whether the kept board rides on it.

## 2. Build

- [ ] 2.1 Restart is a history step: undo, redo, the timeline, checkpoints,
      the "solved with help" record, and Mines' restart.
- [ ] 2.2 The save envelope carries a restart; every older save still opens.
- [ ] 2.3 The board replaced is kept one deep, and Undo on an unplayed board
      returns it; Redo goes forward again; the first move drops it.

## 3. Close

- [ ] 3.1 The spec: restart's requirement in `ts-engine`, and the app-shell's
      for the kept board.
- [ ] 3.2 The help page, where it speaks of Restart, New game and Undo.
- [ ] 3.3 Run the app: both journeys in the proposal, at desktop and phone
      width, by pointer, key and touch, and an old save opened.
