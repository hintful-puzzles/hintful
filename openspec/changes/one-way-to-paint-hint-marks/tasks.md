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

- [x] 2.1 Move the games in batches by variant; each runs in the app (a
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
  - [x] Slant: onto the sidecar (indexed by its ring-extended tile). A
        clue's outlined squares are one contour; the equivalence anchor's
        doubled ring folds into the one outline (a reference of its own, so
        a shape apart; the words name it by noun, not by glyph).
  - [x] Signpost: onto the sidecar for the square's outline, stripes and
        ring; the arrow's ring stays its own flag (a mark on an arrow). The
        square's ring keeps `drawRing` off center, not `drawCellRing`: its
        number is flush in the corner, and a centered ring threw "No round
        ring fits" in the app on every ringed square showing a number. No
        test drew one; `signpost-hint.test.ts` now does.
  - [x] Sticks: onto the sidecar. An open square takes the contour at its
        edge (was a box inset a square); an outlined block is always a clue
        reference of its own, so it keeps its inset box with the white line,
        as Lightup's wall. The ring is `drawCellRing` holding the bar.
        `sticks-hint.test.ts` no longer pins four sides a square.
  - [x] Boats: onto the sidecar for outline, ring and stripes; the key keeps
        one bit, whether the ring holds a boat or water. Ring and outline no
        longer exclusive on a square.
  - [x] The border grid (Palisade, Separate): its draw state owns the hint
        sidecar (`packHintMarks`), and `drawBorderTile` takes the draw state
        and paints the contour and hatch from it; `F_HINT_CELL` and
        `F_HINT_REGION` are gone. A region the step outlines is one contour
        (was a box a square). It has no cell ring: its rings are on edges.
  - [x] Range's and Slant's doubled "premise" outline and Lightup's
        dark-square ring folded into the one outline (`hints-marks.md`
        § "Outline the evidence": one shape for one role), with their games.
  - [x] Contour packed by hand, onto `evidenceSides(words)` (D4): Path,
        Wordtrail, Rect and the edges skeleton; Pearl and Tracks, whose
        squares are a mark kind of their own, through `evidenceSidesOf`;
        Slide reads its sidecar's sides; Flip's `MarkOutlines` given `words`.
        Mosaic keeps a `MarkOutlines` a block: it joins only within one
        block, stricter than a reference, so two blocks one reference names
        still read as two squares (its comment's reason). Wordtrail's
        spotlight keeps `outlineSides`: it is not a hint mark. No snapshot
        moved; all seven games walked in the app.
  - [x] Rings drawn by hand on a cell's band, onto `drawCellRing`: Flip and
        Tracks here, the rest with their batches above. Signpost's square
        ring keeps `drawRing` off center, for the reason its item gives.
        Neither ring changed thickness: each band's width was its ring's.
- [x] 2.2 A render snapshot that moves is a look that changed: check each
      against the variant's look, and record it. Moved: Group and Rome in
      1.3 and Adjacent after it (two references that touched, now two closed
      shapes, D4); Sticks (an open square's outline moved from an inset box
      to the contour at its edge). Range's look test was rewritten with its
      migration. Every other migration left its snapshots as they were: their
      pinned frames outline single squares, whose contour is all four sides.
- [x] 2.3 The skeletons write the engine's form (grid in 1.3, edges with the
      contour batch).
- [ ] 2.4 Singles' corner step ("The corner's 4s need one shaded; … the
      side 4, boxing the corner in"): both cells "the corner's 4s" names
      are also named by "the side 4" and "the corner", whose colors cover
      it, so that reference shows no mark of its own. As before this
      change. Raise it with the owner, recommending the words name the
      pair by the two other references (`hints.md` § the deictic rules)
      rather than a third.

- [x] 2.5 Every hint frame draws. `warm-repaint` paints each mark kind once,
      so Signpost's centered ring passed it while throwing on every ringed
      square that shows a number. `hint-resume.test.ts`'s frame sweep, which
      walks every step of each preset's opening plan, now draws each step's
      frame and fails on a throw: it failed at Signpost's step 2 with the
      defect planted, for about 2 s more over the collection.
      It asserts `ringCrossings` too, since Loopy's (below) was fixed.
      `ringCrossings` called Mathrax's "12×"
      crossed because a wide label's box corners leave the disc while its
      glyphs do not; it now takes a label centered on a disc and no wider
      than it as on the disc.
- [x] 2.5a Loopy, 9x11 Hats Hard (the gate's deal), step 308 of the opening
      plan: the pair ring crossed an "=". Not the fallback, as first read:
      the ring fit, but Loopy's `clearOf` left out text past half the box's
      short side, and `ringShape` also shifts a ring by up to a quarter, so
      the sign it crossed was never handed to it. `ringReach` (`ring.ts`,
      beside the moves it bounds) is now that bound, and the frame sweep
      asserts `ringCrossings` on every plan step's frame (failed at step 308
      with the old bound planted; 65 games pass).
- [ ] 2.6 The app's repaint edges an outline or ring *outside* the mark
      (`mark-flash.ts` `repainted`), and the edge lands on content the game
      drew over the mark: on Mathrax, the evidence outline's edge replaces
      the black rim of the clue disc it passes under with a speckled arc
      (seen 2026-11-21, `7de#sweep0`, the 12× step). The frame pair cannot
      tell an occluder from the background beside a mark, since neither
      changes when the mark is hidden. Recommendation: measure the occluders
      once more, with the hint inks drawn opaque in black and in white
      *without* the rest of the frame's change; a pixel whose ink coverage
      is zero but which lies inside the mark's own drawn footprint is
      covered, and takes no edge.

## 3. Finish

- [ ] 3.1 The guides describe one way a variant (`hints-marks.md`
      § "Outline the evidence" and § "Where the band goes, and who rubs it
      out", `rendering.md` § "A mark that crosses tiles"): done. Run
      `npm run test:hint-sweeps`; commit, push, archive once 2.4, 2.5a and
      2.6 are settled.
