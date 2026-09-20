# read-the-widened-deixis-report — tasks

## 1. Read the report

- [x] 1.1 Regenerated first — `npx vitest run -c
      scripts/checks/diff.vitest.config.mts hint-deixis` — and the committed
      `metrics/hint-deixis.md` came back **byte-identical**, so the read is of
      the tree as it stands.
- [x] 1.2 Read every row, grouped by game, against the one question: **are the
      two marks the same kind of thing?** Each row was tagged with the class
      that ties it and the residue read by hand: 122 continuation legs, 82
      naming the second mark the way the board draws it, 184 tied by a line,
      region or run, and 117 read individually — by kind (Palisade's edge
      against regions, Loopy's edge against a dot, a clue or a corner note,
      Tracks' square against its own sides, Netslide's tile against its
      destination), by value (Mathrax's "the 4 across it", Group's "d·b = d",
      Sticks' clue), by state (Boats' filled segment against an empty square),
      or with only one place marked at all. **Nothing further to change.**
- [x] 1.3 Light Up's row is a false positive: the sentence names the other mark
      ("**The ringed square** is still dark and only this square can still
      light it"), which is the tie the four genuine cases were *fixed* to
      carry. It is in the report because the 120-character pass rewrote the two
      sentences `RELATIONAL`'s `except this one` and `could light it are
      marked` were pinned to. Neither phrase is repointed — both are retired,
      with the filter's liveness now asserted rather than assumed.

## 2. Fix what is real, where the judgment lives

- [x] 2.1 No genuine bare deictic to fix: the read found none. What it did find
      is the inverse — two Solo sentences that point at cells the frame never
      marks. Keying the same corpus on a *plural* deictic and counting the
      places a step marks found six shapes in 25,670 steps; four are Loopy's,
      where the pair connector the move draws is the mark. The two real ones
      are `mark-the-cells-solo-points-at`.
- [x] 2.2 Nothing owner-endorsed was rewritten.

## 3. Close out

- [x] 3.1 The outcome is in `scripts/checks/hint-deixis.test.ts`'s header: the
      figure, the per-class account, and the two things the read turned up that
      the sweep itself could not see — that `markRoles` counts role *fields*,
      so a step whose evidence is the acted-on square declares two of them
      (twelve rows, and the reason Sticks can name a clue of its target's own
      value in 46 of 49 steps with nothing ambiguous on the board), and that
      the sweep is blind to a sentence pointing at cells with no mark.
- [x] 3.2 `metrics/hint-deixis.md` needs no commit — regenerating it, before
      and after retiring the three dead filter phrases, produced the same
      bytes, which is what makes "they excused nothing" a measurement rather
      than a reading of the regex.
