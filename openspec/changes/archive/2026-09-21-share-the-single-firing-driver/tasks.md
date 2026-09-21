# share-the-single-firing-driver — tasks

## 1. Read before designing

- [x] 1.1 Re-read the three drivers (Tracks, Bridges, Magnets) and confirm the
      proposal's description of each still holds; it is dated 2026-09-21.
- [x] 1.2 Take the population by reference, not by the three names above: every
      call of `runDeductionFixpoint` whose `settled` is about a *firing* rather
      than about the board (`npm run refs -- src/engine/deduction-fixpoint.ts
      runDeductionFixpoint`, then read each `settled`). Exactly the three
      (design.md § "The population").
- [x] 1.3 Measure Bridges' plans (steps, hidden count) on a fixed corpus before
      changing anything, so the move to `showable` can be compared.

## 2. The driver

- [x] 2.1 Settle the shape: an option on `runDeductionFixpoint` or a function
      beside it. Record why in `design.md` (D1: a function beside it, sharing
      one private pass).
- [x] 2.2 Decide the snapshot/diff question (proposal item 2), and record it
      either way (D3: not done, one adopter).
- [x] 2.3 Tier-1 tests for the driver, including a contradiction and an
      exhausted ladder; prove each fails against a planted defect (six plants:
      non-sticky contradiction, per-call tally, a skipped firing, ignored
      `settled`, no tally, ignored tier cap; each turned a test red).

## 3. Move the adopters

- [x] 3.1 Magnets, Tracks, Bridges, with every hint test passing unedited. One
      commit rather than three (design.md § "Commits").
- [x] 3.2 Bridges' max-cap firings hidden through `showable`; compared against
      1.3: shown 739 → 739, hidden 749 → 767.

## 4. Close out

- [x] 4.1 `docs/games/hints.md` § "Recording the deduction": replace the
      hand-built Tracks recipe with the driver.
- [x] 4.2 `docs/games/engine-catalog.md`: `singleFirings` under
      `deduction-fixpoint.ts` (no new module).
- [x] 4.3 Spec delta on `ts-engine`: an ADDED requirement for the driver.
- [x] 4.4 File what the census found: `bridges-hint-cites-an-unwritable-cap`.
