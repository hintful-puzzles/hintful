## 1. Census

- [ ] 1.1 Re-run the count. For each regex scan, record what it asks and
      whether a declaration could answer it.

## 2. Convert

- [ ] 2.1 One shared, cached parse of the game sources; measure its cost
      against the regex reads it replaces.
- [ ] 2.2 Replace each scan a declaration can answer; convert the rest to
      the syntax tree. Plant the defect each scan exists for and see it fail.

## 3. Finish

- [ ] 3.1 `docs/method.md` and `docs/testing.md` say how a scan reads source.
      Commit, push, archive.
