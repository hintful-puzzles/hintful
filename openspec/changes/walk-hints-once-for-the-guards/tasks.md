## 1. One walk

- [ ] 1.1 Read each `src/engine/hint-*.test.ts` and `solve-finishes.test.ts`;
      list each walk's population, boards, limit and per-step check.
- [ ] 1.2 Write the shared walk with a visitor; move the walks onto it one
      by one, each keeping its limit. Plant the defect each guard exists for
      once after the move and see it fail.

## 2. One population path

- [ ] 2.1 Move the guards reading `registeredGameIds()` directly onto
      `enrollment.ts`, or record why one needs another population.

## 3. Per-game tests that repeat a guard

- [ ] 3.1 For hint-to-solved, save round-trip and params round-trip, list
      the per-game tests that repeat the guard's case; remove each whose
      case the guard covers at the same strength.
- [ ] 3.2 Update the skeletons' test files so a stamp no longer copies them.
- [ ] 3.3 `docs/testing.md`: the walk, and the one population path.
- [ ] 3.4 Run `npm run test:hint-sweeps`; commit, push, archive.
