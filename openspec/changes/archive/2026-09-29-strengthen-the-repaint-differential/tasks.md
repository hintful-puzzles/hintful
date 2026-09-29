## 1. Reach

- [x] 1.1 Tick the clock in 0.05 s steps after every event and paint each frame
      until one comes out still (capped at 6 s, then settled), instead of one
      `timer(30)`: `Midend.timer` takes seconds.
- [x] 1.2 Paint once mid-drag, between the drag event and its release.
- [x] 1.3 Start a hinted game by showing its hint and playing three steps.
- [x] 1.4 `RepaintRun.reached` counts animated, hinted and mistaken frames and
      the events that armed an animation (`currentAnimationMs`, independent of
      the ticking).
- [x] 1.5 `warm-repaint.test.ts` requires an armed animation to have been
      painted part-way, and a hinted game to have painted a hint frame. Mistake
      frames are counted, not required: a mistaken board takes a game-specific
      move (the reason `mistake-overlay-coverage.test.ts` is a ledger).

## 2. Proven red

- [x] 2.1 Tick planted back at 30 s: 11 games fail "armed an animation, painted
      none of it" (blackbox, cube, fifteen, flip, inertia, net, netslide,
      sixteen, twiddle, unruly, untangle).
- [x] 2.2 Hint prelude planted off: 11 hinted games fail "has a hint, painted no
      hint frame".
- [x] 2.3 Netslide's `besideMoving` clause planted out: red at the first frame
      of an executed hint step. It stays red with the 30 s tick as well, so this
      re-detection comes from the hint prelude reaching a Netslide slide at
      all, not from the ticks.

## 3. What the strengthened guard convicted, fixed

- [x] 3.1 **Bricks** (the mid-drag paint): a rule mark drawn whole across tile
      edges left 171 px of a gravity diamond after the drag released. Each tile
      is now clipped to its own square as upstream clips it, widened over the
      ground at a board edge, so each tile draws only its own piece of a mark.
      Seen in the browser: the three-in-a-row bar and the gravity diamond
      compose whole mid-drag and leave nothing after the release. The two
      Bricks snapshots gain only clip, unclip and ground rects (checked by
      shape: no line removed, all 24 added rects `COL_MIDLIGHT`).
- [x] 3.2 **Towers** (the hint prelude): a hint mark beside the clue ring's
      top-right corner repainted that square, which filled over the pencil-mode
      indicator, and `repaintPencilIndicator` redraws only on a mode change. A
      clip that covers the indicator's box now forgets what it showed.
- [x] 3.3 All 57 games green; the files that call the differential directly
      (clusters, group, keen, sixteen, solo, subsets, towers, unequal, bricks)
      green.

## 4. Docs

- [x] 4.1 `docs/games/rendering.md` § "A tile paints only its own box, and tiles
      that share pixels repaint together": the two new shapes, and what the run
      reaches.
