## 1. Measure

- [x] 1.1 A per-file ranking of the suite's time, for the hook's selection and
      for the whole suite, with what ran beside it. In `design.md` § "Where the
      time was". The whole suite is the hook's dearest selection, the one a
      commit to the midend or to every game takes, so it is the one ranked.
- [x] 1.2 Whether `hint-quality.test.ts` grew on 2026-10-07, measured before
      and after `07ff51a3`. It did not: the commit changed eight lines of it
      and no code it runs, which settles it without a timing.

## 2. The per-commit gate

- [x] 2.1 Which heavy tests are not extremely cost-effective, each with what
      it has caught and the cheaper test that would catch the same. `design.md`
      § "Decision 2".
- [x] 2.2 Those run in CI and ad hoc, and the session that touches related
      code is told which to run. `perCommit` in `slow.ts`;
      `docs/games/testing.md` § "One board of each kind per commit"; the hook
      says when the last CI run failed.
- [x] 2.3 The per-commit gate measured again: well under ten minutes.
      `design.md` § "The result".

## 3. The engine and its specification

- [x] 3.1 `ts-engine`'s spec split by subject. Ten capabilities, moved line for
      line.
- [x] 3.2 What `midend.ts` splits into, and which tests get cheaper for it.
      None would; it is not split. `design.md` § "Decision 4".

## 4. What the measurement turned up

- [x] 4.1 One dealer for the cross-game sweeps (`testing/dealt.ts`), with its
      own tests.
- [x] 4.2 The four tests the new boards turned red, and the two listings the
      wide walk stopped hearing: each answered in `design.md` § "Decision 1".
- [x] 4.3 A planted em-dash in a Towers sentence fails the hook's narrowed
      `hint-quality` run, on two cases.
