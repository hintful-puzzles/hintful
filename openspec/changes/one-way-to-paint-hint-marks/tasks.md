## 1. Census and design

- [x] 1.1 For each game, how its marks are painted: which helper, or what
      it does by hand. Sort into variants; record each with its query
      (`design.md` § "Census").
- [x] 1.2 Design one painter a variant; pilot on a game that pressures it
      (marks across tiles, text in the cell, animation). Singles: in-tile
      outline from `OverlaySidecar.outlineSides`, ring by `drawCellRing`
      round its number (D1, D2). The pilot found D4.
- [x] 1.3 D4: an outline joins cells only within one reference
      (`StepMarks.together`, `evidenceSides`, `HintMarkStyle.words`); the
      grid skeleton's `joinEvidence: () => false` workaround removed.

## 2. Migrate

- [ ] 2.1 Move the games in batches by variant; each runs in the app (a
      hint's ring, outline and stripes, through an auto-solve) before it
      counts. Record which moved, which keep a form of their own, and why.
      A game that gains `ds.hint` changes `capability-surface.test.ts`'s
      snapshot: update it (`-u`) with only that game's edit in the tree.
      Lightup, read 2026-11-21: `DF_HINT_AREA` and `DF_HINT_DARKREF` draw
      the same doubled inset outline and `DF_HINT_CLUE` is an outlined
      wall, so the sidecar carries all three: a wall keeps its inset band
      with the white line, an open square takes the contour.
  - [x] Singles (pilot).
  - [x] Mines: onto the sidecar; ring and outline no longer exclusive on a
        square, the mistake frame its own flag.
  - [x] Lightup: onto the sidecar. An open square takes the contour and the
        dark square's doubled ring folds into it; an outlined wall is always
        a strand reference of its own (the outline sets are open squares),
        so it keeps its inset box with the white line. Run in the app: the
        clue, the dark square and the other squares are closed shapes apart.
  - [x] Range: onto the sidecar. A clue's view is one contour (was a box
        a square), the shaded premise's doubled outline folds into the one
        outline, ring and outline no longer exclusive; the clue keeps its
        digit in the hint color (a `CLUE` mark, its own word bit).
  - [ ] A box a cell, onto the sidecar's sides and `drawCellRing` (D2):
        Slant, Signpost, Sticks, Boats, and the
        border grid (Palisade, Separate). Fold Range's and Slant's doubled
        "premise" outline and Lightup's dark-square ring into the one
        outline (`hints-marks.md` § "Outline the evidence": one shape for
        one role), unless the words lean on the difference.
  - [ ] Contour packed by hand, onto `evidenceSides(words)` (D4): Path,
        Pearl, Wordtrail, Rect, Tracks, Slide, the edges skeleton; Flip and
        Mosaic's `MarkOutlines` given `words`.
  - [ ] Rings drawn by hand on a cell's band, onto `drawCellRing`: Flip,
        Mines, Range, Slant, Sticks, Boats, Tracks, Signpost, Lightup.
- [ ] 2.2 A render snapshot that moves is a look that changed: check each
      against the variant's look, and record it. (None moved through 1.3.)
- [ ] 2.3 The skeletons write the engine's form (grid: done in 1.3; edges:
      with the contour batch).
- [ ] 2.4 Singles' corner step ("The corner's 4s need one shaded; … the
      side 4, boxing the corner in"): both cells "the corner's 4s" names
      are also named by "the side 4" and "the corner", whose colors cover
      it, so that reference shows no mark of its own. As before this
      change. Raise it with the owner, recommending the words name the
      pair by the two other references (`hints.md` § the deictic rules)
      rather than a third.

## 3. Finish

- [ ] 3.1 The guides describe one way a variant (`hints-marks.md`
      § "Outline the evidence" and § "Where the band goes, and who rubs it
      out", `rendering.md` § "A mark that crosses tiles"). Run
      `npm run test:hint-sweeps`; commit, push, archive.
