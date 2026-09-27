# recover-a-worker-that-never-starts — tasks

- [x] 1. Diagnose: deploy timing against the screenshots; the "Type…" chip is
      the not-loaded placeholder; no listener on the worker's `error`.
- [x] 2. `unlessWorkerFailsToStart` in `Puzzle.create`; `StaleBuildError`
      into the shared reload-once recovery.
- [x] 3. Toast when a remembered type is rejected.
- [x] 4. Tests for both halves; each planted red (the missing race hangs, and
      is caught by the test timeout).
- [x] 5. Chromium: the event a missing module worker fires; a 404'd worker
      end to end; the toast; a normal load.
