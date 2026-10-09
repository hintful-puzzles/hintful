# Tasks

- [x] 1 A test: a square marked clear, the cursor on it, Ctrl+Right; the
      square is still clear and the blank square beside it is shaded. Seen to
      fail first. A second: a stroke over two marked squares makes no move.
- [x] 2 `interpretMove` sets `onlyBlank` on the Ctrl and the Shift strokes
      and not on Ctrl+Shift; the no-op test is "no blank among the two".
- [x] 3 The `pattern` delta restates "Pattern's keyboard paints and cycles as
      the pointer does" to the new rule; `help/games/pattern.md` says it.
- [x] 4 Seen in the app with the keyboard: the stroke over a marked square,
      over a blank one, and Ctrl+Shift clearing both. The help page read
      there.
- [x] 5 Committed, pushed and archived.
