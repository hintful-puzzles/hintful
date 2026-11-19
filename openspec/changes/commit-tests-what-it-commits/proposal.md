## Why

Filed on the owner's word, 2026-11-19, from the review of the Wordguess and
Wordtrail session logs. Two ways a green commit hook said less than it
seemed to:

1. **The hook tests the working tree, not the commit.** During Wordguess's
   last commit (2026-11-19, about 00:20), a test file was moved and its
   imports fixed in the working tree, but the old imports stayed staged. The
   gate passed on the working tree and the commit held the broken file: "The
   commit holds the moved test with its old imports … The gate tests the
   working tree, so it passed regardless." The trap is known to agents only
   from private notes.
2. **A game-only commit can leave a guard about that game to CI.** Commit
   d62d12921 removed Wordguess's `findMistakes`. Its commit hook passed and
   the push ran no test, as designed, and CI's gate went red on `main` on
   `src/capability-surface.test.ts`, whose snapshot records each game's
   capabilities. The agent found it 40 minutes later. In the same arc,
   `move-judge-games` and `wrong-entry-check` refused Wordguess only on the
   next commit that staged an engine file.

The narrowing is deliberate (`scripts/checks/select-tests.ts`; build-pipeline
"A commit runs the per-game work of the games it stages") and keeps a
game's commit to minutes. The question is whether a guard whose subject is
the staged game's own declared surface should be part of that game's work.

## What Changes

- The commit hook refuses, with a clear message, when a file in the commit
  differs between the index and the working tree, so what it tested is what
  it commits. (Or tests the index itself; see `design.md`.)
- A cross-game guard that records something per game (a snapshot keyed by
  game, a per-game case) runs that game's part on a commit that stages the
  game. Reproduce d62d12921's commit plan first to see why
  `capability-surface` was left out, and fix the cause rather than adding a
  file to a list.

## Impact

`.husky/pre-commit`, `scripts/gate.sh`, `scripts/checks/select-tests.ts`
and `reach.ts`, possibly `src/capability-surface.test.ts`'s shape,
`docs/testing.md` § "What runs when".
