# share-the-single-firing-driver — tasks

## 1. Read before designing

- [ ] 1.1 Re-read the three drivers (Tracks, Bridges, Magnets) and confirm the
      proposal's description of each still holds; it is dated 2026-09-21.
- [ ] 1.2 Take the population by reference, not by the three names above: every
      call of `runDeductionFixpoint` whose `settled` is about a *firing* rather
      than about the board (`npm run refs -- src/engine/deduction-fixpoint.ts
      runDeductionFixpoint`, then read each `settled`).
- [ ] 1.3 Measure Bridges' plans (steps, hidden count) on a fixed corpus before
      changing anything, so the move to `showable` can be compared.

## 2. The driver

- [ ] 2.1 Settle the shape: an option on `runDeductionFixpoint` or a function
      beside it. Record why in `design.md`.
- [ ] 2.2 Decide the snapshot/diff question (proposal item 2), and record it
      either way.
- [ ] 2.3 Tier-1 tests for the driver, including a contradiction and an
      exhausted ladder; prove each fails against a planted defect.

## 3. Move the adopters

- [ ] 3.1 Magnets, Tracks, Bridges, one commit each, each with its hint tests
      passing unedited.
- [ ] 3.2 Bridges' max-cap firings hidden through `showable`; compare against
      1.3.

## 4. Close out

- [ ] 4.1 `docs/games/hints.md` § "Recording the deduction": replace the
      hand-built Tracks recipe with the driver.
- [ ] 4.2 `docs/games/engine-catalog.md` if a new engine module appears.
- [ ] 4.3 Spec delta on `ts-engine` if the runner's contract changes.
