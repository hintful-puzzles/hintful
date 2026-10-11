# Tasks

## 1. Reproduce

- [ ] 1.1 Each of the five with the key sequence `found.md` records, in the
  running app.

## 2. The engine

- [ ] 2.1 A probe that presses Shift and Ctrl with each arrow from each
  corner in every game that takes a modifier arrow, the population derived
  from what each game consumes. See it fail on Sixteen.
- [ ] 2.2 One helper for the number pad as a direction pad; Ascent and Bricks
  use it. See a test of the diagonals fail on Ascent first.
- [ ] 2.3 Decide whether a game answering a move that changes nothing is
  convicted by a probe or left to the midend's drop, and record the reason.

## 3. The games

- [ ] 3.1 Sixteen: the direction is the key's. Add the scenario from the
  last column and row to "Ctrl or Shift with an arrow key slides the
  cursor's line".
- [ ] 3.2 Galaxies: the keyboard branch looks for a dot under the cursor
  before asking whether the cursor is on an edge.
- [ ] 3.3 Ascent: a diagonal that moves does not type.
- [ ] 3.4 Filling: a press ends the keyboard drag.
- [ ] 3.5 Bricks: by 2.3.
- [ ] 3.6 Run the app: each key sequence of 1.1 again.

## 4. Close

- [ ] 4.1 The spec deltas, `docs/games/input.md` for what the probes hold,
  validate, the gate, commit, push, archive.
