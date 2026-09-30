# add-net-hint

## Why

Net is hintless, so it is a draft. It was the game `sweep-target-verb-input`
pulled in to check the target-verb model: a hint's steps are moves, and Net's
are the model's verbs (rotate, lock) plus the notes `add-net-notation` adds.

## What changes

- **A narratable engine** (`src/games/net/deduce.ts`) over the facts a player
  records — side notes, locks — and the walls. A step adds one fact: a side
  every surviving way of a tile agrees on (a note), or a tile only one way of
  turning survives for (turn it, then lock it). A way of turning falls to a
  side it contradicts, a loop it would close, or a group of tiles it would
  seal off. Measured sound against the generator's solution on every step of
  200 boards across the ten presets (2026-09-30).
- **The hint**: one step per fact, a lock step a journey of its rotation and
  its lock, spelled through the declared verbs. `hintMarks`; the help page's
  Hints section.
- **Guess-free generation**: the measured engine finishes every non-wrapping
  board and 15–19 of 20 wrapping ones per preset. A board it cannot finish is
  regenerated, so every board Net deals can be hinted to the end. That changes
  the boards of the few wrapping seeds it rejects.
