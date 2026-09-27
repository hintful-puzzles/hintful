# adopt-track-targets — tasks

- [x] 1.1 Re-read Singles', Lightup's, Filling's and Tracks' `hintKeepTrack`
      against `engine/hint-track.ts` (the survey dates from 2026-09-26).
      Re-read 2026-09-27; all four still wrote the policy by hand.
- [x] 1.2 Move each onto `trackTargets`; its hint tests pass unedited.
      All four take their changes from a board diff (`executeMove` on the
      pre-move state), so Lightup's hand guard against toggling a done cell and
      Filling's "hit none of the targets" length test are gone: both are
      changes the step never asked for. The existing hint tests pass unedited.
      Tracks gained one test: an edge flag is stored on both squares it
      separates, so its diff keys an edge once whichever side names it, and no
      existing case named an edge from the far side (planting the defect left
      the suite green until the test was added).
- [x] 1.3 Decide on a shared board-diff helper, and record the decision.
      **Added** `changedCells(size, before, after)` beside `trackTargets`: Singles,
      Light Up and Filling are one value per cell and would each write the same
      loop. **Not** stretched to the others: Tracks keys flags on squares and
      shared edges, Tents keys squares plus a tent's tree, Pearl keys edges, so
      their key enumerations are genuinely each game's own. Pattern reads its
      changes off the move against the grid, which is already a diff and gains
      nothing from executing the move.
- [x] 1.4 Update `docs/games/engine-catalog.md` § "`hint-track.ts`" with the
      adopters, and `docs/games/hints.md` § "Group one firing into one step".
      The catalog names the `npm run refs` query rather than a roster.
