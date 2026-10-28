# Proposal

## Why

The owner (2026-10-28): "a definite yes on that orphan issue".

A snapshot entry whose test was renamed or deleted stays in its `.snap` file
for good. Vitest prunes obsolete entries under `-u` only when every test in
the file ran. Every file that calls `describeHintPins`
(`src/engine/testing/hint-positions.ts`) has a scan test that is skipped
unless `HINT_SCAN` is set (`it.skipIf(SCANNING)` and its counterpart), so
vitest never prunes those files and never reports their orphans as obsolete.

Seen (2026-10-28, `point-a-cell-reference-at-its-cell`): Seismic's
`seismic-hint.test.ts.snap` held "rings each struck cell, hatches the starved
area, …", a frame from a test renamed before that session, about 2,060
lines. A second orphan joined it when the test was renamed again. Deleting
the file and re-running wrote it back with the live entries only.

How many orphans the tree holds is not known. A text census (each key's
last title segment searched for in its test file) left 159 of 329 keys
unmatched on 2026-10-28, but nearly all of those are titles a template or a
helper builds ("says, at each pin", one `params-stability` key per game). It
measures the titles, not the orphans. The instrument is vitest's own count of
obsolete snapshots, once nothing blinds it.

## What Changes

- Measure first: how vitest decides an entry is obsolete, and whether a run
  can report obsolete entries in a file that has a skipped test. Count the
  orphans in the tree by that instrument, then remove them.
- A check that fails the gate on an orphaned snapshot entry, seen to fail on
  a planted one: a renamed test in a `describeHintPins` file. Where it runs
  is decided by its cost (`docs/testing.md` § "What runs when").
- If the skipped scan test is what blinds vitest, consider making the scan
  not a skipped test at all (a separate entry point, say), so that vitest's
  own pruning works again and no new check is needed.

## Impact

`src/engine/testing/hint-positions.ts`, the gate (`scripts/gate.sh`) or the
vitest config, `docs/testing.md`, and the orphaned `.snap` entries.
