## 0. Measure

- [x] 0.1 Instrument the seeded run to report, per hinted game, the declared
      roles it never painted. Check the instrument first: with Pegs' pinned
      boards removed it must report Pegs' stripes. Record the census in
      `design.md`.
- [x] 0.2 Decide role versus role-and-kind. Pegs' arrows are `outline` on
      `JUMP`, while its peg outline is `outline` on `PEG`, so a role-only key
      would call Pegs' outline reached without the arrows ever being painted.
      Measure how often that happens before choosing. (Role and kind, taken
      from the renderer's own reads: design.md D2.)

## 1. Guard

- [x] 1.1 `RepaintReach` carries what was painted; `warm-repaint.test.ts`
      requires every declared role (or pair) to be reached, either by the
      seeded run or by a pinned case the game registers.
- [x] 1.2 Close each gap the census finds with a pinned board in the game's
      own tests. Plant each one's key term out and watch it fail. (Pinned in
      `warm-repaint.test.ts`'s `PINNED`, so one guard holds pins and ledger
      exact: design.md D3.)
- [x] 1.3 docs/games/rendering.md § "A tile paints only its own box, and tiles
      that share pixels repaint together" updated: the reach requirement
      replaces the advice to pin rare marks by hand.

## 2. Found along the way

- [x] 2.1 The differential passes `deadEnd` and checks as Check & save does.
- [x] 2.2 Guess erases its current-move marker on a win.
- [x] 2.3 Mines keeps the winning open on track while the win flags mines.
- [x] 2.4 Scaffold `deal-every-tracks-board` and
      `let-a-board-waive-the-deduction-promise`.
