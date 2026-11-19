## 1. What it tests is what it commits

- [x] 1.1 Before the gate's prefix, refuse a commit whose staged paths differ
      from the working tree, listing them.
- [x] 1.2 See it refuse a planted difference, and pass a clean commit and a
      commit beside unrelated unstaged edits. Seven cases in a throwaway
      repo: edited after staging, a staged deletion still on disk, and a
      move fixed after staging are refused by name; a clean commit, a
      deletion gone from disk, an untracked file and an unrelated unstaged
      edit (named) pass.

## 2. A game's own guards run on its commit

- [x] 2.1 Reproduce d62d12921's commit plan with `select-tests.ts` and say
      why `capability-surface.test.ts` did not refuse it: selected, then
      dropped by `test-cost.ts fit` (`design.md`).
- [x] 2.2 Fix the cause; see a planted capability removal in a game-only
      commit refused by the hook. Solo's `findMistakes` removed, with four
      Solo and Loopy test files staged (94 s, over the ceiling): the hook
      refused on `capability-surface` and `no-solution-load` besides Solo's
      own tests. With the old fit it ran 4 files and neither guard.
- [x] 2.3 Measure a game-only commit's time before and after. The planted
      commit, back to back, load 9 to 17 on 8 cores: before 148 s (4 test
      files), after 229 s (105 files; the added narrow pass was 86 s).

## 3. Record

- [x] 3.1 `docs/testing.md` § "What runs when"; build-pipeline spec delta.
