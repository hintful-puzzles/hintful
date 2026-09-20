# mark-the-cells-solo-points-at — tasks

## 1. The deduced extra-cage

- [x] 1.1 `cageIntersect` carries `region: SoloRegion`, built by
      `SolverUsage.extraRegion` from the `(i, n)` the KINTERSECT loop walks.
- [x] 1.2 `reasonArea` and `placementArea` return the region's cells, with the
      open cell still the target.
- [x] 1.3 `say.cageIntersect` names the region, states its total and says the
      cages and digits inside it account for all but the residual. 112
      characters at 9×9, 113 at 16×16 — inside the shared 120 limit. The
      residual *is* the digit (`clue === n` in all 172 firings measured across
      48 boards), which is why the old sentence said the number twice.

## 2. The locked pattern

- [x] 2.1 `set_` records the firing's cells (`setCells`) — every position the
      chosen columns still admit — per firing rather than once per call.
- [x] 2.2 `reasonArea` shades them where there is no region.
- [x] 2.3 The region-less arm of `say.set` speaks of those cells instead of the
      lines it used to point at and never marked. What it claims is what the
      firing checks, measured over the same boards: in 10 of 10 strikes the
      struck cell lay in a pattern row and outside the pattern's columns.

## 3. Pin it where the judgment lives

- [x] 3.1 `solo-hint.test.ts` reaches each firing and asserts the marks are
      what the words point at: the extra-cage shades exactly the region the
      sentence names (whose solution values sum to the total it quotes), and
      the locked pattern shades as many rows as columns with every strike
      inside its rows and outside its columns.
- [x] 3.2 Both proved to fail: restoring the one-cell evidence fails the
      extra-cage test on `area` length 1 of 9, and restoring `[]` fails the
      locked-pattern test with "'the highlighted cells' with nothing
      highlighted".
- [x] 3.3 The deixis report is regenerated. The locked-pattern row is **gone**
      (the new sentence has no bare deictic at all) and the extra-cage row
      became three, one per region kind, each now tied by region context.

## 4. Accept it in the app

- [x] 4.1 Played both in Chrome at `npm run dev`: a `3x3 Killer Easy` board
      shows the whole column shaded behind "This column must total 45; the
      cages and digits inside it account for all but 5…", and a `3x3 Extreme`
      board shows the four cells of an 8-wing outlined behind "The highlighted
      cells are the only places 8 fits in their columns…", with the struck 8 in
      a fifth cell in one of their rows.
