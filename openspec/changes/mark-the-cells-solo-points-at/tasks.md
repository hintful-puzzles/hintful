# mark-the-cells-solo-points-at — tasks

## 1. The deduced extra-cage

- [ ] 1.1 Carry the region on the reason: `cageIntersect` gains
      `region: SoloRegion`, built from the `(i, n)` the KINTERSECT loop already
      walks (0 → row, 1 → column, 2 → block).
- [ ] 1.2 Shade it: `reasonArea` and `placementArea` return the region's cells
      for `cageIntersect`, with the open cell still the target.
- [ ] 1.3 Rewrite `say.cageIntersect` against that frame: name the region by
      kind, state the region's total, and say the cages and filled cells inside
      it account for all but the residual. Hold it to the 120-character limit.

## 2. The locked pattern

- [ ] 2.1 Record the firing's own cells on the region-less `set` reason — the
      candidate positions at (rows confined to the chosen columns) × (those
      columns), taken where the firing is decided rather than per elimination.
- [ ] 2.2 `reasonArea` shades them where there is no region.
- [ ] 2.3 Re-read `say.set`'s region-less arm against the frame: "these lines"
      only if the lines are what is marked, otherwise name the pattern.

## 3. Pin it where the judgment lives

- [ ] 3.1 In `solo-hint.test.ts`, reach each firing and assert the step marks
      every cell its sentence points at (and, for the extra-cage, that the
      region's cells sum to the grid total so the arithmetic the sentence
      teaches is the arithmetic the board shows).
- [ ] 3.2 Prove each new assertion fails: restore the old reason payload, watch
      it go red, restore.
- [ ] 3.3 Re-run the deixis sweep and the plural-deictic probe; neither Solo
      shape may remain.

## 4. Accept it in the app

- [ ] 4.1 Play a killer board and an Extreme board in the browser, ask for a
      hint at each firing, and read the sentence against the frame.
