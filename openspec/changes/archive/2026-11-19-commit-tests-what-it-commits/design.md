## Decisions

**Index against working tree: refuse, do not stash.** Testing the index
exactly would mean `git stash --keep-index` around the gate, which rewrites
the author's working tree and has lost work in other projects when a hook is
interrupted. A refusal costs nothing: before the prefix, list each staged path
that `git diff` (index against working tree) also lists, and each staged
deletion still on disk, and stop. A partial stage made on purpose
(`git add -p`) is refused too. An untracked file is not a difference. An
unstaged edit to a tracked file the commit does not stage is named and not
refused: it may be another session's, and refusing it would block every commit
beside it. The gate still reads it, so a commit that depends on it passes here
and fails in CI; naming it is what the author gets.

**Why `capability-surface` was missed: the cost fit, not the selector.**
Reproduced by checking out d62d12921, `git reset --soft` to its parent, and
running `select-tests.ts` on that index: the plan selects
`capability-surface.test.ts` (narrow, scope dominosa, guess, wordguess,
wordtrail), and so it does `move-judge-games.test.ts`. Narrowed to that scope
the file fails on that tree (`-"findMistakes"`). None of the three candidates
the proposal named was the cause. `test-cost.ts fit commit` charged the
commit's staged test files (142 s) against the 90 s ceiling, so no room was
left, and every other selected file, the 0.02 s snapshot included, was "left
to the push", which since the push stopped running tests by default means left
to CI. The fit kept 11 files of 283.

The fix: the staged files run outside the ceiling, and the ceiling is the
rest's. Replayed on the same plan the fit keeps 257 files, both guards among
them, and leaves the dearest 26 (451 s) to CI. A commit now costs its staged
tests plus at most the ceiling. Selecting by guard kind (a "records something
per game" list) was not needed: the cheapest-first fit already takes a cheap
per-game guard first once it has room.

**The two engine guards.** `move-judge-games` was dropped by the same fit;
`wrong-entry-check` was staged in d62d12921 and ran whole. If
`derive-guard-ledgers` lands first, their tables may be gone; check again then.

## Risks

- Running more per-game work on a game commit lengthens it. Measured on the
  planted Solo and Loopy commit, under load (`tasks.md` 2.3).
