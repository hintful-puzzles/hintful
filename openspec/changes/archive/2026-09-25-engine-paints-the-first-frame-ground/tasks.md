# Tasks

## 1. The engine lays the ground

- [x] 1.1 `Midend.redraw` fills `computeSize(params, tileSize)` in color 0 and
      reports it with `drawUpdate`, after `startDraw` and before `game.redraw`,
      on the first redraw of a fresh drawstate only. `freshDrawState` is the
      one place that arms it, so `size()` at an unchanged tile size cannot.
- [x] 1.2 The fake game paints nothing, so the midend tests record only the
      engine's ops: the ground on a fresh drawstate, nothing on a later
      redraw, and none after a same-tile `size()`.
- [x] 1.3 Planted both regressions and watched them fail: ground disabled
      (every game in `first-frame-coverage.test.ts` and five midend tests go
      red); ground armed from `size()` (the same-tile test goes red).

## 2. The games stop laying it

- [x] 2.1 Census by output, not by name: every game's first frame, then a
      re-draw and forty timer ticks after Solve, counting full-canvas rects.
      Every game but four drew a color-0 full-canvas fill first, on the first
      frame only. Cube and Loopy fill every frame (a whole-board repaint, kept);
      Rect and Untangle fill in another color (their override, kept). Bricks'
      `COL_MIDLIGHT` and ABCD's, Crossing's and Subsets' `COL_OUTERBG` are
      color 0, so those fills went too.
- [x] 2.2 Deleted the color-0 fill from the other games' first-frame branches
      and from `drawBorderGridBackground` (Palisade, Separate), each checked to
      sit under `!ds.started` or its alias.
- [x] 2.3 Deleted the full-canvas `drawUpdate` beside it in the same branches:
      the midend reports that rectangle on the same frame.
- [x] 2.4 Removed what that left dead: the size variables, and the `started`
      flag in Bricks, Bridges, Crossing, Dominosa, Mosaic, Net, Range, Salad,
      Slant, Slide, Spokes and Towers, whose first-frame branch had held
      nothing else. A fresh drawstate's cache of `-1` still forces every tile.
      `capability-surface.test.ts` loses exactly those twelve `started` lines,
      and its draw-state vacuity floor now anchors on `tileSize`. The old
      anchor was the flag this change removed.
- [x] 2.5 Rewrote the comments that said the engine paints no pixels.

## 3. Specs, guides, verification

- [x] 3.1 `ts-engine`: REMOVED the repaint requirement, ADDED its replacement
      with the ground, retiring "`Midend.redraw` emits no draw ops of its own".
      MODIFIED the Signpost, Galaxies, Cube and Sokoban requirements that
      restated the old doctrine.
- [x] 3.2 `docs/games/rendering.md` § "The rendering doctrine", the README's
      definition of done, and `docs/games/testing.md` § "A snapshot cannot see a
      hole".
- [x] 3.3 `first-frame-coverage.test.ts` also requires the ground to be the
      first op of every game's first frame.
- [x] 3.4 Engine, game and puzzle tests green. Twenty-five snapshots
      re-baselined, and every changed line is one of four shapes (see the
      proposal's "Costs to weigh"). Four direct-`redraw` tests asserted the
      game's own fill: Blackbox's and Guess's, which asserted nothing else, are
      deleted, and Fifteen and Twiddle drop the one line.
- [x] 3.5 Ran the app: games from each shape of first frame, in light and dark
      mode, across a resize.
