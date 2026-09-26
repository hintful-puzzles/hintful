# retire-the-hand-rolled-drawing-doubles

**Status: implemented 2026-09-26; see `tasks.md` for what was measured.** Found while migrating tests onto
`drive-midend.ts` (`share-the-midend-test-harness`, 2026-09-26): the same
files that hand-rolled a notification recorder also hand-roll a drawing one.

## Why

`docs/games/engine-catalog.md` § "Testing harness" says it outright: **every
render test drives `RecordingDrawing`; do not hand-roll a double**, because a
local double records only the calls its author anticipated, so a game that
starts drawing something new leaves it green. Measured 2026-09-26 by shape
(`git grep -lE "implements GameDrawing|: GameDrawing = \{|drawRect: *\(" --
'src/**/*.test.ts'`, then read), eleven test files still build their own
`GameDrawing` literal:

`src/engine/midend.test.ts`, and the tests of cube, fifteen, flip, flood,
galaxies, group, mosaic, palisade, sixteen and twiddle. The midend-level ones
are near-identical copies of one another (op name plus color, blitters
stubbed), which is the duplication shape `drive-midend.ts` just removed on the
notification side.

## What Changes

- Move each onto `RecordingDrawing` (`opsOfKind` for typed filtering,
  `dr.updates` for `drawUpdate` rects), keeping every assertion's meaning.
- Where a test only needs the midend to paint *something*, prefer
  `renderScenario` if it reaches the frame more directly.
- Take the population by shape again before starting (the grep above) — a
  double may also be a class, or a partial object cast to `GameDrawing`.

## Things to check first

- Some doubles record draw calls in the *palette index* space and assert on
  `COL_*` constants; `RecordingDrawing` resolves colors to `rgb()` labels
  through the palette. Decide per test whether to assert on the label or on
  an index lookup, rather than adding an index mode to the recorder.
- Verify by shape as `share-the-midend-test-harness` did: per-file `it` and
  `expect(` counts unchanged, the same vitest total before and after, and a
  planted recorder defect that goes red.

## Player-visible

No.
