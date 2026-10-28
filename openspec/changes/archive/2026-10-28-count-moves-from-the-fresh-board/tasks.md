# Tasks

## 1. Design

- [x] 1.1 Read the move log, the kept boards and the save envelope as they stand; write the design: one mechanism for Start over and New game, the counter's rule, the undo bound and its unit, what a save carries
- [x] 1.2 Check the timeline's and history panel's words against the new rule

## 2. Build

- [x] 2.1 The counter reads moves since the last fresh board; Start over adds none
- [x] 2.2 Start over keeps the board it put away as New game does, and Undo reaches back across both, up to the bound
- [x] 2.3 Today's saves (with `restarts`) open and resume with the same board and undo; tests over each

## 3. Finish

- [x] 3.1 The app run: moves, Start over, Undo, Redo, New game, Undo across several of each, with the counter read at each; mouse, keyboard and touch
- [x] 3.2 `help/features.md` § "Taking back Start over or a New game", `app-shell`, the gate, green
- [x] 3.3 The owner's word on the result, which they asked for, before archiving (accepted 2026-10-28, with the timer to reset on Start over)
- [x] 3.4 Start over resets the timer and the help record; Undo across it brings them back, in saves too
