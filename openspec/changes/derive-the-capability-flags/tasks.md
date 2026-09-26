# derive-the-capability-flags — tasks

- [x] 1.1 Re-ran the census before editing (2026-09-26, a throwaway vitest
      file over `registeredGameIds()`): 57 games, none whose flag disagrees
      with its method.
- [x] 1.2 `getStaticProperties` derives `canSolve` and `wantsStatusbar` from
      `solve` and `statusbarText`; `solve()`, `formatAsText()` and
      `emitStatusBar` test the method alone. `Game` loses the three members.
- [x] 1.3 184 declarations removed by script from 62 files, verified by shape:
      0 lines added, every removed line one of the three declarations. The
      three app-side `PuzzleStaticAttributes` fixtures keep theirs, because
      the app contract keeps the names.
- [x] 1.4 A spread `{ ...fakeGame, canSolve: false }` in `midend.test.ts`
      compiled after the member went (it is cast) and no longer disabled
      Solve; it now removes `solve`. The game tests that read the flags assert
      the methods instead. New midend test for both polarities of the
      derivation, seen red with `canSolve: true` planted.
- [x] 1.5 Loopy's `textFormat` is the one method that may return nothing, and
      the derivation keeps that: `formatAsText()` still passes the `null`
      through.
- [x] 1.6 Spec deltas: an `ADDED` ts-engine requirement for the derivation,
      and 39 `MODIFIED` blocks across 37 specs, generated from a clause table.
      Each clause matched exactly once, and each block, whitespace-folded, is
      the live block with only its listed clauses replaced. The population
      equals `git grep -lw` over `openspec/specs`, and every heading was
      checked with `rg -F -x`.
- [x] 1.7 `docs/games/mechanics.md` § "Capability flags" rewritten for derived
      flags; its `needsRightButton` row (a member deleted earlier, still
      documented) removed. `scripts/new-game-port.sh` stopped scaffolding the
      three flags and the `isTimed` its predecessor change left behind.
