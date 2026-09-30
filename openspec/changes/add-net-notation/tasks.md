## 1. Notation

- [x] 1.1 `sides` in `NetState`, `sideIndex`, the `note` move (design.md D2).
- [x] 1.2 Notes mode: the Marks key, Slant's tap and pick-then-neighbor
      gestures, Escape (D3).
- [x] 1.3 The margin and the pencil (D4); notes, the picked tile and the
      mistake overlay in the renderer (D5).
- [x] 1.4 `findMistakes` (D6).

## 2. Tests, help, spec

- [x] 2.1 `net-notes.test.ts`: the move and its side, notes-mode input, wrap,
      mistakes, the frame. Opener snapshot re-baselined for the margin.
- [x] 2.2 Help: the Notes section.
- [x] 2.3 `net` delta: side notes; mistakes (the no-mistakes requirement
      retired); the jumble RNG off the Ui; the `Game` type.
- [x] 2.4 Ran the app: notes mode, a wire note and a no-wire note by tap.
