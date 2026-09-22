# fail-fast-the-source-scan-guards — tasks

**Nothing here is started.**

## 1. Measure before splitting

- [ ] 1.1 Classify every test file outside `src/games/` by what it does when
      run, not by grep: time each alone on an idle machine (record load, free
      memory and swap), and record whether it generates a board. The
      proposal's list of eleven is the hypothesis.
- [ ] 1.2 Measure the cost of one extra `vitest run` over the cheap set,
      startup included. If it is not clearly under the time a late failure
      costs on average, stop here and record why.
- [ ] 1.3 Measure the `builtGames()` guards the same way, and decide whether
      they make a second prefix stage.

## 2. Split, derived

- [ ] 2.1 Derive the prefix set from a property of each file that a guard can
      check (§1.1's answer), never from a hand-kept list.
- [ ] 2.2 Exclude the prefix set from the main `vitest run` in the gate *and*
      in the hook's test selection (`scripts/checks/select-tests.mjs`), so
      nothing runs twice and nothing runs zero times.
- [ ] 2.3 Add the coverage guard: prefix set plus main set is every test file,
      each exactly once. Watch it fail by moving a file out of both.
- [ ] 2.4 CI runs the same split, so the prefix is never a place a test can
      hide from the branch's backstop.

## 3. Prove it

- [ ] 3.1 Plant a failure in one prefix guard (for example, revert a palette
      reason) and time the gate to its failure, before and after.
- [ ] 3.2 Confirm a full gate still runs every test once (vitest's own counts,
      compared across the split).

## 4. Record

- [ ] 4.1 `AGENTS.md` § "Git": the step list gains the prefix pass, with its
      reason.
- [ ] 4.2 The `build-pipeline` spec delta.
- [ ] 4.3 `docs/games/testing.md` (and `docs/test-strength.md` if the timings
      belong there): where a new source-scan guard goes, and why it runs early.
