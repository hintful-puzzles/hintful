# Tasks

- [x] Add `src/engine/testing/drive-midend.ts` (`driveMidend`, `observeMidend`, typed `last`) with its own test.
- [x] Move every test that records midend notifications onto it, and delete all-no-op `setCallbacks` calls.
- [x] Verify by shape: per-file test and `expect(` counts unchanged; same vitest total before and after.
- [x] Prove the migrated tests read through the helper: a planted `last()` defect goes red.
- [x] Catalog it in `docs/games/engine-catalog.md` and add `docs/games/testing.md` § "Observing a midend".
