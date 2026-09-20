# derive-solos-region-names — tasks

## 1. Pin the invariant before changing anything

- [ ] 1.1 Write the guard first, against the code as it stands: for a Solo board
      with X diagonals **and** Killer cages, every cell's
      `noRepeatRegionNames(state, cell)` names exactly the regions
      `regionsOf(state, x, y)` returns, with the two diagonals as one word; and
      the `at`-less call is the union over the board. Both functions are
      module-private, so decide how the test reaches them (export, or drive it
      through the rendered `dup` / `cleanObvious` sentences) — and say which, and
      what that choice costs in what the guard can see.
- [ ] 1.2 **Prove it fails**: add a region to `regionsOf` and not to the names
      (and the reverse), watch it go red, restore. A guard nobody has seen fail
      is a guard nobody has seen work.
- [ ] 1.3 Count what it looked at. A board with no Killer data and no X
      diagonals exercises three region kinds of five; assert the population.

## 2. Derive

- [ ] 2.1 Put the name where it can be read off a region without widening
      `SoloRegion` (`proposal.md` states why the cage must stay off that union).
- [ ] 2.2 Replace `noRepeatRegionNames`' hand-written list with the derivation,
      keeping the diagonal dedup and the `at`-less union.
- [ ] 2.3 Byte-identical narration: Solo's hint snapshots and
      `solo-hint.test.ts` should not move. A moved snapshot here is a bug this
      change found, not drift — say which.

## 3. Close out

- [ ] 3.1 Spec delta against whichever `ts-engine` requirement the shape lands
      in — "A cell's regions are one definition per relation" is the likely
      home, since this extends "one definition per relation" to the *naming* of
      a relation.
- [ ] 3.2 `npm run test:slow -- src/games/solo`.
- [ ] 3.3 If the derivation wants a name on `CellRegion` itself, stop and say so
      rather than building it: that is an engine contract on one game's evidence
      (`proposal.md` § "What this does not do").
