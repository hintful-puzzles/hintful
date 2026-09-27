# scope-engine-commits-by-reach

The next step after `measure-the-suites-per-commit-cost`, which narrowed the
cross-game sweeps for a commit confined to game directories.

## Why

That narrowing reaches few commits. Classifying the last 300 commits by the
paths they touch (2026-09-27, `git log --name-only`):

| paths | commits |
|---|---|
| documentation only (already skips vitest) | 127 |
| game directories only (now narrowed) | 23 |
| game directories plus test files outside them | 22 |
| a non-test `src/engine/` module | 71 |
| anything else (app shell, scripts, config, help) | 57 |

So 13% of code commits got the narrowing, and the largest group, **41%, touch
the engine and pay the whole suite**: 505 s wall on 2026-09-27 under load.
Many engine modules are not shared by every game: the hint-framework modules
reach only the games that import them.

## What changes

- **The scope is the games whose code reaches what is staged**, not the games
  whose directories hold it. A game directory's own paths scope that game, as
  before; any other staged path scopes every game whose own files' walk
  reaches it.
- **A test file that reaches a staged path itself runs whole**, in a vitest
  invocation of its own, while every other selected file runs narrowed. The
  name filter is one per run, so this is how a changed test, or a guard that
  imports the changed module directly, keeps every case without costing the
  rest of the selection its narrowing. It also answers the 22 "game plus a test
  outside it" commits.
- **One walk, `scripts/checks/reach.ts`**, behind the selection, the scope and
  the source-scan split. It reads the globs of every module it visits. The
  selector's old glob channel read only test files' own globs, and resolved a
  root-anchored pattern outside the repo; every root-anchored glob in the tree
  sat in a helper, so the selector could not see them.
  `select-tests.ts --verify` holds the walk to known couplings in the gate.
- **The structural blockers the walk exposed are split apart**:
  `enrollment.ts`'s engine-source and test-source scanners move to modules of
  their own, and `hint-quality.test.ts`'s em-dash source scan moves to
  `hint-em-dash.test.ts`. Before the split, every hint guard read every engine
  module and every test file through `hint-games.ts`.

## Impact

- build-pipeline: the selection requirement reads helpers' globs and is held to
  known couplings; the narrowing requirement is replaced by one scoped by reach.
- `scripts/gate.sh`, `scripts/checks/select-tests.ts`,
  `scripts/checks/source-scans.ts`, `scripts/checks/reach.ts` (new),
  `src/engine/testing/{enrollment,game-scope}.ts`, the new
  `src/engine/testing/{code-lines,engine-source,test-source}.ts`,
  `src/engine/hint-{quality,em-dash,enrollment}.test.ts`.
- CI and a manual `npm run gate` are unchanged: they never narrow.
