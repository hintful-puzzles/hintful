# Tasks

Read `docs/games/input.md` and `openspec/specs/engine-input/spec.md` first.

## 1. See it

- [x] 1.1 A cross-game probe in the input-probe module: a press, a cancel as
      the view sends it today, and a comparison of the board and the `Ui`
      with what they were before the press; again with the press moved a
      tile before the cancel. Check: it reports Galaxies and Bridges for the
      moved case, and says how many presses it made in each game.

      `canceledPresses`. Against the old cancel it reported 55 of the 57
      games, Galaxies (268 of 2016 moved presses) and Bridges (228 of 2016)
      among them; only Sokoban and Slide's unmoved case were clean. It
      cancels between 132 presses (Untangle) and 3980 (Map) a game, about
      100,000 in all.
- [x] 1.2 Each game the probe reports is seen in the running app with a real
      `pointercancel` (a touch hold interrupted, or Escape during a press),
      and the result is written down: what changed on the board.

      Chrome, 2026-10-09, every game: a mouse press at 16 points across the
      board, Escape, and the Undo control read; then the same after a drag of
      a quarter of the board. A move had been made after the cancel in 37
      games (unmoved/moved, of 16 each):
      ascent 0/16, blackbox 12/12, bricks 12/16, bridges 0/2, clusters 8/10,
      cube 15/15, dominosa 16/16, fifteen 4/4, flip 9/9, flood 14/14,
      group 0/3, inertia 9/9, lightup 12/12, loopy 16/16, magnets 14/14,
      mosaic 9/9, net 16/16, netslide 8/8, palisade 6/6, pattern 9/9,
      pearl 12/16, range 10/10, rome 7/7, samegame 0/10, separate 4/4,
      singles 16/16, sixteen 11/10, slant 9/9, slide 0/1, spokes 13/13,
      sticks 6/16, subsets 3/3, towers 8/8, tracks 0/15, twiddle 4/4,
      undead 6/6, unruly 10/10.
      The other 20 made no move at those points. Their leftovers are in the
      `Ui` (a selected cell, an open drag), which the Undo control does not
      show, or need a press on something 16 points miss (a Galaxies arrow, an
      Untangle point): the probe is what convicts those.

## 2. The signal

- [x] 2.1 Decide how a cancel reaches a game (a button code, a hook, or the
      engine restoring the `Ui` it saved at the press), weighed at every
      game and written in `design.md` with what each option asks of a game.

      The engine restores, and the history with the `Ui`.
- [x] 2.2 `cancelPointerTracking` sends it, and no longer a drag and a
      release at a point off the board.
- [x] 2.3 Every game the probe reported commits nothing on a cancel and
      leaves its `Ui` as it was. Check: the probe of 1.1, made a guard,
      passes for every game, and is seen to fail with the old synthesized
      drag put back.

      `canceled-press.test.ts`. With `cancelPress` made to send the old drag
      and release, it failed naming 55 games. The app sweep of 1.2, run
      again, found a move after a cancel in none of the 57.
- [x] 2.4 The triage's game-side fixes in Galaxies and Bridges are removed
      where the signal makes them dead. Check: their tests still pass.

      Both removed, and the same test in the shared sweep drag
      (`sweepTo`'s "a negative coordinate is the pointer gone"). Their tests
      of a canceled press now cancel through the midend; the sweep's test
      says what a drag off the left edge does.

## 3. Close

- [x] 3.1 `engine-input` says what a canceled press is; the games' deltas
      follow; `docs/games/input.md` has the rule and the shape to look for.
- [x] 3.2 A canceled touch seen doing nothing in the app in Galaxies,
      Bridges, Untangle and Pattern, on a phone-sized touch viewport.

      Chrome, 412 by 915 with touch, a real `touchCancel`. Each gesture was
      first lifted, and kept only where that made a move; then repeated and
      canceled. No move and an unchanged frame after every cancel: Pattern
      32 gestures (drags and holds), Bridges 20, Galaxies 7, Untangle its six
      points dragged. The touch check was not run against the old build; the
      mouse sweep of 1.2 is the before.
- [ ] 3.3 Committed, pushed and archived.
