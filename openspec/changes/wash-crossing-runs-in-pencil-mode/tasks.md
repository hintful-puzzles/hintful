# Tasks

Read `docs/games/rendering.md` first.

- [x] 1 A render test: a cell in two runs selected in pencil mode; both runs
      carry the wash and no clue in the list takes a fit color. Seen to fail
      first (zero washed tiles).
- [x] 2 `redraw` washes the runs for a pencil selection and leaves the list's
      fit coloring to digit entry. A held clue, a displayed hint and the two
      preferences behave as they do today.
- [x] 3 The wash read under pencil marks in both schemes: the candidates in a
      washed cell are still legible. Looked at in the app, light and dark
      (2026-10-09). They were not: the run color is the strong fill the list
      inks with, and the pencil ink all but vanished on it, as it already did
      beside a digit-entry selection. Fixed in `drawCell`:
  - [x] 3.1 Candidates on a washed square take `COL_RUNTEXT`, the ink a
        placed digit takes there.
  - [x] 3.2 The square selected for pencil marks keeps its own surface under
        the notes triangle, a gap in the wash as the entry selection is, so
        the candidates being edited stay in the pencil ink.
  - [x] 3.3 A filled square shows the pencil selection. It showed nothing:
        the triangle was drawn on empty squares only, where every other
        note-taking game draws it on both.
- [x] 4 The `crossing` delta restates "Selecting a cell shows which clues fit
      its runs"; `help/games/crossing.md` follows.
- [ ] 5 Committed, pushed and archived.
