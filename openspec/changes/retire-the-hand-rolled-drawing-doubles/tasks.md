# Tasks

- [x] Re-take the population by shape and record the baseline counts.
  The grep, widened to `as unknown as GameDrawing` and a `blitterNew` /
  `drawText: (` sweep, found the eleven files the proposal named plus one
  stray: `pencil-indicator-placement.test.ts` already used `RecordingDrawing`
  but cast it `as unknown as GameDrawing`, which it implements. The
  `blitterNew` sweep's other hits are production renderers. Baseline per-file
  `it`/`expect(` counts recorded before the first edit.
- [x] Move each hand-rolled `GameDrawing` double onto `RecordingDrawing`.
  None needed `renderScenario`: the midend-level tests already hold the
  midend and only force a redraw, so they record it with
  `new RecordingDrawing(m.getColorPalette(DEFAULT_BACKGROUND))`, the idiom the
  tree already uses. Sixteen's two recorders folded into one, and Fifteen's
  `dr0` wrapper went.
- [x] Verify by shape: per-file `it`/`expect(` counts and vitest total unchanged; a planted recorder defect goes red.
  Counts identical in all thirteen files. The touched files ran 338 tests
  before and 339 after, the one extra being `paintsWith`'s own test.
  Planting "drop every circle and every `drawUpdate` rect" in the recorder
  turned five migrated tests red (the midend's ground and mistake-overlay
  tests, Flood's hint circle, Galaxies' candidate rings).

## Decisions

- **Palette indices, not labels.** The "things to check first" worry does not
  arise: `RecordingDrawing` keeps the raw index beside the `rgb()` label, so
  every `COL_*` assertion carried over as an index comparison.
- **`paintsWith(op, color)` joins the recorder.** Galaxies and Sixteen each
  asked "does anything paint in this color" across every primitive, which
  `DrawOp` answers in two fields (`color`, or `fill`/`outline`). It reads the
  outline too, where the doubles read only a polygon's fill, so it is
  stricter for the one `false` assertion and no weaker for the `> 0` one.
- **What the doubles saw that the recorder does not.** Three doubles logged
  `startDraw`/`endDraw` and blitter calls into their op list. No assertion
  read a blitter call, and none of the games under test use blitters.
  Galaxies' two "an idle frame paints nothing" assertions counted the
  `drawUpdate` entries that sat in the same list, so they now assert over
  `ops` and `updates` together. The midend's "paints nothing else" test
  asserted the order of the ground rect relative to its `drawUpdate`. That
  order is lost, because the recorder keeps updates off `ops` on purpose.
  In exchange the test now sees hatches and every other primitive the old
  double dropped.
- **No `recordRedraw(midend)` helper.** Measured before declining: seven
  sites in the tree build a recorder from `getColorPalette`, and most
  recorders take a palette the test already holds. The one-liner is
  already the idiom, and a helper would be a second way to write it.
