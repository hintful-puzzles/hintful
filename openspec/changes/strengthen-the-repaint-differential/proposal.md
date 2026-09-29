# strengthen-the-repaint-differential

**Status: in progress.** Phase 0 of `envision-the-game-contract` (its
`design.md` § "Phase 0").

## Why

`src/engine/testing/repaint-differential.ts` paints every frame twice, once
warm and once from a fresh draw state, and compares the two pixel by pixel.
`warm-repaint.test.ts` runs it for every game. It found a dozen repaint defects
on 2026-09-28. It also has two blind spots, measured on 2026-09-29:

- **It never paints an animation frame.** After each event it calls
  `m.timer(30)`, but `Midend.timer` takes **seconds**. Every animation and win
  flash therefore ends inside that one tick, before the next paint.
  Instrumented, zero frames had `animTime` or `flashTime` above zero, in all 57
  games. Netslide's `besideMoving` repaint (7c92f3a6) is gated on animating, so
  the guard cannot re-detect the defect it fixed.
- **It never paints mid-drag.** A drag is sent as press, drag and release with
  no paint between them. A scratch copy that paints mid-drag found a live
  defect in Bricks. The drag preview's error marker straddles tile corners, and
  after the release 171 pixels of it survive where the cold paint has none.

A third weakness is power, not a blind spot. A run can report health for a game
it never showed the thing under test. Fifteen hinted games reached no hint
frame, and about fifteen mistake-capable games reached no mistake frame.

## What changes

- Tick the timer in sub-second steps and paint between them, so animation and
  flash frames are compared.
- Paint once mid-drag, between the drag event and the release.
- Count, per game, the frames with an animation, a hint and a mistake. Assert
  each count is non-zero, or ledger the game with its reason.
- Fix Bricks' drag-preview residue, and whatever else the strengthened guard
  convicts.
- Prove each new arm red before trusting it: revert Netslide's `besideMoving`
  and Bricks' fix.
