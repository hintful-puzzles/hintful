# Delete the retained upstream paths

## 1. Code

- [x] 1.1 Delete `upstreamLooseGate` from Ascent, Bricks, Clusters, Mathrax and
      Salad, with every branch and constant only it used.
- [x] 1.2 Delete `upstreamIsolatedCells` (Crossing), `upstreamRegionGrower`
      (Seismic, with upstream's whole region grower — 210 lines of
      `generator.ts`, its retry constant, and `ALL_MARKS`, which only it used)
      and `upstreamDirtyGate` (Spokes).
- [x] 1.3 Delete the tests that proved a flag still changes the outcome; reword
      Subsets' comment that named a flag. Comments elsewhere that still said a
      byte-match validates generator, solver and codec together were reworded
      with them.

## 2. Differentials

- [x] 2.1 Re-found each of the eight on its untouched frozen fixture: recorded
      descriptions validate, load and round-trip, and the solver finds each board
      uniquely solvable. Name, in each header, the property test that now
      carries generation.
      Seismic's differential was **deleted** instead: every check it made besides
      generation already ran over all 28 fixtures in `seismic.test.ts`, and its
      slow 7×7 block went with it. Where the shipped generator still reproduces a
      subset of the recorded boards — Spokes' Easy tier, which the changed gate
      never touches, and Crossing's boards without an isolated cell — that subset
      is still compared byte-for-byte, with a non-empty guard.
      Known loss: Salad's byte-match was the only test showing that attaching the
      hint recorder cannot change generation.

## 3. Docs

- [x] 3.1 `docs/games/solver-and-generator.md`: the retained-paths section
      becomes "A divergence retires or re-founds its fixture".

## 4. Verify and conclude

- [x] 4.1 `grep` for the four option names across the tree: zero, and none of
      the per-game `*GenerateOptions` types remain.
- [x] 4.2 The eight games' tests, typecheck, biome, unused exports. The eight
      games plus Subsets: 28 test files, 789 tests passing; `tsgo`, biome,
      unused-exports and vacuous-assertions clean.
- [x] 4.3 Archive and commit through the full gate.
