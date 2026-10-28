# Tasks

## 1. Measure

- [x] 1.1 Find out how vitest marks an entry obsolete and why a skipped test stops it, against its documentation and version
  - vitest 4.1.11 (and 4.1.12): `SnapshotState.markSnapshotsAsCheckedForTest`
    spares a skipped test's entries by slicing the test's name length off each
    key and testing the rest for `/ \d+$| > /`, without checking that the key
    starts with that name. Nearly every key ends in ` 1`, so one skipped test
    marked almost every unchecked key in its file checked. 5.0.5 adds the
    `startsWith` check. The scan test was not the cause as such; any skipped
    or name-filtered test was.
  - Vitest's default local mode (`new`) only lists obsolete entries; `none`,
    which CI gets from `CI=true`, fails the file.
- [x] 1.2 Count the orphans in the tree with that instrument, with the plant (Seismic's old entry, from git history) found
  - Plant: `seismic-hint.test.ts.snap` at `980eedda^`; 5.0.5 names both of its
    old entries.
  - Whole suite on 5.0.5 (2026-10-28): 500 files green, 5 obsolete entries, in
    map-hint, rect-hint, solo, group-render-scenario and twiddle-hint. Each
    title checked absent from its test file (group's was renamed "shaded" to
    "stroked").

## 2. Build

- [x] 2.1 The fix: vitest's own pruning unblinded, or a gate check; seen to fail on a planted orphan
  - vitest upgraded to 5.0.5; the gate runs every vitest pass with
    `--update=none`. The plant fails under the hook's narrowed invocation; a
    clean file passes narrowed to its own game and to another.
- [x] 2.2 Remove the orphans it finds
  - `vitest run --update=all` on the five files: pure deletions.

## 3. Finish

- [x] 3.1 `docs/testing.md`; the gate, green
