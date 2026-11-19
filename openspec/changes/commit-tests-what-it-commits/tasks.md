## 1. What it tests is what it commits

- [ ] 1.1 Before the gate's prefix, refuse a commit whose staged paths differ
      from the working tree, listing them.
- [ ] 1.2 See it refuse a planted difference, and pass a clean commit and a
      commit beside unrelated unstaged edits.

## 2. A game's own guards run on its commit

- [ ] 2.1 Reproduce d62d12921's commit plan with `select-tests.ts` and say
      why `capability-surface.test.ts` did not refuse it.
- [ ] 2.2 Fix the cause; see a planted capability removal in a game-only
      commit refused by the hook.
- [ ] 2.3 Measure a game-only commit's time before and after.

## 3. Record

- [ ] 3.1 `docs/testing.md` § "What runs when"; build-pipeline spec delta.
