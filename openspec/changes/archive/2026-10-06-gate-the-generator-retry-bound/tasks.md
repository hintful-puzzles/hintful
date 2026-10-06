## 1. Read

- [x] 1.1 Every unconditional loop reachable from a game's `newDesc`, found by
      shape across `src/games/`, and classified: a retry with a guard, a retry
      without, bounded by its own counter, or not a retry. Read by AST on
      2026-10-06 across `src/games/` and `src/engine/`: 122 unconditional loops
      and 58 `do…while`, most of them solver fixpoints. The shape was changed on
      what the read found (proposal, "What the read changed").

## 2. Build

- [x] 2.1 The scan and its ledger, in the gate's fast pass:
      `src/engine/retry-bound.test.ts`, which
      `node scripts/checks/source-scans.ts` lists.
- [x] 2.2 Rect's guard, and whatever else 1.1 finds bare: Mosaic, Palisade,
      Range, Ascent's path loop, and `loopgen.ts`'s tendril passes.
- [x] 2.3 The reject-a-solved-shuffle loops, decided as a class: guarded
      (Fifteen, Flood, Flip, Twiddle). Sixteen has no such loop; its open loop
      is per-move rejection sampling, which is ledgered.

## 3. Close

- [x] 3.1 The scan seen red with a guard removed (Tents' `while (true)` and
      Spokes' `while (!spokesGenerate(…))`, each named by file and line), and
      its vacuity floors.
- [x] 3.2 docs/games/solver-and-generator.md § "Every retry loop is bounded"
      names the scan.
