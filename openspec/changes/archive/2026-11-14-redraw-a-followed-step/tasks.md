# Tasks

- [x] 1.1 Reproduce in a test: a multi-target step displayed, a player move that is `"onTrack"`, and what the midend then draws and says. See it fail on `HEAD`
  - The midend was right: headless, Tents' grass on one ringed square left the step, its words and the ring list passed to `redraw` all narrowed (2026-11-14). The stale ring was the app's: `Puzzle` measures each reference's marks off the frame (`hintReferenceMarks`) and lays them over the canvas in the reference's color, and measured again only when the words' spans changed. A narrowed step keeps its words, so the old measure kept painting the old ring.
  - `midend.test.ts` "sends the marks a move on track narrowed, under the same words" and `puzzle-hint-stepper.test.ts` "are measured again when the same words mark other squares" each failed with its half of the fix taken out.
- [x] 1.2 Find which layer keeps the old step (midend drawn step, status bar, app copy) and fix it there, for every game
  - `status-bar-change` carries `activeHintMarks`, each reference's mark keys; `Puzzle` measures again when the spans or these change. One path for every game: the overlay belongs to the app, not to any game.
  - The measure is by difference from the frame with a reference hidden (and by coverage in the inks), so it depends on the marks and not on the content under them; size and palette already re-measure.
- [x] 1.3 Check by hand in Chrome: Tents' grass step and a Pearl or Tracks edge step, part followed, redraw at once without the followed part
  - Tents 8x8 Easy: before the fix the grassed square kept its ring with the overlay's white edge; after it, the ring went at once. Pearl `6x6de:BcWeWeWaBaBaWaWhWWa`, the edge white pearl's two links: one drawn by drag, the ring kept only the other.
- [x] 1.4 The first right-click after Explain the hint: settle whether it is real (by hand), and fix it or drop it here
  - Dropped: five tries on four Tents boards, every first right-click after Explain the hint made its move. The two misses in the filing came through `playwright-cli` before this session.
