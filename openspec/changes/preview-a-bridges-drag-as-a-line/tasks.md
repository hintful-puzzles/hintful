# Tasks

Read `docs/games/rendering.md` (the tile cache, and "A snapshot cannot see a
hole") and `docs/games/input.md` first.

- [ ] 1 Decide what the preview shows for each drag the game has: a first
      bridge, a second over one already there, a drag that would remove, the
      secondary drag's limit and cross. Write it in `design.md` against what
      the release does in each case, so the preview never promises something
      the release does not do.
- [ ] 2 A render test for each: mid-drag the span's tiles carry the preview;
      after the release, and after a drag that returns to its island, they
      are as a board without the drag. Seen to fail first.
- [ ] 3 `redraw` draws it, and the tile cache repaints exactly the span's
      tiles as the destination changes. `BridgesUi.todraw` is read or gone.
- [ ] 4 Seen in the app mid-gesture with raw mouse moves, and with a touch
      drag on a phone-sized viewport, in both schemes: the preview follows
      the pointer and leaves no trail.
- [ ] 5 The `bridges` delta restates the rendering requirement; the help page
      follows if it describes dragging.
- [ ] 6 Committed, pushed and archived.
