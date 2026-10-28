# Tasks

## 1. Measure

- [x] 1.1 Reproduce both rings in the app (the proposal's board and step), and find every game and cell kind where a placement's ring crosses a number or lands off its cell: corner clues and notes, at phone, tablet and desktop widths, both schemes
- [x] 1.2 First approach (owner): a centered ring in the padding between the cell's content and its edge, enclosing clue and notes. Measure each game's padding and what that ring needs, per size, and where it fits
- [x] 1.3 Only for the cells where 1.2 does not fit: show the owner a comparison of ways to make room (padding grown, notes laid out to leave the ring room) and take their choice

## 2. Build

- [x] 2.1 The ring search: no number crossed, the padding ring tried first, and a ring about the whole cell preferred over a rounder one about part of it (D1, D3)
- [x] 2.2 Whatever 1.3 chose for the cells that need room, in the engine, not per game (D2: `ringTextBox`, `noteGrid`)
- [x] 2.3 Replace the scenario "A placement crosses only the notes it replaces" in `engine-hints`, and a guard that fails on the proposal's two boards (`keen-hint.test.ts`, and `ringCrossings` in `expectRing` and the cross-game sweep)
- [x] 2.4 The owner's review (2026-10-28): a clue does not shrink a cell's notes, which sit on their neighbors' rows (D4), and Mathrax's ring passes under its clues (D5)
- [x] 2.5 Mosaic's 50×50 hint does not throw at phone widths (D6)

## 3. Finish

- [x] 3.1 Render snapshots verified by the shape of their diff; the app run on the proposal's board at both sizes, and on a Killer Solo and a Mathrax clue cell
- [x] 3.2 Guides (`hints-marks.md`), the gate, green
