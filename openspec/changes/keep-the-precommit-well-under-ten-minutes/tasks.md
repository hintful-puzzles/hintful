## 1. Measure

- [ ] 1.1 A per-file ranking of the suite's time, for the hook's selection and
      for the whole suite, with what ran beside it.
- [ ] 1.2 Whether `hint-quality.test.ts` grew on 2026-10-07, measured before
      and after `07ff51a3`.

## 2. The per-commit gate

- [ ] 2.1 Which heavy tests are not extremely cost-effective, each with what
      it has caught and the cheaper test that would catch the same.
- [ ] 2.2 Those run in CI and ad hoc, and the session that touches related
      code is told which to run.
- [ ] 2.3 The per-commit gate measured again: well under ten minutes.

## 3. The engine and its specification

- [ ] 3.1 `ts-engine`'s spec split by subject.
- [ ] 3.2 What `midend.ts` splits into, and which tests get cheaper for it.
