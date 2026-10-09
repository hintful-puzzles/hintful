# Tasks

- [x] 1 A test loads a Bricks board dealt at each offered tier under `6x7dt`
      and expects the midend to report the tier it was dealt at. Seen to fail:
      both reported `6x7dt`.
- [x] 2 `Midend.withBoardTier` grades a board whose stated tier is past the
      offered ones, as it grades one whose ID states none.
- [x] 3 The app is run: an Unreasonable board opened by a `dt` ID is followed
      by the hint until deduction runs out, and the refusal is read in the
      banner with no error dialog.
      - `/bricks?id=6x7dt:a1c1b5cd3a3a4cb3cd4a2b3b` in Chrome on 2026-10-09:
        the type reads "6x7 Unreasonable", and after three hinted moves the
        banner reads "Nothing further follows by deduction here. This board's
        difficulty allows positions that need trial and error", with no
        dialog.
- [ ] 4 Committed, pushed and archived.
