# Tasks

## 1. Design

- [ ] 1.1 Read the move log, the kept boards and the save envelope as they stand; write the design: one mechanism for Start over and New game, the counter's rule, the undo bound and its unit, what a save carries
- [ ] 1.2 Check the timeline's and history panel's words against the new rule

## 2. Build

- [ ] 2.1 The counter reads moves since the last fresh board; Start over adds none
- [ ] 2.2 Start over keeps the board it put away as New game does, and Undo reaches back across both, up to the bound
- [ ] 2.3 Today's saves (with `restarts`) open and resume with the same board and undo; tests over each

## 3. Finish

- [ ] 3.1 The app run: moves, Start over, Undo, Redo, New game, Undo across several of each, with the counter read at each; mouse, keyboard and touch
- [ ] 3.2 `help/features.md` § "Taking back Start over or a New game", `app-shell`, the gate, green
