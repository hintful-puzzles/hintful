## 1. Verify first

- [x] 1.1 The measurement, through the midend, is now a test: `mines.test.ts`,
      "opening a different first square after an undo strands nothing".
- [x] 1.2 The reading of the owner's answer costs a player nothing the proposal
      does not name; § "What it costs" names the two things it changes.

## 2. Build

- [x] 2.1 The layout belongs to the state the first click made; undoing it
      returns to the board the seed describes, and the game ID with it.
- [x] 2.2 A save restores, old and new, with the first click undone or not.
- [x] 2.3 The `restart` rung, its sentence and the "start here" cross go, and
      Mines' `unreached` with them.

## 3. Close

- [x] 3.1 The Mines spec's first-click requirement and its undo scenario, and
      `ts-engine`'s supersession requirement.
- [x] 3.2 The Mines help page, where it speaks of the first square.
- [x] 3.3 Run the app: first click, undo, a different first click, hint, Check
      & save, reload.
