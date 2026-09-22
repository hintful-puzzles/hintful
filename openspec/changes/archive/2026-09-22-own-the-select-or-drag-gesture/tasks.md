# own-the-select-or-drag-gesture — tasks

## 1. Pin the difference before removing it

- [x] 1.1 **The repeat tap puts the highlight away, everywhere** — today's
      click-select answer, with Rome and Map brought to it; `design.md` §1 says
      why. The guard is `src/engine/select-or-drag.test.ts`, written first,
      over the derived population, driving each game's own `interpretMove`
      through a real `Midend` with a press and a release. It named Rome (66
      inert repeat taps) and Map (129, plus 114 sticky right taps that hid the
      highlight) and nobody else.

      Three things about the guard are worth carrying forward, because each was
      a sweep reporting health over nothing: `Midend.restartGame` **keeps the
      `Ui`**, so a highlight left showing by one probe point answered for the
      next and framed Crossing for a defect it does not have (the fix is to
      deal the board again, which is what makes a fresh `Ui`); `newGame` deals a
      *random* board, so the counts moved between runs; and a `ReferenceError`
      inside a case printed as a passing suite line. The carve-out's power
      argument is proved from the board and the mode, never from the cursor —
      reading the state under test would have made the sweep's power depend on
      the defect's absence.
- [x] 1.2 Read side by side. The one real difference is **how a gesture is
      recognized**, and it is about the puzzles, so it stays with the games:
      Rome resolves by direction (back on the grabbed square is a cancel), Map
      by effect (a drop that changes nothing taps the region it was released
      over). `design.md` §5.

## 2. Move the gesture into the engine

- [x] 2.1 Designed against both at once; `design.md` records the shape and the
      three declined alternatives. The press-time `Ui` record the proposal
      expected turned out to be unnecessary: **a press that may become a drag
      commits to nothing**, so nothing was added to any `Ui`.
- [x] 2.2 `TapTarget.onSelection` — left out, the cell is the selection and the
      arm answers for itself; Map supplies its region. That also fixed a latent
      defect: Map compared the *tile* under the finger, so two taps on one
      region read as two selections.
- [x] 2.3 Rome and Map moved to `tapNoteTakingCell` /
      `dragEnteredNoteTakingCell`; both tap comments are gone. Rome's cursor
      stopped doubling as its drag grab (`ui.mx` / `ui.my`), which is what let
      its press stop moving the highlight.
- [x] 2.4 The click-select games are untouched: 5,032 tests across `src/engine`,
      `src/games/rome` and `src/games/map` pass, `note-taking-cell-render`'s
      snapshots included, with no re-baselining.

      **One snapshot was re-baselined, deliberately**: `capability-surface`'s,
      by exactly two insertions and no deletions — Rome's `Ui` gaining `mx` and
      `my`. That guard exists to catch a game's vocabulary changing silently,
      so the diff was read before the update rather than after, and the gate is
      what raised it.

## 3. Prove it

- [x] 3.1 The guard passes for every member.
- [x] 3.2 Planted `ui.cursor.visible = false` back into Map's press: both rules
      went red and named Map ("129 inert", "at (2,2)" ×114). Reverted.
- [x] 3.3 Ran the app. Rome: tap selects, repeat tap puts the highlight away,
      the drag previews on the grabbed square and places the arrow, a sticky
      right tap on a placed arrow switches the mode and leaves the highlight
      where it was, keyboard arm + direction places. Map: the band appears,
      a tap on **another cell of the same region** puts it away (the region
      identity), a color drag commits and clears the band, a sticky right tap
      on a clue region switches the mode with the band untouched, and the
      keyboard walks and pencils.

## 4. Record

- [x] 4.1 `ts-engine` delta: `MODIFIED` "A game whose press starts a drag joins
      the note-taking cell through its tap" (heading checked against the live
      spec with `rg -F -x`; its one surviving scenario reproduced, two added),
      plus an `ADDED` requirement for the engine owning the gesture.
- [x] 4.2 `docs/games/mechanics.md` § "Pencil marks: the full note-taking UX"
      and `docs/games/engine-catalog.md`'s `note-taking-cell.ts` entry.

## 5. Found while running the app

- [x] 5.1 Map's pencil-mode indicator is a 9×9 speck where every other member's
      is 30×30, because the glyph is sized from the *tile* and Map's is the
      collection's smallest. Verified by measurement, not by eye; filed as
      `size-the-pencil-indicator-to-the-board`. Its black body is **not** part
      of that — Map draws it in the grid ink deliberately, with its reason at
      the site.
