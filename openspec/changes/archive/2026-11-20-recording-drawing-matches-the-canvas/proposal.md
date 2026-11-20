## Why

Filed on the owner's word, 2026-11-19, from the review of the Wordguess and
Wordtrail session logs. The test drawing,
`src/engine/testing/recording-drawing.ts`, differs from the canvas drawing,
`src/puzzle/drawing.ts`, in two ways that cost the sessions time:

1. **It accepts a color the canvas refuses.** The canvas drawing throws
   `strokeColor … not in palette` for an index outside the palette, such as
   `-1` as a circle's outline. The recording drawing labels it `color#-1`
   and goes on. Wordtrail's first build had all 93 tests green and crashed
   on its first frame in Chrome (2026-11-19, 00:52): "Running it in Chrome
   found a crash the recording drawing in tests didn't".
2. **It records raw palette indices, so snapshots churn on a renumbering.**
   Each op records both the index and its resolved `rgb(…)` label. A game's
   colors are positional constants (`COL_SELECTED = 17`), and the engine's
   appended colors follow them. Removing two of Crossing's colors
   (2026-11-19, 19:53) renumbered every later index, changed the game's frame
   snapshots and an engine snapshot
   (`src/engine/note-taking-cell-render.test.ts`) the targeted run did not
   include, and failed a gated commit; the agent read 355-line diffs to
   confirm they were only renumbering.

## What Changes

- The recording drawing refuses exactly what the canvas drawing refuses,
  from one shared check, so a test fails where the app would crash.
- A recorded op's snapshot form keys a color by what it paints (the resolved
  label, or the palette slot's name where a game names its slots) rather
  than by its position, so removing a color changes only the frames that
  used it. Targeted assertions keep comparing indices where they mean to.

## Impact

`src/engine/testing/recording-drawing.ts`, `src/puzzle/drawing.ts` (the
shared check), every `__snapshots__` file holding render records
(re-baselined once, each diff explained by the format change alone),
`docs/testing.md` § "Render scenarios".
