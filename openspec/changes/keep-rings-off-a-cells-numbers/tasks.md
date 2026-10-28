# Tasks

## 1. Measure

- [ ] 1.1 Reproduce both rings in the app (the proposal's board and step), and find every game and cell kind where a placement's ring crosses a number or lands off its cell: corner clues and notes, at phone, tablet and desktop widths, both schemes
- [ ] 1.2 Show the owner a comparison of the candidate fixes on those cells (a centered ring that encloses the clue, a ring in the gap between the clue and the notes, notes laid out to leave the ring room) and take their choice

## 2. Build

- [ ] 2.1 The ring search: no number crossed, and a ring about the whole cell preferred over a rounder one about part of it
- [ ] 2.2 Whatever 1.2 chose for the content, in the engine, not per game
- [ ] 2.3 Replace the scenario "A placement crosses only the notes it replaces" in `engine-hints`, and a guard that fails on the proposal's two boards

## 3. Finish

- [ ] 3.1 Render snapshots verified by the shape of their diff; the app run on the proposal's board at both sizes, and on a Killer Solo and a Mathrax clue cell
- [ ] 3.2 Guides (`hints-marks.md`), the gate, green
