# Tasks

Read `docs/games/rendering.md` (the tile cache, and "A snapshot cannot see a
hole") and `docs/games/input.md` first.

- [x] 1 Decide what the preview shows for each drag the game has: a first
      bridge, a second over one already there, a drag that would remove, the
      secondary drag's limit and cross. Write it in `design.md` against what
      the release does in each case, so the preview never promises something
      the release does not do.
- [x] 2 A render test for each: mid-drag the span's tiles carry the preview;
      after the release, and after a drag that returns to its island, they
      are as a board without the drag. Seen to fail first: eight of the nine
      cases in `bridges-render-scenario.test.ts` ("Bridges drag preview")
      failed against the unchanged renderer. The ninth, the put-back, has
      nothing to put back until a preview exists.
- [x] 3 `redraw` draws it, and the tile cache repaints exactly the span's
      tiles as the destination changes. `BridgesUi.todraw` is gone, and
      `nlines` with it.
- [x] 4 Seen in the app mid-gesture (Chrome, 2026-10-09). Raw mouse moves in
      both schemes: a first bridge, a second, a removing drag, a turn from
      one island to another, a drag back to its island, and the secondary
      drag's `≤1` and cross. A touch drag and a held-finger secondary drag on
      a 412x915 touch viewport, in the light scheme. The preview follows the
      pointer and leaves no trail.
- [x] 5 The `bridges` delta restates the rendering requirement; the help page
      says what the line shows while dragging.
- [x] 6 Committed, pushed and archived.
