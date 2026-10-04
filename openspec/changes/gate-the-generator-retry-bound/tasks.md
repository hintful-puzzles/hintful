## 1. Read

- [ ] 1.1 Every unconditional loop reachable from a game's `newDesc`, found by
      shape across `src/games/`, and classified: a retry with a guard, a retry
      without, bounded by its own counter, or not a retry.

## 2. Build

- [ ] 2.1 The scan and its ledger, in the gate's fast pass
      (`scripts/checks/source-scans.ts` decides where it runs).
- [ ] 2.2 Rect's guard, and whatever else 1.1 finds bare.
- [ ] 2.3 The reject-a-solved-shuffle loops, decided as a class.

## 3. Close

- [ ] 3.1 The scan seen red with a guard removed, and its vacuity count.
- [ ] 3.2 docs/games/solver-and-generator.md § "Every retry loop is bounded"
      names the scan.
