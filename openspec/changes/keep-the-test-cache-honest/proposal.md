# keep-the-test-cache-honest

**Status: filed on the owner's word (2026-10-31)**, a follow-up of
`split-adjacent-from-unequal`.

## Why

Vitest caches each transformed test in `node_modules/.vitest-cache`, keyed on
the file's own text, and a test's `import.meta.glob` is expanded in that
transform. A guard whose file did not change keeps the file list its glob
matched when it was cached. Adding Adjacent failed `hint-mark.test.ts`
locally, reporting no renderer for a game whose `render.ts` a fresh test
found; clearing the cache turned it green. CI starts empty, so only local
runs are wrong, and those are the commit and push hooks: a new file can pass
or fail them for a reason that is not true.

`docs/testing.md` § "A guard that only reads source" tells a session to clear
the cache after adding a file. A rule a session must remember is one it will
forget.

## What Changes

- Find what turns the module cache on (nothing in `vitest.config.ts` names
  it as of 2026-10-31, on vitest 5.0.5), and measure what each fix costs a
  run.
- Make a stale glob impossible: invalidate a cached test when the set of
  files its glob would match changes, or keep the cache off for tests that
  glob, whichever the measurement favors.
- Retire the paragraph in `testing.md` that asks a session to remember it.

## Acceptance

A new file under `src/games/` is seen by every globbing guard on the next
local run with no manual step, shown by planting one.
