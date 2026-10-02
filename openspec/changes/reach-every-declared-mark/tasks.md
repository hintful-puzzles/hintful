## 0. Measure

- [ ] 0.1 Instrument the seeded run to report, per hinted game, the declared
      roles it never painted. Check the instrument first: with Pegs' pinned
      boards removed it must report Pegs' stripes. Record the census in
      `design.md`.
- [ ] 0.2 Decide role versus role-and-kind. Pegs' arrows are `outline` on
      `JUMP`, while its peg outline is `outline` on `PEG`, so a role-only key
      would call Pegs' outline reached without the arrows ever being painted.
      Measure how often that happens before choosing.

## 1. Guard

- [ ] 1.1 `RepaintReach` carries what was painted; `warm-repaint.test.ts`
      requires every declared role (or pair) to be reached, either by the
      seeded run or by a pinned case the game registers.
- [ ] 1.2 Close each gap the census finds with a pinned board in the game's
      own tests. Plant each one's key term out and watch it fail.
- [ ] 1.3 docs/games/rendering.md § "A tile paints only its own box, and tiles
      that share pixels repaint together" updated: the reach requirement
      replaces the advice to pin rare marks by hand.
