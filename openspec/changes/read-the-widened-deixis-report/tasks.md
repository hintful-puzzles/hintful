# read-the-widened-deixis-report — tasks

## 1. Read the report

- [ ] 1.1 Regenerate it first — `npx vitest run -c
      scripts/checks/diff.vitest.config.mts hint-deixis` — so the read is of the
      tree as it stands rather than of a committed snapshot.
- [ ] 1.2 Read every row, grouped by game, against the one question: **are the
      two marks the same kind of thing?** The four false-positive classes are in
      the file's header; a row that fits one of them is a tie a lexical rule
      cannot see, not a defect.
- [ ] 1.3 Start with Light Up's *"The ringed square is still dark and only this
      square can still light it"* — the one row in the sample where both marks
      are squares. Decide whether *"can still light it"* is a tie `RELATIONAL`
      is short of, or whether the sentence is bare.

## 2. Fix what is real, where the judgment lives

- [ ] 2.1 A genuine bare deictic is fixed in the game's own `hint-text.ts` and
      pinned in the game's own hint test, next to the vocabulary that can judge
      it — `clusters-hint.test.ts`, `bricks-hint.test.ts`, `range-hint.test.ts`
      and `lightup-hint.test.ts` are the four the previous read produced.
- [ ] 2.2 Owner-endorsed wording is not rewritten to satisfy a lexical filter.
      Where a sentence's shape was settled by the owner, the record is in the
      game's `hint-text.ts` doc comment; say so and leave it.

## 3. Close out

- [ ] 3.1 Record the outcome in `scripts/checks/hint-deixis.test.ts`'s header
      the way the 230-row read's is recorded: the figure, and what reading it
      found. Replace the "sampled, not read" sentence and this change's
      citation.
- [ ] 3.2 Commit the regenerated `metrics/hint-deixis.md`.
