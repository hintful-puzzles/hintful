# Tasks

Read `docs/games/input.md` and `openspec/specs/engine-input/spec.md` first.

## 1. See it

- [ ] 1.1 A cross-game probe in the input-probe module: a press, a cancel as
      the view sends it today, and a comparison of the board and the `Ui`
      with what they were before the press; again with the press moved a
      tile before the cancel. Check: it reports Galaxies and Bridges for the
      moved case, and says how many presses it made in each game.
- [ ] 1.2 Each game the probe reports is seen in the running app with a real
      `pointercancel` (a touch hold interrupted, or Escape during a press),
      and the result is written down: what changed on the board.

## 2. The signal

- [ ] 2.1 Decide how a cancel reaches a game (a button code, a hook, or the
      engine restoring the `Ui` it saved at the press), weighed at every
      game and written in `design.md` with what each option asks of a game.
- [ ] 2.2 `cancelPointerTracking` sends it, and no longer a drag and a
      release at a point off the board.
- [ ] 2.3 Every game the probe reported commits nothing on a cancel and
      leaves its `Ui` as it was. Check: the probe of 1.1, made a guard,
      passes for every game, and is seen to fail with the old synthesized
      drag put back.
- [ ] 2.4 The triage's game-side fixes in Galaxies and Bridges are removed
      where the signal makes them dead. Check: their tests still pass.

## 3. Close

- [ ] 3.1 `engine-input` says what a canceled press is; the games' deltas
      follow; `docs/games/input.md` has the rule and the shape to look for.
- [ ] 3.2 A canceled touch seen doing nothing in the app in Galaxies,
      Bridges, Untangle and Pattern, on a phone-sized touch viewport.
- [ ] 3.3 Committed, pushed and archived.
