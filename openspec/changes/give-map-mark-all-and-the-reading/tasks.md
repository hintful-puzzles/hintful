# give-map-mark-all-and-the-reading — tasks

**Nothing here is started.** Read the proposal, then `docs/games/hints.md`
§ "Two readings of an unmarked cell" and § "A graph, not a grid (Map)".

## 1. The press

- [ ] 1.1 Adaptive Mark-all in Map's `interpretMove` (fill, then clean against
      neighbors, then no-op), `canMarkAll: true`, `M`.
- [ ] 1.2 `mark-all.test.ts` passes for Map; a plant that resets a narrowed
      region's dots goes red.

## 2. The reading

- [ ] 2.1 `candidateReading` in `MapUi` (default implicit, reason stated) and
      `candidateReadingPref` in its prefs.
- [ ] 2.2 Map's plan: under populate, fill + clean as one journey, then as now.
- [ ] 2.3 `candidate-reading.test.ts`: Map's setup-move and premise checks ask
      Map's shapes, each proved to fail on a plant.

## 3. Finish

- [ ] 3.1 Help (Map's page, `help/features.md`), spec delta for Map.
- [ ] 3.2 Run the app, both readings, both schemes.
