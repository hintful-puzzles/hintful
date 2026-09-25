# fail-fast-the-source-scan-guards — tasks

Measured 2026-09-25 on the development machine, which was **not idle**: load
average 4–12 across the session, swap 17.6–18.0 GB used of 18.4 GB. Every
figure below is an upper bound. Ratios between runs taken minutes apart are
the part to trust.

## 1. Measure before splitting

- [x] 1.1 Classify every test file outside `src/games/` by what it does.
      Classified by derivation rather than by grep: `scripts/checks/source-scans.ts`
      takes a file with a `?raw` glob, no glob that imports code, and an import
      closure that reaches no `src/games/` module. **14 files** qualify.
      Against the proposal's hypothesis of eleven, `hint-enrollment` is out
      (its helper `testing/hint-games.ts` imports `games/index.ts`), and
      `asset-integrity`, `color-scheme-default`, `dialog-dismissal`,
      `no-duplicate-module-mocks` are in. `project-identity` is out, correctly.
      The chain is `about-dialog` → `command-link` → `screen` →
      `settings-dialog` → `puzzle.ts` → `worker.ts` → `games/index.ts`.
      Timed alone per file (vitest's JSON reporter): 0.09 ms
      (`no-duplicate-module-mocks`) to 104 ms (`module-layering`); 281 ms of
      test bodies in all.
      Two instrument faults were found and fixed before the count was trusted:
      a regex for the glob call matched prose in doc comments and dropped
      `test-selection` (now read from the syntax tree), and an extensionless
      import (`"../components/command-link"`) resolved to nothing (now resolved
      as the bundler does).
- [x] 1.2 The cost of the extra pass, startup included: **3.5 s wall** for all
      14 files (load 8), plus **2.6 s** for the partition check (three
      `vitest list --filesOnly` calls). About 6 s serial, against a late failure
      that cost about eight minutes on 2026-09-22. Kept.
- [x] 1.3 The board-building guards: **8.8 s wall** for nine
      (`capability-surface`, `mistake-overlay-coverage`, `contract-surface`,
      `emittable-keys`, `cursor-vocabulary`, `completion-vocabulary`,
      `hint-enrollment`, `help-coverage`, `project-identity`; slowest
      `cursor-vocabulary` at 2.9 s, load ~7). Cheap, but **declined as a second
      stage**. No property of the file separates them from `hint-quality`,
      `hint-resume` or `difficulty-contract`, which import the same registry and
      helpers and cost minutes. So the only way to form the stage is a
      hand-kept roster, and `AGENTS.md` § "Convention over configuration"
      refuses manifests. Reopen if a derivable property turns up; the lead is
      filed in `measure-the-suites-per-commit-cost`.

## 2. Split, derived

- [x] 2.1 Membership is `sourceScanTests()` in `scripts/checks/source-scans.ts`,
      read by `vitest.config.ts` when `GATE_TEST_PASS` is `scan` or `main`.
      Unset, as for `npm run test:run`, `test:slow`, Stryker and the probe, the
      suite is one run exactly as before.
- [x] 2.2 One list is the scan pass's `include` and the main pass's `exclude`.
      The hook's selection needed no change: `scripts/gate.sh` passes the same
      file filters to both passes, and a filter outside a pass's include matches
      nothing there.
- [x] 2.3 The coverage guard is `node scripts/checks/source-scans.ts --verify`,
      in the gate ahead of the scan pass. It asks vitest what each pass and an
      unsplit run would run. Watched fail twice: the main pass also excluding
      `help-coverage` ("runs in 0 passes"), and the main pass not excluding the
      scans (14 files "run in 2 passes").
- [x] 2.4 CI runs `npm run gate`, which is the same `scripts/gate.sh`; the split
      is identical there with no workflow change.

## 3. Prove it

- [x] 3.1 Planted a palette departure without a reason (`bricks` cursor set to
      `ERROR`). The gate failed in the scan pass **20 s** after starting (load
      11), and neither the main pass nor `vite build` started. The first plant
      was caught earlier still, by tsgo, because it left `CURSOR` unused.
- [x] 3.2 Every test runs once. The file partition is what `--verify` checks.
      At test level, `vitest list --json` collected **10,004** tests unsplit,
      against **1,497** in the scan pass plus **8,507** in the main pass. Every
      `file::name` key occurs the same number of times in both, zero differing.

## 4. Record

- [x] 4.1 `AGENTS.md` § "Git": the step list gains the scan pass and the
      partition check.
- [x] 4.2 The `build-pipeline` delta: "The gate runs the source-scan tests as a
      pass ahead of the rest of the suite".
- [x] 4.3 `docs/games/testing.md`: where a new source-scan guard goes, and what
      keeps it in the fast pass. The timings stay here rather than in
      `docs/test-strength.md`, which measures strength, not cost.
